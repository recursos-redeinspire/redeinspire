import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { Play, PlaySolid, ArrowRight, NavArrowLeft, NavArrowRight, Folder, MediaVideo, Flash, Download, ClockRotateRight } from 'iconoir-react'

// PREVIEW TEMPORÁRIA — "Do zero" (redesign premium/cinemático).
// Hero full-bleed com gradiente e tipografia marcante + trilhos horizontais
// (overflow-x com scroll-snap) para Continue, Recentes, Top Vídeos e Top Materiais.
// Usa os mesmos dados reais da Home. Será removida após a escolha do cliente.
export default function HomePreview2() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const {
    getYoutubeCuratedSections, getYoutubeCuration, getTopDownloads,
    getAllVideoThumbnails, getFolderThumbnails, getFolderCovers, getFolderDates,
    getVideoViews, getRecentActivity,
  } = useData()

  const [videos, setVideos] = useState<any[]>([])
  const [featuredVideoId, setFeaturedVideoId] = useState<string | null>(null)
  const [topDownloads, setTopDownloads] = useState<any[]>([])
  const [customThumbnails, setCustomThumbnails] = useState<Record<string, string>>({})
  const [resourceCovers, setResourceCovers] = useState<Record<string, string>>({})
  const [folderDates, setFolderDates] = useState<Record<string, string>>({})
  const [views, setViews] = useState<Record<string, number>>({})
  const [recentItems, setRecentItems] = useState<any[]>([])

  useEffect(() => {
    getYoutubeCuratedSections().then(d => {
      const sections = d.fallback ? [{ title: null, videos: d.sections[0]?.videos || [] }] : d.sections
      const pool = sections.flatMap((s: any) => s.videos || [])
      setVideos(pool)
    }).catch(() => {})
    getYoutubeCuration().then(c => setFeaturedVideoId(c.featuredVideoId)).catch(() => {})
    getTopDownloads().then(setTopDownloads).catch(() => {})
    getAllVideoThumbnails().then(data => setCustomThumbnails(data.thumbnails || {})).catch(() => {})
    getVideoViews().then(r => setViews(r.views || {})).catch(() => setViews({}))
    getRecentActivity().then(r => setRecentItems(r.items || [])).catch(() => {})
    getFolderDates().then(r => {
      const map: Record<string, string> = {}
      for (const [k, v] of Object.entries(r.dates || {})) map[k.toLowerCase()] = v as string
      setFolderDates(map)
    }).catch(() => {})
    Promise.all([getFolderThumbnails().catch(() => ({ thumbnails: {} })), getFolderCovers().catch(() => ({ covers: {} }))])
      .then(([tn, cv]) => {
        const map: Record<string, string> = {}
        for (const [k, v] of Object.entries((cv as any).covers || {})) map[k.toLowerCase()] = v as string
        for (const [k, v] of Object.entries((tn as any).thumbnails || {})) {
          const url = v as string
          if (url && !url.includes('dropboxusercontent.com')) map[k.toLowerCase()] = url
        }
        setResourceCovers(map)
      }).catch(() => {})
  }, [])

  // ---- helpers (copiados da Home atual; página temporária) ----
  const thumb = (v: any) => customThumbnails[v.id] || v.thumbnail
  const resourceGradients = [
    ['#1e3a5f', '#2563eb'], ['#1e293b', '#334155'], ['#1d4ed8', '#1e40af'],
    ['#0f172a', '#1e3a5f'], ['#334155', '#475569'], ['#1e40af', '#3b82f6'],
  ]
  const resourceHash = (name: string) => name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const resourceColors = (name: string) => resourceGradients[resourceHash(name) % resourceGradients.length]
  const resourceInitials = (name: string) => name.split(/[\s\-_]+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || '#'
  const resourceName = (item: any) => item.folderName || (item.folderPath ? item.folderPath.split('/').pop() : '') || ''
  const resourceAccesses = (item: any) => (item.views || 0) + (item.downloads || 0)
  const openResource = (item: any) => navigate(`/materiais?path=${encodeURIComponent(item.folderPath || '')}`)
  const resourceCover = (item: any): string | null => {
    const p = (item?.folderPath || '').toLowerCase()
    return p ? (resourceCovers[p] || null) : null
  }
  const openVideo = (id: string) => navigate(`/catalogo?video=${id}`)

  const resolveFeatured = (pool: any[], id: string | null) =>
    pool.find(v => v.id === id) ?? [...pool].sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)))[0] ?? null
  const featured = resolveFeatured(videos, featuredVideoId)

  // Recentes (vídeos + materiais) por data desc
  const recentMix = (() => {
    const vids = videos.map(v => ({
      key: `v-${v.id}`, kind: 'video' as const, title: v.title, subtitle: v.channelTitle || 'Rede Inspire',
      cover: thumb(v) as string | null, initials: '', grad: ['#0f172a', '#1e3a5f'] as [string, string],
      date: v.publishedAt ? new Date(v.publishedAt).getTime() : 0, onClick: () => openVideo(v.id),
    }))
    const mats = topDownloads.map(m => {
      const name = resourceName(m)
      const iso = folderDates[(m.folderPath || '').toLowerCase()]
      return {
        key: `m-${m.folderPath || m.rank}`, kind: 'material' as const, title: name, subtitle: 'Material',
        cover: resourceCover(m), initials: resourceInitials(name), grad: resourceColors(name) as [string, string],
        date: iso ? new Date(iso).getTime() : 0, onClick: () => openResource(m),
      }
    })
    return [...vids, ...mats].sort((a, b) => b.date - a.date).slice(0, 10)
  })()

  // Top vídeos por views reais (fallback: ordem das seções)
  const topVideos = (() => {
    const withViews = [...videos].sort((a, b) => (views[b.id] || 0) - (views[a.id] || 0))
    const anyViews = videos.some(v => (views[v.id] || 0) > 0)
    return (anyViews ? withViews : videos).slice(0, 10)
  })()
  const topMaterials = topDownloads.slice(0, 10)

  // Continue de onde parou
  const isAdmin = user?.role === 'admin'
  const recentActivity = recentItems.filter(it => it.type !== 'trail' || isAdmin).slice(0, 10)
  const openRecent = (it: any) => {
    if (it.type === 'video') navigate(`/catalogo?video=${it.refId}`)
    else if (it.type === 'material') navigate(`/materiais?path=${encodeURIComponent(it.path || it.refId)}`)
    else navigate('/trilhas')
  }

  // ---- Trilho horizontal com scroll-snap + setas ----
  const Rail = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => {
    const ref = useRef<HTMLDivElement>(null)
    const scroll = (dir: 'left' | 'right') => {
      const el = ref.current
      if (!el) return
      el.scrollBy({ left: dir === 'left' ? -el.clientWidth * 0.8 : el.clientWidth * 0.8, behavior: 'smooth' })
    }
    return (
      <section className="group/rail">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-[17px] md:text-[19px] font-bold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <span className="text-blue-600">{icon}</span> {title}
          </h2>
          <div className="hidden md:flex items-center gap-2 opacity-0 group-hover/rail:opacity-100 transition-opacity">
            <button onClick={() => scroll('left')} aria-label="Anterior" className="w-9 h-9 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-500 flex items-center justify-center transition">
              <NavArrowLeft width={20} height={20} strokeWidth={1.5} />
            </button>
            <button onClick={() => scroll('right')} aria-label="Próximo" className="w-9 h-9 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-500 flex items-center justify-center transition">
              <NavArrowRight width={20} height={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <div
          ref={ref}
          className="flex gap-5 overflow-x-auto pb-3 px-1 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none' }}
        >
          {children}
        </div>
      </section>
    )
  }

  // Card de vídeo para os trilhos
  const VideoCard = ({ v, badge }: { v: any; badge?: string }) => (
    <div
      onClick={() => openVideo(v.id)}
      className="snap-start shrink-0 w-[260px] md:w-[300px] group/card cursor-pointer"
    >
      <div className="relative rounded-2xl overflow-hidden shadow-md shadow-slate-900/10 aspect-video transition-transform duration-300 group-hover/card:-translate-y-1 group-hover/card:shadow-xl group-hover/card:shadow-slate-900/20">
        <img src={thumb(v)} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
        {badge && <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-600 text-white uppercase tracking-wider">{badge}</span>}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition">
          <div className="w-12 h-12 rounded-full bg-white/95 shadow-xl flex items-center justify-center">
            <PlaySolid width={20} height={20} className="text-blue-600 ml-0.5" />
          </div>
        </div>
      </div>
      <h3 className="text-[14px] font-semibold text-slate-800 mt-3 line-clamp-2 leading-snug">{v.title}</h3>
      <p className="text-[12px] text-slate-400 mt-1">{(views[v.id] || 0) > 0 ? `${views[v.id]} ${views[v.id] === 1 ? 'visualização' : 'visualizações'}` : (v.channelTitle || 'Rede Inspire')}</p>
    </div>
  )

  // Card de material para os trilhos
  const MaterialCard = ({ item }: { item: any }) => {
    const name = resourceName(item)
    const [rc1, rc2] = resourceColors(name)
    const accesses = resourceAccesses(item)
    const cover = resourceCover(item)
    return (
      <div
        onClick={() => openResource(item)}
        className="snap-start shrink-0 w-[260px] md:w-[300px] group/card cursor-pointer"
      >
        <div className="relative rounded-2xl overflow-hidden shadow-md shadow-slate-900/10 aspect-video transition-transform duration-300 group-hover/card:-translate-y-1 group-hover/card:shadow-xl group-hover/card:shadow-slate-900/20">
          {cover ? (
            <img src={cover} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${rc1}, ${rc2})` }}>
              <span className="text-[34px] font-bold text-white tracking-tight">{resourceInitials(name)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm uppercase tracking-wider"><Folder width={11} height={11} strokeWidth={1.5} /> Material</span>
        </div>
        <h3 className="text-[14px] font-semibold text-slate-800 mt-3 line-clamp-2 leading-snug">{name}</h3>
        <p className="text-[12px] text-slate-400 mt-1">{accesses > 0 ? `${accesses} ${accesses === 1 ? 'acesso' : 'acessos'}` : 'Material'}</p>
      </div>
    )
  }

  // Card misto (recentes)
  const MixCard = ({ it }: { it: typeof recentMix[number] }) => (
    <div onClick={it.onClick} className="snap-start shrink-0 w-[260px] md:w-[300px] group/card cursor-pointer">
      <div className="relative rounded-2xl overflow-hidden shadow-md shadow-slate-900/10 aspect-video transition-transform duration-300 group-hover/card:-translate-y-1 group-hover/card:shadow-xl group-hover/card:shadow-slate-900/20">
        {it.cover ? (
          <img src={it.cover} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${it.grad[0]}, ${it.grad[1]})` }}>
            <span className="text-[34px] font-bold text-white tracking-tight">{it.initials}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm uppercase tracking-wider">
          {it.kind === 'video' ? <MediaVideo width={11} height={11} strokeWidth={1.5} /> : <Folder width={11} height={11} strokeWidth={1.5} />}
          {it.kind === 'video' ? 'Vídeo' : 'Material'}
        </span>
      </div>
      <h3 className="text-[14px] font-semibold text-slate-800 mt-3 line-clamp-2 leading-snug">{it.title}</h3>
      <p className="text-[12px] text-slate-400 mt-1">{it.subtitle}</p>
    </div>
  )

  return (
    <div className="space-y-12 -mx-4 md:-mx-8">
      {/* HERO full-bleed cinemático */}
      {featured && (
        <section className="relative w-full min-h-[460px] md:min-h-[560px] flex items-end overflow-hidden">
          <img src={thumb(featured)} alt="" className="absolute inset-0 w-full h-full object-cover object-[center_25%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/30 to-transparent" />
          <div className="relative z-10 px-6 md:px-14 pb-14 md:pb-20 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-blue-600 text-white px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-blue-600/40">
              <Flash width={13} height={13} strokeWidth={1.5} /> Destaque da plataforma
            </span>
            <h1 className="text-[34px] md:text-[54px] font-extrabold text-white leading-[1.05] mt-5 tracking-tight drop-shadow-xl">{featured.title}</h1>
            <p className="text-[14px] md:text-[16px] text-white/70 mt-4 max-w-xl">{featured.channelTitle || 'Rede Inspire'}</p>
            <div className="flex items-center gap-3 mt-7">
              <button
                onClick={() => openVideo(featured.id)}
                className="inline-flex items-center gap-2.5 bg-white text-slate-900 font-bold px-7 py-3.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition text-[14px] shadow-xl"
              >
                <PlaySolid width={20} height={20} /> Assistir agora
              </button>
              <button
                onClick={() => navigate('/catalogo')}
                className="inline-flex items-center gap-2 border border-white/40 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-white/10 transition text-[14px] backdrop-blur-sm"
              >
                Explorar catálogo <ArrowRight width={16} height={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Saudação */}
      <div className="px-5 md:px-9">
        <h2 className="text-[20px] md:text-[24px] font-bold text-slate-900 tracking-tight">Bem-vindo de volta, {user?.name?.split(' ')[0]}</h2>
        <p className="text-[13px] text-slate-400 mt-1">Continue sua jornada ou descubra o que há de novo na Rede Inspire.</p>
      </div>

      {/* Trilhos */}
      <div className="px-4 md:px-8 space-y-12">
        {recentActivity.length > 0 && (
          <Rail title="Continue de onde parou" icon={<ClockRotateRight width={20} height={20} strokeWidth={1.5} />}>
            {recentActivity.map(it => (
              <div
                key={`${it.type}-${it.refId}`}
                onClick={() => openRecent(it)}
                className="snap-start shrink-0 w-[260px] md:w-[300px] group/card cursor-pointer"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-md shadow-slate-900/10 aspect-video bg-slate-800 transition-transform duration-300 group-hover/card:-translate-y-1 group-hover/card:shadow-xl">
                  {it.thumb ? (
                    <img src={it.thumb} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                      {it.type === 'video' ? <MediaVideo width={30} height={30} strokeWidth={1.5} className="text-white/50" /> : <Folder width={30} height={30} strokeWidth={1.5} className="text-white/50" />}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white">
                    <Play width={14} height={14} strokeWidth={1.5} /> Retomar
                  </span>
                </div>
                <h3 className="text-[14px] font-semibold text-slate-800 mt-3 line-clamp-2 leading-snug">{it.title || (it.type === 'video' ? 'Vídeo' : 'Material')}</h3>
              </div>
            ))}
          </Rail>
        )}

        {recentMix.length > 0 && (
          <Rail title="Recentes" icon={<Flash width={20} height={20} strokeWidth={1.5} />}>
            {recentMix.map(it => <MixCard key={it.key} it={it} />)}
          </Rail>
        )}

        {topVideos.length > 0 && (
          <Rail title="Top Vídeos" icon={<MediaVideo width={20} height={20} strokeWidth={1.5} />}>
            {topVideos.map((v, i) => <VideoCard key={v.id} v={v} badge={`#${i + 1}`} />)}
          </Rail>
        )}

        {topMaterials.length > 0 && (
          <Rail title="Top Materiais" icon={<Download width={20} height={20} strokeWidth={1.5} />}>
            {topMaterials.map(item => <MaterialCard key={item.folderPath || item.rank} item={item} />)}
          </Rail>
        )}
      </div>

      {/* Nota de preview (temporária) */}
      <div className="px-5 md:px-9">
        <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-[12px] text-slate-500">
          Pré-visualização de layout <span className="font-semibold text-slate-700">Opção 2 — Redesign premium</span>. Versão temporária para comparação.
        </div>
      </div>
    </div>
  )
}
