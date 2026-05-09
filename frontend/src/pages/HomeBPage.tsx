import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { useI18n } from '../i18n/I18nContext'
import { Play, Star, BookOpen, Route, Calendar, FolderOpen, MessageSquare, BarChart3, ArrowRight, Mic } from 'lucide-react'

export default function HomeBPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t: _t } = useI18n()
  const { getYoutubeVideos, getTrails, getWebinars, getMyPoints } = useData()

  const [videos, setVideos] = useState<any[]>([])
  const [trails, setTrails] = useState<any[]>([])
  const [nextWebinar, setNextWebinar] = useState<any>(null)
  const [myPoints, setMyPoints] = useState(0)

  useEffect(() => {
    getYoutubeVideos(undefined, 8).then(d => setVideos(d.videos))
    getTrails().then(setTrails)
    getMyPoints().then(setMyPoints)
    getWebinars().then(w => {
      const sorted = w.sort((a: any, b: any) => a.scheduledAt?.localeCompare(b.scheduledAt || ''))
      setNextWebinar(sorted[0] || null)
    })
  }, [])

  const inProgressTrails = trails.filter(tr => tr.progress && !tr.progress.completedAt)
  const completedTrails = trails.filter(tr => tr.progress?.completedAt)
  const greeting = (() => { const h = new Date().getHours(); if (h < 12) return 'Bom dia'; if (h < 18) return 'Boa tarde'; return 'Boa noite' })()

  return (
    <div className="space-y-6">
      {/* Personal greeting card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{greeting}, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-white/60 mt-1 text-sm">Sua jornada de crescimento continua. Vamos lá?</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{myPoints}</p>
              <p className="text-xs text-white/50">pontos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{completedTrails.length}</p>
              <p className="text-xs text-white/50">trilhas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{inProgressTrails.length}</p>
              <p className="text-xs text-white/50">em andamento</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: '/catalogo', icon: Play, label: 'Catálogo', desc: 'Vídeos e conteúdos', color: 'bg-purple-50 text-purple-600 border-purple-100' },
          { to: '/materiais', icon: FolderOpen, label: 'Materiais', desc: 'PDFs e documentos', color: 'bg-amber-50 text-amber-600 border-amber-100' },
          { to: '/trilhas', icon: Route, label: 'Trilhas', desc: 'Capacitação', color: 'bg-blue-50 text-blue-600 border-blue-100' },
          { to: '/mentorias', icon: Mic, label: 'Mentorias', desc: 'Webinars e mentorias', color: 'bg-green-50 text-green-600 border-green-100' },
        ].map(item => (
          <Link key={item.to} to={item.to} className={`${item.color} border rounded-xl p-4 hover:shadow-md transition group`}>
            <item.icon size={24} className="mb-2" />
            <p className="font-semibold text-sm text-gray-900">{item.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Two columns layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue where you left off */}
          {inProgressTrails.length > 0 && (
            <section className="bg-white border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2"><BookOpen size={18} /> Continue de onde parou</h2>
                <Link to="/trilhas" className="text-xs text-gray-500 hover:text-gray-900">Ver todas →</Link>
              </div>
              <div className="space-y-3">
                {inProgressTrails.slice(0, 3).map(tr => (
                  <Link to="/trilhas" key={tr.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Route size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{tr.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5"><div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${tr.progress?.percentComplete ?? 0}%` }} /></div>
                        <span className="text-xs text-gray-500">{tr.progress?.percentComplete ?? 0}%</span>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-300" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Recent videos */}
          <section className="bg-white border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Play size={18} /> Conteúdos recentes</h2>
              <Link to="/catalogo" className="text-xs text-gray-500 hover:text-gray-900">Ver todos →</Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {videos.slice(0, 4).map(video => (
                <div key={video.id} onClick={() => navigate('/catalogo')}
                  className="rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer group border">
                  <div className="relative aspect-video bg-gray-100">
                    {video.thumbnail && <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                      <Play size={28} className="text-white opacity-0 group-hover:opacity-100 transition" fill="white" />
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

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Next webinar */}
          {nextWebinar && (
            <div className="bg-white border rounded-xl p-4">
              <p className="text-xs text-purple-600 font-semibold uppercase mb-2">Próximo Webinar</p>
              <h3 className="font-bold text-sm text-gray-900">{nextWebinar.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{nextWebinar.hostName}</p>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <Calendar size={12} /> {new Date(nextWebinar.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
              <Link to="/mentorias" className="mt-3 block text-center bg-purple-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-purple-700 transition">
                Ver detalhes
              </Link>
            </div>
          )}

          {/* Quick links */}
          <div className="bg-white border rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Acesso rápido</p>
            <div className="space-y-2">
              {[
                { to: '/mensagens', icon: MessageSquare, label: 'Mensagens' },
                { to: '/dashboard', icon: BarChart3, label: 'Dashboard' },
                { to: '/planejamento', icon: Calendar, label: 'Planejamento' },
                { to: '/podcast', icon: Mic, label: 'Podcast' },
              ].map(item => (
                <Link key={item.to} to={item.to} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition text-sm text-gray-700">
                  <item.icon size={16} className="text-gray-400" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* My points */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100 rounded-xl p-4 text-center">
            <Star size={24} className="text-yellow-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">{myPoints}</p>
            <p className="text-xs text-gray-500">Seus pontos</p>
            <Link to="/dashboard" className="mt-2 inline-block text-xs text-yellow-700 hover:underline">Ver ranking →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
