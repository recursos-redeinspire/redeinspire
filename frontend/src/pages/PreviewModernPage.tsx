import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, BookOpen, Route, GraduationCap, CalendarDays,
  FolderDown, MapPin, BarChart3, Bell, Search, Play,
  Star, ChevronRight, Zap, Menu, Settings,
  Download, Calendar, Flame, Clock, Eye, Users,
  MessageSquare, X, ArrowUp, ArrowDown
} from "lucide-react";

const VIDEOS = [
  { id: '4CJQVNhVPv4', title: 'Como consolidar as bases ministeriais em sua igreja', author: 'Marcos Sanches', duration: '45 min', views: 2400 },
  { id: 'CHy2xDu-FFs', title: 'Saúde emocional da equipe ministerial', author: 'Carmen Rangel', duration: '38 min', views: 1800 },
  { id: 'PoyaOKZ4VPY', title: 'Gestão de equipes de alta performance', author: 'Matheus Moraes', duration: '52 min', views: 3100 },
  { id: 'cc4AyP6l6jA', title: 'Planejamento estratégico para igrejas e ministérios', author: 'Marcelo Santos', duration: '41 min', views: 1500 },
  { id: 'g21WdMNY1pw', title: 'Cultura de Inovação na Igreja', author: 'Marcos Madaleno', duration: '47 min', views: 2900 },
  { id: 'zUc7YWPHgGM', title: 'Como a tecnologia pode otimizar seu trabalho', author: 'Talk Gestores', duration: '33 min', views: 1200 },
  { id: 'RgJ3p91AR4A', title: 'Como tirar o peso operacional do seu pastor', author: 'Sandra Traudi', duration: '29 min', views: 980 },
  { id: 'TOa4-r120Fk', title: 'Assistência executiva e secretariado ministerial', author: 'Sandra Traldi', duration: '35 min', views: 756 },
];

