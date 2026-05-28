import { useNavigate } from "react-router-dom";
import {
  Home, BookOpen, Route, GraduationCap, CalendarDays,
  FolderDown, MapPin, BarChart3, Play, ChevronRight,
  Zap, Star, Search, Bell, Award
} from "lucide-react";

const VIDEOS = [
  { id: '4CJQVNhVPv4', title: 'Como consolidar as bases ministeriais em sua igreja', author: 'Marcos Sanches', img: 'https://images.unsplash.com/photo-1543060829-a0029874b174?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080' },
  { id: 'CHy2xDu-FFs', title: 'Saúde emocional da equipe ministerial', author: 'Carmen Rangel', img: 'https://images.unsplash.com/photo-1515603403036-f3d35f75ca52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080' },
  { id: 'PoyaOKZ4VPY', title: 'Gestão de equipes de alta performance', author: 'Matheus Moraes', img: 'https://images.unsplash.com/flagged/photo-1557896279-080cb03b9ca6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080' },
  { id: 'cc4AyP6l6jA', title: 'Planejamento estratégico para igrejas', author: 'Marcelo Santos', img: 'https://images.unsplash.com/photo-1555696958-c5049b866f6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080' },
  { id: 'g21WdMNY1pw', title: 'Cultura de Inovação na Igreja', author: 'Marcos Madaleno', img: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080' },
  { id: 'zUc7YWPHgGM', title: 'Como a tecnologia pode otimizar seu trabalho', author: 'Talk Gestores', img: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080' },
];
function img(v: typeof VIDEOS[0]) { return v.img; }

const nav = [
  { label: "Início", icon: Home, active: true },
  { label: "Catálogo", icon: BookOpen },
  { label: "Trilhas", icon: Route },
  { label: "Mentorias", icon: GraduationCap },
  { label: "Planejamento", icon: CalendarDays },
  { label: "Materiais", icon: FolderDown },
  { label: "Mapa", icon: MapPin },
  { label: "Dashboard", icon: BarChart3 },
];

export default function PreviewDark() {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen bg-[#0a0a0a] text-zinc-100 overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-60 bg-[#0a0a0a] border-r border-zinc-800/50 flex flex-col h-full">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
            <Zap size={14} className="text-white" />
          </div>
          <div><span className="font-black text-sm">Rede Inspire</span><br/><span className="text-zinc-500 text-xs">São Paulo</span></div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {nav.map((item, i) => (
            <button key={i} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${item.active ? 'bg-zinc-800/80 text-white border border-zinc-700/50' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}>
              <item.icon size={15} className={item.active ? "text-fuchsia-400" : "text-zinc-500"} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-zinc-800/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">D</div>
            <div><p className="text-xs font-medium text-zinc-300">Danilo Santos</p><p className="text-[10px] text-zinc-600">Admin</p></div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-fuchsia-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex-1 max-w-xl flex items-center bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 rounded-2xl px-4 py-2.5">
            <Search size={14} className="text-zinc-500" />
            <input className="bg-transparent border-none focus:outline-none ml-3 text-sm w-full text-zinc-200 placeholder-zinc-500" placeholder="Buscar conteúdos..." />
          </div>
          <div className="flex items-center gap-4 ml-4">
            <button className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition"><Bell size={15} /></button>
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full text-sm font-bold"><Star size={14} className="text-fuchsia-400" /> 200</div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto px-8 py-6 z-10" style={{ scrollbarWidth: "none" }}>
          <div className="max-w-full">
            <div className="flex justify-between items-end mb-8">
              <h1 className="text-3xl font-black tracking-tight">Bem-vindo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-400">Danilo!</span></h1>
              <button className="text-sm font-bold text-zinc-400 flex items-center gap-1 hover:text-white transition group">Ver catálogo <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /></button>
            </div>

            {/* Onboarding */}
            <div className="bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 rounded-2xl p-6 flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700"><GraduationCap size={20} className="text-fuchsia-400" /></div>
                <div><h4 className="font-bold text-white text-lg">Novo na plataforma?</h4><p className="text-sm text-zinc-400">Assista os vídeos de treinamento e aproveite ao máximo</p></div>
              </div>
              <button className="bg-white text-black text-sm font-bold px-6 py-3 rounded-full hover:bg-zinc-200 transition">Ver treinamentos</button>
            </div>

            {/* Bento Hero */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="col-span-3 relative rounded-3xl overflow-hidden group h-[360px] border border-zinc-800/50">
                <img src={img(VIDEOS[0])} alt="" className="w-full h-full object-cover object-[center_30%] opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <span className="bg-fuchsia-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4 inline-block shadow-[0_0_15px_rgba(217,70,239,0.5)]">Novo Lançamento</span>
                  <h2 className="text-3xl font-black text-white leading-[1.1] max-w-2xl">{VIDEOS[0].title}</h2>
                  <p className="text-zinc-400 font-medium mt-2">{VIDEOS[0].author}</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <div className="w-16 h-16 rounded-full bg-fuchsia-500/20 backdrop-blur-md border border-fuchsia-400/30 flex items-center justify-center"><Play size={24} className="text-white ml-1" fill="white" /></div>
                </div>
              </div>
              <div className="col-span-1 flex flex-col gap-4 h-[360px]">
                {VIDEOS.slice(1, 3).map(v => (
                  <div key={v.id} className="flex-1 relative rounded-3xl overflow-hidden group border border-zinc-800/50">
                    <img src={img(v)} alt="" className="w-full h-full object-cover object-[center_30%] opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/20" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-sm font-bold text-white">{v.author}</h3>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5 line-clamp-1">{v.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Webinar banner */}
            <div className="bg-gradient-to-br from-indigo-600 to-fuchsia-600 rounded-3xl p-8 flex items-center justify-between mb-8 relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-2 block">Próximo Webinar</span>
                <h3 className="text-2xl font-black text-white">Liderança em Tempos de Crise</h3>
                <p className="text-white/80 font-medium mt-1">Pr. Carlos Silva - 15 de mar, 19:00</p>
              </div>
              <button className="relative z-10 bg-white text-black font-black px-8 py-4 rounded-full hover:scale-105 transition-transform">Inscrever-se</button>
            </div>

            {/* Lists */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-3xl p-6">
                <h3 className="font-black text-lg mb-5 flex items-center gap-3 text-white"><Award size={18} className="text-fuchsia-500" /> <span className="text-fuchsia-400">Top 10 Materiais</span></h3>
                <div className="space-y-3.5">
                  {["Planejamento Estratégico 2026", "Manual do Líder de Célula", "Guia de Escola Bíblica", "Kit Comunicação Visual", "Roteiro de Culto Criativo"].map((m, i) => (
                    <div key={i} className="flex items-center gap-4 group cursor-pointer">
                      <span className="text-zinc-600 font-black text-lg w-5">{i + 1}</span>
                      <span className="text-sm text-zinc-200 font-medium group-hover:text-fuchsia-400 transition">{m}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-3xl p-6">
                <h3 className="font-black text-lg mb-5 flex items-center gap-3 text-white"><Star size={18} className="text-indigo-500" /> <span className="text-indigo-400">Top Conteúdos</span></h3>
                <div className="space-y-3.5">
                  {VIDEOS.slice(0, 5).map((v, i) => (
                    <div key={v.id} className="flex items-center gap-4 group cursor-pointer">
                      <span className="text-zinc-600 font-black text-lg w-5">{i + 1}</span>
                      <span className="text-sm text-zinc-200 font-medium group-hover:text-indigo-400 transition line-clamp-1">{v.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent */}
            <div className="mb-8">
              <h3 className="font-black text-lg mb-5 text-white"><span className="text-zinc-200">Conteúdos recentes</span></h3>
              <div className="grid grid-cols-4 gap-4">
                {VIDEOS.slice(2, 6).map(v => (
                  <div key={v.id} className="group cursor-pointer">
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-800/50">
                      <img src={img(v)} alt="" className="w-full h-full object-cover object-[center_30%] opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="w-10 h-10 rounded-full bg-fuchsia-500/30 backdrop-blur-md border border-fuchsia-400/30 flex items-center justify-center"><Play size={14} className="text-white ml-0.5" fill="white" /></div>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-zinc-400 mt-2 line-clamp-2 group-hover:text-zinc-200 transition">{v.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-5 right-5 z-50">
        <button onClick={() => navigate('/')} className="px-4 py-2.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white text-[11px] font-bold shadow-lg hover:scale-105 transition-all">← Voltar</button>
      </div>
    </div>
  );
}
