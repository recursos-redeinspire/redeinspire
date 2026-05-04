import { useState, useEffect, useCallback } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import {
  Folder, FileText, Video, Headphones, Image, FileSpreadsheet, Presentation,
  File, Download, ChevronRight, Home, Loader2, X, Archive, Search, ArrowLeft
} from 'lucide-react'

const FOLDER_COLORS = [
  'bg-amber-100 text-amber-600', 'bg-blue-100 text-blue-600', 'bg-green-100 text-green-600',
  'bg-purple-100 text-purple-600', 'bg-pink-100 text-pink-600', 'bg-red-100 text-red-600',
  'bg-teal-100 text-teal-600', 'bg-indigo-100 text-indigo-600', 'bg-orange-100 text-orange-600',
  'bg-cyan-100 text-cyan-600',
]

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

export default function MaterialsV3Page() {
  const { browseDropbox, downloadDropbox, smartSearchDropbox } = useData()
  const { user: _user } = useAuth()
  const { t } = useI18n()

  const [path, setPath] = useState('')
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState<string | null>(null)
  const [preview, setPreview] = useState<any | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchKeywords, setSearchKeywords] = useState<string[]>([])

  // Sidebar tree
  const [sidebarFolders, setSidebarFolders] = useState<any[]>([])

  const loadFolder = useCallback(async (p: string) => {
    setLoading(true); setError(''); setIsSearching(false); setSearchKeywords([])
    try {
      const result = await browseDropbox(p)
      setEntries(result.entries)
      setPath(p)
      // Load root folders for sidebar on first load
      if (p === '' && sidebarFolders.length === 0) {
        setSidebarFolders(result.entries.filter((e: any) => e.tag === 'folder'))
      }
    } catch (e: any) { setError(e.message || 'Erro') }
    finally { setLoading(false) }
  }, [browseDropbox, sidebarFolders.length])

  useEffect(() => { loadFolder('') }, [loadFolder])

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { loadFolder(path); return }
    setLoading(true); setError(''); setIsSearching(true)
    try {
      const result = await smartSearchDropbox(q)
      setEntries(result.entries)
      setSearchKeywords(result.keywords || [])
    } catch (e: any) { setError(e.message || 'Erro') }
    finally { setLoading(false) }
  }, [smartSearchDropbox, loadFolder, path])

  const handleDownload = async (file: any) => {
    setDownloading(file.pathLower)
    try { const r = await downloadDropbox(file.pathLower); window.open(r.url, '_blank') }
    catch { alert('Erro ao baixar') }
    finally { setDownloading(null) }
  }

  const handlePreview = async (file: any) => {
    setPreview(file); setPreviewUrl(''); setPreviewLoading(true)
    try { const r = await downloadDropbox(file.pathLower); setPreviewUrl(r.url) }
    catch { setPreviewUrl('') }
    finally { setPreviewLoading(false) }
  }

  const breadcrumbs = path ? path.split('/').filter(Boolean).map((part, i, arr) => ({
    name: part, path: '/' + arr.slice(0, i + 1).join('/'),
  })) : []

  const folders = entries.filter(e => e.tag === 'folder')
  const files = entries.filter(e => e.tag === 'file')

  return (
    <div className="flex gap-0 -mx-4 md:-mx-6 lg:-mx-8 -mt-4 md:-mt-6 lg:-mt-8 min-h-[calc(100vh-8rem)]">
      {/* Sidebar - folder tree (desktop only) */}
      <aside className="hidden lg:block w-56 flex-shrink-0 bg-white border-r overflow-y-auto p-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">{t('materials.title')}</p>
        <button onClick={() => loadFolder('')}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition ${!path && !isSearching ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}>
          <Home size={15} /> Início
        </button>
        <div className="mt-1 space-y-0.5">
          {sidebarFolders.map((f, i) => (
            <button key={f.id} onClick={() => loadFolder(f.path)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition truncate ${path === f.path ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Folder size={14} className={FOLDER_COLORS[i % FOLDER_COLORS.length].split(' ')[1]} />
              <span className="truncate">{f.name}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">
        {/* Header + Search */}
        <div className="flex items-center gap-3 mb-5">
          {path && !isSearching && (
            <button onClick={() => { const parts = path.split('/'); parts.pop(); loadFolder(parts.join('/')) }}
              className="text-gray-400 hover:text-gray-700 flex-shrink-0"><ArrowLeft size={20} /></button>
          )}
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch(searchQuery)}
              placeholder={t('materials.searchPlaceholder')}
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-gray-300 focus:bg-white outline-none transition" />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); if (isSearching) loadFolder(path) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14} /></button>
            )}
          </div>
        </div>

        {/* Breadcrumb */}
        {!isSearching && (
          <div className="flex items-center gap-1 mb-5 text-sm text-gray-500 flex-wrap">
            <button onClick={() => loadFolder('')} className={`hover:text-gray-900 ${!path ? 'text-gray-900 font-semibold' : ''}`}>
              {t('materials.title')}
            </button>
            {breadcrumbs.map((bc, i) => (
              <span key={bc.path} className="flex items-center gap-1">
                <ChevronRight size={14} className="text-gray-300" />
                <button onClick={() => loadFolder(bc.path)}
                  className={`hover:text-gray-900 ${i === breadcrumbs.length - 1 ? 'text-gray-900 font-semibold' : ''}`}>{bc.name}</button>
              </span>
            ))}
          </div>
        )}

        {/* Search info */}
        {isSearching && (
          <div className="mb-5">
            <p className="text-sm text-gray-500">Resultados para "<span className="font-medium">{searchQuery}</span>" — {files.length} arquivos</p>
            {searchKeywords.length > 0 && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {searchKeywords.slice(0, 8).map(kw => <span key={kw} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{kw}</span>)}
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-gray-400" /></div>}

        {/* Error */}
        {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 mb-4">{error}</div>}

        {/* Empty */}
        {!loading && !error && folders.length === 0 && files.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Folder size={48} className="mx-auto mb-3 text-gray-300" />
            <p>{isSearching ? 'Nenhum resultado encontrado' : t('materials.emptyFolder')}</p>
          </div>
        )}

        {/* Folders - large visual cards */}
        {!loading && folders.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{folders.length} {t('materials.folders')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {folders.map((folder, i) => {
                const colorClass = FOLDER_COLORS[i % FOLDER_COLORS.length]
                return (
                  <button key={folder.id} onClick={() => loadFolder(folder.path)}
                    className="flex flex-col items-center gap-2 bg-white border rounded-2xl p-5 hover:shadow-lg hover:border-gray-300 transition text-center group">
                    <div className={`w-14 h-14 rounded-2xl ${colorClass.split(' ')[0]} flex items-center justify-center group-hover:scale-110 transition`}>
                      <Folder size={28} className={colorClass.split(' ')[1]} />
                    </div>
                    <p className="font-medium text-sm text-gray-900 line-clamp-2 leading-snug">{folder.name}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Files - grid with thumbnails */}
        {!loading && files.length > 0 && (
          <div>
            {folders.length > 0 && <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{files.length} {t('materials.files')}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {files.map(file => {
                const fc = FILE_ICONS[file.fileType] || FILE_ICONS.other
                return (
                  <div key={file.id}
                    className="bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition group cursor-pointer"
                    onClick={() => handlePreview(file)}>
                    {/* File visual header */}
                    <div className={`${fc.bg} h-28 flex items-center justify-center relative`}>
                      <FileIcon fileType={file.fileType} size={40} />
                      <span className="absolute top-2 right-2 bg-white/80 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full uppercase">{file.ext}</span>
                    </div>
                    {/* File info */}
                    <div className="p-3">
                      <p className="font-medium text-sm text-gray-900 line-clamp-2 leading-snug">{file.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">{formatSize(file.size)}</span>
                        <button onClick={e => { e.stopPropagation(); handleDownload(file) }}
                          disabled={downloading === file.pathLower}
                          className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition">
                          {downloading === file.pathLower ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        </button>
                      </div>
                      {isSearching && file.folder && (
                        <p className="text-xs text-gray-400 mt-1 truncate" title={file.folder}>📂 {file.folder}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3 min-w-0">
                <FileIcon fileType={preview.fileType} size={24} />
                <div className="min-w-0">
                  <h2 className="font-bold text-gray-900 truncate">{preview.name}</h2>
                  <p className="text-xs text-gray-500">{preview.ext?.toUpperCase()} {preview.size > 0 && `· ${formatSize(preview.size)}`}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {previewUrl && (
                  <a href={previewUrl} download target="_blank" rel="noopener noreferrer"
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center gap-2">
                    <Download size={16} /> Baixar
                  </a>
                )}
                <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-50 flex items-center justify-center min-h-[300px]">
              {previewLoading ? <Loader2 size={32} className="animate-spin text-gray-400" />
              : !previewUrl ? <p className="text-gray-400 text-sm">Preview não disponível</p>
              : preview.fileType === 'image' ? <img src={previewUrl} alt="" className="max-w-full max-h-[60vh] object-contain rounded-lg shadow" />
              : preview.fileType === 'video' ? <video src={previewUrl} controls className="max-w-full max-h-[60vh] rounded-lg shadow" />
              : preview.fileType === 'audio' ? (
                <div className="flex flex-col items-center gap-4 w-full max-w-md">
                  <Headphones size={64} className="text-blue-400" />
                  <p className="font-medium text-gray-700">{preview.name}</p>
                  <audio src={previewUrl} controls className="w-full" />
                </div>
              )
              : preview.fileType === 'pdf' ? <iframe src={previewUrl} className="w-full h-[60vh] rounded-lg border" title={preview.name} />
              : (
                <div className="flex flex-col items-center gap-4 text-gray-500">
                  <FileIcon fileType={preview.fileType} size={48} />
                  <p className="font-medium">{preview.name}</p>
                  <a href={previewUrl} download target="_blank" rel="noopener noreferrer"
                    className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center gap-2">
                    <Download size={16} /> Baixar
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
