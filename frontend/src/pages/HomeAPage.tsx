import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { useI18n } from '../i18n/I18nContext'
import { Play, Star, BookOpen, Route, Calendar } from 'lucide-react'

export default function HomeAPage() {
  const { user: _user } = useAuth()
  const navigate = useNavigate()
  const { t: _t } = useI18n()
  const { getYoutubeVideos, getTrails, getWebinars, getPointsRanking } = useData()

  const [videos, setVideos] = useState<any[]>([])
  const [trails, setTrails] = useState<any[]>([])
  const [nextWebinar, setNextWebinar] = useState<any>(null)
  const [pointsRanking, setPointsRanking] = useState<any[]>([])

  useEffect(() => {
    getYoutubeVideos(undefined, 20).then(d => setVideos(d.videos))
    getTrails().then(setTrails)
    getPointsRanking().then(setPointsRanking)
    getWebinars().then(w => {
      const sorted = w.sort((a: any, b: any) => a.scheduledAt?.localeCompare(b.scheduledAt || ''))
      setNextWebinar(sorted[0] || null)
    })
  }, [])

  const inProgressTrails = trails.filter(tr => tr.progress && !tr.progress.completedAt)
  const heroVideo = videos[0]
  const recentVideos = videos.slice(1, 9)

  return (
    <div className="space-y-8 -mt-4">
      {/* Hero Banner */}
      {heroVideo && (
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 h-72 md:h-80">
          <img src={heroVideo.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10 max-w-2xl">
            <p className="text-xs text-white/60 uppercase tracking-wider mb-2">Em destaque</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight line-clamp-2">{heroVideo.title}</h1>
            <p className="text-sm text-white/70 mt-2 line-clamp-2">{heroVideo.description?.substring(0, 120)}</p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => navigate('/catalogo')} className="bg-white text-gray-900 px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-gray-100 transition">
                <Play size={16} fill="currentColor" /> Assistir
              </button>
              <Link to="/catalogo" className="bg-white/20 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-white/30 transition backdrop-blur">
                Ver catálogo
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link to="/catalogo" className="bg-white border rounded-xl p-4 hover:shadow-md transition group">
          <Play size={20} className="text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{videos.length}+</p>
          <p className="text-xs text-gray-500">Vídeos disponíveis</p>
        </Link>
        <Link to="/trilhas" className="bg-white border rounded-xl p-4 hover:shadow-md transition group">
          <Route size={20} className="text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{trails.length}</p>
          <p className="text-xs text-gray-500">Trilhas</p>
        </Link>
        <Link to="/mentorias" className="bg-white border rounded-xl p-4 hover:shadow-md transition group">
          <Calendar size={20} className="text-green-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{nextWebinar ? '1' : '0'}</p>
          <p className="text-xs text-gray-500">Próximo webinar</p>
        </Link>
        <Link to="/dashboard" className="bg-white border rounded-xl p-4 hover:shadow-md transition group">
          <Star size={20} className="text-yellow-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{pointsRanking[0]?.points || 0}</p>
          <p className="text-xs text-gray-500">Top pontuação</p>
        </Link>
      </div>

      {/* Continue watching (trails in progress) */}
      {inProgressTrails.length > 0 && (
        <section>
          <h2 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2"><BookOpen size={18} /> Continue sua trilha</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {inProgressTrails.slice(0, 4).map(tr => (
              <Link to="/trilhas" key={tr.id} className="min-w-[250px] bg-white border rounded-xl p-4 hover:shadow-md transition flex-shrink-0">
                <p className="font-medium text-sm text-gray-900">{tr.title}</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2"><div className="bg-gray-900 h-2 rounded-full" style={{ width: `${tr.progress?.percentComplete ?? 0}%` }} /></div>
                  <span className="text-xs text-gray-500 font-medium">{tr.progress?.percentComplete ?? 0}%</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent videos carousel */}
      {recentVideos.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg text-gray-900">Conteúdos recentes</h2>
            <Link to="/catalogo" className="text-sm text-gray-500 hover:text-gray-900">Ver todos →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {recentVideos.map(video => (
              <div key={video.id} onClick={() => navigate('/catalogo')}
                className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer group">
                <div className="relative aspect-video bg-gray-100">
                  {video.thumbnail && <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                    <Play size={32} className="text-white opacity-0 group-hover:opacity-100 transition" fill="white" />
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="font-medium text-xs text-gray-900 line-clamp-2">{video.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Next webinar */}
      {nextWebinar && (
        <section className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-purple-600 font-semibold uppercase">Próximo Webinar</p>
              <h3 className="font-bold text-lg text-gray-900 mt-1">{nextWebinar.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{nextWebinar.hostName} · {new Date(nextWebinar.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <Link to="/mentorias" className="bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition">
              Ver detalhes
            </Link>
          </div>
        </section>
      )}

      {/* Ranking */}
      {pointsRanking.length > 0 && (
        <section>
          <h2 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2"><Star size={18} className="text-yellow-500" /> Ranking de pontos</h2>
          <div className="bg-white border rounded-xl divide-y">
            {pointsRanking.slice(0, 5).map(u => (
              <div key={u.rank} className="flex items-center gap-4 px-4 py-3">
                <span className="text-lg font-bold text-gray-400 w-6 text-center">{u.rank}</span>
                <span className="flex-1 font-medium text-sm text-gray-900">{u.name}</span>
                <span className="text-sm font-semibold text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full flex items-center gap-1"><Star size={12} /> {u.points}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
