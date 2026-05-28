import React from 'react';
import { Search, Bell, Star, Home, BookOpen, Map, Users, Calendar, FileText, MapPin, LayoutDashboard, UserPlus, Settings, Play, ChevronRight, Award, GraduationCap } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { mockData } from './data';

const getIcon = (name: string) => {
  const icons: any = { Home, BookOpen, Map, Users, Calendar, FileText, MapPin, LayoutDashboard, UserPlus, Settings };
  const Icon = icons[name] || Home;
  return <Icon className="w-4 h-4" />;
};

export function Option3() {
  return (
    <div className="flex h-screen bg-[#F5F2EC] text-[#2C2C2C] font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#EBE7DF] border-r border-[#2C2C2C]/10 flex flex-col h-full overflow-y-auto hidden md:flex">
        <div className="p-8 flex items-center justify-center border-b border-[#2C2C2C]/10">
          <div className="text-center">
            <h1 className="font-serif text-xl tracking-wide">INSPIRE</h1>
            <p className="text-[9px] font-sans tracking-widest uppercase mt-1 opacity-60">São Paulo</p>
          </div>
        </div>
        
        <div className="flex-1 py-6">
          {mockData.sidebarLinks.map((group, idx) => (
            <div key={idx} className="mb-8 px-6">
              {group.section && (
                <h3 className="text-[9px] font-sans uppercase tracking-[0.2em] opacity-50 mb-3">{group.section}</h3>
              )}
              <div className="space-y-1">
                {group.items.map((item, i) => (
                  <button 
                    key={i}
                    className={`w-full flex items-center gap-4 px-3 py-2 text-xs transition-opacity ${
                      item.active 
                        ? 'font-medium opacity-100' 
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <span className="opacity-50">
                      {getIcon(item.icon)}
                    </span>
                    <span className="tracking-wide">{item.label}</span>
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
        <header className="h-20 border-b border-[#2C2C2C]/10 flex items-center justify-between px-10 flex-shrink-0 bg-[#F5F2EC]">
          <div className="flex-1 max-w-md flex items-center border-b border-[#2C2C2C]/20 pb-1">
            <Search className="w-4 h-4 opacity-50" />
            <input 
              type="text" 
              placeholder="Search curriculum..." 
              className="bg-transparent border-none focus:outline-none ml-3 text-sm w-full font-serif italic placeholder-[#2C2C2C]/40"
            />
          </div>
          <div className="flex items-center gap-8 ml-4">
            <span className="text-[10px] font-sans uppercase tracking-widest opacity-60 cursor-pointer hover:opacity-100 transition-opacity">PT / EN</span>
            <Bell className="w-4 h-4 opacity-60 cursor-pointer hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-2 text-xs font-sans tracking-wide">
              <span className="opacity-60">Points</span>
              <span className="font-medium">{mockData.user.points}</span>
            </div>
            <ImageWithFallback src={mockData.user.avatar} alt="User" className="w-8 h-8 rounded-full grayscale hover:grayscale-0 transition-all" />
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-10 border-b border-[#2C2C2C]/10 pb-6">
              <h1 className="text-3xl md:text-4xl font-serif">
                Welcome, {mockData.user.name}.
              </h1>
              <button className="text-[10px] font-sans uppercase tracking-widest hover:opacity-60 transition-opacity flex items-center gap-2">
                View Catalogue <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Editorial Hero Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
              <div className="lg:col-span-8 group cursor-pointer">
                <div className="relative aspect-[16/9] overflow-hidden bg-[#EBE7DF] mb-4">
                  <ImageWithFallback src={mockData.images.mainWebinar} alt="Main" className="w-full h-full object-cover grayscale opacity-90 mix-blend-multiply group-hover:scale-105 group-hover:grayscale-0 transition-all duration-1000" />
                  <div className="absolute top-4 left-4 bg-[#2C2C2C] text-[#F5F2EC] text-[9px] uppercase tracking-widest px-2 py-1">New</div>
                </div>
                <h2 className="text-2xl font-serif leading-tight mb-2 group-hover:opacity-70 transition-opacity">
                  Recursos Financeiros x Prioridades na Igreja
                </h2>
                <p className="text-sm font-sans opacity-60 tracking-wide">Webinar • Pr. Yan Lima</p>
              </div>
              
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="group cursor-pointer">
                  <div className="relative aspect-video overflow-hidden bg-[#EBE7DF] mb-3">
                    <ImageWithFallback src={mockData.images.subWebinar1} alt="Sub 1" className="w-full h-full object-cover grayscale opacity-80 mix-blend-multiply group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <h3 className="text-base font-serif leading-snug group-hover:opacity-70 transition-opacity">Consolidar as Bases</h3>
                  <p className="text-xs font-sans opacity-60 mt-1">Marcos Sanches</p>
                </div>
                <div className="group cursor-pointer">
                  <div className="relative aspect-video overflow-hidden bg-[#EBE7DF] mb-3">
                    <ImageWithFallback src={mockData.images.subWebinar2} alt="Sub 2" className="w-full h-full object-cover grayscale opacity-80 mix-blend-multiply group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <h3 className="text-base font-serif leading-snug group-hover:opacity-70 transition-opacity">Liderança em Tempos de Crise</h3>
                  <p className="text-xs font-sans opacity-60 mt-1">Pr. Carlos Silva</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column */}
              <div className="lg:col-span-8 space-y-12">
                
                {/* Alert Banner */}
                <div className="border border-[#2C2C2C] p-6 flex flex-col sm:flex-row items-center justify-between">
                  <div>
                    <h4 className="font-serif text-lg">New to the platform?</h4>
                    <p className="text-sm opacity-60 font-sans italic mt-1">Watch our introductory training videos.</p>
                  </div>
                  <button className="mt-4 sm:mt-0 bg-[#2C2C2C] text-[#F5F2EC] text-[10px] uppercase tracking-widest px-6 py-3 hover:bg-[#2C2C2C]/80 transition-colors">
                    Start Learning
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Top Materials */}
                  <div>
                    <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] mb-6 border-b border-[#2C2C2C]/10 pb-4">Top Materials</h3>
                    <div className="space-y-0">
                      {mockData.topMaterials.slice(0, 5).map((item, idx) => (
                        <div key={item.id} className="flex items-start gap-4 py-3 border-b border-[#2C2C2C]/5 group cursor-pointer">
                          <span className="font-serif text-sm opacity-40 group-hover:opacity-100 transition-opacity w-4">0{idx + 1}</span>
                          <span className="text-sm font-sans tracking-wide group-hover:opacity-60 transition-opacity">{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Content */}
                  <div>
                    <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] mb-6 border-b border-[#2C2C2C]/10 pb-4">Top Content</h3>
                    <div className="space-y-0">
                      {mockData.topContent.slice(0, 5).map((item, idx) => (
                        <div key={item.id} className="flex items-start gap-4 py-3 border-b border-[#2C2C2C]/5 group cursor-pointer">
                          <span className="font-serif text-sm opacity-40 group-hover:opacity-100 transition-opacity w-4">0{idx + 1}</span>
                          <span className="text-sm font-sans tracking-wide group-hover:opacity-60 transition-opacity line-clamp-1">{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Content */}
                <div>
                  <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] mb-6 border-b border-[#2C2C2C]/10 pb-4 flex justify-between">
                    <span>Recent Additions</span>
                    <span className="cursor-pointer hover:opacity-60 transition-opacity">View All</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {mockData.images.recent.map((img, i) => (
                      <div key={i} className="group cursor-pointer">
                        <div className="relative aspect-[3/4] overflow-hidden bg-[#EBE7DF] mb-3">
                          <ImageWithFallback src={img} alt="Recent" className="w-full h-full object-cover grayscale opacity-80 mix-blend-multiply group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700" />
                        </div>
                        <h4 className="text-xs font-serif leading-snug line-clamp-2 group-hover:opacity-60 transition-opacity">Gestão ágil nas igrejas {i+1}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (Widgets) */}
              <div className="lg:col-span-4 space-y-12">
                
                {/* Ranking Widget */}
                <div>
                  <div className="bg-[#2C2C2C] text-[#F5F2EC] p-8 mb-8 text-center">
                    <span className="font-sans text-[9px] uppercase tracking-[0.2em] opacity-60 block mb-2">Your Score</span>
                    <h3 className="font-serif text-5xl">{mockData.user.points}</h3>
                  </div>
                  
                  <h4 className="font-sans text-[10px] uppercase tracking-[0.2em] mb-4 border-b border-[#2C2C2C]/10 pb-4">Community Leaders</h4>
                  <div className="space-y-4">
                    {mockData.topUsers.map((user, i) => (
                      <div key={i} className="flex justify-between items-center text-sm font-sans">
                        <div className="flex items-center gap-4">
                          <span className="font-serif italic opacity-40 text-xs w-3">{i+1}</span>
                          <span className="tracking-wide">{user.name}</span>
                        </div>
                        <span className="font-serif">{user.points}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mini Events */}
                <div>
                  <h4 className="font-sans text-[10px] uppercase tracking-[0.2em] mb-6 border-b border-[#2C2C2C]/10 pb-4">Upcoming Schedule</h4>
                  <div className="space-y-6">
                    <div className="group cursor-pointer">
                      <span className="text-[9px] font-sans uppercase tracking-[0.2em] opacity-50 block mb-1">Mar 15, 19:00</span>
                      <h4 className="font-serif text-lg mb-1 group-hover:opacity-60 transition-opacity">Liderança em Tempos</h4>
                      <p className="text-xs font-sans opacity-60">Pr. Carlos Silva</p>
                    </div>

                    <div className="group cursor-pointer">
                      <span className="text-[9px] font-sans uppercase tracking-[0.2em] opacity-50 block mb-1">Apr 04, 22:29</span>
                      <h4 className="font-serif text-lg mb-1 group-hover:opacity-60 transition-opacity">Mentoria Exclusiva</h4>
                      <p className="text-xs font-sans opacity-60">Danilo Santos</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            
            <footer className="mt-20 pt-10 border-t border-[#2C2C2C]/10 pb-16 text-center">
              <span className="font-sans text-[9px] uppercase tracking-[0.2em] opacity-40">
                © 2026 Rede Inspire. All Rights Reserved.
              </span>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
