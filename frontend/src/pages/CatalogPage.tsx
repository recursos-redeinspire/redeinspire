import { useState, useEffect, useCallback } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import {
  Search, Loader2, Play, ChevronLeft, ChevronRight, X, Lock, Globe, Calendar, Video
} from 'lucide-react'

export default function CatalogPage() {
  const { getYoutubeVideos, searchYoutube } = useData()
  const { user: _user } = useAuth()
  const { t } = useI18n()

  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalResults, setTotalResults] = useState(0)
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [prevPageToken, setPrevPageToken] = useState<string | null>(null)
  const [_currentPageToken, setCurrentPageToken] = useState<string | undefined>(undefined)

  // Search
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [searchNextToken, setSearchNextToken] = useState<string | null>(null)

  // Preview
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null)

  // Filter
  const [privacyFilter, setPrivacyFilter] = useState<'' | 'unlisted' | 'public'>('')

  const loadVideos = useCallback(async (pageToken?: string) => {
    setLoading(true)
    setError('')
    try {
      const result = await getYoutubeVideos(pageToken, 20)
      setVideos(result.videos)
      setTotalResults(result.totalResults)
      setNextPageToken(result.nextPageToken)
      setPrevPageToken(result.prevPageToken)
      setCurrentPageToken(pageToken)
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar vídeos')
    } finally {
      setLoading(false)
    }
  }, [getYoutubeVideos])

  const doSearch = useCallback(async (q: string, pageToken?: string) => {
    if (!q.trim()) { setActiveSearch(''); loadVideos(); return }
    setLoading(true)
    setError('')
    try {
      const result = await searchYoutube(q, pageToken)
      setVideos(result.videos)
      setTotalResults(result.totalResults)
      setSearchNextToken(result.nextPageToken)
      setActiveSearch(q)
    } catch (e: any) {
      setError(e.message || 'Erro na busca')
    } finally {
      setLoading(false)
    }
  }, [searchYoutube, loadVideos])

  useEffect(() => { loadVideos() }, [loadVideos])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      doSearch(searchQuery)
    } else {
      setActiveSearch('')
      loadVideos()
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setActiveSearch('')
    loadVideos()
  }

  // Apply local privacy filter
  const filteredVideos = privacyFilter
    ? videos.filter(v => v.privacy === privacyFilter)
    : videos

  const formatDate = (iso: string) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('catalog.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{totalResults} {t('catalog.videosAvailable')}</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder={t('catalog.searchPlaceholder')}
            className="w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-gray-300 focus:border-gray-900 outline-none"
          />
          {searchQuery && (
            <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        <button onClick={handleSearch} className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
          {t('catalog.searchBtn')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap items-center">
        <button onClick={() => setPrivacyFilter('')}
          className={`px-3 py-1.5 rounded-full text-sm transition ${!privacyFilter ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          {t('catalog.allVideos')}
        </button>
        <button onClick={() => setPrivacyFilter('unlisted')}
          className={`px-3 py-1.5 rounded-full text-sm transition flex items-center gap-1 ${privacyFilter === 'unlisted' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          <Lock size={12} /> {t('catalog.unlisted')}
        </button>
        <button onClick={() => setPrivacyFilter('public')}
          className={`px-3 py-1.5 rounded-full text-sm transition flex items-center gap-1 ${privacyFilter === 'public' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          <Globe size={12} /> {t('catalog.public')}
        </button>
        {activeSearch && (
          <span className="text-sm text-gray-500 ml-2">
            {t('catalog.resultsFor')} "<span className="font-medium">{activeSearch}</span>"
            <button onClick={clearSearch} className="ml-2 text-red-500 hover:text-red-700 text-xs">{t('catalog.clearSearch')}</button>
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      )}

      {/* Empty */}
      {!loading && filteredVideos.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Video size={48} className="mx-auto mb-3 text-gray-300" />
          <p>{t('catalog.noVideos')}</p>
        </div>
      )}

      {/* Video grid */}
      {!loading && filteredVideos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVideos.map(video => (
            <div
              key={video.id}
              onClick={() => setSelectedVideo(video)}
              className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer group"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-100">
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video size={32} className="text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                  <Play size={40} className="text-white opacity-0 group-hover:opacity-100 transition drop-shadow-lg" fill="white" />
                </div>
                {/* Privacy badge */}
                <div className="absolute top-2 right-2">
                  {video.privacy === 'unlisted' ? (
                    <span className="bg-yellow-500/90 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><Lock size={10} /> {t('catalog.unlisted')}</span>
                  ) : video.privacy === 'public' ? (
                    <span className="bg-green-500/90 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><Globe size={10} /> {t('catalog.public')}</span>
                  ) : null}
                </div>
              </div>
              {/* Info */}
              <div className="p-3">
                <h3 className="font-medium text-sm text-gray-900 line-clamp-2 leading-snug">{video.title}</h3>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <Calendar size={12} />
                  <span>{formatDate(video.publishedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !activeSearch && (prevPageToken || nextPageToken) && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => prevPageToken && loadVideos(prevPageToken)}
            disabled={!prevPageToken}
            className="flex items-center gap-1 px-4 py-2 border rounded-lg text-sm disabled:opacity-30 hover:bg-gray-50 transition"
          >
            <ChevronLeft size={16} /> {t('catalog.prev')}
          </button>
          <span className="text-sm text-gray-500">{totalResults} {t('catalog.totalVideos')}</span>
          <button
            onClick={() => nextPageToken && loadVideos(nextPageToken)}
            disabled={!nextPageToken}
            className="flex items-center gap-1 px-4 py-2 border rounded-lg text-sm disabled:opacity-30 hover:bg-gray-50 transition"
          >
            {t('catalog.next')} <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Search pagination */}
      {!loading && activeSearch && searchNextToken && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => doSearch(activeSearch, searchNextToken)}
            className="flex items-center gap-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition"
          >
            {t('catalog.loadMore')} <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedVideo(null)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-gray-900 truncate">{selectedVideo.title}</h2>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                  <Calendar size={12} /> {formatDate(selectedVideo.publishedAt)}
                  {selectedVideo.privacy === 'unlisted' && <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Lock size={10} /> {t('catalog.unlisted')}</span>}
                </p>
              </div>
              <button onClick={() => setSelectedVideo(null)} className="text-gray-400 hover:text-gray-600 p-1 ml-4"><X size={20} /></button>
            </div>
            {/* YouTube embed */}
            <div className="aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {selectedVideo.description && (
              <div className="p-4 max-h-40 overflow-y-auto border-t">
                <p className="text-sm text-gray-600 whitespace-pre-line">{selectedVideo.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
