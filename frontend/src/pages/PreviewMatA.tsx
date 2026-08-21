import { useNavigate } from 'react-router-dom'

/**
 * Preview A — "Mais Baixados" como banner horizontal grande (1 destaque + 4 menores)
 * Inspirado no Netflix/Spotify com destaque hero para o mais baixado
 */
export default function PreviewMatA() {
  const navigate = useNavigate()
  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Materiais</h1>
      <p className="text-sm text-gray-500 mb-8">Recursos para seu ministério</p>

      {/* Mais Baixados — Hero + grid */}
      <section className="mb-10">
        <h2 className="text-[15px] font-bold text-gray-900 mb-4">🔥 Mais baixados</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Hero - primeiro item grande */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-green-600 to-emerald-700 cursor-pointer group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">#1 Mais baixado</span>
              <h3 className="text-xl font-bold text-white mt-2">30 Semanas</h3>
              <p className="text-white/70 text-sm mt-1">Treinamento completo de discipulado</p>
            </div>
          </div>
          {/* Grid 2x2 dos outros */}
          <div className="grid grid-cols-2 gap-3">
            {['Feminina', 'Mensagens Avulsas', 'Campanhas', 'Liderança'].map((name, i) => (
              <div key={name} className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-gray-500 to-gray-700 cursor-pointer group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white/80 font-semibold text-sm text-center px-2">{name}</span>
                </div>
                <div className="absolute top-2 left-2 bg-black/40 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">#{i + 2}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conteúdos — grid normal */}
      <section>
        <h2 className="text-[15px] font-bold text-gray-900 mb-4">Conteúdos disponíveis</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {['Células', 'Jovens', 'Infantil', 'Retiros', 'Propósitos', 'Mentoria', 'Webinar', 'Gestão', 'Missões', 'Casais', 'Homens', 'Mulheres'].map(name => (
            <div key={name} className="group cursor-pointer">
              <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-slate-500 to-slate-600 mb-2.5 group-hover:scale-[1.02] transition-transform">
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white/80 font-medium text-sm">{name}</span>
                </div>
              </div>
              <h3 className="font-semibold text-[13px] text-gray-900 group-hover:text-green-700 transition">{name}</h3>
              <p className="text-[10px] text-gray-400">Materiais</p>
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
