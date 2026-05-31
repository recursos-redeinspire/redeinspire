import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { Play, ChevronLeft, ChevronRight, X, Info } from 'lucide-react'

export default function PreviewCatalogo() {
  const navigate = useNavigate()
  const { getYoutubeVideos, getAllVideoTags, getAllVideoThumbnails } = useData()

  const [allVideos, setAllVideos] = useState<any[]>([])
  const [tagMap, setTagMap] = useState<Record<string, string[]>>({})
  const [customThumbs, setCustomThumbs] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [heroIndex, setHeroIndex] = useState(0)
  const [hoveredVideo, setHoveredVideo] = useState<any | null>(null)
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  useEffect(() => {
    Promise.all([
      getYoutubeVideos(undefined, 50).then(d => d.videos),
      getAllVideoTags().then(d => d.tagMap),
      getAllVideoThumbnails().then(d => d.thumbnails || {}),
    ]).then(([videos, tags, thumbs]) => {
      setAllVideos(videos)
      setTagMap(tags)
      setCustomThumbs(thumbs)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const thumb = (v: any) => customThumbs[v.id] || v.thumbnail

  // Hero videos (first 5)
  const heroVideos = allVideos.slice(0, 5)

  // Group videos by tags into categories
  const categories = buildCategories(allVideos, tagMap)

  // Auto-rotate hero
  useEffect(() => {
    if (heroVideos.length === 0) return
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroVideos.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [heroVideos.length])

  if (loading) return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0f1117] text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Hero Carousel */}
      {heroVideos.length > 0 && (
        <HeroCarousel
          videos={heroVideos}
          activeIndex={heroIndex}
          setActiveIndex={setHeroIndex}
          thumb={thumb}
          onPlay={(v) => navigate(`/catalogo?video=${v.id}`)}
        />
      )}

      {/* Categories */}
      <div className="px-6 md:px-12 pb-16 space-y-8 -mt-16 relative z-10">
        {categories.map(cat => (
          <VideoRow
            key={cat.label}
            label={cat.label}
            videos={cat.videos}
            thumb={thumb}
            onSelect={(v) => navigate(`/catalogo?video=${v.id}`)}
            onHover={(v, rect) => { setHoveredVideo(v); setHoverPos({ x: rect.x, y: rect.y }) }}
            onLeave={() => setHoveredVideo(null)}
          />
        ))}
      </div>

      {/* Hover Card */}
      {hoveredVideo && (
        <HoverCard
          video={hoveredVideo}
          thumb={thumb}
          pos={hoverPos}
          onClose={() => setHoveredVideo(null)}
          onPlay={() => { navigate(`/catalogo?video=${hoveredVideo.id}`); setHoveredVideo(null) }}
        />
      )}

      {/* Back button */}
      <div className="fixed bottom-5 right-5 z-50">
        <button onClick={() => navigate('/catalogo')} className="px-4 py-2.5 rounded-xl bg-green-600 text-white text-[12px] font-semibold shadow-lg hover:bg-green-700 hover:scale-105 transition-all">
          ← Voltar ao catálogo atual
        </button>
      </div>
    </div>
  )
}

// ─── Hero Carousel ───
function HeroCarousel({ videos, activeIndex, setActiveIndex, thumb, onPlay }: {
  videos: any[]; activeIndex: number; setActiveIndex: (i: number) => void; thumb: (v: any) => string; onPlay: (v: any) => void
}) {
  const video = videos[activeIndex]
  if (!video) return null

  return (
    <div className="relative h-[70vh] min-h-[450px] max-h-[650px] overflow-hidden">
      {/* Background image */}
      <img src={thumb(video)} alt="" className="absolute inset-0 w-full h-full object-cover object-[center_25%]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f1117] via-[#0f1117]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117] via-transparent to-[#0f1117]/30" />

      {/* Content */}
      <div className="absolute bottom-[20%] left-6 md:left-12 max-w-lg z-10">
        <h1 className="text-2xl md:text-4xl font-bold leading-tight line-clamp-3">{video.title}</h1>
        <p className="text-sm text-white/60 mt-2 line-clamp-2">{video.channelTitle || 'Rede Inspire'}</p>
        <div className="flex items-center gap-3 mt-5">
          <button onClick={() => onPlay(video)} className="flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-white/90 transition text-sm">
            <Play size={18} fill="currentColor" /> Assistir agora
          </button>
          <button className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:border-white/60 transition">
            <Info size={18} />
          </button>
        </div>
      </div>

      {/* Navigation arrows */}
      <button onClick={() => setActiveIndex((activeIndex - 1 + videos.length) % videos.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition z-10">
        <ChevronLeft size={20} />
      </button>
      <button onClick={() => setActiveIndex((activeIndex + 1) % videos.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition z-10">
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {videos.map((_, i) => (
          <button key={i} onClick={() => setActiveIndex(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i === activeIndex ? 'bg-white w-6' : 'bg-white/30 hover:bg-white/50'}`} />
        ))}
      </div>
    </div>
  )
}

// ─── Video Row (horizontal scroll) ───
function VideoRow({ label, videos, thumb, onSelect, onHover, onLeave }: {
  label: string; videos: any[]; thumb: (v: any) => string;
  onSelect: (v: any) => void;
  onHover: (v: any, rect: { x: number; y: number }) => void;
  onLeave: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setShowLeft(el.scrollLeft > 10)
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -600 : 600, behavior: 'smooth' })
  }

  useEffect(() => { checkScroll() }, [videos])

  if (videos.length === 0) return null

  return (
    <div className="group/row">
      <h2 className="text-[15px] font-semibold text-white/90 mb-3">{label}</h2>
      <div className="relative">
        {showLeft && (
          <button onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0f1117] to-transparent z-10 flex items-center justify-start pl-1 opacity-0 group-hover/row:opacity-100 transition">
            <ChevronLeft size={24} />
          </button>
        )}
        <div ref={scrollRef} onScroll={checkScroll}
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-2" style={{ scrollbarWidth: 'none' }}>
          {videos.map(v => (
            <div key={v.id} className="shrink-0 w-[200px] md:w-[240px] group/card cursor-pointer"
              onClick={() => onSelect(v)}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                onHover(v, { x: rect.left + rect.width / 2, y: rect.top })
              }}
              onMouseLeave={onLeave}>
              <div className="relative rounded-lg overflow-hidden aspect-video bg-zinc-800">
                <img src={thumb(v)} alt="" className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/20 transition" />
              </div>
              <p className="text-[11px] text-white/60 mt-1.5 line-clamp-1 group-hover/card:text-white/90 transition">{v.title}</p>
            </div>
          ))}
        </div>
        {showRight && (
          <button onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0f1117] to-transparent z-10 flex items-center justify-end pr-1 opacity-0 group-hover/row:opacity-100 transition">
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Hover Card (expanded preview) ───
function HoverCard({ video, thumb, pos, onClose, onPlay }: {
  video: any; thumb: (v: any) => string; pos: { x: number; y: number }; onClose: () => void; onPlay: () => void
}) {
  return (
    <div className="fixed inset-0 z-40 pointer-events-none hidden md:block">
      <div
        className="absolute pointer-events-auto w-[340px] rounded-xl overflow-hidden bg-[#1a1d2e] shadow-2xl shadow-black/60 border border-white/5 animate-in fade-in zoom-in-95 duration-200"
        style={{ left: Math.min(Math.max(pos.x - 170, 20), window.innerWidth - 360), top: Math.max(pos.y - 50, 20) }}
        onMouseLeave={onClose}>
        {/* Preview image */}
        <div className="relative aspect-video">
          <img src={thumb(video)} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1d2e] via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition">
            <X size={12} />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">{video.title}</h3>
          <p className="text-[11px] text-white/40 mt-1">{video.channelTitle || 'Rede Inspire'}</p>

          <div className="flex items-center gap-2 mt-3">
            <button onClick={onPlay} className="flex items-center gap-1.5 bg-white text-black font-semibold px-4 py-2 rounded-lg text-xs hover:bg-white/90 transition">
              <Play size={14} fill="currentColor" /> Assistir
            </button>
            <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-white/40 transition">
              <Info size={13} />
            </button>
          </div>

          {video.description && (
            <p className="text-[10px] text-white/30 mt-3 line-clamp-3 leading-relaxed">{video.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Build categories from tags ───
function buildCategories(videos: any[], tagMap: Record<string, string[]>) {
  // Collect all tags and group videos
  const tagGroups: Record<string, any[]> = {}
  const untagged: any[] = []

  for (const v of videos) {
    const tags = tagMap[v.id] || []
    if (tags.length === 0) {
      untagged.push(v)
    } else {
      for (const tag of tags) {
        if (!tagGroups[tag]) tagGroups[tag] = []
        tagGroups[tag].push(v)
      }
    }
  }

  // Sort categories by number of videos (most first)
  const sorted = Object.entries(tagGroups)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([label, vids]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), videos: vids }))

  // Add "Todos os conteúdos" at the end with untagged + all
  if (untagged.length > 0) {
    sorted.push({ label: 'Mais conteúdos', videos: untagged })
  }

  // If no tags exist, just show all in one row
  if (sorted.length === 0) {
    sorted.push({ label: 'Todos os conteúdos', videos: videos.slice(5) })
  }

  return sorted
}
