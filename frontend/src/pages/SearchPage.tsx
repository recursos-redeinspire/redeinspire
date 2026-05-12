import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { useI18n } from '../i18n/I18nContext'
import { Search, Video, FileText, Loader2, Play, Download, FolderOpen } from 'lucide-react'

export default function SearchPage() {
  const { smartSearchYoutube, smartSearchDropbox, downloadDropbox } = useData()
  const navigate = useNavigate()
  const { t } = useI18n()
  const [searchParams] = useSearchParams()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [videoResults, setVideoResults] = useState<any[]>([])
  const [materialResults, setMaterialResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [keywords, setKeywords] = useState<string[]>([])
  const [tab, setTab] = useState<'all' | 'videos' | 'materials'>('all')

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const [videosResult, materialsResult] = await Promise.all([
        smartSearchYoutube(q).catch(() => ({ videos: [], keywords: [] })),
        smartSearchDropbox(q).catch(() => ({ entries: [], keywords: [] })),
      ])
      setVideoResults(videosResult.videos || [])
      setMaterialResults(materialsResult.entries || [])
      setKeywords([...new Set([...(videosResult.keywords || []), ...(materialsResult.keywords || [])])])
    } catch {
      setVideoResults([])
      setMaterialResults([])
    } finally {
      setLoading(false)
    }
  }, [smartSearchYoutube, smartSearchDropbox])

  // Auto-search from URL param
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) { setQuery(q); doSearch(q) }
  }, [searchParams, doSearch])

  const handleSearch = () => { if (query.trim()) doSearch(query) }

  const handleDownload = async (file: any) => {
    try { const r = await downloadDropbox(file.pathLower, 'download'); window.open(r.url, '_blank') }
    catch { /* ignore */ }
  }

  const totalResults = videoResults.length + materialResults.length
  const showVideos = tab === 'all' || tab === 'videos'
  const showMaterials = tab === 'all' || tab === 'materials'

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t('search.title')}</h1>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar vídeos, materiais, treinamentos..."
            className="w-full pl-10 pr-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-gray-300 focus:border-gray-900 outline-none"
          />
        </div>
        <button onClick={handleSearch} className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
          {t('search.button')}
        </button>
      </div>

      {/* Keywords */}
      {keywords.length > 0 && (
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {keywords.slice(0, 8).map(kw => (
            <span key={kw} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{kw}</span>
          ))}
        </div>
      )}

      {/* Tabs */}
      {searched && !loading && totalResults > 0 && (
        <div className="flex gap-3 mb-6 border-b">
          <button onClick={() => setTab('all')} className={`pb-2 px-1 text-sm font-medium ${tab === 'all' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500'}`}>
            Todos ({totalResults})
          </button>
          <button onClick={() => setTab('videos')} className={`pb-2 px-1 text-sm font-medium flex items-center gap-1 ${tab === 'videos' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500'}`}>
            <Video size={14} /> Vídeos ({videoResults.length})
          </button>
          <button onClick={() => setTab('materials')} className={`pb-2 px-1 text-sm font-medium flex items-center gap-1 ${tab === 'materials' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500'}`}>
            <FolderOpen size={14} /> Materiais ({materialResults.length})
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      )}

      {/* No results */}
      {searched && !loading && totalResults === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Search size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-lg">Nenhum resultado para "{query}"</p>
          <p className="text-sm mt-2">Tente outras palavras-chave</p>
        </div>
      )}

      {/* Not searched yet */}
      {!searched && !loading && (
        <div className="text-center py-16 text-gray-400">
          <Search size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-lg">{t('search.typeToSearch')}</p>
        </div>
      )}

      {/* Video results */}
      {!loading && showVideos && videoResults.length > 0 && (
        <div className="mb-8">
          {tab === 'all' && <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Video size={18} /> Vídeos ({videoResults.length})</h2>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {videoResults.map(video => (
              <div key={video.id} onClick={() => navigate(`/catalogo?video=${video.id}`)}
                className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer group">
                <div className="relative aspect-video bg-gray-100">
                  {video.thumbnail && <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                    <Play size={32} className="text-white opacity-0 group-hover:opacity-100 transition" fill="white" />
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm text-gray-900 line-clamp-2">{video.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Material results */}
      {!loading && showMaterials && materialResults.length > 0 && (
        <div>
          {tab === 'all' && <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><FolderOpen size={18} /> Materiais ({materialResults.length})</h2>}
          <div className="space-y-2">
            {materialResults.map((file: any) => (
              <div key={file.id || file.pathLower} className="bg-white border rounded-xl p-3 flex items-center gap-3 hover:shadow-sm transition">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                  <FileText size={20} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => {
                  const folderPath = file.path ? file.path.split('/').slice(0, -1).join('/') : ''
                  navigate(`/materiais?path=${encodeURIComponent(folderPath)}`)
                }}>
                  <p className="font-medium text-sm text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400 truncate">{file.folder || ''}</p>
                </div>
                <button onClick={() => handleDownload(file)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition">
                  <Download size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
