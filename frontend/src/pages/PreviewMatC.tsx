import { useNavigate } from 'react-router-dom'

/**
 * Preview C — "Mais Baixados" integrado como primeira row com badge de ranking
 * Layout unificado tipo Life.Church/Open Network
 */
export default function PreviewMatC() {
  const navigate = useNavigate()
  const topItems = ['30 Semanas', 'Feminina', 'Mensagens Avulsas', 'Campanhas', 'Liderança']
  const contentItems = ['Células', 'Jovens', 'Infantil', 'Retiros', 'Propósitos', 'Mentoria', 'Webinar', 'Gestão', 'Missões', 'Casais', 'Homens', 'Mulheres']

  return (
    <div className="py-8 max-w-6xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Materiais</h1>
      <p className="text-sm text-gray-500 mb-8">Recursos para seu ministério</p>

      {/* Mais Baixados — row com badge integrado, mesmo visual dos cards normais */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-gray-900">🔥 Mais baixados</h2>
          <span className="text-[11px] text-gray-400">Top 5 da semana</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {topItems.map((name, i) => (
            <div key={name} className="group cursor-pointer">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-slate-600 to-slate-700 mb-2.5 group-hover:scale-[1.03] transition-transform shadow-sm group-hover:shadow-md">
                <div className="w-full h-full flex items-center justify-center px-3">
                  <span className="text-white/90 font-semibold text-[13px] text-center">{name}</span>
                </div>
                {/* Ranking badge */}
                <div className="absolute -bottom-1 -left-1 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <span className="text-white text-[11px] font-bold">{i + 1}</span>
                </div>
              </div>
              <h3 className="font-semibold text-[13px] text-gray-900 mt-1 group-hover:text-green-700 transition">{name}</h3>
              <p className="text-[10px] text-gray-400">treinamento</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-100 my-6" />

      {/* Conteúdos — grid padrão com visual limpo */}
      <section>
        <h2 className="text-[15px] font-bold text-gray-900 mb-4">Todos os conteúdos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {contentItems.map(name => (
            <div key={name} className="group cursor-pointer">
              <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-gray-500 to-gray-600 mb-2.5 group-hover:scale-[1.02] transition-transform">
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white/80 font-medium text-sm">{name}</span>
                </div>
              </div>
              <h3 className="font-semibold text-[13px] text-gray-900 group-hover:text-green-700 transition">{name}</h3>
              <p className="text-[11px] text-gray-500">Materiais</p>
              <p className="text-[10px] text-gray-400">ministério · recursos</p>
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
