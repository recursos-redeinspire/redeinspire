import { useState, useEffect, useCallback } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import {
  Folder, FileText, Video, Headphones, Image, FileSpreadsheet, Presentation,
  File, Download, ChevronRight, Home, Loader2, X, Archive, Search, ArrowLeft,
  LayoutGrid, List, Eye
} from 'lucide-react'

const FOLDER_COLORS = [
  { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500', hover: 'hover:border-amber-300' },
  { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500', hover: 'hover:border-blue-300' },
  { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-500', hover: 'hover:border-green-300' },
  { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-500', hover: 'hover:border-purple-300' },
  { bg: 'bg-pink-50', border: 'border-pink-200', icon: 'text-pink-500', hover: 'hover:border-pink-300' },
  { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500', hover: 'hover:border-red-300' },
  { bg: 'bg-teal-50', border: 'border-teal-200', icon: 'text-teal-500', hover: 'hover:border-teal-300' },
  { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-500', hover: 'hover:border-indigo-300' },
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

export default function MaterialsV4Page() {
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const loadFolder = useCallback(async (p: string) => {
    setLoading(true); setError(''); setIsSearching(false); setSearchKeywords([])
    try {
      const result = await browseDropbox(p)
      setEntries(result.entries); setPath(p)
    } catch (e: any) { setError(e.message || 'Erro') }
    finally { setLoading(false) }
  }, [browseDropbox])

  useEffect(() => { loadFolder('') }, [loadFolder])

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { loadFolder(path); return }
    setLoading(true); setError(''); setIsSearching(true)
    try {
      const result = await smartSearchDropbox(q)
      setEntries(result.entries); setSearchKeywords(result.keywords || [])
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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900">{t('materials.title')}</h1>
        {/* View toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white shadow text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
            <LayoutGrid size={18} />
          </button>
          <button onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch(searchQuery)}
            placeholder={t('materials.searchPlaceholder')}
            className="w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-gray-300 focus:border-gray-900 outline-none" />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); if (isSearching) loadFolder(path) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14} /></button>
          )}
        </div>
        <button onClick={() => doSearch(searchQuery)}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition">Buscar</button>
      </div>

      {/* Breadcrumb */}
      {!isSearching && (
        <div className="flex items-center gap-1.5 mb-5 text-sm flex-wrap">
          {path && (
            <button onClick={() => { const parts = path.split('/'); parts.pop(); loadFolder(parts.join('/')) }}
              className="text-gray-400 hover:text-gray-700 mr-1"><ArrowLeft size={16} /></button>
          )}
          <button onClick={() => loadFolder('')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${!path ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <Home size={14} /> {t('materials.title')}
          </button>
          {breadcrumbs.map((bc, i) => (
            <span key={bc.path} className="flex items-center gap-1.5">
              <ChevronRight size={14} className="text-gray-300" />
              <button onClick={() => loadFolder(bc.path)}
                className={`px-2 py-1 rounded-lg transition ${i === breadcrumbs.length - 1 ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                {bc.name}
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search info */}
      {isSearching && (
        <div className="mb-5">
          <p className="text-sm text-gray-500">Resultados para "<span className="font-medium">{searchQuery}</span>" — {files.length} arquivos
            <button onClick={() => { setSearchQuery(''); setIsSearching(false); loadFolder(path) }}
              className="ml-2 text-red-500 hover:text-red-700 text-xs">Limpar</button>
          </p>
          {searchKeywords.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {searchKeywords.slice(0, 8).map(kw => <span key={kw} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{kw}</span>)}
            </div>
          )}
        </div>
      )}

      {loading && <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-gray-400" /></div>}
      {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 mb-4">{error}</div>}

      {!loading && !error && folders.length === 0 && files.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Folder size={48} className="mx-auto mb-3 text-gray-300" />
          <p>{isSearching ? 'Nenhum resultado encontrado' : t('materials.emptyFolder')}</p>
        </div>
      )}

      {/* Folders */}
      {!loading && folders.length > 0 && (
        <div className="mb-6">
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'
            : 'space-y-2'}>
            {folders.map((folder, i) => {
              const fc = FOLDER_COLORS[i % FOLDER_COLORS.length]
              return viewMode === 'grid' ? (
                <button key={folder.id} onClick={() => loadFolder(folder.path)}
                  className={`flex items-center gap-3 ${fc.bg} border ${fc.border} ${fc.hover} rounded-xl p-4 hover:shadow-md transition text-left group`}>
                  <Folder size={24} className={fc.icon} />
                  <span className="font-medium text-sm text-gray-900 truncate flex-1">{folder.name}</span>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
                </button>
              ) : (
                <button key={folder.id} onClick={() => loadFolder(folder.path)}
                  className="w-full flex items-center gap-3 bg-white border rounded-xl p-3 hover:shadow-sm hover:border-gray-300 transition text-left group">
                  <div className={`w-9 h-9 rounded-lg ${fc.bg} flex items-center justify-center flex-shrink-0`}>
                    <Folder size={18} className={fc.icon} />
                  </div>
                  <span className="font-medium text-sm text-gray-900 truncate flex-1">{folder.name}</span>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Separator */}
      {!loading && folders.length > 0 && files.length > 0 && <div className="border-t mb-4" />}

      {/* Files */}
      {!loading && files.length > 0 && (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {files.map(file => {
              const fc = FILE_ICONS[file.fileType] || FILE_ICONS.other
              return (
                <div key={file.id} onClick={() => handlePreview(file)}
                  className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer group">
                  <div className={`${fc.bg} h-24 flex items-center justify-center relative`}>
                    <FileIcon fileType={file.fileType} size={36} />
                    <span className="absolute top-2 right-2 bg-white/80 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full uppercase">{file.ext}</span>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                      <Eye size={24} className="text-white opacity-0 group-hover:opacity-100 transition drop-shadow" />
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm text-gray-900 line-clamp-2 leading-snug">{file.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{formatSize(file.size)}</span>
                        {file.modified && <span>{new Date(file.modified).toLocaleDateString('pt-BR')}</span>}
                      </div>
                      <button onClick={e => { e.stopPropagation(); handleDownload(file) }}
                        disabled={downloading === file.pathLower}
                        className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition">
                        {downloading === file.pathLower ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                      </button>
                    </div>
                    {isSearching && file.folder && <p className="text-xs text-gray-400 mt-1 truncate">📂 {file.folder}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-1.5">
            {files.map(file => (
              <div key={file.id} className="flex items-center gap-3 bg-white border rounded-xl p-3 hover:shadow-sm transition group">
                <div className={`flex-shrink-0 w-9 h-9 rounded-lg ${(FILE_ICONS[file.fileType] || FILE_ICONS.other).bg} flex items-center justify-center`}>
                  <FileIcon fileType={file.fileType} size={18} />
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handlePreview(file)}>
                  <p className="font-medium text-sm text-gray-900 truncate">{file.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                    <span className="uppercase">{file.ext}</span>
                    <span>{formatSize(file.size)}</span>
                    {file.modified && <span>{new Date(file.modified).toLocaleDateString('pt-BR')}</span>}
                    {isSearching && file.folder && <span className="truncate max-w-[150px]">📂 {file.folder}</span>}
                  </div>
                </div>
                <button onClick={() => handlePreview(file)}
                  className="flex-shrink-0 text-gray-300 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition">
                  <Eye size={16} />
                </button>
                <button onClick={() => handleDownload(file)}
                  disabled={downloading === file.pathLower}
                  className="flex-shrink-0 text-gray-300 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition disabled:opacity-50">
                  {downloading === file.pathLower ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 sm:p-4 border-b">
              <div className="flex items-center gap-3 min-w-0">
                <FileIcon fileType={preview.fileType} size={24} />
                <div className="min-w-0">
                  <h2 className="font-bold text-gray-900 truncate text-sm sm:text-base">{preview.name}</h2>
                  <p className="text-xs text-gray-500">{preview.ext?.toUpperCase()} {preview.size > 0 && `· ${formatSize(preview.size)}`}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {previewUrl && (
                  <a href={previewUrl} download target="_blank" rel="noopener noreferrer"
                    className="bg-gray-900 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center gap-2">
                    <Download size={16} /> <span className="hidden sm:inline">Baixar</span>
                  </a>
                )}
                <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-50 flex items-center justify-center min-h-[250px] sm:min-h-[300px]">
              {previewLoading ? <Loader2 size={32} className="animate-spin text-gray-400" />
              : !previewUrl ? <p className="text-gray-400 text-sm">Preview não disponível</p>
              : preview.fileType === 'image' ? <img src={previewUrl} alt="" className="max-w-full max-h-[60vh] object-contain rounded-lg shadow" />
              : preview.fileType === 'video' ? <video src={previewUrl} controls className="max-w-full max-h-[60vh] rounded-lg shadow" />
              : preview.fileType === 'audio' ? (
                <div className="flex flex-col items-center gap-4 w-full max-w-md">
                  <Headphones size={64} className="text-blue-400" />
                  <p className="font-medium text-gray-700 text-center">{preview.name}</p>
                  <audio src={previewUrl} controls className="w-full" />
                </div>
              )
              : preview.fileType === 'pdf' ? <iframe src={previewUrl} className="w-full h-[60vh] rounded-lg border" title={preview.name} />
              : (
                <div className="flex flex-col items-center gap-4 text-gray-500">
                  <FileIcon fileType={preview.fileType} size={48} />
                  <p className="font-medium text-center">{preview.name}</p>
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
