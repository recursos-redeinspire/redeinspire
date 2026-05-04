import { useState, useEffect, useCallback } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import {
  Folder, FileText, Video, Headphones, Image, FileSpreadsheet, Presentation,
  File, Download, ChevronRight, Home, Loader2, X, Archive, Search, ArrowLeft
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

export default function MaterialsPreviewPage() {
  const { browseDropbox, downloadDropbox, smartSearchDropbox } = useData()
  const { user: _user } = useAuth()
  const { t } = useI18n()

  const [path, setPath] = useState('')
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchKeywords, setSearchKeywords] = useState<string[]>([])

  // Preview state
  const [selectedFile, setSelectedFile] = useState<any | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)

  const loadFolder = useCallback(async (p: string) => {
    setLoading(true); setError(''); setIsSearching(false); setSearchKeywords([])
    setSelectedFile(null); setPreviewUrl('')
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
    setSelectedFile(null); setPreviewUrl('')
    try {
      const result = await smartSearchDropbox(q)
      setEntries(result.entries); setSearchKeywords(result.keywords || [])
    } catch (e: any) { setError(e.message || 'Erro') }
    finally { setLoading(false) }
  }, [smartSearchDropbox, loadFolder, path])

  const handlePreview = async (file: any) => {
    setSelectedFile(file); setPreviewUrl(''); setPreviewLoading(true)
    try { const r = await downloadDropbox(file.pathLower); setPreviewUrl(r.url) }
    catch { setPreviewUrl('') }
    finally { setPreviewLoading(false) }
  }

  const handleDownload = async (file: any) => {
    setDownloading(file.pathLower)
    try { const r = await downloadDropbox(file.pathLower); window.open(r.url, '_blank') }
    catch { alert('Erro ao baixar') }
    finally { setDownloading(null) }
  }

  const breadcrumbs = path ? path.split('/').filter(Boolean).map((part, i, arr) => ({
    name: part, path: '/' + arr.slice(0, i + 1).join('/'),
  })) : []

  const folders = entries.filter(e => e.tag === 'folder')
  const files = entries.filter(e => e.tag === 'file')

  // Determine if we should show the split preview layout
  // (when there are files and no folders, or when searching)
  const showSplitView = (folders.length === 0 && files.length > 0) || isSearching

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('materials.title')}</h1>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch(searchQuery)}
            placeholder={t('materials.searchPlaceholder')}
            className="w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-gray-300 focus:border-gray-900 outline-none" />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); if (isSearching) loadFolder(path) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14} /></button>
          )}
        </div>
        <button onClick={() => doSearch(searchQuery)}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
          {t('catalog.searchBtn')}
        </button>
      </div>

      {/* Breadcrumb */}
      {!isSearching && (
        <div className="flex items-center gap-1 mb-5 text-sm flex-wrap bg-white border rounded-lg px-4 py-3">
          {path && (
            <button onClick={() => { const parts = path.split('/'); parts.pop(); loadFolder(parts.join('/')) }}
              className="text-gray-400 hover:text-gray-700 mr-2"><ArrowLeft size={16} /></button>
          )}
          <button onClick={() => loadFolder('')} className={`flex items-center gap-1 hover:text-gray-900 transition ${!path ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
            <Home size={15} /> {t('materials.title')}
          </button>
          {breadcrumbs.map((bc, i) => (
            <span key={bc.path} className="flex items-center gap-1">
              <ChevronRight size={14} className="text-gray-300" />
              <button onClick={() => loadFolder(bc.path)}
                className={`hover:text-gray-900 transition ${i === breadcrumbs.length - 1 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>{bc.name}</button>
            </span>
          ))}
          <span className="ml-auto text-xs text-gray-400">
            {folders.length > 0 && `${folders.length} ${t('materials.folders')}`}
            {folders.length > 0 && files.length > 0 && ' · '}
            {files.length > 0 && `${files.length} ${t('materials.files')}`}
          </span>
        </div>
      )}

      {/* Search info */}
      {isSearching && (
        <div className="mb-4">
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

      {/* Loading */}
      {loading && <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-gray-400" /></div>}
      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 mb-4">{error}</div>}

      {/* Empty */}
      {!loading && !error && folders.length === 0 && files.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Folder size={48} className="mx-auto mb-3 text-gray-300" />
          <p>{isSearching ? 'Nenhum resultado encontrado' : t('materials.emptyFolder')}</p>
        </div>
      )}

      {/* Folders grid (when there are subfolders) */}
      {!loading && folders.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {folders.map(folder => (
              <button key={folder.id} onClick={() => loadFolder(folder.path)}
                className="flex items-center gap-3 bg-white border rounded-xl p-4 hover:shadow-md hover:border-gray-300 transition text-left group">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Folder size={22} className="text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{folder.name}</p>
                  <p className="text-xs text-gray-400">{t('materials.folder')}</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
              </button>
            ))}
          </div>
          {/* If there are also files, show them in normal list below */}
          {files.length > 0 && (
            <>
              <div className="border-t my-4" />
              <div className="space-y-2">
                {files.map(file => (
                  <div key={file.id} className="flex items-center gap-3 bg-white border rounded-xl p-3 hover:shadow-sm transition group">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${(FILE_ICONS[file.fileType] || FILE_ICONS.other).bg} flex items-center justify-center`}>
                      <FileIcon fileType={file.fileType} size={20} />
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handlePreview(file)}>
                      <p className="font-medium text-sm text-gray-900 truncate">{file.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                        <span className="uppercase">{file.ext}</span>
                        <span>{formatSize(file.size)}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDownload(file)} disabled={downloading === file.pathLower}
                      className="text-gray-400 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition">
                      {downloading === file.pathLower ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SPLIT VIEW: Preview left + File list right
          (shown when folder has only files, no subfolders)
         ═══════════════════════════════════════════════════════════════════ */}
      {!loading && showSplitView && folders.length === 0 && (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left: Preview area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white border rounded-xl overflow-hidden min-h-[400px] lg:min-h-[500px] flex items-center justify-center">
              {!selectedFile && (
                <div className="text-center text-gray-400 p-8">
                  <File size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Selecione um arquivo para visualizar</p>
                </div>
              )}
              {selectedFile && previewLoading && (
                <Loader2 size={32} className="animate-spin text-gray-400" />
              )}
              {selectedFile && !previewLoading && !previewUrl && (
                <div className="text-center text-gray-400 p-8">
                  <FileIcon fileType={selectedFile.fileType} size={48} />
                  <p className="text-sm mt-3">Preview não disponível</p>
                  <button onClick={() => handleDownload(selectedFile)}
                    className="mt-4 bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 inline-flex items-center gap-2">
                    <Download size={16} /> Baixar arquivo
                  </button>
                </div>
              )}
              {selectedFile && !previewLoading && previewUrl && (
                <div className="w-full h-full flex flex-col">
                  {/* File title bar */}
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileIcon fileType={selectedFile.fileType} size={18} />
                      <span className="font-medium text-sm text-gray-900 truncate">{selectedFile.name}</span>
                      <span className="text-xs text-gray-400">{formatSize(selectedFile.size)}</span>
                    </div>
                    <a href={previewUrl} download target="_blank" rel="noopener noreferrer"
                      className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-800 flex items-center gap-1.5 flex-shrink-0">
                      <Download size={14} /> Baixar
                    </a>
                  </div>
                  {/* Preview content */}
                  <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
                    {selectedFile.fileType === 'image' ? (
                      <img src={previewUrl} alt={selectedFile.name} className="max-w-full max-h-[450px] object-contain rounded-lg shadow" />
                    ) : selectedFile.fileType === 'video' ? (
                      <video src={previewUrl} controls className="max-w-full max-h-[450px] rounded-lg shadow" />
                    ) : selectedFile.fileType === 'audio' ? (
                      <div className="flex flex-col items-center gap-4 w-full max-w-md">
                        <Headphones size={64} className="text-blue-400" />
                        <p className="font-medium text-gray-700 text-center">{selectedFile.name}</p>
                        <audio src={previewUrl} controls className="w-full" />
                      </div>
                    ) : selectedFile.fileType === 'pdf' ? (
                      <iframe src={previewUrl} className="w-full h-[450px] rounded-lg border" title={selectedFile.name} />
                    ) : (
                      <div className="text-center text-gray-500">
                        <FileIcon fileType={selectedFile.fileType} size={48} />
                        <p className="font-medium mt-3">{selectedFile.name}</p>
                        <p className="text-sm text-gray-400 mt-1">Clique em "Baixar" para abrir este arquivo</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: File list as buttons */}
          <div className="lg:w-72 xl:w-80 flex-shrink-0">
            <div className="bg-white border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50">
                <p className="text-sm font-semibold text-gray-700">{files.length} {t('materials.files')}</p>
              </div>
              <div className="max-h-[500px] overflow-y-auto divide-y">
                {files.map(file => {
                  const isActive = selectedFile?.id === file.id
                  return (
                    <button key={file.id} onClick={() => handlePreview(file)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${isActive ? 'bg-gray-900 text-white' : 'hover:bg-gray-50'}`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-white/20' : (FILE_ICONS[file.fileType] || FILE_ICONS.other).bg}`}>
                        {isActive
                          ? <FileIcon fileType={file.fileType} size={16} />
                          : <FileIcon fileType={file.fileType} size={16} />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>{file.name.replace(/\.[^/.]+$/, '')}</p>
                        <p className={`text-xs mt-0.5 ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
                          {file.ext?.toUpperCase()} · {formatSize(file.size)}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
