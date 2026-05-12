import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { useI18n } from '../i18n/I18nContext'
import { Play, Star, Calendar, ArrowRight, TrendingUp, Zap, Flame, Lightbulb, BookOpen, Download, Users, GraduationCap, Sparkles } from 'lucide-react'

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useI18n()
  const { getYoutubeVideos, getTrails, getWebinars, getPointsRanking, getMyPoints, getTopContents, getRecommendedContents, getMentoringSessions, getTopDownloads, getBanner } = useData()

  const [videos, setVideos] = useState<any[]>([])
  const [trails, setTrails] = useState<any[]>([])
  const [nextWebinar, setNextWebinar] = useState<any>(null)
  const [upcomingWebinars, setUpcomingWebinars] = useState<any[]>([])
  const [pointsRanking, setPointsRanking] = useState<any[]>([])
  const [myPoints, setMyPoints] = useState(0)
  const [top10, setTop10] = useState<any[]>([])
  const [topDownloads, setTopDownloads] = useState<any[]>([])
  const [recommended, setRecommended] = useState<any[]>([])
  const [nextMentoring, setNextMentoring] = useState<any>(null)
  const [upcomingMentorings, setUpcomingMentorings] = useState<any[]>([])
  const [banner, setBanner] = useState<{ active: boolean; message: string; type: string }>({ active: false, message: '', type: 'info' })
  const [bannerDismissed, setBannerDismissed] = useState(false)

  useEffect(() => {
    getYoutubeVideos(undefined, 12).then(d => setVideos(d.videos))
    getTrails().then(setTrails)
    getPointsRanking().then(setPointsRanking)
    getMyPoints().then(setMyPoints)
    getTopContents(10).then(setTop10)
    getRecommendedContents().then(setRecommended)
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
    <div className="space-y-8">
      {banner.active && banner.message && !bannerDismissed && (
        <div className={`rounded-xl p-4 text-sm font-medium relative ${banner.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' : banner.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
          {banner.message}
          <button onClick={() => setBannerDismissed(true)} className="absolute top-3 right-3 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {featured && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-xl text-gray-900 flex items-center gap-2"><Zap size={20} className="text-amber-500" /> {t('home.welcome')} {user?.name?.split(' ')[0]}!</h2>
            <Link to="/catalogo" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">Ver catálogo <ArrowRight size={14} /></Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative rounded-2xl overflow-hidden bg-gray-900 cursor-pointer group" onClick={() => navigate('/catalogo')}>
              <img src={featured.thumbnail} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition aspect-[16/9]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase">Novo</span>
                <h3 className="text-xl md:text-2xl font-bold text-white mt-2 line-clamp-2">{featured.title}</h3>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg"><Play size={24} className="text-gray-900 ml-1" fill="currentColor" /></div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {secondary.map(video => (
                <div key={video.id} className="relative rounded-xl overflow-hidden bg-gray-900 cursor-pointer group flex-1" onClick={() => navigate('/catalogo')}>
                  <img src={video.thumbnail} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3"><p className="font-semibold text-sm text-white line-clamp-2">{video.title}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <GraduationCap size={24} className="text-emerald-600" />
          <div>
            <p className="font-semibold text-gray-900 text-sm">Novo na plataforma?</p>
            <p className="text-xs text-gray-600">Assista os vídeos de treinamento e aproveite ao máximo</p>
          </div>
        </div>
        <Link to="/trilhas" className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">Ver treinamentos</Link>
      </section>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-8">
          {nextWebinar && (
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 text-white flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs text-white/70 uppercase font-semibold flex items-center gap-1"><Calendar size={12} /> {t('home.nextWebinar')}</p>
                <h3 className="font-bold text-lg mt-1">{nextWebinar.title}</h3>
                <p className="text-sm text-white/80 mt-0.5">{nextWebinar.hostName} · {new Date(nextWebinar.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <Link to="/mentorias" className="bg-white text-indigo-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition">Inscrever-se</Link>
            </div>
          )}

          {inProgressTrails.length > 0 && (
            <section>
              <h2 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2"><BookOpen size={18} className="text-blue-500" /> {t('home.trainingInProgress')}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {inProgressTrails.slice(0, 3).map(tr => (
                  <Link to="/trilhas" key={tr.id} className="bg-white border rounded-xl p-4 hover:shadow-md transition">
                    <p className="font-medium text-sm text-gray-900">{tr.title}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${tr.progress?.percentComplete ?? 0}%` }} /></div>
                      <span className="text-xs text-gray-500 font-medium">{tr.progress?.percentComplete ?? 0}%</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {topDownloads.length > 0 && (
            <section>
              <h2 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2"><Download size={18} className="text-orange-500" /> Top 10 Materiais</h2>
              <div className="bg-white border rounded-xl divide-y">
                {topDownloads.slice(0, 10).map(item => (
                  <div key={item.filePath} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition" onClick={() => navigate('/materiais')}>
                    <span className="text-lg font-bold text-gray-400 w-6 text-center">{item.rank}</span>
                    <span className="flex-1 font-medium text-sm text-gray-900 truncate">{item.fileName?.replace(/\.[^/.]+$/, '')}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {top10.length > 0 && (
            <section>
              <h2 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2"><Flame size={18} className="text-red-500" /> {t('home.top10Content')}</h2>
              <div className="bg-white border rounded-xl divide-y">
                {top10.slice(0, 5).map((item, i) => (
                  <div key={item.id} onClick={() => navigate(`/conteudo/${item.id}`)} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition">
                    <span className="text-lg font-bold text-gray-400 w-6 text-center">{i + 1}</span>
                    <span className="flex-1 font-medium text-sm text-gray-900">{item.title}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {recommended.length > 0 && (
            <section>
              <h2 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2"><Lightbulb size={18} className="text-yellow-500" /> {t('home.suggestions')}</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {recommended.slice(0, 3).map(item => (
                  <div key={item.id} className="bg-white border rounded-xl p-4 hover:shadow-md transition cursor-pointer" onClick={() => navigate(`/conteudo/${item.id}`)}>
                    <h3 className="font-medium text-sm text-gray-900">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{t('home.basedOnMinistry')}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg text-gray-900 flex items-center gap-2"><TrendingUp size={18} className="text-green-500" /> Conteúdos recentes</h2>
              <Link to="/catalogo" className="text-sm text-gray-500 hover:text-gray-900">Ver todos →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {moreVideos.map(video => (
                <div key={video.id} onClick={() => navigate('/catalogo')} className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer group">
                  <div className="relative aspect-video bg-gray-100">
                    {video.thumbnail && <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                      <Play size={24} className="text-white opacity-0 group-hover:opacity-100 transition" fill="white" />
                    </div>
                  </div>
                  <div className="p-2"><p className="font-medium text-xs text-gray-900 line-clamp-2">{video.title}</p></div>
                </div>
              ))}
            </div>
          </section>

          {(upcomingWebinars.length > 0 || upcomingMentorings.length > 0) && (
            <section>
              <h2 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2"><Calendar size={18} className="text-purple-500" /> Próximos eventos</h2>
              <div className="space-y-2">
                {upcomingWebinars.map(w => (
                  <div key={w.id} className="bg-white border rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center"><Play size={16} className="text-purple-600" /></div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{w.title}</p>
                        <p className="text-xs text-gray-500">{w.hostName} · {new Date(w.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <Link to="/mentorias" className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-purple-700">Inscrever</Link>
                  </div>
                ))}
                {upcomingMentorings.map(s => (
                  <div key={s.id} className="bg-white border rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Users size={16} className="text-blue-600" /></div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{s.title}</p>
                        <p className="text-xs text-gray-500">{s.mentorName || s.pastorName} · {new Date(s.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <Link to="/mentorias" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700">Ver</Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center"><Star size={20} className="text-yellow-500" /></div>
              <div><p className="text-xl font-bold text-gray-900">{myPoints}</p><p className="text-xs text-gray-500">{t('header.points')}</p></div>
            </div>
            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Top Usuários</p>
              <div className="space-y-2">
                {pointsRanking.slice(0, 5).map(u => (
                  <div key={u.rank} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 w-4">{u.rank}º</span>
                    <span className="flex-1 text-xs text-gray-700 truncate">{u.name}</span>
                    <span className="text-xs font-semibold text-yellow-600">{u.points}</span>
                  </div>
                ))}
              </div>
              <Link to="/dashboard" className="mt-3 block text-center text-xs text-gray-500 hover:text-gray-900">Ver ranking completo →</Link>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">{t('nav.management')}</p>
            <div className="grid grid-cols-2 gap-2">
              {[{ to: '/materiais', label: '📁 ' + t('nav.materials') }, { to: '/podcast', label: '🎙 ' + t('nav.podcast') }, { to: '/mensagens', label: '💬 ' + t('nav.messages') }, { to: '/mapa', label: '🗺 ' + t('nav.map') }, { to: '/planejamento', label: '📅 ' + t('nav.planning') }, { to: '/dashboard', label: '📊 ' + t('nav.dashboard') }].map(item => (
                <Link key={item.to} to={item.to} className="text-xs text-gray-700 bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 transition text-center">{item.label}</Link>
              ))}
            </div>
          </div>

          {nextWebinar && (
            <div className="bg-white border rounded-xl p-4">
              <p className="text-xs text-purple-600 font-semibold uppercase mb-2">{t('home.nextWebinar')}</p>
              <h3 className="font-bold text-sm text-gray-900 line-clamp-2">{nextWebinar.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{nextWebinar.hostName}</p>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Calendar size={12} /> {new Date(nextWebinar.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              <Link to="/mentorias" className="mt-3 block text-center bg-purple-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-purple-700 transition">Ver detalhes</Link>
            </div>
          )}

          {inProgressTrails.length > 0 && (
            <div className="bg-white border rounded-xl p-4">
              <p className="text-xs text-blue-600 font-semibold uppercase mb-2">Trilha em andamento</p>
              <h3 className="font-bold text-sm text-gray-900 line-clamp-2">{inProgressTrails[0].title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${inProgressTrails[0].progress?.percentComplete ?? 0}%` }} /></div>
                <span className="text-xs text-gray-500 font-medium">{inProgressTrails[0].progress?.percentComplete ?? 0}%</span>
              </div>
              <Link to="/trilhas" className="mt-3 block text-center bg-blue-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-blue-700 transition">Continuar</Link>
            </div>
          )}

          {nextMentoring && (
            <div className="bg-white border rounded-xl p-4">
              <p className="text-xs text-blue-600 font-semibold uppercase mb-2">Próxima mentoria</p>
              <h3 className="font-bold text-sm text-gray-900 line-clamp-2">{nextMentoring.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{nextMentoring.mentorName || nextMentoring.pastorName}</p>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Calendar size={12} /> {new Date(nextMentoring.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              <Link to="/mentorias" className="mt-3 block text-center bg-blue-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-blue-700 transition">Ver detalhes</Link>
            </div>
          )}

          <div className="bg-white border rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1"><Sparkles size={12} /> Igrejas mais ativas</p>
            <p className="text-xs text-gray-400 text-center py-3">Em breve</p>
          </div>
        </div>
      </div>
    </div>
  )
}
