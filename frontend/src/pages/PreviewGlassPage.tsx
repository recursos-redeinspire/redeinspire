import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, BookOpen, Route, GraduationCap, CalendarDays,
  FolderDown, MapPin, BarChart3, Bell, Search, Play,
  TrendingUp, Star, ChevronRight, Zap, Menu, Settings,
  Video, Lock, Award, Calendar
} from "lucide-react";

/* ─── data ─── */
const VIDEOS = [
  { id: '4CJQVNhVPv4', title: 'Como consolidar as bases ministeriais em sua igreja', author: 'Marcos Sanches' },
  { id: 'CHy2xDu-FFs', title: 'Saúde emocional da equipe ministerial', author: 'Carmen Rangel' },
  { id: 'PoyaOKZ4VPY', title: 'Gestão de equipes de alta performance', author: 'Matheus Moraes' },
  { id: 'cc4AyP6l6jA', title: 'Planejamento estratégico para igrejas e ministérios', author: 'Marcelo Santos' },
  { id: 'g21WdMNY1pw', title: 'Cultura de Inovação na Igreja', author: 'Marcos Madaleno' },
  { id: 'zUc7YWPHgGM', title: 'Como a tecnologia pode otimizar seu trabalho na igreja', author: 'Talk Gestores' },
  { id: 'RgJ3p91AR4A', title: 'Como tirar o peso operacional do seu pastor', author: 'Sandra Traudi' },
  { id: 'TOa4-r120Fk', title: 'Assistência executiva e secretariado ministerial', author: 'Sandra Traldi' },
];

