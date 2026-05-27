import { useNavigate } from "react-router-dom";
import {
  Home, BookOpen, Route, GraduationCap, CalendarDays,
  FolderDown, MapPin, BarChart3, Play, ChevronRight,
  Zap, Clock, Users, Star,
  Search, LogOut, HelpCircle, Lightbulb, Flame
} from "lucide-react";

const VIDEOS = [
  { id: '4CJQVNhVPv4', title: 'Como consolidar as bases ministeriais em sua igreja', author: 'Marcos Sanches', duration: '45 min', views: '2.4k' },
  { id: 'CHy2xDu-FFs', title: 'Saúde emocional da equipe ministerial', author: 'Carmen Rangel', duration: '38 min', views: '1.8k' },
  { id: 'PoyaOKZ4VPY', title: 'Gestão de equipes de alta performance', author: 'Matheus Moraes', duration: '52 min', views: '3.1k' },
  { id: 'cc4AyP6l6jA', title: 'Planejamento estratégico para igrejas e ministérios', author: 'Marcelo Santos', duration: '41 min', views: '1.5k' },
  { id: 'g21WdMNY1pw', title: 'Cultura de Inovação na Igreja', author: 'Marcos Madaleno', duration: '47 min', views: '2.9k' },
  { id: 'zUc7YWPHgGM', title: 'Como a tecnologia pode otimizar seu trabalho', author: 'Talk Gestores', duration: '33 min', views: '1.2k' },
  { id: 'RgJ3p91AR4A', title: 'Como tirar o peso operacional do seu pastor', author: 'Sandra Traudi', duration: '29 min', views: '980' },
  { id: 'TOa4-r120Fk', title: 'Assistência executiva e secretariado ministerial', author: 'Sandra Traldi', duration: '35 min', views: '756' },
];

