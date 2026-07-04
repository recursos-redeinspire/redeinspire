import { useState, useEffect } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import {
  ChevronLeft, ChevronRight, Plus, Calendar, Clock, Users,
  Edit2, Trash2, Video, GraduationCap, Church, Target, Music, FileText, Upload, Loader2
} from 'lucide-react'

export default function PlanningPage() {
  const { getPlans, savePlan, deletePlan, getWebinars, getMentoringSessions, getUploadPresignedUrl, smartSearchDropbox } = useData()
  const { user } = useAuth()
  const { t } = useI18n()

  const [tab, setTab] = useState<'visao' | 'domingo' | 'anual' | 'ministerio'>('visao')
  const [editingPlan, setEditingPlan] = useState<string | null>(null)
  const [saveMsg, setSaveMsg] = useState('')
  const [plans, setPlans] = useState<any[]>([])
  const [refresh, setRefresh] = useState(0)
  const [agendaItems, setAgendaItems] = useState<any[]>([])

  // Calendar state
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())

  // Forms
  const [sundayPlan, setSundayPlan] = useState({ title: '', date: '', worship: '', message: '', notes: '', materialId: '', fileUrl: '', fileName: '' })
  const [annualPlan, setAnnualPlan] = useState({ title: '', goals: '', events: '', notes: '' })
  const [ministryPlan, setMinistryPlan] = useState({ title: '', ministry: '', objectives: '', resources: '' })
  const [uploading, setUploading] = useState(false)
  const [materialSearch, setMaterialSearch] = useState('')
  const [materialResults, setMaterialResults] = useState<any[]>([])
  const [materialSearching, setMaterialSearching] = useState(false)
  const [showMaterialResults, setShowMaterialResults] = useState(false)

  useEffect(() => { getPlans().then(setPlans) }, [refresh])

  const searchMaterials = async (query: string) => {
    if (!query.trim() || query.length < 2) { setMaterialResults([]); return }
    setMaterialSearching(true)
    try {
      const result = await smartSearchDropbox(query)
      const docs = (result.entries || []).filter((e: any) => {
        const ext = (e.ext || '').toLowerCase()
        return e.tag === 'file' && (ext === 'pdf' || ext === 'doc' || ext === 'docx')
      })
      setMaterialResults(docs.slice(0, 8))
      setShowMaterialResults(true)
    } catch { setMaterialResults([]) }
    finally { setMaterialSearching(false) }
  }
  useEffect(() => {
    Promise.all([getWebinars(), getMentoringSessions()]).then(([webinars, sessions]) => {
      const items: any[] = []
      webinars.filter((w: any) => (w.enrolledUsers || []).includes(user?.id)).forEach((w: any) => {
        items.push({ id: w.id, type: 'webinar', title: w.title, description: w.description, scheduledAt: w.scheduledAt, meetingUrl: w.meetingUrl, person: w.hostName })
      })
      sessions.filter((s: any) => s.mentorId === user?.id || s.pastorId === user?.id).forEach((s: any) => {
        items.push({ id: s.id, type: 'mentoria', title: s.title, description: s.description, scheduledAt: s.scheduledAt, meetingUrl: s.meetingUrl, person: s.mentorId === user?.id ? s.pastorName : s.mentorName, status: s.status })
      })
      items.sort((a, b) => (a.scheduledAt || '').localeCompare(b.scheduledAt || ''))
      setAgendaItems(items)
    })
  }, [refresh, user])

  const showSaveMsg = () => { setSaveMsg(t('planning.saved')); setTimeout(() => setSaveMsg(''), 3000) }

  const handleSaveSunday = async () => { if (!sundayPlan.title.trim()) return; await savePlan('sunday', sundayPlan.title, sundayPlan, editingPlan ?? undefined); setSundayPlan({ title: '', date: '', worship: '', message: '', notes: '', materialId: '', fileUrl: '', fileName: '' }); setEditingPlan(null); setTab('visao'); showSaveMsg(); setRefresh(r => r + 1) }
  const handleSaveAnnual = async () => { if (!annualPlan.title.trim()) return; await savePlan('annual', annualPlan.title, annualPlan, editingPlan ?? undefined); setAnnualPlan({ title: '', goals: '', events: '', notes: '' }); setEditingPlan(null); setTab('visao'); showSaveMsg(); setRefresh(r => r + 1) }
  const handleSaveMinistry = async () => { if (!ministryPlan.title.trim()) return; await savePlan('ministry', ministryPlan.title, ministryPlan, editingPlan ?? undefined); setMinistryPlan({ title: '', ministry: '', objectives: '', resources: '' }); setEditingPlan(null); setTab('visao'); showSaveMsg(); setRefresh(r => r + 1) }

  const handleEdit = (plan: any) => {
    setEditingPlan(plan.id)
    if (plan.type === 'sunday') { setSundayPlan(plan.data); setTab('domingo') }
    else if (plan.type === 'annual') { setAnnualPlan(plan.data); setTab('anual') }
    else { setMinistryPlan(plan.data); setTab('ministerio') }
  }
  const handleDelete = async (planId: string) => { if (confirm(t('planning.remove') + '?')) { await deletePlan(planId); setRefresh(r => r + 1) } }

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    try {
      const presign = await getUploadPresignedUrl(file.name, file.type)
      await fetch(presign.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      setSundayPlan(p => ({ ...p, fileUrl: presign.fileUrl, fileName: file.name }))
    } catch { /* ignore */ }
    finally { setUploading(false) }
  }

  const contentSuggestions = ['Série: Propósitos de Deus', 'Louvor: Oceanos', 'Dinâmica: Quebra-gelo PG', 'Vídeo: Testemunho Inspire', 'Material: Estudo Bíblico Semanal']

  // Calendar helpers
  const monthName = new Date(calYear, calMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const firstDay = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const today = new Date()

  // Build calendar grid
  const weeks: (number | null)[][] = []
  let week: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d)
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length > 0) { while (week.length < 7) week.push(null); weeks.push(week) }

  // Events for this month (plans + agenda items)
  const monthEvents: Record<number, any[]> = {}
  plans.forEach(p => {
    const d = p.data?.date ? new Date(p.data.date) : new Date(p.updatedAt)
    if (d.getMonth() === calMonth && d.getFullYear() === calYear) {
      const day = d.getDate()
      if (!monthEvents[day]) monthEvents[day] = []
      monthEvents[day].push({ ...p, eventType: p.type })
    }
  })
  agendaItems.forEach(item => {
    const d = new Date(item.scheduledAt)
    if (d.getMonth() === calMonth && d.getFullYear() === calYear) {
      const day = d.getDate()
      if (!monthEvents[day]) monthEvents[day] = []
      monthEvents[day].push(item)
    }
  })

  // Upcoming items (next events from all sources)
  const allUpcoming = [
    ...plans.map(p => ({ ...p, eventType: p.type, scheduledAt: p.data?.date || p.updatedAt, title: p.title })),
    ...agendaItems,
  ].filter(e => new Date(e.scheduledAt) >= new Date(today.getFullYear(), today.getMonth(), today.getDate()))
    .sort((a, b) => (a.scheduledAt || '').localeCompare(b.scheduledAt || ''))
    .slice(0, 8)

  const typeConfig: Record<string, { icon: typeof Calendar; color: string; bg: string; label: string }> = {
    sunday: { icon: Church, color: 'text-blue-600', bg: 'bg-blue-50', label: t('planning.sunday') },
    annual: { icon: Target, color: 'text-gray-700', bg: 'bg-gray-100', label: t('planning.annual') },
    ministry: { icon: Users, color: 'text-green-600', bg: 'bg-green-50', label: t('planning.ministry') },
    webinar: { icon: Video, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Webinar' },
    mentoria: { icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Mentoria' },
  }

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) } else setCalMonth(m => m - 1) }
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) } else setCalMonth(m => m + 1) }
  const goToday = () => { setCalMonth(today.getMonth()); setCalYear(today.getFullYear()) }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('planning.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('planning.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setTab('domingo'); setEditingPlan(null) }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2">
            <Plus size={16} /> Nova Celebração
          </button>
        </div>
      </div>

      {saveMsg && <div className="mb-4 rounded-xl bg-green-50 border border-green-100 p-3 text-sm text-green-700">{saveMsg}</div>}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { key: 'visao', label: '📊 Visão Geral' },
          { key: 'domingo', label: '🙏 Monte sua Celebração' },
          { key: 'anual', label: '📅 Plano Anual' },
          { key: 'ministerio', label: '⛪ Ministério' },
        ].map(tb => (
          <button key={tb.key} onClick={() => { setTab(tb.key as any); setEditingPlan(null) }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === tb.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* ═══ VISÃO GERAL ═══ */}
      {tab === 'visao' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calendar - Left */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              {/* Calendar header */}
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-gray-900 capitalize">{monthName}</h2>
                  <button onClick={goToday} className="text-xs text-green-600 hover:text-green-800 font-medium px-2 py-1 rounded-lg hover:bg-green-50 transition">Hoje</button>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500"><ChevronLeft size={18} /></button>
                  <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500"><ChevronRight size={18} /></button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 text-center border-b">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                  <div key={d} className="py-2.5 text-[11px] font-semibold text-gray-400 uppercase">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              {weeks.map((wk, wi) => (
                <div key={wi} className="grid grid-cols-7">
                  {wk.map((day, di) => {
                    const isToday = day && calYear === today.getFullYear() && calMonth === today.getMonth() && day === today.getDate()
                    const events = day ? monthEvents[day] : undefined
                    return (
                      <div key={di} className={`min-h-[80px] p-1.5 border-b border-r last:border-r-0 ${!day ? 'bg-gray-50/50' : 'hover:bg-gray-50/50'}`}>
                        {day && (
                          <>
                            <span className={`inline-flex items-center justify-center w-6 h-6 text-[12px] rounded-full ${isToday ? 'bg-green-600 text-white font-bold' : 'text-gray-600'}`}>
                              {day}
                            </span>
                            {events && events.slice(0, 3).map((ev: any, ei: number) => {
                              const cfg = typeConfig[ev.type || ev.eventType] || typeConfig.sunday
                              return (
                                <div key={ei} className={`mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium truncate ${cfg.bg} ${cfg.color}`}>
                                  {ev.title}
                                </div>
                              )
                            })}
                            {events && events.length > 3 && (
                              <p className="text-[9px] text-gray-400 mt-0.5 pl-1">+{events.length - 3} mais</p>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}

              {/* Legend */}
              <div className="flex gap-4 px-5 py-3 border-t text-[10px] text-gray-500 flex-wrap">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-50 border border-blue-200" /> Culto</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-purple-50 border border-purple-200" /> Webinar</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-50 border border-indigo-200" /> Mentoria</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-50 border border-green-200" /> Ministério</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-gray-100 border border-gray-200" /> Anual</span>
              </div>
            </div>
          </div>

          {/* Right sidebar: upcoming + plans */}
          <div className="lg:col-span-4 space-y-5">
            {/* Upcoming events */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Clock size={14} /> Próximos</h3>
              </div>
              <div className="divide-y max-h-[300px] overflow-y-auto">
                {allUpcoming.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">Nenhum evento próximo</p>
                )}
                {allUpcoming.map((item, i) => {
                  const cfg = typeConfig[item.type || item.eventType] || typeConfig.sunday
                  const Icon = cfg.icon
                  const d = new Date(item.scheduledAt)
                  return (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition">
                      <div className={`flex-shrink-0 w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                        <Icon size={16} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-gray-900 truncate">{item.title}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · {d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* My plans summary */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><FileText size={14} /> Meus Planos</h3>
                <span className="text-[10px] text-gray-400">{plans.length} planos</span>
              </div>
              <div className="divide-y max-h-[350px] overflow-y-auto">
                {plans.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-400">Nenhum plano criado</p>
                    <button onClick={() => setTab('domingo')} className="mt-2 text-xs text-green-600 hover:text-green-800 font-medium">Criar primeiro plano →</button>
                  </div>
                )}
                {plans.map(p => {
                  const cfg = typeConfig[p.type] || typeConfig.sunday
                  const Icon = cfg.icon
                  return (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition group">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                        <Icon size={14} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-gray-900 truncate">{p.title}</p>
                        <p className="text-[10px] text-gray-400">{cfg.label} · {new Date(p.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Edit2 size={12} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MONTAR DOMINGO ═══ */}
      {tab === 'domingo' && (
        <div className="max-w-2xl">
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-5">
              <Church size={20} className="text-blue-600" /> Monte sua Celebração
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('planning.worshipTitle')}</label>
                <input type="text" value={sundayPlan.title} onChange={e => setSundayPlan({ ...sundayPlan, title: e.target.value })}
                  placeholder="Ex: Culto de Celebração - Série Propósitos"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('planning.calendar')}</label>
                <input type="date" value={sundayPlan.date} onChange={e => setSundayPlan({ ...sundayPlan, date: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><Music size={14} /> {t('planning.worship')}</label>
                <textarea value={sundayPlan.worship} onChange={e => setSundayPlan({ ...sundayPlan, worship: e.target.value })} rows={2}
                  placeholder="Liste as músicas do louvor..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('planning.preaching')}</label>
                <textarea value={sundayPlan.message} onChange={e => setSundayPlan({ ...sundayPlan, message: e.target.value })} rows={2}
                  placeholder="Tema da mensagem, passagem bíblica..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">📝 {t('planning.selectMaterial')}</label>
                <div className="relative">
                  <input type="text" value={materialSearch}
                    onChange={e => { setMaterialSearch(e.target.value); searchMaterials(e.target.value) }}
                    onFocus={() => { if (materialResults.length > 0) setShowMaterialResults(true) }}
                    placeholder="Digite o título para buscar materiais (PDF, DOC)..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition" />
                  {materialSearching && <Loader2 size={14} className="absolute right-3 top-3 animate-spin text-gray-400" />}
                  {sundayPlan.materialId && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">✓ Vinculado: {sundayPlan.materialId.split('/').pop()}</p>
                  )}
                  {showMaterialResults && materialResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-[200px] overflow-y-auto">
                      {materialResults.map(file => (
                        <button key={file.id} onClick={() => {
                          setSundayPlan({ ...sundayPlan, materialId: file.pathLower || file.path })
                          setMaterialSearch(file.name)
                          setShowMaterialResults(false)
                        }}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition flex items-center gap-3 border-b last:border-b-0">
                          <FileText size={14} className={file.ext === 'pdf' ? 'text-red-500' : 'text-blue-500'} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-[10px] text-gray-400 truncate">{file.path}</p>
                          </div>
                          <span className="text-[10px] uppercase font-medium text-gray-400">{file.ext}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><Upload size={14} /> {t('planning.fileUpload')}</label>
                <input type="file" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
                {uploading && <p className="text-xs text-blue-600 mt-1 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> {t('planning.uploading')}</p>}
                {sundayPlan.fileUrl && !uploading && <p className="text-xs text-green-600 mt-1">✓ {t('planning.fileUploaded')}: {sundayPlan.fileName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('planning.contentSuggestions')}</label>
                <div className="flex flex-wrap gap-2">
                  {contentSuggestions.map(s => (
                    <button key={s} type="button" onClick={() => setSundayPlan({ ...sundayPlan, notes: sundayPlan.notes + '\n' + s })}
                      className="bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-[11px] hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition">
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('planning.notes')}</label>
                <textarea value={sundayPlan.notes} onChange={e => setSundayPlan({ ...sundayPlan, notes: e.target.value })} rows={3}
                  placeholder="Observações, lembretes..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveSunday} disabled={!sundayPlan.title.trim()}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition">
                  {editingPlan ? t('planning.update') : t('planning.save')} {t('planning.savePlanning')}
                </button>
                {editingPlan && (
                  <button onClick={() => { setEditingPlan(null); setSundayPlan({ title: '', date: '', worship: '', message: '', notes: '', materialId: '', fileUrl: '', fileName: '' }) }}
                    className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PLANO ANUAL ═══ */}
      {tab === 'anual' && (
        <div className="max-w-2xl">
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-5">
              <Target size={20} className="text-gray-700" /> {t('planning.annualTitle')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common.title')}</label>
                <input type="text" value={annualPlan.title} onChange={e => setAnnualPlan({ ...annualPlan, title: e.target.value })}
                  placeholder="Ex: Plano 2026 - Igreja Inspire SP"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('planning.yearGoals')}</label>
                <textarea value={annualPlan.goals} onChange={e => setAnnualPlan({ ...annualPlan, goals: e.target.value })} rows={4}
                  placeholder="Quais são as metas para este ano?"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('planning.eventsCampaigns')}</label>
                <textarea value={annualPlan.events} onChange={e => setAnnualPlan({ ...annualPlan, events: e.target.value })} rows={4}
                  placeholder="Eventos, campanhas e datas importantes..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('planning.notes')}</label>
                <textarea value={annualPlan.notes} onChange={e => setAnnualPlan({ ...annualPlan, notes: e.target.value })} rows={2}
                  placeholder="Observações gerais..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveAnnual} disabled={!annualPlan.title.trim()}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition">
                  {editingPlan ? t('planning.update') : t('planning.save')} {t('planning.savePlanning')}
                </button>
                {editingPlan && (
                  <button onClick={() => { setEditingPlan(null); setAnnualPlan({ title: '', goals: '', events: '', notes: '' }) }}
                    className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PLANO MINISTÉRIO ═══ */}
      {tab === 'ministerio' && (
        <div className="max-w-2xl">
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-5">
              <Users size={20} className="text-green-600" /> {t('planning.ministryTitle')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common.title')}</label>
                <input type="text" value={ministryPlan.title} onChange={e => setMinistryPlan({ ...ministryPlan, title: e.target.value })}
                  placeholder="Ex: Planejamento Jovens - 1º Semestre"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('planning.ministry')}</label>
                <select value={ministryPlan.ministry} onChange={e => setMinistryPlan({ ...ministryPlan, ministry: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition">
                  <option value="">Selecione o ministério</option>
                  <option value="jovens">Jovens</option>
                  <option value="criancas">Crianças</option>
                  <option value="mulheres">Mulheres</option>
                  <option value="homens">Homens</option>
                  <option value="casais">Casais</option>
                  <option value="pg">Pequenos Grupos</option>
                  <option value="louvor">Louvor</option>
                  <option value="midia">Mídia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('planning.objectives')}</label>
                <textarea value={ministryPlan.objectives} onChange={e => setMinistryPlan({ ...ministryPlan, objectives: e.target.value })} rows={3}
                  placeholder="Objetivos e metas do ministério..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('planning.resources')}</label>
                <textarea value={ministryPlan.resources} onChange={e => setMinistryPlan({ ...ministryPlan, resources: e.target.value })} rows={3}
                  placeholder="Recursos necessários, equipe, orçamento..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveMinistry} disabled={!ministryPlan.title.trim()}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition">
                  {editingPlan ? t('planning.update') : t('planning.save')} {t('planning.savePlanning')}
                </button>
                {editingPlan && (
                  <button onClick={() => { setEditingPlan(null); setMinistryPlan({ title: '', ministry: '', objectives: '', resources: '' }) }}
                    className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
