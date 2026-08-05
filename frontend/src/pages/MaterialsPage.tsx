import { useState, useEffect, useCallback } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import {
  Folder, ChevronRight, Home, Loader2, X, ArrowLeft, Search, TrendingUp
} from 'lucide-react'

// Generate a deterministic colorful SVG placeholder based on folder name
function generatePlaceholderThumb(name: string): string {
  const colors = [
    ['#16a34a', '#059669'], ['#2563eb', '#1d4ed8'], ['#9333ea', '#7c3aed'],
    ['#dc2626', '#b91c1c'], ['#ea580c', '#c2410c'], ['#0891b2', '#0e7490'],
    ['#4f46e5', '#4338ca'], ['#be185d', '#9d174d'], ['#ca8a04', '#a16207'],
    ['#0d9488', '#0f766e'],
  ]
  const shapes = ['circle', 'rect', 'triangle', 'diamond', 'cross']
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const [c1, c2] = colors[hash % colors.length]
  const shape = shapes[(hash * 7) % shapes.length]
  const rotation = (hash * 13) % 360

  let shapesSvg = ''
  // Background pattern
  for (let i = 0; i < 3; i++) {
    const x = 30 + ((hash * (i + 3) * 17) % 200)
    const y = 30 + ((hash * (i + 5) * 13) % 200)
    const size = 20 + ((hash * (i + 1)) % 40)
    const opacity = 0.1 + ((hash * (i + 2)) % 3) * 0.05
    if (shape === 'circle') {
      shapesSvg += `<circle cx="${x}" cy="${y}" r="${size}" fill="white" opacity="${opacity}"/>`
    } else if (shape === 'rect') {
      shapesSvg += `<rect x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" fill="white" opacity="${opacity}" transform="rotate(${rotation} ${x} ${y})"/>`
    } else if (shape === 'triangle') {
      shapesSvg += `<polygon points="${x},${y - size} ${x - size},${y + size} ${x + size},${y + size}" fill="white" opacity="${opacity}"/>`
    } else if (shape === 'diamond') {
      shapesSvg += `<rect x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" fill="white" opacity="${opacity}" transform="rotate(45 ${x} ${y})"/>`
    } else {
      shapesSvg += `<rect x="${x - size / 2}" y="${y - 4}" width="${size}" height="8" fill="white" opacity="${opacity}"/><rect x="${x - 4}" y="${y - size / 2}" width="8" height="${size}" fill="white" opacity="${opacity}"/>`
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="300" height="300" fill="url(#g)"/>${shapesSvg}<text x="150" y="160" text-anchor="middle" font-family="system-ui,sans-serif" font-size="24" font-weight="700" fill="white" opacity="0.9">${name.substring(0, 18)}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export default function MaterialsPage() {
  const { browseDropbox, getFolderThumbnails, saveFolderThumbnail, getUploadPresignedUrl, getFolderVideos, getAllFolderTags, saveFolderTags, smartSearchDropbox, getTopDownloads, downloadDropbox } = useData()
  const { user } = useAuth()

  const [path, setPath] = useState('')
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [folderThumbs, setFolderThumbs] = useState<Record<string, string>>({})
  const [folderTagMap, setFolderTagMap] = useState<Record<string, string[]>>({})
  const [autoThumbs, setAutoThumbs] = useState<Record<string, string>>({})
  const [topDownloads, setTopDownloads] = useState<any[]>([])

  // Search
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchKeywords, setSearchKeywords] = useState<string[]>([])

  // Admin edit state
  const [editingFolder, setEditingFolder] = useState<any | null>(null)
  const [editDesc, setEditDesc] = useState('')
  const [editTags, setEditTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [uploading, setUploading] = useState(false)

  const isAdmin = user?.role === 'admin'

  const loadFolder = useCallback(async (p: string) => {
    setLoading(true); setIsSearching(false); setSearchResults([])
    try {
      const result = await browseDropbox(p)
      setEntries(result.entries); setPath(p)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [browseDropbox])

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { loadFolder(path); return }
    setLoading(true); setIsSearching(true)
    try {
      const result = await smartSearchDropbox(q)
      setSearchResults(result.entries || [])
      setSearchKeywords(result.keywords || [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [smartSearchDropbox, loadFolder, path])

  useEffect(() => { loadFolder('') }, [loadFolder])
  useEffect(() => {
    getFolderThumbnails().then(d => setFolderThumbs(d.thumbnails || {})).catch(() => {})
    getAllFolderTags().then(d => setFolderTagMap(d.tagMap || {})).catch(() => {})
    getTopDownloads().then(setTopDownloads).catch(() => {})
  }, [])

  const folders = entries.filter(e => e.tag === 'folder')

  // Auto-fetch thumbs from linked videos
  useEffect(() => {
    if (folders.length === 0) return
    const fetchAutoThumbs = async () => {
      const newThumbs: Record<string, string> = {}
      for (const folder of folders.slice(0, 12)) {
        if (folderThumbs[folder.path] || autoThumbs[folder.path]) continue
        try {
          const vids = await getFolderVideos(folder.path).catch(() => ({ videos: [] }))
          if (vids.videos && vids.videos.length > 0) {
            newThumbs[folder.path] = vids.videos[0].thumbnail || `https://img.youtube.com/vi/${vids.videos[0].id}/mqdefault.jpg`
            continue
          }
          // Try to find image in folder
          const contents = await browseDropbox(folder.path)
          const img = (contents.entries || []).find((e: any) => e.tag === 'file' && e.fileType === 'image')
          if (img) {
            const dl = await downloadDropbox(img.pathLower, 'view')
            if (dl.url) newThumbs[folder.path] = dl.url
          }
        } catch { /* ignore */ }
      }
      if (Object.keys(newThumbs).length > 0) setAutoThumbs(prev => ({ ...prev, ...newThumbs }))
    }
    fetchAutoThumbs()
  }, [folders.length, folderThumbs])

  const breadcrumbs = path ? path.split('/').filter(Boolean).map((part, i, arr) => ({
    name: part, path: '/' + arr.slice(0, i + 1).join('/'),
  })) : []

  const isRoot = !path
  const getThumb = (folderPath: string, name: string) => folderThumbs[folderPath] || autoThumbs[folderPath] || generatePlaceholderThumb(name)
  const getTags = (folderPath: string) => folderTagMap[folderPath] || []

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Materiais</h1>
          <p className="text-sm text-gray-500 mt-1">Recursos para seu ministério</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch(searchQuery)}
            placeholder="Buscar materiais, mensagens, apresentações..."
            className="w-full pl-11 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition" />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); if (isSearching) loadFolder(path) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14} /></button>
          )}
        </div>
        <button onClick={() => doSearch(searchQuery)}
          className="bg-green-600 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-green-700 transition">
          Buscar
        </button>
      </div>

      {/* Search results */}
      {isSearching && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Resultados para "<span className="font-medium text-gray-800">{searchQuery}</span>"
            <button onClick={() => { setSearchQuery(''); setIsSearching(false); loadFolder(path) }} className="ml-2 text-red-500 text-xs">Limpar</button>
          </p>
          {searchKeywords.length > 0 && (
            <div className="flex gap-1.5 mb-4 flex-wrap">
              {searchKeywords.slice(0, 6).map(kw => <span key={kw} className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full">{kw}</span>)}
            </div>
          )}
          {!loading && searchResults.length === 0 && <p className="text-gray-400 text-center py-8">Nenhum resultado encontrado</p>}
          {!loading && searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((file: any) => (
                <div key={file.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 hover:shadow-sm transition">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Folder size={16} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{file.path}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Breadcrumb */}
      {!isRoot && !isSearching && (
        <div className="flex items-center gap-1.5 mb-5 text-sm flex-wrap">
          <button onClick={() => { const parts = path.split('/'); parts.pop(); loadFolder(parts.join('/')) }}
            className="text-gray-400 hover:text-gray-700 mr-1 p-1 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={16} /></button>
          <button onClick={() => loadFolder('')} className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition">
            <Home size={14} /> Materiais
          </button>
          {breadcrumbs.map((bc, i) => (
            <span key={bc.path} className="flex items-center gap-1.5">
              <ChevronRight size={13} className="text-gray-300" />
              <button onClick={() => loadFolder(bc.path)}
                className={`hover:text-gray-900 transition ${i === breadcrumbs.length - 1 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>{bc.name}</button>
            </span>
          ))}
        </div>
      )}

      {/* ═══ TOP DOWNLOADS (root only) ═══ */}
      {isRoot && !isSearching && topDownloads.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-green-600" />
            <h2 className="text-[15px] font-bold text-gray-900">Mais baixados</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {topDownloads.slice(0, 5).map(item => {
              const thumb = getThumb(item.folderPath, item.folderName || '')
              return (
                <button key={item.folderPath} onClick={() => loadFolder(item.folderPath)} className="text-left group">
                  <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 mb-2">
                    <img src={thumb} alt={item.folderName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">#{item.rank}</div>
                  </div>
                  <p className="text-[12px] font-medium text-gray-900 line-clamp-2 leading-snug">{item.folderName}</p>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {loading && <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-green-500" /></div>}

      {/* ═══ FOLDER CARDS — Life.Church style ═══ */}
      {!loading && !isSearching && folders.length > 0 && (
        <div>
          {isRoot && <h2 className="text-[15px] font-bold text-gray-900 mb-4">Conteúdos disponíveis</h2>}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {folders.map(folder => {
              const thumb = getThumb(folder.path, folder.name)
              const tags = getTags(folder.path)
              const parentName = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : 'Materiais'
              return (
                <div key={folder.id} className="group">
                  <button onClick={() => loadFolder(folder.path)} className="w-full text-left">
                    {/* Thumbnail */}
                    <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 mb-2.5">
                      <img src={thumb} alt={folder.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    {/* Title */}
                    <h3 className="font-semibold text-[13px] text-gray-900 leading-snug line-clamp-2 group-hover:text-green-700 transition">{folder.name}</h3>
                    {/* Category */}
                    <p className="text-[11px] text-gray-500 mt-0.5">{parentName}</p>
                    {/* Tags */}
                    {tags.length > 0 && (
                      <p className="text-[10px] text-gray-400 mt-0.5">{tags.join(' · ')}</p>
                    )}
                  </button>
                  {/* Admin edit */}
                  {isAdmin && (
                    <button onClick={() => { setEditingFolder(folder); setEditTags(getTags(folder.path)); setEditDesc('') }}
                      className="mt-1 text-[10px] text-gray-400 hover:text-green-600 transition opacity-0 group-hover:opacity-100">
                      ✏️ Editar card
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!loading && !isSearching && folders.length === 0 && entries.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Folder size={48} className="mx-auto mb-3 text-gray-300" />
          <p>Pasta vazia</p>
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
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border shrink-0">
                    <img src={getThumb(editingFolder.path, editingFolder.name)} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <label className="inline-flex items-center gap-1.5 text-xs text-green-600 hover:text-green-800 cursor-pointer font-medium">
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setUploading(true)
                        try {
                          const { uploadUrl, fileUrl } = await getUploadPresignedUrl(file.name, file.type)
                          await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
                          await saveFolderThumbnail(editingFolder.path, fileUrl)
                          setFolderThumbs(prev => ({ ...prev, [editingFolder.path]: fileUrl }))
                        } catch { /* ignore */ }
                        finally { setUploading(false) }
                      }} />
                      {uploading ? 'Enviando...' : folderThumbs[editingFolder.path] ? '📷 Trocar' : '📷 Subir imagem'}
                    </label>
                    {folderThumbs[editingFolder.path] && (
                      <button onClick={async () => {
                        await saveFolderThumbnail(editingFolder.path, '')
                        setFolderThumbs(prev => { const n = { ...prev }; delete n[editingFolder.path]; return n })
                      }} className="block text-[10px] text-red-500 hover:text-red-700 mt-1">Remover thumb</button>
                    )}
                  </div>
                </div>
              </div>
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {editTags.map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-700 text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1">
                      {tag}
                      <button onClick={() => setEditTags(prev => prev.filter(t => t !== tag))} className="text-gray-400 hover:text-red-500"><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && tagInput.trim()) { setEditTags(prev => [...prev, tagInput.trim().toLowerCase()]); setTagInput('') } }}
                    placeholder="Adicionar tag..."
                    className="flex-1 border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-green-300" />
                  <button onClick={() => { if (tagInput.trim()) { setEditTags(prev => [...prev, tagInput.trim().toLowerCase()]); setTagInput('') } }}
                    className="text-xs text-green-600 font-medium px-2">+ Add</button>
                </div>
              </div>
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descritivo breve</label>
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={2}
                  placeholder="Breve descrição do conteúdo desta pasta..."
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-200" />
              </div>
            </div>
            <div className="p-5 border-t flex gap-3">
              <button onClick={() => setEditingFolder(null)} className="flex-1 border rounded-lg py-2.5 text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={async () => {
                await saveFolderTags(editingFolder.path, editTags)
                setFolderTagMap(prev => ({ ...prev, [editingFolder.path]: editTags }))
                setEditingFolder(null)
              }}
                className="flex-1 bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
