import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { Play, ChevronLeft, ChevronRight, Info, ArrowLeft } from 'lucide-react'

export default function PreviewCatalogo() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getYoutubeVideos, getAllVideoTags, getAllVideoThumbnails } = useData()

  const [allVideos, setAllVideos] = useState<any[]>([])
  const [tagMap, setTagMap] = useState<Record<string, string[]>>({})
  const [customThumbs, setCustomThumbs] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [heroIdx, setHeroIdx] = useState(0)

  // Load all data
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
  const categories = buildCategories(allVideos.slice(5), tagMap)

  // Hero auto-rotate
  useEffect(() => {
    if (heroVideos.length === 0) return
    const t = setInterval(() => setHeroIdx(p => (p + 1) % heroVideos.length), 7000)
    return () => clearInterval(t)
  }, [heroVideos.length])

  if (loading) return (
    <div className="fixed inset-0 bg-[#141920] flex items-center justify-center z-50">
      <div className="w-10 h-10 border-3 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#141920]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 to-transparent px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/70 hover:text-white transition text-sm">
          <ArrowLeft size={18} /> Voltar
        </button>
        <span className="text-white font-bold text-lg">Catálogo</span>
        <span className="text-white/50 text-sm">{user?.name}</span>
      </div>

      {/* ═══ HERO CAROUSEL ═══ */}
      {heroVideos.length > 0 && (
        <section className="relative w-full h-[85vh] min-h-[500px]">
          {/* Background */}
          {heroVideos.map((v, i) => (
            <div key={v.id} className={`absolute inset-0 transition-opacity duration-1000 ${i === heroIdx ? 'opacity-100' : 'opacity-0'}`}>
              <img src={thumb(v)} alt="" className="w-full h-full object-cover object-[center_20%]" />
            </div>
          ))}
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#141920] via-[#141920]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141920] via-transparent to-[#141920]/40" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#141920] to-transparent" />

          {/* Content */}
          <div className="absolute bottom-[18%] left-8 md:left-14 max-w-xl z-10">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-[1.1] drop-shadow-lg">
              {heroVideos[heroIdx]?.title}
            </h1>
            <p className="text-white/50 text-sm mt-3">{heroVideos[heroIdx]?.channelTitle || 'Rede Inspire'}</p>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => navigate(`/catalogo?video=${heroVideos[heroIdx]?.id}`)}
                className="flex items-center gap-2.5 bg-white text-black font-bold px-7 py-3.5 rounded-md hover:bg-white/90 transition text-[14px]"
              >
                <Play size={20} fill="currentColor" /> Assistir agora
              </button>
              <button className="w-11 h-11 rounded-full border-2 border-white/40 flex items-center justify-center hover:border-white/70 transition">
                <Info size={20} className="text-white" />
              </button>
            </div>
          </div>

          {/* Arrows */}
          <button onClick={() => setHeroIdx(p => (p - 1 + heroVideos.length) % heroVideos.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 hover:bg-black/60 flex items-center justify-center transition z-10">
            <ChevronLeft size={28} className="text-white" />
          </button>
          <button onClick={() => setHeroIdx(p => (p + 1) % heroVideos.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 hover:bg-black/60 flex items-center justify-center transition z-10">
            <ChevronRight size={28} className="text-white" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {heroVideos.map((_, i) => (
              <button key={i} onClick={() => setHeroIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === heroIdx ? 'bg-white w-8' : 'bg-white/30 w-3 hover:bg-white/50'}`} />
            ))}
          </div>
        </section>
      )}

      {/* ═══ CATEGORY ROWS ═══ */}
      <div className="relative z-10 -mt-20 pb-20">
        {categories.map(cat => (
          <CategoryRow
            key={cat.label}
            label={cat.label}
            videos={cat.videos}
            thumb={thumb}
            onPlay={(v) => navigate(`/catalogo?video=${v.id}`)}
          />
        ))}
      </div>

      {/* Back button fixed */}
      <div className="fixed bottom-5 right-5 z-50">
        <button onClick={() => navigate('/catalogo')} className="px-4 py-2.5 rounded-lg bg-green-600 text-white text-[12px] font-semibold shadow-lg hover:bg-green-700 transition">
          ← Catálogo atual
        </button>
      </div>
    </div>
  )
}

// ─── Category Row ───
function CategoryRow({ label, videos, thumb, onPlay }: {
  label: string; videos: any[]; thumb: (v: any) => string; onPlay: (v: any) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.8
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  if (videos.length === 0) return null

  return (
    <div className="mb-8 group/row">
      <div className="px-8 md:px-14 mb-3 flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-white">{label}</h2>
        <span className="text-[12px] text-white/40 hover:text-white/70 cursor-pointer transition">Ver mais ›</span>
      </div>

      <div className="relative">
        {/* Left arrow */}
        <button onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 w-14 bg-gradient-to-r from-[#141920] to-transparent z-10 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity">
          <ChevronLeft size={32} className="text-white" />
        </button>

        {/* Scrollable row */}
        <div ref={scrollRef} className="flex gap-2 px-8 md:px-14 overflow-x-auto" style={{ scrollbarWidth: 'none', scrollBehavior: 'smooth' }}>
          {videos.map(v => (
            <div key={v.id}
              onClick={() => onPlay(v)}
              className="shrink-0 w-[260px] md:w-[300px] cursor-pointer group/card">
              <div className="relative rounded-md overflow-hidden aspect-video bg-[#1c2028]">
                <img src={thumb(v)} alt="" loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105" />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/card:opacity-100 scale-75 group-hover/card:scale-100 transition-all duration-300">
                    <Play size={20} className="text-white ml-0.5" fill="white" />
                  </div>
                </div>
              </div>
              <p className="text-[12px] text-white/50 mt-2 line-clamp-1 group-hover/card:text-white/80 transition">{v.title}</p>
            </div>
          ))}
        </div>

        {/* Right arrow */}
        <button onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 w-14 bg-gradient-to-l from-[#141920] to-transparent z-10 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity">
          <ChevronRight size={32} className="text-white" />
        </button>
      </div>
    </div>
  )
}

// ─── Build categories from video titles (smart categorization) ───
function buildCategories(videos: any[], tagMap: Record<string, string[]>) {
  // Keywords to detect categories from titles
  const categoryRules: { label: string; keywords: string[] }[] = [
    { label: 'Liderança & Gestão', keywords: ['liderança', 'líder', 'gestão', 'gestor', 'equipe', 'equipes', 'operacional', 'secretari'] },
    { label: 'Finanças & Planejamento', keywords: ['financ', 'planejamento', 'estratég', 'recurso', 'prioridade'] },
    { label: 'Inovação & Tecnologia', keywords: ['inovação', 'tecnologia', 'digital', 'inteligência', 'otimizar'] },
    { label: 'Saúde & Bem-estar', keywords: ['saúde', 'emocional', 'bem-estar', 'burnout', 'cuidado'] },
    { label: 'Comunicação & Mídia', keywords: ['comunicação', 'mídia', 'multimídia', 'projeção', 'visual', 'redes sociais'] },
    { label: 'Ministérios & Células', keywords: ['ministério', 'ministerial', 'célula', 'pequenos grupos', 'consolidar', 'bases'] },
    { label: 'Família & Relacionamentos', keywords: ['família', 'casamento', 'relacionamento', 'filhos', 'mulher', 'homem', 'homens'] },
    { label: 'Crescimento & Discipulado', keywords: ['crescimento', 'discipulado', 'caminho', 'dons', 'propósito', 'chamado'] },
    { label: 'Ação Social & Comunidade', keywords: ['social', 'comunidade', 'ação social', 'voluntário', 'impacto'] },
    { label: 'Webinars & Talks', keywords: ['webinar', 'talk', 'podcast', 'inspire leaders', 'encontro'] },
  ]

  const categorized: Record<string, any[]> = {}
  const used = new Set<string>()

  // First pass: categorize by title keywords
  for (const v of videos) {
    const titleLower = (v.title || '').toLowerCase()
    const descLower = (v.description || '').toLowerCase()
    const text = titleLower + ' ' + descLower

    for (const rule of categoryRules) {
      if (rule.keywords.some(kw => text.includes(kw))) {
        if (!categorized[rule.label]) categorized[rule.label] = []
        if (!used.has(v.id)) {
          categorized[rule.label].push(v)
          used.add(v.id)
        }
        break
      }
    }
  }

  // Second pass: use tags for uncategorized videos
  for (const v of videos) {
    if (used.has(v.id)) continue
    const tags = tagMap[v.id] || []
    if (tags.length > 0) {
      const tagLabel = tags[0].charAt(0).toUpperCase() + tags[0].slice(1)
      if (!categorized[tagLabel]) categorized[tagLabel] = []
      categorized[tagLabel].push(v)
      used.add(v.id)
    }
  }

  // Build result — only categories with 2+ videos
  const result = Object.entries(categorized)
    .filter(([_, vids]) => vids.length >= 2)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([label, vids]) => ({ label, videos: vids }))

  // Add "Mais para você" with remaining
  const remaining = videos.filter(v => !used.has(v.id))
  if (remaining.length > 0) {
    result.push({ label: 'Mais para você', videos: remaining })
  }

  // Also add "Adicionados recentemente" (last 10 by date)
  const recent = [...videos].sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || '')).slice(0, 12)
  if (recent.length > 0) {
    result.unshift({ label: 'Adicionados recentemente', videos: recent })
  }

  // Add "Mais assistidos" (first 12 as proxy for popular)
  const popular = videos.slice(0, 12)
  if (popular.length > 0) {
    result.unshift({ label: 'Mais assistidos', videos: popular })
  }

  return result
}
