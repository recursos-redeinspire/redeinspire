import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, BookOpen, Route, GraduationCap, CalendarDays,
  FolderDown, MapPin, BarChart3, Play, ChevronRight,
  Zap, Users, Star, X,
  Search, LogOut, HelpCircle, Lightbulb, Flame,
  TrendingUp, Calendar, Sparkles, Award
} from "lucide-react";

const VIDEOS = [
  { id: '4CJQVNhVPv4', title: 'Como consolidar as bases ministeriais em sua igreja', author: 'Marcos Sanches', duration: '45 min', views: '2.4k', img: 'https://images.unsplash.com/photo-1543060829-a0029874b174?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080' },
  { id: 'CHy2xDu-FFs', title: 'Saúde emocional da equipe ministerial', author: 'Carmen Rangel', duration: '38 min', views: '1.8k', img: 'https://images.unsplash.com/photo-1515603403036-f3d35f75ca52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080' },
  { id: 'PoyaOKZ4VPY', title: 'Gestão de equipes de alta performance', author: 'Matheus Moraes', duration: '52 min', views: '3.1k', img: 'https://images.unsplash.com/flagged/photo-1557896279-080cb03b9ca6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080' },
  { id: 'cc4AyP6l6jA', title: 'Planejamento estratégico para igrejas e ministérios', author: 'Marcelo Santos', duration: '41 min', views: '1.5k', img: 'https://images.unsplash.com/photo-1555696958-c5049b866f6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080' },
  { id: 'g21WdMNY1pw', title: 'Cultura de Inovação na Igreja', author: 'Marcos Madaleno', duration: '47 min', views: '2.9k', img: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080' },
  { id: 'zUc7YWPHgGM', title: 'Como a tecnologia pode otimizar seu trabalho', author: 'Talk Gestores', duration: '33 min', views: '1.2k', img: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080' },
  { id: 'RgJ3p91AR4A', title: 'Como tirar o peso operacional do seu pastor', author: 'Sandra Traudi', duration: '29 min', views: '980', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080' },
  { id: 'TOa4-r120Fk', title: 'Assistência executiva e secretariado ministerial', author: 'Sandra Traldi', duration: '35 min', views: '756', img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080' },
];

function img(v: typeof VIDEOS[0]) { return v.img; }

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
  const [showOnboarding, setShowOnboarding] = useState(true);

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
              item.active ? "bg-green-50 text-green-700" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}>
              <item.icon size={17} className={item.active ? "text-green-600" : "text-gray-400"} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-3 pb-5 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition">
            <HelpCircle size={17} className="text-gray-400" /><span>Central de Ajuda</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition">
            <LogOut size={17} className="text-gray-400" /><span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 h-screen overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <div className="px-8 py-7">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">Olá, Danilo! 👋</h1>
              <p className="text-[14px] text-gray-400 mt-1">Escolha o que assistir ou explore novos conteúdos.</p>
            </div>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input className="pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-[13px] text-gray-800 placeholder-gray-400 outline-none focus:border-green-300 focus:ring-2 focus:ring-green-50 transition w-[240px]" placeholder="Buscar..." />
            </div>
          </div>

          {/* Onboarding banner */}
          {showOnboarding && (
            <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-3 flex items-center gap-4 mb-5">
              <Lightbulb size={16} className="text-green-600 shrink-0" />
              <p className="text-[12px] text-gray-700 flex-1"><span className="font-semibold">Novo por aqui?</span> Explore nossos treinamentos e comece sua jornada de capacitação ministerial.</p>
              <button className="px-4 py-1.5 rounded-lg bg-green-600 text-white text-[11px] font-semibold hover:bg-green-700 transition shrink-0">Começar agora</button>
              <button onClick={() => setShowOnboarding(false)} className="text-gray-400 hover:text-gray-600 transition shrink-0"><X size={14} /></button>
            </div>
          )}

          {/* HERO — Video destaque */}
          <div className="relative rounded-3xl overflow-hidden mb-7 group cursor-pointer shadow-lg shadow-green-900/5">
            <img src={img(VIDEOS[0])} alt="" className="w-full aspect-[2.6/1] object-cover" />
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

          {/* Webinar banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 mb-7 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center"><Calendar size={20} className="text-white" /></div>
              <div>
                <p className="text-[10px] text-white/60 uppercase font-semibold tracking-wider">Próximo Webinar</p>
                <h3 className="text-[15px] font-bold text-white mt-0.5">Liderança em Tempos de Crise</h3>
                <p className="text-[12px] text-white/60 mt-0.5">Pr. João Dinis · 6 de junho, 19:00</p>
              </div>
            </div>
            <button className="bg-white text-indigo-700 px-5 py-2.5 rounded-xl text-[12px] font-semibold hover:bg-indigo-50 transition">Inscrever-se</button>
          </div>

          {/* Main grid: content + sidebar */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left: main content */}
            <div className="col-span-8 space-y-7">

              {/* Sugestões para você */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2"><Lightbulb size={17} className="text-amber-500" /> Sugestões para você</h2>
                  <button className="text-[12px] text-green-600 hover:text-green-700 font-semibold flex items-center gap-1">Ver catálogo <ChevronRight size={13} /></button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {VIDEOS.slice(1, 4).map(v => (
                    <div key={v.id} className="group cursor-pointer">
                      <div className="relative rounded-xl overflow-hidden shadow-sm">
                        <img src={img(v)} alt="" className="w-full aspect-video object-cover group-hover:scale-[1.03] transition-transform duration-400" />
                        <span className="absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded-md bg-black/60 text-white font-medium">{v.duration}</span>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <div className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center"><Play size={14} className="text-green-600 ml-0.5" fill="currentColor" /></div>
                        </div>
                      </div>
                      <h3 className="text-[13px] font-semibold text-gray-800 mt-2.5 line-clamp-2 leading-snug">{v.title}</h3>
                      <p className="text-[11px] text-gray-400 mt-1">{v.author}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Trilhas em andamento */}
              <section>
                <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2 mb-4"><Route size={17} className="text-blue-500" /> Trilhas em andamento</h2>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { title: "Liderança Eficaz", modules: "8/12 módulos", progress: 65, color: "bg-green-500" },
                    { title: "Gestão Financeira", modules: "3/10 módulos", progress: 30, color: "bg-amber-500" },
                    { title: "Comunicação Visual", modules: "6/7 módulos", progress: 85, color: "bg-indigo-500" },
                  ].map((t, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition cursor-pointer">
                      <p className="text-[13px] font-semibold text-gray-800">{t.title}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex-1 bg-gray-100 rounded-full h-2"><div className={`h-2 rounded-full ${t.color}`} style={{ width: `${t.progress}%` }} /></div>
                        <span className="text-[11px] font-bold text-gray-500">{t.progress}%</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1.5">{t.modules}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Top 10 Materiais */}
              <section>
                <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2 mb-4"><Star size={17} className="text-orange-500" /> Top 10 Materiais</h2>
                <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                  {["Planejamento Estratégico 2026", "Manual do Líder de Célula", "Guia de Escola Bíblica", "Kit Comunicação Visual", "Roteiro de Culto Criativo", "Modelo Relatório Ministerial", "Guia de Acolhimento", "Template Planejamento Anual", "Manual Mídia e Redes", "Apostila Escola de Líderes"].map((m, i) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition cursor-pointer">
                      <span className={`text-[12px] font-bold w-5 text-center ${i < 3 ? 'text-green-600' : 'text-gray-300'}`}>{i + 1}</span>
                      <span className="text-[13px] text-gray-800 flex-1">{m}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Top Conteúdos (Em Alta) */}
              <section>
                <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2 mb-4"><Flame size={17} className="text-red-500" /> Top Conteúdos</h2>
                <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                  {VIDEOS.slice(0, 5).map((v, i) => (
                    <div key={v.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition cursor-pointer">
                      <span className={`text-[12px] font-bold w-5 text-center ${i < 3 ? 'text-red-500' : 'text-gray-300'}`}>{i + 1}</span>
                      <img src={img(v)} alt="" className="w-14 h-9 rounded-lg object-cover shrink-0" />
                      <span className="text-[13px] text-gray-800 flex-1 line-clamp-1">{v.title}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Conteúdos recentes */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2"><TrendingUp size={17} className="text-green-500" /> Conteúdos recentes</h2>
                  <button className="text-[12px] text-green-600 font-semibold">Ver todos →</button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {VIDEOS.slice(4, 8).map(v => (
                    <div key={v.id} className="group cursor-pointer">
                      <div className="relative rounded-xl overflow-hidden shadow-sm">
                        <img src={img(v)} alt="" className="w-full aspect-video object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <div className="w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center"><Play size={11} className="text-green-600 ml-0.5" fill="currentColor" /></div>
                        </div>
                      </div>
                      <p className="text-[11px] font-medium text-gray-800 mt-2 line-clamp-2 leading-snug">{v.title}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Próximos eventos */}
              <section>
                <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2 mb-4"><Calendar size={17} className="text-purple-500" /> Próximos eventos</h2>
                <div className="space-y-2.5">
                  {[
                    { title: "Liderança em Tempos de Crise", host: "Pr. João Dinis", date: "6 Jun · 19:00", type: "Webinar", color: "bg-purple-50", iconColor: "text-purple-600" },
                    { title: "Capacitação de Líderes de Célula", host: "Marcos Madaleno", date: "15 Jun · 09:00", type: "Presencial", color: "bg-blue-50", iconColor: "text-blue-600" },
                    { title: "Mentoria de Liderança", host: "Pr. Carlos Silva", date: "30 Mai · 10:00", type: "Mentoria", color: "bg-green-50", iconColor: "text-green-600" },
                  ].map((ev, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between hover:shadow-sm transition cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${ev.color} flex items-center justify-center`}><Calendar size={16} className={ev.iconColor} /></div>
                        <div>
                          <p className="text-[13px] font-semibold text-gray-800">{ev.title}</p>
                          <p className="text-[11px] text-gray-400">{ev.host} · {ev.date}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase">{ev.type}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right sidebar */}
            <div className="col-span-4 space-y-5">
              {/* Pontos + Ranking */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center"><Star size={18} className="text-amber-500" /></div>
                  <div><p className="text-[20px] font-bold text-gray-900">1.250</p><p className="text-[11px] text-gray-400">Seus pontos</p></div>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Top Usuários</p>
                  <div className="space-y-2">
                    {[{ name: "Marcos Madaleno", pts: 2100 }, { name: "Danilo Santos", pts: 1250 }, { name: "Matheus", pts: 980 }, { name: "Renato Okamoto", pts: 870 }, { name: "Ana Oliveira", pts: 650 }].map((u, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-gray-400 w-4">{i + 1}º</span>
                        <span className="flex-1 text-[12px] text-gray-700 truncate">{u.name}</span>
                        <span className="text-[11px] font-semibold text-amber-600">{u.pts}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Links rápidos */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <p className="text-[11px] font-semibold text-gray-400 uppercase mb-3">Acesso rápido</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Materiais", icon: <FolderDown size={14} /> },
                    { label: "Mensagens", icon: <Sparkles size={14} /> },
                    { label: "Mapa", icon: <MapPin size={14} /> },
                    { label: "Planejamento", icon: <CalendarDays size={14} /> },
                    { label: "Dashboard", icon: <BarChart3 size={14} /> },
                    { label: "Mentorias", icon: <Users size={14} /> },
                  ].map((item, i) => (
                    <button key={i} className="flex items-center gap-2 text-[11px] text-gray-600 bg-gray-50 rounded-lg px-3 py-2.5 hover:bg-green-50 hover:text-green-700 transition">
                      {item.icon} {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Próximo webinar card */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <p className="text-[10px] text-purple-600 font-semibold uppercase mb-2">Próximo Webinar</p>
                <h3 className="text-[13px] font-bold text-gray-900">Liderança em Tempos de Crise</h3>
                <p className="text-[11px] text-gray-500 mt-1">Pr. João Dinis</p>
                <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1"><Calendar size={11} /> 6 Jun · 19:00</p>
                <button className="mt-3 w-full bg-purple-600 text-white py-2 rounded-lg text-[12px] font-medium hover:bg-purple-700 transition">Ver detalhes</button>
              </div>

              {/* Próxima mentoria */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <p className="text-[10px] text-blue-600 font-semibold uppercase mb-2">Próxima Mentoria</p>
                <h3 className="text-[13px] font-bold text-gray-900">Mentoria de Liderança</h3>
                <p className="text-[11px] text-gray-500 mt-1">Pr. Carlos Silva</p>
                <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1"><Calendar size={11} /> 30 Mai · 10:00</p>
                <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg text-[12px] font-medium hover:bg-blue-700 transition">Ver detalhes</button>
              </div>

              {/* Igrejas mais ativas */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <p className="text-[11px] font-semibold text-gray-400 uppercase mb-3 flex items-center gap-1"><Award size={12} /> Igrejas mais ativas</p>
                <div className="space-y-2">
                  {["Igreja Inspire SP", "Igreja Rio da Vida", "Comunidade Ágape", "PIB Alto Caparaó", "AD Fé para as Nações"].map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-gray-400 w-4">{i + 1}º</span>
                      <span className="text-[12px] text-gray-700 flex-1 truncate">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
