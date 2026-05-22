import { useState } from "react";
import {
  Home, BookOpen, FileText, Radio, Users, Award, Zap, Settings,
  Search, Bell, Play, Calendar, Lock, Menu, Layers, ChevronRight,
  TrendingUp, Star, Video,
} from "lucide-react";

/* ─── data ─── */
const navItems = [
  { icon: Home, label: "Início" },
  { icon: Layers, label: "Trilhas" },
  { icon: BookOpen, label: "Conteúdos" },
  { icon: FileText, label: "Materiais" },
  { icon: Radio, label: "Ao Vivo" },
  { icon: Users, label: "Membros" },
  { icon: Award, label: "Certificados" },
  { icon: Zap, label: "Gamificação" },
];

const topMaterials = [
  { num: 1, title: "Dê graças por tudo" },
  { num: 2, title: "10 Coisas que eu sei para a vida" },
  { num: 3, title: "Lembre - Não pare a sua caminhada" },
  { num: 4, title: "Abandone os Seus Sonhos" },
  { num: 5, title: "Aprenda a Jogar - a posição de Florentino", locked: true },
  { num: 6, title: "Que Eu Te Use", locked: true },
  { num: 7, title: "IESB", locked: true },
  { num: 8, title: "Intercessão de Jeremias", locked: true },
  { num: 9, title: "Por que Fazer o bem", locked: true },
  { num: 10, title: "Instrução de Amor", locked: true },
];

const topCurriculums = [
  { num: 1, title: "Webinar - Pr Yan - Recursos Financeiros x Prioridades na Igreja" },
  { num: 2, title: "Recursos Financeiros e Prioridades na Igreja - Curso Completo" },
  { num: 3, title: "Webinar Série Caminho - Como Encontrar os Seus Dons" },
  { num: 4, title: "Ondes Está nas Igrejas - Moisés Hilário" },
  { num: 5, title: "Como construir suas finanças tendo Deus como fundamento" },
];