function yt(id: string) { return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`; }

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

export default function PreviewNewUI() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Sidebar */}
      <aside className="w-[230px] shrink-0 h-screen sticky top-0 flex flex-col bg-white rounded-r-3xl shadow-[4px_0_24px_rgba(0,0,0,0.03)] z-10">
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
              <Zap size={15} className="text-white" />
            </div>
            <span className="text-[15px] font-bold text-gray-900 tracking-tight">REDE INSPIRE</span>
          </div>
        </div>

        <div className="px-5 mb-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.1em]">Workspace</p>
          <div className="mt-1.5 flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-[12px] font-medium text-gray-700">Igreja Inspire SP</span>
            <ChevronRight size={12} className="text-gray-300 rotate-90" />
          </div>
        </div>

        <nav className="flex-1 px-3 mt-1 space-y-0.5">
          {nav.map((item, i) => (
            <button key={i} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium transition-all ${
              item.active
                ? "bg-green-50 text-green-700"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}>
              <item.icon size={17} className={item.active ? "text-green-600" : "text-gray-400"} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-3 pb-5 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition">
            <HelpCircle size={17} className="text-gray-400" />
            <span>Central de Ajuda</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition">
            <LogOut size={17} className="text-gray-400" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 h-screen overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <div className="px-8 py-7">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Olá, Danilo! 👋</h1>
              <p className="text-[14px] text-gray-400 mt-1">Escolha o que assistir ou explore novos conteúdos.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input className="pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-[13px] text-gray-800 placeholder-gray-400 outline-none focus:border-green-300 focus:ring-2 focus:ring-green-50 transition w-[220px]" placeholder="Buscar..." />
              </div>
            </div>
          </div>

          {/* HERO — Video destaque */}
          <div className="relative rounded-3xl overflow-hidden mb-7 group cursor-pointer shadow-lg shadow-green-900/5">
            <img src={yt(VIDEOS[0].id)} alt="" className="w-full aspect-[2.6/1] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-green-600/15 to-transparent" />
            <div className="absolute top-5 left-6">
              <span className="text-[10px] font-bold bg-green-500 text-white px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-green-500/30">🔥 Conteúdo em Destaque</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h2 className="text-[22px] font-bold text-white leading-snug max-w-[650px]">{VIDEOS[0].title}</h2>
              <p className="text-[13px] text-white/60 mt-2">{VIDEOS[0].author} · {VIDEOS[0].duration} · Rede Inspire</p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-white/90 shadow-2xl flex items-center justify-center hover:scale-110 transition-transform">
                <Play size={26} className="text-green-600 ml-1" fill="currentColor" />
              </div>
            </div>
          </div>

          {/* Sugestões rápidas (thumbnails menores) */}
          <div className="mb-7">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-bold text-gray-900">Sugestões para você</h2>
              <button className="text-[12px] text-green-600 hover:text-green-700 font-semibold flex items-center gap-1">Ver catálogo <ChevronRight size={13} /></button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {VIDEOS.slice(1, 5).map(v => (
                <div key={v.id} className="group cursor-pointer">
                  <div className="relative rounded-xl overflow-hidden shadow-sm">
                    <img src={yt(v.id)} alt="" className="w-full aspect-video object-cover group-hover:scale-[1.03] transition-transform duration-400" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                    <span className="absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded-md bg-black/60 text-white font-medium">{v.duration}</span>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <div className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
                        <Play size={14} className="text-green-600 ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-[13px] font-semibold text-gray-800 mt-2.5 line-clamp-2 leading-snug">{v.title}</h3>
                  <p className="text-[11px] text-gray-400 mt-1">{v.author} · {v.views} views</p>
                </div>
              ))}
            </div>
          </div>

          {/* Grid: Trilhas + Materiais + Eventos */}
          <div className="grid grid-cols-3 gap-5 mb-7">
            {/* Trilhas */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-bold text-gray-900 flex items-center gap-2">
                  <Route size={16} className="text-green-600" /> Suas Trilhas
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  { title: "Liderança Eficaz", modules: "8/12 módulos", progress: 65, color: "bg-green-500" },
                  { title: "Gestão Financeira", modules: "3/10 módulos", progress: 30, color: "bg-amber-500" },
                  { title: "Comunicação Visual", modules: "6/7 módulos", progress: 85, color: "bg-indigo-500" },
                ].map((t, i) => (
                  <div key={i} className="p-3 rounded-xl hover:bg-gray-50 transition cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[12px] font-semibold text-gray-800">{t.title}</p>
                      <span className="text-[11px] font-bold text-gray-500">{t.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-full ${t.color}`} style={{ width: `${t.progress}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5">{t.modules}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Materiais */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-bold text-gray-900 flex items-center gap-2">
                  <Star size={16} className="text-amber-500" /> Top Materiais
                </h3>
              </div>
              <div className="space-y-1">
                {["Planejamento Estratégico 2026", "Manual do Líder de Célula", "Guia de Escola Bíblica", "Kit Comunicação Visual", "Roteiro de Culto Criativo", "Modelo Relatório Ministerial"].map((m, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                    <span className={`text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center ${i < 3 ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>{i + 1}</span>
                    <span className="text-[12px] text-gray-700 flex-1 truncate">{m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Eventos */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-bold text-gray-900 flex items-center gap-2">
                  <CalendarDays size={16} className="text-blue-500" /> Próximos Eventos
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  { title: "Liderança em Tempos de Crise", date: "6 Jun · 19:00", type: "Webinar" },
                  { title: "Capacitação de Líderes", date: "15 Jun · 09:00", type: "Presencial" },
                  { title: "Congresso Anual Rede Inspire", date: "20 Jul · 08:00", type: "Evento" },
                ].map((ev, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                      <CalendarDays size={16} className="text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-gray-800">{ev.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{ev.date}</p>
                    </div>
                    <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase">{ev.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Em alta + Mentorias */}
          <div className="grid grid-cols-12 gap-5 mb-7">
            {/* Em alta */}
            <div className="col-span-8 bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-bold text-gray-900 flex items-center gap-2">
                  <Flame size={16} className="text-orange-500" /> Em Alta na Plataforma
                </h3>
                <button className="text-[11px] text-green-600 font-semibold">Ver todos →</button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {VIDEOS.slice(4, 7).map(v => (
                  <div key={v.id} className="group cursor-pointer">
                    <div className="relative rounded-xl overflow-hidden">
                      <img src={yt(v.id)} alt="" className="w-full aspect-video object-cover group-hover:scale-[1.03] transition-transform duration-400" />
                      <span className="absolute bottom-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-white font-medium">{v.duration}</span>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center">
                          <Play size={12} className="text-green-600 ml-0.5" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    <p className="text-[12px] font-medium text-gray-800 mt-2 line-clamp-2 leading-snug">{v.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{v.author}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mentorias */}
            <div className="col-span-4 bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-bold text-gray-900 flex items-center gap-2">
                  <Users size={16} className="text-violet-500" /> Mentorias
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  { title: "Mentoria de Liderança", mentor: "Pr. Carlos Silva", date: "30 Mai · 10:00", status: "Agendada" },
                  { title: "Gestão de Equipes", mentor: "Matheus Moraes", date: "5 Jun · 14:00", status: "Disponível" },
                ].map((m, i) => (
                  <div key={i} className="p-3 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition cursor-pointer">
                    <p className="text-[12px] font-semibold text-gray-800">{m.title}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{m.mentor}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock size={10} />{m.date}</span>
                      <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{m.status}</span>
                    </div>
                  </div>
                ))}
                <button className="w-full py-2.5 rounded-xl border border-gray-200 text-[12px] font-medium text-gray-500 hover:bg-gray-50 transition">
                  Ver todas as mentorias
                </button>
              </div>
            </div>
          </div>

          {/* Dica / Onboarding */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-6 flex items-center gap-5 mb-6">
            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center shrink-0 shadow-md shadow-green-200">
              <Lightbulb size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-[14px] font-bold text-gray-900">Novo por aqui?</h3>
              <p className="text-[12px] text-gray-600 mt-0.5">Explore nossos treinamentos e comece sua jornada de capacitação ministerial.</p>
            </div>
            <button className="px-5 py-2.5 rounded-xl bg-green-600 text-white text-[12px] font-semibold hover:bg-green-700 transition shadow-sm">
              Começar agora
            </button>
          </div>

        </div>
      </div>

      {/* Back */}
      <div className="fixed bottom-5 right-5 z-50">
        <button onClick={() => navigate('/')} className="px-4 py-2.5 rounded-xl bg-green-600 text-white text-[12px] font-semibold shadow-lg shadow-green-600/20 hover:bg-green-700 hover:scale-105 transition-all">
          ← Voltar à versão atual
        </button>
      </div>
    </div>
  );
}
