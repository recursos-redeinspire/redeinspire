import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home, BookOpen, Route, GraduationCap, CalendarDays,
  FolderDown, MapPin, BarChart3, Bell, Search, Play,
  TrendingUp, Star, ArrowRight, Zap, Menu, X, Sun, Moon,
  MessageSquare, Flame, Download, Users
} from 'lucide-react'

// Liquid Glass Preview — Inspired by Apple's Liquid Glass (WWDC 2025)
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

  const mockVideos = [
    { id: 1, title: 'Como consolidar as bases ministeriais em sua igreja', author: 'Marcos Sanches', views: '2.4k' },
    { id: 2, title: 'Saúde emocional da equipe ministerial', author: 'Carmen Rangel', views: '1.8k' },
    { id: 3, title: 'Gestão de equipes de alta performance', author: 'Matheus Moraes', views: '3.1k' },
    { id: 4, title: 'Planejamento estratégico para igrejas', author: 'Marcelo Santos', views: '1.5k' },
    { id: 5, title: 'Cultura de Inovação na Igreja', author: 'Marcos Madaleno', views: '2.9k' },
    { id: 6, title: 'Como a tecnologia pode otimizar seu trabalho', author: 'Talk Gestores', views: '1.2k' },
  ]

  const topMaterials = [
    { rank: 1, name: 'Planejamento Estratégico 2026', downloads: 342 },
    { rank: 2, name: 'Manual do Líder de Célula', downloads: 289 },
    { rank: 3, name: 'Guia de Escola Bíblica', downloads: 256 },
    { rank: 4, name: 'Kit Comunicação Visual', downloads: 198 },
    { rank: 5, name: 'Roteiro de Culto Criativo', downloads: 176 },
  ]

  const bg = isDark
    ? 'bg-[#0a0a1a]'
    : 'bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100'

  const textPrimary = isDark ? 'text-white' : 'text-gray-900'
  const textSecondary = isDark ? 'text-white/60' : 'text-gray-500'
  const textMuted = isDark ? 'text-white/40' : 'text-gray-400'

  // Glass styles
  const glassCard = isDark
    ? 'bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
    : 'bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.08)]'

  const glassSidebar = isDark
    ? 'bg-white/[0.03] backdrop-blur-3xl border-r border-white/[0.06]'
    : 'bg-white/40 backdrop-blur-3xl border-r border-white/60'

  const glassHeader = isDark
    ? 'bg-white/[0.03] backdrop-blur-3xl border-b border-white/[0.06]'
    : 'bg-white/50 backdrop-blur-3xl border-b border-white/60'

  const glassInput = isDark
    ? 'bg-white/[0.06] border border-white/[0.1] text-white placeholder-white/30'
    : 'bg-white/70 border border-white/80 text-gray-900 placeholder-gray-400'

  const glassNavItem = (active: boolean) => isDark
    ? active
      ? 'bg-white/[0.1] border border-white/[0.15] text-white shadow-[0_4px_16px_rgba(255,255,255,0.05)]'
      : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
    : active
      ? 'bg-white/80 border border-white/90 text-gray-900 shadow-[0_4px_16px_rgba(0,0,0,0.08)]'
      : 'text-gray-500 hover:text-gray-700 hover:bg-white/40'

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-500 relative overflow-hidden`}>
      {/* Background ambient effects */}
      {isDark && (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[80px] animate-pulse" style={{ animationDelay: '4s' }} />
        </>
      )}
      {!isDark && (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-300/30 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-300/20 blur-[100px]" />
          <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-cyan-300/20 blur-[80px]" />
        </>
      )}

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <aside className={`${glassSidebar} w-64 flex-shrink-0 flex flex-col transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full absolute'}`}>
          {/* Logo */}
          <div className="p-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap size={18} className="text-white" />
            </div>
            <span className={`font-bold text-lg ${textPrimary}`}>Rede Inspire</span>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item, i) => (
              <button
                key={i}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${glassNavItem(!!item.active)}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User card at bottom */}
          <div className="p-4">
            <div className={`${glassCard} rounded-2xl p-4`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">D</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${textPrimary} truncate`}>Danilo Santos</p>
                  <p className={`text-xs ${textMuted}`}>Administrador</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Star size={14} className="text-amber-400" />
                <span className={`text-xs ${textSecondary}`}>1.250 pontos</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className={`${glassHeader} px-6 py-4 flex items-center gap-4`}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`${textSecondary} hover:${textPrimary} transition`}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
                <input
                  type="text"
                  placeholder="Buscar conteúdos, materiais..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm ${glassInput} focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition`}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className={`w-9 h-9 rounded-xl ${isDark ? 'bg-white/[0.06] hover:bg-white/[0.1]' : 'bg-white/60 hover:bg-white/80'} flex items-center justify-center transition`}
              >
                {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-500" />}
              </button>

              {/* Messages */}
              <button className={`w-9 h-9 rounded-xl ${isDark ? 'bg-white/[0.06] hover:bg-white/[0.1]' : 'bg-white/60 hover:bg-white/80'} flex items-center justify-center transition relative`}>
                <MessageSquare size={16} className={textSecondary} />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">3</span>
              </button>

              {/* Notifications */}
              <button className={`w-9 h-9 rounded-xl ${isDark ? 'bg-white/[0.06] hover:bg-white/[0.1]' : 'bg-white/60 hover:bg-white/80'} flex items-center justify-center transition relative`}>
                <Bell size={16} className={textSecondary} />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">5</span>
              </button>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Welcome + Featured */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h1 className={`text-2xl font-bold ${textPrimary}`}>Olá, Danilo! 👋</h1>
                  <p className={`text-sm ${textSecondary} mt-1`}>Confira as novidades da plataforma</p>
                </div>
                <button className={`text-sm ${textSecondary} hover:${textPrimary} flex items-center gap-1 transition`}>
                  Ver catálogo <ArrowRight size={14} />
                </button>
              </div>

              {/* Featured video - hero */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative rounded-3xl overflow-hidden group cursor-pointer">
                  <div className="aspect-[16/9] bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {/* Glass overlay at bottom */}
                  <div className={`absolute bottom-0 left-0 right-0 p-6 ${isDark ? 'bg-black/20 backdrop-blur-md' : 'bg-white/20 backdrop-blur-md'}`}>
                    <span className="inline-block bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Destaque</span>
                    <h3 className="text-xl font-bold text-white mt-2">Como consolidar as bases ministeriais em sua igreja</h3>
                    <p className="text-white/60 text-sm mt-1">Marcos Sanches • 45 min</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className={`w-16 h-16 rounded-full ${isDark ? 'bg-white/20 backdrop-blur-xl border border-white/30' : 'bg-white/60 backdrop-blur-xl border border-white/80'} flex items-center justify-center shadow-2xl`}>
                      <Play size={24} className="text-white ml-1" fill="white" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {[
                    { title: 'Saúde emocional da equipe', color: 'from-emerald-900 to-teal-900' },
                    { title: 'Gestão de equipes de alta performance', color: 'from-rose-900 to-pink-900' },
                  ].map((v, i) => (
                    <div key={i} className="relative rounded-2xl overflow-hidden group cursor-pointer flex-1">
                      <div className={`absolute inset-0 bg-gradient-to-br ${v.color}`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className={`absolute bottom-0 left-0 right-0 p-4 ${isDark ? 'bg-black/10 backdrop-blur-sm' : ''}`}>
                        <p className="font-semibold text-sm text-white line-clamp-2">{v.title}</p>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center">
                          <Play size={16} className="text-white ml-0.5" fill="white" />
                        </div>
                      </div>
                      {/* Spacer for aspect ratio */}
                      <div className="aspect-[16/10]" />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Stats row */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <TrendingUp size={20} />, label: 'Conteúdos assistidos', value: '47', color: 'from-blue-500 to-cyan-400' },
                { icon: <Download size={20} />, label: 'Materiais baixados', value: '23', color: 'from-emerald-500 to-teal-400' },
                { icon: <Route size={20} />, label: 'Trilhas em andamento', value: '3', color: 'from-purple-500 to-pink-400' },
                { icon: <Star size={20} />, label: 'Seus pontos', value: '1.250', color: 'from-amber-500 to-orange-400' },
              ].map((stat, i) => (
                <div key={i} className={`${glassCard} rounded-2xl p-5 group hover:scale-[1.02] transition-all duration-300`}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3 shadow-lg`}>
                    {stat.icon}
                  </div>
                  <p className={`text-2xl font-bold ${textPrimary}`}>{stat.value}</p>
                  <p className={`text-xs ${textMuted} mt-0.5`}>{stat.label}</p>
                </div>
              ))}
            </section>

            {/* Two columns: Trending + Top Materials */}
            <section className="grid md:grid-cols-2 gap-6">
              {/* Trending videos */}
              <div className={`${glassCard} rounded-2xl p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-semibold ${textPrimary} flex items-center gap-2`}>
                    <Flame size={18} className="text-orange-400" /> Em Alta
                  </h3>
                  <button className={`text-xs ${textSecondary} hover:${textPrimary}`}>Ver todos</button>
                </div>
                <div className="space-y-3">
                  {mockVideos.slice(0, 4).map((video, i) => (
                    <div key={video.id} className={`flex items-center gap-3 p-2.5 rounded-xl ${isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-white/40'} transition cursor-pointer group`}>
                      <span className={`text-lg font-bold ${textMuted} w-6 text-center`}>{i + 1}</span>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${['from-blue-600 to-indigo-700', 'from-emerald-600 to-teal-700', 'from-purple-600 to-pink-700', 'from-amber-600 to-orange-700'][i]} flex items-center justify-center flex-shrink-0`}>
                        <Play size={14} className="text-white ml-0.5" fill="white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${textPrimary} line-clamp-1 group-hover:text-blue-400 transition`}>{video.title}</p>
                        <p className={`text-xs ${textMuted}`}>{video.author} • {video.views} views</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Materials */}
              <div className={`${glassCard} rounded-2xl p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-semibold ${textPrimary} flex items-center gap-2`}>
                    <Download size={18} className="text-emerald-400" /> Top Materiais
                  </h3>
                  <button className={`text-xs ${textSecondary} hover:${textPrimary}`}>Ver todos</button>
                </div>
                <div className="space-y-3">
                  {topMaterials.map((mat) => (
                    <div key={mat.rank} className={`flex items-center gap-3 p-2.5 rounded-xl ${isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-white/40'} transition cursor-pointer`}>
                      <span className={`text-lg font-bold ${mat.rank <= 3 ? 'text-amber-400' : textMuted} w-6 text-center`}>{mat.rank}</span>
                      <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'} flex items-center justify-center flex-shrink-0`}>
                        <FolderDown size={16} className="text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${textPrimary} line-clamp-1`}>{mat.name}</p>
                        <p className={`text-xs ${textMuted}`}>{mat.downloads} downloads</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Trails in progress */}
            <section className={`${glassCard} rounded-2xl p-5`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${textPrimary} flex items-center gap-2`}>
                  <Route size={18} className="text-purple-400" /> Trilhas em Andamento
                </h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { title: 'Liderança Eficaz', progress: 65, color: 'from-blue-500 to-cyan-400' },
                  { title: 'Gestão Financeira', progress: 30, color: 'from-emerald-500 to-teal-400' },
                  { title: 'Comunicação Visual', progress: 85, color: 'from-purple-500 to-pink-400' },
                ].map((trail, i) => (
                  <div key={i} className={`${isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white/40 border border-white/60'} rounded-xl p-4 hover:scale-[1.02] transition-all duration-300 cursor-pointer`}>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${trail.color} flex items-center justify-center text-white mb-3`}>
                      <GraduationCap size={14} />
                    </div>
                    <p className={`text-sm font-medium ${textPrimary} mb-2`}>{trail.title}</p>
                    <div className={`w-full h-2 rounded-full ${isDark ? 'bg-white/[0.06]' : 'bg-gray-200'} overflow-hidden`}>
                      <div className={`h-full rounded-full bg-gradient-to-r ${trail.color} transition-all duration-500`} style={{ width: `${trail.progress}%` }} />
                    </div>
                    <p className={`text-xs ${textMuted} mt-1.5`}>{trail.progress}% concluído</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Upcoming events */}
            <section className="grid md:grid-cols-2 gap-6">
              {/* Next Webinar */}
              <div className={`${glassCard} rounded-2xl p-5 relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full ${isDark ? 'bg-blue-500/10' : 'bg-blue-100'} blur-2xl`} />
                <h3 className={`font-semibold ${textPrimary} flex items-center gap-2 mb-4 relative`}>
                  <CalendarDays size={18} className="text-blue-400" /> Próximo Webinar
                </h3>
                <div className="relative">
                  <p className={`text-sm font-medium ${textPrimary}`}>Gestão Inovadora para Igrejas</p>
                  <p className={`text-xs ${textSecondary} mt-1`}>Pr. Marcos Madaleno</p>
                  <p className={`text-xs ${textMuted} mt-2`}>📅 28 Mai 2026 • 19:00</p>
                  <button className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-xs font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                    Participar
                  </button>
                </div>
              </div>

              {/* Next Mentoring */}
              <div className={`${glassCard} rounded-2xl p-5 relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full ${isDark ? 'bg-purple-500/10' : 'bg-purple-100'} blur-2xl`} />
                <h3 className={`font-semibold ${textPrimary} flex items-center gap-2 mb-4 relative`}>
                  <Users size={18} className="text-purple-400" /> Próxima Mentoria
                </h3>
                <div className="relative">
                  <p className={`text-sm font-medium ${textPrimary}`}>Mentoria de Liderança</p>
                  <p className={`text-xs ${textSecondary} mt-1`}>Com Pr. Carlos Silva</p>
                  <p className={`text-xs ${textMuted} mt-2`}>📅 30 Mai 2026 • 10:00</p>
                  <button className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-400 text-white text-xs font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all">
                    Ver detalhes
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Back to normal button */}
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
