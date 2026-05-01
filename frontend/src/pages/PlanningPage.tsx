import { useState, useEffect } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n/I18nContext'

export default function PlanningPage() {
  const { getPlans, savePlan, deletePlan, getWebinars, getMentoringSessions, getMaterials, getUploadPresignedUrl } = useData()
  const { user } = useAuth()
  const { t } = useI18n()
  const [tab, setTab] = useState<'meus' | 'agenda' | 'webinars' | 'domingo' | 'anual' | 'ministerio'>('meus')
  const [editingPlan, setEditingPlan] = useState<string | null>(null)
  const [saveMsg, setSaveMsg] = useState('')
  const [plans, setPlans] = useState<any[]>([])
  const [refresh, setRefresh] = useState(0)
  const [sundayPlan, setSundayPlan] = useState({ title: '', date: '', worship: '', message: '', notes: '', materialId: '', fileUrl: '', fileName: '' })
  const [annualPlan, setAnnualPlan] = useState({ title: '', goals: '', events: '', notes: '' })
  const [ministryPlan, setMinistryPlan] = useState({ title: '', ministry: '', objectives: '', resources: '' })
  const [agendaItems, setAgendaItems] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  useEffect(() => { getPlans().then(setPlans) }, [refresh])
  useEffect(() => { getMaterials().then(m => setMaterials(m.filter((x: any) => x.category === 'mensagem'))) }, [])
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

  const handleSaveSunday = async () => { if (!sundayPlan.title.trim()) return; await savePlan('sunday', sundayPlan.title, sundayPlan, editingPlan ?? undefined); setSundayPlan({ title: '', date: '', worship: '', message: '', notes: '', materialId: '', fileUrl: '', fileName: '' }); setEditingPlan(null); setTab('meus'); showSaveMsg(); setRefresh(r => r + 1) }
  const handleSaveAnnual = async () => { if (!annualPlan.title.trim()) return; await savePlan('annual', annualPlan.title, annualPlan, editingPlan ?? undefined); setAnnualPlan({ title: '', goals: '', events: '', notes: '' }); setEditingPlan(null); setTab('meus'); showSaveMsg(); setRefresh(r => r + 1) }
  const handleSaveMinistry = async () => { if (!ministryPlan.title.trim()) return; await savePlan('ministry', ministryPlan.title, ministryPlan, editingPlan ?? undefined); setMinistryPlan({ title: '', ministry: '', objectives: '', resources: '' }); setEditingPlan(null); setTab('meus'); showSaveMsg(); setRefresh(r => r + 1) }

  const handleEdit = (plan: any) => {
    setEditingPlan(plan.id)
    if (plan.type === 'sunday') { setSundayPlan(plan.data); setTab('domingo') }
    else if (plan.type === 'annual') { setAnnualPlan(plan.data); setTab('anual') }
    else { setMinistryPlan(plan.data); setTab('ministerio') }
  }
  const handleDelete = async (planId: string) => { if (confirm(t('planning.remove') + '?')) { await deletePlan(planId); setRefresh(r => r + 1) } }
  const typeLabel = (tp: string) => { if (tp === 'sunday') return { text: t('planning.sunday'), cls: 'bg-blue-100 text-blue-700' }; if (tp === 'annual') return { text: t('planning.annual'), cls: 'bg-gray-200 text-gray-800' }; if (tp === 'webinar') return { text: 'Webinar', cls: 'bg-purple-100 text-purple-700' }; return { text: t('planning.ministry'), cls: 'bg-green-100 text-green-700' } }
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{t('planning.title')}</h1>
      <p className="text-gray-600 mb-6">{t('planning.subtitle')}</p>
      {saveMsg && <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{saveMsg}</div>}
      <div className="flex gap-2 mb-6 border-b overflow-x-auto">
        {[{ key: 'meus', label: t('planning.myPlans') }, { key: 'agenda', label: `📋 ${t('planning.agenda')}` }, { key: 'webinars', label: `📹 ${t('planning.myWebinars')}` }, { key: 'domingo', label: t('planning.buildSunday') }, { key: 'anual', label: t('planning.annualPlan') }, { key: 'ministerio', label: t('planning.buildMinistry') }].map(tb => (
          <button key={tb.key} onClick={() => { setTab(tb.key as any); setEditingPlan(null) }} className={`pb-2 px-3 font-medium whitespace-nowrap text-sm ${tab === tb.key ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500'}`}>{tb.label}</button>
        ))}
      </div>
      {tab === 'meus' && (
        <div className="space-y-3">
          {plans.length === 0 && <p className="text-gray-500 text-center py-8">{t('planning.noPlans')}</p>}
          {plans.map(p => { const tl = typeLabel(p.type); return (
            <div key={p.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow flex justify-between items-center">
              <div><div className="flex items-center gap-2"><h3 className="font-semibold">{p.title}</h3><span className={`text-xs px-2 py-0.5 rounded-full ${tl.cls}`}>{tl.text}</span></div><p className="text-xs text-gray-500 mt-1">{t('planning.update')} {new Date(p.updatedAt).toLocaleDateString('pt-BR')}</p></div>
              <div className="flex gap-2"><button onClick={() => handleEdit(p)} className="text-gray-900 text-sm hover:underline">{t('common.edit')}</button><button onClick={() => handleDelete(p.id)} className="text-red-500 text-sm hover:underline">{t('planning.remove')}</button></div>
            </div>
          )})}
        </div>
      )}
      {tab === 'agenda' && (
        <div>
          {agendaItems.length === 0 && <p className="text-gray-500 text-center py-8">{t('planning.noAgenda')}</p>}
          {agendaItems.length > 0 && (() => {
            const grouped: Record<string, any[]> = {}
            agendaItems.forEach(item => {
              const d = new Date(item.scheduledAt)
              const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
              if (!grouped[key]) grouped[key] = []
              grouped[key].push(item)
            })
            const months = Object.keys(grouped).sort()
            const now = new Date()
            return (
              <div className="space-y-8">
                {months.map(monthKey => {
                  const [y, m] = monthKey.split('-').map(Number)
                  const monthName = new Date(y, m - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                  const items = grouped[monthKey]
                  const firstDay = new Date(y, m - 1, 1).getDay()
                  const daysInMonth = new Date(y, m, 0).getDate()
                  const eventDays: Record<number, any[]> = {}
                  items.forEach(it => { const day = new Date(it.scheduledAt).getDate(); if (!eventDays[day]) eventDays[day] = []; eventDays[day].push(it) })
                  const weeks: (number | null)[][] = []
                  let week: (number | null)[] = Array(firstDay).fill(null)
                  for (let d = 1; d <= daysInMonth; d++) {
                    week.push(d)
                    if (week.length === 7) { weeks.push(week); week = [] }
                  }
                  if (week.length > 0) { while (week.length < 7) week.push(null); weeks.push(week) }
                  return (
                    <div key={monthKey}>
                      <h3 className="text-lg font-semibold capitalize mb-3">{monthName}</h3>
                      <div className="bg-white border rounded-lg overflow-hidden mb-4">
                        <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 border-b">
                          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <div key={d} className="py-2">{d}</div>)}
                        </div>
                        {weeks.map((wk, wi) => (
                          <div key={wi} className="grid grid-cols-7 text-center">
                            {wk.map((day, di) => {
                              const isToday = day && y === now.getFullYear() && m - 1 === now.getMonth() && day === now.getDate()
                              const hasEvents = day && eventDays[day]
                              return (
                                <div key={di} className={`py-2 min-h-[48px] border-b border-r last:border-r-0 relative ${!day ? 'bg-gray-50' : ''} ${isToday ? 'bg-blue-50' : ''}`}>
                                  {day && <span className={`text-sm ${isToday ? 'font-bold text-blue-700' : 'text-gray-700'}`}>{day}</span>}
                                  {hasEvents && (
                                    <div className="flex justify-center gap-0.5 mt-0.5">
                                      {eventDays[day!].map((ev: any, ei: number) => (
                                        <div key={ei} className={`w-2 h-2 rounded-full ${ev.type === 'webinar' ? 'bg-purple-500' : 'bg-blue-500'}`} title={ev.title} />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        {items.map(item => {
                          const isWebinar = item.type === 'webinar'
                          const isPast = new Date(item.scheduledAt) < now
                          const d = new Date(item.scheduledAt)
                          return (
                            <div key={`${item.type}-${item.id}`} className={`flex items-start gap-3 bg-white border rounded-lg p-3 ${isPast ? 'opacity-50' : ''}`}>
                              <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center text-white text-xs font-bold ${isWebinar ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                <span className="text-lg leading-none">{d.getDate()}</span>
                                <span className="text-[10px] uppercase">{d.toLocaleDateString('pt-BR', { month: 'short' })}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${isWebinar ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {isWebinar ? '📹 Webinar' : '🎓 Mentoria'}
                                  </span>
                                  {item.status === 'completed' && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓</span>}
                                </div>
                                <h4 className="font-medium text-sm mt-1 truncate">{item.title}</h4>
                                <p className="text-xs text-gray-500">{d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · {item.person}</p>
                              </div>
                              {item.meetingUrl && !isPast && (
                                <a href={item.meetingUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 bg-gray-900 text-white px-3 py-1.5 rounded text-xs hover:bg-gray-800">{t('planning.calendar')}</a>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
                <div className="flex gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-purple-500 inline-block" /> Webinar</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Mentoria</span>
                </div>
              </div>
            )
          })()}
        </div>
      )}
      {tab === 'webinars' && (
        <div className="space-y-3">
          {plans.filter(p => p.type === 'webinar').length === 0 && <p className="text-gray-500 text-center py-8">{t('planning.noWebinars')}</p>}
          {plans.filter(p => p.type === 'webinar').map(p => {
            const d = p.data || {}
            return (
              <div key={p.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{d.title || p.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Webinar</span>
                    </div>
                    {d.description && <p className="text-sm text-gray-600 mt-1">{d.description}</p>}
                    <p className="text-sm text-gray-500 mt-1">🎤 {d.hostName} · 📅 {d.scheduledAt ? new Date(d.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</p>
                  </div>
                  <div className="flex gap-2">
                    {d.meetingUrl && <a href={d.meetingUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">{t('planning.calendar')}</a>}
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 text-sm hover:underline">{t('planning.remove')}</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {tab === 'domingo' && (
        <div className="bg-white border rounded-lg p-6 max-w-2xl">
          <h2 className="font-semibold text-lg mb-4">🙏 {t('planning.sundayTitle')}</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('planning.worshipTitle')}</label><input type="text" value={sundayPlan.title} onChange={e => setSundayPlan({ ...sundayPlan, title: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('planning.calendar')}</label><input type="date" value={sundayPlan.date} onChange={e => setSundayPlan({ ...sundayPlan, date: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('planning.worship')}</label><textarea value={sundayPlan.worship} onChange={e => setSundayPlan({ ...sundayPlan, worship: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('planning.preaching')}</label><textarea value={sundayPlan.message} onChange={e => setSundayPlan({ ...sundayPlan, message: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2" /></div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📝 {t('planning.selectMaterial')}</label>
              <select value={sundayPlan.materialId} onChange={e => setSundayPlan({ ...sundayPlan, materialId: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                <option value="">{t('planning.noMaterialSelected')}</option>
                {materials.map((m: any) => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📎 {t('planning.fileUpload')}</label>
              <input type="file" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
              {uploading && <p className="text-xs text-blue-600 mt-1">{t('planning.uploading')}</p>}
              {sundayPlan.fileUrl && !uploading && <p className="text-xs text-green-600 mt-1">✓ {t('planning.fileUploaded')}: {sundayPlan.fileName}</p>}
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('planning.contentSuggestions')}</label><div className="flex flex-wrap gap-2">{contentSuggestions.map(s => (<button key={s} type="button" onClick={() => setSundayPlan({ ...sundayPlan, notes: sundayPlan.notes + '\n' + s })} className="bg-gray-50 text-gray-800 px-3 py-1 rounded-full text-xs hover:bg-gray-200">+ {s}</button>))}</div></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('planning.notes')}</label><textarea value={sundayPlan.notes} onChange={e => setSundayPlan({ ...sundayPlan, notes: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2" /></div>
            <button onClick={handleSaveSunday} disabled={!sundayPlan.title.trim()} className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50">{editingPlan ? t('planning.update') : t('planning.save')} {t('planning.savePlanning')}</button>
          </div>
        </div>
      )}
      {tab === 'anual' && (
        <div className="bg-white border rounded-lg p-6 max-w-2xl">
          <h2 className="font-semibold text-lg mb-4">📅 {t('planning.annualTitle')}</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('common.title')}</label><input type="text" value={annualPlan.title} onChange={e => setAnnualPlan({ ...annualPlan, title: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('planning.yearGoals')}</label><textarea value={annualPlan.goals} onChange={e => setAnnualPlan({ ...annualPlan, goals: e.target.value })} rows={4} className="w-full border rounded-lg px-3 py-2" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('planning.eventsCampaigns')}</label><textarea value={annualPlan.events} onChange={e => setAnnualPlan({ ...annualPlan, events: e.target.value })} rows={4} className="w-full border rounded-lg px-3 py-2" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('planning.notes')}</label><textarea value={annualPlan.notes} onChange={e => setAnnualPlan({ ...annualPlan, notes: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2" /></div>
            <button onClick={handleSaveAnnual} disabled={!annualPlan.title.trim()} className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50">{editingPlan ? t('planning.update') : t('planning.save')} {t('planning.savePlanning')}</button>
          </div>
        </div>
      )}
      {tab === 'ministerio' && (
        <div className="bg-white border rounded-lg p-6 max-w-2xl">
          <h2 className="font-semibold text-lg mb-4">⛪ {t('planning.ministryTitle')}</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('common.title')}</label><input type="text" value={ministryPlan.title} onChange={e => setMinistryPlan({ ...ministryPlan, title: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('planning.ministry')}</label><select value={ministryPlan.ministry} onChange={e => setMinistryPlan({ ...ministryPlan, ministry: e.target.value })} className="w-full border rounded-lg px-3 py-2"><option value="">—</option><option value="jovens">Jovens</option><option value="criancas">Crianças</option><option value="mulheres">Mulheres</option><option value="homens">Homens</option><option value="casais">Casais</option><option value="pg">Pequenos Grupos</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('planning.objectives')}</label><textarea value={ministryPlan.objectives} onChange={e => setMinistryPlan({ ...ministryPlan, objectives: e.target.value })} rows={3} className="w-full border rounded-lg px-3 py-2" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('planning.resources')}</label><textarea value={ministryPlan.resources} onChange={e => setMinistryPlan({ ...ministryPlan, resources: e.target.value })} rows={3} className="w-full border rounded-lg px-3 py-2" /></div>
            <button onClick={handleSaveMinistry} disabled={!ministryPlan.title.trim()} className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50">{editingPlan ? t('planning.update') : t('planning.save')} {t('planning.savePlanning')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
