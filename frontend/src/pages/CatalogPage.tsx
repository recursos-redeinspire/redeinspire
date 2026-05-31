import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import {
  Search, Loader2, Play, ChevronLeft, ChevronRight, X, Calendar, Video,
  ArrowLeft, Send, MessageSquare, Tag, Plus, Info
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
    try {
      const newItem = await addVideoRec(videoId, data)
      if (newItem?.id) setItems(prev => [...prev, newItem])
      setShowAdd(false)
    } catch {
      alert('Erro ao salvar. Tente novamente.')
    }
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
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
          {items.map(item => (
            <div key={item.id} className="relative group bg-white border rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer"
              onClick={() => handleClick(item)}>
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : item.type === 'video' && item.videoId ? (
                  <img src={`https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-300 text-2xl">
                    {item.type === 'external' ? '🔗' : item.type === 'video' ? '▶' : '📁'}
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="font-medium text-xs text-gray-900 line-clamp-2 leading-tight">{item.title}</p>
                {item.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>}
                <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                  item.type === 'external' ? 'bg-blue-50 text-blue-600' :
                  item.type === 'video' ? 'bg-purple-50 text-purple-600' :
                  'bg-amber-50 text-amber-600'
                }`}>
                  {item.type === 'external' ? '🔗 Externo' : item.type === 'video' ? '▶ Vídeo' : '📁 Material'}
                </span>
              </div>
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
      {isAdmin && (
        <button onClick={() => setShowAdd(true)}
          className="text-sm text-gray-500 hover:text-gray-900 border border-dashed border-gray-300 rounded-xl px-4 py-3 w-full flex items-center justify-center gap-2 hover:border-gray-400 transition">
          <Plus size={16} /> Adicionar indicação
        </button>
      )}
      {showAdd && <AddRecommendationModal onClose={() => setShowAdd(false)} onSave={handleAdd} />}
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
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new window.Image()
    img.onload = () => {
      const size = 200
      canvas.width = size
      canvas.height = size
      ctx?.drawImage(img, 0, 0, size, size)
      setImageUrl(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.src = URL.createObjectURL(file)
  }

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSave({ type, title: title.trim(), description: description.trim(), url, imageUrl, linkedVideoId, materialPath })
    } catch {
      alert('Erro ao salvar indicação. Tente novamente.')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">Adicionar Indicação</h2>
        </div>
        <div className="p-6 space-y-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300" placeholder="Nome da indicação" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300" placeholder="Breve descrição" />
          </div>
          {type === 'external' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL externa *</label>
              <input type="url" value={url} onChange={e => setUrl(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300" placeholder="https://..." />
            </div>
          )}
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
          {type === 'material' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Caminho da pasta</label>
              <input type="text" value={materialPath} onChange={e => setMaterialPath(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300" placeholder="/Mensagens - Avulsas/2024" />
            </div>
          )}
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
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition">
        <ArrowLeft size={16} /> {t('catalog.backToCatalog')}
      </button>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <YouTubePlayer videoId={video.id} thumbnail={video.thumbnail} title={video.title} />
          <div className="mt-4">
            <h1 className="text-xl font-bold text-gray-900">{video.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(video.publishedAt)}</span>
              {video.channelTitle && <span>· {video.channelTitle}</span>}
            </div>
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
                    <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddTag(); if (e.key === 'Escape') setShowTagEditor(false) }}
                      placeholder="Nova tag..." className="border rounded-full px-3 py-1 text-xs w-32 outline-none focus:ring-1 focus:ring-gray-300" autoFocus />
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
            {isAdmin && <ThumbnailManager videoId={video.id} currentThumbnail={video.thumbnail} />}
          </div>
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
            <div className="flex gap-3 mb-6">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold">
                {user?.photoUrl ? <img src={user.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" /> : initials(user?.name || '')}
              </div>
              <div className="flex-1">
                <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmitComment()}
                  placeholder={t('catalog.addComment')}
                  className="w-full border-b border-gray-200 focus:border-gray-900 pb-2 text-sm outline-none transition bg-transparent" />
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

// ─── Thumbnail Manager (Admin) ───
function ThumbnailManager({ videoId, currentThumbnail }: { videoId: string; currentThumbnail: string }) {
  const { saveVideoThumbnail, deleteVideoThumbnail, getUploadPresignedUrl } = useData()
  const [customThumb, setCustomThumb] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('ri_token')
    fetch(`https://h28wyjr7u7.execute-api.us-east-1.amazonaws.com/video-tags?videoId=${encodeURIComponent(videoId)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(data => {
      if (data.customThumbnail) setCustomThumb(data.customThumbnail)
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [videoId])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { uploadUrl, fileUrl } = await getUploadPresignedUrl(file.name, file.type)
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      await saveVideoThumbnail(videoId, fileUrl)
      setCustomThumb(fileUrl)
    } catch (err) {
      console.error('Upload error:', err)
    }
    setUploading(false)
  }

  const handleRemove = async () => {
    await deleteVideoThumbnail(videoId)
    setCustomThumb(null)
  }

  if (!loaded) return null

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Thumbnail personalizada</p>
      <div className="flex items-center gap-3">
        <img src={customThumb || currentThumbnail} alt="" className="w-24 h-14 rounded-lg object-cover border" />
        <div className="flex-1">
          {customThumb ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-600 font-medium">✓ Thumbnail customizada ativa</span>
              <button onClick={handleRemove} className="text-xs text-red-500 hover:text-red-700 underline">Remover</button>
            </div>
          ) : (
            <p className="text-xs text-gray-400">Usando thumbnail original do YouTube</p>
          )}
          <label className="mt-2 inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            {uploading ? 'Enviando...' : customThumb ? 'Trocar imagem' : 'Subir thumbnail HD'}
          </label>
        </div>
      </div>
    </div>
  )
}

// ─── Category Row (Prime Video style) ───
function CategoryRow({ label, videos, thumb, onPlay }: {
  label: string; videos: any[]; thumb: (v: any) => string; onPlay: (v: any) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isWatching = label === 'Continue assistindo'
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [cardRect, setCardRect] = useState<{ top: number; left: number; width: number } | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openCard = (v: any, el: HTMLDivElement) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    const rect = el.getBoundingClientRect()
    setCardRect({ top: rect.top, left: rect.left, width: rect.width })
    if (hoveredId && hoveredId !== v.id) {
      setHoveredId(v.id)
    } else {
      timeoutRef.current = setTimeout(() => setHoveredId(v.id), 250)
    }
  }

  const closeCard = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setHoveredId(null)
      setCardRect(null)
    }, 150)
  }

  const keepCard = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -(el.clientWidth * 0.8) : (el.clientWidth * 0.8), behavior: 'smooth' })
  }

  if (videos.length === 0) return null
  const hoveredVideo = hoveredId ? videos.find(v => v.id === hoveredId) : null

  return (
    <div className="mb-10 group/row">
      <div className="px-8 md:px-14 mb-3">
        <h2 className="text-[15px] font-bold text-white/90">{label}</h2>
      </div>
      <div className="relative">
        <button onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 w-14 bg-gradient-to-r from-[#0d1117] to-transparent z-10 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer">
          <ChevronLeft size={36} className="text-white" />
        </button>
        <div ref={scrollRef} className="flex gap-3 px-8 md:px-14 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {videos.map(v => (
            <div key={v.id} className="shrink-0 w-[220px] md:w-[280px]"
              onMouseEnter={(e) => openCard(v, e.currentTarget as HTMLDivElement)}
              onMouseLeave={closeCard}>
              <div className={`relative rounded-lg overflow-hidden aspect-video bg-[#1c2028] transition-opacity duration-200 ${hoveredId === v.id ? 'opacity-30' : ''}`}>
                <img src={thumb(v)} alt="" loading="lazy" className="w-full h-full object-cover" />
                {isWatching && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div className="h-full bg-green-500 rounded-r-full" style={{ width: `${20 + Math.floor(v.id.charCodeAt(0) % 60)}%` }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 w-14 bg-gradient-to-l from-[#0d1117] to-transparent z-10 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer">
          <ChevronRight size={36} className="text-white" />
        </button>
      </div>

      {/* Floating expanded card */}
      {hoveredVideo && cardRect && (
        <div className="fixed pointer-events-auto"
          style={{
            zIndex: 9999,
            top: cardRect.top - 10,
            left: Math.max(10, Math.min(cardRect.left + cardRect.width / 2 - 190, window.innerWidth - 390)),
            width: 380,
            animation: 'cardGrow 0.25s ease-out forwards',
          }}
          onMouseEnter={keepCard}
          onMouseLeave={closeCard}>
          <div className="rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.95)] ring-1 ring-white/10 bg-[#0d1117]">
            <div className="relative aspect-video">
              <img src={thumb(hoveredVideo)} alt="" className="w-full h-full object-cover" />
              {isWatching && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div className="h-full bg-green-500 rounded-r-full" style={{ width: `${20 + Math.floor(hoveredVideo.id.charCodeAt(0) % 60)}%` }} />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-white font-bold text-[13px] leading-snug line-clamp-2">{hoveredVideo.title}</h3>
              <p className="text-green-400 text-[10px] font-medium mt-1 flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center text-[7px] text-white">✓</span>
                Incluído na plataforma
              </p>
              <button onClick={() => onPlay(hoveredVideo)}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-2.5 rounded-md hover:bg-white/90 transition text-[12px]">
                <Play size={14} fill="currentColor" /> Reproduzir
              </button>
              <div className="flex items-center gap-2 mt-2 text-[9px] text-white/30">
                <span>{hoveredVideo.channelTitle || 'Rede Inspire'}</span>
                {hoveredVideo.publishedAt && <span>· {new Date(hoveredVideo.publishedAt).getFullYear()}</span>}
              </div>
              {hoveredVideo.description && (
                <p className="text-white/30 text-[10px] mt-2 line-clamp-3 leading-relaxed">{hoveredVideo.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Smart categories ───
function buildCategories(videos: any[], _tagMap: Record<string, string[]>) {
  const rules: { label: string; keywords: string[] }[] = [
    { label: 'Liderança & Gestão', keywords: ['liderança', 'líder', 'gestão', 'gestor', 'equipe', 'equipes', 'operacional', 'secretari'] },
    { label: 'Finanças & Estratégia', keywords: ['financ', 'planejamento', 'estratég', 'recurso', 'prioridade'] },
    { label: 'Inovação & Tecnologia', keywords: ['inovação', 'tecnologia', 'digital', 'inteligência', 'otimizar'] },
    { label: 'Saúde Emocional', keywords: ['saúde', 'emocional', 'bem-estar', 'burnout', 'cuidado'] },
    { label: 'Comunicação & Mídia', keywords: ['comunicação', 'mídia', 'multimídia', 'projeção', 'visual', 'redes sociais'] },
    { label: 'Vida Ministerial', keywords: ['ministério', 'ministerial', 'célula', 'pequenos grupos', 'consolidar', 'bases', 'igreja'] },
    { label: 'Família & Relacionamentos', keywords: ['família', 'casamento', 'relacionamento', 'filhos', 'mulher', 'homem', 'homens'] },
    { label: 'Crescimento Espiritual', keywords: ['crescimento', 'discipulado', 'caminho', 'dons', 'propósito', 'chamado', 'fé'] },
    { label: 'Impacto Social', keywords: ['social', 'comunidade', 'ação social', 'voluntário', 'impacto'] },
    { label: 'Webinars & Talks', keywords: ['webinar', 'talk', 'podcast', 'inspire leaders', 'encontro', 'mentores'] },
  ]

  const categorized: Record<string, Set<string>> = {}
  const videoMap: Record<string, any> = {}

  for (const v of videos) {
    videoMap[v.id] = v
    const text = (v.title || '').toLowerCase() + ' ' + (v.description || '').toLowerCase()
    for (const rule of rules) {
      if (rule.keywords.some(kw => text.includes(kw))) {
        if (!categorized[rule.label]) categorized[rule.label] = new Set()
        categorized[rule.label].add(v.id)
        break
      }
    }
  }

  const result: { label: string; videos: any[] }[] = []
  const usedIds = new Set<string>()

  const watching = videos.slice(2, 9)
  watching.forEach(v => usedIds.add(v.id))
  result.push({ label: 'Continue assistindo', videos: watching })

  const recent = [...videos]
    .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
    .filter(v => !usedIds.has(v.id))
    .slice(0, 15)
  recent.forEach(v => usedIds.add(v.id))
  result.push({ label: 'Adicionados recentemente', videos: recent })

  for (const rule of rules) {
    const ids = categorized[rule.label]
    if (ids && ids.size >= 3) {
      const catVideos = [...ids].map(id => videoMap[id]).filter(v => !usedIds.has(v.id))
      catVideos.forEach(v => usedIds.add(v.id))
      if (catVideos.length >= 2) {
        result.push({ label: rule.label, videos: catVideos })
      }
    }
  }

  const popular = videos.filter(v => !usedIds.has(v.id)).slice(0, 15)
  popular.forEach(v => usedIds.add(v.id))
  if (popular.length > 2) result.push({ label: 'Mais assistidos', videos: popular })

  const remaining = videos.filter(v => !usedIds.has(v.id)).slice(0, 15)
  if (remaining.length > 2) result.push({ label: 'Descubra mais', videos: remaining })

  return result
}

// ── Main Catalog Page (Prime Video style) ──
export default function CatalogPage() {
  const { getYoutubeVideos, smartSearchYoutube, getAllVideoTags, getAllVideoThumbnails } = useData()
  const { user: _user } = useAuth()
  const { t } = useI18n()

  const [allVideos, setAllVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchKeywords, setSearchKeywords] = useState<string[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  const [selectedVideo, setSelectedVideo] = useState<any | null>(null)
  const [searchParams] = useSearchParams()

  const [tagMap, setTagMap] = useState<Record<string, string[]>>({})
  const [allTags, setAllTags] = useState<string[]>([])
  const [filterTag, setFilterTag] = useState('')
  const [customThumbnails, setCustomThumbnails] = useState<Record<string, string>>({})

  const [heroIdx, setHeroIdx] = useState(0)
  const [expandedVideo, setExpandedVideo] = useState<any | null>(null)

  // Load all data
  useEffect(() => {
    Promise.all([
      getYoutubeVideos(undefined, 100).then(d => d.videos),
      getAllVideoTags().then(d => ({ tagMap: d.tagMap, allTags: d.allTags })),
      getAllVideoThumbnails().then(d => d.thumbnails || {}),
    ]).then(([vids, tags, thumbs]) => {
      setAllVideos(vids)
      setTagMap(tags.tagMap)
      setAllTags(tags.allTags)
      setCustomThumbnails(thumbs)
      setLoading(false)
    }).catch(e => { setError(e.message || 'Erro ao carregar'); setLoading(false) })
  }, [getYoutubeVideos, getAllVideoTags, getAllVideoThumbnails])

  // Auto-select video from URL param
  useEffect(() => {
    const videoId = searchParams.get('video')
    if (videoId && allVideos.length > 0 && !selectedVideo) {
      const found = allVideos.find(v => v.id === videoId)
      if (found) setSelectedVideo(found)
      else setSelectedVideo({ id: videoId, title: '', description: '', thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, publishedAt: '', channelTitle: '' })
    }
  }, [searchParams, allVideos, selectedVideo])

  // Hero auto-rotate
  const heroVideos = allVideos.slice(0, 5)
  useEffect(() => {
    if (heroVideos.length === 0) return
    const timer = setInterval(() => setHeroIdx(p => (p + 1) % heroVideos.length), 7000)
    return () => clearInterval(timer)
  }, [heroVideos.length])

  const thumb = useCallback((v: any) => customThumbnails[v.id] || v.thumbnail, [customThumbnails])

  // Apply custom thumbnails
  const videosWithThumbs = allVideos.map(v => customThumbnails[v.id] ? { ...v, thumbnail: customThumbnails[v.id] } : v)

  // Search
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setActiveSearch(''); setSearchResults([]); setSearchKeywords([]); return }
    setSearchLoading(true)
    try {
      const result = await smartSearchYoutube(q)
      setSearchResults(result.videos)
      setSearchKeywords(result.keywords || [])
      setActiveSearch(q)
    } catch (e: any) {
      setError(e.message || 'Erro na busca')
    } finally { setSearchLoading(false) }
  }, [smartSearchYoutube])

  const handleSearch = () => { if (searchQuery.trim()) doSearch(searchQuery); else clearSearch() }
  const clearSearch = () => { setSearchQuery(''); setActiveSearch(''); setSearchResults([]); setSearchKeywords([]) }

  // Filter by tag
  const filteredByTag = filterTag
    ? videosWithThumbs.filter(v => (tagMap[v.id] || []).includes(filterTag))
    : videosWithThumbs

  const categories = buildCategories(filteredByTag, tagMap)

  // ── Player view ──
  if (selectedVideo) {
    return (
      <VideoPlayerView
        video={selectedVideo}
        videos={videosWithThumbs}
        onBack={() => setSelectedVideo(null)}
        onSelectVideo={setSelectedVideo}
      />
    )
  }

  // ── Loading ──
  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-gray-400" />
    </div>
  )

  if (error) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="rounded-lg bg-red-50 p-6 text-sm text-red-700 max-w-md text-center">{error}</div>
    </div>
  )

  // ── Prime Video catalog view ──
  return (
    <div className="min-h-screen bg-[#0d1117] -m-4 md:-m-6 lg:-m-8 p-0">
      <style>{`
        @keyframes cardGrow {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Search bar overlay */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-[#0d1117] via-[#0d1117]/95 to-transparent px-8 md:px-14 pt-6 pb-4">
        <div className="flex items-center gap-3 max-w-2xl">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={t('catalog.searchPlaceholder')}
              className="w-full pl-11 pr-10 py-3 bg-white/10 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 outline-none focus:border-white/30 focus:bg-white/15 transition"
            />
            {searchQuery && (
              <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"><X size={14} /></button>
            )}
          </div>
          <button onClick={handleSearch}
            className="bg-green-600 text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-green-700 transition">
            {t('catalog.searchBtn')}
          </button>
        </div>

        {/* Tag filters */}
        {allTags.length > 0 && !activeSearch && (
          <div className="flex gap-2 mt-3 flex-wrap items-center">
            <Tag size={13} className="text-white/30" />
            <button onClick={() => setFilterTag('')}
              className={`px-3 py-1 rounded-full text-xs transition ${!filterTag ? 'bg-white text-black font-medium' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
              Todos
            </button>
            {allTags.map(tag => (
              <button key={tag} onClick={() => setFilterTag(tag === filterTag ? '' : tag)}
                className={`px-3 py-1 rounded-full text-xs transition ${filterTag === tag ? 'bg-white text-black font-medium' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search results mode */}
      {activeSearch && (
        <div className="px-8 md:px-14 pb-20">
          <div className="mb-4">
            <p className="text-sm text-white/50">
              Resultados para "<span className="font-medium text-white/80">{activeSearch}</span>"
              <button onClick={clearSearch} className="ml-3 text-red-400 hover:text-red-300 text-xs">Limpar busca</button>
            </p>
            {searchKeywords.length > 0 && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {searchKeywords.slice(0, 8).map(kw => (
                  <span key={kw} className="bg-white/10 text-white/50 text-xs px-2 py-1 rounded-full">{kw}</span>
                ))}
              </div>
            )}
          </div>
          {searchLoading ? (
            <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-white/30" /></div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-20 text-white/30">
              <Video size={48} className="mx-auto mb-3" />
              <p>Nenhum resultado encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {searchResults.map(video => (
                <div key={video.id} onClick={() => setSelectedVideo(video)}
                  className="cursor-pointer group">
                  <div className="relative rounded-lg overflow-hidden aspect-video bg-[#1c2028]">
                    <img src={thumb(video)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                      <Play size={32} className="text-white opacity-0 group-hover:opacity-100 transition drop-shadow-lg" fill="white" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-white/80 mt-2 line-clamp-2 leading-snug">{video.title}</p>
                  <p className="text-xs text-white/30 mt-1">{video.channelTitle || 'Rede Inspire'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Browse mode (hero + rows) */}
      {!activeSearch && (
        <>
          {/* HERO */}
          {heroVideos.length > 0 && !filterTag && (
            <section className="relative w-full h-[70vh] min-h-[400px] -mt-20">
              {heroVideos.map((v, i) => (
                <div key={v.id} className={`absolute inset-0 transition-opacity duration-1000 ${i === heroIdx ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <img src={thumb(v)} alt="" className="w-full h-full object-cover object-[center_20%]" />
                </div>
              ))}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117] via-[#0d1117]/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-[#0d1117]/40" />
              <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0d1117] to-transparent" />

              <div className="absolute bottom-[18%] left-8 md:left-14 max-w-xl z-10">
                <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-[1.1] drop-shadow-lg">{heroVideos[heroIdx]?.title}</h1>
                <p className="text-white/50 text-sm mt-3">{heroVideos[heroIdx]?.channelTitle || 'Rede Inspire'}</p>
                <div className="flex items-center gap-3 mt-6">
                  <button onClick={() => setSelectedVideo(heroVideos[heroIdx])}
                    className="flex items-center gap-2.5 bg-white text-black font-bold px-7 py-3.5 rounded-md hover:bg-white/90 transition text-[14px]">
                    <Play size={20} fill="currentColor" /> Assistir agora
                  </button>
                  <button onClick={() => setSelectedVideo(heroVideos[heroIdx])}
                    className="w-11 h-11 rounded-full border-2 border-white/40 flex items-center justify-center hover:border-white/70 transition">
                    <Info size={20} className="text-white" />
                  </button>
                </div>
              </div>

              <button onClick={() => setHeroIdx(p => (p - 1 + heroVideos.length) % heroVideos.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 hover:bg-black/60 flex items-center justify-center transition z-10">
                <ChevronLeft size={28} className="text-white" />
              </button>
              <button onClick={() => setHeroIdx(p => (p + 1) % heroVideos.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 hover:bg-black/60 flex items-center justify-center transition z-10">
                <ChevronRight size={28} className="text-white" />
              </button>

              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {heroVideos.map((_, i) => (
                  <button key={i} onClick={() => setHeroIdx(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === heroIdx ? 'bg-white w-8' : 'bg-white/30 w-3 hover:bg-white/50'}`} />
                ))}
              </div>
            </section>
          )}

          {/* Category rows */}
          <div className={`relative z-10 ${!filterTag ? '-mt-24' : 'mt-4'} pb-20`}>
            {filterTag && categories.length === 0 && (
              <div className="text-center py-20 text-white/30">
                <Video size={48} className="mx-auto mb-3" />
                <p>Nenhum vídeo com a tag "{filterTag}"</p>
                <button onClick={() => setFilterTag('')} className="mt-2 text-sm text-white/50 hover:text-white underline">Ver todos</button>
              </div>
            )}
            {categories.map(cat => (
              <CategoryRow
                key={cat.label}
                label={cat.label}
                videos={cat.videos}
                thumb={thumb}
                onPlay={(v) => setSelectedVideo(v)}
              />
            ))}
          </div>
        </>
      )}

      {/* Mobile expanded card modal */}
      {expandedVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center md:hidden" onClick={() => setExpandedVideo(null)}>
          <div className="bg-[#0d1117] rounded-t-2xl overflow-hidden w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative aspect-video">
              <img src={thumb(expandedVideo)} alt="" className="w-full h-full object-cover" />
              <button onClick={() => setExpandedVideo(null)} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center">
                <X size={16} className="text-white" />
              </button>
            </div>
            <div className="p-5">
              <h3 className="text-white font-bold text-xl leading-snug">{expandedVideo.title}</h3>
              <button onClick={() => { setSelectedVideo(expandedVideo); setExpandedVideo(null) }}
                className="mt-4 w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3.5 rounded-lg text-[15px]">
                <Play size={20} fill="currentColor" /> Reproduzir
              </button>
              {expandedVideo.description && (
                <p className="text-white/40 text-[12px] mt-4 line-clamp-5 leading-relaxed">{expandedVideo.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
