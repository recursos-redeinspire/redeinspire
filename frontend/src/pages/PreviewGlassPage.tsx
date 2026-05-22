import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home, BookOpen, Route, GraduationCap, CalendarDays,
  FolderDown, MapPin, BarChart3, Bell, Search, Play,
  TrendingUp, Star, ArrowRight, Zap, Menu, X, Sun, Moon,
  MessageSquare, Flame, Download, Users
} from 'lucide-react'

// Real YouTube video IDs from the channel
const REAL_VIDEOS = [
  { id: '4CJQVNhVPv4', title: 'Como consolidar as bases ministeriais em sua igreja', author: 'Marcos Sanches', views: '2.4k' },
  { id: 'CHy2xDu-FFs', title: 'Saúde emocional da equipe ministerial', author: 'Carmen Rangel', views: '1.8k' },
  { id: 'PoyaOKZ4VPY', title: 'Gestão de equipes de alta performance', author: 'Matheus Moraes', views: '3.1k' },
  { id: 'cc4AyP6l6jA', title: 'Planejamento estratégico para igrejas e ministérios', author: 'Marcelo Santos', views: '1.5k' },
  { id: 'g21WdMNY1pw', title: 'Cultura de Inovação na Igreja', author: 'Marcos Madaleno', views: '2.9k' },
  { id: 'zUc7YWPHgGM', title: 'Como a tecnologia pode otimizar seu trabalho na igreja', author: 'Talk Gestores', views: '1.2k' },
]

