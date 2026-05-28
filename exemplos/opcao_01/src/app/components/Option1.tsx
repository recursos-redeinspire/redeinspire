import React from 'react';
import { Search, Bell, Star, Home, BookOpen, Map, Users, Calendar, FileText, MapPin, LayoutDashboard, UserPlus, Settings, Play, ChevronRight, Award, GraduationCap, MessagesSquare, CheckCircle2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { mockData } from './data';

const getIcon = (name: string) => {
  const icons: any = { Home, BookOpen, Map, Users, Calendar, FileText, MapPin, LayoutDashboard, UserPlus, Settings };
  const Icon = icons[name] || Home;
  return <Icon className="w-4 h-4" />;
};

export function Option1() {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Settings className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-sm tracking-tight">Rede Inspire<br/><span className="text-slate-500 font-normal text-xs">Igreja Inspire São Paulo</span></span>
        </div>
        
        <div className="flex-1 py-4">
          {mockData.sidebarLinks.map((group, idx) => (
            <div key={idx} className="mb-6 px-4">
              {group.section && (
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">{group.section}</h3>
              )}
              <div className="space-y-1">
                {group.items.map((item, i) => (
                  <button 
                    key={i}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.active 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {getIcon(item.icon)}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex-1 max-w-xl flex items-center bg-slate-100 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar conteúdos..." 
              className="bg-transparent border-none focus:outline-none ml-2 text-sm w-full text-slate-700 placeholder-slate-400"
            />
          </div>
          <div className="flex items-center gap-6 ml-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-[10px]">PT</span>
              Português
            </div>
            <Bell className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600" />
            <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-sm font-bold border border-amber-200">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              {mockData.user.points}
            </div>
            <ImageWithFallback src={mockData.user.avatar} alt="User" className="w-8 h-8 rounded-full border border-slate-200" />
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-6">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-amber-500">✨</span> Bem-vindo, {mockData.user.name}!
              </h1>
              <button className="text-sm font-medium text-blue-600 flex items-center gap-1 hover:underline">
                Ver catálogo <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Hero Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 relative rounded-2xl overflow-hidden group h-[340px] shadow-sm">
                <ImageWithFallback src={mockData.images.mainWebinar} alt="Main" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded mb-3 inline-block">Novo</span>
                  <h2 className="text-2xl font-bold text-white mb-2 leading-tight">Webinar - Pr Yan - Recursos Financeiros x Prioridades na Igreja</h2>
                </div>
              </div>
              
              <div className="flex flex-col gap-6">
                <div className="relative rounded-2xl overflow-hidden group h-[158px] shadow-sm">
                  <ImageWithFallback src={mockData.images.subWebinar1} alt="Sub 1" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-sm font-bold text-white">Recursos financeiros x Prioridades na igreja | Pr. Yan Lima</h3>
                  </div>
                </div>
                <div className="relative rounded-2xl overflow-hidden group h-[158px] shadow-sm">
                  <ImageWithFallback src={mockData.images.subWebinar2} alt="Sub 2" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-sm font-bold text-white">Webinar Marcos Sanches - Como Consolidar as Bases</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert Banner */}
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-6 h-6 text-teal-600" />
                <div>
                  <h4 className="font-semibold text-teal-900 text-sm">Novo na plataforma?</h4>
                  <p className="text-xs text-teal-700">Assista os vídeos de treinamento e aproveite ao máximo</p>
                </div>
              </div>
              <button className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                Ver treinamentos
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column (Lists) */}
              <div className="lg:col-span-2 space-y-8">
                {/* Next Event Banner inside Left Col */}
                <div className="bg-blue-600 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between text-white shadow-md">
                  <div>
                    <span className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1 block">Próximo Webinar</span>
                    <h3 className="text-xl font-bold mb-1">Liderança em Tempos de Crise</h3>
                    <p className="text-blue-100 text-sm">Pr. Carlos Silva - 15 de março às 19:00</p>
                  </div>
                  <button className="mt-4 sm:mt-0 bg-white text-blue-600 font-bold px-6 py-2.5 rounded-lg hover:bg-blue-50 transition-colors">
                    Inscrever-se
                  </button>
                </div>

                {/* Top Materials */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                    <Award className="w-5 h-5 text-orange-500" />
                    <h3 className="font-bold text-slate-800">Top 10 Materiais</h3>
                  </div>
                  <div className="p-0">
                    {mockData.topMaterials.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                        <span className="text-slate-400 font-medium w-4 text-center">{idx + 1}</span>
                        <span className="text-sm text-slate-700 font-medium">{item.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Content */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                    <Star className="w-5 h-5 text-red-500" />
                    <h3 className="font-bold text-slate-800">Top 10 Conteúdos</h3>
                  </div>
                  <div className="p-0">
                    {mockData.topContent.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                        <span className="text-slate-400 font-medium w-4 text-center">{idx + 1}</span>
                        <span className="text-sm text-slate-700 font-medium truncate">{item.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Suggestions */}
                <div>
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="text-yellow-500">💡</span> Sugestões para Você
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {mockData.suggestions.map((sug, i) => (
                      <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <h4 className="font-bold text-sm text-slate-800 mb-1">{sug.title}</h4>
                        <p className="text-xs text-slate-500">{sug.subtitle}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Content */}
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="text-green-500">📈</span> Conteúdos recentes
                    </h3>
                    <button className="text-xs font-medium text-slate-500 hover:text-slate-900">Ver todos &rarr;</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {mockData.images.recent.map((img, i) => (
                      <div key={i} className="group cursor-pointer">
                        <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                          <ImageWithFallback src={img} alt="Recent" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-8 h-8 text-white fill-white" />
                          </div>
                        </div>
                        <h4 className="text-xs font-medium text-slate-800 line-clamp-2">Gestão ágil nas igrejas | Especial</h4>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Events List */}
                <div>
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-500" /> Próximos eventos
                  </h3>
                  <div className="space-y-3">
                    {mockData.upcomingEvents.map((evt, i) => (
                      <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-purple-200 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                            <Play className="w-4 h-4 ml-1" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-800">{evt.title}</h4>
                            <p className="text-xs text-slate-500">{evt.speaker} · {evt.date}</p>
                          </div>
                        </div>
                        <button className="bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                          Inscrever
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (Widgets) */}
              <div className="space-y-6">
                {/* Ranking Widget */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
                      <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl leading-none">{mockData.user.points}</h3>
                      <span className="text-xs text-slate-500">pontos</span>
                    </div>
                  </div>
                  
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Top Usuários</h4>
                  <div className="space-y-3">
                    {mockData.topUsers.map((user, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 w-4 text-xs">{user.rank}º</span>
                          <span className="font-medium text-slate-700">{user.name}</span>
                        </div>
                        <span className="font-bold text-amber-500">{user.points}</span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full text-center text-xs font-medium text-blue-600 mt-4 pt-4 border-t border-slate-100 hover:underline">
                    Ver ranking completo +
                  </button>
                </div>

                {/* Management Links Grid */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Gestão</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['Materiais', 'Podcast', 'Mensagens', 'Mapa', 'Planejamento', 'Dashboard'].map((label, i) => (
                      <button key={i} className="flex items-center justify-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 py-3 rounded-lg transition-colors">
                        <FileText className="w-3 h-3" /> {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mini Event Cards */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block mb-1">Próximo Webinar</span>
                  <h4 className="font-bold text-sm text-slate-800 mb-1">Liderança em Tempos de Crise</h4>
                  <p className="text-xs text-slate-500 mb-3">Pr. Carlos Silva<br/>15 de mar, 19:00</p>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg transition-colors">
                    Ver detalhes
                  </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-1">Próxima Mentoria</span>
                  <h4 className="font-bold text-sm text-slate-800 mb-1">Mentoria 1 a 1</h4>
                  <p className="text-xs text-slate-500 mb-3">Danilo Santos<br/>04 de abr, 22:29</p>
                  <button className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-bold py-2 rounded-lg transition-colors">
                    Ver detalhes
                  </button>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <footer className="mt-12 pt-8 border-t border-slate-200 text-sm text-slate-500 pb-20">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                  <h4 className="font-bold text-slate-900 mb-3">Rede Inspire</h4>
                  <p className="text-xs leading-relaxed">Plataforma de conteúdo e capacitação para igrejas filiadas.</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-3">Conteúdo</h4>
                  <ul className="space-y-2 text-xs">
                    <li><a href="#" className="hover:text-blue-600">Catálogo</a></li>
                    <li><a href="#" className="hover:text-blue-600">Trilhas</a></li>
                    <li><a href="#" className="hover:text-blue-600">Podcast</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-3">Ferramentas</h4>
                  <ul className="space-y-2 text-xs">
                    <li><a href="#" className="hover:text-blue-600">Planejamento</a></li>
                    <li><a href="#" className="hover:text-blue-600">Dashboard</a></li>
                    <li><a href="#" className="hover:text-blue-600">Mapa</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-3">Suporte</h4>
                  <ul className="space-y-2 text-xs">
                    <li><a href="#" className="hover:text-blue-600">Mentorias</a></li>
                    <li><a href="#" className="hover:text-blue-600">Mensagens</a></li>
                  </ul>
                </div>
              </div>
              <div className="text-center text-xs">
                © 2026 Rede Inspire. Todos os direitos reservados.
              </div>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
