import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import {
  Folder, FileText, Video, Headphones, Image, FileSpreadsheet, Presentation,
  File, Download, ChevronRight, Home, Loader2, X, Archive, Search, ArrowLeft,
  BookOpen, Users, Star, Music, Heart, Lightbulb, Calendar, TrendingUp, Play
} from 'lucide-react'

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

// Folder theme colors/icons for root-level categories
const FOLDER_THEMES: Record<string, { icon: typeof Folder; gradient: string; iconColor: string }> = {
  'Mensagens': { icon: BookOpen, gradient: 'from-purple-500 to-indigo-600', iconColor: 'text-white' },
  'Crianças': { icon: Heart, gradient: 'from-pink-400 to-rose-500', iconColor: 'text-white' },
  'Jovens': { icon: Music, gradient: 'from-cyan-500 to-blue-600', iconColor: 'text-white' },
  'Liderança': { icon: Star, gradient: 'from-amber-400 to-orange-500', iconColor: 'text-white' },
  'Gestão': { icon: Lightbulb, gradient: 'from-emerald-400 to-teal-600', iconColor: 'text-white' },
  'Eventos': { icon: Calendar, gradient: 'from-violet-500 to-purple-600', iconColor: 'text-white' },
  'Ministérios': { icon: Users, gradient: 'from-blue-500 to-indigo-600', iconColor: 'text-white' },
  'Worship': { icon: Music, gradient: 'from-rose-400 to-pink-600', iconColor: 'text-white' },
}

