import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home, BookOpen, Route, GraduationCap, CalendarDays,
  FolderDown, MapPin, BarChart3, Bell, Search, Play,
  TrendingUp, Star, ArrowRight, Zap, Menu, X, Sun, Moon,
  MessageSquare, Flame, Download, Users, Sparkles
} from 'lucide-react'

const VIDEOS = [
  { id: '4CJQVNhVPv4', title: 'Como consolidar as bases ministeriais em sua igreja', author: 'Marcos Sanches', views: '2.4k', duration: '45 min' },
  { id: 'CHy2xDu-FFs', title: 'Saúde emocional da equipe ministerial', author: 'Carmen Rangel', views: '1.8k', duration: '38 min' },
  { id: 'PoyaOKZ4VPY', title: 'Gestão de equipes de alta performance', author: 'Matheus Moraes', views: '3.1k', duration: '52 min' },
  { id: 'cc4AyP6l6jA', title: 'Planejamento estratégico para igrejas e ministérios', author: 'Marcelo Santos', views: '1.5k', duration: '41 min' },
  { id: 'g21WdMNY1pw', title: 'Cultura de Inovação na Igreja', author: 'Marcos Madaleno', views: '2.9k', duration: '47 min' },
  { id: 'zUc7YWPHgGM', title: 'Como a tecnologia pode otimizar seu trabalho', author: 'Talk Gestores', views: '1.2k', duration: '33 min' },
  { id: 'RgJ3p91AR4A', title: 'Como tirar o peso operacional do seu pastor', author: 'Sandra Traudi', views: '980', duration: '29 min' },
  { id: 'TOa4-r120Fk', title: 'Assistência executiva e secretariado ministerial', author: 'Sandra Traldi', views: '756', duration: '35 min' },
]

const MATERIALS = [
  { rank: 1, name: 'Planejamento Estratégico 2026', downloads: 342 },
  { rank: 2, name: 'Manual do Líder de Célula', downloads: 289 },
  { rank: 3, name: 'Guia de Escola Bíblica', downloads: 256 },
  { rank: 4, name: 'Kit Comunicação Visual', downloads: 198 },
  { rank: 5, name: 'Roteiro de Culto Criativo', downloads: 176 },
]

function yt(id: string) { return `https://i.ytimg.com/vi/${id}/hqdefault.jpg` }

// Animated wrapper
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [show, setShow] = useState(false)
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t) }, [delay])
  return (
    <div className={`transition-all duration-700 ease-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className}`}>
      {children}
    </div>
  )
}

