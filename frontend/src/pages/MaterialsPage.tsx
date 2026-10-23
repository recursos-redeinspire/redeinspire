import { useState, useEffect, useCallback, useRef } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import {
  Folder, NavArrowRight, Home, RefreshDouble, Xmark, ArrowLeft, Search, GraphUp,
  Page, MediaVideo, Headset, MediaImage, Table, Presentation,
  EmptyPage, Download, Archive, Play, Plus, Link as LinkIcon
} from 'iconoir-react'
import type { ComponentType } from 'react'

// Gera uma capa visual bonita para pastas sem thumbnail
function generateCover(name: string): string {
  const gradients = [
    ['#6b7280','#4b5563'], ['#64748b','#475569'], ['#78716c','#57534e'],
    ['#71717a','#52525b'], ['#737373','#525252'], ['#6b7280','#374151'],
    ['#94a3b8','#64748b'], ['#a1a1aa','#71717a'], ['#9ca3af','#6b7280'],
    ['#8b9aab','#5f7085'], ['#7c8594','#5a6370'], ['#8f9baa','#647080'],
  ]
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const [c1, c2] = gradients[hash % gradients.length]
  const displayName = name.length > 24 ? name.substring(0, 24) + '…' : name
  const lines = displayName.length > 14 ? [displayName.substring(0, 14), displayName.substring(14)] : [displayName]
  const textY = lines.length > 1 ? 85 : 95
  const textSvg = lines.map((line, i) =>
    `<text x="160" y="${textY + i * 22}" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="15" font-weight="600" fill="white" opacity="0.85">${line.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text>`
  ).join('')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">
    <defs><linearGradient id="g${hash}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs>
    <rect width="320" height="180" fill="url(#g${hash})"/>
    <circle cx="270" cy="25" r="50" fill="white" opacity="0.03"/>
    <circle cx="40" cy="155" r="35" fill="white" opacity="0.03"/>
    ${textSvg}
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const FILE_ICONS: Record<string, { icon: ComponentType<any>; color: string; bg: string }> = {
  video: { icon: MediaVideo, color: 'text-blue-600', bg: 'bg-blue-50' },
  audio: { icon: Headset, color: 'text-blue-600', bg: 'bg-blue-50' },
  pdf: { icon: Page, color: 'text-slate-600', bg: 'bg-slate-100' },
  document: { icon: Page, color: 'text-blue-600', bg: 'bg-blue-50' },
  presentation: { icon: Presentation, color: 'text-slate-600', bg: 'bg-slate-100' },
  spreadsheet: { icon: Table, color: 'text-slate-600', bg: 'bg-slate-100' },
  image: { icon: MediaImage, color: 'text-blue-600', bg: 'bg-blue-50' },
  archive: { icon: Archive, color: 'text-slate-600', bg: 'bg-slate-100' },
  other: { icon: EmptyPage, color: 'text-slate-500', bg: 'bg-slate-50' },
}

function formatSize(bytes: number) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(0) + ' KB'
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB'
  return (bytes / 1073741824).toFixed(1) + ' GB'
}

function FileIcon({ fileType, size = 22 }: { fileType: string; size?: number }) {
  const c = FILE_ICONS[fileType] || FILE_ICONS.other
  const Icon = c.icon
  return <Icon width={size} height={size} strokeWidth={1.5} className={c.color} />
}

// ---- Similarity helpers ----
const STOP_WORDS = new Set(['de','do','da','dos','das','o','a','os','as','e','em','um','uma','para','com','por','que','no','na','nos','nas','ao','aos','à','às','se','ou','mas','como','mais','este','essa','isso','1','2','3','4','5','6','7','8','9','0','-'])

function tokenize(text: string): string[] {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
}

function similarity(a: string, b: string): number {
  const ta = new Set(tokenize(a))
  const tb = new Set(tokenize(b))
  if (ta.size === 0 || tb.size === 0) return 0
  let common = 0
  ta.forEach(w => { if (tb.has(w)) common++ })
  return common / Math.sqrt(ta.size * tb.size) // Dice-like coefficient
}

function getSuggestedFolders(currentPath: string, currentName: string, allFolders: any[]): any[] {
  const MAX = 5
  const parentPath = currentPath.includes('/') ? currentPath.slice(0, currentPath.lastIndexOf('/')) : ''

  // Candidate folders (exclude current folder and de-duplicate by path)
  const seen = new Set<string>([currentPath])
  const candidates = allFolders.filter(f => {
    const p = f.path || f.pathLower || ''
    if (!p || f.tag !== 'folder' || !f.name) return false
    if (seen.has(p)) return false
    seen.add(p)
    return true
  })

  // 1) Score by title similarity
  const scored = candidates
    .map(f => ({ ...f, score: similarity(currentName, f.name) }))
    .sort((a, b) => b.score - a.score)

  const result: any[] = []
  const used = new Set<string>()
  const push = (f: any) => {
    const p = f.path || f.pathLower || ''
    if (p && !used.has(p) && result.length < MAX) { used.add(p); result.push(f) }
  }

  // Primary: folders with real title similarity
  scored.filter(f => f.score > 0.1).forEach(push)

  // Fallback A: sibling folders (same parent) — likely related
  if (result.length < MAX) {
    candidates
      .filter(f => {
        const p = f.path || f.pathLower || ''
        return parentPath && p.includes('/') && p.slice(0, p.lastIndexOf('/')) === parentPath
      })
      .forEach(push)
  }

  // Fallback B: any remaining known folders, best-scored first
  if (result.length < MAX) {
    scored.forEach(push)
  }

  return result
}

