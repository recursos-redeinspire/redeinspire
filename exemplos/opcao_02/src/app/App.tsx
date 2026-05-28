import React, { useState } from 'react';
import { Option1 } from './components/Option1';
import { Option2 } from './components/Option2';
import { Option3 } from './components/Option3';
import { Monitor, Moon, Feather } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <div className="relative min-h-screen w-full font-sans text-slate-900 bg-white">
      {/* Dynamic Content */}
      <div className="w-full h-full">
        {activeTab === 1 && <Option1 />}
        {activeTab === 2 && <Option2 />}
        {activeTab === 3 && <Option3 />}
      </div>

      {/* Floating Theme Switcher */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-white/90 backdrop-blur-xl p-1.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/50 flex items-center gap-1">
        <button 
          onClick={() => setActiveTab(1)} 
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 
            ${activeTab === 1 ? 'bg-slate-900 text-white shadow-md scale-100' : 'text-slate-600 hover:bg-slate-100 scale-95 hover:scale-100'}`}
        >
          <Monitor size={16} /> 
          <span className="hidden sm:inline">Opção 1 (SaaS/Tech)</span>
          <span className="sm:hidden">1</span>
        </button>
        
        <button 
          onClick={() => setActiveTab(2)} 
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 
            ${activeTab === 2 ? 'bg-fuchsia-600 text-white shadow-md scale-100' : 'text-slate-600 hover:bg-slate-100 scale-95 hover:scale-100'}`}
        >
          <Moon size={16} /> 
          <span className="hidden sm:inline">Opção 2 (Dark/Criativa)</span>
          <span className="sm:hidden">2</span>
        </button>
        
        <button 
          onClick={() => setActiveTab(3)} 
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 
            ${activeTab === 3 ? 'bg-[#2C2C2C] text-[#F5F2EC] shadow-md scale-100' : 'text-slate-600 hover:bg-slate-100 scale-95 hover:scale-100'}`}
        >
          <Feather size={16} /> 
          <span className="hidden sm:inline">Opção 3 (Elegante/Editorial)</span>
          <span className="sm:hidden">3</span>
        </button>
      </div>
    </div>
  );
}