export default function PreviewGlassPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isDark, setIsDark] = useState(true)

  const navItems = [
    { icon: <Home size={18} />, label: 'Início', active: true },
    { icon: <BookOpen size={18} />, label: 'Catálogo' },
    { icon: <Route size={18} />, label: 'Trilhas' },
    { icon: <GraduationCap size={18} />, label: 'Mentorias' },
    { icon: <CalendarDays size={18} />, label: 'Planejamento' },
    { icon: <FolderDown size={18} />, label: 'Materiais' },
    { icon: <MapPin size={18} />, label: 'Mapa' },
    { icon: <BarChart3 size={18} />, label: 'Dashboard' },
  ]

  // Shared styles
  const card = isDark
    ? 'bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
    : 'bg-white/80 backdrop-blur-2xl border border-white shadow-[0_2px_20px_rgba(0,0,0,0.04)] shadow-sm'

  return (
    <div className={`min-h-screen transition-colors duration-700 relative overflow-hidden ${isDark ? 'bg-[#060612]' : 'bg-[#f2f5fc]'}`}>
      {/* Ambient background */}
      <div className={`absolute top-[-30%] left-[-15%] w-[700px] h-[700px] rounded-full blur-[150px] transition-colors duration-700 ${isDark ? 'bg-blue-600/25' : 'bg-blue-300/50'}`} />
      <div className={`absolute bottom-[-25%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[130px] transition-colors duration-700 ${isDark ? 'bg-violet-600/20' : 'bg-violet-300/40'}`} />
      <div className={`absolute top-[30%] right-[15%] w-[400px] h-[400px] rounded-full blur-[100px] transition-colors duration-700 ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-200/40'}`} />
      <div className={`absolute top-[60%] left-[30%] w-[300px] h-[300px] rounded-full blur-[90px] transition-colors duration-700 ${isDark ? 'bg-pink-500/8' : 'bg-pink-200/30'}`} />

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <aside className={`w-[240px] flex-shrink-0 flex flex-col transition-all duration-500 backdrop-blur-3xl ${
          isDark ? 'bg-white/[0.02] border-r border-white/[0.05]' : 'bg-white/60 border-r border-gray-200/50'
        } ${sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 absolute'}`}>
          <div className="p-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Zap size={16} className="text-white" />
            </div>
            <span className={`font-semibold text-[15px] ${isDark ? 'text-white' : 'text-gray-900'}`}>Rede Inspire</span>
          </div>

          <nav className="flex-1 px-3 space-y-0.5 mt-2">
            {navItems.map((item, i) => (
              <button key={i} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                item.active
                  ? isDark ? 'bg-white/[0.08] text-white border border-white/[0.1]' : 'bg-white text-gray-900 shadow-sm border border-gray-100'
                  : isDark ? 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
              }`}>
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-3">
            <div className={`rounded-2xl p-3.5 ${isDark ? 'bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.06]' : 'bg-white/80 border border-gray-100'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs">D</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>Danilo Santos</p>
                  <p className={`text-[10px] ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Administrador</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={11} className="text-amber-400" fill="currentColor" />
                  <span className={`text-[10px] font-medium ${isDark ? 'text-amber-400/80' : 'text-amber-600'}`}>1.250</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className={`px-5 py-3 flex items-center gap-4 backdrop-blur-2xl ${
            isDark ? 'bg-white/[0.02] border-b border-white/[0.04]' : 'bg-white/50 border-b border-gray-200/40'
          }`}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className={isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'}>
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/25' : 'text-gray-400'}`} />
                <input type="text" placeholder="Buscar conteúdos, materiais..." className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                  isDark ? 'bg-white/[0.04] border border-white/[0.06] text-white placeholder-white/25' : 'bg-white/80 border border-gray-200 text-gray-900 placeholder-gray-400'
                }`} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsDark(!isDark)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${isDark ? 'bg-white/[0.04] hover:bg-white/[0.08]' : 'bg-white hover:bg-gray-50 border border-gray-200'}`}>
                {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-500" />}
              </button>
              <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition relative ${isDark ? 'bg-white/[0.04] hover:bg-white/[0.08]' : 'bg-white hover:bg-gray-50 border border-gray-200'}`}>
                <MessageSquare size={14} className={isDark ? 'text-white/50' : 'text-gray-500'} />
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">3</span>
              </button>
              <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition relative ${isDark ? 'bg-white/[0.04] hover:bg-white/[0.08]' : 'bg-white hover:bg-gray-50 border border-gray-200'}`}>
                <Bell size={14} className={isDark ? 'text-white/50' : 'text-gray-500'} />
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">5</span>
              </button>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

            {/* Hero section */}
            <FadeIn delay={100}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Olá, Danilo! <Sparkles size={18} className="inline text-amber-400" /></h1>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Confira as novidades da plataforma</p>
                </div>
                <button className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg transition ${isDark ? 'text-white/50 hover:text-white hover:bg-white/[0.04]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                  Ver catálogo <ArrowRight size={12} />
                </button>
              </div>
            </FadeIn>

            {/* Featured grid */}
            <FadeIn delay={200}>
              <div className="grid grid-cols-12 gap-3" style={{ height: '320px' }}>
                {/* Main featured */}
                <div className="col-span-7 relative rounded-2xl overflow-hidden group cursor-pointer h-full">
                  <img src={yt(VIDEOS[0].id)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="inline-block bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Destaque</span>
                    <h3 className="text-lg font-bold text-white mt-2 leading-tight">{VIDEOS[0].title}</h3>
                    <p className="text-white/50 text-xs mt-1">{VIDEOS[0].author} • {VIDEOS[0].duration}</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                      <Play size={22} className="text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                </div>

                {/* Side videos */}
                <div className="col-span-5 flex flex-col gap-3 h-full">
                  {VIDEOS.slice(1, 3).map((v) => (
                    <div key={v.id} className="relative rounded-2xl overflow-hidden group cursor-pointer flex-1">
                      <img src={yt(v.id)} alt="" className="w-full h-full object-cover absolute inset-0" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3.5">
                        <p className="font-medium text-xs text-white line-clamp-2 leading-snug">{v.title}</p>
                        <p className="text-white/40 text-[10px] mt-1">{v.author}</p>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                          <Play size={14} className="text-white ml-0.5" fill="white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Stats + Quick actions row */}
            <FadeIn delay={350}>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: <TrendingUp size={16} />, label: 'Assistidos', value: '47', gradient: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/20' },
                  { icon: <Download size={16} />, label: 'Downloads', value: '23', gradient: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-500/20' },
                  { icon: <Route size={16} />, label: 'Trilhas', value: '3', gradient: 'from-violet-500 to-purple-400', shadow: 'shadow-violet-500/20' },
                  { icon: <Star size={16} />, label: 'Pontos', value: '1.250', gradient: 'from-amber-500 to-orange-400', shadow: 'shadow-amber-500/20' },
                ].map((s, i) => (
                  <div key={i} className={`${card} rounded-2xl p-4 hover:scale-[1.03] transition-all duration-300 cursor-default`}>
                    <div className="flex items-center justify-between">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shadow-lg ${s.shadow}`}>
                        {s.icon}
                      </div>
                      <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{s.value}</p>
                    </div>
                    <p className={`text-[11px] mt-2 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{s.label}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* Main content grid: 3 columns */}
            <FadeIn delay={500}>
              <div className="grid grid-cols-12 gap-4">
                {/* Trending - takes 5 cols */}
                <div className={`col-span-5 ${card} rounded-2xl p-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-sm font-semibold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <Flame size={15} className="text-orange-400" /> Em Alta
                    </h3>
                    <button className={`text-[10px] ${isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}>Ver todos →</button>
                  </div>
                  <div className="space-y-1.5">
                    {VIDEOS.slice(0, 5).map((v, i) => (
                      <div key={v.id} className={`flex items-center gap-2.5 p-2 rounded-xl transition cursor-pointer ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50'}`}>
                        <span className={`text-sm font-bold w-4 text-center ${i < 3 ? 'text-amber-400' : isDark ? 'text-white/20' : 'text-gray-300'}`}>{i + 1}</span>
                        <img src={yt(v.id)} alt="" className="w-12 h-8 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium line-clamp-1 ${isDark ? 'text-white/90' : 'text-gray-800'}`}>{v.title}</p>
                          <p className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{v.author} • {v.views}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Materials - takes 4 cols */}
                <div className={`col-span-4 ${card} rounded-2xl p-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-sm font-semibold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <Download size={15} className="text-emerald-400" /> Top Materiais
                    </h3>
                    <button className={`text-[10px] ${isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}>Ver todos →</button>
                  </div>
                  <div className="space-y-1.5">
                    {MATERIALS.map((m) => (
                      <div key={m.rank} className={`flex items-center gap-2.5 p-2 rounded-xl transition cursor-pointer ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50'}`}>
                        <span className={`text-sm font-bold w-4 text-center ${m.rank <= 3 ? 'text-amber-400' : isDark ? 'text-white/20' : 'text-gray-300'}`}>{m.rank}</span>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                          <FolderDown size={13} className="text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium line-clamp-1 ${isDark ? 'text-white/90' : 'text-gray-800'}`}>{m.name}</p>
                          <p className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{m.downloads} downloads</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right column: Events + Trails */}
                <div className="col-span-3 space-y-3">
                  {/* Webinar */}
                  <div className={`${card} rounded-2xl p-4 relative overflow-hidden`}>
                    <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl ${isDark ? 'bg-blue-500/15' : 'bg-blue-200/50'}`} />
                    <h4 className={`text-xs font-semibold flex items-center gap-1.5 mb-2.5 relative ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <CalendarDays size={13} className="text-blue-400" /> Próximo Webinar
                    </h4>
                    <p className={`text-xs font-medium relative ${isDark ? 'text-white/90' : 'text-gray-800'}`}>Gestão Inovadora para Igrejas</p>
                    <p className={`text-[10px] mt-0.5 relative ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Pr. Marcos Madaleno</p>
                    <p className={`text-[10px] mt-1.5 relative ${isDark ? 'text-white/30' : 'text-gray-400'}`}>📅 28 Mai • 19:00</p>
                    <button className="mt-2.5 w-full px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-[10px] font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                      Participar
                    </button>
                  </div>

                  {/* Mentoring */}
                  <div className={`${card} rounded-2xl p-4 relative overflow-hidden`}>
                    <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl ${isDark ? 'bg-purple-500/15' : 'bg-purple-200/50'}`} />
                    <h4 className={`text-xs font-semibold flex items-center gap-1.5 mb-2.5 relative ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <Users size={13} className="text-purple-400" /> Próxima Mentoria
                    </h4>
                    <p className={`text-xs font-medium relative ${isDark ? 'text-white/90' : 'text-gray-800'}`}>Mentoria de Liderança</p>
                    <p className={`text-[10px] mt-0.5 relative ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Pr. Carlos Silva</p>
                    <p className={`text-[10px] mt-1.5 relative ${isDark ? 'text-white/30' : 'text-gray-400'}`}>📅 30 Mai • 10:00</p>
                    <button className="mt-2.5 w-full px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-400 text-white text-[10px] font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all">
                      Ver detalhes
                    </button>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Trails row */}
            <FadeIn delay={650}>
              <div className={`${card} rounded-2xl p-4`}>
                <h3 className={`text-sm font-semibold flex items-center gap-1.5 mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Route size={15} className="text-violet-400" /> Trilhas em Andamento
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { title: 'Liderança Eficaz', progress: 65, gradient: 'from-blue-500 to-cyan-400', modules: '8/12 módulos' },
                    { title: 'Gestão Financeira', progress: 30, gradient: 'from-emerald-500 to-teal-400', modules: '3/10 módulos' },
                    { title: 'Comunicação Visual', progress: 85, gradient: 'from-violet-500 to-purple-400', modules: '6/7 módulos' },
                  ].map((trail, i) => (
                    <div key={i} className={`rounded-xl p-3.5 hover:scale-[1.02] transition-all duration-300 cursor-pointer ${
                      isDark ? 'bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1]' : 'bg-white/60 border border-gray-100 hover:border-gray-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${trail.gradient} flex items-center justify-center text-white`}>
                          <GraduationCap size={12} />
                        </div>
                        <p className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{trail.title}</p>
                      </div>
                      <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/[0.05]' : 'bg-gray-200'}`}>
                        <div className={`h-full rounded-full bg-gradient-to-r ${trail.gradient}`} style={{ width: `${trail.progress}%` }} />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{trail.modules}</p>
                        <p className={`text-[10px] font-medium ${isDark ? 'text-white/50' : 'text-gray-600'}`}>{trail.progress}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* More videos row */}
            <FadeIn delay={800}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-sm font-semibold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Sparkles size={15} className="text-cyan-400" /> Continue Assistindo
                </h3>
                <button className={`text-[10px] ${isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}>Ver todos →</button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {VIDEOS.slice(3, 7).map((v) => (
                  <div key={v.id} className="group cursor-pointer">
                    <div className="relative rounded-xl overflow-hidden">
                      <img src={yt(v.id)} alt="" className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-lg border border-white/20 flex items-center justify-center">
                          <Play size={12} className="text-white ml-0.5" fill="white" />
                        </div>
                      </div>
                      <span className={`absolute bottom-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded font-medium ${isDark ? 'bg-black/60 text-white/70' : 'bg-black/50 text-white'}`}>{v.duration}</span>
                    </div>
                    <p className={`text-[11px] font-medium mt-2 line-clamp-2 leading-snug ${isDark ? 'text-white/80' : 'text-gray-800'}`}>{v.title}</p>
                    <p className={`text-[10px] mt-0.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{v.author}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </main>
        </div>
      </div>

      {/* Back button */}
      <div className="fixed bottom-5 right-5 z-50">
        <button onClick={() => navigate('/')} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-xs font-medium shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          ← Voltar à versão atual
        </button>
      </div>
    </div>
  )
}
