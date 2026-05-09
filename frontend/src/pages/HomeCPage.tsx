import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { useI18n } from '../i18n/I18nContext'
import { Play, Star, Route, Calendar, ArrowRight, TrendingUp, Zap } from 'lucide-react'

export default function HomeCPage() {
  const { user: _user } = useAuth()
  const navigate = useNavigate()
  const { t: _t } = useI18n()
  const { getYoutubeVideos, getTrails, getWebinars, getPointsRanking, getMyPoints } = useData()

  const [videos, setVideos] = useState<any[]>([])
  const [trails, setTrails] = useState<any[]>([])
  const [nextWebinar, setNextWebinar] = useState<any>(null)
  const [pointsRanking, setPointsRanking] = useState<any[]>([])
  const [myPoints, setMyPoints] = useState(0)

  useEffect(() => {
    getYoutubeVideos(undefined, 12).then(d => setVideos(d.videos))
    getTrails().then(setTrails)
    getPointsRanking().then(setPointsRanking)
    getMyPoints().then(setMyPoints)
    getWebinars().then(w => {
      const sorted = w.sort((a: any, b: any) => a.scheduledAt?.localeCompare(b.scheduledAt || ''))
      setNextWebinar(sorted[0] || null)
    })
  }, [])

  const inProgressTrails = trails.filter(tr => tr.progress && !tr.progress.completedAt)
  const featured = videos[0]
  const secondary = videos.slice(1, 3)
  const moreVideos = videos.slice(3, 11)

  return (
    <div className="space-y-8">
      {/* Featured section - 1 large + 2 small */}
      {featured && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-xl text-gray-900 flex items-center gap-2"><Zap size={20} className="text-amber-500" /> Destaques</h2>
            <Link to="/catalogo" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">Ver tudo <ArrowRight size={14} /></Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Main featured */}
            <div className="md:col-span-2 relative rounded-2xl overflow-hidden bg-gray-900 cursor-pointer group" onClick={() => navigate('/catalogo')}>
              <img src={featured.thumbnail} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition aspect-[16/9]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase">Novo</span>
                <h3 className="text-xl md:text-2xl font-bold text-white mt-2 line-clamp-2">{featured.title}</h3>
                <p className="text-sm text-white/70 mt-1 line-clamp-1">{featured.description?.substring(0, 100)}</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <Play size={24} className="text-gray-900 ml-1" fill="currentColor" />
                </div>
              </div>
            </div>
            {/* Secondary */}
            <div className="flex flex-col gap-4">
              {secondary.map(video => (
                <div key={video.id} className="relative rounded-xl overflow-hidden bg-gray-900 cursor-pointer group flex-1" onClick={() => navigate('/catalogo')}>
                  <img src={video.thumbnail} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="font-semibold text-sm text-white line-clamp-2">{video.title}</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                      <Play size={16} className="text-gray-900 ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Two columns: content + sidebar */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main content - 3 cols */}
        <div className="lg:col-span-3 space-y-8">
          {/* Webinar banner */}
          {nextWebinar && (
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 text-white flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs text-white/70 uppercase font-semibold flex items-center gap-1"><Calendar size={12} /> Próximo evento</p>
                <h3 className="font-bold text-lg mt-1">{nextWebinar.title}</h3>
                <p className="text-sm text-white/80 mt-0.5">{nextWebinar.hostName} · {new Date(nextWebinar.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <Link to="/mentorias" className="bg-white text-indigo-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition">
                Inscrever-se
              </Link>
            </div>
          )}

          {/* Trails in progress */}
          {inProgressTrails.length > 0 && (
            <section>
              <h2 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2"><Route size={18} className="text-blue-500" /> Suas trilhas</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {inProgressTrails.slice(0, 4).map(tr => (
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

          {/* More videos grid */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg text-gray-900 flex items-center gap-2"><TrendingUp size={18} className="text-green-500" /> Mais conteúdos</h2>
              <Link to="/catalogo" className="text-sm text-gray-500 hover:text-gray-900">Ver todos →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {moreVideos.map(video => (
                <div key={video.id} onClick={() => navigate('/catalogo')}
                  className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer group">
                  <div className="relative aspect-video bg-gray-100">
                    {video.thumbnail && <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                      <Play size={24} className="text-white opacity-0 group-hover:opacity-100 transition" fill="white" />
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="font-medium text-xs text-gray-900 line-clamp-2">{video.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar - 1 col */}
        <div className="space-y-4">
          {/* Points card */}
          <div className="bg-white border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
                <Star size={20} className="text-yellow-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{myPoints}</p>
                <p className="text-xs text-gray-500">Seus pontos</p>
              </div>
            </div>
            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Top 5</p>
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

          {/* Quick links */}
          <div className="bg-white border rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Navegação</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { to: '/materiais', label: '📁 Materiais' },
                { to: '/podcast', label: '🎙 Podcast' },
                { to: '/mensagens', label: '💬 Mensagens' },
                { to: '/mapa', label: '🗺 Mapa' },
                { to: '/planejamento', label: '📅 Planejar' },
                { to: '/dashboard', label: '📊 Dashboard' },
              ].map(item => (
                <Link key={item.to} to={item.to} className="text-xs text-gray-700 bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 transition text-center">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
