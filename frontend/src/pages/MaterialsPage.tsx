import { useState, useEffect, useCallback } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import {
  Folder, FileText, Video, Headphones, Image, FileSpreadsheet, Presentation,
  File, Download, ChevronRight, Home, Loader2, X, Archive, ArrowLeft, Search, SlidersHorizontal
} from 'lucide-react'

const FILE_TYPE_ICONS: Record<string, { icon: typeof File; color: string }> = {
  video: { icon: Video, color: 'text-purple-500' },
  audio: { icon: Headphones, color: 'text-blue-500' },
  pdf: { icon: FileText, color: 'text-red-500' },
  document: { icon: FileText, color: 'text-blue-600' },
  presentation: { icon: Presentation, color: 'text-orange-500' },
  spreadsheet: { icon: FileSpreadsheet, color: 'text-emerald-600' },
  image: { icon: Image, color: 'text-green-500' },
  archive: { icon: Archive, color: 'text-yellow-600' },
  other: { icon: File, color: 'text-gray-500' },
}

function formatSize(bytes: number) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

function FileIcon({ fileType, size = 20 }: { fileType: string; size?: number }) {
  const config = FILE_TYPE_ICONS[fileType] || FILE_TYPE_ICONS.other
  const Icon = config.icon
  return <Icon size={size} className={config.color} />
}

