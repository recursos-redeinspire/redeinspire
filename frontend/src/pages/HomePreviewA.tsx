// PREVIEW TEMPORÁRIA — Variação A ("Foco e hierarquia")
// Reaproveita os mesmos dados/hooks da HomePage (useAuth/useData/useNavigate),
// mudando apenas a organização visual. Será removida após a escolha do layout.
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { Play, ArrowRight, Folder, ClockRotateRight, MediaVideo, Restart, PathArrow, FireFlame } from 'iconoir-react'

export default function HomePreviewA() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { getYoutubeCuratedSections, getYoutubeCuration, getAllVideoThumbnails, getRecentActivity } = useData()

  const [videos, setVideos] = useState<any[]>([])
  const [featuredVideoId, setFeaturedVideoId] = useState<string | null>(null)
  const [customThumbnails, setCustomThumbnails] = useState<Record<string, string>>({})
  const [recentItems, setRecentItems] = useState<any[]>([])

  useEffect(() => {
    getYoutubeCuratedSections().then(d => {
      const pool = d.fallback ? (d.sections[0]?.videos || []) : d.sections.flatMap((s: any) => s.videos || [])
      setVideos(pool)
    }).catch(() => {})
    getYoutubeCuration().then(c => setFeaturedVideoId(c.featuredVideoId)).catch(() => {})
    getAllVideoThumbnails().then(data => setCustomThumbnails(data.thumbnails || {})).catch(() => {})
    getRecentActivity().then(r => setRecentItems(r.items || [])).catch(() => {})
  }, [])

  const isAdmin = user?.role === 'admin'

  // "Continue de onde parou": trilhas só para admin (igual à Home).
  const recentFiltered = recentItems.filter(it => it.type !== 'trail' || isAdmin).slice(0, 4)
  const recentTypeLabel = (type: string) => type === 'video' ? 'Vídeo' : type === 'material' ? 'Material' : 'Trilha'
  const openRecent = (it: any) => {
    if (it.type === 'video') navigate(`/catalogo?video=${it.refId}`)
    else if (it.type === 'material') navigate(`/materiais?path=${encodeURIComponent(it.path || it.refId)}`)
    else navigate('/trilhas')
  }

  const thumb = (v: any) => customThumbnails[v.id] || v.thumbnail
  const resolveFeatured = (pool: any[], id: string | null) =>
    pool.find(v => v.id === id) ?? [...pool].sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)))[0] ?? null
  const featured = resolveFeatured(videos, featuredVideoId)
  const rest = videos.filter(v => v.id !== featured?.id)
  const moreVideos = rest.slice(0, 4) // Vídeos recentes

  // "Continuar": navega para o último item recente, se houver; senão /catalogo.
  const lastRecent = recentFiltered[0]
  const continuar = () => (lastRecent ? openRecent(lastRecent) : navigate('/catalogo'))

  const bigActions = [
    { label: 'Assistir vídeos', desc: 'Explore o catálogo completo', icon: <MediaVideo width={24} height={24} strokeWidth={1.5} />, onClick: () => navigate('/catalogo') },
    { label: 'Explorar recursos', desc: 'Materiais e downloads', icon: <Folder width={24} height={24} strokeWidth={1.5} />, onClick: () => navigate('/materiais') },
    { label: 'Continuar', desc: lastRecent ? 'Retome de onde parou' : 'Comece a assistir', icon: <Restart width={24} height={24} strokeWidth={1.5} />, onClick: continuar },
  ]

  return (
    <div className="space-y-10">
      {/* Saudação */}
      <div>
        <h1 className="text-[24px] md:text-[30px] font-bold text-gray-900 tracking-tight">Bem-vindo, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-[14px] text-gray-400 mt-1.5">O que você quer fazer hoje?</p>
      </div>

      {/* 3 ações grandes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {bigActions.map(a => (
          <button
            key={a.label}
            onClick={a.onClick}
            className="group text-left rounded-2xl border border-gray-100 bg-white p-6 hover:border-blue-200 hover:shadow-md transition flex flex-col gap-4"
          >
            <span className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">{a.icon}</span>
            <div>
              <p className="text-[16px] font-bold text-gray-900">{a.label}</p>
              <p className="text-[12px] text-gray-400 mt-1">{a.desc}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[13px] text-blue-600 font-semibold group-hover:gap-2.5 transition-all">
              Abrir <ArrowRight width={14} height={14} strokeWidth={1.5} />
            </span>
          </button>
        ))}
      </div>

      {/* Destaque grande único: vídeo featured, largura total */}
      {featured && (
        <div
          className="relative rounded-3xl overflow-hidden group cursor-pointer shadow-lg shadow-slate-900/5 aspect-[16/9] md:aspect-[3/1]"
          onClick={() => navigate(`/catalogo?video=${featured.id}`)}
        >
          <img src={thumb(featured)} alt="" className="w-full h-full object-cover object-[center_30%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-blue-900/20 to-transparent" />
          <div className="absolute top-4 left-5 md:top-6 md:left-8">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-blue-600 text-white px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-blue-600/30"><FireFlame width={13} height={13} strokeWidth={1.5} /> Conteúdo em Destaque</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <h2 className="text-[20px] md:text-[26px] font-bold text-white leading-snug max-w-[720px]">{featured.title}</h2>
            <p className="text-[12px] md:text-[13px] text-white/60 mt-2">{featured.channelTitle || 'Rede Inspire'}</p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/90 shadow-2xl flex items-center justify-center hover:scale-110 transition-transform">
              <Play width={26} height={26} strokeWidth={1.5} className="text-blue-600 ml-1" />
            </div>
          </div>
        </div>
      )}

      {/* Continue de onde parou */}
      {recentFiltered.length > 0 && (
        <section>
          <h2 className="text-[17px] font-bold text-gray-900 flex items-center gap-2 mb-5"><ClockRotateRight width={18} height={18} strokeWidth={1.5} className="text-slate-400" /> Continue de onde parou</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentFiltered.map(it => (
              <button
                key={`${it.type}-${it.refId}`}
                onClick={() => openRecent(it)}
                className="group text-left bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-blue-200 transition flex flex-col gap-3"
              >
                <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  {it.type === 'video' ? <MediaVideo width={13} height={13} strokeWidth={1.5} /> : it.type === 'material' ? <Folder width={13} height={13} strokeWidth={1.5} /> : <PathArrow width={13} height={13} strokeWidth={1.5} />}
                  {recentTypeLabel(it.type)}
                </div>
                <p className="text-[13px] font-semibold text-gray-800 line-clamp-2 leading-snug flex-1">{it.title || recentTypeLabel(it.type)}</p>
                <span className="inline-flex items-center gap-1.5 text-[12px] text-blue-600 font-semibold group-hover:gap-2.5 transition-all">
                  Retomar <ArrowRight width={13} height={13} strokeWidth={1.5} />
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Vídeos recentes */}
      {moreVideos.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[17px] font-bold text-gray-900 flex items-center gap-2"><MediaVideo width={18} height={18} strokeWidth={1.5} className="text-slate-400" /> Vídeos recentes</h2>
            <button onClick={() => navigate('/catalogo')} className="text-[12px] text-blue-600 font-semibold">Ver todos →</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {moreVideos.map(video => (
              <div key={video.id} onClick={() => navigate(`/catalogo?video=${video.id}`)} className="group cursor-pointer">
                <div className="relative rounded-xl overflow-hidden shadow-sm">
                  <img src={thumb(video)} alt="" className="w-full aspect-video object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <div className="w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center"><Play width={12} height={12} strokeWidth={1.5} className="text-blue-600 ml-0.5" /></div>
                  </div>
                </div>
                <p className="text-[12px] font-medium text-gray-800 mt-2 line-clamp-2 leading-snug">{video.title}</p>
                <p className="text-[11px] text-gray-400 mt-1">{video.channelTitle || 'Rede Inspire'}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