function ytThumb(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

export default function PreviewGlassPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isDark, setIsDark] = useState(true)

  const navItems = [
    { icon: <Home size={20} />, label: 'Início', active: true },
    { icon: <BookOpen size={20} />, label: 'Catálogo' },
    { icon: <Route size={20} />, label: 'Trilhas' },
    { icon: <GraduationCap size={20} />, label: 'Mentorias' },
    { icon: <CalendarDays size={20} />, label: 'Planejamento' },
    { icon: <FolderDown size={20} />, label: 'Materiais' },
    { icon: <MapPin size={20} />, label: 'Mapa' },
    { icon: <BarChart3 size={20} />, label: 'Dashboard' },
  ]

  const topMaterials = [
    { rank: 1, name: 'Planejamento Estratégico 2026', downloads: 342 },
    { rank: 2, name: 'Manual do Líder de Célula', downloads: 289 },
    { rank: 3, name: 'Guia de Escola Bíblica', downloads: 256 },
    { rank: 4, name: 'Kit Comunicação Visual', downloads: 198 },
    { rank: 5, name: 'Roteiro de Culto Criativo', downloads: 176 },
  ]

  return (
    <div className={`min-h-screen transition-colors duration-500 relative overflow-hidden ${isDark ? 'bg-[#0a0a1a]' : 'bg-[#f0f4ff]'}`}>
      {/* Background ambient blobs */}
      <div className={`absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] ${isDark ? 'bg-blue-600/20' : 'bg-blue-300/40'}`} />
      <div className={`absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] ${isDark ? 'bg-purple-600/15' : 'bg-purple-300/30'}`} />
      <div className={`absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full blur-[80px] ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-300/30'}`} />

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <aside className={`w-64 flex-shrink-0 flex flex-col transition-all duration-300 backdrop-blur-2xl ${
          isDark ? 'bg-white/[0.03] border-r border-white/[0.06]' : 'bg-white/50 border-r border-gray-200/60'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full absolute'}`}>
          {/* Logo */}
          <div className="p-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap size={18} className="text-white" />
            </div>
            <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Rede Inspire</span>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item, i) => (
              <button
                key={i}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  item.active
                    ? isDark
                      ? 'bg-white/10 border border-white/[0.15] text-white'
                      : 'bg-white/80 border border-gray-200 text-gray-900 shadow-sm'
                    : isDark
                      ? 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User card */}
          <div className="p-4">
            <div className={`rounded-2xl p-4 backdrop-blur-xl ${isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-white/70 border border-gray-200/60'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">D</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>Danilo Santos</p>
                  <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Administrador</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Star size={14} className="text-amber-400" />
                <span className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>1.250 pontos</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className={`px-6 py-4 flex items-center gap-4 backdrop-blur-2xl ${
            isDark ? 'bg-white/[0.03] border-b border-white/[0.06]' : 'bg-white/50 border-b border-gray-200/60'
          }`}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className={isDark ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-900'}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Buscar conteúdos, materiais..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition ${
                    isDark ? 'bg-white/[0.06] border border-white/[0.1] text-white placeholder-white/30' : 'bg-white/80 border border-gray-200 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setIsDark(!isDark)} className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${isDark ? 'bg-white/[0.06] hover:bg-white/[0.1]' : 'bg-white/80 hover:bg-white border border-gray-200'}`}>
                {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-500" />}
              </button>
              <button className={`w-9 h-9 rounded-xl flex items-center justify-center transition relative ${isDark ? 'bg-white/[0.06] hover:bg-white/[0.1]' : 'bg-white/80 hover:bg-white border border-gray-200'}`}>
                <MessageSquare size={16} className={isDark ? 'text-white/60' : 'text-gray-500'} />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">3</span>
              </button>
              <button className={`w-9 h-9 rounded-xl flex items-center justify-center transition relative ${isDark ? 'bg-white/[0.06] hover:bg-white/[0.1]' : 'bg-white/80 hover:bg-white border border-gray-200'}`}>
                <Bell size={16} className={isDark ? 'text-white/60' : 'text-gray-500'} />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">5</span>
              </button>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Welcome */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Olá, Danilo! 👋</h1>
                  <p className={`text-sm mt-1 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Confira as novidades da plataforma</p>
                </div>
                <button className={`text-sm flex items-center gap-1 transition ${isDark ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                  Ver catálogo <ArrowRight size={14} />
                </button>
              </div>

              {/* Featured videos with REAL thumbnails */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative rounded-3xl overflow-hidden group cursor-pointer">
                  <img src={ytThumb(REAL_VIDEOS[0].id)} alt="" className="w-full h-full object-cover aspect-[16/9]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-black/20 backdrop-blur-md">
                    <span className="inline-block bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Destaque</span>
                    <h3 className="text-xl font-bold text-white mt-2">{REAL_VIDEOS[0].title}</h3>
                    <p className="text-white/60 text-sm mt-1">{REAL_VIDEOS[0].author} • 45 min</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-2xl">
                      <Play size={24} className="text-white ml-1" fill="white" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {REAL_VIDEOS.slice(1, 3).map((video) => (
                    <div key={video.id} className="relative rounded-2xl overflow-hidden group cursor-pointer flex-1">
                      <img src={ytThumb(video.id)} alt="" className="w-full h-full object-cover absolute inset-0" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/10 backdrop-blur-sm">
                        <p className="font-semibold text-sm text-white line-clamp-2">{video.title}</p>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center">
                          <Play size={16} className="text-white ml-0.5" fill="white" />
                        </div>
                      </div>
                      <div className="aspect-[16/10]" />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Stats */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <TrendingUp size={20} />, label: 'Conteúdos assistidos', value: '47', gradient: 'from-blue-500 to-cyan-400' },
                { icon: <Download size={20} />, label: 'Materiais baixados', value: '23', gradient: 'from-emerald-500 to-teal-400' },
                { icon: <Route size={20} />, label: 'Trilhas em andamento', value: '3', gradient: 'from-purple-500 to-pink-400' },
                { icon: <Star size={20} />, label: 'Seus pontos', value: '1.250', gradient: 'from-amber-500 to-orange-400' },
              ].map((stat, i) => (
                <div key={i} className={`rounded-2xl p-5 group hover:scale-[1.02] transition-all duration-300 backdrop-blur-xl ${
                  isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-white/70 border border-gray-200/60 shadow-sm'
                }`}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white mb-3 shadow-lg`}>
                    {stat.icon}
                  </div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{stat.label}</p>
                </div>
              ))}
            </section>

            {/* Two columns */}
            <section className="grid md:grid-cols-2 gap-6">
              {/* Trending */}
              <div className={`rounded-2xl p-5 backdrop-blur-xl ${isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-white/70 border border-gray-200/60 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Flame size={18} className="text-orange-400" /> Em Alta
                  </h3>
                  <button className={`text-xs ${isDark ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>Ver todos</button>
                </div>
                <div className="space-y-2">
                  {REAL_VIDEOS.slice(0, 4).map((video, i) => (
                    <div key={video.id} className={`flex items-center gap-3 p-2 rounded-xl transition cursor-pointer group ${isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-gray-100/60'}`}>
                      <span className={`text-lg font-bold w-6 text-center ${isDark ? 'text-white/30' : 'text-gray-300'}`}>{i + 1}</span>
                      <img src={ytThumb(video.id)} alt="" className="w-14 h-10 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium line-clamp-1 transition ${isDark ? 'text-white group-hover:text-blue-400' : 'text-gray-900 group-hover:text-blue-600'}`}>{video.title}</p>
                        <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{video.author} • {video.views} views</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Materials */}
              <div className={`rounded-2xl p-5 backdrop-blur-xl ${isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-white/70 border border-gray-200/60 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Download size={18} className="text-emerald-400" /> Top Materiais
                  </h3>
                  <button className={`text-xs ${isDark ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>Ver todos</button>
                </div>
                <div className="space-y-2">
                  {topMaterials.map((mat) => (
                    <div key={mat.rank} className={`flex items-center gap-3 p-2.5 rounded-xl transition cursor-pointer ${isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-gray-100/60'}`}>
                      <span className={`text-lg font-bold w-6 text-center ${mat.rank <= 3 ? 'text-amber-400' : isDark ? 'text-white/30' : 'text-gray-300'}`}>{mat.rank}</span>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}>
                        <FolderDown size={16} className="text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{mat.name}</p>
                        <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{mat.downloads} downloads</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Trails */}
            <section className={`rounded-2xl p-5 backdrop-blur-xl ${isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-white/70 border border-gray-200/60 shadow-sm'}`}>
              <h3 className={`font-semibold flex items-center gap-2 mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Route size={18} className="text-purple-400" /> Trilhas em Andamento
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { title: 'Liderança Eficaz', progress: 65, gradient: 'from-blue-500 to-cyan-400' },
                  { title: 'Gestão Financeira', progress: 30, gradient: 'from-emerald-500 to-teal-400' },
                  { title: 'Comunicação Visual', progress: 85, gradient: 'from-purple-500 to-pink-400' },
                ].map((trail, i) => (
                  <div key={i} className={`rounded-xl p-4 hover:scale-[1.02] transition-all duration-300 cursor-pointer ${
                    isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white/60 border border-gray-200/60'
                  }`}>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${trail.gradient} flex items-center justify-center text-white mb-3`}>
                      <GraduationCap size={14} />
                    </div>
                    <p className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{trail.title}</p>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/[0.06]' : 'bg-gray-200'}`}>
                      <div className={`h-full rounded-full bg-gradient-to-r ${trail.gradient}`} style={{ width: `${trail.progress}%` }} />
                    </div>
                    <p className={`text-xs mt-1.5 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{trail.progress}% concluído</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Events */}
            <section className="grid md:grid-cols-2 gap-6">
              <div className={`rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl ${isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-white/70 border border-gray-200/60 shadow-sm'}`}>
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl ${isDark ? 'bg-blue-500/10' : 'bg-blue-200/40'}`} />
                <h3 className={`font-semibold flex items-center gap-2 mb-4 relative ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <CalendarDays size={18} className="text-blue-400" /> Próximo Webinar
                </h3>
                <div className="relative">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Gestão Inovadora para Igrejas</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Pr. Marcos Madaleno</p>
                  <p className={`text-xs mt-2 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>📅 28 Mai 2026 • 19:00</p>
                  <button className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-xs font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                    Participar
                  </button>
                </div>
              </div>

              <div className={`rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl ${isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-white/70 border border-gray-200/60 shadow-sm'}`}>
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl ${isDark ? 'bg-purple-500/10' : 'bg-purple-200/40'}`} />
                <h3 className={`font-semibold flex items-center gap-2 mb-4 relative ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Users size={18} className="text-purple-400" /> Próxima Mentoria
                </h3>
                <div className="relative">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Mentoria de Liderança</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Com Pr. Carlos Silva</p>
                  <p className={`text-xs mt-2 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>📅 30 Mai 2026 • 10:00</p>
                  <button className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-400 text-white text-xs font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all">
                    Ver detalhes
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Back button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => navigate('/')}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-sm font-medium shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300"
        >
          ← Voltar à versão atual
        </button>
      </div>
    </div>
  )
}
