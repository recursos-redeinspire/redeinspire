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

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [show, setShow] = useState(false)
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t) }, [delay])
  return <div className={`transition-all duration-700 ease-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className}`}>{children}</div>
}

// Liquid Glass Icon — based on Apple's reference: solid colored circle with glass shine
function GlassIcon({ children, size = 32, color = 'bg-blue-500' }: { children: React.ReactNode; size?: number; color?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-full overflow-hidden ${color}`} style={{ width: size, height: size }}>
      <div className="absolute top-0 left-[15%] right-[15%] h-[50%] bg-gradient-to-b from-white/50 to-transparent rounded-b-full" />
      <div className="relative z-10 text-white">{children}</div>
    </div>
  )
}

export default function PreviewGlassPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isDark, setIsDark] = useState(true)

  const d = isDark // shorthand

  const navItems = [
    { icon: <Home size={16} />, label: 'Início', active: true },
    { icon: <BookOpen size={16} />, label: 'Catálogo' },
    { icon: <Route size={16} />, label: 'Trilhas' },
    { icon: <GraduationCap size={16} />, label: 'Mentorias' },
    { icon: <CalendarDays size={16} />, label: 'Planejamento' },
    { icon: <FolderDown size={16} />, label: 'Materiais' },
    { icon: <MapPin size={16} />, label: 'Mapa' },
    { icon: <BarChart3 size={16} />, label: 'Dashboard' },
  ]

  // Glass panel — NO borders in light mode, just blur + translucency
  const glass = d
    ? 'bg-white/[0.05] backdrop-blur-2xl rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
    : 'bg-white/40 backdrop-blur-2xl rounded-2xl shadow-[0_1px_20px_rgba(0,0,0,0.06)]'

  // Text colors
  const t1 = d ? 'text-white' : 'text-gray-900'
  const t2 = d ? 'text-white/60' : 'text-gray-600'
  const t3 = d ? 'text-white/35' : 'text-gray-400'

  return (
    <div id="glass-preview" className={`glass-preview min-h-screen transition-all duration-700 relative overflow-hidden ${d ? 'bg-[#060612]' : 'bg-gradient-to-br from-sky-200 via-blue-300 to-indigo-400'}`}>
      {/* Ambient blobs */}
      {d && <>
        <div className="absolute top-[-25%] left-[-10%] w-[700px] h-[700px] rounded-full blur-[150px] bg-blue-600/25" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[130px] bg-violet-600/20" />
        <div className="absolute top-[35%] right-[10%] w-[400px] h-[400px] rounded-full blur-[100px] bg-cyan-500/10" />
      </>}
      {!d && <>
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[100px] bg-white/30" />
        <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] rounded-full blur-[80px] bg-blue-200/40" />
      </>}

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <aside className={`w-[220px] flex-shrink-0 flex flex-col transition-all duration-500 backdrop-blur-3xl rounded-r-3xl m-2 mr-0 ${
          d ? 'bg-white/[0.04]' : 'bg-white/30'
        } ${sidebarOpen ? '' : 'hidden'}`}>
          <div className="p-4 flex items-center gap-2.5">
            <GlassIcon size={32} color="bg-blue-500"><Zap size={14} /></GlassIcon>
            <span className={`font-semibold text-sm ${t1}`}>Rede Inspire</span>
          </div>

          <nav className="flex-1 px-2 space-y-0.5 mt-1">
            {navItems.map((item, i) => (
              <button key={i} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                item.active
                  ? d ? 'bg-white/[0.1] text-white' : 'bg-white/60 text-gray-900 shadow-sm'
                  : d ? 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]' : 'text-gray-700 hover:text-gray-900 hover:bg-white/30'
              }`}>
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-3">
            <div className={`rounded-xl p-3 ${d ? 'bg-white/[0.04]' : 'bg-white/40'}`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-[10px]">D</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${t1}`}>Danilo Santos</p>
                  <p className={`text-[10px] ${t3}`}>Administrador</p>
                </div>
                <div className="flex items-center gap-0.5">
                  <Star size={10} className="text-amber-400" fill="currentColor" />
                  <span className={`text-[9px] font-bold ${d ? 'text-amber-300' : 'text-amber-600'}`}>1.250</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className={`mx-2 mt-2 px-4 py-2.5 flex items-center gap-3 backdrop-blur-2xl rounded-2xl ${d ? 'bg-white/[0.04]' : 'bg-white/30'}`}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className={d ? 'text-white/50 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t3}`} />
                <input type="text" placeholder="Buscar conteúdos, materiais..." className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs focus:outline-none transition ${
                  d ? 'bg-white/[0.06] text-white placeholder-white/30' : 'bg-white/50 text-gray-900 placeholder-gray-500'
                }`} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsDark(!isDark)} className={`w-8 h-8 rounded-full flex items-center justify-center transition ${d ? 'bg-white/[0.06] hover:bg-white/[0.1]' : 'bg-white/50 hover:bg-white/70'}`}>
                {d ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-600" />}
              </button>
              <button className={`w-8 h-8 rounded-full flex items-center justify-center transition relative ${d ? 'bg-white/[0.06]' : 'bg-white/50'}`}>
                <MessageSquare size={13} className={t2} />
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">3</span>
              </button>
              <button className={`w-8 h-8 rounded-full flex items-center justify-center transition relative ${d ? 'bg-white/[0.06]' : 'bg-white/50'}`}>
                <Bell size={13} className={t2} />
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">5</span>
              </button>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

            {/* Welcome */}
            <FadeIn delay={100}>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-lg font-bold ${t1}`}>Olá, Danilo! <Sparkles size={16} className="inline text-amber-400" /></h1>
                  <p className={`text-xs ${t2}`}>Confira as novidades da plataforma</p>
                </div>
                <button className={`text-xs flex items-center gap-1 ${t2} hover:${t1}`}>Ver catálogo <ArrowRight size={12} /></button>
              </div>
            </FadeIn>

            {/* Featured videos */}
            <FadeIn delay={200}>
              <div className="grid grid-cols-12 gap-3" style={{ height: '300px' }}>
                <div className="col-span-7 relative rounded-2xl overflow-hidden group cursor-pointer h-full">
                  <img src={yt(VIDEOS[0].id)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="inline-block bg-blue-500 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Destaque</span>
                    <h3 className="text-base font-bold text-white mt-1.5 leading-tight">{VIDEOS[0].title}</h3>
                    <p className="text-white/50 text-[11px] mt-1">{VIDEOS[0].author} • {VIDEOS[0].duration}</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center"><Play size={20} className="text-white ml-0.5" fill="white" /></div>
                  </div>
                </div>
                <div className="col-span-5 flex flex-col gap-3 h-full">
                  {VIDEOS.slice(1, 3).map((v) => (
                    <div key={v.id} className="relative rounded-2xl overflow-hidden group cursor-pointer flex-1">
                      <img src={yt(v.id)} alt="" className="w-full h-full object-cover absolute inset-0" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="font-medium text-[11px] text-white line-clamp-2">{v.title}</p>
                        <p className="text-white/40 text-[10px] mt-0.5">{v.author}</p>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center"><Play size={14} className="text-white ml-0.5" fill="white" /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Stats */}
            <FadeIn delay={350}>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: <TrendingUp size={14} />, label: 'Assistidos', value: '47', color: 'bg-blue-500' },
                  { icon: <Download size={14} />, label: 'Downloads', value: '23', color: 'bg-emerald-500' },
                  { icon: <Route size={14} />, label: 'Trilhas', value: '3', color: 'bg-violet-500' },
                  { icon: <Star size={14} />, label: 'Pontos', value: '1.250', color: 'bg-amber-500' },
                ].map((s, i) => (
                  <div key={i} className={`${glass} p-4 hover:scale-[1.02] transition-all duration-300`}>
                    <div className="flex items-center justify-between">
                      <GlassIcon size={30} color={s.color}>{s.icon}</GlassIcon>
                      <p className={`text-xl font-bold ${t1}`}>{s.value}</p>
                    </div>
                    <p className={`text-[10px] mt-2 ${t3}`}>{s.label}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* 3-column layout */}
            <FadeIn delay={500}>
              <div className="grid grid-cols-12 gap-3">
                {/* Trending */}
                <div className={`col-span-5 ${glass} p-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-xs font-semibold flex items-center gap-2 ${t1}`}>
                      <GlassIcon size={22} color="bg-orange-500"><Flame size={10} /></GlassIcon> Em Alta
                    </h3>
                    <span className={`text-[9px] ${t3}`}>Ver todos →</span>
                  </div>
                  <div className="space-y-1">
                    {VIDEOS.slice(0, 5).map((v, i) => (
                      <div key={v.id} className={`flex items-center gap-2 p-1.5 rounded-lg transition cursor-pointer ${d ? 'hover:bg-white/[0.04]' : 'hover:bg-white/30'}`}>
                        <span className={`text-xs font-bold w-3 ${i < 3 ? 'text-amber-400' : t3}`}>{i + 1}</span>
                        <img src={yt(v.id)} alt="" className="w-11 h-7 rounded-md object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] font-medium line-clamp-1 ${t1}`}>{v.title}</p>
                          <p className={`text-[9px] ${t3}`}>{v.author} • {v.views}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Materials */}
                <div className={`col-span-4 ${glass} p-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-xs font-semibold flex items-center gap-2 ${t1}`}>
                      <GlassIcon size={22} color="bg-emerald-500"><Download size={10} /></GlassIcon> Top Materiais
                    </h3>
                    <span className={`text-[9px] ${t3}`}>Ver todos →</span>
                  </div>
                  <div className="space-y-1">
                    {MATERIALS.map((m) => (
                      <div key={m.rank} className={`flex items-center gap-2 p-1.5 rounded-lg transition cursor-pointer ${d ? 'hover:bg-white/[0.04]' : 'hover:bg-white/30'}`}>
                        <span className={`text-xs font-bold w-3 ${m.rank <= 3 ? 'text-amber-400' : t3}`}>{m.rank}</span>
                        <GlassIcon size={22} color="bg-teal-500"><FolderDown size={10} /></GlassIcon>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] font-medium line-clamp-1 ${t1}`}>{m.name}</p>
                          <p className={`text-[9px] ${t3}`}>{m.downloads} downloads</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Events column */}
                <div className="col-span-3 space-y-3">
                  <div className={`${glass} p-3.5`}>
                    <h4 className={`text-[11px] font-semibold flex items-center gap-1.5 mb-2 ${t1}`}>
                      <GlassIcon size={20} color="bg-blue-500"><CalendarDays size={9} /></GlassIcon> Próximo Webinar
                    </h4>
                    <p className={`text-[11px] font-medium ${t1}`}>Gestão Inovadora para Igrejas</p>
                    <p className={`text-[9px] mt-0.5 ${t3}`}>Pr. Marcos Madaleno</p>
                    <p className={`text-[9px] mt-1 ${t3}`}>📅 28 Mai • 19:00</p>
                    <button className="mt-2 w-full py-1.5 rounded-lg bg-blue-500 text-white text-[10px] font-medium hover:bg-blue-600 transition">Participar</button>
                  </div>
                  <div className={`${glass} p-3.5`}>
                    <h4 className={`text-[11px] font-semibold flex items-center gap-1.5 mb-2 ${t1}`}>
                      <GlassIcon size={20} color="bg-purple-500"><Users size={9} /></GlassIcon> Próxima Mentoria
                    </h4>
                    <p className={`text-[11px] font-medium ${t1}`}>Mentoria de Liderança</p>
                    <p className={`text-[9px] mt-0.5 ${t3}`}>Pr. Carlos Silva</p>
                    <p className={`text-[9px] mt-1 ${t3}`}>📅 30 Mai • 10:00</p>
                    <button className="mt-2 w-full py-1.5 rounded-lg bg-purple-500 text-white text-[10px] font-medium hover:bg-purple-600 transition">Ver detalhes</button>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Trails */}
            <FadeIn delay={650}>
              <div className={`${glass} p-4`}>
                <h3 className={`text-xs font-semibold flex items-center gap-2 mb-3 ${t1}`}>
                  <GlassIcon size={22} color="bg-violet-500"><Route size={10} /></GlassIcon> Trilhas em Andamento
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { title: 'Liderança Eficaz', progress: 65, color: 'bg-blue-500', modules: '8/12' },
                    { title: 'Gestão Financeira', progress: 30, color: 'bg-emerald-500', modules: '3/10' },
                    { title: 'Comunicação Visual', progress: 85, color: 'bg-violet-500', modules: '6/7' },
                  ].map((trail, i) => (
                    <div key={i} className={`rounded-xl p-3 transition-all hover:scale-[1.02] cursor-pointer ${d ? 'bg-white/[0.03] hover:bg-white/[0.06]' : 'bg-white/30 hover:bg-white/50'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <GlassIcon size={24} color={trail.color}><GraduationCap size={11} /></GlassIcon>
                        <p className={`text-[11px] font-medium ${t1}`}>{trail.title}</p>
                      </div>
                      <div className={`w-full h-1.5 rounded-full overflow-hidden ${d ? 'bg-white/[0.06]' : 'bg-black/10'}`}>
                        <div className={`h-full rounded-full ${trail.color}`} style={{ width: `${trail.progress}%` }} />
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <p className={`text-[9px] ${t3}`}>{trail.modules} módulos</p>
                        <p className={`text-[9px] font-medium ${t2}`}>{trail.progress}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Continue watching */}
            <FadeIn delay={800}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-xs font-semibold flex items-center gap-2 ${t1}`}>
                  <GlassIcon size={22} color="bg-cyan-500"><Sparkles size={10} /></GlassIcon> Continue Assistindo
                </h3>
                <span className={`text-[9px] ${t3}`}>Ver todos →</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {VIDEOS.slice(3, 7).map((v) => (
                  <div key={v.id} className="group cursor-pointer">
                    <div className="relative rounded-xl overflow-hidden">
                      <img src={yt(v.id)} alt="" className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="w-8 h-8 rounded-full bg-white/25 backdrop-blur-lg flex items-center justify-center"><Play size={12} className="text-white ml-0.5" fill="white" /></div>
                      </div>
                      <span className="absolute bottom-1 right-1 text-[8px] px-1.5 py-0.5 rounded bg-black/60 text-white/80 font-medium">{v.duration}</span>
                    </div>
                    <p className={`text-[10px] font-medium mt-1.5 line-clamp-2 leading-snug ${t1}`}>{v.title}</p>
                    <p className={`text-[9px] mt-0.5 ${t3}`}>{v.author}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </main>
        </div>
      </div>

      {/* Back */}
      <div className="fixed bottom-4 right-4 z-50">
        <button onClick={() => navigate('/')} className="px-4 py-2 rounded-full bg-blue-500 text-white text-xs font-medium shadow-lg shadow-blue-500/30 hover:scale-105 transition-all">
          ← Voltar à versão atual
        </button>
      </div>
    </div>
  )
}
