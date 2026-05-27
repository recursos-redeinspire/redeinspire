import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, BookOpen, Route, GraduationCap, CalendarDays,
  FolderDown, MapPin, BarChart3, Bell, Search, Play,
  Star, ChevronRight, Zap, Menu, Settings,
  Download, MessageSquare
} from "lucide-react";

const VIDEOS = [
  { id: '4CJQVNhVPv4', title: 'Como consolidar as bases ministeriais em sua igreja', author: 'Marcos Sanches', duration: '45 min', views: '2.4k' },
  { id: 'CHy2xDu-FFs', title: 'Saúde emocional da equipe ministerial', author: 'Carmen Rangel', duration: '38 min', views: '1.8k' },
  { id: 'PoyaOKZ4VPY', title: 'Gestão de equipes de alta performance', author: 'Matheus Moraes', duration: '52 min', views: '3.1k' },
  { id: 'cc4AyP6l6jA', title: 'Planejamento estratégico para igrejas', author: 'Marcelo Santos', duration: '41 min', views: '1.5k' },
  { id: 'g21WdMNY1pw', title: 'Cultura de Inovação na Igreja', author: 'Marcos Madaleno', duration: '47 min', views: '2.9k' },
  { id: 'zUc7YWPHgGM', title: 'Como a tecnologia pode otimizar seu trabalho', author: 'Talk Gestores', duration: '33 min', views: '1.2k' },
];

