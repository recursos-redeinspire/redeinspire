import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { useI18n } from '../i18n/I18nContext'

export default function ContentPlayerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getContentById, recordContentAccess } = useData()
  const { t } = useI18n()
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getContentById(id)
      .then(c => {
        if (c) { setContent(c); recordContentAccess(id) }
        else setError(t('player.notFound'))
      })
      .catch(() => setError(t('player.loadError')))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
    </div>
  )

  if (error || !content) return (
    <div className="text-center py-20">
      <p className="text-gray-500 text-lg">{error || t('player.notFound')}</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-gray-900 hover:underline text-sm">{t('player.back')}</button>
    </div>
  )

  const contentUrl = content.contentUrl || ''
  const isYouTube = /youtube\.com|youtu\.be/.test(contentUrl)
  const youtubeEmbedUrl = isYouTube ? getYouTubeEmbed(contentUrl) : ''

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="mb-4 text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
        {t('player.back')}
      </button>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Player area */}
        <div className="bg-black">
          {content.type === 'video' && contentUrl && (
            isYouTube ? (
              <div className="aspect-video">
                <iframe
                  src={youtubeEmbedUrl}
                  title={content.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="aspect-video">
                <video controls className="w-full h-full" src={contentUrl}>
                  {t('player.videoNotSupported')}
                </video>
              </div>
            )
          )}

          {content.type === 'audio' && contentUrl && (
            <div className="flex flex-col items-center justify-center py-16 px-8 gap-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-6xl shadow-lg">
                🎧
              </div>
              <audio controls className="w-full max-w-lg" src={contentUrl}>
                {t('player.audioNotSupported')}
              </audio>
            </div>
          )}

          {content.type === 'document' && contentUrl && (
            <div className="aspect-[4/3]">
              <iframe src={contentUrl} title={content.title} className="w-full h-full bg-white" />
            </div>
          )}

          {!contentUrl && (
            <div className="aspect-video flex items-center justify-center text-gray-400">
              <div className="text-center">
                <span className="text-6xl block mb-4">
                  {content.type === 'video' ? '🎬' : content.type === 'audio' ? '🎧' : '📄'}
                </span>
                <p className="text-sm">{t('player.noUrl')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{content.title}</h1>
              {content.createdByName && (
                <p className="text-sm text-gray-500 mt-1">{t('player.by')} {content.createdByName}</p>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
              <span className="capitalize bg-gray-100 px-2 py-1 rounded">{content.type}</span>
              {content.durationMinutes > 0 && <span>{content.durationMinutes} min</span>}
            </div>
          </div>

          {content.description && (
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">{content.description}</p>
          )}

          <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
            {content.views > 0 && <span>👁 {content.views} {t('player.views')}</span>}
            {content.createdAt && <span>📅 {new Date(content.createdAt).toLocaleDateString('pt-BR')}</span>}
            {content.categorySlug && <span className="bg-gray-50 text-gray-900 px-2 py-0.5 rounded">{content.categorySlug}</span>}
          </div>

          {contentUrl && (
            <div className="mt-6 pt-4 border-t">
              <a href={contentUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-900 hover:text-gray-700">
                {t('player.openNewTab')}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getYouTubeEmbed(url: string): string {
  let videoId = ''
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) {
      videoId = u.pathname.slice(1)
    } else {
      videoId = u.searchParams.get('v') || ''
    }
  } catch {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    videoId = match?.[1] || ''
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url
}