// ---- Material Recommendations Section ----
function MaterialRecommendationsSection({ folderPath, folderName, allFolders, folderThumbs, onNavigate }: {
  folderPath: string
  folderName: string
  allFolders: any[]
  folderThumbs: Record<string, string>
  onNavigate: (path: string) => void
}) {
  const { getVideoRecs, addVideoRec, deleteVideoRec } = useData()
  const { user } = useAuth()
  const [items, setItems] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [confirmUrl, setConfirmUrl] = useState('')
  const isAdmin = user?.role === 'admin'

  // Auto-suggested folders by title similarity
  const suggestions = getSuggestedFolders(folderPath, folderName, allFolders)

  useEffect(() => {
    if (!folderPath) return
    const encodedPath = folderPath.replace(/\//g, '__')
    getVideoRecs(encodedPath).then(data => setItems(data.items || [])).catch(() => {})
  }, [folderPath, getVideoRecs])

  const handleAdd = async (data: any) => {
    try {
      const encodedPath = folderPath.replace(/\//g, '__')
      const newItem = await addVideoRec(encodedPath, data)
      if (newItem?.id) setItems(prev => [...prev, newItem])
      setShowAdd(false)
    } catch {
      alert('Erro ao salvar. Tente novamente.')
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Remover esta indicação?')) return
    const encodedPath = folderPath.replace(/\//g, '__')
    await deleteVideoRec(encodedPath, itemId)
    setItems(prev => prev.filter(i => i.id !== itemId))
  }

  const handleClick = (item: any) => {
    if (item.type === 'external') {
      setConfirmUrl(item.url)
    } else if (item.type === 'video') {
      window.location.href = '/catalogo'
    } else if (item.type === 'material') {
      window.location.href = '/materiais'
    }
  }

  const hasManual = items.length > 0
  const hasSuggestions = suggestions.length > 0
  if (!hasManual && !hasSuggestions && !isAdmin) return null

  const getThumb = (path: string, name: string) => {
    const pathLower = path.toLowerCase()
    for (const [key, url] of Object.entries(folderThumbs)) {
      if (key.toLowerCase() === pathLower && url && !url.includes('dropboxusercontent.com')) return url
    }
    // fallback generated cover
    const colors = ['#6b7280','#64748b','#78716c','#71717a','#737373','#6b7280','#94a3b8']
    const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    const c = colors[hash % colors.length]
    const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='113'><rect width='200' height='113' fill='${c}'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='32' font-weight='bold' fill='white'>${initials}</text></svg>`
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
          <Folder width={16} height={16} strokeWidth={1.5} className="text-slate-400" /> Recursos Recomendados
        </h3>
        {isAdmin && (
          <button onClick={() => setShowAdd(true)}
            className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition">
            <Plus width={13} height={13} strokeWidth={1.5} /> Adicionar
          </button>
        )}
      </div>

      {/* Manual items */}
      {hasManual && (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
          {items.map(item => (
            <div key={item.id} className="relative group bg-white border rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer"
              onClick={() => handleClick(item)}>
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : item.type === 'video' && item.videoId ? (
                  <img src={`https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-300">
                    {item.type === 'external' ? <LinkIcon width={26} height={26} strokeWidth={1.5} /> : item.type === 'video' ? <Play width={26} height={26} strokeWidth={1.5} /> : <Folder width={26} height={26} strokeWidth={1.5} />}
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="font-medium text-xs text-gray-900 line-clamp-2 leading-tight">{item.title}</p>
                {item.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>}
                <span className={`inline-flex items-center gap-1 mt-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                  item.type === 'external' ? 'bg-blue-50 text-blue-600' :
                  item.type === 'video' ? 'bg-slate-100 text-slate-600' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {item.type === 'external' ? <><LinkIcon width={11} height={11} strokeWidth={1.5} /> Externo</> : item.type === 'video' ? <><Play width={11} height={11} strokeWidth={1.5} /> Vídeo</> : <><Folder width={11} height={11} strokeWidth={1.5} /> Material</>}
                </span>
              </div>
              {isAdmin && (
                <button onClick={e => { e.stopPropagation(); handleDelete(item.id) }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">
                  <Xmark width={12} height={12} strokeWidth={1.5} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Auto-suggested folders */}
      {hasSuggestions && (
        <div>
          {hasManual && <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Sugestões automáticas</p>}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
            {suggestions.map(folder => {
              const p = folder.path || folder.pathLower || ''
              const thumb = getThumb(p, folder.name)
              return (
                <div key={p} className="relative group bg-white border border-dashed border-gray-200 rounded-lg overflow-hidden hover:shadow-md hover:border-solid transition cursor-pointer"
                  onClick={() => onNavigate(p)}>
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    <img src={thumb} alt={folder.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-2">
                    <p className="font-medium text-xs text-gray-900 line-clamp-2 leading-tight">{folder.name}</p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-50 text-gray-400">
                      <Folder width={11} height={11} strokeWidth={1.5} /> Material
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Admin empty state */}
      {!hasManual && !hasSuggestions && isAdmin && (
        <button onClick={() => setShowAdd(true)}
          className="text-sm text-gray-500 hover:text-gray-900 border border-dashed border-gray-300 rounded-xl px-4 py-3 w-full flex items-center justify-center gap-2 hover:border-gray-400 transition">
          <Plus width={16} height={16} strokeWidth={1.5} /> Adicionar indicação
        </button>
      )}

      {showAdd && <MaterialAddRecommendationModal onClose={() => setShowAdd(false)} onSave={handleAdd} />}
      {confirmUrl && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setConfirmUrl('')}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <p className="text-lg font-semibold text-gray-900 mb-2">Redirecionamento externo</p>
            <p className="text-sm text-gray-600 mb-4">Você será redirecionado para um site externo. Deseja continuar?</p>
            <p className="text-xs text-gray-400 mb-4 truncate">{confirmUrl}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmUrl('')} className="flex-1 border rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={() => { window.open(confirmUrl, '_blank'); setConfirmUrl('') }}
                className="flex-1 bg-gray-900 text-white rounded-lg py-2 text-sm hover:bg-gray-800">Continuar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Add Recommendation Modal (Materials) ----
function MaterialAddRecommendationModal({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => void }) {
  const [type, setType] = useState<'external' | 'video' | 'material'>('external')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [linkedVideoId, setLinkedVideoId] = useState('')
  const [materialPath, setMaterialPath] = useState('')
  const [saving, setSaving] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new window.Image()
    img.onload = () => {
      const size = 200
      canvas.width = size
      canvas.height = size
      ctx?.drawImage(img, 0, 0, size, size)
      setImageUrl(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.src = URL.createObjectURL(file)
  }

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSave({ type, title: title.trim(), description: description.trim(), url, imageUrl, linkedVideoId, materialPath })
    } catch {
      alert('Erro ao salvar indicação. Tente novamente.')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">Adicionar Indicação</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <div className="flex gap-2">
              {[
                { value: 'external', label: 'Link Externo', icon: <LinkIcon width={14} height={14} strokeWidth={1.5} /> },
                { value: 'video', label: 'Vídeo', icon: <Play width={14} height={14} strokeWidth={1.5} /> },
                { value: 'material', label: 'Material', icon: <Folder width={14} height={14} strokeWidth={1.5} /> },
              ].map(opt => (
                <button key={opt.value} onClick={() => setType(opt.value as any)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5 ${type === opt.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300" placeholder="Nome da indicação" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300" placeholder="Breve descrição" />
          </div>
          {type === 'external' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL externa *</label>
              <input type="url" value={url} onChange={e => setUrl(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300" placeholder="https://..." />
            </div>
          )}
          {type === 'video' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID do vídeo do YouTube *</label>
              <input type="text" value={linkedVideoId} onChange={e => setLinkedVideoId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300" placeholder="Ex: dQw4w9WgXcQ" />
              {linkedVideoId && (
                <img src={`https://img.youtube.com/vi/${linkedVideoId}/mqdefault.jpg`} alt="Preview" className="mt-2 w-32 rounded-lg" />
              )}
            </div>
          )}
          {type === 'material' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Caminho da pasta</label>
              <input type="text" value={materialPath} onChange={e => setMaterialPath(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300" placeholder="/Mensagens - Avulsas/2024" />
            </div>
          )}
          {(type === 'external' || type === 'material') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagem (quadrada)</label>
              <input type="file" accept="image/*" onChange={handleImageUpload}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
              {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-lg border" />}
            </div>
          )}
        </div>
        <div className="p-6 border-t flex gap-3">
          <button onClick={onClose} className="flex-1 border rounded-lg py-2.5 text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} disabled={!title.trim() || saving}
            className="flex-1 bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MaterialsPage() {
  const { browseDropbox, getFolderThumbnails, saveFolderThumbnail, getUploadPresignedUrl, getFolderVideos, getAllFolderTags, saveFolderTags, smartSearchDropbox, getTopDownloads, downloadDropbox, getDropboxThumbnail, getDropboxThumbnailBatch, getFolderCover, saveFolderVideos, getFileText } = useData()
  const { user } = useAuth()

  const [path, setPath] = useState('')
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [folderThumbs, setFolderThumbs] = useState<Record<string, string>>({})
  // Fallback covers: folderPath -> blob URL of the first image in the folder (compressed).
  // Used only when there is no admin-defined cover in folderThumbs.
  const [folderCovers, setFolderCovers] = useState<Record<string, string>>({})
  const [folderTagMap, setFolderTagMap] = useState<Record<string, string[]>>({})
  const [folderDescMap, setFolderDescMap] = useState<Record<string, string>>({})
  const [topDownloads, setTopDownloads] = useState<any[]>([])

  // Search
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [_searchKeywords, setSearchKeywords] = useState<string[]>([])
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<any[]>([])
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [autocompleteCache, setAutocompleteCache] = useState<any[]>([])
  const [searchFilter, setSearchFilter] = useState<'pastas' | 'arquivos' | 'pdf' | 'ppt' | 'doc' | 'imagens' | 'videos'>('pastas')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 12
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Admin edit state
  const [editingFolder, setEditingFolder] = useState<any | null>(null)
  const [editDesc, setEditDesc] = useState('')
  const [editTags, setEditTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [folderImages, setFolderImages] = useState<any[]>([])
  const [loadingImages, setLoadingImages] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [editThumbUrl, setEditThumbUrl] = useState('')
  const [originalThumbUrl, setOriginalThumbUrl] = useState('')

  // File preview states
  const [selectedFile, setSelectedFile] = useState<any | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  // For images we preview a compressed thumbnail but keep the full-res URL for download.
  const [previewDownloadUrl, setPreviewDownloadUrl] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [_downloading, setDownloading] = useState<string | null>(null)
  const [folderVideos, setFolderVideos] = useState<any[]>([])
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null)
  const [showAddVideo, setShowAddVideo] = useState(false)
  const [newVideoUrl, setNewVideoUrl] = useState('')
  const [newVideoTitle, setNewVideoTitle] = useState('')
  const [folderDescription, setFolderDescription] = useState('')

  const isAdmin = user?.role === 'admin'

  const loadFolder = useCallback(async (p: string) => {
    setLoading(true); setIsSearching(false); setSearchResults([])
    setSelectedFile(null); setPreviewUrl(''); setPreviewDownloadUrl(''); setSelectedVideo(null); setFolderVideos([]); setFolderDescription('')
    setCurrentPage(1)
    try {
      const [result, vidsResult] = await Promise.all([
        browseDropbox(p),
        p ? getFolderVideos(p).catch(() => ({ videos: [] })) : Promise.resolve({ videos: [] })
      ])
      setEntries(result.entries); setPath(p)
      const vids = vidsResult.videos || []
      setFolderVideos(vids)
      if (vids.length > 0) setSelectedVideo(vids[0])

      // Try to extract description from first .doc/.docx
      const fileEntries = (result.entries || []).filter((e: any) => e.tag === 'file')
      const docFile = fileEntries.find((f: any) => {
        const ext = (f.ext || f.name?.split('.').pop() || '').toLowerCase()
        return ext === 'docx' || ext === 'doc'
      })
      if (docFile && p) {
        try {
          const data = await getFileText(docFile.pathLower || docFile.path)
          if (data.text && data.text.length > 20) setFolderDescription(data.text)
        } catch { /* ignore */ }
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [browseDropbox, getFolderVideos, getFileText])

  // Build autocomplete cache from all visible folders (current + visited)
  useEffect(() => {
    if (entries.length > 0) {
      const allItems = entries.map(e => ({ name: e.name, path: e.path || e.pathLower, tag: e.tag, id: e.id }))
      setAutocompleteCache(prev => {
        const existing = new Set(prev.map(p => p.path))
        const newItems = allItems.filter(i => !existing.has(i.path))
        return [...prev, ...newItems]
      })
    }
  }, [entries])

  // Local autocomplete (instant, no API call)
  const handleSearchInput = (value: string) => {
    setSearchQuery(value)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)

    if (!value.trim() || value.length < 2) {
      setAutocompleteSuggestions([])
      setShowAutocomplete(false)
      return
    }

    // Instant local filter
    const query = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const words = query.split(/\s+/).filter(w => w.length >= 2)

    const matches = autocompleteCache
      .filter(item => {
        const name = (item.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        return words.every(w => name.includes(w) || name.split(/[\s\-_]+/).some((nw: string) => nw.startsWith(w)))
      })
      .slice(0, 8)

    if (matches.length > 0) {
      setAutocompleteSuggestions(matches)
      setShowAutocomplete(true)
    } else {
      setShowAutocomplete(false)
    }

    // Debounce: after 500ms, also trigger backend search for more results
    searchTimerRef.current = setTimeout(() => {
      doSearch(value)
    }, 600)
  }

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { loadFolder(path); return }
    setLoading(true); setIsSearching(true)
    try {
      const result = await smartSearchDropbox(q) as any
      const fileResults = result.entries || []
      const folderResults = result.folders || []

      // Also browse inside found folders to get their files (for type filtering)
      const folderFiles: any[] = []
      const foldersToCheck = folderResults.slice(0, 10)
      await Promise.all(foldersToCheck.map(async (folder: any) => {
        try {
          const contents = await browseDropbox(folder.path || folder.pathLower)
          const files = (contents.entries || []).filter((e: any) => e.tag === 'file')
          files.forEach((f: any) => folderFiles.push(f))
        } catch { /* ignore */ }
      }))

      // Merge: direct file results + files from found folders (deduplicate by path)
      const allFiles = [...fileResults]
      const existingPaths = new Set(fileResults.map((f: any) => f.pathLower || f.path))
      for (const f of folderFiles) {
        if (!existingPaths.has(f.pathLower || f.path)) {
          allFiles.push(f)
          existingPaths.add(f.pathLower || f.path)
        }
      }

      setSearchResults(allFiles)
      setSearchKeywords(result.keywords || [])
      setEntries([...folderResults, ...allFiles])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [smartSearchDropbox, browseDropbox, loadFolder, path])

  useEffect(() => { loadFolder('') }, [loadFolder])
  // Load thumbnails from localStorage cache INSTANTLY, then refresh from API in background
  useEffect(() => {
    // 1. Load from cache immediately (instant)
    let cachedThumbs: Record<string, string> = {}
    try {
      const cached = localStorage.getItem('ri_folder_thumbs')
      if (cached) { cachedThumbs = JSON.parse(cached); setFolderThumbs(cachedThumbs) }
    } catch { /* ignore */ }
    // 2. Refresh from API in background — MERGE with cache (never lose data)
    getFolderThumbnails().then(d => {
      const apiThumbs = d.thumbnails || {}
      // Merge: keep cached thumbs + add/update from API
      const merged = { ...cachedThumbs }
      for (const [path, url] of Object.entries(apiThumbs)) {
        if (url && !url.includes('dropboxusercontent.com')) merged[path] = url as string
      }
      setFolderThumbs(merged)
      localStorage.setItem('ri_folder_thumbs', JSON.stringify(merged))
    }).catch(() => {})
  }, [])

  // Fallback covers: for folders in the current view that have NO admin-defined
  // cover, fetch the first image in the folder and use its compressed thumbnail.
  // Runs in the background so it never blocks rendering. Each folder is attempted
  // at most once per session.
  const coverAttempted = useRef<Set<string>>(new Set())
  useEffect(() => {
    const run = async () => {
      const subfolders = entries.filter(e => e.tag === 'folder')
      // Collect folders that need a fallback cover (no admin cover, not yet tried).
      const pending = subfolders.filter(folder => {
        const fpath = folder.path
        if (!fpath) return false
        const hasAdminCover = Object.keys(folderThumbs).some(
          k => k.toLowerCase() === fpath.toLowerCase() && folderThumbs[k] && !folderThumbs[k].includes('dropboxusercontent.com')
        )
        if (hasAdminCover) return false
        if (coverAttempted.current.has(fpath.toLowerCase())) return false
        return true
      })
      if (pending.length === 0) return
      pending.forEach(f => coverAttempted.current.add(f.path.toLowerCase()))

      // 1. Find the first image (cover candidate) in each folder, in parallel.
      const covers = await Promise.all(pending.map(async (folder) => {
        try {
          const { cover } = await getFolderCover(folder.pathLower || folder.path)
          return cover ? { folderPath: folder.path, cover } : null
        } catch { return null }
      }))
      const valid = covers.filter((c): c is { folderPath: string; cover: string } => !!c)
      if (valid.length === 0) return

      // 2. Generate all cover thumbnails in a single batch request.
      try {
        const thumbMap = await getDropboxThumbnailBatch(valid.map(v => v.cover), 'w640h480')
        setFolderCovers(prev => {
          const next = { ...prev }
          for (const v of valid) {
            const url = thumbMap[v.cover]
            if (url) { next[v.folderPath] = url; next[v.folderPath.toLowerCase()] = url }
          }
          return next
        })
      } catch { /* ignore — falls back to generated cover */ }
    }
    run()
  }, [entries, folderThumbs, getFolderCover, getDropboxThumbnailBatch])

  useEffect(() => {
    // Load tags from cache instantly
    try {
      const cachedTags = localStorage.getItem('ri_folder_tags')
      if (cachedTags) {
        const parsed = JSON.parse(cachedTags)
        setFolderTagMap(parsed.tagMap || {})
        setFolderDescMap(parsed.descMap || {})
      }
    } catch { /* ignore */ }
    // Refresh from API in background
    getAllFolderTags().then(d => {
      setFolderTagMap(d.tagMap || {})
      setFolderDescMap((d as any).descMap || {})
      localStorage.setItem('ri_folder_tags', JSON.stringify({ tagMap: d.tagMap, descMap: (d as any).descMap }))
    }).catch(() => {})
    getTopDownloads().then(setTopDownloads).catch(() => {})
    // Pre-load folder names for instant autocomplete
    browseDropbox('').then(root => {
      const rootItems = (root.entries || []).map((e: any) => ({ name: e.name, path: e.path, tag: e.tag, id: e.id }))
      setAutocompleteCache(rootItems)
      // Also load first level subfolders
      const rootFolders = (root.entries || []).filter((e: any) => e.tag === 'folder').slice(0, 10)
      Promise.all(rootFolders.map((f: any) => browseDropbox(f.path).catch(() => ({ entries: [] })))).then(results => {
        const subItems: any[] = []
        results.forEach(r => {
          (r.entries || []).forEach((e: any) => subItems.push({ name: e.name, path: e.path, tag: e.tag, id: e.id }))
        })
        setAutocompleteCache(prev => [...prev, ...subItems])
      })
    }).catch(() => {})
  }, [])

  const folders = entries.filter(e => e.tag === 'folder')

  const breadcrumbs = path ? path.split('/').filter(Boolean).map((part, i, arr) => ({
    name: part, path: '/' + arr.slice(0, i + 1).join('/'),
  })) : []

  const isRoot = !path
  const getThumb = (folderPath: string, name: string) => {
    // 1. Admin-defined cover (exact match)
    const saved = folderThumbs[folderPath]
    if (saved && !saved.includes('dropboxusercontent.com')) return saved
    // 2. Admin-defined cover (case-insensitive match)
    const pathLower = folderPath.toLowerCase()
    for (const [key, url] of Object.entries(folderThumbs)) {
      if (key.toLowerCase() === pathLower && url && !url.includes('dropboxusercontent.com')) return url
    }
    // 3. Fallback cover = first image found in the folder (compressed)
    const fallback = folderCovers[folderPath] || folderCovers[pathLower]
    if (fallback) return fallback
    // 4. Generated gradient cover with the folder name
    return generateCover(name)
  }
  const getTags = (folderPath: string) => folderTagMap[folderPath] || []
  const getDesc = (folderPath: string) => folderDescMap[folderPath] || ''
  const files = entries.filter(e => e.tag === 'file')

  const handlePreview = async (file: any) => {
    setSelectedFile(file); setPreviewUrl(''); setPreviewDownloadUrl(''); setPreviewLoading(true); setSelectedVideo(null)
    try {
      if (file.fileType === 'image') {
        // Show a compressed thumbnail (fast) instead of the full-size original.
        // Still register the "view" so download/view counters keep working, and
        // keep the full-res temporary link for the download button.
        const [thumb, r] = await Promise.all([
          getDropboxThumbnail(file.pathLower, 'w1024h768').catch(() => ''),
          downloadDropbox(file.pathLower, 'view'),
        ])
        setPreviewUrl(thumb || r.url)
        setPreviewDownloadUrl(r.url)
      } else {
        const r = await downloadDropbox(file.pathLower, 'view')
        setPreviewUrl(r.url)
        setPreviewDownloadUrl(r.url)
      }
    }
    catch { setPreviewUrl(''); setPreviewDownloadUrl('') }
    finally { setPreviewLoading(false) }
  }

  const handleDownload = async (file: any) => {
    setDownloading(file.pathLower)
    try { const r = await downloadDropbox(file.pathLower, 'download'); window.open(r.url, '_blank') }
    catch { alert('Erro ao baixar') }
    finally { setDownloading(null) }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recursos</h1>
          <p className="text-sm text-gray-500 mt-1">Recursos para seu ministério</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <Search width={16} height={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={searchQuery}
            onChange={e => handleSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { setShowAutocomplete(false); doSearch(searchQuery) } }}
            onFocus={() => { if (autocompleteSuggestions.length > 0) setShowAutocomplete(true) }}
            onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
            placeholder="Buscar materiais, mensagens, apresentações..."
            className="w-full pl-11 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition" />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setShowAutocomplete(false); if (isSearching) loadFolder(path) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><Xmark width={14} height={14} strokeWidth={1.5} /></button>
          )}
          {/* Autocomplete dropdown */}
          {showAutocomplete && autocompleteSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden">
              {autocompleteSuggestions.map(item => (
                <button key={item.id || item.path} onClick={() => {
                  setShowAutocomplete(false); setSearchQuery('')
                  if (item.tag === 'folder') loadFolder(item.path)
                  else { const folderPath = item.path.substring(0, item.path.lastIndexOf('/')); loadFolder(folderPath) }
                }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-left border-b last:border-b-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.tag === 'folder' ? 'bg-blue-50' : 'bg-gray-100'}`}>
                    {item.tag === 'folder' ? <Folder width={13} height={13} strokeWidth={1.5} className="text-blue-600" /> : <EmptyPage width={13} height={13} strokeWidth={1.5} className="text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{item.name}</p>
                    <p className="text-[9px] text-gray-400 truncate">{item.path}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => { setShowAutocomplete(false); doSearch(searchQuery) }}
          className="bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
          Buscar
        </button>
      </div>

      {/* Search results */}
      {isSearching && !loading && (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <p className="text-sm text-gray-700">
              Pastas com materiais com a palavra "<span className="font-semibold text-gray-900">{searchQuery}</span>"
              <button onClick={() => { setSearchQuery(''); setIsSearching(false); loadFolder(path) }} className="ml-2 text-gray-400 text-xs hover:text-gray-600 inline-flex items-center gap-1"><Xmark width={11} height={11} strokeWidth={1.5} /> Limpar</button>
            </p>
            {/* Filter toggle */}
            <div className="flex flex-wrap gap-1 bg-gray-100 rounded-lg p-0.5">
              {[
                { key: 'pastas', label: 'Pastas' },
                { key: 'arquivos', label: 'Todos' },
                { key: 'pdf', label: 'PDF' },
                { key: 'ppt', label: 'PPT' },
                { key: 'doc', label: 'DOC' },
                { key: 'imagens', label: 'Imagens' },
                { key: 'videos', label: 'Vídeos' },
              ].map(f => (
                <button key={f.key} onClick={() => setSearchFilter(f.key as any)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${searchFilter === f.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Folder results — same visual as home grid */}
          {searchFilter === 'pastas' && (() => {
            // Deduplicate: for files, get their parent folder
            const folderPaths = new Set<string>()
            const resultFolders: any[] = []
            // Direct folder matches
            for (const f of folders) {
              const p = f.path || f.pathLower
              if (p && !folderPaths.has(p)) { folderPaths.add(p); resultFolders.push(f) }
            }
            // File parent folders
            for (const file of searchResults) {
              const folderPath = file.path ? file.path.substring(0, file.path.lastIndexOf('/')) : ''
              const folderName = folderPath.split('/').pop() || ''
              if (folderPath && !folderPaths.has(folderPath)) {
                folderPaths.add(folderPath)
                resultFolders.push({ id: folderPath, name: folderName, path: folderPath, tag: 'folder' })
              }
            }
            return resultFolders.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {resultFolders.map(folder => {
                  const thumb = getThumb(folder.path || folder.pathLower, folder.name)
                  const tags = getTags(folder.path || folder.pathLower)
                  const desc = getDesc(folder.path || folder.pathLower)
                  return (
                    <div key={folder.id} className="group">
                      <button onClick={() => { setIsSearching(false); setSearchQuery(''); loadFolder(folder.path || folder.pathLower) }} className="w-full text-left">
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 mb-2.5">
                          <img src={thumb} alt={folder.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <h3 className="font-semibold text-[13px] text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-700 transition">{folder.name}</h3>
                        {tags.length > 0 && <p className="text-[10px] text-gray-400 mt-0.5">{tags.join(' · ')}</p>}
                        {desc && <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{desc}</p>}
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">Nenhuma pasta encontrada</p>
            )
          })()}

          {/* File results (filtered by type) */}
          {searchFilter !== 'pastas' && (() => {
            const typeFilters: Record<string, string[]> = {
              arquivos: [], // show all
              pdf: ['pdf'],
              ppt: ['ppt', 'pptx', 'presentation'],
              doc: ['doc', 'docx', 'document'],
              imagens: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'image'],
              videos: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'video'],
            }
            const allowedTypes = typeFilters[searchFilter] || []
            const filtered = allowedTypes.length === 0
              ? searchResults
              : searchResults.filter((f: any) => allowedTypes.includes(f.ext) || allowedTypes.includes(f.fileType))

            return filtered.length > 0 ? (
              <div className="space-y-2">
                {filtered.map((file: any) => {
                  const folderPath = file.path ? file.path.substring(0, file.path.lastIndexOf('/')) : ''
                  return (
                    <button key={file.id} onClick={() => { setIsSearching(false); setSearchQuery(''); loadFolder(folderPath) }}
                      className="w-full flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 hover:shadow-sm hover:border-blue-200 transition text-left">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${(FILE_ICONS[file.fileType] || FILE_ICONS.other).bg}`}>
                        <FileIcon fileType={file.fileType} size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{file.folder || folderPath}</p>
                      </div>
                      <span className="text-[9px] uppercase font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{file.ext}</span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">Nenhum arquivo encontrado com esse filtro</p>
            )
          })()}
        </div>
      )}

      {/* Breadcrumb */}
      {!isRoot && !isSearching && (
        <div className="flex items-center gap-1.5 mb-5 text-sm flex-wrap">
          <button onClick={() => { const parts = path.split('/'); parts.pop(); loadFolder(parts.join('/')) }}
            className="text-gray-400 hover:text-gray-700 mr-1 p-1 rounded-lg hover:bg-gray-100 transition"><ArrowLeft width={16} height={16} strokeWidth={1.5} /></button>
          <button onClick={() => loadFolder('')} className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition">
            <Home width={14} height={14} strokeWidth={1.5} /> Recursos
          </button>
          {breadcrumbs.map((bc, i) => (
            <span key={bc.path} className="flex items-center gap-1.5">
              <NavArrowRight width={13} height={13} strokeWidth={1.5} className="text-gray-300" />
              <button onClick={() => loadFolder(bc.path)}
                className={`hover:text-gray-900 transition ${i === breadcrumbs.length - 1 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>{bc.name}</button>
            </span>
          ))}
        </div>
      )}

      {/* ═══ TOP DOWNLOADS — Hero Layout (Opção A) ═══ */}
      {isRoot && !isSearching && topDownloads.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <GraphUp width={18} height={18} strokeWidth={1.5} className="text-slate-400" />
            <h2 className="text-[15px] font-bold text-gray-900">Mais baixados</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Hero - primeiro item grande */}
            {topDownloads[0] && (() => {
              const item = topDownloads[0]
              const thumb = getThumb(item.folderPath, item.folderName || '')
              return (
                <button key={item.folderPath} onClick={() => loadFolder(item.folderPath)}
                  className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer group text-left">
                  <img src={thumb} alt={item.folderName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">#1 Mais baixado</span>
                    <h3 className="text-xl font-bold text-white mt-2">{item.folderName}</h3>
                    {getTags(item.folderPath).length > 0 && (
                      <p className="text-white/60 text-xs mt-1">{getTags(item.folderPath).join(' · ')}</p>
                    )}
                  </div>
                </button>
              )
            })()}
            {/* Grid 2x2 dos outros */}
            <div className="grid grid-cols-2 gap-3">
              {topDownloads.slice(1, 5).map((item, i) => {
                const thumb = getThumb(item.folderPath, item.folderName || '')
                return (
                  <button key={item.folderPath} onClick={() => loadFolder(item.folderPath)}
                    className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group text-left">
                    <img src={thumb} alt={item.folderName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">#{i + 2}</div>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white font-semibold text-[12px] line-clamp-2 leading-snug">{item.folderName}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {loading && <div className="flex justify-center py-20"><RefreshDouble width={32} height={32} strokeWidth={1.5} className="animate-spin text-blue-500" /></div>}

      {/* ═══ FOLDER CARDS — Life.Church style ═══ */}
      {!loading && !isSearching && folders.length > 0 && (() => {
        const totalPages = isRoot ? 1 : Math.ceil(folders.length / ITEMS_PER_PAGE)
        const startIdx = isRoot ? 0 : (currentPage - 1) * ITEMS_PER_PAGE
        const paginatedFolders = isRoot ? folders : folders.slice(startIdx, startIdx + ITEMS_PER_PAGE)
        return (
        <div>
          {isRoot && <h2 className="text-[15px] font-bold text-gray-900 mb-4">Conteúdos disponíveis</h2>}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {paginatedFolders.map(folder => {
              const thumb = getThumb(folder.path, folder.name)
              const tags = getTags(folder.path)
              const parentName = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : 'Recursos'
              return (
                <div key={folder.id} className="group">
                  <button onClick={() => loadFolder(folder.path)} className="w-full text-left">
                    {/* Thumbnail */}
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 mb-2.5">
                      <img src={thumb} alt={folder.name} loading="eager" fetchPriority="high" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    {/* Title */}
                    <h3 className="font-semibold text-[13px] text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-700 transition">{folder.name}</h3>
                    {/* Category */}
                    <p className="text-[11px] text-gray-500 mt-0.5">{parentName}</p>
                    {/* Tags */}
                    {tags.length > 0 && (
                      <p className="text-[10px] text-gray-400 mt-0.5">{tags.join(' · ')}</p>
                    )}
                    {/* Description */}
                    {getDesc(folder.path) && (
                      <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">{getDesc(folder.path)}</p>
                    )}
                  </button>
                  {/* Admin edit */}
                  {isAdmin && (
                    <button onClick={() => { setEditingFolder(folder); setEditTags(getTags(folder.path)); setEditDesc(getDesc(folder.path)); setEditThumbUrl(folderThumbs[folder.path] || ''); setOriginalThumbUrl(folderThumbs[folder.path] || ''); setShowImagePicker(false) }}
                      className="mt-1 text-[10px] text-gray-400 hover:text-blue-600 transition opacity-0 group-hover:opacity-100">
                      Editar card
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          {/* Pagination */}
          {!isRoot && totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-8">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
                ←
              </button>
              {(() => {
                const pages: (number | '...')[] = []
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i)
                } else {
                  pages.push(1)
                  if (currentPage > 3) pages.push('...')
                  const start = Math.max(2, currentPage - 1)
                  const end = Math.min(totalPages - 1, currentPage + 1)
                  for (let i = start; i <= end; i++) pages.push(i)
                  if (currentPage < totalPages - 2) pages.push('...')
                  pages.push(totalPages)
                }
                return pages.map((page, idx) => page === '...' ? (
                  <span key={`dots-${idx}`} className="w-9 h-9 flex items-center justify-center text-sm text-gray-400">…</span>
                ) : (
                  <button key={page} onClick={() => setCurrentPage(page as number)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {page}
                  </button>
                ))
              })()}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
                →
              </button>
            </div>
          )}
        </div>
        )
      })()}

      {!loading && !isSearching && folders.length === 0 && entries.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Folder width={48} height={48} strokeWidth={1.5} className="mx-auto mb-3 text-gray-300" />
          <p>Pasta vazia</p>
        </div>
      )}

      {/* ═══ FILES VIEW — Split: Preview left + list right ═══ */}
      {!loading && !isSearching && folders.length === 0 && files.length > 0 && (() => {
        const folderTitle = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : 'Recursos'
        return (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{folderTitle}</h2>
          {folderDescription && (
            <div className="mb-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Resumo do Conteúdo:</p>
              <p className="text-[12px] text-gray-600 leading-relaxed">{folderDescription}</p>
            </div>
          )}
          <div className="flex flex-col lg:flex-row gap-4 mt-4">
            {/* Left: Preview */}
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col flex-1">
                {selectedVideo && (
                  <div className="w-full">
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=0&rel=0`}
                        className="absolute inset-0 w-full h-full rounded-t-xl" title={selectedVideo.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                    <div className="px-4 py-3 border-t bg-gray-50">
                      <p className="font-medium text-sm text-gray-900">{selectedVideo.title}</p>
                    </div>
                  </div>
                )}
                {!selectedVideo && !selectedFile && (
                  <div className="flex items-center justify-center flex-1 text-center text-gray-400 p-8">
                    <div><EmptyPage width={48} height={48} strokeWidth={1.5} className="mx-auto mb-3 text-gray-300" /><p className="text-sm">Selecione um arquivo para visualizar</p></div>
                  </div>
                )}
                {!selectedVideo && selectedFile && previewLoading && (
                  <div className="flex items-center justify-center flex-1"><RefreshDouble width={32} height={32} strokeWidth={1.5} className="animate-spin text-blue-500" /></div>
                )}
                {!selectedVideo && selectedFile && !previewLoading && !previewUrl && (
                  <div className="flex items-center justify-center flex-1 text-center text-gray-400 p-8">
                    <div><FileIcon fileType={selectedFile.fileType} size={48} /><p className="text-sm mt-3">Preview não disponível</p>
                      <button onClick={() => handleDownload(selectedFile)} className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 inline-flex items-center gap-2"><Download width={16} height={16} strokeWidth={1.5} /> Baixar</button>
                    </div>
                  </div>
                )}
                {!selectedVideo && selectedFile && !previewLoading && previewUrl && (
                  <div className="w-full flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileIcon fileType={selectedFile.fileType} size={18} />
                        <span className="font-medium text-sm text-gray-900 truncate">{selectedFile.name}</span>
                        <span className="text-xs text-gray-400">{formatSize(selectedFile.size)}</span>
                      </div>
                      <a href={previewDownloadUrl || previewUrl} download target="_blank" rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 flex items-center gap-1.5 shrink-0"><Download width={14} height={14} strokeWidth={1.5} /> Baixar</a>
                    </div>
                    <div className="flex items-center justify-center p-4 overflow-auto flex-1">
                      {selectedFile.fileType === 'image' ? <img src={previewUrl} alt="" className="max-w-full max-h-[450px] object-contain rounded-lg shadow" />
                      : selectedFile.fileType === 'video' ? <video src={previewUrl} controls className="max-w-full max-h-[450px] rounded-lg shadow" />
                      : selectedFile.fileType === 'audio' ? <div className="flex flex-col items-center gap-4 w-full max-w-md"><Headset width={36} height={36} strokeWidth={1.5} className="text-blue-400" /><p className="font-medium text-gray-700">{selectedFile.name}</p><audio src={previewUrl} controls className="w-full" /></div>
                      : selectedFile.fileType === 'pdf' ? <iframe src={`https://docs.google.com/gview?url=${encodeURIComponent(previewUrl)}&embedded=true`} className="w-full h-[450px] rounded-lg border" title={selectedFile.name} />
                      : (selectedFile.ext === 'ppt' || selectedFile.ext === 'pptx' || selectedFile.ext === 'doc' || selectedFile.ext === 'docx') ? <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`} className="w-full h-[450px] rounded-lg border" title={selectedFile.name} />
                      : <div className="text-center text-gray-500"><FileIcon fileType={selectedFile.fileType} size={48} /><p className="font-medium mt-3">{selectedFile.name}</p></div>}
                    </div>
                  </div>
                )}
              </div>
              <MaterialRecommendationsSection folderPath={path} folderName={folderTitle} allFolders={autocompleteCache} folderThumbs={folderThumbs} onNavigate={loadFolder} />
            </div>
            {/* Right: list */}
            <div className="lg:w-80 xl:w-96 shrink-0 space-y-4">
              <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">{folderVideos.length > 0 ? `${folderVideos.length} vídeos · ` : ''}{files.length} arquivos</p>
                  {isAdmin && <button onClick={() => setShowAddVideo(true)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">+ Vídeo</button>}
                </div>
                <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
                  {folderVideos.map((vid, idx) => {
                    const isActive = selectedVideo?.id === vid.id
                    return (
                      <div key={vid.id} className="relative group">
                        <button onClick={() => { setSelectedVideo(vid); setSelectedFile(null); setPreviewUrl('') }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${isActive ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-gray-50 border-l-2 border-l-transparent'}`}>
                          <div className="shrink-0 w-10 h-7 rounded bg-gray-900 overflow-hidden relative">
                            <img src={vid.thumbnail || `https://img.youtube.com/vi/${vid.id}/default.jpg`} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center"><Play width={10} height={10} strokeWidth={1.5} className="text-white" fill="white" /></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>{vid.title}</p>
                            <p className="text-[10px] text-gray-400">Vídeo</p>
                          </div>
                        </button>
                        {isAdmin && <button onClick={() => { const updated = folderVideos.filter((_, i) => i !== idx); setFolderVideos(updated); saveFolderVideos(path, updated) }}
                          className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Xmark width={12} height={12} strokeWidth={1.5} /></button>}
                      </div>
                    )
                  })}
                  {files.map(file => {
                    const isActive = selectedFile?.id === file.id && !selectedVideo
                    return (
                      <button key={file.id} onClick={() => { setSelectedVideo(null); handlePreview(file) }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${isActive ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-gray-50 border-l-2 border-l-transparent'}`}>
                        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${(FILE_ICONS[file.fileType] || FILE_ICONS.other).bg}`}>
                          <FileIcon fileType={file.fileType} size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>{file.name.replace(/\.[^/.]+$/, '')}</p>
                          <p className="text-[10px] text-gray-400"><span className="uppercase font-medium">{file.ext}</span> · {formatSize(file.size)}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        )
      })()}

      {/* Add Video Modal */}
      {showAddVideo && isAdmin && (
        <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowAddVideo(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b"><h2 className="font-bold text-gray-900">Adicionar vídeo à pasta</h2></div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL ou ID do YouTube</label>
                <input type="text" value={newVideoUrl} onChange={e => setNewVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..."
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input type="text" value={newVideoTitle} onChange={e => setNewVideoTitle(e.target.value)} placeholder="Título do vídeo"
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
            </div>
            <div className="p-5 border-t flex gap-3">
              <button onClick={() => setShowAddVideo(false)} className="flex-1 border rounded-lg py-2.5 text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={async () => {
                const id = extractYoutubeId(newVideoUrl)
                if (!id || !newVideoTitle.trim()) return
                const newVid = { id, title: newVideoTitle.trim(), thumbnail: `https://img.youtube.com/vi/${id}/mqdefault.jpg` }
                const updated = [...folderVideos, newVid]
                setFolderVideos(updated)
                await saveFolderVideos(path, updated)
                setNewVideoUrl(''); setNewVideoTitle(''); setShowAddVideo(false)
                if (!selectedVideo) setSelectedVideo(newVid)
              }} disabled={!newVideoUrl || !newVideoTitle.trim()}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">Adicionar</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ADMIN EDIT MODAL ═══ */}
      {editingFolder && isAdmin && (
        <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4" onClick={() => setEditingFolder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b">
              <h2 className="font-bold text-gray-900">Editar card da pasta</h2>
              <p className="text-xs text-gray-400 mt-1">{editingFolder.name}</p>
            </div>
            <div className="p-5 space-y-4">
              {/* Thumb upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Thumbnail</label>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border shrink-0">
                    <img src={editThumbUrl || getThumb(editingFolder.path, editingFolder.name)} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setUploading(true)
                        try {
                          const { uploadUrl, fileUrl } = await getUploadPresignedUrl(file.name, file.type)
                          await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
                          setEditThumbUrl(fileUrl)
                        } catch { /* ignore */ }
                        finally { setUploading(false) }
                      }} />
                      {uploading ? 'Enviando...' : <><MediaImage width={13} height={13} strokeWidth={1.5} /> Subir do computador</>}
                    </label>
                    <button onClick={async () => {
                      setShowImagePicker(true); setLoadingImages(true); setFolderImages([])
                      try {
                        // Browse the folder recursively for images (up to 2 levels)
                        const imgs: any[] = []
                        const contents = await browseDropbox(editingFolder.path)
                        const directImgs = (contents.entries || []).filter((e: any) => e.tag === 'file' && e.fileType === 'image')
                        imgs.push(...directImgs)
                        // Check subfolders
                        const subs = (contents.entries || []).filter((e: any) => e.tag === 'folder').slice(0, 5)
                        for (const sub of subs) {
                          try {
                            const subContents = await browseDropbox(sub.path)
                            const subImgs = (subContents.entries || []).filter((e: any) => e.tag === 'file' && e.fileType === 'image')
                            imgs.push(...subImgs)
                          } catch { /* ignore */ }
                        }
                        setFolderImages(imgs)
                      } catch { /* ignore */ }
                      finally { setLoadingImages(false) }
                    }}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"><Search width={13} height={13} strokeWidth={1.5} /> Escolher da pasta</button>
                    {(editThumbUrl || folderThumbs[editingFolder.path]) && (
                      <button onClick={() => { setEditThumbUrl('__REMOVE__') }}
                        className="block text-[10px] text-red-500 hover:text-red-700">Remover thumb</button>
                    )}
                  </div>
                </div>
                {/* Image picker from folder */}
                {showImagePicker && (
                  <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600">Imagens da pasta:</p>
                      <button onClick={() => setShowImagePicker(false)} className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"><Xmark width={12} height={12} strokeWidth={1.5} /> Fechar</button>
                    </div>
                    {loadingImages && <p className="text-xs text-gray-400 text-center py-4">Buscando imagens...</p>}
                    {!loadingImages && folderImages.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Nenhuma imagem encontrada</p>}
                    {!loadingImages && folderImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 max-h-[150px] overflow-y-auto">
                        {folderImages.map(img => (
                          <button key={img.id} onClick={async () => {
                            setUploading(true)
                            try {
                              const dl = await downloadDropbox(img.pathLower || img.path, 'view')
                              if (dl.url) {
                                const resp = await fetch(dl.url)
                                if (resp.ok) {
                                  const blob = await resp.blob()
                                  const { uploadUrl, fileUrl } = await getUploadPresignedUrl(`ft-${Date.now()}-${img.name}`, blob.type || 'image/jpeg')
                                  await fetch(uploadUrl, { method: 'PUT', body: blob, headers: { 'Content-Type': blob.type || 'image/jpeg' } })
                                  setEditThumbUrl(fileUrl)
                                  setShowImagePicker(false)
                                }
                              }
                            } catch { /* ignore */ }
                            finally { setUploading(false) }
                          }}
                            className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition text-left">
                            <MediaImage width={14} height={14} strokeWidth={1.5} className="text-blue-600 shrink-0" />
                            <span className="text-[10px] text-gray-700 truncate">{img.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {editTags.map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-700 text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1">
                      {tag}
                      <button onClick={() => setEditTags(prev => prev.filter(t => t !== tag))} className="text-gray-400 hover:text-red-500"><Xmark width={10} height={10} strokeWidth={1.5} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && tagInput.trim()) { setEditTags(prev => [...prev, tagInput.trim().toLowerCase()]); setTagInput('') } }}
                    placeholder="Adicionar tag..."
                    className="flex-1 border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-300" />
                  <button onClick={() => { if (tagInput.trim()) { setEditTags(prev => [...prev, tagInput.trim().toLowerCase()]); setTagInput('') } }}
                    className="text-xs text-blue-600 font-medium px-2">+ Add</button>
                </div>
              </div>
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descritivo breve</label>
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={2}
                  placeholder="Breve descrição do conteúdo desta pasta..."
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
            </div>
            <div className="p-5 border-t flex gap-3">
              <button onClick={() => { setEditingFolder(null); setShowImagePicker(false) }} className="flex-1 border rounded-lg py-2.5 text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={async () => {
                // Save thumb if changed
                if (editThumbUrl === '__REMOVE__') {
                  await saveFolderThumbnail(editingFolder.path, '')
                  setFolderThumbs(prev => { const n = { ...prev }; delete n[editingFolder.path]; localStorage.setItem('ri_folder_thumbs', JSON.stringify(n)); return n })
                } else if (editThumbUrl && editThumbUrl !== originalThumbUrl) {
                  await saveFolderThumbnail(editingFolder.path, editThumbUrl)
                  setFolderThumbs(prev => { const n = { ...prev, [editingFolder.path]: editThumbUrl }; localStorage.setItem('ri_folder_thumbs', JSON.stringify(n)); return n })
                }
                // Save tags + description
                await saveFolderTags(editingFolder.path, editTags, editDesc)
                setFolderTagMap(prev => ({ ...prev, [editingFolder.path]: editTags }))
                setFolderDescMap(prev => ({ ...prev, [editingFolder.path]: editDesc }))
                setEditingFolder(null); setShowImagePicker(false)
              }}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


function extractYoutubeId(input: string): string | null {
  if (!input) return null
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) return input.trim()
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = input.match(p)
    if (m) return m[1]
  }
  return null
}
