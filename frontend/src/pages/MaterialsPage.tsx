import { useState, useEffect, useCallback } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import {
  Folder, ChevronRight, Home, Loader2, X, ArrowLeft, Search, TrendingUp,
  FileText, Video, Headphones, Image, FileSpreadsheet, Presentation,
  File, Download, Archive, Play
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

const FILE_ICONS: Record<string, { icon: typeof File; color: string; bg: string }> = {
  video: { icon: Video, color: 'text-purple-600', bg: 'bg-purple-50' },
  audio: { icon: Headphones, color: 'text-blue-600', bg: 'bg-blue-50' },
  pdf: { icon: FileText, color: 'text-red-600', bg: 'bg-red-50' },
  document: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  presentation: { icon: Presentation, color: 'text-orange-600', bg: 'bg-orange-50' },
  spreadsheet: { icon: FileSpreadsheet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  image: { icon: Image, color: 'text-green-600', bg: 'bg-green-50' },
  archive: { icon: Archive, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  other: { icon: File, color: 'text-gray-500', bg: 'bg-gray-50' },
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
  return <Icon size={size} className={c.color} />
}

export default function MaterialsPage() {
  const { browseDropbox, getFolderThumbnails, saveFolderThumbnail, getUploadPresignedUrl, getFolderVideos, getAllFolderTags, saveFolderTags, smartSearchDropbox, getTopDownloads, downloadDropbox, saveFolderVideos, getFileText } = useData()
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

  // File preview states
  const [selectedFile, setSelectedFile] = useState<any | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
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
    setSelectedFile(null); setPreviewUrl(''); setSelectedVideo(null); setFolderVideos([]); setFolderDescription('')
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

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { loadFolder(path); return }
    setLoading(true); setIsSearching(true)
    try {
      const result = await smartSearchDropbox(q) as any
      setSearchResults(result.entries || [])
      setSearchKeywords(result.keywords || [])
      // Merge folder results into entries for card display
      const folderResults = result.folders || []
      setEntries([...folderResults, ...(result.entries || [])])
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

  // Auto-fetch thumbs from linked videos, images in folder, or most recent subfolder
  useEffect(() => {
    if (folders.length === 0) return
    const fetchAutoThumbs = async () => {
      const newThumbs: Record<string, string> = {}
      for (const folder of folders.slice(0, 12)) {
        if (folderThumbs[folder.path] || autoThumbs[folder.path]) continue
        try {
          // 1. Try linked video
          const vids = await getFolderVideos(folder.path).catch(() => ({ videos: [] }))
          if (vids.videos && vids.videos.length > 0) {
            newThumbs[folder.path] = vids.videos[0].thumbnail || `https://img.youtube.com/vi/${vids.videos[0].id}/mqdefault.jpg`
            continue
          }
          // 2. Try image directly in the folder (prefer thumb.png/jpg, then lightest)
          const contents = await browseDropbox(folder.path)
          const allImgs = (contents.entries || []).filter((e: any) => e.tag === 'file' && e.fileType === 'image')
          const pickBestImg = (imgs: any[]) => {
            if (imgs.length === 0) return null
            // Prefer files named "thumb"
            const thumbFile = imgs.find((e: any) => e.name.toLowerCase().startsWith('thumb'))
            if (thumbFile) return thumbFile
            // Otherwise pick the lightest
            return imgs.sort((a: any, b: any) => (a.size || 999999) - (b.size || 999999))[0]
          }
          const img = pickBestImg(allImgs)
          if (img) {
            const dl = await downloadDropbox(img.pathLower || img.path, 'view')
            if (dl.url) { newThumbs[folder.path] = dl.url; continue }
          }
          // 3. Try most recent subfolder (last alphabetically) for an image
          const subfolders = (contents.entries || []).filter((e: any) => e.tag === 'folder').sort((a: any, b: any) => b.name.localeCompare(a.name))
          for (const sub of subfolders.slice(0, 3)) {
            try {
              const subContents = await browseDropbox(sub.path || sub.pathLower)
              const subImgs = (subContents.entries || []).filter((e: any) => e.tag === 'file' && e.fileType === 'image')
              const subImg = pickBestImg(subImgs)
              if (subImg) {
                const dl = await downloadDropbox(subImg.pathLower || subImg.path, 'view')
                if (dl.url) { newThumbs[folder.path] = dl.url; break }
              }
              // Go one level deeper
              const subSubs = (subContents.entries || []).filter((e: any) => e.tag === 'folder').sort((a: any, b: any) => b.name.localeCompare(a.name))
              for (const subSub of subSubs.slice(0, 2)) {
                try {
                  const ssContents = await browseDropbox(subSub.path || subSub.pathLower)
                  const ssImgs = (ssContents.entries || []).filter((e: any) => e.tag === 'file' && e.fileType === 'image')
                  const ssImg = pickBestImg(ssImgs)
                  if (ssImg) {
                    const dl = await downloadDropbox(ssImg.pathLower || ssImg.path, 'view')
                    if (dl.url) { newThumbs[folder.path] = dl.url; break }
                  }
                } catch { /* ignore */ }
              }
              if (newThumbs[folder.path]) break
            } catch { /* ignore */ }
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
  const files = entries.filter(e => e.tag === 'file')

  const handlePreview = async (file: any) => {
    setSelectedFile(file); setPreviewUrl(''); setPreviewLoading(true); setSelectedVideo(null)
    try { const r = await downloadDropbox(file.pathLower, 'view'); setPreviewUrl(r.url) }
    catch { setPreviewUrl('') }
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
      {isSearching && !loading && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-4">Resultados para "<span className="font-medium text-gray-800">{searchQuery}</span>"
            <button onClick={() => { setSearchQuery(''); setIsSearching(false); loadFolder(path) }} className="ml-2 text-red-500 text-xs">Limpar</button>
          </p>
          {searchKeywords.length > 0 && (
            <div className="flex gap-1.5 mb-4 flex-wrap">
              {searchKeywords.slice(0, 6).map(kw => <span key={kw} className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full">{kw}</span>)}
            </div>
          )}

          {/* Folder results as cards */}
          {folders.length > 0 && (
            <div className="mb-6">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Pastas encontradas</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {folders.map(folder => {
                  const thumb = getThumb(folder.path || folder.pathLower, folder.name)
                  const tags = getTags(folder.path || folder.pathLower)
                  return (
                    <div key={folder.id} className="group">
                      <button onClick={() => { setIsSearching(false); setSearchQuery(''); loadFolder(folder.path || folder.pathLower) }} className="w-full text-left">
                        <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 mb-2.5">
                          <img src={thumb} alt={folder.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <h3 className="font-semibold text-[13px] text-gray-900 leading-snug line-clamp-2 group-hover:text-green-700 transition">{folder.name}</h3>
                        {tags.length > 0 && <p className="text-[10px] text-gray-400 mt-0.5">{tags.join(' · ')}</p>}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* File results */}
          {searchResults.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Arquivos encontrados</p>
              <div className="space-y-2">
                {searchResults.map((file: any) => {
                  const folderPath = file.path ? file.path.substring(0, file.path.lastIndexOf('/')) : ''
                  return (
                    <button key={file.id} onClick={() => { setIsSearching(false); setSearchQuery(''); loadFolder(folderPath) }}
                      className="w-full flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 hover:shadow-sm hover:border-green-200 transition text-left">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${(FILE_ICONS[file.fileType] || FILE_ICONS.other).bg}`}>
                        <FileIcon fileType={file.fileType} size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{file.folder || file.path}</p>
                      </div>
                      <span className="text-[9px] uppercase font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{file.ext}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {folders.length === 0 && searchResults.length === 0 && <p className="text-gray-400 text-center py-8">Nenhum resultado encontrado</p>}
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

      {/* ═══ FILES VIEW — Split: Preview left + list right ═══ */}
      {!loading && !isSearching && folders.length === 0 && files.length > 0 && (() => {
        const folderTitle = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : 'Materiais'
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
                    <div><File size={48} className="mx-auto mb-3 text-gray-300" /><p className="text-sm">Selecione um arquivo para visualizar</p></div>
                  </div>
                )}
                {!selectedVideo && selectedFile && previewLoading && (
                  <div className="flex items-center justify-center flex-1"><Loader2 size={32} className="animate-spin text-green-500" /></div>
                )}
                {!selectedVideo && selectedFile && !previewLoading && !previewUrl && (
                  <div className="flex items-center justify-center flex-1 text-center text-gray-400 p-8">
                    <div><FileIcon fileType={selectedFile.fileType} size={48} /><p className="text-sm mt-3">Preview não disponível</p>
                      <button onClick={() => handleDownload(selectedFile)} className="mt-4 bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 inline-flex items-center gap-2"><Download size={16} /> Baixar</button>
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
                      <a href={previewUrl} download target="_blank" rel="noopener noreferrer"
                        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 flex items-center gap-1.5 shrink-0"><Download size={14} /> Baixar</a>
                    </div>
                    <div className="flex items-center justify-center p-4 overflow-auto flex-1">
                      {selectedFile.fileType === 'image' ? <img src={previewUrl} alt="" className="max-w-full max-h-[450px] object-contain rounded-lg shadow" />
                      : selectedFile.fileType === 'video' ? <video src={previewUrl} controls className="max-w-full max-h-[450px] rounded-lg shadow" />
                      : selectedFile.fileType === 'audio' ? <div className="flex flex-col items-center gap-4 w-full max-w-md"><Headphones size={36} className="text-blue-400" /><p className="font-medium text-gray-700">{selectedFile.name}</p><audio src={previewUrl} controls className="w-full" /></div>
                      : selectedFile.fileType === 'pdf' ? <iframe src={`https://docs.google.com/gview?url=${encodeURIComponent(previewUrl)}&embedded=true`} className="w-full h-[450px] rounded-lg border" title={selectedFile.name} />
                      : (selectedFile.ext === 'ppt' || selectedFile.ext === 'pptx' || selectedFile.ext === 'doc' || selectedFile.ext === 'docx') ? <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`} className="w-full h-[450px] rounded-lg border" title={selectedFile.name} />
                      : <div className="text-center text-gray-500"><FileIcon fileType={selectedFile.fileType} size={48} /><p className="font-medium mt-3">{selectedFile.name}</p></div>}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Right: list */}
            <div className="lg:w-80 xl:w-96 shrink-0 space-y-4">
              <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">{folderVideos.length > 0 ? `${folderVideos.length} vídeos · ` : ''}{files.length} arquivos</p>
                  {isAdmin && <button onClick={() => setShowAddVideo(true)} className="text-xs text-green-600 hover:text-green-800 font-medium">+ Vídeo</button>}
                </div>
                <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
                  {folderVideos.map((vid, idx) => {
                    const isActive = selectedVideo?.id === vid.id
                    return (
                      <div key={vid.id} className="relative group">
                        <button onClick={() => { setSelectedVideo(vid); setSelectedFile(null); setPreviewUrl('') }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${isActive ? 'bg-purple-50 border-l-2 border-l-purple-500' : 'hover:bg-gray-50 border-l-2 border-l-transparent'}`}>
                          <div className="shrink-0 w-10 h-7 rounded bg-gray-900 overflow-hidden relative">
                            <img src={vid.thumbnail || `https://img.youtube.com/vi/${vid.id}/default.jpg`} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center"><Play size={10} className="text-white" fill="white" /></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${isActive ? 'text-purple-900' : 'text-gray-900'}`}>{vid.title}</p>
                            <p className="text-[10px] text-gray-400">Vídeo</p>
                          </div>
                        </button>
                        {isAdmin && <button onClick={() => { const updated = folderVideos.filter((_, i) => i !== idx); setFolderVideos(updated); saveFolderVideos(path, updated) }}
                          className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><X size={12} /></button>}
                      </div>
                    )
                  })}
                  {files.map(file => {
                    const isActive = selectedFile?.id === file.id && !selectedVideo
                    return (
                      <button key={file.id} onClick={() => { setSelectedVideo(null); handlePreview(file) }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${isActive ? 'bg-green-50 border-l-2 border-l-green-500' : 'hover:bg-gray-50 border-l-2 border-l-transparent'}`}>
                        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${(FILE_ICONS[file.fileType] || FILE_ICONS.other).bg}`}>
                          <FileIcon fileType={file.fileType} size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${isActive ? 'text-green-900' : 'text-gray-900'}`}>{file.name.replace(/\.[^/.]+$/, '')}</p>
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
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input type="text" value={newVideoTitle} onChange={e => setNewVideoTitle(e.target.value)} placeholder="Título do vídeo"
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-200" />
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
                className="flex-1 bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-50">Adicionar</button>
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
