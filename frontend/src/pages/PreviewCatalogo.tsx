import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { Play, ChevronLeft, ChevronRight, Info, ArrowLeft, X } from 'lucide-react'

export default function PreviewCatalogo() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getYoutubeVideos, getAllVideoTags, getAllVideoThumbnails } = useData()

  const [allVideos, setAllVideos] = useState<any[]>([])
  const [tagMap, setTagMap] = useState<Record<string, string[]>>({})
  const [customThumbs, setCustomThumbs] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [heroIdx, setHeroIdx] = useState(0)
  const [expandedVideo, setExpandedVideo] = useState<any | null>(null)

  useEffect(() => {
    Promise.all([
      getYoutubeVideos(undefined, 100).then(d => d.videos),
      getAllVideoTags().then(d => d.tagMap),
      getAllVideoThumbnails().then(d => d.thumbnails || {}),
    ]).then(([vids, tags, thumbs]) => {
      setAllVideos(vids)
      setTagMap(tags)
      setCustomThumbs(thumbs)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const thumb = useCallback((v: any) => customThumbs[v.id] || v.thumbnail, [customThumbs])

  const heroVideos = allVideos.slice(0, 5)
  const categories = buildCategories(allVideos, tagMap)

  // Hero auto-rotate
  useEffect(() => {
    if (heroVideos.length === 0) return
    const t = setInterval(() => setHeroIdx(p => (p + 1) % heroVideos.length), 7000)
    return () => clearInterval(t)
  }, [heroVideos.length])

  if (loading) return (
    <div className="fixed inset-0 bg-[#0d1117] flex items-center justify-center z-50">
      <div className="w-10 h-10 border-3 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0d1117]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 to-transparent px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/70 hover:text-white transition text-sm">
          <ArrowLeft size={18} /> Voltar
        </button>
        <span className="text-white font-bold text-lg">Catálogo</span>
        <span className="text-white/50 text-sm">{user?.name}</span>
      </div>

      {/* ═══ HERO ═══ */}
      {heroVideos.length > 0 && (
        <section className="relative w-full h-[85vh] min-h-[500px]">
          {heroVideos.map((v, i) => (
            <div key={v.id} className={`absolute inset-0 transition-opacity duration-1000 ${i === heroIdx ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <img src={thumb(v)} alt="" className="w-full h-full object-cover object-[center_20%]" />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117] via-[#0d1117]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-[#0d1117]/40" />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0d1117] to-transparent" />

          <div className="absolute bottom-[18%] left-8 md:left-14 max-w-xl z-10">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-[1.1] drop-shadow-lg">{heroVideos[heroIdx]?.title}</h1>
            <p className="text-white/50 text-sm mt-3">{heroVideos[heroIdx]?.channelTitle || 'Rede Inspire'}</p>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => navigate(`/catalogo?video=${heroVideos[heroIdx]?.id}`)}
                className="flex items-center gap-2.5 bg-white text-black font-bold px-7 py-3.5 rounded-md hover:bg-white/90 transition text-[14px]">
                <Play size={20} fill="currentColor" /> Assistir agora
              </button>
              <button className="w-11 h-11 rounded-full border-2 border-white/40 flex items-center justify-center hover:border-white/70 transition">
                <Info size={20} className="text-white" />
              </button>
            </div>
          </div>

          <button onClick={() => setHeroIdx(p => (p - 1 + heroVideos.length) % heroVideos.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 hover:bg-black/60 flex items-center justify-center transition z-10">
            <ChevronLeft size={28} className="text-white" />
          </button>
          <button onClick={() => setHeroIdx(p => (p + 1) % heroVideos.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 hover:bg-black/60 flex items-center justify-center transition z-10">
            <ChevronRight size={28} className="text-white" />
          </button>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {heroVideos.map((_, i) => (
              <button key={i} onClick={() => setHeroIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === heroIdx ? 'bg-white w-8' : 'bg-white/30 w-3 hover:bg-white/50'}`} />
            ))}
          </div>
        </section>
      )}

      {/* ═══ ROWS ═══ */}
      <div className="relative z-10 -mt-24 pb-20">
        {categories.map(cat => (
          <CategoryRow
            key={cat.label}
            label={cat.label}
            videos={cat.videos}
            thumb={thumb}
            onExpand={(v) => { if (window.innerWidth < 768) setExpandedVideo(v) }}
            onPlay={(v) => navigate(`/catalogo?video=${v.id}`)}
          />
        ))}
      </div>

      {/* ═══ EXPANDED CARD — mobile only (modal) ═══ */}
      {expandedVideo && window.innerWidth < 768 && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center md:hidden" onClick={() => setExpandedVideo(null)}>
          <div className="bg-[#0d1117] rounded-t-2xl overflow-hidden w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative aspect-video">
              <img src={thumb(expandedVideo)} alt="" className="w-full h-full object-cover" />
              <button onClick={() => setExpandedVideo(null)} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center">
                <X size={16} className="text-white" />
              </button>
            </div>
            <div className="p-5">
              <h3 className="text-white font-bold text-xl leading-snug">{expandedVideo.title}</h3>
              <p className="text-green-400 text-xs font-medium mt-1.5 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-[8px] text-white font-bold">✓</span>
                Incluído na plataforma
              </p>
              <button onClick={() => { navigate(`/catalogo?video=${expandedVideo.id}`); setExpandedVideo(null) }}
                className="mt-4 w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3.5 rounded-lg text-[15px]">
                <Play size={20} fill="currentColor" /> Reproduzir
              </button>
              <div className="flex items-center gap-3 mt-4">
                <button className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-lg">+</button>
                <button onClick={() => setExpandedVideo(null)} className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <X size={18} className="text-white" />
                </button>
              </div>
              {expandedVideo.description && (
                <p className="text-white/40 text-[12px] mt-4 line-clamp-5 leading-relaxed">{expandedVideo.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Back button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button onClick={() => navigate('/catalogo')} className="px-4 py-2.5 rounded-lg bg-green-600 text-white text-[12px] font-semibold shadow-lg hover:bg-green-700 transition">
          ← Catálogo atual
        </button>
      </div>
    </div>
  )
}

// ─── Category Row ───
function CategoryRow({ label, videos, thumb, onExpand: _onExpand, onPlay: _onPlay }: {
  label: string; videos: any[]; thumb: (v: any) => string; onExpand: (v: any) => void; onPlay: (v: any) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isWatching = label === 'Continue assistindo'
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [cardRect, setCardRect] = useState<DOMRect | null>(null)
  const navigate = useNavigate()

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -(el.clientWidth * 0.8) : (el.clientWidth * 0.8), behavior: 'smooth' })
  }

  if (videos.length === 0) return null

  return (
    <div className="mb-10 group/row">
      <div className="px-8 md:px-14 mb-3">
        <h2 className="text-[15px] font-bold text-white/90">{label}</h2>
      </div>

      <div className="relative">
        <button onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 w-14 bg-gradient-to-r from-[#0d1117] to-transparent z-10 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer">
          <ChevronLeft size={36} className="text-white" />
        </button>

        <div ref={scrollRef} className="flex gap-3 px-8 md:px-14 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {videos.map(v => {
            const isExpanded = expandedId === v.id
            return (
              <div key={v.id}
                data-vid={v.id}
                className="shrink-0 w-[220px] md:w-[280px]"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  setExpandedId(v.id)
                  setCardRect(rect)
                }}
                onMouseLeave={() => setExpandedId(null)}>
                {/* Base thumbnail */}
                <div className={`relative rounded-lg overflow-hidden aspect-video bg-[#1c2028] transition-all duration-200 ${isExpanded ? 'opacity-0' : ''}`}>
                  <img src={thumb(v)} alt="" loading="lazy" className="w-full h-full object-cover" />
                  {isWatching && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                      <div className="h-full bg-green-500 rounded-r-full" style={{ width: `${20 + Math.floor(v.id.charCodeAt(0) % 60)}%` }} />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Floating expanded card — positioned over the hovered thumbnail */}
        {expandedId && cardRect && (() => {
          const v = videos.find(vid => vid.id === expandedId)
          if (!v) return null
          const cardW = 380
          let left = cardRect.left + cardRect.width / 2 - cardW / 2
          // Keep within viewport
          if (left < 10) left = 10
          if (left + cardW > window.innerWidth - 10) left = window.innerWidth - cardW - 10
          return (
            <div className="fixed inset-0 pointer-events-none hidden md:block" style={{ zIndex: 100 }}>
              <div
                className="absolute pointer-events-auto transition-all duration-300 ease-out"
                style={{ top: cardRect.top - 10, left, width: cardW, opacity: 1, transform: 'scale(1)' }}
                onMouseEnter={() => setExpandedId(v.id)}
                onMouseLeave={() => setExpandedId(null)}>
                <div className="rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] ring-1 ring-white/10 bg-[#0d1117]">
                  <div className="relative aspect-video">
                    <img src={thumb(v)} alt="" className="w-full h-full object-cover" />
                    {isWatching && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div className="h-full bg-green-500 rounded-r-full" style={{ width: `${20 + Math.floor(v.id.charCodeAt(0) % 60)}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-bold text-[13px] leading-snug line-clamp-2">{v.title}</h3>
                    <p className="text-green-400 text-[10px] font-medium mt-1 flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center text-[7px] text-white">✓</span>
                      Incluído na plataforma
                    </p>
                    <button onClick={() => navigate(`/catalogo?video=${v.id}`)}
                      className="mt-3 w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-2.5 rounded-md hover:bg-white/90 transition text-[12px]">
                      <Play size={14} fill="currentColor" /> Reproduzir
                    </button>
                    <div className="flex items-center gap-2 mt-2.5">
                      <button className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition text-white text-sm">+</button>
                      <button onClick={() => setExpandedId(null)} className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition">
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[9px] text-white/30">
                      <span>{v.channelTitle || 'Rede Inspire'}</span>
                      {v.publishedAt && <span>· {new Date(v.publishedAt).getFullYear()}</span>}
                    </div>
                    {v.description && (
                      <p className="text-white/30 text-[10px] mt-2 line-clamp-3 leading-relaxed">{v.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

        <button onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 w-14 bg-gradient-to-l from-[#0d1117] to-transparent z-10 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer">
          <ChevronRight size={36} className="text-white" />
        </button>
      </div>
    </div>
  )
}

// ─── Smart categories ───
function buildCategories(videos: any[], _tagMap: Record<string, string[]>) {
  const rules: { label: string; keywords: string[] }[] = [
    { label: 'Liderança & Gestão', keywords: ['liderança', 'líder', 'gestão', 'gestor', 'equipe', 'equipes', 'operacional', 'secretari'] },
    { label: 'Finanças & Estratégia', keywords: ['financ', 'planejamento', 'estratég', 'recurso', 'prioridade'] },
    { label: 'Inovação & Tecnologia', keywords: ['inovação', 'tecnologia', 'digital', 'inteligência', 'otimizar'] },
    { label: 'Saúde Emocional', keywords: ['saúde', 'emocional', 'bem-estar', 'burnout', 'cuidado'] },
    { label: 'Comunicação & Mídia', keywords: ['comunicação', 'mídia', 'multimídia', 'projeção', 'visual', 'redes sociais'] },
    { label: 'Vida Ministerial', keywords: ['ministério', 'ministerial', 'célula', 'pequenos grupos', 'consolidar', 'bases', 'igreja'] },
    { label: 'Família & Relacionamentos', keywords: ['família', 'casamento', 'relacionamento', 'filhos', 'mulher', 'homem', 'homens'] },
    { label: 'Crescimento Espiritual', keywords: ['crescimento', 'discipulado', 'caminho', 'dons', 'propósito', 'chamado', 'fé'] },
    { label: 'Impacto Social', keywords: ['social', 'comunidade', 'ação social', 'voluntário', 'impacto'] },
    { label: 'Webinars & Talks', keywords: ['webinar', 'talk', 'podcast', 'inspire leaders', 'encontro', 'mentores'] },
  ]

  const categorized: Record<string, Set<string>> = {}
  const videoMap: Record<string, any> = {}

  for (const v of videos) {
    videoMap[v.id] = v
    const text = (v.title || '').toLowerCase() + ' ' + (v.description || '').toLowerCase()
    for (const rule of rules) {
      if (rule.keywords.some(kw => text.includes(kw))) {
        if (!categorized[rule.label]) categorized[rule.label] = new Set()
        categorized[rule.label].add(v.id)
        break // Each video goes to ONE category only
      }
    }
  }

  // Build result
  const result: { label: string; videos: any[] }[] = []

  // Ensure each video only appears in ONE category
  const usedIds = new Set<string>()

  // "Continue assistindo" — first 7 unique
  const watching = videos.slice(2, 9)
  watching.forEach(v => usedIds.add(v.id))
  result.push({ label: 'Continue assistindo', videos: watching })

  // "Adicionados recentemente" — next unique ones sorted by date
  const recent = [...videos]
    .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
    .filter(v => !usedIds.has(v.id))
    .slice(0, 15)
  recent.forEach(v => usedIds.add(v.id))
  result.push({ label: 'Adicionados recentemente', videos: recent })

  // Category rows — only unused videos
  for (const rule of rules) {
    const ids = categorized[rule.label]
    if (ids && ids.size >= 3) {
      const catVideos = [...ids].map(id => videoMap[id]).filter(v => !usedIds.has(v.id))
      catVideos.forEach(v => usedIds.add(v.id))
      if (catVideos.length >= 2) {
        result.push({ label: rule.label, videos: catVideos })
      }
    }
  }

  // "Mais assistidos" — remaining unused
  const popular = videos.filter(v => !usedIds.has(v.id)).slice(0, 15)
  popular.forEach(v => usedIds.add(v.id))
  if (popular.length > 2) {
    result.push({ label: 'Mais assistidos', videos: popular })
  }

  // "Descubra mais" — anything left
  const remaining = videos.filter(v => !usedIds.has(v.id)).slice(0, 15)
  if (remaining.length > 2) {
    result.push({ label: 'Descubra mais', videos: remaining })
  }

  return result
}
