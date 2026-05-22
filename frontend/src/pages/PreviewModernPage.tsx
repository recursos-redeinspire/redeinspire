import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, BookOpen, Route, GraduationCap, CalendarDays,
  FolderDown, MapPin, BarChart3, Bell, Search, Play,
  TrendingUp, Star, ChevronRight, Zap, Menu, Settings,
  Download, Calendar, ArrowUpRight, Flame, Clock,
  MessageSquare, X
} from "lucide-react";

const VIDEOS = [
  { id: '4CJQVNhVPv4', title: 'Como consolidar as bases ministeriais em sua igreja', author: 'Marcos Sanches', duration: '45 min', tag: 'Liderança' },
  { id: 'CHy2xDu-FFs', title: 'Saúde emocional da equipe ministerial', author: 'Carmen Rangel', duration: '38 min', tag: 'Saúde' },
  { id: 'PoyaOKZ4VPY', title: 'Gestão de equipes de alta performance', author: 'Matheus Moraes', duration: '52 min', tag: 'Gestão' },
  { id: 'cc4AyP6l6jA', title: 'Planejamento estratégico para igrejas e ministérios', author: 'Marcelo Santos', duration: '41 min', tag: 'Planejamento' },
  { id: 'g21WdMNY1pw', title: 'Cultura de Inovação na Igreja', author: 'Marcos Madaleno', duration: '47 min', tag: 'Inovação' },
  { id: 'zUc7YWPHgGM', title: 'Como a tecnologia pode otimizar seu trabalho', author: 'Talk Gestores', duration: '33 min', tag: 'Tecnologia' },
  { id: 'RgJ3p91AR4A', title: 'Como tirar o peso operacional do seu pastor', author: 'Sandra Traudi', duration: '29 min', tag: 'Operacional' },
  { id: 'TOa4-r120Fk', title: 'Assistência executiva e secretariado ministerial', author: 'Sandra Traldi', duration: '35 min', tag: 'Secretariado' },
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
    <div className="min-h-screen bg-[#fafbfc] flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-[220px] shrink-0 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
          <div className="p-4 flex items-center gap-2.5 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <div>
              <div className="text-[12px] font-bold text-gray-900 leading-tight">Rede Inspire</div>
              <div className="text-[9px] text-gray-400">Igreja Inspire SP</div>
            </div>
          </div>

          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            {navItems.map((item, i) => (
              <button key={i} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
                item.active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}>
                <item.icon size={15} className={item.active ? "text-indigo-500" : ""} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white">D</div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium text-gray-800 truncate">Danilo Santos</div>
                <div className="text-[9px] text-gray-400">Administrador</div>
              </div>
              <Settings size={13} className="text-gray-300" />
            </div>
          </div>
        </aside>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-4 shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-gray-700">
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-100 text-[12px] text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-200 focus:ring-2 focus:ring-indigo-50 transition" placeholder="Buscar conteúdos, materiais..." />
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button className="relative p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition">
              <MessageSquare size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
            </button>
            <button className="relative p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Welcome + Stats */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-[20px] font-bold text-gray-900">Bom dia, Danilo! 👋</h1>
              <p className="text-[12px] text-gray-400 mt-0.5">Quinta-feira, 22 de maio de 2026</p>
            </div>
            <div className="flex gap-5">
              {[
                { label: "Assistidos", value: "47", icon: <Play size={12} />, color: "text-indigo-500 bg-indigo-50" },
                { label: "Downloads", value: "23", icon: <Download size={12} />, color: "text-emerald-500 bg-emerald-50" },
                { label: "Trilhas", value: "3/5", icon: <Route size={12} />, color: "text-violet-500 bg-violet-50" },
                { label: "Pontos", value: "1.250", icon: <Star size={12} />, color: "text-amber-500 bg-amber-50" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mx-auto mb-1`}>{s.icon}</div>
                  <div className="text-[14px] font-bold text-gray-900">{s.value}</div>
                  <div className="text-[9px] text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero featured */}
          <div className="grid grid-cols-5 gap-4">
            {/* Main video */}
            <div className="col-span-3 relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm">
              <img src={yt(VIDEOS[0].id)} alt="" className="w-full aspect-[16/9] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute top-3 left-3">
                <span className="text-[9px] font-bold bg-indigo-500 text-white px-2.5 py-1 rounded-full uppercase tracking-wider">Destaque da semana</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-white font-bold text-[15px] leading-snug">{VIDEOS[0].title}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-white/60 text-[11px]">{VIDEOS[0].author}</span>
                  <span className="text-white/40 text-[10px] flex items-center gap-1"><Clock size={10} /> {VIDEOS[0].duration}</span>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <div className="w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center">
                  <Play size={20} className="text-indigo-600 ml-0.5" fill="currentColor" />
                </div>
              </div>
            </div>

            {/* Side cards */}
            <div className="col-span-2 flex flex-col gap-4">
              {VIDEOS.slice(1, 3).map((v) => (
                <div key={v.id} className="relative rounded-xl overflow-hidden group cursor-pointer flex-1 shadow-sm">
                  <img src={yt(v.id)} alt="" className="w-full h-full object-cover absolute inset-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/5" />
                  <div className="absolute bottom-0 left-0 right-0 p-3.5">
                    <span className="text-[8px] font-bold bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full uppercase">{v.tag}</span>
                    <p className="text-white font-semibold text-[11px] mt-1.5 line-clamp-2 leading-snug">{v.title}</p>
                    <p className="text-white/50 text-[9px] mt-0.5">{v.author}</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                      <Play size={14} className="text-indigo-600 ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                  <div className="aspect-[16/9]" />
                </div>
              ))}
            </div>
          </div>

          {/* Continue assistindo */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-bold text-gray-900 flex items-center gap-2">
                <Clock size={14} className="text-gray-400" /> Continue assistindo
              </h2>
              <button className="text-[10px] text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-0.5">Ver todos <ChevronRight size={10} /></button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {VIDEOS.slice(3, 7).map((v) => (
                <div key={v.id} className="group cursor-pointer">
                  <div className="relative rounded-xl overflow-hidden shadow-sm">
                    <img src={yt(v.id)} alt="" className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                    <span className="absolute bottom-1.5 right-1.5 text-[8px] px-1.5 py-0.5 rounded bg-black/70 text-white font-medium">{v.duration}</span>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center"><Play size={11} className="text-indigo-600 ml-0.5" fill="currentColor" /></div>
                    </div>
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${30 + Math.random() * 50}%` }} />
                    </div>
                  </div>
                  <p className="text-[10px] font-medium text-gray-800 mt-2 line-clamp-2 leading-snug">{v.title}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{v.author}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Two columns: Trilhas + Eventos */}
          <div className="grid grid-cols-5 gap-5">
            {/* Trilhas */}
            <div className="col-span-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[13px] font-bold text-gray-900 flex items-center gap-2">
                  <Route size={14} className="text-violet-500" /> Suas trilhas
                </h2>
                <button className="text-[10px] text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-0.5">Ver todas <ChevronRight size={10} /></button>
              </div>
              <div className="space-y-2.5">
                {[
                  { title: "Liderança Eficaz", modules: "8/12 módulos", progress: 65, color: "bg-indigo-500" },
                  { title: "Gestão Financeira para Igrejas", modules: "3/10 módulos", progress: 30, color: "bg-emerald-500" },
                  { title: "Comunicação Visual Ministerial", modules: "6/7 módulos", progress: 85, color: "bg-violet-500" },
                ].map((trail, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm hover:border-gray-200 transition-all cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg ${trail.color} flex items-center justify-center`}>
                          <GraduationCap size={14} className="text-white" />
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold text-gray-900">{trail.title}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{trail.modules}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-gray-700">{trail.progress}%</span>
                        <ArrowUpRight size={14} className="text-gray-300 group-hover:text-indigo-500 transition" />
                      </div>
                    </div>
                    <div className="mt-3 w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-full ${trail.color} transition-all`} style={{ width: `${trail.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Eventos */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[13px] font-bold text-gray-900 flex items-center gap-2">
                  <Calendar size={14} className="text-sky-500" /> Próximos eventos
                </h2>
              </div>
              <div className="space-y-2.5">
                {[
                  { title: "Liderança em Tempos de Crise", date: "6 Jun", time: "19:00", type: "Webinar", color: "bg-indigo-500" },
                  { title: "Capacitação de Líderes", date: "15 Jun", time: "09:00", type: "Presencial", color: "bg-emerald-500" },
                  { title: "Congresso Anual", date: "20 Jul", time: "08:00", type: "Evento", color: "bg-rose-500" },
                ].map((ev, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-3.5 hover:shadow-sm hover:border-gray-200 transition-all cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${ev.color} flex flex-col items-center justify-center shrink-0`}>
                        <span className="text-[9px] text-white/70 font-medium leading-none">{ev.date.split(' ')[1]}</span>
                        <span className="text-[13px] text-white font-bold leading-tight">{ev.date.split(' ')[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-gray-900 leading-snug">{ev.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-gray-400">{ev.time}</span>
                          <span className="text-[8px] font-medium text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">{ev.type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top rankings */}
          <div className="grid grid-cols-2 gap-5">
            {/* Top Materiais */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[12px] font-bold text-gray-900 flex items-center gap-2">
                  <Flame size={13} className="text-orange-400" /> Top Materiais
                </h2>
                <button className="text-[9px] text-indigo-500 font-medium">Ver todos →</button>
              </div>
              <div className="space-y-0.5">
                {["Planejamento Estratégico 2026", "Manual do Líder de Célula", "Guia de Escola Bíblica", "Kit Comunicação Visual", "Roteiro de Culto Criativo"].map((m, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                    <span className={`text-[10px] font-bold w-4 text-center ${i < 3 ? 'text-orange-400' : 'text-gray-300'}`}>{i + 1}</span>
                    <FolderDown size={12} className="text-gray-300" />
                    <span className="text-[11px] text-gray-700 flex-1 truncate">{m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Conteúdos */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[12px] font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp size={13} className="text-indigo-400" /> Top Conteúdos
                </h2>
                <button className="text-[9px] text-indigo-500 font-medium">Ver todos →</button>
              </div>
              <div className="space-y-0.5">
                {VIDEOS.slice(0, 5).map((v, i) => (
                  <div key={v.id} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                    <span className={`text-[10px] font-bold w-4 text-center ${i < 3 ? 'text-indigo-400' : 'text-gray-300'}`}>{i + 1}</span>
                    <img src={yt(v.id)} alt="" className="w-9 h-6 rounded object-cover" />
                    <span className="text-[11px] text-gray-700 flex-1 truncate">{v.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>

      {/* Back */}
      <div className="fixed bottom-4 right-4 z-50">
        <button onClick={() => navigate('/')} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-[11px] font-semibold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-105 transition-all">
          ← Voltar à versão atual
        </button>
      </div>
    </div>
  );
}
