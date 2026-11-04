import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { Play, PlaySolid, NavArrowRight, NavArrowLeft, Folder, MediaVideo, ArrowRight } from 'iconoir-react'

// PREVIEW TEMPORÁRIA — "Opção 3 — igual à Rede Inspire oficial".
// Reproduz o layout do site oficial (estilo streaming): hero gigante com gradiente
// vermelho/laranja curvo + título em fonte condensada (Anton) caixa alta, e trilhos
// horizontais (scroll-snap) estilo Netflix. Inclui toggle BLACK/WHITE na própria
// página. Usa os MESMOS dados reais da Home. Será removida após a escolha do cliente.
export default function HomePreview3() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const {
    getYoutubeCuratedSections, getYoutubeCuration, getTopDownloads,
    getAllVideoThumbnails, getFolderThumbnails, getFolderCovers, getFolderDates,
    getVideoViews,
  } = useData()

  // ---- tema local da preview (toggle na própria página) ----
  const [theme, setTheme] = useState<'black' | 'white'>('black')
  const isBlack = theme === 'black'

  const [videos, setVideos] = useState<any[]>([])
  const [curatedSections, setCuratedSections] = useState<{ title: string | null; videos: any[] }[]>([])
  const [featuredVideoId, setFeaturedVideoId] = useState<string | null>(null)
  const [topDownloads, setTopDownloads] = useState<any[]>([])
  const [customThumbnails, setCustomThumbnails] = useState<Record<string, string>>({})
  const [resourceCovers, setResourceCovers] = useState<Record<string, string>>({})
  const [folderDates, setFolderDates] = useState<Record<string, string>>({})
  const [views, setViews] = useState<Record<string, number>>({})

  useEffect(() => {
    getYoutubeCuratedSections().then(d => {
      const sections = d.fallback ? [{ title: null, videos: d.sections[0]?.videos || [] }] : d.sections
      setCuratedSections(sections)
      const pool = sections.flatMap((s: any) => s.videos || [])
      setVideos(pool)
    }).catch(() => {})
    getYoutubeCuration().then(c => setFeaturedVideoId(c.featuredVideoId)).catch(() => {})
    getTopDownloads().then(setTopDownloads).catch(() => {})
    getAllVideoThumbnails().then(data => setCustomThumbnails(data.thumbnails || {})).catch(() => {})
    getVideoViews().then(r => setViews(r.views || {})).catch(() => setViews({}))
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
    ['#7c1d10', '#e11d2a'], ['#b91c1c', '#ff6a00'], ['#9a1b14', '#f97316'],
    ['#431407', '#ea580c'], ['#7c2d12', '#f59e0b'], ['#991b1b', '#fb7185'],
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
  // Fallback do hero: featured de vídeo, senão o material mais acessado
  const featuredResource = !featured ? (topDownloads[0] || null) : null

  // Top vídeos por views reais (fallback: ordem das seções)
  const topVideos = (() => {
    const withViews = [...videos].sort((a, b) => (views[b.id] || 0) - (views[a.id] || 0))
    const anyViews = videos.some(v => (views[v.id] || 0) > 0)
    return (anyViews ? withViews : videos).slice(0, 12)
  })()
  const topMaterials = topDownloads.slice(0, 12)

  // Adicionados recentemente (vídeos por publishedAt + materiais por folderDates), misturados
  const recentMix = (() => {
    const vids = videos.map(v => ({
      key: `v-${v.id}`, kind: 'video' as const, title: v.title, subtitle: v.channelTitle || 'Rede Inspire',
      cover: thumb(v) as string | null, initials: '', grad: ['#7c1d10', '#e11d2a'] as [string, string],
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
    return [...vids, ...mats].sort((a, b) => b.date - a.date).slice(0, 12)
  })()

  // ---- paleta por tema ----
  const ORANGE = '#ff6a00'
  const RED = '#e11d2a'
  const pageBg = isBlack ? '#0d0d12' : '#f7f7f8'
  const textMain = isBlack ? 'text-[#f3e8df]' : 'text-slate-900'
  const textMuted = isBlack ? 'text-white/55' : 'text-slate-500'
  const cardBorder = isBlack ? 'border-white/5' : 'border-slate-200'
  const railBtn = isBlack
    ? 'bg-white/10 hover:bg-white/20 text-[#f3e8df]'
    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'

  // Fonte condensada impactante (Anton) — carregada via <link> em index.html.
  const condensed: React.CSSProperties = { fontFamily: "'Anton', 'Oswald', system-ui, sans-serif" }

  // ---- Trilho horizontal com scroll-snap + setas (estilo Netflix) ----
  const Rail = ({ title, children }: { title: string; children: React.ReactNode }) => {
    const ref = useRef<HTMLDivElement>(null)
    const scroll = (dir: 'left' | 'right') => {
      const el = ref.current
      if (!el) return
      el.scrollBy({ left: dir === 'left' ? -el.clientWidth * 0.85 : el.clientWidth * 0.85, behavior: 'smooth' })
    }
    return (
      <section className="group/rail">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className={`text-[17px] md:text-[20px] font-semibold tracking-tight ${textMain}`}>{title}</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => scroll('left')} aria-label="Anterior" className={`hidden md:flex w-9 h-9 rounded-full items-center justify-center transition opacity-0 group-hover/rail:opacity-100 ${railBtn}`}>
              <NavArrowLeft width={20} height={20} strokeWidth={2} />
            </button>
            <button onClick={() => scroll('right')} aria-label="Próximo" className={`flex w-9 h-9 rounded-full items-center justify-center transition ${railBtn}`} style={{ color: ORANGE }}>
              <NavArrowRight width={22} height={22} strokeWidth={2.2} />
            </button>
          </div>
        </div>
        <div ref={ref} className="flex gap-4 overflow-x-auto pb-3 px-1 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
          {children}
        </div>
      </section>
    )
  }

  // Card de vídeo — capa cobrindo, título caixa alta sobreposto, badge no topo
  const VideoCard = ({ v, badge = 'Vídeo' }: { v: any; badge?: string }) => (
    <div onClick={() => openVideo(v.id)} className="snap-start shrink-0 w-[280px] md:w-[320px] group/card cursor-pointer">
      <div className="relative rounded-xl overflow-hidden aspect-[16/10] shadow-lg shadow-black/30 transition-transform duration-300 group-hover/card:scale-[1.035]">
        <img src={thumb(v)} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
        <span className="absolute top-2.5 left-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-white" style={{ backgroundColor: ORANGE }}>{badge}</span>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition">
          <div className="w-12 h-12 rounded-full bg-white/95 shadow-xl flex items-center justify-center"><PlaySolid width={20} height={20} className="ml-0.5" style={{ color: RED }} /></div>
        </div>
        <h3 className="absolute bottom-2.5 left-3 right-3 text-[15px] md:text-[16px] uppercase text-[#f3e8df] leading-[1.05] line-clamp-2" style={condensed}>{v.title}</h3>
      </div>
      <p className={`text-[11px] mt-2 px-1 ${textMuted}`}>{(views[v.id] || 0) > 0 ? `${views[v.id]} ${views[v.id] === 1 ? 'visualização' : 'visualizações'}` : (v.channelTitle || 'Rede Inspire')}</p>
    </div>
  )

  // Card de material
  const MaterialCard = ({ item }: { item: any }) => {
    const name = resourceName(item)
    const [rc1, rc2] = resourceColors(name)
    const accesses = resourceAccesses(item)
    const cover = resourceCover(item)
    return (
      <div onClick={() => openResource(item)} className="snap-start shrink-0 w-[280px] md:w-[320px] group/card cursor-pointer">
        <div className="relative rounded-xl overflow-hidden aspect-[16/10] shadow-lg shadow-black/30 transition-transform duration-300 group-hover/card:scale-[1.035]">
          {cover ? (
            <img src={cover} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${rc1}, ${rc2})` }}>
              <span className="text-[38px] text-white uppercase" style={condensed}>{resourceInitials(name)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
          <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-white" style={{ backgroundColor: ORANGE }}><Folder width={10} height={10} strokeWidth={2} /> Material</span>
          <h3 className="absolute bottom-2.5 left-3 right-3 text-[15px] md:text-[16px] uppercase text-[#f3e8df] leading-[1.05] line-clamp-2" style={condensed}>{name}</h3>
        </div>
        <p className={`text-[11px] mt-2 px-1 ${textMuted}`}>{accesses > 0 ? `${accesses} ${accesses === 1 ? 'acesso' : 'acessos'}` : 'Material'}</p>
      </div>
    )
  }

  // Card misto (recentes)
  const MixCard = ({ it }: { it: typeof recentMix[number] }) => (
    <div onClick={it.onClick} className="snap-start shrink-0 w-[280px] md:w-[320px] group/card cursor-pointer">
      <div className="relative rounded-xl overflow-hidden aspect-[16/10] shadow-lg shadow-black/30 transition-transform duration-300 group-hover/card:scale-[1.035]">
        {it.cover ? (
          <img src={it.cover} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${it.grad[0]}, ${it.grad[1]})` }}>
            <span className="text-[38px] text-white uppercase" style={condensed}>{it.initials || '#'}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
        <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-white" style={{ backgroundColor: ORANGE }}>
          {it.kind === 'video' ? <MediaVideo width={10} height={10} strokeWidth={2} /> : <Folder width={10} height={10} strokeWidth={2} />}
          {it.kind === 'video' ? 'Vídeo' : 'Material'}
        </span>
        <h3 className="absolute bottom-2.5 left-3 right-3 text-[15px] md:text-[16px] uppercase text-[#f3e8df] leading-[1.05] line-clamp-2" style={condensed}>{it.title}</h3>
      </div>
      <p className={`text-[11px] mt-2 px-1 ${textMuted}`}>{it.subtitle}</p>
    </div>
  )

  const heroItem = featured || featuredResource
  const heroTitle = featured ? featured.title : (featuredResource ? resourceName(featuredResource) : '')
  const heroLabel = featured ? (featured.channelTitle || 'Eventos Rede Inspire') : 'Materiais Rede Inspire'
  const heroImage = featured ? thumb(featured) : (featuredResource ? resourceCover(featuredResource) : null)
  const openHero = () => {
    if (featured) openVideo(featured.id)
    else if (featuredResource) openResource(featuredResource)
  }

  return (
    <div className="-mx-4 md:-mx-8 min-h-screen" style={{ backgroundColor: pageBg }}>
      {/* Toggle BLACK / WHITE — canto superior direito do conteúdo */}
      <div className="flex justify-end px-5 md:px-10 pt-4">
        <div className={`inline-flex items-center rounded-full p-1 ${isBlack ? 'bg-white/10' : 'bg-slate-200'}`}>
          <button
            onClick={() => setTheme('black')}
            className={`px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider transition ${isBlack ? 'text-white' : 'text-slate-500'}`}
            style={isBlack ? { backgroundColor: ORANGE } : undefined}
          >Black</button>
          <button
            onClick={() => setTheme('white')}
            className={`px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider transition ${!isBlack ? 'bg-white text-slate-900 shadow' : 'text-white/70'}`}
          >White</button>
        </div>
      </div>

      {/* HERO gigante estilo Rede Inspire */}
      {heroItem && (
        <section className="relative w-full overflow-hidden mt-3" style={{ height: '70vh', minHeight: 440 }}>
          {/* Base escura sempre no hero (fiel ao print), independente do tema */}
          <div className="absolute inset-0" style={{ backgroundColor: '#0d0d12' }} />
          {/* Imagem do destaque ao fundo, suavizada */}
          {heroImage && (
            <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover object-[center_30%] opacity-35" />
          )}
          {/* Gradiente vermelho->laranja curvo entrando pela direita */}
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(120% 130% at 100% 20%, ${ORANGE} 0%, ${RED} 32%, rgba(225,29,42,0.25) 52%, transparent 70%)` }}
          />
          {/* Escurecimento à esquerda para legibilidade do título */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(13,13,18,0.92) 0%, rgba(13,13,18,0.55) 40%, transparent 75%)' }} />

          <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-14 max-w-4xl">
            <span className="text-[11px] md:text-[13px] font-semibold uppercase tracking-[0.22em] text-[#f3e8df]/80">{heroLabel}</span>
            <h1
              className="mt-3 md:mt-4 uppercase text-[#f3e8df] leading-[0.92] text-[52px] md:text-[94px]"
              style={{ ...condensed, textShadow: '0 4px 30px rgba(0,0,0,0.45)' }}
            >
              {heroTitle}
            </h1>
            <div className="mt-7">
              <button
                onClick={openHero}
                className="inline-flex items-center gap-2.5 text-white font-bold px-7 py-3.5 rounded-full text-[14px] md:text-[15px] shadow-xl transition hover:brightness-110"
                style={{ backgroundColor: ORANGE, boxShadow: `0 10px 30px -6px ${ORANGE}99` }}
              >
                {featured ? <PlaySolid width={19} height={19} /> : <ArrowRight width={18} height={18} strokeWidth={2} />}
                {featured ? 'Clique aqui para assistir' : 'Clique aqui para acessar'}
              </button>
            </div>
          </div>

          {/* Faixa de gradiente azul->roxo na base do hero (opcional, fiel ao print) */}
          <div className="absolute bottom-0 left-0 right-0 h-20" style={{ background: 'linear-gradient(90deg, #1e3a8a 0%, #4c1d95 55%, #7c2d12 100%)', opacity: 0.55 }} />
          <div className="absolute bottom-0 left-0 right-0 h-28" style={{ background: `linear-gradient(to top, ${pageBg}, transparent)` }} />
        </section>
      )}

      {/* Saudação */}
      <div className="px-5 md:px-10 pt-6">
        <h2 className={`text-[20px] md:text-[26px] uppercase tracking-tight ${textMain}`} style={condensed}>
          Bem-vindo, {user?.name?.split(' ')[0]}
        </h2>
        <p className={`text-[13px] mt-1 ${textMuted}`}>O melhor da Rede Inspire, do jeito que você gosta de assistir.</p>
      </div>

      {/* Trilhos horizontais — seções curadas (cada playlist = um trilho) */}
      <div className="px-4 md:px-9 pt-6 space-y-10 pb-4">
        {curatedSections.filter(s => s.title && (s.videos || []).length > 0).map(section => (
          <Rail key={section.title!} title={section.title!}>
            {section.videos.map(v => <VideoCard key={v.id} v={v} />)}
          </Rail>
        ))}

        {topVideos.length > 0 && (
          <Rail title="Top Vídeos">
            {topVideos.map((v, i) => <VideoCard key={v.id} v={v} badge={`#${i + 1}`} />)}
          </Rail>
        )}

        {topMaterials.length > 0 && (
          <Rail title="Materiais em destaque">
            {topMaterials.map(item => <MaterialCard key={item.folderPath || item.rank} item={item} />)}
          </Rail>
        )}

        {recentMix.length > 0 && (
          <Rail title="Adicionados recentemente">
            {recentMix.map(it => <MixCard key={it.key} it={it} />)}
          </Rail>
        )}
      </div>

      {/* Nota de preview (temporária) */}
      <div className="px-5 md:px-10 pb-10">
        <div className={`rounded-xl border px-4 py-2 text-[12px] inline-flex items-center gap-2 ${cardBorder} ${textMuted}`}>
          <Play width={13} height={13} strokeWidth={1.5} />
          Pré-visualização de layout <span className="font-semibold" style={{ color: ORANGE }}>Opção 3 — igual à Rede Inspire</span>. Versão temporária para comparação (tema {isBlack ? 'Black' : 'White'}).
        </div>
      </div>
    </div>
  )
}
