import React from 'react';
import { Search, Bell, Star, Home, BookOpen, Map, Users, Calendar, FileText, MapPin, LayoutDashboard, UserPlus, Settings, Play, ChevronRight, Award, GraduationCap, Zap } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { mockData } from './data';

const getIcon = (name: string) => {
  const icons: any = { Home, BookOpen, Map, Users, Calendar, FileText, MapPin, LayoutDashboard, UserPlus, Settings };
  const Icon = icons[name] || Home;
  return <Icon className="w-4 h-4" />;
};

export function Option2() {
  return (
    <div className="flex h-screen bg-[#0a0a0a] text-zinc-100 font-sans overflow-hidden selection:bg-fuchsia-500/30">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-zinc-800/50 flex flex-col h-full overflow-y-auto hidden md:flex z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
            <Zap className="text-white w-4 h-4" />
          </div>
          <span className="font-black text-sm tracking-tight">Rede Inspire<br/><span className="text-zinc-500 font-normal text-xs">São Paulo</span></span>
        </div>
        
        <div className="flex-1 py-4">
          {mockData.sidebarLinks.map((group, idx) => (
            <div key={idx} className="mb-8 px-4">
              {group.section && (
                <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3 px-3">{group.section}</h3>
              )}
              <div className="space-y-1">
                {group.items.map((item, i) => (
                  <button 
                    key={i}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      item.active 
                        ? 'bg-zinc-800/80 text-white shadow-inner border border-zinc-700/50' 
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                    }`}
                  >
                    <span className={item.active ? 'text-fuchsia-400' : 'text-zinc-500'}>
                      {getIcon(item.icon)}
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Decorative blur */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-fuchsia-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 flex-shrink-0 z-10">
          <div className="flex-1 max-w-xl flex items-center bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 rounded-2xl px-4 py-2.5">
            <Search className="w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Buscar conteúdos..." 
              className="bg-transparent border-none focus:outline-none ml-3 text-sm w-full text-zinc-200 placeholder-zinc-500"
            />
          </div>
          <div className="flex items-center gap-6 ml-4">
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-zinc-400">
              <span className="w-5 h-5 bg-zinc-800 rounded-full flex items-center justify-center text-[10px]">PT</span>
            </div>
            <button className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full text-sm font-bold">
              <Star className="w-4 h-4 text-fuchsia-400" />
              <span>{mockData.user.points}</span>
            </div>
            <ImageWithFallback src={mockData.user.avatar} alt="User" className="w-10 h-10 rounded-full border border-zinc-700" />
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6 md:p-8 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-8">
              <h1 className="text-3xl font-black tracking-tight">
                Bem-vindo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-400">{mockData.user.name}!</span>
              </h1>
              <button className="text-sm font-bold text-zinc-400 flex items-center gap-1 hover:text-white transition-colors group">
                Ver catálogo <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Bento Grid Hero */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
              {/* Main Banner */}
              <div className="lg:col-span-3 relative rounded-3xl overflow-hidden group h-[380px] border border-zinc-800/50">
                <ImageWithFallback src={mockData.images.mainWebinar} alt="Main" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <span className="bg-fuchsia-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4 inline-block shadow-[0_0_15px_rgba(217,70,239,0.5)]">
                    Novo Lançamento
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-2 leading-[1.1] max-w-2xl">
                    Recursos Financeiros x Prioridades na Igreja
                  </h2>
                  <p className="text-zinc-400 font-medium">Webinar com Pr. Yan</p>
                </div>
              </div>
              
              {/* Side Banners */}
              <div className="lg:col-span-1 flex flex-col gap-4 h-[380px]">
                <div className="flex-1 relative rounded-3xl overflow-hidden group border border-zinc-800/50">
                  <ImageWithFallback src={mockData.images.subWebinar1} alt="Sub 1" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 mix-blend-luminosity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/20"></div>
                  <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="text-sm font-bold text-white mb-1">Pr. Yan Lima</h3>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Recursos Financeiros</p>
                  </div>
                </div>
                <div className="flex-1 relative rounded-3xl overflow-hidden group border border-zinc-800/50">
                  <ImageWithFallback src={mockData.images.subWebinar2} alt="Sub 2" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 mix-blend-luminosity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/20"></div>
                  <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="text-sm font-bold text-white mb-1">Marcos Sanches</h3>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Bases Ministeriais</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert Banner */}
            <div className="bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                  <GraduationCap className="w-6 h-6 text-fuchsia-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">Novo na plataforma?</h4>
                  <p className="text-sm text-zinc-400">Assista os vídeos de treinamento e aproveite ao máximo</p>
                </div>
              </div>
              <button className="mt-4 sm:mt-0 bg-white text-black text-sm font-bold px-6 py-3 rounded-full hover:bg-zinc-200 transition-colors">
                Ver treinamentos
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Next Event Banner */}
                <div className="bg-gradient-to-br from-indigo-600 to-fuchsia-600 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                  <div className="relative z-10">
                    <span className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-2 block">Próximo Webinar</span>
                    <h3 className="text-3xl font-black text-white mb-1">Liderança em Tempos de Crise</h3>
                    <p className="text-white/80 font-medium">Pr. Carlos Silva - 15 de mar, 19:00</p>
                  </div>
                  <button className="mt-6 sm:mt-0 relative z-10 bg-white text-black font-black px-8 py-4 rounded-full hover:scale-105 transition-transform">
                    Inscrever-se
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top Materials */}
                  <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-3xl overflow-hidden p-6">
                    <h3 className="font-black text-lg mb-6 flex items-center gap-3">
                      <Award className="w-5 h-5 text-fuchsia-500" /> Top 10 Materiais
                    </h3>
                    <div className="space-y-4">
                      {mockData.topMaterials.slice(0, 5).map((item, idx) => (
                        <div key={item.id} className="flex items-center gap-4 group cursor-pointer">
                          <span className="text-zinc-600 font-black text-lg w-5">{idx + 1}</span>
                          <span className="text-sm text-zinc-300 font-medium group-hover:text-fuchsia-400 transition-colors">{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Content */}
                  <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-3xl overflow-hidden p-6">
                    <h3 className="font-black text-lg mb-6 flex items-center gap-3">
                      <Star className="w-5 h-5 text-indigo-500" /> Top Conteúdos
                    </h3>
                    <div className="space-y-4">
                      {mockData.topContent.slice(0, 5).map((item, idx) => (
                        <div key={item.id} className="flex items-center gap-4 group cursor-pointer">
                          <span className="text-zinc-600 font-black text-lg w-5">{idx + 1}</span>
                          <span className="text-sm text-zinc-300 font-medium group-hover:text-indigo-400 transition-colors line-clamp-1">{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                <div>
                  <h3 className="font-black text-lg mb-4 text-white">Sugestões para Você</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {mockData.suggestions.map((sug, i) => (
                      <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-600 transition-colors cursor-pointer group">
                        <h4 className="font-bold text-sm text-zinc-100 mb-2 group-hover:text-fuchsia-400 transition-colors">{sug.title}</h4>
                        <p className="text-xs text-zinc-500 font-medium">{sug.subtitle}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Content */}
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="font-black text-lg text-white">Conteúdos Recentes</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {mockData.images.recent.map((img, i) => (
                      <div key={i} className="group cursor-pointer">
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-3 border border-zinc-800 group-hover:border-zinc-600 transition-colors">
                          <ImageWithFallback src={img} alt="Recent" className="w-full h-full object-cover opacity-70 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100">
                              <Play className="w-4 h-4 text-white fill-white ml-1" />
                            </div>
                          </div>
                        </div>
                        <h4 className="text-xs font-bold text-zinc-300 line-clamp-2">Gestão ágil nas igrejas | Episódio {i+1}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (Widgets) */}
              <div className="space-y-6">
                
                {/* Ranking Widget */}
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 blur-[50px] rounded-full pointer-events-none"></div>
                  
                  <div className="flex items-center gap-4 mb-8 relative z-10">
                    <div className="w-14 h-14 rounded-full bg-zinc-950 flex items-center justify-center border border-zinc-800">
                      <Star className="w-6 h-6 text-fuchsia-500" />
                    </div>
                    <div>
                      <h3 className="font-black text-3xl leading-none tracking-tighter">{mockData.user.points}</h3>
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">pontos</span>
                    </div>
                  </div>
                  
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Top Usuários</h4>
                  <div className="space-y-4 relative z-10">
                    {mockData.topUsers.map((user, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                          <span className={`w-5 text-center text-xs font-black ${i === 0 ? 'text-fuchsia-500' : 'text-zinc-600'}`}>{user.rank}</span>
                          <span className={`font-bold ${i === 0 ? 'text-white' : 'text-zinc-400'}`}>{user.name}</span>
                        </div>
                        <span className="font-black text-zinc-500">{user.points}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Management Links Grid */}
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Gestão Rápida</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {['Materiais', 'Podcast', 'Mensagens', 'Mapa', 'Planejamento', 'Dashboard'].map((label, i) => (
                      <button key={i} className="flex items-center justify-center gap-2 text-xs font-bold text-zinc-400 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 hover:text-white py-3 rounded-xl transition-colors">
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mini Events */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors rounded-2xl p-5">
                    <span className="text-[10px] font-black text-fuchsia-500 uppercase tracking-widest block mb-2">Próximo Webinar</span>
                    <h4 className="font-bold text-white mb-1">Liderança em Tempos</h4>
                    <p className="text-xs text-zinc-500 font-medium mb-4">15 de mar, 19:00</p>
                    <button className="w-full bg-white text-black text-xs font-black py-2.5 rounded-full hover:bg-zinc-200 transition-colors">
                      Ver detalhes
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors rounded-2xl p-5">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-2">Mentoria</span>
                    <h4 className="font-bold text-white mb-1">Danilo Santos</h4>
                    <p className="text-xs text-zinc-500 font-medium mb-4">04 de abr, 22:29</p>
                    <button className="w-full bg-zinc-800 text-white text-xs font-black py-2.5 rounded-full hover:bg-zinc-700 transition-colors">
                      Ver detalhes
                    </button>
                  </div>
                </div>

              </div>
            </div>
            
            <footer className="mt-16 pt-8 border-t border-zinc-800/50 text-sm text-zinc-500 pb-20 text-center font-medium">
              © 2026 Rede Inspire. Criatividade e Inovação.
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