function getFolderTheme(name: string) {
  for (const [key, theme] of Object.entries(FOLDER_THEMES)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return theme
  }
  // Default theme based on first letter hash
  const defaults = [
    { icon: Folder, gradient: 'from-slate-500 to-gray-700', iconColor: 'text-white' },
    { icon: Folder, gradient: 'from-green-500 to-emerald-600', iconColor: 'text-white' },
    { icon: Folder, gradient: 'from-sky-500 to-blue-600', iconColor: 'text-white' },
    { icon: Folder, gradient: 'from-orange-400 to-red-500', iconColor: 'text-white' },
  ]
  return defaults[name.charCodeAt(0) % defaults.length]
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

// Generate a brief description based on folder name and file contents
function generateFolderDescription(folderTitle: string, allFiles: any[], docFiles: any[]): string {
  const fileTypes = new Set(allFiles.map(f => f.fileType))
  const extensions = new Set(allFiles.map(f => f.ext?.toLowerCase()).filter(Boolean))

  const parts: string[] = []

  // Describe content type based on what's in the folder
  const typeDescriptions: string[] = []
  if (fileTypes.has('presentation') || extensions.has('pptx') || extensions.has('ppt')) typeDescriptions.push('apresentações')
  if (fileTypes.has('pdf') || extensions.has('pdf')) typeDescriptions.push('PDFs')
  if (fileTypes.has('document') || extensions.has('docx') || extensions.has('doc')) typeDescriptions.push('documentos')
  if (fileTypes.has('video') || extensions.has('mp4')) typeDescriptions.push('vídeos')
  if (fileTypes.has('audio') || extensions.has('mp3')) typeDescriptions.push('áudios')
  if (fileTypes.has('image') || extensions.has('jpg') || extensions.has('png')) typeDescriptions.push('imagens')

  if (typeDescriptions.length > 0) {
    parts.push(`Esta pasta contém ${typeDescriptions.join(', ')}`)
  }

  // Context based on folder name keywords
  const titleLower = folderTitle.toLowerCase()
  if (titleLower.includes('mensagen') || titleLower.includes('sermon') || titleLower.includes('pregaç')) {
    parts.push('Material de apoio para mensagens e pregações. Use as apresentações e roteiros para enriquecer seu culto.')
  } else if (titleLower.includes('lideranç') || titleLower.includes('líder') || titleLower.includes('treinament')) {
    parts.push('Recursos de capacitação para líderes. Ideal para reuniões de equipe e desenvolvimento ministerial.')
  } else if (titleLower.includes('crianç') || titleLower.includes('kids') || titleLower.includes('infantil')) {
    parts.push('Materiais voltados para o ministério infantil. Histórias, atividades e recursos visuais.')
  } else if (titleLower.includes('jovens') || titleLower.includes('adolescent')) {
    parts.push('Conteúdo dinâmico para o ministério de jovens e adolescentes.')
  } else if (titleLower.includes('worship') || titleLower.includes('louvor') || titleLower.includes('música')) {
    parts.push('Recursos para o ministério de louvor e adoração.')
  } else if (titleLower.includes('gestão') || titleLower.includes('operacion') || titleLower.includes('financ')) {
    parts.push('Ferramentas e templates para a gestão e operação da igreja.')
  } else if (docFiles.length > 0) {
    parts.push('Explore os materiais disponíveis para uso no seu ministério.')
  }

  // Add file count info
  if (allFiles.length > 0) {
    parts.push(`${allFiles.length} arquivo${allFiles.length > 1 ? 's' : ''} disponíve${allFiles.length > 1 ? 'is' : 'l'} para download.`)
  }

  return parts.join(' ')
}

export default function PreviewMateriais() {
  const { browseDropbox, downloadDropbox, smartSearchDropbox, getTopDownloads, getFolderVideos, saveFolderVideos, getFileText } = useData()
  const { user: _user } = useAuth()
  const { t } = useI18n()
  const [searchParams] = useSearchParams()
  const initialPath = searchParams.get('path') || ''

  const [path, setPath] = useState('')
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchKeywords, setSearchKeywords] = useState<string[]>([])
  const [topDownloads, setTopDownloads] = useState<any[]>([])

  // Drawer preview state
  const [selectedFile, setSelectedFile] = useState<any | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)

  // Folder videos state
  const [folderVideos, setFolderVideos] = useState<any[]>([])
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null)
  const [showAddVideo, setShowAddVideo] = useState(false)
  const [newVideoUrl, setNewVideoUrl] = useState('')
  const [newVideoTitle, setNewVideoTitle] = useState('')
  const [folderDescription, setFolderDescription] = useState('')
  const isAdmin = _user?.role === 'admin'

  const loadFolder = useCallback(async (p: string) => {
    setLoading(true); setError(''); setIsSearching(false); setSearchKeywords([])
    setSelectedFile(null); setPreviewUrl(''); setSelectedVideo(null); setFolderVideos([])
    setFolderDescription('')
    try {
      const [result, vidsResult] = await Promise.all([
        browseDropbox(p),
        p ? getFolderVideos(p).catch(() => ({ videos: [] })) : Promise.resolve({ videos: [] })
      ])
      setEntries(result.entries); setPath(p)
      const vids = vidsResult.videos || []
      setFolderVideos(vids)
      if (vids.length > 0) setSelectedVideo(vids[0])

      // Try to extract description from first .doc/.docx in the folder
      const fileEntries = (result.entries || []).filter((e: any) => e.tag === 'file')
      const docFile = fileEntries.find((f: any) => {
        const ext = (f.ext || f.name?.split('.').pop() || '').toLowerCase()
        return ext === 'docx' || ext === 'doc'
      })
      if (docFile && p) {
        try {
          const filePath = docFile.pathLower || docFile.path
          console.log('[PreviewMateriais] Reading doc for description:', filePath)
          const data = await getFileText(filePath)
          console.log('[PreviewMateriais] Got text, length:', data.text?.length)
          if (data.text && data.text.length > 20) {
            const summary = data.text.substring(0, 400).trim()
            setFolderDescription(summary + (data.text.length > 400 ? '...' : ''))
          }
        } catch (e) {
          console.log('[PreviewMateriais] Could not read doc:', e)
        }
      }
    } catch (e: any) { setError(e.message || 'Erro') }
    finally { setLoading(false) }
  }, [browseDropbox, getFolderVideos, getFileText])

  useEffect(() => { loadFolder(initialPath) }, [loadFolder, initialPath])
  useEffect(() => { getTopDownloads().then(setTopDownloads).catch(() => {}) }, [getTopDownloads])

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { loadFolder(path); return }
    setLoading(true); setError(''); setIsSearching(true)
    setSelectedFile(null); setPreviewUrl('')
    try {
      const result = await smartSearchDropbox(q)
      setEntries(result.entries); setSearchKeywords(result.keywords || [])
    } catch (e: any) { setError(e.message || 'Erro') }
    finally { setLoading(false) }
  }, [smartSearchDropbox, loadFolder, path])

  const handlePreview = async (file: any) => {
    setSelectedFile(file); setPreviewUrl(''); setPreviewLoading(true)
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

  const breadcrumbs = path ? path.split('/').filter(Boolean).map((part, i, arr) => ({
    name: part, path: '/' + arr.slice(0, i + 1).join('/'),
  })) : []

  const folders = entries.filter(e => e.tag === 'folder')
  const files = entries.filter(e => e.tag === 'file')
  const isRoot = !path

  return (
    <div className="min-h-screen">
      {/* ═══ HERO BANNER ═══ */}
      {isRoot && !isSearching && (
        <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-8 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute bottom-4 left-16 w-24 h-24 rounded-full bg-white/30 blur-xl" />
          </div>
          <div className="relative px-8 py-10 md:py-14">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Recursos para seu ministério</h1>
            <p className="text-white/70 text-sm mt-2 max-w-lg">Mensagens, materiais para liderança, crianças, jovens e muito mais. Tudo pronto para download.</p>
            {/* Search inside hero */}
            <div className="mt-6 max-w-xl">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input type="text" value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && doSearch(searchQuery)}
                    placeholder="Buscar materiais, mensagens, apresentações..."
                    className="w-full pl-11 pr-10 py-3 bg-white/15 border border-white/20 rounded-xl text-sm text-white placeholder-white/50 outline-none focus:bg-white/20 focus:border-white/40 transition backdrop-blur-sm" />
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(''); if (isSearching) loadFolder(path) }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"><X size={14} /></button>
                  )}
                </div>
                <button onClick={() => doSearch(searchQuery)}
                  className="bg-white text-green-700 px-5 py-3 rounded-xl text-sm font-semibold hover:bg-white/90 transition shadow-lg shadow-green-900/20">
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search bar (when not on root) */}
      {(!isRoot || isSearching) && (
        <div className="flex gap-2 mb-5">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch(searchQuery)}
              placeholder="Buscar materiais..."
              className="w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition" />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); if (isSearching) loadFolder(path) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14} /></button>
            )}
          </div>
          <button onClick={() => doSearch(searchQuery)}
            className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition">
            Buscar
          </button>
        </div>
      )}

      {/* ═══ TOP DOWNLOADS (root only) ═══ */}
      {isRoot && !isSearching && topDownloads.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-green-600" />
            <h2 className="text-[16px] font-bold text-gray-900">Mais baixados</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {topDownloads.slice(0, 5).map(item => {
              const parts = (item.filePath || '').split('/')
              const fileName = parts[parts.length - 1] || ''
              const folderPath = parts.slice(0, -1).join('/')
              return (
                <button key={item.filePath} onClick={() => loadFolder(folderPath)}
                  className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-green-200 transition text-left group">
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] font-bold text-green-600 shrink-0">#{item.rank}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium text-gray-800 truncate">{fileName}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate">{folderPath}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* ═══ BREADCRUMB (not root) ═══ */}
      {!isRoot && !isSearching && (
        <div className="flex items-center gap-1.5 mb-5 text-sm flex-wrap">
          {path && (
            <button onClick={() => { const parts = path.split('/'); parts.pop(); loadFolder(parts.join('/')) }}
              className="text-gray-400 hover:text-gray-700 mr-1 p-1 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={16} /></button>
          )}
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

      {/* Search results info */}
      {isSearching && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">Resultados para "<span className="font-medium text-gray-800">{searchQuery}</span>" — {files.length} arquivos
            <button onClick={() => { setSearchQuery(''); setIsSearching(false); loadFolder(path) }}
              className="ml-2 text-red-500 hover:text-red-700 text-xs">Limpar</button>
          </p>
          {searchKeywords.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {searchKeywords.slice(0, 8).map(kw => <span key={kw} className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full">{kw}</span>)}
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-green-500" /></div>}
      {error && <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700 mb-4">{error}</div>}

      {/* Empty */}
      {!loading && !error && folders.length === 0 && files.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Folder size={48} className="mx-auto mb-3 text-gray-300" />
          <p>{isSearching ? 'Nenhum resultado encontrado' : t('materials.emptyFolder')}</p>
        </div>
      )}

      {/* ═══ FOLDER GRID — Visual cards ═══ */}
      {!loading && folders.length > 0 && (
        <div className="mb-6">
          {isRoot && <h2 className="text-[16px] font-bold text-gray-900 mb-4">Categorias</h2>}
          <div className={`grid gap-4 ${isRoot ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
            {folders.map(folder => {
              const theme = getFolderTheme(folder.name)
              const ThemeIcon = theme.icon
              return (
                <button key={folder.id} onClick={() => loadFolder(folder.path)}
                  className="relative overflow-hidden rounded-xl text-left group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                  <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-90 group-hover:opacity-100 transition`} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition">
                    <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white blur-xl" />
                  </div>
                  <div className="relative p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                      <ThemeIcon size={24} className={theme.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-[14px] truncate">{folder.name}</p>
                      <p className="text-white/60 text-[11px] mt-0.5">Abrir pasta</p>
                    </div>
                    <ChevronRight size={18} className="text-white/40 group-hover:text-white/80 group-hover:translate-x-0.5 transition shrink-0" />
                  </div>
                </button>
              )
            })}
          </div>

          {/* Files below folders (if any) */}
          {files.length > 0 && (
            <>
              <div className="border-t my-6" />
              {/* Description from doc */}
              {(folderDescription || (!isRoot && files.length > 0)) && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4">
                  <p className="text-[12px] text-gray-700 leading-relaxed">
                    {folderDescription || generateFolderDescription(breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : '', files, files.filter(f => f.fileType === 'document'))}
                  </p>
                </div>
              )}
              <h3 className="text-[14px] font-semibold text-gray-700 mb-3">Arquivos nesta pasta</h3>
              <div className="space-y-2">
                {files.map(file => (
                  <div key={file.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3.5 hover:shadow-sm hover:border-gray-200 transition group cursor-pointer" onClick={() => handlePreview(file)}>
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${(FILE_ICONS[file.fileType] || FILE_ICONS.other).bg} flex items-center justify-center`}>
                      <FileIcon fileType={file.fileType} size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{file.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                        <span className="uppercase font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px]">{file.ext}</span>
                        <span>{formatSize(file.size)}</span>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDownload(file) }} disabled={downloading === file.pathLower}
                      className="text-gray-400 hover:text-green-600 p-2 rounded-lg hover:bg-green-50 transition">
                      {downloading === file.pathLower ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══ FILES ONLY VIEW — Split: Preview left + list right ═══ */}
      {!loading && folders.length === 0 && files.length > 0 && (() => {
        // Folder title from last breadcrumb
        const folderTitle = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : 'Materiais'
        // Use doc-based description if available, otherwise auto-generate
        const docFiles = files.filter(f => f.fileType === 'document' || f.fileType === 'pdf' || f.ext === 'doc' || f.ext === 'docx' || f.ext === 'txt')
        const displayDescription = folderDescription || generateFolderDescription(folderTitle, files, docFiles)

        return (
        <div>
          {/* Folder title */}
          <h2 className="text-xl font-bold text-gray-900 mb-1">{folderTitle}</h2>

          <div className="flex flex-col lg:flex-row gap-4 mt-4">
            {/* Left: Preview area */}
            <div className="flex-1 min-w-0">
              <div className="bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col">
                {/* Video playing — full 16:9 without cropping */}
                {selectedVideo && (
                  <div className="w-full">
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=0&rel=0`}
                        className="absolute inset-0 w-full h-full rounded-t-xl"
                        title={selectedVideo.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="px-4 py-3 border-t bg-gray-50">
                      <p className="font-medium text-sm text-gray-900">{selectedVideo.title}</p>
                    </div>
                  </div>
                )}
                {/* File preview (when no video selected) */}
                {!selectedVideo && !selectedFile && (
                  <div className="flex items-center justify-center min-h-[400px] text-center text-gray-400 p-8">
                    <div>
                      <File size={48} className="mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">Selecione um arquivo para visualizar</p>
                    </div>
                  </div>
                )}
                {!selectedVideo && selectedFile && previewLoading && (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 size={32} className="animate-spin text-green-500" />
                  </div>
                )}
                {!selectedVideo && selectedFile && !previewLoading && !previewUrl && (
                  <div className="flex items-center justify-center min-h-[400px] text-center text-gray-400 p-8">
                    <div>
                      <FileIcon fileType={selectedFile.fileType} size={48} />
                      <p className="text-sm mt-3">Preview não disponível</p>
                      <button onClick={() => handleDownload(selectedFile)}
                        className="mt-4 bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 inline-flex items-center gap-2">
                        <Download size={16} /> Baixar arquivo
                      </button>
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
                        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 flex items-center gap-1.5 flex-shrink-0">
                        <Download size={14} /> Baixar
                      </a>
                    </div>
                    <div className="flex items-center justify-center p-4 overflow-auto min-h-[350px]">
                      {selectedFile.fileType === 'image' ? (
                        <img src={previewUrl} alt={selectedFile.name} className="max-w-full max-h-[450px] object-contain rounded-lg shadow" />
                      ) : selectedFile.fileType === 'video' ? (
                        <video src={previewUrl} controls className="max-w-full max-h-[450px] rounded-lg shadow" />
                      ) : selectedFile.fileType === 'audio' ? (
                        <div className="flex flex-col items-center gap-4 w-full max-w-md">
                          <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center">
                            <Headphones size={36} className="text-blue-400" />
                          </div>
                          <p className="font-medium text-gray-700 text-center">{selectedFile.name}</p>
                          <audio src={previewUrl} controls className="w-full" />
                        </div>
                      ) : selectedFile.fileType === 'pdf' ? (
                        <iframe src={`https://docs.google.com/gview?url=${encodeURIComponent(previewUrl)}&embedded=true`} className="w-full h-[450px] rounded-lg border" title={selectedFile.name} />
                      ) : (selectedFile.ext === 'ppt' || selectedFile.ext === 'pptx' || selectedFile.ext === 'doc' || selectedFile.ext === 'docx') ? (
                        <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`} className="w-full h-[450px] rounded-lg border" title={selectedFile.name} />
                      ) : (
                        <div className="text-center text-gray-500">
                          <FileIcon fileType={selectedFile.fileType} size={48} />
                          <p className="font-medium mt-3">{selectedFile.name}</p>
                          <p className="text-sm text-gray-400 mt-1">Clique em "Baixar" para abrir</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Description + Videos + File list */}
            <div className="lg:w-80 xl:w-96 flex-shrink-0 space-y-4">
              {/* Folder description */}
              {displayDescription && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <p className="text-[12px] text-gray-700 leading-relaxed">{displayDescription}</p>
                </div>
              )}

              {/* List */}
              <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">
                    {folderVideos.length > 0 ? `${folderVideos.length} vídeos · ` : ''}{files.length} {t('materials.files')}
                  </p>
                  {isAdmin && (
                    <button onClick={() => setShowAddVideo(true)} className="text-xs text-green-600 hover:text-green-800 font-medium">+ Vídeo</button>
                  )}
                </div>
                <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
                  {/* Folder videos */}
                  {folderVideos.map((vid, idx) => {
                    const isActive = selectedVideo?.id === vid.id
                    return (
                      <div key={vid.id} className="relative group">
                        <button onClick={() => { setSelectedVideo(vid); setSelectedFile(null); setPreviewUrl('') }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${isActive ? 'bg-purple-50 border-l-2 border-l-purple-500' : 'hover:bg-gray-50 border-l-2 border-l-transparent'}`}>
                          <div className="flex-shrink-0 w-10 h-7 rounded bg-gray-900 overflow-hidden relative">
                            <img src={vid.thumbnail || `https://img.youtube.com/vi/${vid.id}/default.jpg`} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play size={10} className="text-white" fill="white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${isActive ? 'text-purple-900' : 'text-gray-900'}`}>{vid.title}</p>
                            <p className="text-[10px] text-gray-400">Vídeo</p>
                          </div>
                        </button>
                        {isAdmin && (
                          <button onClick={() => {
                            const updated = folderVideos.filter((_, i) => i !== idx)
                            setFolderVideos(updated)
                            saveFolderVideos(path, updated)
                            if (selectedVideo?.id === vid.id) setSelectedVideo(updated[0] || null)
                          }}
                            className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    )
                  })}
                  {/* Files */}
                  {files.map(file => {
                    const isActive = selectedFile?.id === file.id && !selectedVideo
                    return (
                      <button key={file.id} onClick={() => { setSelectedVideo(null); handlePreview(file) }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${isActive ? 'bg-green-50 border-l-2 border-l-green-500' : 'hover:bg-gray-50 border-l-2 border-l-transparent'}`}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${(FILE_ICONS[file.fileType] || FILE_ICONS.other).bg}`}>
                          <FileIcon fileType={file.fileType} size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${isActive ? 'text-green-900' : 'text-gray-900'}`}>{file.name.replace(/\.[^/.]+$/, '')}</p>
                          <p className="text-[10px] text-gray-400">
                            <span className="uppercase font-medium">{file.ext}</span> · {formatSize(file.size)}
                          </p>
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

      {/* ═══ ADD VIDEO MODAL (admin) ═══ */}
      {showAddVideo && isAdmin && (
        <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowAddVideo(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b">
              <h2 className="font-bold text-gray-900">Adicionar vídeo à pasta</h2>
              <p className="text-xs text-gray-400 mt-1">Cole o link ou ID do YouTube</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL ou ID do YouTube *</label>
                <input type="text" value={newVideoUrl} onChange={e => setNewVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... ou ID"
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-200" />
                {newVideoUrl && (() => {
                  const id = extractYoutubeId(newVideoUrl)
                  return id ? <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} alt="" className="mt-2 w-40 rounded-lg" /> : null
                })()}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input type="text" value={newVideoTitle} onChange={e => setNewVideoTitle(e.target.value)}
                  placeholder="Título do vídeo"
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
                className="flex-1 bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                Adicionar
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
  // Direct ID (11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) return input.trim()
  // URL patterns
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