function yt(id: string) { return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`; }

const nav = [
  { icon: Home, label: "Início", active: true },
  { icon: BookOpen, label: "Catálogo" },
  { icon: Route, label: "Trilhas" },
  { icon: GraduationCap, label: "Mentorias" },
  { icon: CalendarDays, label: "Agenda" },
  { icon: FolderDown, label: "Materiais" },
  { icon: MapPin, label: "Mapa" },
  { icon: BarChart3, label: "Dashboard" },
];

/* ─── OPÇÃO B: Soft Light (Notion/Stripe style) ─── */
export default function PreviewSoftLight() {
  const navigate = useNavigate();
  const [sidebar, setSidebar] = useState(true);

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-gray-900 flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Sidebar */}
      {sidebar && (
        <aside className="w-[210px] shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r border-gray-100">
          <div className="px-4 py-5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <Zap size={14} className="text-white" />
            </div>
            <div>
              <span className="text-[13px] font-bold text-gray-900 tracking-tight">Rede Inspire</span>
              <p className="text-[9px] text-gray-400">Plataforma de Conteúdo</p>
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-0.5">
            {nav.map((item, i) => (
              <button key={i} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all ${
                item.active
                  ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
              }`}>
                <item.icon size={15} className={item.active ? "text-indigo-500" : ""} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="px-3 py-4 border-t border-gray-100">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-indigo-100">D</div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-gray-800 truncate">Danilo Santos</p>
                <p className="text-[9px] text-gray-400">Administrador</p>
              </div>
              <Settings size={13} className="text-gray-300" />
            </div>
          </div>
        </aside>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="px-6 py-3.5 flex items-center gap-4 bg-white border-b border-gray-100 shrink-0">
          <button onClick={() => setSidebar(!sidebar)} className="text-gray-300 hover:text-gray-600 transition"><Menu size={16} /></button>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
              <input className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[12px] text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50 transition" placeholder="Buscar conteúdos, materiais..." />
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button className="p-2 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition relative">
              <MessageSquare size={16} /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white" />
            </button>
            <button className="p-2 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition relative">
              <Bell size={16} /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-7 space-y-8" style={{ scrollbarWidth: "none" }}>
          {/* Welcome */}
          <div>
            <h1 className="text-[24px] font-extrabold text-gray-900 tracking-tight">Bom dia, Danilo 👋</h1>
            <p className="text-[13px] text-gray-400 mt-1 font-medium">Quinta-feira, 22 de maio de 2026</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Conteúdos assistidos", value: "47", icon: <Play size={16} />, color: "bg-indigo-50 text-indigo-500", ring: "ring-indigo-100" },
              { label: "Materiais baixados", value: "23", icon: <Download size={16} />, color: "bg-emerald-50 text-emerald-500", ring: "ring-emerald-100" },
              { label: "Trilhas ativas", value: "3", icon: <Route size={16} />, color: "bg-violet-50 text-violet-500", ring: "ring-violet-100" },
              { label: "Pontos acumulados", value: "1.250", icon: <Star size={16} />, color: "bg-amber-50 text-amber-500", ring: "ring-amber-100" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:shadow-gray-100 hover:-translate-y-0.5 transition-all duration-300 cursor-default">
                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center ring-4 ${s.ring} mb-3`}>{s.icon}</div>
                <p className="text-[22px] font-bold text-gray-900">{s.value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Featured */}
          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2 relative rounded-2xl overflow-hidden group cursor-pointer shadow-lg shadow-gray-200/50">
              <img src={yt(VIDEOS[0].id)} alt="" className="w-full aspect-[2/1] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="text-[9px] font-bold bg-indigo-500 text-white px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-indigo-300/30">Destaque</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h2 className="text-[17px] font-bold text-white leading-snug">{VIDEOS[0].title}</h2>
                <p className="text-[11px] text-white/50 mt-1.5">{VIDEOS[0].author} · {VIDEOS[0].duration}</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform">
                  <Play size={20} className="text-indigo-600 ml-0.5" fill="currentColor" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {VIDEOS.slice(1, 3).map(v => (
                <div key={v.id} className="relative rounded-2xl overflow-hidden group cursor-pointer flex-1 shadow-md shadow-gray-200/30">
                  <img src={yt(v.id)} alt="" className="w-full h-full object-cover absolute inset-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-[11px] font-semibold text-white line-clamp-2 leading-snug">{v.title}</p>
                    <p className="text-[9px] text-white/40 mt-1">{v.author}</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                      <Play size={13} className="text-indigo-600 ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                  <div className="aspect-[16/10]" />
                </div>
              ))}
            </div>
          </div>

          {/* Continue */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-bold text-gray-900">Continue assistindo</h2>
              <button className="text-[11px] text-indigo-500 hover:text-indigo-700 font-semibold flex items-center gap-0.5">Ver todos <ChevronRight size={12} /></button>
            </div>
            <div className="grid grid-cols-3 gap-5">
              {VIDEOS.slice(3, 6).map(v => (
                <div key={v.id} className="group cursor-pointer">
                  <div className="relative rounded-xl overflow-hidden shadow-sm shadow-gray-200/50 ring-1 ring-gray-100">
                    <img src={yt(v.id)} alt="" className="w-full aspect-video object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                    <span className="absolute bottom-2 right-2 text-[9px] px-2 py-0.5 rounded-md bg-black/60 text-white font-medium">{v.duration}</span>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${30 + Math.random() * 50}%` }} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                        <Play size={13} className="text-indigo-600 ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-[12px] font-semibold text-gray-800 mt-3 line-clamp-2 leading-snug">{v.title}</h3>
                  <p className="text-[10px] text-gray-400 mt-1">{v.author} · {v.views} views</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trilhas + Materiais */}
          <div className="grid grid-cols-2 gap-6 pb-6">
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 mb-4">Suas trilhas</h2>
              <div className="space-y-3">
                {[
                  { title: "Liderança Eficaz", progress: 65, color: "bg-indigo-500" },
                  { title: "Gestão Financeira", progress: 30, color: "bg-emerald-500" },
                  { title: "Comunicação Visual", progress: 85, color: "bg-violet-500" },
                ].map((t, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md hover:shadow-gray-100 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[12px] font-semibold text-gray-800">{t.title}</h3>
                      <span className="text-[11px] font-bold text-gray-500">{t.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-full ${t.color}`} style={{ width: `${t.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-[15px] font-bold text-gray-900 mb-4">Top materiais</h2>
              <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                {["Planejamento Estratégico 2026", "Manual do Líder de Célula", "Guia de Escola Bíblica", "Kit Comunicação Visual", "Roteiro de Culto Criativo"].map((m, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition cursor-pointer">
                    <span className={`text-[11px] font-bold w-4 ${i < 3 ? 'text-indigo-500' : 'text-gray-300'}`}>{i + 1}</span>
                    <span className="text-[11px] text-gray-700 flex-1 truncate">{m}</span>
                    <Download size={12} className="text-gray-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="fixed bottom-4 right-4 z-50">
        <button onClick={() => navigate('/')} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-[11px] font-semibold shadow-lg shadow-indigo-200 hover:scale-105 transition-all">
          ← Voltar
        </button>
      </div>
    </div>
  );
}
