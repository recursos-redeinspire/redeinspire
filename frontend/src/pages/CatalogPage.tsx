import { useState, useEffect, useCallback } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import {
  Search, Loader2, Play, ChevronLeft, ChevronRight, X, Calendar, Video, ArrowLeft, Send, MessageSquare, Tag, Plus
} from 'lucide-react'
import YouTubePlayer from '../components/YouTubePlayer'

function formatDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

// ---- Recommendations Section ----
function RecommendationsSection({ videoId }: { videoId: string }) {
  const { getVideoRecs, addVideoRec, deleteVideoRec } = useData()
  const { user } = useAuth()
  const [items, setItems] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [confirmUrl, setConfirmUrl] = useState('')
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    getVideoRecs(videoId).then(data => setItems(data.items || [])).catch(() => {})
  }, [videoId, getVideoRecs])

  const handleAdd = async (data: any) => {
    const newItem = await addVideoRec(videoId, data)
    setItems(prev => [...prev, newItem])
    setShowAdd(false)
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Remover esta indicação?')) return
    await deleteVideoRec(videoId, itemId)
    setItems(prev => prev.filter(i => i.id !== itemId))
  }

  const handleClick = (item: any) => {
    if (item.type === 'external') {
      setConfirmUrl(item.url)
    } else if (item.type === 'video') {
      window.location.href = `/catalogo`
    } else if (item.type === 'material') {
      window.location.href = `/materiais`
    }
  }

  if (items.length === 0 && !isAdmin) return null

  return (
    <div className="mt-8">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
        📌 Indicações
      </h3>

      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {items.map(item => (
            <div key={item.id} className="relative group bg-white border rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer"
              onClick={() => handleClick(item)}>
              {/* Image */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : item.type === 'video' && item.videoId ? (
                  <img src={`https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-300 text-4xl">
                    {item.type === 'external' ? '🔗' : item.type === 'video' ? '▶' : '📁'}
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="p-2.5">
                <p className="font-medium text-xs text-gray-900 line-clamp-2">{item.title}</p>
                {item.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>}
                <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full ${
                  item.type === 'external' ? 'bg-blue-50 text-blue-600' :
                  item.type === 'video' ? 'bg-purple-50 text-purple-600' :
                  'bg-amber-50 text-amber-600'
                }`}>
                  {item.type === 'external' ? '🔗 Externo' : item.type === 'video' ? '▶ Vídeo' : '📁 Material'}
                </span>
              </div>
              {/* Admin delete */}
              {isAdmin && (
                <button onClick={e => { e.stopPropagation(); handleDelete(item.id) }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Admin add button */}
      {isAdmin && (
        <button onClick={() => setShowAdd(true)}
          className="text-sm text-gray-500 hover:text-gray-900 border border-dashed border-gray-300 rounded-xl px-4 py-3 w-full flex items-center justify-center gap-2 hover:border-gray-400 transition">
          <Plus size={16} /> Adicionar indicação
        </button>
      )}

      {/* Add modal */}
      {showAdd && <AddRecommendationModal onClose={() => setShowAdd(false)} onSave={handleAdd} />}

      {/* External link confirmation */}
      {confirmUrl && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setConfirmUrl('')}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <p className="text-lg font-semibold text-gray-900 mb-2">Redirecionamento externo</p>
            <p className="text-sm text-gray-600 mb-4">Você será redirecionado para um site externo. Deseja continuar?</p>
            <p className="text-xs text-gray-400 mb-4 truncate">{confirmUrl}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmUrl('')} className="flex-1 border rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={() => { window.open(confirmUrl, '_blank'); setConfirmUrl('') }}
                className="flex-1 bg-gray-900 text-white rounded-lg py-2 text-sm hover:bg-gray-800">Continuar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Add Recommendation Modal ----
function AddRecommendationModal({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => void }) {
  const [type, setType] = useState<'external' | 'video' | 'material'>('external')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [linkedVideoId, setLinkedVideoId] = useState('')
  const [materialPath, setMaterialPath] = useState('')
  const [saving, setSaving] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImageUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSave({ type, title: title.trim(), description: description.trim(), url, imageUrl, linkedVideoId, materialPath })
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">Adicionar Indicação</h2>
        </div>
        <div className="p-6 space-y-4">
          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <div className="flex gap-2">
              {[
                { value: 'external', label: '🔗 Link Externo' },
                { value: 'video', label: '▶ Vídeo do Catálogo' },
                { value: 'material', label: '📁 Material' },
              ].map(opt => (
                <button key={opt.value} onClick={() => setType(opt.value as any)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${type === opt.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300" placeholder="Nome da indicação" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300" placeholder="Breve descrição" />
          </div>

          {/* External URL */}
          {type === 'external' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL externa *</label>
              <input type="url" value={url} onChange={e => setUrl(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300" placeholder="https://..." />
            </div>
          )}

          {/* Video ID */}
          {type === 'video' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID do vídeo do YouTube *</label>
              <input type="text" value={linkedVideoId} onChange={e => setLinkedVideoId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300" placeholder="Ex: dQw4w9WgXcQ" />
              {linkedVideoId && (
                <img src={`https://img.youtube.com/vi/${linkedVideoId}/mqdefault.jpg`} alt="Preview" className="mt-2 w-32 rounded-lg" />
              )}
            </div>
          )}

          {/* Material path */}
          {type === 'material' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Caminho da pasta</label>
              <input type="text" value={materialPath} onChange={e => setMaterialPath(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300" placeholder="/Mensagens - Avulsas/2024" />
            </div>
          )}

          {/* Image upload (for external and material) */}
          {(type === 'external' || type === 'material') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagem (quadrada)</label>
              <input type="file" accept="image/*" onChange={handleImageUpload}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
              {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-lg border" />}
            </div>
          )}
        </div>

        <div className="p-6 border-t flex gap-3">
          <button onClick={onClose} className="flex-1 border rounded-lg py-2.5 text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} disabled={!title.trim() || saving}
            className="flex-1 bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Video Player Page (YouTube-style layout) ----
function VideoPlayerView({ video, videos, onBack, onSelectVideo }: {
  video: any; videos: any[]; onBack: () => void; onSelectVideo: (v: any) => void
}) {
  const { getComments, addComment, getVideoTags, saveVideoTags } = useData()
  const { user } = useAuth()
  const { t } = useI18n()
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')
  const [sending, setSending] = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)

  // Tags
  const [tags, setTags] = useState<string[]>([])
  const [showTagEditor, setShowTagEditor] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const isAdmin = user?.role === 'admin'

  const suggestions = videos.filter(v => v.id !== video.id).slice(0, 10)

  useEffect(() => {
    getComments(video.id).then(setComments).catch(() => {})
    getVideoTags(video.id).then(data => setTags(data.tags || [])).catch(() => {})
  }, [video.id, getComments, getVideoTags])

  const handleSubmitComment = async () => {
    if (!commentText.trim() || sending) return
    setSending(true)
    try {
      const newComment = await addComment(video.id, video.title, commentText)
      setComments(prev => [newComment, ...prev])
      setCommentText('')
    } catch { /* ignore */ }
    finally { setSending(false) }
  }

  const handleAddTag = async () => {
    const newTag = tagInput.trim().toLowerCase()
    if (!newTag || tags.includes(newTag)) { setTagInput(''); return }
    const updated = [...tags, newTag]
    setTags(updated)
    setTagInput('')
    await saveVideoTags(video.id, updated)
  }

  const handleRemoveTag = async (tag: string) => {
    const updated = tags.filter(t => t !== tag)
    setTags(updated)
    await saveVideoTags(video.id, updated)
  }

  const initials = (name: string) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  const descriptionShort = video.description?.substring(0, 200) || ''
  const hasLongDesc = (video.description?.length || 0) > 200

  return (
    <div>
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition">
        <ArrowLeft size={16} /> {t('catalog.backToCatalog')}
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content - left */}
        <div className="flex-1 min-w-0">
          {/* Video player */}
          <YouTubePlayer videoId={video.id} thumbnail={video.thumbnail} title={video.title} />

          {/* Video info */}
          <div className="mt-4">
            <h1 className="text-xl font-bold text-gray-900">{video.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(video.publishedAt)}</span>
              {video.channelTitle && <span>· {video.channelTitle}</span>}
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Tag size={14} className="text-gray-400" />
              {tags.map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                  {tag}
                  {isAdmin && (
                    <button onClick={() => handleRemoveTag(tag)} className="text-gray-400 hover:text-red-500 ml-0.5"><X size={12} /></button>
                  )}
                </span>
              ))}
              {tags.length === 0 && !isAdmin && <span className="text-xs text-gray-400">Sem tags</span>}
              {isAdmin && (
                showTagEditor ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddTag(); if (e.key === 'Escape') setShowTagEditor(false) }}
                      placeholder="Nova tag..."
                      className="border rounded-full px-3 py-1 text-xs w-32 outline-none focus:ring-1 focus:ring-gray-300"
                      autoFocus
                    />
                    <button onClick={handleAddTag} className="text-gray-500 hover:text-gray-900"><Plus size={16} /></button>
                    <button onClick={() => setShowTagEditor(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                  </div>
                ) : (
                  <button onClick={() => setShowTagEditor(true)}
                    className="text-xs text-gray-400 hover:text-gray-700 border border-dashed border-gray-300 rounded-full px-2.5 py-1 flex items-center gap-1 hover:border-gray-400 transition">
                    <Plus size={12} /> Adicionar tag
                  </button>
                )
              )}
            </div>
          </div>

          {/* Description */}
          {video.description && (
            <div className="mt-4 bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {showFullDesc ? video.description : descriptionShort}
                {hasLongDesc && !showFullDesc && '...'}
              </p>
              {hasLongDesc && (
                <button onClick={() => setShowFullDesc(!showFullDesc)} className="text-sm font-medium text-gray-900 mt-2 hover:underline">
                  {showFullDesc ? t('catalog.showLess') : t('catalog.showMore')}
                </button>
              )}
            </div>
          )}

          {/* Comments section */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <MessageSquare size={18} /> {comments.length} {t('catalog.comments')}
            </h3>

            {/* Add comment */}
            <div className="flex gap-3 mb-6">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold">
                {user?.photoUrl ? <img src={user.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" /> : initials(user?.name || '')}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmitComment()}
                  placeholder={t('catalog.addComment')}
                  className="w-full border-b border-gray-200 focus:border-gray-900 pb-2 text-sm outline-none transition bg-transparent"
                />
                {commentText.trim() && (
                  <div className="flex justify-end mt-2 gap-2">
                    <button onClick={() => setCommentText('')} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5">{t('common.cancel')}</button>
                    <button onClick={handleSubmitComment} disabled={sending}
                      className="bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-1">
                      {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} {t('catalog.comment')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Comments list */}
            <div className="space-y-4">
              {comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold overflow-hidden">
                    {c.userPhoto ? <img src={c.userPhoto} alt="" className="w-9 h-9 rounded-full object-cover" /> : initials(c.userName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{c.userName}</span>
                      <span className="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">{t('catalog.noComments')}</p>
              )}
            </div>
          </div>

          {/* Recommendations section */}
          <RecommendationsSection videoId={video.id} />
        </div>

        {/* Suggestions - right sidebar */}
        <div className="lg:w-80 xl:w-96 flex-shrink-0">
          <h3 className="font-semibold text-sm text-gray-900 mb-3">{t('catalog.suggestions')}</h3>
          <div className="space-y-3">
            {suggestions.map(sv => (
              <div key={sv.id} onClick={() => onSelectVideo(sv)}
                className="flex gap-3 cursor-pointer group hover:bg-gray-50 rounded-lg p-1.5 transition">
                <div className="relative flex-shrink-0 w-40 aspect-video rounded-lg overflow-hidden bg-gray-100">
                  {sv.thumbnail ? (
                    <img src={sv.thumbnail} alt={sv.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Video size={20} className="text-gray-300" /></div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                    <Play size={24} className="text-white opacity-0 group-hover:opacity-100 transition drop-shadow" fill="white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{sv.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(sv.publishedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- Main Catalog Page ----
export default function CatalogPage() {
  const { getYoutubeVideos, smartSearchYoutube, getAllVideoTags } = useData()
  const { user: _user } = useAuth()
  const { t } = useI18n()

  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalResults, setTotalResults] = useState(0)
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [prevPageToken, setPrevPageToken] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [searchKeywords, setSearchKeywords] = useState<string[]>([])
  const [searchNextToken, _setSearchNextToken] = useState<string | null>(null)

  const [selectedVideo, setSelectedVideo] = useState<any | null>(null)

  // Tags
  const [tagMap, setTagMap] = useState<Record<string, string[]>>({})
  const [allTags, setAllTags] = useState<string[]>([])
  const [filterTag, setFilterTag] = useState('')

  const loadVideos = useCallback(async (pageToken?: string) => {
    setLoading(true)
    setError('')
    try {
      const result = await getYoutubeVideos(pageToken, 20)
      setVideos(result.videos)
      setTotalResults(result.totalResults)
      setNextPageToken(result.nextPageToken)
      setPrevPageToken(result.prevPageToken)
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar vídeos')
    } finally {
      setLoading(false)
    }
  }, [getYoutubeVideos])

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setActiveSearch(''); setSearchKeywords([]); loadVideos(); return }
    setLoading(true)
    setError('')
    try {
      const result = await smartSearchYoutube(q)
      setVideos(result.videos)
      setTotalResults(result.totalResults)
      setSearchKeywords(result.keywords || [])
      setActiveSearch(q)
    } catch (e: any) {
      setError(e.message || 'Erro na busca')
    } finally {
      setLoading(false)
    }
  }, [smartSearchYoutube, loadVideos])

  useEffect(() => { loadVideos() }, [loadVideos])
  useEffect(() => { getAllVideoTags().then(data => { setTagMap(data.tagMap); setAllTags(data.allTags) }).catch(() => {}) }, [getAllVideoTags])

  const handleSearch = () => {
    if (searchQuery.trim()) doSearch(searchQuery)
    else { setActiveSearch(''); loadVideos() }
  }

  const clearSearch = () => { setSearchQuery(''); setActiveSearch(''); setSearchKeywords([]); loadVideos() }

  // ---- Player view ----
  if (selectedVideo) {
    return (
      <VideoPlayerView
        video={selectedVideo}
        videos={videos}
        onBack={() => setSelectedVideo(null)}
        onSelectVideo={setSelectedVideo}
      />
    )
  }

  // ---- Grid view ----
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('catalog.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{totalResults} {t('catalog.videosAvailable')}</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-6">
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
            <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14} /></button>
          )}
        </div>
        <button onClick={handleSearch} className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
          {t('catalog.searchBtn')}
        </button>
      </div>

      {activeSearch && (
        <div className="mb-4">
          <div className="text-sm text-gray-500">
            {t('catalog.resultsFor')} "<span className="font-medium">{activeSearch}</span>"
            <button onClick={clearSearch} className="ml-2 text-red-500 hover:text-red-700 text-xs">{t('catalog.clearSearch')}</button>
          </div>
          {searchKeywords.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {searchKeywords.slice(0, 8).map(kw => (
                <span key={kw} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{kw}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tag filters */}
      {allTags.length > 0 && !activeSearch && (
        <div className="flex gap-2 mb-4 flex-wrap items-center">
          <Tag size={14} className="text-gray-400" />
          <button onClick={() => setFilterTag('')}
            className={`px-3 py-1 rounded-full text-xs transition ${!filterTag ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Todos
          </button>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setFilterTag(tag === filterTag ? '' : tag)}
              className={`px-3 py-1 rounded-full text-xs transition ${filterTag === tag ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {tag}
            </button>
          ))}
        </div>
      )}

      {error && <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      )}

      {!loading && videos.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Video size={48} className="mx-auto mb-3 text-gray-300" />
          <p>{t('catalog.noVideos')}</p>
        </div>
      )}

      {!loading && videos.length > 0 && (() => {
        const displayVideos = filterTag
          ? videos.filter(v => (tagMap[v.id] || []).includes(filterTag))
          : videos
        return displayVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayVideos.map(video => {
            const videoTags = tagMap[video.id] || []
            return (
            <div key={video.id} onClick={() => setSelectedVideo(video)}
              className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer group">
              <div className="relative aspect-video bg-gray-100">
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Video size={32} className="text-gray-300" /></div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                  <Play size={40} className="text-white opacity-0 group-hover:opacity-100 transition drop-shadow-lg" fill="white" />
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm text-gray-900 line-clamp-2 leading-snug">{video.title}</h3>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <Calendar size={12} />
                  <span>{formatDate(video.publishedAt)}</span>
                </div>
                {videoTags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {videoTags.slice(0, 3).map(tag => (
                      <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                    {videoTags.length > 3 && <span className="text-xs text-gray-400">+{videoTags.length - 3}</span>}
                  </div>
                )}
              </div>
            </div>
            )
          })}
        </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Video size={48} className="mx-auto mb-3 text-gray-300" />
            <p>Nenhum vídeo com a tag "{filterTag}"</p>
            <button onClick={() => setFilterTag('')} className="mt-2 text-sm text-gray-600 hover:text-gray-900 underline">Ver todos</button>
          </div>
        )
      })()}

      {!loading && !activeSearch && (prevPageToken || nextPageToken) && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={() => prevPageToken && loadVideos(prevPageToken)} disabled={!prevPageToken}
            className="flex items-center gap-1 px-4 py-2 border rounded-lg text-sm disabled:opacity-30 hover:bg-gray-50 transition">
            <ChevronLeft size={16} /> {t('catalog.prev')}
          </button>
          <span className="text-sm text-gray-500">{totalResults} {t('catalog.totalVideos')}</span>
          <button onClick={() => nextPageToken && loadVideos(nextPageToken)} disabled={!nextPageToken}
            className="flex items-center gap-1 px-4 py-2 border rounded-lg text-sm disabled:opacity-30 hover:bg-gray-50 transition">
            {t('catalog.next')} <ChevronRight size={16} />
          </button>
        </div>
      )}

      {!loading && activeSearch && searchNextToken && (
        <div className="flex justify-center mt-8">
          <button onClick={() => doSearch(activeSearch)}
            className="flex items-center gap-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition">
            {t('catalog.loadMore')} <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
