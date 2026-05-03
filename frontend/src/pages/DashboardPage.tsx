import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import { ClipboardList, BarChart3, Trophy, Newspaper, BookOpen, Route, GraduationCap, FileText, MessageSquare, Pin, Medal } from 'lucide-react'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { getMetrics, getLeaderRanking, getTimeline, getRecentAccesses, getWebinars, getMentoringSessions } = useData()
  const { user, getLeaders } = useAuth()
  const { t } = useI18n()
  const [tab, setTab] = useState<'visao' | 'ranking' | 'timeline'>('visao')
  const [metrics, setMetrics] = useState<any>({ totalLeaders: 0, activeLeaders: 0, totalContentAccessed: 0, trailsInProgress: 0, trailsCompleted: 0 })
  const [pastorCount, setPastorCount] = useState(0)
  const [ranking, setRanking] = useState<any[]>([])
  const [timeline, setTimeline] = useState<any[]>([])
  const [recentAccesses, setRecentAccesses] = useState<any[]>([])
  const [agendaItems, setAgendaItems] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    getMetrics().then(setMetrics)
    getLeaderRanking().then(setRanking)
    getTimeline().then(setTimeline)
    getRecentAccesses().then(setRecentAccesses)
    getLeaders().then(leaders => {
      setPastorCount(leaders.filter((l: any) => l.role === 'pastor_presidente').length)
      if (user) {
        const me = leaders.find((l: any) => l.id === user.id)
        if (me) setUserProfile(me)
      }
    })
    Promise.all([getWebinars(), getMentoringSessions()]).then(([webinars, sessions]) => {
      const items: any[] = []
      webinars.filter((w: any) => (w.enrolledUsers || []).includes(user?.id)).forEach((w: any) => {
        items.push({ id: w.id, type: 'webinar', title: w.title, scheduledAt: w.scheduledAt, person: w.hostName, meetingUrl: w.meetingUrl })
      })
      sessions.filter((s: any) => s.mentorId === user?.id || s.pastorId === user?.id).forEach((s: any) => {
        items.push({ id: s.id, type: 'mentoria', title: s.title, scheduledAt: s.scheduledAt, person: s.mentorId === user?.id ? s.pastorName : s.mentorName, status: s.status, meetingUrl: s.meetingUrl })
      })
      items.sort((a, b) => (a.scheduledAt || '').localeCompare(b.scheduledAt || ''))
      setAgendaItems(items)
    })
  }, [])

  const now = new Date()
  const upcomingItems = agendaItems.filter(i => new Date(i.scheduledAt) >= now).slice(0, 5)

  const roleLabel = user?.role === 'admin' ? 'Admin' : user?.role === 'pastor_presidente' ? 'Pastor' : user?.role === 'lider' ? 'Líder' : 'Membro'
  const greeting = (() => { const h = now.getHours(); if (h < 12) return t('dashboard.goodMorning'); if (h < 18) return t('dashboard.goodAfternoon'); return t('dashboard.goodEvening') })()

  // Calendar data for agenda
  const agendaCalendar = (() => {
    if (agendaItems.length === 0) return null
    const grouped: Record<string, any[]> = {}
    agendaItems.forEach(item => {
      const d = new Date(item.scheduledAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(item)
    })
    const months = Object.keys(grouped).sort()
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const nextKey = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`
    const relevantMonths = months.filter(m => m >= currentKey && m <= nextKey)
    if (relevantMonths.length === 0 && months.length > 0) return { months: [months[0]], grouped }
    return { months: relevantMonths.length > 0 ? relevantMonths : months.slice(0, 1), grouped }
  })()

  return (
    <div>
      {/* User greeting */}
      <div className="flex items-center gap-4 mb-6">
        {userProfile?.photoUrl ? (
          <img src={userProfile.photoUrl} className="w-14 h-14 rounded-full object-cover border-2 border-gray-200" alt="" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center text-white text-lg font-bold">
            {(user?.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-800">{greeting}, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-sm text-gray-500">{roleLabel} · {t('dashboard.platform')}</p>
        </div>
      </div>

      {/* Upcoming agenda */}
      {upcomingItems.length > 0 && (
        <div className="mb-6 bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><ClipboardList size={18} /> {t('dashboard.upcomingCommitments')}</h2>
            <button onClick={() => navigate('/planning')} className="text-xs text-gray-500 hover:text-gray-900">{t('dashboard.viewFullAgenda')} →</button>
          </div>
          <div className="space-y-2">
            {upcomingItems.map(item => {
              const isWebinar = item.type === 'webinar'
              const d = new Date(item.scheduledAt)
              return (
                <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white text-xs font-bold ${isWebinar ? 'bg-purple-500' : 'bg-blue-500'}`}>
                    <span className="text-sm leading-none">{d.getDate()}</span>
                    <span className="text-[9px] uppercase">{d.toLocaleDateString('pt-BR', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-gray-500">{d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · {item.person}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isWebinar ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {isWebinar ? 'Webinar' : t('mentoring.title')}
                  </span>
                  {item.meetingUrl && (
                    <a href={item.meetingUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 bg-gray-900 text-white px-2 py-1 rounded text-xs hover:bg-gray-800">{t('mentoring.access')}</a>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Agenda calendar */}
      {agendaCalendar && agendaCalendar.months.length > 0 && (
        <div className="mb-6">
          {agendaCalendar.months.map(monthKey => {
            const [y, m] = monthKey.split('-').map(Number)
            const monthName = new Date(y, m - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
            const items = agendaCalendar.grouped[monthKey] || []
            const firstDay = new Date(y, m - 1, 1).getDay()
            const daysInMonth = new Date(y, m, 0).getDate()
            const eventDays: Record<number, any[]> = {}
            items.forEach((it: any) => { const day = new Date(it.scheduledAt).getDate(); if (!eventDays[day]) eventDays[day] = []; eventDays[day].push(it) })
            const weeks: (number | null)[][] = []
            let week: (number | null)[] = Array(firstDay).fill(null)
            for (let d = 1; d <= daysInMonth; d++) { week.push(d); if (week.length === 7) { weeks.push(week); week = [] } }
            if (week.length > 0) { while (week.length < 7) week.push(null); weeks.push(week) }
            return (
              <div key={monthKey} className="bg-white border rounded-lg overflow-hidden mb-4">
                <div className="px-4 py-2 bg-gray-50 border-b"><h3 className="text-sm font-semibold capitalize text-gray-700">{monthName}</h3></div>
                <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 border-b">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <div key={d} className="py-1.5">{d}</div>)}
                </div>
                {weeks.map((wk, wi) => (
                  <div key={wi} className="grid grid-cols-7 text-center">
                    {wk.map((day, di) => {
                      const isToday = day && y === now.getFullYear() && m - 1 === now.getMonth() && day === now.getDate()
                      const hasEvents = day && eventDays[day]
                      return (
                        <div key={di} className={`py-1.5 min-h-[40px] border-b border-r last:border-r-0 relative ${!day ? 'bg-gray-50' : ''} ${isToday ? 'bg-blue-50' : ''}`}>
                          {day && <span className={`text-xs ${isToday ? 'font-bold text-blue-700' : 'text-gray-700'}`}>{day}</span>}
                          {hasEvents && (
                            <div className="flex justify-center gap-0.5 mt-0.5">
                              {eventDays[day!].map((ev: any, ei: number) => (
                                <div key={ei} className={`w-1.5 h-1.5 rounded-full ${ev.type === 'webinar' ? 'bg-purple-500' : 'bg-blue-500'}`} title={ev.title} />
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )
          })}
          <div className="flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Webinar</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> {t('mentoring.title')}</span>
          </div>
        </div>
      )}

      {/* Metrics cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4 text-center"><p className="text-2xl font-bold text-gray-900">{metrics.totalLeaders}</p><p className="text-xs text-gray-500 mt-1">{t('dashboard.leaders')}</p></div>
        <div className="bg-white border rounded-lg p-4 text-center"><p className="text-2xl font-bold text-green-600">{metrics.activeLeaders}</p><p className="text-xs text-gray-500 mt-1">{t('dashboard.activeUsers')}</p></div>
        <div className="bg-white border rounded-lg p-4 text-center"><p className="text-2xl font-bold text-blue-600">{metrics.totalContentAccessed}</p><p className="text-xs text-gray-500 mt-1">{t('dashboard.accesses')}</p></div>
        <div className="bg-white border rounded-lg p-4 text-center"><p className="text-2xl font-bold text-amber-600">{metrics.trailsInProgress}</p><p className="text-xs text-gray-500 mt-1">{t('dashboard.trailsInProgress')}</p></div>
        <div className="bg-white border rounded-lg p-4 text-center"><p className="text-2xl font-bold text-purple-600">{pastorCount}</p><p className="text-xs text-gray-500 mt-1">{t('dashboard.pastors')}</p></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b">
        {([['visao', t('dashboard.overview')], ['ranking', t('dashboard.ranking')], ['timeline', t('dashboard.timeline')]] as [string, string][]).map(([key, label], idx) => (
          <button key={key} onClick={() => setTab(key as 'visao' | 'ranking' | 'timeline')} className={`pb-2 px-1 text-sm font-medium flex items-center gap-1.5 ${tab === key ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500'}`}>
            {idx === 0 ? <BarChart3 size={15} /> : idx === 1 ? <Trophy size={15} /> : <Newspaper size={15} />}
            {label}
          </button>
        ))}
      </div>

      {tab === 'visao' && (
        <div className="space-y-6">
          {recentAccesses.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-3">{t('dashboard.recentAccesses')}</h3>
              <div className="space-y-2">
                {recentAccesses.slice(0, 5).map((a: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{a.title || a.contentTitle || 'Conteúdo'}</span>
                    <span className="text-xs text-gray-400">{a.accessedAt ? new Date(a.accessedAt).toLocaleDateString('pt-BR') : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button onClick={() => navigate('/catalog')} className="bg-white border rounded-lg p-4 text-center hover:shadow-md transition-shadow"><BookOpen size={24} className="mx-auto text-gray-600" /><p className="text-xs mt-2 text-gray-700">{t('dashboard.totalContent')}</p></button>
            <button onClick={() => navigate('/trails')} className="bg-white border rounded-lg p-4 text-center hover:shadow-md transition-shadow"><Route size={24} className="mx-auto text-gray-600" /><p className="text-xs mt-2 text-gray-700">{t('dashboard.totalTrails')}</p></button>
            <button onClick={() => navigate('/mentoring')} className="bg-white border rounded-lg p-4 text-center hover:shadow-md transition-shadow"><GraduationCap size={24} className="mx-auto text-gray-600" /><p className="text-xs mt-2 text-gray-700">{t('dashboard.totalMentoring')}</p></button>
            <button onClick={() => navigate('/planning')} className="bg-white border rounded-lg p-4 text-center hover:shadow-md transition-shadow"><ClipboardList size={24} className="mx-auto text-gray-600" /><p className="text-xs mt-2 text-gray-700">{t('dashboard.upcomingCommitments')}</p></button>
          </div>
        </div>
      )}

      {tab === 'ranking' && (
        <div className="bg-white border rounded-lg overflow-hidden">
          {ranking.length === 0 ? <p className="text-gray-500 text-center py-8">{t('dashboard.noRanking')}</p> : (
            <table className="w-full"><thead className="bg-gray-50 border-b"><tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('dashboard.leaders')}</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('dashboard.totalTrails')}</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('header.points')}</th>
            </tr></thead><tbody className="divide-y">
              {ranking.map((r: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{i === 0 ? <Medal size={18} className="text-yellow-500" /> : i === 1 ? <Medal size={18} className="text-gray-400" /> : i === 2 ? <Medal size={18} className="text-amber-700" /> : `${i + 1}º`}</td>
                  <td className="px-4 py-3 text-sm">{r.name}</td>
                  <td className="px-4 py-3 text-sm text-right">{r.trails}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold">{r.score}</td>
                </tr>
              ))}
            </tbody></table>
          )}
        </div>
      )}

      {tab === 'timeline' && (
        <div className="space-y-3">
          {timeline.length === 0 ? <p className="text-gray-500 text-center py-8">{t('dashboard.noTimeline')}</p> : (
            timeline.map((tl: any, i: number) => (
              <div key={i} className="flex gap-3 bg-white border rounded-lg p-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                  {tl.type === 'content' ? <FileText size={18} /> : tl.type === 'trail' ? <Route size={18} /> : tl.type === 'message' ? <MessageSquare size={18} /> : <Pin size={18} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{tl.title || tl.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{tl.createdAt ? new Date(tl.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' }) : ''}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