export default function MaterialsPage() {
  const { browseDropbox, downloadDropbox } = useData()
  const { user: _user } = useAuth()
  const { t } = useI18n()

  const [currentPath, setCurrentPath] = useState('')
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState<string | null>(null)
  const [previewFile, setPreviewFile] = useState<any | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)

  // Search & filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name')
  const [showFilters, setShowFilters] = useState(false)

  const loadFolder = useCallback(async (path: string) => {
    setLoading(true)
    setError('')
    setSearchQuery('')
    setFilterType('')
    try {
      const result = await browseDropbox(path)
      setEntries(result.entries)
      setCurrentPath(path)
    } catch (e: any) {
      setError(e.message || t('materials.errorLoading'))
    } finally {
      setLoading(false)
    }
  }, [browseDropbox, t])

  useEffect(() => { loadFolder('') }, [loadFolder])

  const navigateTo = (path: string) => {
    loadFolder(path)
  }

  const goBack = () => {
    if (!currentPath) return
    const parts = currentPath.split('/')
    parts.pop()
    navigateTo(parts.join('/'))
  }

  const breadcrumbs = currentPath
    ? currentPath.split('/').filter(Boolean).map((part, i, arr) => ({
        name: part,
        path: '/' + arr.slice(0, i + 1).join('/'),
      }))
    : []

  const handleDownload = async (file: any) => {
    setDownloading(file.pathLower)
    try {
      const result = await downloadDropbox(file.pathLower)
      window.open(result.url, '_blank')
    } catch {
      alert(t('materials.downloadError'))
    } finally {
      setDownloading(null)
    }
  }

  const handlePreview = async (file: any) => {
    setPreviewFile(file)
    setPreviewUrl('')
    setPreviewLoading(true)
    try {
      const result = await downloadDropbox(file.pathLower)
      setPreviewUrl(result.url)
    } catch {
      setPreviewUrl('')
    } finally {
      setPreviewLoading(false)
    }
  }

  // Apply search and filters
  const query = searchQuery.toLowerCase().trim()
  const allFolders = entries.filter(e => e.tag === 'folder')
  const allFiles = entries.filter(e => e.tag === 'file')

  const filteredFolders = query
    ? allFolders.filter(f => f.name.toLowerCase().includes(query))
    : allFolders

  let filteredFiles = allFiles
  if (query) filteredFiles = filteredFiles.filter(f => f.name.toLowerCase().includes(query))
  if (filterType) filteredFiles = filteredFiles.filter(f => f.fileType === filterType)

  // Sort files
  filteredFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === 'date') return (b.modified || '').localeCompare(a.modified || '')
    if (sortBy === 'size') return (b.size || 0) - (a.size || 0)
    return a.name.localeCompare(b.name)
  })

  // Get unique file types for filter
  const availableTypes = [...new Set(allFiles.map(f => f.fileType))].sort()
  const typeLabels: Record<string, string> = {
    video: 'Vídeo', audio: 'Áudio', pdf: 'PDF', document: 'Documento',
    presentation: 'Apresentação', spreadsheet: 'Planilha', image: 'Imagem',
    archive: 'Arquivo', other: 'Outro',
  }

  const hasActiveFilters = !!query || !!filterType || sortBy !== 'name'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('materials.title')}</h1>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('materials.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-gray-300 focus:border-gray-900 outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm transition ${showFilters || hasActiveFilters ? 'bg-gray-900 text-white border-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
        >
          <SlidersHorizontal size={16} />
          {t('materials.filterLabel')}
          {hasActiveFilters && !showFilters && <span className="w-2 h-2 rounded-full bg-white" />}
        </button>
      </div>

      {/* Filters row */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-4 bg-white border rounded-lg p-3 items-end">
          <div className="min-w-[160px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('materials.fileType')}</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">{t('materials.allTypes')}</option>
              {availableTypes.map(ft => (
                <option key={ft} value={ft}>{typeLabels[ft] || ft}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[160px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('materials.sortByLabel')}</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
              <option value="name">{t('materials.sortName')}</option>
              <option value="date">{t('materials.sortDate')}</option>
              <option value="size">{t('materials.sortSize')}</option>
            </select>
          </div>
          {hasActiveFilters && (
            <button onClick={() => { setSearchQuery(''); setFilterType(''); setSortBy('name') }}
              className="text-sm text-red-600 hover:text-red-800 px-3 py-2">
              {t('materials.clearFilters')}
            </button>
          )}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 mb-6 text-sm flex-wrap bg-white border rounded-lg px-4 py-3">
        {currentPath && (
          <button onClick={goBack} className="text-gray-400 hover:text-gray-700 mr-2 flex items-center gap-1">
            <ArrowLeft size={16} />
          </button>
        )}
        <button onClick={() => navigateTo('')} className={`flex items-center gap-1 hover:text-gray-900 transition ${!currentPath ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
          <Home size={15} />
          <span>{t('materials.title')}</span>
        </button>
        {breadcrumbs.map((bc, i) => (
          <span key={bc.path} className="flex items-center gap-1">
            <ChevronRight size={14} className="text-gray-300" />
            <button
              onClick={() => navigateTo(bc.path)}
              className={`hover:text-gray-900 transition ${i === breadcrumbs.length - 1 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}
            >
              {bc.name}
            </button>
          </span>
        ))}
        <span className="ml-auto text-xs text-gray-400">
          {filteredFolders.length > 0 && `${filteredFolders.length} ${t('materials.folders')}`}
          {filteredFolders.length > 0 && filteredFiles.length > 0 && ' · '}
          {filteredFiles.length > 0 && `${filteredFiles.length} ${t('materials.files')}`}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between">
          {error}
          <button onClick={() => loadFolder(currentPath)} className="text-red-800 font-medium hover:underline">{t('materials.retry')}</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filteredFolders.length === 0 && filteredFiles.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          {query || filterType ? (
            <>
              <Search size={48} className="mx-auto mb-3 text-gray-300" />
              <p>{t('materials.noResults')}</p>
            </>
          ) : (
            <>
              <Folder size={48} className="mx-auto mb-3 text-gray-300" />
              <p>{t('materials.emptyFolder')}</p>
            </>
          )}
        </div>
      )}

      {/* Folders */}
      {!loading && filteredFolders.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredFolders.map(folder => (
              <button
                key={folder.id}
                onClick={() => navigateTo(folder.path)}
                className="flex items-center gap-3 bg-white border rounded-xl p-4 hover:shadow-md hover:border-gray-300 transition text-left group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Folder size={22} className="text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{folder.name}</p>
                  <p className="text-xs text-gray-400">{t('materials.folder')}</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      {!loading && filteredFiles.length > 0 && (
        <div>
          {filteredFolders.length > 0 && <div className="border-t mb-4" />}
          <div className="space-y-2">
            {filteredFiles.map(file => (
              <div
                key={file.id}
                className="flex items-center gap-3 bg-white border rounded-xl p-3 hover:shadow-sm transition group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                  <FileIcon fileType={file.fileType} size={22} />
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handlePreview(file)}>
                  <p className="font-medium text-sm text-gray-900 truncate">{file.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400 uppercase">{file.ext}</span>
                    {file.size > 0 && <span className="text-xs text-gray-400">{formatSize(file.size)}</span>}
                    {file.modified && <span className="text-xs text-gray-300">{new Date(file.modified).toLocaleDateString('pt-BR')}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(file)}
                  disabled={downloading === file.pathLower}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                  title={t('materials.download')}
                >
                  {downloading === file.pathLower ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setPreviewFile(null)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3 min-w-0">
                <FileIcon fileType={previewFile.fileType} size={24} />
                <div className="min-w-0">
                  <h2 className="font-bold text-gray-900 truncate">{previewFile.name}</h2>
                  <p className="text-xs text-gray-500">{previewFile.ext?.toUpperCase()} {previewFile.size > 0 && `· ${formatSize(previewFile.size)}`}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {previewUrl && (
                  <a href={previewUrl} download target="_blank" rel="noopener noreferrer"
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition flex items-center gap-2">
                    <Download size={16} /> {t('materials.download')}
                  </a>
                )}
                <button onClick={() => setPreviewFile(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-50 flex items-center justify-center min-h-[300px]">
              {previewLoading ? (
                <div className="flex flex-col items-center gap-3 text-gray-400">
                  <Loader2 size={32} className="animate-spin" />
                  <p className="text-sm">{t('materials.loadingPreview')}</p>
                </div>
              ) : !previewUrl ? (
                <div className="flex flex-col items-center gap-3 text-gray-400">
                  <FileIcon fileType={previewFile.fileType} size={48} />
                  <p className="text-sm">{t('materials.noPreview')}</p>
                </div>
              ) : previewFile.fileType === 'image' ? (
                <img src={previewUrl} alt={previewFile.name} className="max-w-full max-h-[60vh] object-contain rounded-lg shadow" />
              ) : previewFile.fileType === 'video' ? (
                <video src={previewUrl} controls className="max-w-full max-h-[60vh] rounded-lg shadow" />
              ) : previewFile.fileType === 'audio' ? (
                <div className="flex flex-col items-center gap-4 w-full max-w-md">
                  <Headphones size={64} className="text-blue-400" />
                  <p className="font-medium text-gray-700">{previewFile.name}</p>
                  <audio src={previewUrl} controls className="w-full" />
                </div>
              ) : previewFile.fileType === 'pdf' ? (
                <iframe src={previewUrl} className="w-full h-[60vh] rounded-lg border" title={previewFile.name} />
              ) : (
                <div className="flex flex-col items-center gap-4 text-gray-500">
                  <FileIcon fileType={previewFile.fileType} size={48} />
                  <p className="font-medium">{previewFile.name}</p>
                  <p className="text-sm">{t('materials.clickDownload')}</p>
                  <a href={previewUrl} download target="_blank" rel="noopener noreferrer"
                    className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition flex items-center gap-2">
                    <Download size={16} /> {t('materials.download')}
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
