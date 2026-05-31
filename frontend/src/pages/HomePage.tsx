import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { useI18n } from '../i18n/I18nContext'
import { Play, Star, Calendar, ArrowRight, TrendingUp, Flame, Lightbulb, Download, Users, Sparkles, X, ChevronRight, Route } from 'lucide-react'

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useI18n()
  const { getYoutubeVideos, getTrails, getWebinars, getPointsRanking, getMyPoints, getMentoringSessions, getTopDownloads, getBanner } = useData()

  const [videos, setVideos] = useState<any[]>([])
  const [trails, setTrails] = useState<any[]>([])
  const [nextWebinar, setNextWebinar] = useState<any>(null)
  const [upcomingWebinars, setUpcomingWebinars] = useState<any[]>([])
  const [pointsRanking, setPointsRanking] = useState<any[]>([])
  const [myPoints, setMyPoints] = useState(0)
  const [topDownloads, setTopDownloads] = useState<any[]>([])
  const [nextMentoring, setNextMentoring] = useState<any>(null)
  const [upcomingMentorings, setUpcomingMentorings] = useState<any[]>([])
  const [banner, setBanner] = useState<{ active: boolean; message: string; type: string }>({ active: false, message: '', type: 'info' })
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(true)

  useEffect(() => {
    getYoutubeVideos(undefined, 12).then(d => setVideos(d.videos))
    getTrails().then(setTrails)
    getPointsRanking().then(setPointsRanking)
    getMyPoints().then(setMyPoints)
    getTopDownloads().then(setTopDownloads)
    getBanner().then(setBanner)
    getWebinars().then(w => {
      const sorted = w.sort((a: any, b: any) => a.scheduledAt?.localeCompare(b.scheduledAt || ''))
      setNextWebinar(sorted[0] || null)
      setUpcomingWebinars(sorted.slice(0, 3))
    })
    getMentoringSessions().then(sessions => {
      const now = new Date().toISOString()
      const upcoming = sessions.filter((s: any) => s.scheduledAt > now && s.status !== 'completed')
        .sort((a: any, b: any) => a.scheduledAt.localeCompare(b.scheduledAt))
      setUpcomingMentorings(upcoming.slice(0, 3))
      if (upcoming.length > 0) setNextMentoring(upcoming[0])
      else {
        const completed = sessions.filter((s: any) => s.status === 'completed')
          .sort((a: any, b: any) => (b.scheduledAt || '').localeCompare(a.scheduledAt || ''))
        if (completed.length > 0) setNextMentoring(completed[0])
      }
    })
  }, [])

  const inProgressTrails = trails.filter(tr => tr.progress && !tr.progress.completedAt)
  const featured = videos[0]
  const secondary = videos.slice(1, 3)
  const moreVideos = videos.slice(3, 7)

  return (
    <div className="space-y-7">
      {/* Admin banner */}
      {banner.active && banner.message && !bannerDismissed && (
        <div className={`rounded-xl p-4 text-sm font-medium relative ${banner.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' : banner.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
          {banner.message}
          <button onClick={() => setBannerDismissed(true)} className="absolute top-3 right-3 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] md:text-[26px] font-bold text-gray-900 tracking-tight">{t('home.welcome')} {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-[13px] text-gray-400 mt-1">Escolha o que assistir ou explore novos conteúdos.</p>
        </div>
        <Link to="/catalogo" className="text-[12px] text-green-600 hover:text-green-700 font-semibold flex items-center gap-1">Ver catálogo <ChevronRight size={13} /></Link>
      </div>

      {/* Onboarding slim banner */}
      {showOnboarding && (
        <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-3 flex items-center gap-4">
          <Lightbulb size={16} className="text-green-600 shrink-0" />
          <p className="text-[12px] text-gray-700 flex-1"><span className="font-semibold">Novo na plataforma?</span> Explore nossos treinamentos e comece sua jornada de capacitação ministerial.</p>
          <Link to="/trilhas" className="px-4 py-1.5 rounded-lg bg-green-600 text-white text-[11px] font-semibold hover:bg-green-700 transition shrink-0">Começar agora</Link>
          <button onClick={() => setShowOnboarding(false)} className="text-gray-400 hover:text-gray-600 transition shrink-0"><X size={14} /></button>
        </div>
      )}

      {/* HERO — Video destaque */}
      {featured && (
        <div className="relative rounded-3xl overflow-hidden group cursor-pointer shadow-lg shadow-green-900/5" onClick={() => navigate(`/catalogo?video=${featured.id}`)}>
          <img src={featured.thumbnail} alt="" className="w-full aspect-[16/9] md:aspect-[2.6/1] object-cover object-[center_30%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-green-600/15 to-transparent" />
          <div className="absolute top-4 left-5 md:top-5 md:left-6">
            <span className="text-[10px] font-bold bg-green-500 text-white px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-green-500/30">🔥 {t('home.featured') || 'Conteúdo em Destaque'}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
            <h2 className="text-[18px] md:text-[22px] font-bold text-white leading-snug max-w-[650px]">{featured.title}</h2>
            <p className="text-[12px] md:text-[13px] text-white/60 mt-2">{featured.channelTitle || 'Rede Inspire'}</p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/90 shadow-2xl flex items-center justify-center hover:scale-110 transition-transform">
              <Play size={22} className="text-green-600 ml-1" fill="currentColor" />
            </div>
          </div>
        </div>
      )}

      {/* Webinar banner */}
      {nextWebinar && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0"><Calendar size={20} className="text-white" /></div>
            <div>
              <p className="text-[10px] text-white/60 uppercase font-semibold tracking-wider">{t('home.nextWebinar')}</p>
              <h3 className="text-[15px] font-bold text-white mt-0.5">{nextWebinar.title}</h3>
              <p className="text-[12px] text-white/60 mt-0.5">{nextWebinar.hostName} · {new Date(nextWebinar.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          <Link to="/mentorias" className="bg-white text-indigo-700 px-5 py-2.5 rounded-xl text-[12px] font-semibold hover:bg-indigo-50 transition shrink-0">Inscrever-se</Link>
        </div>
      )}

      {/* Main grid: content + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: main content */}
        <div className="lg:col-span-8 space-y-7">

          {/* Sugestões */}
          {secondary.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2"><Lightbulb size={17} className="text-amber-500" /> {t('home.suggestions') || 'Sugestões para você'}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.slice(1, 4).map(v => (
                  <div key={v.id} className="group cursor-pointer" onClick={() => navigate(`/catalogo?video=${v.id}`)}>
                    <div className="relative rounded-xl overflow-hidden shadow-sm">
                      <img src={v.thumbnail} alt="" className="w-full aspect-video object-cover group-hover:scale-[1.03] transition-transform duration-400" />
                      <span className="absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded-md bg-black/60 text-white font-medium">{v.duration || ''}</span>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center"><Play size={14} className="text-green-600 ml-0.5" fill="currentColor" /></div>
                      </div>
                    </div>
                    <h3 className="text-[13px] font-semibold text-gray-800 mt-2.5 line-clamp-2 leading-snug">{v.title}</h3>
                    <p className="text-[11px] text-gray-400 mt-1">{v.channelTitle || 'Rede Inspire'}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Trilhas em andamento */}
          {inProgressTrails.length > 0 && (
            <section>
              <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2 mb-4"><Route size={17} className="text-blue-500" /> {t('home.trainingInProgress')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {inProgressTrails.slice(0, 3).map(tr => (
                  <Link to="/trilhas" key={tr.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition">
                    <p className="text-[13px] font-semibold text-gray-800">{tr.title}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex-1 bg-gray-100 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${tr.progress?.percentComplete ?? 0}%` }} /></div>
                      <span className="text-[11px] font-bold text-gray-500">{tr.progress?.percentComplete ?? 0}%</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Top 10 Materiais */}
          {topDownloads.length > 0 && (
            <section>
              <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2 mb-4"><Star size={17} className="text-orange-500" /> Top 10 Materiais</h2>
              <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                {topDownloads.slice(0, 10).map(item => {
                  const parts = (item.filePath || '').split('/')
                  const folderName = parts.length > 2 ? parts[parts.length - 2] : parts[1] || ''
                  const folderPath = parts.slice(0, -1).join('/')
                  return (
                    <div key={item.filePath} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition" onClick={() => navigate(`/materiais?path=${encodeURIComponent(folderPath)}`)}>
                      <span className={`text-[12px] font-bold w-5 text-center ${item.rank <= 3 ? 'text-green-600' : 'text-gray-300'}`}>{item.rank}</span>
                      <span className="text-[13px] text-gray-800 flex-1 truncate">{folderName}</span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Top Conteúdos */}
          {videos.length > 0 && (
            <section>
              <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2 mb-4"><Flame size={17} className="text-red-500" /> {t('home.top10Content')}</h2>
              <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                {videos.slice(0, 5).map((video, i) => (
                  <div key={video.id} onClick={() => navigate(`/catalogo?video=${video.id}`)} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition">
                    <span className={`text-[12px] font-bold w-5 text-center ${i < 3 ? 'text-red-500' : 'text-gray-300'}`}>{i + 1}</span>
                    <img src={video.thumbnail} alt="" className="w-14 h-9 rounded-lg object-cover shrink-0" />
                    <span className="text-[13px] text-gray-800 flex-1 line-clamp-1">{video.title}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Conteúdos recentes */}
          {moreVideos.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2"><TrendingUp size={17} className="text-green-500" /> Conteúdos recentes</h2>
                <Link to="/catalogo" className="text-[12px] text-green-600 font-semibold">Ver todos →</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {moreVideos.map(video => (
                  <div key={video.id} onClick={() => navigate(`/catalogo?video=${video.id}`)} className="group cursor-pointer">
                    <div className="relative rounded-xl overflow-hidden shadow-sm">
                      <img src={video.thumbnail} alt="" className="w-full aspect-video object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center"><Play size={11} className="text-green-600 ml-0.5" fill="currentColor" /></div>
                      </div>
                    </div>
                    <p className="text-[11px] font-medium text-gray-800 mt-2 line-clamp-2 leading-snug">{video.title}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Próximos eventos */}
          {(upcomingWebinars.length > 0 || upcomingMentorings.length > 0) && (
            <section>
              <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2 mb-4"><Calendar size={17} className="text-purple-500" /> Próximos eventos</h2>
              <div className="space-y-2.5">
                {upcomingWebinars.map(w => (
                  <div key={w.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between hover:shadow-sm transition cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><Play size={16} className="text-purple-600" /></div>
                      <div>
                        <p className="text-[13px] font-semibold text-gray-800">{w.title}</p>
                        <p className="text-[11px] text-gray-400">{w.hostName} · {new Date(w.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <Link to="/mentorias" className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase">Inscrever</Link>
                  </div>
                ))}
                {upcomingMentorings.map(s => (
                  <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between hover:shadow-sm transition cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Users size={16} className="text-blue-600" /></div>
                      <div>
                        <p className="text-[13px] font-semibold text-gray-800">{s.title}</p>
                        <p className="text-[11px] text-gray-400">{s.mentorName || s.pastorName} · {new Date(s.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <Link to="/mentorias" className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">Ver</Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-4 space-y-5">
          {/* Pontos + Ranking */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center"><Star size={18} className="text-amber-500" /></div>
              <div><p className="text-[20px] font-bold text-gray-900">{myPoints}</p><p className="text-[11px] text-gray-400">{t('header.points')}</p></div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Top Usuários</p>
              <div className="space-y-2">
                {pointsRanking.slice(0, 5).map(u => (
                  <div key={u.rank} className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-400 w-4">{u.rank}º</span>
                    <span className="flex-1 text-[12px] text-gray-700 truncate">{u.name}</span>
                    <span className="text-[11px] font-semibold text-amber-600">{u.points}</span>
                  </div>
                ))}
              </div>
              <Link to="/dashboard" className="mt-3 block text-center text-[11px] text-gray-500 hover:text-gray-900">Ver ranking completo →</Link>
            </div>
          </div>

          {/* Links rápidos */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase mb-3">{t('nav.management')}</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { to: '/materiais', label: t('nav.materials'), icon: <Download size={14} /> },
                { to: '/mensagens', label: t('nav.messages'), icon: <Sparkles size={14} /> },
                { to: '/mapa', label: t('nav.map'), icon: <ArrowRight size={14} /> },
                { to: '/planejamento', label: t('nav.planning'), icon: <Calendar size={14} /> },
                { to: '/dashboard', label: t('nav.dashboard'), icon: <TrendingUp size={14} /> },
                { to: '/mentorias', label: t('nav.mentoring'), icon: <Users size={14} /> },
              ].map((item) => (
                <Link key={item.to} to={item.to} className="flex items-center gap-2 text-[11px] text-gray-600 bg-gray-50 rounded-lg px-3 py-2.5 hover:bg-green-50 hover:text-green-700 transition">
                  {item.icon} {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Próximo webinar card */}
          {nextWebinar && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-[10px] text-purple-600 font-semibold uppercase mb-2">{t('home.nextWebinar')}</p>
              <h3 className="text-[13px] font-bold text-gray-900 line-clamp-2">{nextWebinar.title}</h3>
              <p className="text-[11px] text-gray-500 mt-1">{nextWebinar.hostName}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1"><Calendar size={11} /> {new Date(nextWebinar.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              <Link to="/mentorias" className="mt-3 block text-center bg-purple-600 text-white py-2 rounded-lg text-[12px] font-medium hover:bg-purple-700 transition">Ver detalhes</Link>
            </div>
          )}

          {/* Trilha em andamento */}
          {inProgressTrails.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-[10px] text-blue-600 font-semibold uppercase mb-2">Trilha em andamento</p>
              <h3 className="text-[13px] font-bold text-gray-900 line-clamp-2">{inProgressTrails[0].title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-gray-100 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${inProgressTrails[0].progress?.percentComplete ?? 0}%` }} /></div>
                <span className="text-[11px] font-bold text-gray-500">{inProgressTrails[0].progress?.percentComplete ?? 0}%</span>
              </div>
              <Link to="/trilhas" className="mt-3 block text-center bg-green-600 text-white py-2 rounded-lg text-[12px] font-medium hover:bg-green-700 transition">Continuar</Link>
            </div>
          )}

          {/* Próxima mentoria */}
          {nextMentoring && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-[10px] text-blue-600 font-semibold uppercase mb-2">Próxima mentoria</p>
              <h3 className="text-[13px] font-bold text-gray-900 line-clamp-2">{nextMentoring.title}</h3>
              <p className="text-[11px] text-gray-500 mt-1">{nextMentoring.mentorName || nextMentoring.pastorName}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1"><Calendar size={11} /> {new Date(nextMentoring.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              <Link to="/mentorias" className="mt-3 block text-center bg-blue-600 text-white py-2 rounded-lg text-[12px] font-medium hover:bg-blue-700 transition">Ver detalhes</Link>
            </div>
          )}

          {/* Igrejas mais ativas */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1"><Sparkles size={12} /> Igrejas mais ativas</p>
            <p className="text-[11px] text-gray-400 text-center py-3">Em breve</p>
          </div>
        </div>
      </div>
    </div>
  )
}