function yt(id: string) { return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`; }

const navItems = [
  { icon: Home, label: "Início", active: true },
  { icon: BookOpen, label: "Catálogo" },
  { icon: Route, label: "Trilhas" },
  { icon: GraduationCap, label: "Mentorias" },
  { icon: CalendarDays, label: "Agenda" },
  { icon: FolderDown, label: "Materiais" },
  { icon: MapPin, label: "Mapa" },
  { icon: BarChart3, label: "Dashboard" },
];

export default function PreviewModernPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#0f1535] flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-[220px] shrink-0 flex flex-col h-screen sticky top-0" style={{ background: "linear-gradient(180deg, #1a1f4e 0%, #0f1535 100%)" }}>
          <div className="p-4 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap size={15} className="text-white" />
            </div>
            <div>
              <div className="text-[12px] font-bold text-white leading-tight">Rede Inspire</div>
              <div className="text-[9px] text-blue-300/50">Plataforma de Conteúdo</div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
            {navItems.map((item, i) => (
              <button key={i} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[11.5px] font-medium transition-all ${
                item.active
                  ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/10 text-white border border-blue-400/20"
                  : "text-blue-200/40 hover:text-blue-100/70 hover:bg-white/[0.03]"
              }`}>
                <item.icon size={15} className={item.active ? "text-blue-400" : ""} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-white/[0.05]">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.03] cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white">D</div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium text-white/80 truncate">Danilo Santos</div>
                <div className="text-[9px] text-white/30">Administrador</div>
              </div>
              <Settings size={13} className="text-white/20" />
            </div>
          </div>
        </aside>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="px-5 py-3 flex items-center gap-4 shrink-0 border-b border-white/[0.05]">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white/30 hover:text-white/70 transition">
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[12px] text-white/80 placeholder-white/20 outline-none focus:border-blue-400/30 transition" placeholder="Buscar conteúdos, materiais..." />
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button className="relative p-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.04] transition">
              <MessageSquare size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-400 rounded-full" />
            </button>
            <button className="relative p-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.04] transition">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-400 rounded-full" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5" style={{ scrollbarWidth: "none" }}>

          {/* Metric cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Visualizações", value: "12.8K", change: "+18%", up: true, icon: <Eye size={18} />, gradient: "from-blue-500 to-cyan-400", percent: 72 },
              { label: "Downloads", value: "3.2K", change: "+12%", up: true, icon: <Download size={18} />, gradient: "from-emerald-500 to-teal-400", percent: 58 },
              { label: "Usuários Ativos", value: "847", change: "+5%", up: true, icon: <Users size={18} />, gradient: "from-violet-500 to-purple-400", percent: 64 },
              { label: "Trilhas Concluídas", value: "234", change: "-3%", up: false, icon: <GraduationCap size={18} />, gradient: "from-pink-500 to-rose-400", percent: 45 },
            ].map((m, i) => (
              <div key={i} className="rounded-2xl p-4 border border-white/[0.06]" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white shadow-lg`}>
                    {m.icon}
                  </div>
                  <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${m.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {m.up ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                    {m.change}
                  </div>
                </div>
                <div className="text-[22px] font-bold text-white">{m.value}</div>
                <div className="text-[10px] text-white/35 mt-0.5">{m.label}</div>
                {/* Progress bar */}
                <div className="mt-3 w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${m.gradient}`} style={{ width: `${m.percent}%` }} />
                </div>
                <div className="text-[9px] text-white/25 mt-1 text-right">{m.percent}%</div>
              </div>
            ))}
          </div>

          {/* Featured + Trending */}
          <div className="grid grid-cols-3 gap-4">
            {/* Featured video */}
            <div className="col-span-2 rounded-2xl overflow-hidden border border-white/[0.06] group cursor-pointer relative">
              <img src={yt(VIDEOS[0].id)} alt="" className="w-full aspect-[2.2/1] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1535] via-[#0f1535]/40 to-transparent" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="text-[9px] font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg">Ao vivo</span>
                <span className="text-[9px] font-medium bg-white/10 backdrop-blur-sm text-white/70 px-2.5 py-1 rounded-full flex items-center gap-1"><Eye size={9} /> 127 assistindo</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-white font-bold text-[15px] leading-snug">{VIDEOS[0].title}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-white/50 text-[11px]">{VIDEOS[0].author}</span>
                  <span className="text-white/30 text-[10px] flex items-center gap-1"><Clock size={9} /> {VIDEOS[0].duration}</span>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/40">
                  <Play size={20} className="text-white ml-0.5" fill="white" />
                </div>
              </div>
            </div>

            {/* Trending list */}
            <div className="rounded-2xl border border-white/[0.06] p-4" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[12px] font-bold text-white flex items-center gap-2">
                  <Flame size={13} className="text-orange-400" /> Em Alta
                </h3>
                <button className="text-[9px] text-blue-300/60 hover:text-blue-200">Ver todos →</button>
              </div>
              <div className="space-y-1">
                {VIDEOS.slice(1, 6).map((v, i) => (
                  <div key={v.id} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.03] transition cursor-pointer group">
                    <span className={`text-[10px] font-bold w-3 ${i < 3 ? 'text-orange-400' : 'text-white/15'}`}>{i + 1}</span>
                    <img src={yt(v.id)} alt="" className="w-12 h-8 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-white/70 group-hover:text-white/90 line-clamp-1 transition">{v.title}</p>
                      <p className="text-[8px] text-white/25 mt-0.5">{v.views.toLocaleString()} views</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Continue + Materials + Events */}
          <div className="grid grid-cols-12 gap-4">
            {/* Continue assistindo */}
            <div className="col-span-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[12px] font-bold text-white flex items-center gap-2">
                  <Clock size={13} className="text-blue-400" /> Continue Assistindo
                </h3>
                <button className="text-[9px] text-blue-300/60 hover:text-blue-200">Ver todos →</button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {VIDEOS.slice(2, 6).map((v) => (
                  <div key={v.id} className="group cursor-pointer">
                    <div className="relative rounded-xl overflow-hidden border border-white/[0.06]">
                      <img src={yt(v.id)} alt="" className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition" />
                      <span className="absolute bottom-1.5 right-1.5 text-[8px] px-1.5 py-0.5 rounded bg-black/70 text-white/80 font-medium">{v.duration}</span>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-lg"><Play size={11} className="text-white ml-0.5" fill="white" /></div>
                      </div>
                      {/* Progress */}
                      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10">
                        <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full" style={{ width: `${30 + Math.random() * 40}%` }} />
                      </div>
                    </div>
                    <p className="text-[10px] font-medium text-white/60 mt-2 line-clamp-2 leading-snug group-hover:text-white/80 transition">{v.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Materiais */}
            <div className="col-span-4 rounded-2xl border border-white/[0.06] p-4" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[12px] font-bold text-white flex items-center gap-2">
                  <Star size={13} className="text-amber-400" /> Top Materiais
                </h3>
                <button className="text-[9px] text-blue-300/60 hover:text-blue-200">Ver todos →</button>
              </div>
              <div className="space-y-1">
                {["Planejamento Estratégico 2026", "Manual do Líder de Célula", "Guia de Escola Bíblica", "Kit Comunicação Visual", "Roteiro de Culto Criativo", "Modelo Relatório Ministerial"].map((m, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-2 px-2 rounded-xl hover:bg-white/[0.03] transition cursor-pointer group">
                    <span className={`text-[10px] font-bold w-3 ${i < 3 ? 'text-amber-400' : 'text-white/15'}`}>{i + 1}</span>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${i < 3 ? 'bg-amber-500/10' : 'bg-white/[0.03]'}`}>
                      <FolderDown size={11} className={i < 3 ? "text-amber-400" : "text-white/20"} />
                    </div>
                    <span className="text-[10px] text-white/50 group-hover:text-white/80 flex-1 truncate transition">{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trilhas + Eventos */}
          <div className="grid grid-cols-12 gap-4 pb-4">
            {/* Trilhas */}
            <div className="col-span-7 rounded-2xl border border-white/[0.06] p-4" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[12px] font-bold text-white flex items-center gap-2">
                  <Route size={13} className="text-violet-400" /> Trilhas em Andamento
                </h3>
                <button className="text-[9px] text-blue-300/60 hover:text-blue-200">Ver todas →</button>
              </div>
              <div className="space-y-3">
                {[
                  { title: "Liderança Eficaz", modules: "8/12 módulos", progress: 65, gradient: "from-blue-500 to-cyan-400" },
                  { title: "Gestão Financeira para Igrejas", modules: "3/10 módulos", progress: 30, gradient: "from-emerald-500 to-teal-400" },
                  { title: "Comunicação Visual Ministerial", modules: "6/7 módulos", progress: 85, gradient: "from-violet-500 to-purple-400" },
                ].map((trail, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition cursor-pointer group">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${trail.gradient} flex items-center justify-center text-white shadow-lg shrink-0`}>
                      <GraduationCap size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold text-white/80">{trail.title}</p>
                        <span className="text-[10px] font-bold text-white/50">{trail.progress}%</span>
                      </div>
                      <p className="text-[9px] text-white/25 mt-0.5">{trail.modules}</p>
                      <div className="mt-2 w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${trail.gradient}`} style={{ width: `${trail.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Eventos */}
            <div className="col-span-5 rounded-2xl border border-white/[0.06] p-4" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[12px] font-bold text-white flex items-center gap-2">
                  <Calendar size={13} className="text-sky-400" /> Próximos Eventos
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  { title: "Liderança em Tempos de Crise", date: "6 Jun", time: "19:00", type: "Webinar", gradient: "from-indigo-500 to-violet-600" },
                  { title: "Capacitação de Líderes de Célula", date: "15 Jun", time: "09:00", type: "Presencial", gradient: "from-emerald-500 to-teal-500" },
                  { title: "Congresso Anual Rede Inspire", date: "20 Jul", time: "08:00", type: "Evento", gradient: "from-rose-500 to-pink-600" },
                ].map((ev, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition cursor-pointer">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${ev.gradient} flex flex-col items-center justify-center shrink-0 shadow-lg`}>
                      <span className="text-[8px] text-white/70 font-medium leading-none">{ev.date.split(' ')[1]}</span>
                      <span className="text-[14px] text-white font-bold leading-tight">{ev.date.split(' ')[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-white/80 leading-snug">{ev.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-white/30">{ev.time}</span>
                        <span className="text-[8px] font-medium text-blue-300 bg-blue-400/10 px-1.5 py-0.5 rounded">{ev.type}</span>
                      </div>
                    </div>
                    <ChevronRight size={12} className="text-white/15" />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>

      {/* Back */}
      <div className="fixed bottom-4 right-4 z-50">
        <button onClick={() => navigate('/')} className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[11px] font-semibold shadow-lg shadow-blue-500/30 hover:scale-105 transition-all border border-white/[0.15]">
          ← Voltar à versão atual
        </button>
      </div>
    </div>
  );
}
