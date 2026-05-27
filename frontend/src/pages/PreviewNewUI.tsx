import { useNavigate } from "react-router-dom";
import {
  Home, BookOpen, Route, GraduationCap, CalendarDays,
  FolderDown, MapPin, BarChart3, Play, ChevronRight,
  Zap, Clock, Eye, Download, Users,
  Search, LogOut, HelpCircle
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

export default function PreviewNewUI() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Sidebar */}
      <aside className="w-[220px] shrink-0 h-screen sticky top-0 flex flex-col bg-white rounded-r-3xl shadow-[4px_0_24px_rgba(0,0,0,0.03)] z-10">
        {/* Logo */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
              <Zap size={14} className="text-white" />
            </div>
            <span className="text-[14px] font-bold text-gray-900 tracking-tight">REDE INSPIRE</span>
          </div>
        </div>

        {/* Workspace label */}
        <div className="px-5 mb-2">
          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.1em]">Workspace</p>
          <div className="mt-1.5 flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-[11px] font-medium text-gray-700">Igreja Inspire SP</span>
            <ChevronRight size={12} className="text-gray-300 rotate-90" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 mt-2 space-y-0.5">
          {nav.map((item, i) => (
            <button key={i} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all ${
              item.active
                ? "bg-green-50 text-green-700"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}>
              <item.icon size={16} className={item.active ? "text-green-600" : "text-gray-400"} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-5 space-y-1">
          <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition">
            <HelpCircle size={16} className="text-gray-400" />
            <span>Central de Ajuda</span>
          </button>
          <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition">
            <LogOut size={16} className="text-gray-400" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 h-screen overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <div className="max-w-[1100px] mx-auto px-8 py-7">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">Início</h1>
              <p className="text-[13px] text-gray-400 mt-0.5">Acompanhe seus conteúdos e atividades na plataforma.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 ring-2 ring-white flex items-center justify-center text-[9px] font-bold text-white">M</div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 ring-2 ring-white flex items-center justify-center text-[9px] font-bold text-white">D</div>
                <div className="w-8 h-8 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center text-[9px] font-bold text-gray-500">+5</div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[11px] font-medium text-gray-600">
                <CalendarDays size={12} /> Últimos 30 dias
              </div>
            </div>
          </div>

          {/* Stats + Active section */}
          <div className="grid grid-cols-12 gap-5 mb-6">
            {/* Stats cards */}
            <div className="col-span-8 grid grid-cols-3 gap-4">
              {[
                { icon: <Eye size={14} />, label: "Visualizações", value: "12.8K", sub: "↗ +18% vs mês anterior", subColor: "text-green-600" },
                { icon: <Download size={14} />, label: "Downloads", value: "3.2K", sub: "↗ +12% crescimento", subColor: "text-green-600" },
                { icon: <Users size={14} />, label: "Usuários Ativos", value: "847", sub: "~Trajetória estável", subColor: "text-gray-400" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-gray-400">{s.icon}</div>
                    <span className="text-[11px] font-medium text-gray-500">{s.label}</span>
                  </div>
                  <p className="text-[28px] font-bold text-gray-900 tracking-tight">{s.value}</p>
                  <p className={`text-[10px] font-medium mt-1 ${s.subColor}`}>{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Trilhas ativas */}
            <div className="col-span-4 bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-bold text-gray-900">Trilhas Ativas</h3>
                <button className="text-gray-300 hover:text-gray-500">•••</button>
              </div>
              <div className="space-y-3.5">
                {[
                  { title: "Liderança Eficaz", sub: "8/12 módulos", progress: 65, color: "bg-green-500", status: "EM ANDAMENTO", statusColor: "text-green-600" },
                  { title: "Gestão Financeira", sub: "3/10 módulos", progress: 30, color: "bg-amber-500", status: "INICIADA", statusColor: "text-amber-600" },
                  { title: "Comunicação Visual", sub: "Aguardando início", progress: 0, color: "bg-gray-300", status: "PENDENTE", statusColor: "text-gray-400" },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center shrink-0`}>
                      <GraduationCap size={14} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-gray-800">{t.title}</p>
                      <p className="text-[9px] text-gray-400">{t.sub}</p>
                    </div>
                    <span className={`text-[8px] font-bold uppercase tracking-wider ${t.statusColor}`}>{t.status}</span>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full py-2 rounded-xl border border-gray-200 text-[11px] font-medium text-gray-500 hover:bg-gray-50 transition">
                Ver Todas as Trilhas
              </button>
            </div>
          </div>

          {/* Featured video — HERO */}
          <div className="relative rounded-3xl overflow-hidden mb-6 group cursor-pointer shadow-lg shadow-green-900/5">
            <img src={yt(VIDEOS[0].id)} alt="" className="w-full aspect-[2.8/1] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            {/* Green glow at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-500/20 to-transparent" />
            <div className="absolute top-5 left-6">
              <span className="text-[9px] font-bold bg-green-500 text-white px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-green-500/30">Conteúdo em Destaque</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-7">
              <h2 className="text-[20px] font-bold text-white leading-snug max-w-[600px]">{VIDEOS[0].title}</h2>
              <p className="text-[12px] text-white/60 mt-2">{VIDEOS[0].author} · Rede Inspire</p>
              <p className="text-[11px] text-green-300 mt-1.5 font-medium">Expectativa de engajamento: alto.</p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-white/90 shadow-2xl flex items-center justify-center hover:scale-110 transition-transform">
                <Play size={24} className="text-green-600 ml-1" fill="currentColor" />
              </div>
            </div>
          </div>

          {/* Recent content table-style */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-bold text-gray-900">Conteúdos Recentes</h3>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 transition"><Search size={13} /></button>
                <button className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 transition"><Download size={13} /></button>
              </div>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-3 py-2 text-[9px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <div className="col-span-5">Conteúdo</div>
              <div className="col-span-2">Autor</div>
              <div className="col-span-2">Duração</div>
              <div className="col-span-2">Views</div>
              <div className="col-span-1"></div>
            </div>

            {/* Rows */}
            {VIDEOS.slice(1, 7).map((v, i) => (
              <div key={v.id} className="grid grid-cols-12 gap-4 px-3 py-3.5 items-center hover:bg-gray-50 rounded-xl transition cursor-pointer group border-b border-gray-50 last:border-0">
                <div className="col-span-5 flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img src={yt(v.id)} alt="" className="w-14 h-9 rounded-lg object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/30 rounded-lg">
                      <Play size={10} className="text-white" fill="white" />
                    </div>
                  </div>
                  <span className="text-[11.5px] font-medium text-gray-800 line-clamp-2 leading-snug">{v.title}</span>
                </div>
                <div className="col-span-2 text-[11px] text-gray-500">{v.author}</div>
                <div className="col-span-2 text-[11px] text-gray-500 flex items-center gap-1"><Clock size={10} />{v.duration}</div>
                <div className="col-span-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    i === 0 ? 'bg-green-50 text-green-600' :
                    i === 1 ? 'bg-blue-50 text-blue-600' :
                    i === 2 ? 'bg-amber-50 text-amber-600' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {v.views} views
                  </span>
                </div>
                <div className="col-span-1 text-right">
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition" />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom grid: Materials + Events */}
          <div className="grid grid-cols-2 gap-5 pb-8">
            {/* Top Materiais */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-[13px] font-bold text-gray-900 mb-4">Top Materiais Baixados</h3>
              <div className="space-y-2.5">
                {["Planejamento Estratégico 2026", "Manual do Líder de Célula", "Guia de Escola Bíblica", "Kit Comunicação Visual", "Roteiro de Culto Criativo"].map((m, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                    <span className={`text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center ${i < 3 ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>{i + 1}</span>
                    <span className="text-[11px] text-gray-700 flex-1">{m}</span>
                    <span className="text-[9px] text-gray-400">{342 - i * 40} downloads</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Próximos eventos */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-[13px] font-bold text-gray-900 mb-4">Próximos Eventos</h3>
              <div className="space-y-3">
                {[
                  { title: "Liderança em Tempos de Crise", date: "6 Jun · 19:00", type: "Webinar" },
                  { title: "Capacitação de Líderes de Célula", date: "15 Jun · 09:00", type: "Presencial" },
                  { title: "Congresso Anual Rede Inspire", date: "20 Jul · 08:00", type: "Evento" },
                ].map((ev, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                      <CalendarDays size={16} className="text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-gray-800">{ev.title}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">{ev.date}</p>
                    </div>
                    <span className="text-[8px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase">{ev.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Back */}
      <div className="fixed bottom-5 right-5 z-50">
        <button onClick={() => navigate('/')} className="px-4 py-2.5 rounded-xl bg-green-600 text-white text-[11px] font-semibold shadow-lg shadow-green-600/20 hover:bg-green-700 hover:scale-105 transition-all">
          ← Voltar à versão atual
        </button>
      </div>
    </div>
  );
}
