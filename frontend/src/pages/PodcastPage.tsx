import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import { Pencil } from 'lucide-react'

/* ───── Create Modal ───── */
function CreatePodcastModal({ onClose, onCreate, createPodcast }: {
  onClose: () => void; onCreate: () => void
  createPodcast: (data: any) => Promise<any>
}) {
  const { t } = useI18n()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [durationMin, setDurationMin] = useState(0)
  const [audioUrl, setAudioUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const formValid = title.trim().length >= 3

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!formValid) return
    setLoading(true); setError('')
    try {
      const r = await createPodcast({ title: title.trim(), description: description.trim(), durationSeconds: durationMin * 60, audioUrl: audioUrl.trim() })
      if (r) onCreate(); else setError(t('common.connectionError'))
    } catch { setError(t('common.connectionError')) }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">{t('podcast.newEpisode')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        {error && <div className="mx-6 mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.title')} *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('podcast.episodeName')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.description')}</label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder={t('podcast.describeEpisode')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.duration')}</label>
            <input type="number" min={0} value={durationMin} onChange={e => setDurationMin(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('podcast.audioUrl')}</label>
            <input type="url" value={audioUrl} onChange={e => setAudioUrl(e.target.value)} placeholder="https://..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">{t('common.cancel')}</button>
            <button type="submit" disabled={!formValid || loading}
              className="flex-1 rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? t('podcast.creating') : t('podcast.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ───── Edit Modal ───── */
function EditPodcastModal({ episode, onClose, onUpdate, updatePodcast }: {
  episode: any; onClose: () => void; onUpdate: () => void
  updatePodcast: (id: string, data: Record<string, any>) => Promise<boolean>
}) {
  const { t } = useI18n()
  const [title, setTitle] = useState(episode.title || '')
  const [description, setDescription] = useState(episode.description || '')
  const [durationMin, setDurationMin] = useState(Math.round((episode.durationSeconds || 0) / 60))
  const [audioUrl, setAudioUrl] = useState(episode.audioUrl || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const formValid = title.trim().length >= 3

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!formValid) return
    setLoading(true); setError('')
    try {
      const ok = await updatePodcast(episode.id, { title: title.trim(), description: description.trim(), durationSeconds: durationMin * 60, audioUrl: audioUrl.trim() })
      if (ok) onUpdate(); else setError(t('common.connectionError'))
    } catch { setError(t('common.connectionError')) }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">{t('podcast.edit')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        {error && <div className="mx-6 mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.title')} *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('podcast.episodeName')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.description')}</label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder={t('podcast.describeEpisode')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.duration')}</label>
            <input type="number" min={0} value={durationMin} onChange={e => setDurationMin(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('podcast.audioUrl')}</label>
            <input type="url" value={audioUrl} onChange={e => setAudioUrl(e.target.value)} placeholder="https://..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">{t('common.cancel')}</button>
            <button type="submit" disabled={!formValid || loading}
              className="flex-1 rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? t('catalog.saving') : t('catalog.saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ───── Main Page ───── */
export default function PodcastPage() {
  const { getPodcastEpisodes, getPodcastProgress, updatePodcastProgress, createPodcast, updatePodcast, deletePodcast } = useData()
  const { user } = useAuth()
  const { t } = useI18n()
  const isAdmin = user?.role === 'admin'

  const [episodes, setEpisodes] = useState<any[]>([])
  const [playing, setPlaying] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingEpisode, setEditingEpisode] = useState<any | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadEpisodes = () => getPodcastEpisodes().then(setEpisodes)
  useEffect(() => { loadEpisodes() }, [])

  /* ── player helpers ── */
  function fmt(s: number) {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  async function playEpisode(ep: any) {
    if (playing === ep.id) { audioRef.current?.pause(); setPlaying(null); return }
    if (audioRef.current) { audioRef.current.pause() }
    const audio = new Audio(ep.audioUrl)
    audioRef.current = audio
    audio.playbackRate = playbackRate
    const prog = await getPodcastProgress(ep.id)
    if (prog && prog.currentTime > 0) audio.currentTime = prog.currentTime
    audio.onloadedmetadata = () => setDuration(audio.duration)
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime)
    audio.onended = () => { updatePodcastProgress(ep.id, audio.duration, true); setPlaying(null) }
    audio.play()
    setPlaying(ep.id)
    if (progressInterval.current) clearInterval(progressInterval.current)
    progressInterval.current = setInterval(() => {
      if (audio && !audio.paused) updatePodcastProgress(ep.id, audio.currentTime)
    }, 10000)
  }

  function seekTo(pct: number) {
    if (!audioRef.current) return
    audioRef.current.currentTime = pct * duration
  }

  function changeRate() {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const idx = rates.indexOf(playbackRate)
    const next = rates[(idx + 1) % rates.length]
    setPlaybackRate(next)
    if (audioRef.current) audioRef.current.playbackRate = next
  }

  useEffect(() => { return () => { audioRef.current?.pause(); if (progressInterval.current) clearInterval(progressInterval.current) } }, [])

  /* ── CRUD handlers ── */
  const handleCreated = () => { setShowCreateModal(false); loadEpisodes() }
  const handleUpdated = () => { setEditingEpisode(null); loadEpisodes() }
  const handleDelete = async (id: string) => {
    if (!confirm(t('podcast.confirmDelete'))) return
    await deletePodcast(id)
    if (playing === id) { audioRef.current?.pause(); setPlaying(null) }
    loadEpisodes()
  }

  const playingEp = episodes.find(e => e.id === playing)

  return (
    <div className="pb-28">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('podcast.title')}</h1>
        {isAdmin && (
          <button onClick={() => setShowCreateModal(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition flex items-center gap-2">
            <span>+</span> {t('podcast.newEpisode')}
          </button>
        )}
      </div>

      {episodes.length === 0 && <p className="text-center text-gray-500 py-12">{t('podcast.noEpisodes')}</p>}

      <div className="space-y-3">
        {episodes.map(ep => (
          <div key={ep.id} className="relative group bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition">
            <button onClick={() => playEpisode(ep)}
              className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0 hover:bg-gray-700 transition">
              {playing === ep.id ? '⏸' : '▶'}
            </button>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{ep.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-1">{ep.description}</p>
              <span className="text-xs text-gray-400">{fmt(ep.durationSeconds || 0)}</span>
            </div>
            {isAdmin && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => setEditingEpisode(ep)}
                  className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-blue-700 shadow" title={t('podcast.edit')}><Pencil size={13} /></button>
                <button onClick={() => handleDelete(ep.id)}
                  className="bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-red-700 shadow" title={t('podcast.delete')}>✕</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Bottom Player Bar ── */}
      {playingEp && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40 px-4 py-3 md:ml-64">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <button onClick={() => playEpisode(playingEp)}
              className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0 hover:bg-gray-700 text-sm">
              {playing ? '⏸' : '▶'}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{playingEp.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 w-10 text-right">{fmt(currentTime)}</span>
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full cursor-pointer relative"
                  onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); seekTo((e.clientX - rect.left) / rect.width) }}>
                  <div className="h-full bg-gray-900 rounded-full" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-10">{fmt(duration)}</span>
              </div>
            </div>
            <button onClick={changeRate}
              className="text-xs font-bold text-gray-600 bg-gray-100 rounded-lg px-2 py-1 hover:bg-gray-200">{playbackRate}x</button>
          </div>
        </div>
      )}

      {showCreateModal && <CreatePodcastModal onClose={() => setShowCreateModal(false)} onCreate={handleCreated} createPodcast={createPodcast} />}
      {editingEpisode && <EditPodcastModal episode={editingEpisode} onClose={() => setEditingEpisode(null)} onUpdate={handleUpdated} updatePodcast={updatePodcast} />}
    </div>
  )
}
