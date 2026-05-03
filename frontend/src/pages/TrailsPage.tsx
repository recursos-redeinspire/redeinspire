import { useState, useEffect } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import { Trash2, BookOpen, Clock, Trophy, AlertTriangle, Link as LinkIcon, Video, Headphones, FileText, PenLine, FolderOpen } from 'lucide-react'

interface ModuleForm { title: string; durationMinutes: number; contentId: string }

export default function TrailsPage() {
  const { getTrails, deleteTrail, startTrail, completeModule, getAcademyCourses, enrollCourse } = useData()
  const { user } = useAuth()
  const { t } = useI18n()
  const isPastor = user?.role === 'admin'
  const [tab, setTab] = useState<'trilhas' | 'academy'>('trilhas')
  const [expandedTrail, setExpandedTrail] = useState<string | null>(null)
  const [enrolledMsg, setEnrolledMsg] = useState('')
  const [trails, setTrails] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [refresh, setRefresh] = useState(0)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => { getTrails().then(setTrails) }, [refresh])
  useEffect(() => { getAcademyCourses().then(setCourses) }, [refresh])

  const handleStartTrail = async (trailId: string) => { await startTrail(trailId); setRefresh(r => r + 1) }
  const handleCompleteModule = async (trailId: string, moduleId: string) => { await completeModule(trailId, moduleId); setRefresh(r => r + 1) }

  const handleEnroll = async (trailId: string, title: string) => {
    await enrollCourse(trailId)
    setEnrolledMsg(`${t('trails.enrollSuccess')} "${title}" ${t('trails.enrollSuccessSuffix')}`)
    setRefresh(r => r + 1)
    setTimeout(() => setEnrolledMsg(''), 4000)
  }

  const handleDelete = async (trailId: string, title: string) => {
    if (!confirm(`${t('trails.confirmDelete')} "${title}"${t('trails.confirmDeleteSuffix')}`)) return
    await deleteTrail(trailId)
    setRefresh(r => r + 1)
  }

  const handleCreated = () => { setShowCreate(false); setRefresh(r => r + 1) }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">{t('trails.title')}</h1>
        {isPastor && (
          <button onClick={() => setShowCreate(true)} className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800">+ {t('trails.createTrail')}</button>
        )}
      </div>
      <p className="text-gray-600 mb-6">{t('trails.subtitle')}</p>
      <div className="flex gap-4 mb-6 border-b">
        <button onClick={() => setTab('trilhas')} className={`pb-2 px-1 font-medium ${tab === 'trilhas' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500'}`}>{t('trails.learningTrails')}</button>
        <button onClick={() => setTab('academy')} className={`pb-2 px-1 font-medium ${tab === 'academy' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500'}`}>{t('trails.academy')}</button>
      </div>

      {tab === 'trilhas' && (
        <div className="space-y-4">
          {trails.length === 0 && <p className="text-gray-500 text-center py-8">{t('trails.noTrails')}</p>}
          {trails.map((trail: any) => {
            const percent = trail.progress?.percentComplete ?? 0
            const isComplete = percent >= 100
            const isStarted = !!trail.progress
            const isExpanded = expandedTrail === trail.id
            return (
              <div key={trail.id} className="bg-white border rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{trail.title}</h3>
                      {trail.isMandatory && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">{t('trails.mandatory')}</span>}
                      {isComplete && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">✓ {t('trails.completed')}</span>}
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{trail.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-bold">{trail.points} pts</span>
                    {isPastor && (
                      <button onClick={() => handleDelete(trail.id, trail.title)} className="text-red-500 hover:text-red-700 text-sm" title={t('common.delete')}><Trash2 size={16} /></button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5"><div className={`h-2.5 rounded-full ${isComplete ? 'bg-green-500' : 'bg-gray-900'}`} style={{ width: `${percent}%` }} /></div>
                  <span className="text-sm text-gray-600 whitespace-nowrap">{trail.progress?.completedModules?.length ?? 0}/{trail.modules?.length ?? 0} {t('trails.modules')} ({percent}%)</span>
                </div>
                <div className="mt-3 flex gap-2">
                  {!isStarted && <button onClick={() => handleStartTrail(trail.id)} className="bg-gray-900 text-white px-4 py-1.5 rounded text-sm hover:bg-gray-800">{t('trails.start')}</button>}
                  {isStarted && !isComplete && <button onClick={() => setExpandedTrail(isExpanded ? null : trail.id)} className="bg-gray-900 text-white px-4 py-1.5 rounded text-sm hover:bg-gray-800">{isExpanded ? t('trails.close') : t('trails.continue')}</button>}
                  {isComplete && <button className="bg-green-600 text-white px-4 py-1.5 rounded text-sm hover:bg-green-700">📜 {t('trails.viewCertificate')}</button>}
                </div>
                {isExpanded && (
                  <div className="mt-4 border-t pt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">{t('trails.modulesLabel')}:</p>
                    {(trail.modules || []).map((mod: any) => {
                      const completed = trail.progress?.completedModules?.includes(mod.moduleId)
                      return (
                        <div key={mod.moduleId} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>{completed ? '✓' : mod.order}</span>
                            <div><p className={`text-sm ${completed ? 'text-gray-400 line-through' : 'font-medium'}`}>{mod.title}</p><p className="text-xs text-gray-400">{mod.durationMinutes} min</p></div>
                          </div>
                          {!completed && <button onClick={() => handleCompleteModule(trail.id, mod.moduleId)} className="text-xs bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300">{t('trails.completeModule')}</button>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {tab === 'academy' && (
        <div>
          {enrolledMsg && <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{enrolledMsg}</div>}
          <p className="text-gray-600 mb-4">{t('trails.academyDesc')}</p>
          {courses.length === 0 && <p className="text-gray-500 text-center py-8">{t('trails.noCourses')}</p>}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course: any) => (
              <div key={course.id} className="bg-white border rounded-lg p-5 hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{course.description}</p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p className="flex items-center gap-1"><BookOpen size={14} /> {course.modulesCount || 0} {t('trails.modules')}</p>
                  <p className="flex items-center gap-1"><Clock size={14} /> {course.durationHours || 0} {t('trails.hours')}</p>
                  <p className="flex items-center gap-1"><Trophy size={14} /> {course.points} {t('trails.points')}</p>
                  {course.isMandatory && <p className="text-red-600 font-medium flex items-center gap-1"><AlertTriangle size={14} /> {t('trails.mandatory')}</p>}
                </div>
                <button onClick={() => handleEnroll(course.trailId, course.title)} className="mt-3 w-full bg-gray-900 text-white py-2 rounded text-sm hover:bg-gray-800">{t('trails.enroll')}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCreate && <CreateTrailModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
    </div>
  )
}

// ---- Create Trail Modal ----
function CreateTrailModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { createTrail, getContents } = useData()
  const { t } = useI18n()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [points, setPoints] = useState(100)
  const [isMandatory, setIsMandatory] = useState(false)
  const [modules, setModules] = useState<ModuleForm[]>([{ title: '', durationMinutes: 10, contentId: '' }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [allContents, setAllContents] = useState<any[]>([])

  useEffect(() => { getContents().then(setAllContents) }, [])

  const addModule = () => setModules([...modules, { title: '', durationMinutes: 10, contentId: '' }])
  const removeModule = (i: number) => { if (modules.length > 1) setModules(modules.filter((_, idx) => idx !== i)) }
  const updateModule = (i: number, field: keyof ModuleForm, value: string | number) => {
    const updated = [...modules]
    updated[i] = { ...updated[i], [field]: value }
    if (field === 'contentId' && value) {
      const content = allContents.find(c => c.id === value)
      if (content) {
        if (!updated[i].title) updated[i].title = content.title
        if (content.durationMinutes) updated[i].durationMinutes = content.durationMinutes
      }
    }
    setModules(updated)
  }

  const typeLabel = (type: string) => {
    const map: Record<string, React.ReactNode> = { video: <Video size={14} />, audio: <Headphones size={14} />, document: <FileText size={14} />, article: <PenLine size={14} /> }
    return map[type] || <FolderOpen size={14} />
  }

  const handleSubmit = async () => {
    if (!title.trim()) { setError(t('trails.titleRequired')); return }
    if (modules.some(m => !m.title.trim())) { setError(t('trails.moduleTitleRequired')); return }
    setSaving(true)
    setError('')
    try {
      await createTrail({
        title: title.trim(),
        description: description.trim(),
        points,
        isMandatory,
        modules: modules.map((m, i) => ({
          title: m.title.trim(),
          order: i + 1,
          durationMinutes: Number(m.durationMinutes) || 0,
          ...(m.contentId ? { contentId: m.contentId } : {}),
        })),
      })
      onCreated()
    } catch (e: any) {
      setError(e.message || t('common.connectionError'))
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{t('trails.createNewTrail')}</h2>
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
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('trails.points')}</label>
              <input type="number" value={points} onChange={e => setPoints(Number(e.target.value))} className="w-full border rounded px-3 py-2 text-sm" min={0} />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={isMandatory} onChange={e => setIsMandatory(e.target.checked)} className="rounded" />
                <span className="font-medium text-gray-700">{t('trails.mandatory')}</span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">{t('trails.modulesLabel')} *</label>
              <button onClick={addModule} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200">+ {t('trails.addModule')}</button>
            </div>
            <div className="space-y-3">
              {modules.map((mod, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-gray-400 font-bold w-5">{i + 1}.</span>
                    <input value={mod.title} onChange={e => updateModule(i, 'title', e.target.value)} className="flex-1 border rounded px-2 py-1.5 text-sm" placeholder={t('trails.moduleTitle')} />
                    <input type="number" value={mod.durationMinutes} onChange={e => updateModule(i, 'durationMinutes', Number(e.target.value))} className="w-20 border rounded px-2 py-1.5 text-sm" min={1} />
                    <span className="text-xs text-gray-400">min</span>
                    {modules.length > 1 && <button onClick={() => removeModule(i)} className="text-red-400 hover:text-red-600 text-sm">✕</button>}
                  </div>
                  <div className="pl-7">
                    <select
                      value={mod.contentId}
                      onChange={e => updateModule(i, 'contentId', e.target.value)}
                      className="w-full border rounded px-2 py-1.5 text-sm text-gray-700 bg-white"
                    >
                      <option value=""><LinkIcon size={14} className="inline" /> {t('trails.linkContent')}</option>
                      {allContents.map(c => (
                        <option key={c.id} value={c.id}>
                          {typeLabel(c.type)} {c.title} ({c.durationMinutes || 0} min)
                        </option>
                      ))}
                    </select>
                    {mod.contentId && (
                      <p className="text-xs text-green-600 mt-1">✓ {t('trails.contentLinked')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">{t('common.cancel')}</button>
          <button onClick={handleSubmit} disabled={saving} className="bg-gray-900 text-white px-6 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50">
            {saving ? t('trails.creating') : t('trails.createTrailBtn')}
          </button>
        </div>
      </div>
    </div>
  )
}
