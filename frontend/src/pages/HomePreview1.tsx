import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { Play, ArrowRight, NavArrowLeft, NavArrowRight, Folder, MediaVideo, FireFlame, Download, Sparks } from 'iconoir-react'

// PREVIEW TEMPORÁRIA — "Rediagramada".
// Reorganização limpa do que já temos, em fluxo vertical de largura total:
// 1) carrossel de destaques (vídeos + materiais), 2) adicionados recentemente,
// 3) top 5 vídeos (mais vistos NA PLATAFORMA), 4) top 5 materiais (mais baixados).
// Será removida após a escolha do cliente. Não altera a Home atual.
export default function HomePreview1() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const {
    getYoutubeCuratedSections, getYoutubeCuration, getTopDownloads,
    getAllVideoThumbnails, getFolderThumbnails, getFolderCovers, getFolderDates,
    getVideoViews,
  } = useData()

  const [videos, setVideos] = useState<any[]>([])
  const [featuredVideoId, setFeaturedVideoId] = useState<string | null>(null)
  const [topDownloads, setTopDownloads] = useState<any[]>([])
  const [customThumbnails, setCustomThumbnails] = useState<Record<string, string>>({})
  const [resourceCovers, setResourceCovers] = useState<Record<string, string>>({})
  const [folderDates, setFolderDates] = useState<Record<string, string>>({})
  const [views, setViews] = useState<Record<string, number>>({})

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
    getFolderDates().then(r => {
      const map: Record<string, string> = {}
      for (const [k, v] of Object.entries(r.dates || {})) map[k.toLowerCase()] = v as string
      setFolderDates(map)
    }).catch(() => {})
    // Capas reais dos materiais: capa de admin quando houver, senão primeira imagem da pasta
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

  // ---- helpers (copiados da Home atual; página temporária, sem extração) ----
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

  // ---------- 1) DESTAQUES (carrossel, vídeos + materiais, até 5) ----------
  type Highlight = {
    key: string; kind: 'video' | 'material'; title: string; subtitle: string
    cover: string | null; initials: string; grad: [string, string]; onClick: () => void
  }
  const buildHighlights = (): Highlight[] => {
    const out: Highlight[] = []
    const seenVideos = new Set<string>()
    const pushVideo = (v: any) => {
      if (!v?.id || seenVideos.has(v.id)) return
      seenVideos.add(v.id)
      out.push({
        key: `v-${v.id}`, kind: 'video', title: v.title, subtitle: v.channelTitle || 'Rede Inspire',
        cover: thumb(v), initials: '', grad: ['#0f172a', '#1e3a5f'], onClick: () => openVideo(v.id),
      })
    }
    const pushMaterial = (m: any) => {
      const name = resourceName(m)
      const [g1, g2] = resourceColors(name)
      const acc = resourceAccesses(m)
      out.push({
        key: `m-${m.folderPath || m.rank}`, kind: 'material', title: name,
        subtitle: acc > 0 ? `${acc} ${acc === 1 ? 'acesso' : 'acessos'}` : 'Material',
        cover: resourceCover(m), initials: resourceInitials(name), grad: [g1, g2], onClick: () => openResource(m),
      })
    }
    // vídeo featured primeiro, depois intercala material/vídeo de topo até 5
    if (featured) pushVideo(featured)
    const topMaterials = topDownloads.slice(0, 5)
    const topVideos = videos.filter(v => v.id !== featured?.id)
    let mi = 0, vi = 0
    while (out.length < 5 && (mi < topMaterials.length || vi < topVideos.length)) {
      if (mi < topMaterials.length) { pushMaterial(topMaterials[mi]); mi++ }
      if (out.length >= 5) break
      if (vi < topVideos.length) { pushVideo(topVideos[vi]); vi++ }
    }
    return out.slice(0, 5)
  }
  const highlights = buildHighlights()
  const [heroIdx, setHeroIdx] = useState(0)
  useEffect(() => {
    if (highlights.length === 0) return
    const timer = setInterval(() => setHeroIdx(p => (p + 1) % highlights.length), 7000)
    return () => clearInterval(timer)
  }, [highlights.length])
  useEffect(() => {
    if (heroIdx >= highlights.length && highlights.length > 0) setHeroIdx(0)
  }, [highlights.length, heroIdx])

  // ---------- 2) ADICIONADOS RECENTEMENTE (vídeos + materiais) ----------
  type RecentItem = {
    key: string; kind: 'video' | 'material'; title: string; subtitle: string
    cover: string | null; initials: string; grad: [string, string]; date: number; onClick: () => void
  }
  const buildRecent = (): RecentItem[] => {
    const vids: RecentItem[] = videos.map(v => ({
      key: `v-${v.id}`, kind: 'video' as const, title: v.title, subtitle: v.channelTitle || 'Rede Inspire',
      cover: thumb(v), initials: '', grad: ['#0f172a', '#1e3a5f'] as [string, string],
      date: v.publishedAt ? new Date(v.publishedAt).getTime() : 0, onClick: () => openVideo(v.id),
    }))
    const mats: RecentItem[] = topDownloads.map(m => {
      const name = resourceName(m)
      const iso = folderDates[(m.folderPath || '').toLowerCase()]
      return {
        key: `m-${m.folderPath || m.rank}`, kind: 'material' as const, title: name, subtitle: 'Material',
        cover: resourceCover(m), initials: resourceInitials(name), grad: resourceColors(name) as [string, string],
        date: iso ? new Date(iso).getTime() : 0, onClick: () => openResource(m),
      }
    })
    return [...vids, ...mats].sort((a, b) => b.date - a.date).slice(0, 5)
  }
  const recent = buildRecent()

  // ---------- 3) TOP 5 VÍDEOS (mais vistos na plataforma) ----------
  const buildTopVideos = () => {
    const withViews = [...videos].sort((a, b) => (views[b.id] || 0) - (views[a.id] || 0))
    const anyViews = videos.some(v => (views[v.id] || 0) > 0)
    return (anyViews ? withViews : videos).slice(0, 5)
  }
  const topVideos = buildTopVideos()
  const topMaterials = topDownloads.slice(0, 5)

  const TypeBadge = ({ kind }: { kind: 'video' | 'material' }) => (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white uppercase tracking-wide">
      {kind === 'video' ? <MediaVideo width={11} height={11} strokeWidth={1.5} /> : <Folder width={11} height={11} strokeWidth={1.5} />}
      {kind === 'video' ? 'Vídeo' : 'Material'}
    </span>
  )

  return (
    <div className="space-y-10">
      {/* Nota de preview (temporária) */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-[12px] text-slate-500">
        Pré-visualização de layout <span className="font-semibold text-slate-700">Opção 1 — Rediagramada</span>. Versão temporária para comparação.
      </div>

      {/* Boas-vindas */}
      <div>
        <h1 className="text-[22px] md:text-[26px] font-bold text-gray-900 tracking-tight">Olá, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-[13px] text-gray-400 mt-1">Destaques, novidades e os conteúdos mais acessados da plataforma.</p>
      </div>

      {/* 1) CARROSSEL DE DESTAQUES */}
      {highlights.length > 0 && (
        <section className="relative group rounded-3xl overflow-hidden shadow-lg shadow-slate-900/10 aspect-[16/9] md:aspect-[2.6/1]">
          {highlights.map((h, i) => (
            <div
              key={h.key}
              className={`absolute inset-0 transition-opacity duration-700 cursor-pointer ${i === heroIdx ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onClick={h.onClick}
            >
              {h.cover ? (
                <img src={h.cover} alt="" className="w-full h-full object-cover object-[center_30%]" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${h.grad[0]}, ${h.grad[1]})` }}>
                  <span className="text-[56px] font-bold text-white/90 tracking-tight">{h.initials}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute top-5 left-6">
                <TypeBadge kind={h.kind} />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-9">
                <h2 className="text-[20px] md:text-[28px] font-bold text-white leading-snug max-w-[680px] line-clamp-2">{h.title}</h2>
                <p className="text-[12px] md:text-[13px] text-white/60 mt-2">{h.subtitle}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 bg-white text-blue-700 px-4 py-2 rounded-xl text-[12px] md:text-[13px] font-semibold group-hover:gap-2.5 transition-all">
                  {h.kind === 'video' ? 'Assistir' : 'Abrir material'} <ArrowRight width={14} height={14} strokeWidth={1.5} />
                </span>
              </div>
            </div>
          ))}

          {highlights.length > 1 && (
            <>
              <button
                onClick={() => setHeroIdx(p => (p - 1 + highlights.length) % highlights.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/30 hover:bg-black/60 flex items-center justify-center transition z-10"
                aria-label="Anterior"
              >
                <NavArrowLeft width={26} height={26} strokeWidth={1.5} className="text-white" />
              </button>
              <button
                onClick={() => setHeroIdx(p => (p + 1) % highlights.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/30 hover:bg-black/60 flex items-center justify-center transition z-10"
                aria-label="Próximo"
              >
                <NavArrowRight width={26} height={26} strokeWidth={1.5} className="text-white" />
              </button>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {highlights.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIdx(i)}
                    aria-label={`Ir para destaque ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === heroIdx ? 'bg-white w-8' : 'bg-white/40 w-3 hover:bg-white/60'}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* 2) ADICIONADOS RECENTEMENTE */}
      {recent.length > 0 && (
        <section>
          <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Sparks width={17} height={17} strokeWidth={1.5} className="text-slate-400" /> Adicionados recentemente
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {recent.map(it => (
              <div key={it.key} className="group cursor-pointer" onClick={it.onClick}>
                <div className="relative rounded-xl overflow-hidden shadow-sm aspect-video">
                  {it.cover ? (
                    <img src={it.cover} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${it.grad[0]}, ${it.grad[1]})` }}>
                      <span className="text-[26px] font-bold text-white tracking-tight">{it.initials}</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2"><TypeBadge kind={it.kind} /></div>
                </div>
                <h3 className="text-[13px] font-semibold text-gray-800 mt-2.5 line-clamp-2 leading-snug">{it.title}</h3>
                <p className="text-[11px] text-gray-400 mt-1">{it.subtitle}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3) TOP 5 VÍDEOS (mais vistos na plataforma) */}
      {topVideos.length > 0 && (
        <section>
          <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2 mb-4">
            <FireFlame width={17} height={17} strokeWidth={1.5} className="text-slate-400" /> Top 5 Vídeos
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {topVideos.map((v, i) => (
              <div key={v.id} className="group cursor-pointer" onClick={() => openVideo(v.id)}>
                <div className="relative rounded-xl overflow-hidden shadow-sm aspect-video">
                  <img src={thumb(v)} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                  <span className="absolute top-2 left-2 w-6 h-6 rounded-md bg-blue-600 text-white text-[12px] font-bold flex items-center justify-center">{i + 1}</span>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <div className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center"><Play width={14} height={14} strokeWidth={1.5} className="text-blue-600 ml-0.5" /></div>
                  </div>
                </div>
                <h3 className="text-[13px] font-semibold text-gray-800 mt-2.5 line-clamp-2 leading-snug">{v.title}</h3>
                <p className="text-[11px] text-gray-400 mt-1">{(views[v.id] || 0) > 0 ? `${views[v.id]} ${views[v.id] === 1 ? 'visualização' : 'visualizações'}` : (v.channelTitle || 'Rede Inspire')}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4) TOP 5 MATERIAIS (mais baixados) */}
      {topMaterials.length > 0 && (
        <section>
          <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Download width={17} height={17} strokeWidth={1.5} className="text-slate-400" /> Top 5 Materiais
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {topMaterials.map((item, i) => {
              const name = resourceName(item)
              const [rc1, rc2] = resourceColors(name)
              const accesses = resourceAccesses(item)
              const cover = resourceCover(item)
              return (
                <div key={item.folderPath || item.rank} className="group cursor-pointer" onClick={() => openResource(item)}>
                  <div className="relative rounded-xl overflow-hidden shadow-sm aspect-video">
                    {cover ? (
                      <img src={cover} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${rc1}, ${rc2})` }}>
                        <span className="text-[26px] font-bold text-white tracking-tight">{resourceInitials(name)}</span>
                      </div>
                    )}
                    <span className="absolute top-2 left-2 w-6 h-6 rounded-md bg-blue-600 text-white text-[12px] font-bold flex items-center justify-center">{i + 1}</span>
                  </div>
                  <h3 className="text-[13px] font-semibold text-gray-800 mt-2.5 line-clamp-2 leading-snug">{name}</h3>
                  {accesses > 0 && <p className="text-[11px] text-gray-400 mt-1">{accesses} {accesses === 1 ? 'acesso' : 'acessos'}</p>}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
