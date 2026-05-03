import { useState, useEffect } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import { Mic, CalendarDays, Users, User, Trash2 } from 'lucide-react'

export default function MentoringPage() {
  const { getWebinars, deleteWebinar, enrollWebinar, getMentoringSessions, deleteMentoringSession, completeMentoringSession } = useData()
  const { user } = useAuth()
  const { t } = useI18n()
  const isPastor = user?.role === 'admin'
  const isLeader = user?.role === 'lider'
  const canCreateWebinar = isPastor
  const canCreateMentoring = isPastor || isLeader

  const [tab, setTab] = useState<'webinars' | 'mentorias'>('webinars')
  const [webinars, setWebinars] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [refresh, setRefresh] = useState(0)
  const [showCreateWebinar, setShowCreateWebinar] = useState(false)
  const [showCreateMentoring, setShowCreateMentoring] = useState(false)
  const [enrollMsg, setEnrollMsg] = useState('')
  const [completeMsg, setCompleteMsg] = useState('')

  useEffect(() => { getWebinars().then(setWebinars); getMentoringSessions().then(setSessions) }, [refresh])

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const statusLabel = (s: string) => {
    if (s === 'completed') return { text: t('mentoring.completed'), cls: 'bg-green-100 text-green-700' }
    if (s === 'in_progress') return { text: t('mentoring.inProgress'), cls: 'bg-yellow-100 text-yellow-700' }
    return { text: t('mentoring.scheduled'), cls: 'bg-blue-100 text-blue-700' }
  }

  const handleEnrollWebinar = async (webinarId: string, title: string) => {
    await enrollWebinar(webinarId)
    setEnrollMsg(`${t('mentoring.enrolledCount')} "${title}"!`)
    setRefresh(r => r + 1)
    setTimeout(() => setEnrollMsg(''), 5000)
  }

  const handleDeleteWebinar = async (webinarId: string, title: string) => {
    if (!confirm(`${t('common.delete')} "${title}"?`)) return
    await deleteWebinar(webinarId)
    setRefresh(r => r + 1)
  }

  const handleDeleteMentoring = async (sessionId: string, title: string) => {
    if (!confirm(`${t('common.delete')} "${title}"?`)) return
    await deleteMentoringSession(sessionId)
    setRefresh(r => r + 1)
  }

  const handleCompleteMentoring = async (sessionId: string, title: string) => {
    if (!confirm(`${t('mentoring.confirmComplete')} "${title}"?`)) return
    await completeMentoringSession(sessionId)
    setCompleteMsg(`${t('mentoring.completedMsg')} "${title}".`)
    setRefresh(r => r + 1)
    setTimeout(() => setCompleteMsg(''), 4000)
  }

  const isEnrolled = (webinar: any) => {
    return (webinar.enrolledUsers || []).includes(user?.id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">{t('mentoring.title')}</h1>
        <div className="flex gap-2">
          {canCreateWebinar && tab === 'webinars' && (
            <button onClick={() => setShowCreateWebinar(true)} className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800">+ {t('mentoring.createWebinar')}</button>
          )}
          {canCreateMentoring && tab === 'mentorias' && (
            <button onClick={() => setShowCreateMentoring(true)} className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800">+ {t('mentoring.createMentoring')}</button>
          )}
        </div>
      </div>
      <p className="text-gray-600 mb-6">{t('mentoring.subtitle')}</p>

      {enrollMsg && <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{enrollMsg}</div>}
      {completeMsg && <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{completeMsg}</div>}

      <div className="flex gap-4 mb-6 border-b">
        <button onClick={() => setTab('webinars')} className={`pb-2 px-1 font-medium ${tab === 'webinars' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500'}`}>{t('mentoring.upcomingWebinars')} ({webinars.length})</button>
        <button onClick={() => setTab('mentorias')} className={`pb-2 px-1 font-medium ${tab === 'mentorias' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500'}`}>{t('mentoring.mentoringSessions')} ({sessions.length})</button>
      </div>

      {tab === 'webinars' && (
        <div className="space-y-4">
          {webinars.length === 0 && <p className="text-gray-500 text-center py-8">{t('mentoring.noWebinars')}</p>}
          {webinars.map((w: any) => (
            <div key={w.id} className="bg-white border rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{w.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{w.description}</p>
                  <p className="text-sm text-gray-500 mt-2 flex items-center gap-1"><Mic size={14} /> {w.hostName} · <CalendarDays size={14} /> {formatDate(w.scheduledAt)}</p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><Users size={14} /> {(w.enrolledUsers || []).length} {t('mentoring.enrolled')}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isEnrolled(w) ? (
                    <span className="text-sm text-green-600 font-medium px-3 py-2">✓ {t('mentoring.enrolled')}</span>
                  ) : (
                    <button onClick={() => handleEnrollWebinar(w.id, w.title)} className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800">{t('mentoring.enroll')}</button>
                  )}
                  {w.meetingUrl && isEnrolled(w) && (
                    <a href={w.meetingUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">{t('mentoring.access')}</a>
                  )}
                  {canCreateWebinar && (
                    <button onClick={() => handleDeleteWebinar(w.id, w.title)} className="text-red-500 hover:text-red-700 text-sm" title={t('common.delete')}><Trash2 size={16} /></button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'mentorias' && (
        <div className="space-y-4">
          {sessions.length === 0 && <p className="text-gray-500 text-center py-8">{t('mentoring.noMentoring')}</p>}
          {sessions.map((s: any) => { const st = statusLabel(s.status); return (
            <div key={s.id} className="bg-white border rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{s.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${st.cls}`}>{st.text}</span>
                  </div>
                  {s.description && <p className="text-gray-600 text-sm mt-1">{s.description}</p>}
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><User size={14} /> {t('mentoring.leader')}: {s.mentorName} · {t('mentoring.pastor')}: {s.pastorName}</p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><CalendarDays size={14} /> {formatDate(s.scheduledAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {s.meetingUrl && s.status !== 'completed' && <a href={s.meetingUrl} target="_blank" rel="noopener noreferrer" className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800">{t('mentoring.enter')}</a>}
                  {isPastor && s.status !== 'completed' && (
                    <button onClick={() => handleCompleteMentoring(s.id, s.title)} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">✓ {t('mentoring.complete')}</button>
                  )}
                  {canCreateMentoring && s.status !== 'completed' && (
                    <button onClick={() => handleDeleteMentoring(s.id, s.title)} className="text-red-500 hover:text-red-700 text-sm" title={t('common.delete')}><Trash2 size={16} /></button>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>
      )}

      {showCreateWebinar && <CreateWebinarModal onClose={() => setShowCreateWebinar(false)} onCreated={() => { setShowCreateWebinar(false); setRefresh(r => r + 1) }} />}
      {showCreateMentoring && <CreateMentoringModal onClose={() => setShowCreateMentoring(false)} onCreated={() => { setShowCreateMentoring(false); setRefresh(r => r + 1) }} />}
    </div>
  )
}

// ---- Create Webinar Modal ----
function CreateWebinarModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { createWebinar } = useData()
  const { user } = useAuth()
  const { t } = useI18n()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [hostName, setHostName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!title.trim()) { setError(`${t('common.title')} required.`); return }
    if (!scheduledAt) { setError(`${t('mentoring.dateTime')} required.`); return }
    if (!meetingUrl.trim()) { setError(`${t('mentoring.meetingLink')} required.`); return }
    setSaving(true)
    setError('')
    try {
      await createWebinar({ title: title.trim(), description: description.trim(), scheduledAt: new Date(scheduledAt).toISOString(), meetingUrl: meetingUrl.trim(), hostName: hostName.trim() })
      onCreated()
    } catch (e: any) { setError(e.message || t('common.connectionError')) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{t('mentoring.createNewWebinar')}</h2>
        {error && <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.title')} *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.description')}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('mentoring.dateTime')} *</label>
            <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('mentoring.meetingLink')} *</label>
            <input value={meetingUrl} onChange={e => setMeetingUrl(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="https://zoom.us/j/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('mentoring.presenter')}</label>
            <input value={hostName} onChange={e => setHostName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">{t('common.cancel')}</button>
          <button onClick={handleSubmit} disabled={saving} className="bg-gray-900 text-white px-6 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50">
            {saving ? t('common.creating') : t('common.create')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Create Mentoring Modal ----
function CreateMentoringModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { createMentoringSession } = useData()
  const { user, getLeaders } = useAuth()
  const { t } = useI18n()
  const isPastor = user?.role === 'admin'
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    getLeaders().then(leaders => {
      if (isPastor) {
        setUsers(leaders.filter((l: any) => l.role === 'lider' && l.status === 'active'))
      } else {
        setUsers(leaders.filter((l: any) => l.role === 'pastor_presidente' && l.status === 'active'))
      }
    })
  }, [])

  const handleSubmit = async () => {
    if (!title.trim()) { setError(`${t('common.title')} required.`); return }
    if (!scheduledAt) { setError(`${t('mentoring.dateTime')} required.`); return }
    if (!selectedUserId) { setError(isPastor ? t('mentoring.selectLeader') : t('mentoring.selectPastor')); return }
    setSaving(true)
    setError('')
    try {
      const selected = users.find(u => u.id === selectedUserId)
      if (!selected) { setError(t('common.connectionError')); return }

      let mentorName: string, mentorId: string, pastorName: string, pastorId: string
      if (isPastor) {
        pastorName = user!.name
        pastorId = user!.id
        mentorName = selected.name
        mentorId = selected.id
      } else {
        mentorName = user!.name
        mentorId = user!.id
        pastorName = selected.name
        pastorId = selected.id
      }

      await createMentoringSession({
        title: title.trim(), description: description.trim(),
        scheduledAt: new Date(scheduledAt).toISOString(),
        meetingUrl: meetingUrl.trim() || undefined,
        mentorName, mentorId, pastorName, pastorId,
      })
      onCreated()
    } catch (e: any) { setError(e.message || t('common.connectionError')) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{t('mentoring.createNewMentoring')}</h2>
        {error && <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.title')} *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.description')}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isPastor ? t('mentoring.selectLeader') : t('mentoring.selectPastor')}
            </label>
            <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="w-full border rounded px-3 py-2 text-sm bg-white">
              <option value="">{isPastor ? t('mentoring.chooseLeader') : t('mentoring.choosePastor')}</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} {u.ministries?.length ? `(${u.ministries.join(', ')})` : ''}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              {isPastor ? t('mentoring.leaderNotified') : t('mentoring.pastorNotified')}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('mentoring.dateTime')} *</label>
            <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('mentoring.meetingLinkOptional')}</label>
            <input value={meetingUrl} onChange={e => setMeetingUrl(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="https://zoom.us/j/..." />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">{t('common.cancel')}</button>
          <button onClick={handleSubmit} disabled={saving} className="bg-gray-900 text-white px-6 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50">
            {saving ? t('common.creating') : t('common.create')}
          </button>
        </div>
      </div>
    </div>
  )
}
