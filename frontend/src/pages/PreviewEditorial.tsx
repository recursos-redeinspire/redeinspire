import { useNavigate } from "react-router-dom";
import {
  Home, BookOpen, Route, GraduationCap, CalendarDays,
  FolderDown, MapPin, BarChart3, Play,
  Star, Search, Bell, Award
} from "lucide-react";

const VIDEOS = [
  { id: '4CJQVNhVPv4', title: 'Como consolidar as bases ministeriais em sua igreja', author: 'Marcos Sanches' },
  { id: 'CHy2xDu-FFs', title: 'Saúde emocional da equipe ministerial', author: 'Carmen Rangel' },
  { id: 'PoyaOKZ4VPY', title: 'Gestão de equipes de alta performance', author: 'Matheus Moraes' },
  { id: 'cc4AyP6l6jA', title: 'Planejamento estratégico para igrejas', author: 'Marcelo Santos' },
  { id: 'g21WdMNY1pw', title: 'Cultura de Inovação na Igreja', author: 'Marcos Madaleno' },
  { id: 'zUc7YWPHgGM', title: 'Como a tecnologia pode otimizar seu trabalho', author: 'Talk Gestores' },
];
function yt(id: string) { return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`; }

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

export default function PreviewEditorial() {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen bg-[#F5F2EC] text-[#2C2C2C] overflow-hidden" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
      {/* Sidebar */}
      <aside className="w-60 bg-[#EBE7DF] border-r border-[#2C2C2C]/10 flex flex-col h-full">
        <div className="p-8 flex items-center justify-center border-b border-[#2C2C2C]/10">
          <div className="text-center">
            <h1 className="text-xl tracking-wide font-normal">INSPIRE</h1>
            <p className="text-[9px] tracking-widest uppercase mt-1 opacity-60" style={{ fontFamily: "'Inter', sans-serif" }}>São Paulo</p>
          </div>
        </div>
        <nav className="flex-1 py-6 px-5 space-y-1">
          {nav.map((item, i) => (
            <button key={i} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${item.active ? 'bg-[#2C2C2C] text-[#F5F2EC]' : 'text-[#2C2C2C]/60 hover:text-[#2C2C2C] hover:bg-[#2C2C2C]/5'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
              <item.icon size={15} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-5 border-t border-[#2C2C2C]/10">
          <div className="flex items-center gap-3 px-3">
            <div className="w-8 h-8 rounded-full bg-[#2C2C2C] flex items-center justify-center text-[10px] font-bold text-[#F5F2EC]">D</div>
            <div style={{ fontFamily: "'Inter', sans-serif" }}><p className="text-xs font-medium">Danilo Santos</p><p className="text-[10px] opacity-50">Administrador</p></div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 border-b border-[#2C2C2C]/10 shrink-0" style={{ fontFamily: "'Inter', sans-serif" }}>
          <div className="flex-1 max-w-md flex items-center bg-[#EBE7DF] rounded-lg px-4 py-2">
            <Search size={14} className="opacity-40" />
            <input className="bg-transparent border-none focus:outline-none ml-2 text-sm w-full placeholder-[#2C2C2C]/30" placeholder="Buscar conteúdos..." />
          </div>
          <div className="flex items-center gap-4">
            <Bell size={16} className="opacity-40 cursor-pointer hover:opacity-70" />
            <div className="flex items-center gap-1.5 text-sm font-medium opacity-70"><Star size={14} className="text-amber-600" /> 200</div>
          </div>
        </header>

        <div className="flex-1 overflow-auto px-10 py-8" style={{ scrollbarWidth: "none" }}>
          <div className="max-w-5xl mx-auto">
            {/* Welcome */}
            <div className="mb-10">
              <h1 className="text-4xl font-normal tracking-tight leading-tight">Bem-vindo de volta,<br/><em className="italic">Danilo.</em></h1>
              <p className="text-sm opacity-50 mt-3" style={{ fontFamily: "'Inter', sans-serif" }}>Explore os conteúdos mais recentes da plataforma.</p>
            </div>

            {/* Hero */}
            <div className="grid grid-cols-3 gap-5 mb-10">
              <div className="col-span-2 relative rounded-2xl overflow-hidden group cursor-pointer h-[380px]">
                <img src={yt(VIDEOS[0].id)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C] via-[#2C2C2C]/30 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#F5F2EC]/60 mb-3 block" style={{ fontFamily: "'Inter', sans-serif" }}>Destaque da Semana</span>
                  <h2 className="text-2xl text-[#F5F2EC] leading-snug italic">{VIDEOS[0].title}</h2>
                  <p className="text-sm text-[#F5F2EC]/50 mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>{VIDEOS[0].author}</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <div className="w-14 h-14 rounded-full bg-[#F5F2EC] flex items-center justify-center shadow-xl"><Play size={20} className="text-[#2C2C2C] ml-0.5" fill="currentColor" /></div>
                </div>
              </div>
              <div className="flex flex-col gap-5 h-[380px]">
                {VIDEOS.slice(1, 3).map(v => (
                  <div key={v.id} className="flex-1 relative rounded-2xl overflow-hidden group cursor-pointer">
                    <img src={yt(v.id)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C]/90 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-sm text-[#F5F2EC] italic leading-snug">{v.title}</h3>
                      <p className="text-[10px] text-[#F5F2EC]/50 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>{v.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#2C2C2C]/10 my-10" />

            {/* Onboarding */}
            <div className="bg-[#EBE7DF] rounded-xl p-6 flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <GraduationCap size={22} className="opacity-60" />
                <div style={{ fontFamily: "'Inter', sans-serif" }}>
                  <h4 className="font-semibold text-sm">Novo na plataforma?</h4>
                  <p className="text-xs opacity-60">Assista os vídeos de treinamento e aproveite ao máximo</p>
                </div>
              </div>
              <button className="bg-[#2C2C2C] text-[#F5F2EC] text-sm px-5 py-2.5 rounded-lg hover:bg-[#1a1a1a] transition" style={{ fontFamily: "'Inter', sans-serif" }}>Ver treinamentos</button>
            </div>

            {/* Webinar */}
            <div className="bg-[#2C2C2C] text-[#F5F2EC] rounded-2xl p-8 flex items-center justify-between mb-10">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] opacity-50 block mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Próximo Webinar</span>
                <h3 className="text-2xl italic">Liderança em Tempos de Crise</h3>
                <p className="text-sm opacity-60 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Pr. Carlos Silva · 15 de março, 19:00</p>
              </div>
              <button className="bg-[#F5F2EC] text-[#2C2C2C] font-semibold px-6 py-3 rounded-lg hover:bg-white transition" style={{ fontFamily: "'Inter', sans-serif" }}>Inscrever-se</button>
            </div>

            {/* Lists */}
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div>
                <h3 className="text-lg mb-5 flex items-center gap-2"><Award size={16} className="opacity-50" /> <span className="italic">Top Materiais</span></h3>
                <div className="space-y-4 border-l-2 border-[#2C2C2C]/10 pl-5" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {["Planejamento Estratégico 2026", "Manual do Líder de Célula", "Guia de Escola Bíblica", "Kit Comunicação Visual", "Roteiro de Culto Criativo"].map((m, i) => (
                    <div key={i} className="flex items-center gap-3 group cursor-pointer">
                      <span className="text-sm opacity-30 font-medium w-4">{i + 1}</span>
                      <span className="text-sm opacity-70 group-hover:opacity-100 transition">{m}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg mb-5 flex items-center gap-2"><Star size={16} className="opacity-50" /> <span className="italic">Top Conteúdos</span></h3>
                <div className="space-y-4 border-l-2 border-[#2C2C2C]/10 pl-5" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {VIDEOS.slice(0, 5).map((v, i) => (
                    <div key={v.id} className="flex items-center gap-3 group cursor-pointer">
                      <span className="text-sm opacity-30 font-medium w-4">{i + 1}</span>
                      <span className="text-sm opacity-70 group-hover:opacity-100 transition line-clamp-1">{v.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent */}
            <div className="mb-10">
              <h3 className="text-lg italic mb-5">Conteúdos recentes</h3>
              <div className="grid grid-cols-3 gap-5">
                {VIDEOS.slice(3, 6).map(v => (
                  <div key={v.id} className="group cursor-pointer">
                    <div className="relative rounded-xl overflow-hidden aspect-video">
                      <img src={yt(v.id)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/20">
                        <div className="w-10 h-10 rounded-full bg-[#F5F2EC] flex items-center justify-center"><Play size={14} className="text-[#2C2C2C] ml-0.5" fill="currentColor" /></div>
                      </div>
                    </div>
                    <h4 className="text-sm italic mt-3 leading-snug opacity-80">{v.title}</h4>
                    <p className="text-[11px] opacity-40 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>{v.author}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-[#2C2C2C]/10 pt-8 pb-20 text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
              <p className="text-xs opacity-40">© 2026 Rede Inspire. Todos os direitos reservados.</p>
            </footer>
          </div>
        </div>
      </main>

      <div className="fixed bottom-5 right-5 z-50">
        <button onClick={() => navigate('/')} className="px-4 py-2.5 rounded-lg bg-[#2C2C2C] text-[#F5F2EC] text-[11px] font-semibold hover:scale-105 transition-all" style={{ fontFamily: "'Inter', sans-serif" }}>← Voltar</button>
      </div>
    </div>
  );
}
