import { useNavigate } from 'react-router-dom'

/**
 * Preview B — "Mais Baixados" como carrossel horizontal com cards maiores
 * Layout tipo App Store com scroll horizontal
 */
export default function PreviewMatB() {
  const navigate = useNavigate()
  return (
    <div className="py-8 max-w-6xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Materiais</h1>
      <p className="text-sm text-gray-500 mb-8">Recursos para seu ministério</p>

      {/* Mais Baixados — Scroll horizontal */}
      <section className="mb-10">
        <h2 className="text-[15px] font-bold text-gray-900 mb-4">🔥 Mais baixados</h2>
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
          {['30 Semanas', 'Feminina', 'Mensagens Avulsas', 'Campanhas', 'Liderança'].map((name, i) => (
            <div key={name} className="shrink-0 w-[280px] cursor-pointer group">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-600 to-slate-800 shadow-lg group-hover:shadow-xl transition-shadow">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-lg text-center px-4">{name}</span>
                </div>
                <div className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center">{i + 1}</div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                  <p className="text-white/70 text-xs">Materiais disponíveis</p>
                </div>
              </div>
              <h3 className="font-semibold text-[14px] text-gray-900 mt-3 group-hover:text-green-700 transition">{name}</h3>
              <p className="text-[11px] text-gray-400">treinamento · discipulado</p>
            </div>
          ))}
        </div>
      </section>

      {/* Conteúdos — grid com cards maiores (3 colunas) */}
      <section>
        <h2 className="text-[15px] font-bold text-gray-900 mb-4">Conteúdos disponíveis</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {['Células', 'Jovens', 'Infantil', 'Retiros', 'Propósitos', 'Mentoria', 'Webinar', 'Gestão', 'Missões'].map(name => (
            <div key={name} className="group cursor-pointer">
              <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-gray-500 to-gray-700 mb-3 group-hover:scale-[1.01] transition-transform shadow-sm group-hover:shadow-md">
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white/80 font-semibold text-base">{name}</span>
                </div>
              </div>
              <h3 className="font-bold text-[15px] text-gray-900 group-hover:text-green-700 transition">{name}</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Materiais</p>
              <p className="text-[10px] text-gray-400 mt-0.5">ministério · recursos</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 text-center">
        <button onClick={() => navigate('/materiais')} className="text-sm text-green-600 hover:text-green-800 font-medium">← Voltar ao materiais real</button>
      </div>
    </div>
  )
}
