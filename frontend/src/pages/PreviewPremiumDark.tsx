import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, BookOpen, Route, GraduationCap, CalendarDays,
  FolderDown, MapPin, BarChart3, Bell, Search, Play,
  ChevronRight, Zap, Menu,
  Download, Clock
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

/* ─── OPÇÃO A: Premium Dark (Linear/Vercel style) ─── */
export default function PreviewPremiumDark() {
  const navigate = useNavigate();
  const [sidebar, setSidebar] = useState(true);

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Sidebar */}
      {sidebar && (
        <aside className="w-[200px] shrink-0 h-screen sticky top-0 flex flex-col border-r border-white/[0.06] bg-[#09090b]">
          <div className="px-4 py-5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
              <Zap size={13} className="text-[#09090b]" />
            </div>
            <span className="text-[13px] font-semibold text-white/90 tracking-tight">Rede Inspire</span>
          </div>

          <nav className="flex-1 px-2 space-y-0.5">
            {nav.map((item, i) => (
              <button key={i} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] transition-all ${
                item.active
                  ? "bg-white/[0.08] text-white font-medium"
                  : "text-white/35 hover:text-white/60 hover:bg-white/[0.03]"
              }`}>
                <item.icon size={14} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="px-3 py-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-[9px] font-bold">D</div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-white/70 truncate">Danilo Santos</p>
                <p className="text-[9px] text-white/25">Admin</p>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="px-6 py-3.5 flex items-center gap-4 border-b border-white/[0.06] shrink-0">
          <button onClick={() => setSidebar(!sidebar)} className="text-white/30 hover:text-white/60"><Menu size={16} /></button>
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[12px] text-white/80 placeholder-white/20 outline-none focus:border-white/[0.15] transition" placeholder="Buscar..." />
            </div>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <button className="p-2 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.04] transition relative">
              <Bell size={15} /><span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-violet-400 rounded-full" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-8" style={{ scrollbarWidth: "none" }}>
          {/* Welcome */}
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-white">Bom dia, Danilo</h1>
            <p className="text-[13px] text-white/30 mt-1">Continue de onde parou ou explore novos conteúdos.</p>
          </div>

          {/* Featured */}
          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2 relative rounded-2xl overflow-hidden group cursor-pointer">
              <img src={yt(VIDEOS[0].id)} alt="" className="w-full aspect-[2/1] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[9px] font-semibold bg-violet-500 text-white px-2.5 py-1 rounded-full uppercase tracking-wider">Novo</span>
                  <span className="text-[9px] text-white/40 flex items-center gap-1"><Clock size={9} />{VIDEOS[0].duration}</span>
                </div>
                <h2 className="text-[18px] font-bold text-white leading-snug">{VIDEOS[0].title}</h2>
                <p className="text-[12px] text-white/40 mt-1.5">{VIDEOS[0].author}</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  <Play size={20} className="text-white ml-0.5" fill="white" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {VIDEOS.slice(1, 3).map(v => (
                <div key={v.id} className="relative rounded-2xl overflow-hidden group cursor-pointer flex-1">
                  <img src={yt(v.id)} alt="" className="w-full h-full object-cover absolute inset-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-[11px] font-semibold text-white line-clamp-2 leading-snug">{v.title}</p>
                    <p className="text-[9px] text-white/35 mt-1">{v.author} · {v.duration}</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                      <Play size={13} className="text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                  <div className="aspect-[16/10]" />
                </div>
              ))}
            </div>
          </div>

          {/* Continue assistindo */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold text-white/90">Continue assistindo</h2>
              <button className="text-[11px] text-white/30 hover:text-white/60 flex items-center gap-1">Ver todos <ChevronRight size={11} /></button>
            </div>
            <div className="grid grid-cols-3 gap-5">
              {VIDEOS.slice(3, 6).map(v => (
                <div key={v.id} className="group cursor-pointer">
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={yt(v.id)} alt="" className="w-full aspect-video object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                    <span className="absolute bottom-2 right-2 text-[9px] px-2 py-0.5 rounded-md bg-black/70 text-white/70 font-medium">{v.duration}</span>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/[0.06]">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${40 + Math.random() * 40}%` }} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                        <Play size={14} className="text-white ml-0.5" fill="white" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-[12px] font-medium text-white/70 mt-3 line-clamp-2 leading-snug group-hover:text-white/90 transition">{v.title}</h3>
                  <p className="text-[10px] text-white/25 mt-1">{v.author} · {v.views} views</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trilhas + Materiais */}
          <div className="grid grid-cols-2 gap-5 pb-6">
            {/* Trilhas */}
            <div>
              <h2 className="text-[14px] font-semibold text-white/90 mb-4">Suas trilhas</h2>
              <div className="space-y-3">
                {[
                  { title: "Liderança Eficaz", progress: 65, modules: "8/12" },
                  { title: "Gestão Financeira", progress: 30, modules: "3/10" },
                  { title: "Comunicação Visual", progress: 85, modules: "6/7" },
                ].map((t, i) => (
                  <div key={i} className="p-4 rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer group">
                    <div className="flex items-center justify-between mb-2.5">
                      <h3 className="text-[12px] font-medium text-white/70 group-hover:text-white/90 transition">{t.title}</h3>
                      <span className="text-[11px] font-semibold text-white/40">{t.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400" style={{ width: `${t.progress}%` }} />
                    </div>
                    <p className="text-[9px] text-white/20 mt-2">{t.modules} módulos concluídos</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Materiais */}
            <div>
              <h2 className="text-[14px] font-semibold text-white/90 mb-4">Top materiais</h2>
              <div className="space-y-1">
                {["Planejamento Estratégico 2026", "Manual do Líder de Célula", "Guia de Escola Bíblica", "Kit Comunicação Visual", "Roteiro de Culto Criativo", "Modelo Relatório Ministerial"].map((m, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition cursor-pointer group">
                    <span className={`text-[11px] font-bold w-4 ${i < 3 ? 'text-violet-400' : 'text-white/15'}`}>{i + 1}</span>
                    <FolderDown size={13} className="text-white/15 group-hover:text-white/30 transition" />
                    <span className="text-[11px] text-white/45 group-hover:text-white/70 flex-1 truncate transition">{m}</span>
                    <Download size={11} className="text-white/10 group-hover:text-white/30 transition" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="fixed bottom-4 right-4 z-50">
        <button onClick={() => navigate('/')} className="px-4 py-2 rounded-lg bg-white text-[#09090b] text-[11px] font-semibold hover:scale-105 transition-all shadow-lg">
          ← Voltar
        </button>
      </div>
    </div>
  );
}