const certifications = [
  { title: "Gestão nas Igrejas", img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=180&fit=crop&auto=format" },
  { title: "Webinar Financeiro", img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=180&fit=crop&auto=format" },
  { title: "Webinar Liderança", img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=300&h=180&fit=crop&auto=format" },
  { title: "Série Caminho", img: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=300&h=180&fit=crop&auto=format" },
];

const events = [
  { title: "Liderança em Tempos de Crise", date: "Sex, 6 de junho de 2026", time: "19:00", status: "Gratuito", gradient: "from-indigo-500 to-violet-600" },
  { title: "Capacitação de Recursos em Grupos", date: "Sáb, 15 de junho de 2026", time: "09:00", status: "Inscrito", gradient: "from-sky-500 to-cyan-500" },
  { title: "Congresso Annual Igreja Inspire", date: "Dom, 20 de julho de 2026", time: "08:00", status: "Registrar", gradient: "from-rose-500 to-pink-600" },
];

/* ─── primitives ─── */
function Glass({ children, className = "", hover = false }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <div
      className={`
        bg-white/[0.06] backdrop-blur-2xl border border-white/[0.11]
        rounded-2xl
        ${hover ? "hover:bg-white/[0.09] hover:border-white/[0.18] transition-all duration-200 cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

function GlassButton({ children, className = "", variant = "ghost" }: { children: React.ReactNode; className?: string; variant?: "ghost" | "primary" | "success" | "outline" }) {
  const variants = {
    ghost: "bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-white/70 hover:text-white",
    primary: "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 border border-white/[0.15] text-white shadow-lg shadow-indigo-500/25",
    success: "bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-emerald-300",
    outline: "bg-transparent hover:bg-white/[0.06] border border-white/[0.15] text-white/60 hover:text-white",
  };
  return (
    <button className={`transition-all duration-150 ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

/* ─── sidebar ─── */
function Sidebar({ collapsed, activeNav, setActiveNav }: { collapsed: boolean; activeNav: number; setActiveNav: (i: number) => void }) {
  return (
    <aside
      className={`
        flex flex-col h-full shrink-0 z-20
        bg-white/[0.045] backdrop-blur-3xl border-r border-white/[0.08]
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-[60px]" : "w-52"}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 py-5 border-b border-white/[0.07] ${collapsed ? "px-3 justify-center" : "px-4"}`}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
          <span className="text-white text-[11px] font-bold tracking-tight">RI</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-white/90 text-[11px] font-semibold leading-tight truncate">Rede Inspire</div>
            <div className="text-white/35 text-[9px] tracking-wide truncate">Igreja Inspire SP</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-px overflow-y-auto overflow-x-hidden">
        {navItems.map((item, i) => (
          <button
            key={i}
            onClick={() => setActiveNav(i)}
            title={collapsed ? item.label : undefined}
            className={`
              w-full flex items-center gap-3 rounded-xl text-left
              transition-all duration-150 group
              ${collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2"}
              ${activeNav === i
                ? "bg-white/[0.11] text-white border border-white/[0.15] shadow shadow-white/5"
                : "text-white/40 hover:text-white/75 hover:bg-white/[0.05]"}
            `}
          >
            <item.icon
              size={15}
              className={`shrink-0 transition-colors ${activeNav === i ? "text-indigo-300" : ""}`}
            />
            {!collapsed && (
              <span className="text-[11.5px] font-medium truncate">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Settings */}
      <div className="px-2 py-3 border-t border-white/[0.07]">
        <button
          className={`
            w-full flex items-center gap-3 rounded-xl
            text-white/35 hover:text-white/65 hover:bg-white/[0.05] transition-all duration-150
            ${collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2"}
          `}
        >
          <Settings size={15} className="shrink-0" />
          {!collapsed && <span className="text-[11.5px] font-medium">Configurações</span>}
        </button>
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2 mt-1 rounded-xl hover:bg-white/[0.05] cursor-pointer transition-colors group">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-[10px] font-semibold text-white shrink-0">
              R
            </div>
            <div className="min-w-0">
              <div className="text-white/75 text-[11px] font-medium truncate">Renata Silva</div>
              <div className="text-white/30 text-[9px] truncate">Administradora</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

/* ─── topbar ─── */
function Topbar({ onToggle }: { onToggle: () => void }) {
  return (
    <header className="flex items-center gap-3 px-5 py-3 bg-white/[0.03] backdrop-blur-2xl border-b border-white/[0.07] shrink-0">
      <button
        onClick={onToggle}
        className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-all"
      >
        <Menu size={16} />
      </button>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white/[0.06] border border-white/[0.09] rounded-xl px-3 py-1.5 flex-1 max-w-sm">
        <Search size={13} className="text-white/35 shrink-0" />
        <input
          className="bg-transparent text-[13px] text-white/80 placeholder-white/25 outline-none flex-1 min-w-0"
          placeholder="Buscar conteúdo, materiais..."
        />
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        <button className="relative p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-all">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-violet-400 rounded-full ring-1 ring-[#060b1a]" />
        </button>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-[11px] font-semibold text-white shadow-md shadow-indigo-500/30 cursor-pointer">
          R
        </div>
      </div>
    </header>
  );
}

/* ─── main app ─── */
export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState(0);

  return (
    <div className="min-h-screen bg-[#060b1a] text-white overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── ambient gradient orbs ── */}
      <div className="fixed inset-0 pointer-events-none select-none">
        <div className="absolute top-[-8%] left-[18%] w-[520px] h-[520px] bg-indigo-600/22 rounded-full blur-[130px]" />
        <div className="absolute top-[25%] right-[5%] w-[420px] h-[420px] bg-violet-600/18 rounded-full blur-[110px]" />
        <div className="absolute bottom-[5%] left-[5%] w-[380px] h-[380px] bg-blue-600/14 rounded-full blur-[110px]" />
        <div className="absolute top-[55%] left-[45%] w-[320px] h-[320px] bg-purple-800/13 rounded-full blur-[90px]" />
        {/* subtle noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "200px 200px" }} />
      </div>

      {/* ── layout shell ── */}
      <div className="relative flex h-screen">
        <Sidebar collapsed={collapsed} activeNav={activeNav} setActiveNav={setActiveNav} />

        <div className="flex-1 flex flex-col min-w-0">
          <Topbar onToggle={() => setCollapsed(c => !c)} />

          {/* ── scrollable content ── */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 space-y-5" style={{ scrollbarWidth: "none" }}>

            {/* Welcome */}
            <div>
              <h1 className="text-[17px] font-semibold text-white/90">Bem-vindo, Renata!</h1>
              <p className="text-[12px] text-white/35 mt-0.5">Quinta-feira, 22 de maio de 2026</p>
            </div>

            {/* ── Hero grid ── */}
            <div className="grid grid-cols-3 gap-3">

              {/* Featured video */}
              <Glass className="col-span-2 overflow-hidden group" hover>
                <div className="relative h-52">
                  <img
                    src="https://images.unsplash.com/photo-1438232992991-995b671e3bfd?w=800&h=420&fit=crop&auto=format"
                    alt="Pr Yan - Recursos Financeiros"
                    className="w-full h-full object-cover"
                  />
                  {/* glass tint overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  {/* play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-200 shadow-xl">
                      <Play size={16} className="text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                  {/* info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="text-[9px] font-bold bg-amber-400 text-black px-2 py-0.5 rounded-full uppercase tracking-wider">Webinar</span>
                    <h3 className="text-white font-semibold text-[13px] mt-1.5 leading-snug">
                      Pr Yan — Recursos Financeiros x Prioridades na Igreja
                    </h3>
                    <p className="text-white/45 text-[10px] mt-0.5">Igreja Inspire São Paulo</p>
                  </div>
                </div>
              </Glass>

              {/* Secondary video */}
              <Glass className="overflow-hidden group" hover>
                <div className="relative h-52">
                  <img
                    src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&h=300&fit=crop&auto=format"
                    alt="Webinar Série Caminho"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-200">
                      <Play size={13} className="text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <span className="text-[9px] font-bold bg-indigo-400/90 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Webinar</span>
                    <h3 className="text-white text-[11px] font-semibold mt-1.5 leading-snug">
                      Marcos Mattos — Como Encontrar os Seus Dons
                    </h3>
                  </div>
                </div>
              </Glass>
            </div>

            {/* ── Highlight banner ── */}
            <Glass className="p-4 flex items-center gap-5" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.10) 100%)", borderColor: "rgba(99,102,241,0.25)" }}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
                <TrendingUp size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[9.5px] font-semibold text-indigo-300 uppercase tracking-[0.12em] mb-0.5">Em destaque</div>
                <h3 className="text-white font-semibold text-[13px] truncate">Liderança em Tempos de Crise</h3>
                <p className="text-white/40 text-[10.5px] mt-0.5">Diác. João Dinis · 20 de maio de 2026</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-3xl font-bold text-white tabular-nums leading-none">200</div>
                <div className="text-white/35 text-[10px] mt-0.5">assistindo</div>
              </div>
              <GlassButton variant="primary" className="shrink-0 text-[11px] font-semibold px-4 py-2 rounded-xl">
                Assistir agora
              </GlassButton>
            </Glass>

            {/* ── Top 10 lists ── */}
            <div className="grid grid-cols-2 gap-3">

              {/* Top Materiais */}
              <Glass className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Star size={13} className="text-amber-400" />
                    <h2 className="text-[12.5px] font-semibold text-white/90">Top 10 Materiais</h2>
                  </div>
                  <button className="text-[10.5px] text-indigo-300/80 hover:text-indigo-200 transition-colors flex items-center gap-0.5">
                    Ver todos <ChevronRight size={10} />
                  </button>
                </div>
                <div className="space-y-0.5">
                  {topMaterials.map((item) => (
                    <div
                      key={item.num}
                      className="flex items-center gap-3 py-1.5 px-2 rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer group"
                    >
                      <span className="text-[11px] font-bold text-white/20 w-4 shrink-0 tabular-nums">{item.num}</span>
                      <span className={`text-[11.5px] flex-1 truncate transition-colors ${item.locked ? "text-white/25" : "text-white/62 group-hover:text-white/90"}`}>
                        {item.title}
                      </span>
                      {item.locked && <Lock size={9} className="text-white/20 shrink-0" />}
                    </div>
                  ))}
                </div>
              </Glass>

              {/* Top Currículos */}
              <Glass className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Video size={13} className="text-indigo-300" />
                    <h2 className="text-[12.5px] font-semibold text-white/90">Top 10 Currículos</h2>
                  </div>
                  <button className="text-[10.5px] text-indigo-300/80 hover:text-indigo-200 transition-colors flex items-center gap-0.5">
                    Ver todos <ChevronRight size={10} />
                  </button>
                </div>
                <div className="space-y-0.5">
                  {topCurriculums.map((item) => (
                    <div
                      key={item.num}
                      className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer group"
                    >
                      <span className="text-[11px] font-bold text-white/20 w-4 shrink-0 tabular-nums">{item.num}</span>
                      <span className="text-[11.5px] text-white/62 group-hover:text-white/90 transition-colors leading-snug line-clamp-2">
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              </Glass>
            </div>

            {/* ── Certifications ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Award size={13} className="text-amber-300" />
                  <h2 className="text-[12.5px] font-semibold text-white/90">Certificações Recentes</h2>
                </div>
                <button className="text-[10.5px] text-indigo-300/80 hover:text-indigo-200 transition-colors flex items-center gap-0.5">
                  Ver todas <ChevronRight size={10} />
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {certifications.map((cert, i) => (
                  <Glass key={i} className="shrink-0 w-48 overflow-hidden group" hover>
                    <div className="relative h-24">
                      <img
                        src={cert.img}
                        alt={cert.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <div className="p-2.5">
                      <p className="text-[10.5px] text-white/75 font-medium leading-snug">{cert.title}</p>
                    </div>
                  </Glass>
                ))}
              </div>
            </div>

            {/* ── Events ── */}
            <div className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-sky-300" />
                  <h2 className="text-[12.5px] font-semibold text-white/90">Próximos Eventos</h2>
                </div>
                <button className="text-[10.5px] text-indigo-300/80 hover:text-indigo-200 transition-colors flex items-center gap-0.5">
                  Ver todos <ChevronRight size={10} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {events.map((event, i) => (
                  <Glass key={i} className="p-4 hover:bg-white/[0.09] hover:border-white/[0.17] transition-all duration-200 cursor-pointer group" hover>
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${event.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                      <Calendar size={14} className="text-white" />
                    </div>
                    <h3 className="text-white/90 text-[11.5px] font-semibold leading-snug mb-1.5">{event.title}</h3>
                    <p className="text-white/35 text-[10px] mb-3">{event.date} · {event.time}</p>
                    <GlassButton
                      className="w-full text-[10px] font-semibold py-1.5 rounded-lg"
                      variant={event.status === "Inscrito" ? "success" : event.status === "Gratuito" ? "ghost" : "outline"}
                    >
                      {event.status}
                    </GlassButton>
                  </Glass>
                ))}
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