function yt(id: string) { return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`; }

const navItems = [
  { icon: Home, label: "Início" },
  { icon: Route, label: "Trilhas" },
  { icon: BookOpen, label: "Catálogo" },
  { icon: FolderDown, label: "Materiais" },
  { icon: GraduationCap, label: "Mentorias" },
  { icon: CalendarDays, label: "Planejamento" },
  { icon: MapPin, label: "Mapa" },
  { icon: BarChart3, label: "Dashboard" },
];

const topMaterials = [
  { num: 1, title: "Planejamento Estratégico 2026" },
  { num: 2, title: "Manual do Líder de Célula" },
  { num: 3, title: "Guia de Escola Bíblica Dominical" },
  { num: 4, title: "Kit Comunicação Visual para Igrejas" },
  { num: 5, title: "Roteiro de Culto Criativo" },
  { num: 6, title: "Modelo de Relatório Ministerial", locked: true },
  { num: 7, title: "Guia de Acolhimento de Novos Membros", locked: true },
  { num: 8, title: "Template de Planejamento Anual", locked: true },
  { num: 9, title: "Manual de Mídia e Redes Sociais", locked: true },
  { num: 10, title: "Apostila Escola de Líderes", locked: true },
];

const topConteudos = [
  { num: 1, title: "Pr Yan — Recursos Financeiros x Prioridades na Igreja" },
  { num: 2, title: "Como consolidar as bases ministeriais" },
  { num: 3, title: "Saúde emocional da equipe ministerial" },
  { num: 4, title: "Gestão de equipes de alta performance" },
  { num: 5, title: "Cultura de Inovação na Igreja" },
];

const events = [
  { title: "Liderança em Tempos de Crise", date: "Sex, 6 de junho de 2026", time: "19:00", status: "Gratuito", gradient: "from-indigo-500 to-violet-600" },
  { title: "Capacitação de Líderes de Célula", date: "Sáb, 15 de junho de 2026", time: "09:00", status: "Inscrito", gradient: "from-sky-500 to-cyan-500" },
  { title: "Congresso Anual Rede Inspire", date: "Dom, 20 de julho de 2026", time: "08:00", status: "Registrar", gradient: "from-rose-500 to-pink-600" },
];

/* ─── Glass primitives ─── */
function Glass({ children, className = "", hover = false, style }: { children: React.ReactNode; className?: string; hover?: boolean; style?: React.CSSProperties }) {
  return (
    <div
      className={`bg-white/[0.06] backdrop-blur-2xl border border-white/[0.11] rounded-2xl ${hover ? "hover:bg-white/[0.09] hover:border-white/[0.18] transition-all duration-200 cursor-pointer" : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

function GlassButton({ children, className = "", variant = "ghost" }: { children: React.ReactNode; className?: string; variant?: "ghost" | "primary" | "success" | "outline" }) {
  const v: Record<string, string> = {
    ghost: "bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-white/70 hover:text-white",
    primary: "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 border border-white/[0.15] text-white shadow-lg shadow-indigo-500/25",
    success: "bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-emerald-300",
    outline: "bg-transparent hover:bg-white/[0.06] border border-white/[0.15] text-white/60 hover:text-white",
  };
  return <button className={`transition-all duration-150 ${v[variant]} ${className}`}>{children}</button>;
}

/* ─── Sidebar ─── */
function Sidebar({ collapsed, activeNav, setActiveNav }: { collapsed: boolean; activeNav: number; setActiveNav: (i: number) => void }) {
  return (
    <aside className={`flex flex-col h-full shrink-0 z-20 bg-white/[0.045] backdrop-blur-3xl border-r border-white/[0.08] transition-all duration-300 ${collapsed ? "w-[60px]" : "w-52"}`}>
      <div className={`flex items-center gap-3 py-5 border-b border-white/[0.07] ${collapsed ? "px-3 justify-center" : "px-4"}`}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
          <Zap size={14} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-white/90 text-[11px] font-semibold leading-tight truncate">Rede Inspire</div>
            <div className="text-white/35 text-[9px] tracking-wide truncate">Igreja Inspire SP</div>
          </div>
        )}
      </div>
      <nav className="flex-1 px-2 py-3 space-y-px overflow-y-auto">
        {navItems.map((item, i) => (
          <button key={i} onClick={() => setActiveNav(i)} title={collapsed ? item.label : undefined}
            className={`w-full flex items-center gap-3 rounded-xl text-left transition-all duration-150 group ${collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2"} ${activeNav === i ? "bg-white/[0.11] text-white border border-white/[0.15] shadow shadow-white/5" : "text-white/40 hover:text-white/75 hover:bg-white/[0.05]"}`}>
            <item.icon size={15} className={`shrink-0 transition-colors ${activeNav === i ? "text-indigo-300" : ""}`} />
            {!collapsed && <span className="text-[11.5px] font-medium truncate">{item.label}</span>}
          </button>
        ))}
      </nav>
      <div className="px-2 py-3 border-t border-white/[0.07]">
        <button className={`w-full flex items-center gap-3 rounded-xl text-white/35 hover:text-white/65 hover:bg-white/[0.05] transition-all ${collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2"}`}>
          <Settings size={15} className="shrink-0" />
          {!collapsed && <span className="text-[11.5px] font-medium">Configurações</span>}
        </button>
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2 mt-1 rounded-xl hover:bg-white/[0.05] cursor-pointer transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[10px] font-semibold text-white shrink-0">D</div>
            <div className="min-w-0">
              <div className="text-white/75 text-[11px] font-medium truncate">Danilo Santos</div>
              <div className="text-white/30 text-[9px] truncate">Administrador</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

/* ─── Topbar ─── */
function Topbar({ onToggle }: { onToggle: () => void }) {
  return (
    <header className="flex items-center gap-3 px-5 py-3 bg-white/[0.03] backdrop-blur-2xl border-b border-white/[0.07] shrink-0">
      <button onClick={onToggle} className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-all">
        <Menu size={16} />
      </button>
      <div className="flex items-center gap-2 bg-white/[0.06] border border-white/[0.09] rounded-xl px-3 py-1.5 flex-1 max-w-sm">
        <Search size={13} className="text-white/35 shrink-0" />
        <input className="bg-transparent text-[13px] text-white/80 placeholder-white/25 outline-none flex-1 min-w-0" placeholder="Buscar conteúdo, materiais..." />
      </div>
      <div className="flex items-center gap-1.5 ml-auto">
        <button className="relative p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-all">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-violet-400 rounded-full ring-1 ring-[#060b1a]" />
        </button>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[11px] font-semibold text-white shadow-md shadow-orange-500/30 cursor-pointer">D</div>
      </div>
    </header>
  );
}

/* ─── Main Page ─── */
export default function PreviewGlassPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState(0);

  return (
    <div className="min-h-screen bg-[#060b1a] text-white overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-8%] left-[18%] w-[520px] h-[520px] bg-indigo-600/[0.22] rounded-full blur-[130px]" />
        <div className="absolute top-[25%] right-[5%] w-[420px] h-[420px] bg-violet-600/[0.18] rounded-full blur-[110px]" />
        <div className="absolute bottom-[5%] left-[5%] w-[380px] h-[380px] bg-blue-600/[0.14] rounded-full blur-[110px]" />
        <div className="absolute top-[55%] left-[45%] w-[320px] h-[320px] bg-purple-800/[0.13] rounded-full blur-[90px]" />
      </div>

      {/* Layout */}
      <div className="relative flex h-screen">
        <Sidebar collapsed={collapsed} activeNav={activeNav} setActiveNav={setActiveNav} />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar onToggle={() => setCollapsed(c => !c)} />

          <main className="flex-1 overflow-y-auto px-6 py-5 space-y-5" style={{ scrollbarWidth: "none" }}>
            {/* Welcome */}
            <div>
              <h1 className="text-[17px] font-semibold text-white/90">Bem-vindo, Danilo!</h1>
              <p className="text-[12px] text-white/35 mt-0.5">Quinta-feira, 22 de maio de 2026</p>
            </div>

            {/* Hero grid */}
            <div className="grid grid-cols-3 gap-3">
              <Glass className="col-span-2 overflow-hidden group" hover>
                <div className="relative h-52">
                  <img src={yt(VIDEOS[0].id)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-200 shadow-xl">
                      <Play size={16} className="text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="text-[9px] font-bold bg-amber-400 text-black px-2 py-0.5 rounded-full uppercase tracking-wider">Destaque</span>
                    <h3 className="text-white font-semibold text-[13px] mt-1.5 leading-snug">{VIDEOS[0].title}</h3>
                    <p className="text-white/45 text-[10px] mt-0.5">{VIDEOS[0].author} · Rede Inspire</p>
                  </div>
                </div>
              </Glass>
              <Glass className="overflow-hidden group" hover>
                <div className="relative h-52">
                  <img src={yt(VIDEOS[1].id)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-200">
                      <Play size={13} className="text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <span className="text-[9px] font-bold bg-indigo-400/90 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Novo</span>
                    <h3 className="text-white text-[11px] font-semibold mt-1.5 leading-snug">{VIDEOS[1].title}</h3>
                  </div>
                </div>
              </Glass>
            </div>

            {/* Highlight banner */}
            <Glass className="p-4 flex items-center gap-5" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.10) 100%)", borderColor: "rgba(99,102,241,0.25)" }}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
                <TrendingUp size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[9.5px] font-semibold text-indigo-300 uppercase tracking-[0.12em] mb-0.5">Em destaque</div>
                <h3 className="text-white font-semibold text-[13px] truncate">Gestão de equipes de alta performance</h3>
                <p className="text-white/40 text-[10.5px] mt-0.5">{VIDEOS[2].author} · Rede Inspire</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-3xl font-bold text-white tabular-nums leading-none">127</div>
                <div className="text-white/35 text-[10px] mt-0.5">assistindo</div>
              </div>
              <GlassButton variant="primary" className="shrink-0 text-[11px] font-semibold px-4 py-2 rounded-xl">Assistir agora</GlassButton>
            </Glass>

            {/* Top 10 lists */}
            <div className="grid grid-cols-2 gap-3">
              <Glass className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Star size={13} className="text-amber-400" />
                    <h2 className="text-[12.5px] font-semibold text-white/90">Top 10 Materiais</h2>
                  </div>
                  <button className="text-[10.5px] text-indigo-300/80 hover:text-indigo-200 transition-colors flex items-center gap-0.5">Ver todos <ChevronRight size={10} /></button>
                </div>
                <div className="space-y-0.5">
                  {topMaterials.map((item) => (
                    <div key={item.num} className="flex items-center gap-3 py-1.5 px-2 rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer group">
                      <span className="text-[11px] font-bold text-white/20 w-4 shrink-0 tabular-nums">{item.num}</span>
                      <span className={`text-[11.5px] flex-1 truncate transition-colors ${item.locked ? "text-white/25" : "text-white/62 group-hover:text-white/90"}`}>{item.title}</span>
                      {item.locked && <Lock size={9} className="text-white/20 shrink-0" />}
                    </div>
                  ))}
                </div>
              </Glass>
              <Glass className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Video size={13} className="text-indigo-300" />
                    <h2 className="text-[12.5px] font-semibold text-white/90">Top Conteúdos</h2>
                  </div>
                  <button className="text-[10.5px] text-indigo-300/80 hover:text-indigo-200 transition-colors flex items-center gap-0.5">Ver todos <ChevronRight size={10} /></button>
                </div>
                <div className="space-y-0.5">
                  {topConteudos.map((item) => (
                    <div key={item.num} className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer group">
                      <span className="text-[11px] font-bold text-white/20 w-4 shrink-0 tabular-nums">{item.num}</span>
                      <span className="text-[11.5px] text-white/62 group-hover:text-white/90 transition-colors leading-snug line-clamp-2">{item.title}</span>
                    </div>
                  ))}
                </div>
              </Glass>
            </div>

            {/* Certifications / Continue assistindo */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Award size={13} className="text-amber-300" />
                  <h2 className="text-[12.5px] font-semibold text-white/90">Continue Assistindo</h2>
                </div>
                <button className="text-[10.5px] text-indigo-300/80 hover:text-indigo-200 transition-colors flex items-center gap-0.5">Ver todos <ChevronRight size={10} /></button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {VIDEOS.slice(2, 7).map((v) => (
                  <Glass key={v.id} className="shrink-0 w-48 overflow-hidden group" hover>
                    <div className="relative h-24">
                      <img src={yt(v.id)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center"><Play size={12} className="text-white ml-0.5" fill="white" /></div>
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="text-[10.5px] text-white/75 font-medium leading-snug line-clamp-2">{v.title}</p>
                    </div>
                  </Glass>
                ))}
              </div>
            </div>

            {/* Events */}
            <div className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-sky-300" />
                  <h2 className="text-[12.5px] font-semibold text-white/90">Próximos Eventos</h2>
                </div>
                <button className="text-[10.5px] text-indigo-300/80 hover:text-indigo-200 transition-colors flex items-center gap-0.5">Ver todos <ChevronRight size={10} /></button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {events.map((event, i) => (
                  <Glass key={i} className="p-4" hover>
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${event.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                      <Calendar size={14} className="text-white" />
                    </div>
                    <h3 className="text-white/90 text-[11.5px] font-semibold leading-snug mb-1.5">{event.title}</h3>
                    <p className="text-white/35 text-[10px] mb-3">{event.date} · {event.time}</p>
                    <GlassButton className="w-full text-[10px] font-semibold py-1.5 rounded-lg" variant={event.status === "Inscrito" ? "success" : event.status === "Gratuito" ? "ghost" : "outline"}>
                      {event.status}
                    </GlassButton>
                  </Glass>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Back button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button onClick={() => navigate('/')} className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[11px] font-semibold shadow-lg shadow-indigo-500/30 hover:scale-105 transition-all border border-white/[0.15]">
          ← Voltar à versão atual
        </button>
      </div>
    </div>
  );
}
