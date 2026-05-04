import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react'

/* ── YouTube IFrame API loader (singleton) ── */
declare global {
  interface Window { YT: any; onYouTubeIframeAPIReady?: () => void }
}
let ytApiState: 'idle' | 'loading' | 'ready' = 'idle'
const ytCallbacks: (() => void)[] = []
function ensureYTApi(cb: () => void) {
  if (ytApiState === 'ready') { cb(); return }
  ytCallbacks.push(cb)
  if (ytApiState === 'loading') return
  ytApiState = 'loading'
  const s = document.createElement('script')
  s.src = 'https://www.youtube.com/iframe_api'
  document.head.appendChild(s)
  window.onYouTubeIframeAPIReady = () => {
    ytApiState = 'ready'
    ytCallbacks.forEach(fn => fn())
    ytCallbacks.length = 0
  }
}

/* ── Helpers ── */
const fmt = (s: number) => {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

/* ── Component ── */
interface Props { videoId: string; thumbnail?: string; title?: string }

export default function YouTubePlayer({ videoId, thumbnail, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [phase, setPhase] = useState<'poster' | 'loading' | 'playing'>('poster')
  const [paused, setPaused] = useState(true)
  const [time, setTime] = useState(0)
  const [dur, setDur] = useState(0)
  const [buf, setBuf] = useState(0)
  const [vol, setVol] = useState(80)
  const [muted, setMuted] = useState(false)
  const [full, setFull] = useState(false)
  const [showBar, setShowBar] = useState(true)

  /* ── Create YT player ── */
  const createPlayer = useCallback(() => {
    if (!containerRef.current) return
    setPhase('loading')

    // The API replaces the div with an iframe; we need a fresh child div each time
    const el = document.createElement('div')
    el.id = 'yt-player-' + videoId
    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(el)

    playerRef.current = new window.YT.Player(el.id, {
      videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: 1,
        controls: 0,        // ← hides ALL native controls
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        disablekb: 1,
        fs: 0,              // ← hides native fullscreen button
        playsinline: 1,
        cc_load_policy: 0,
        origin: window.location.origin,
      },
      events: {
        onReady(e: any) {
          e.target.setVolume(80)
          setDur(e.target.getDuration())
          setPhase('playing')
          setPaused(false)
        },
        onStateChange(e: any) {
          const YT = window.YT.PlayerState
          if (e.data === YT.PLAYING) setPaused(false)
          else if (e.data === YT.PAUSED) setPaused(true)
          else if (e.data === YT.ENDED) setPaused(true)
        },
      },
    })
  }, [videoId])

  /* ── Cleanup ── */
  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
      if (playerRef.current?.destroy) try { playerRef.current.destroy() } catch {}
    }
  }, [])

  /* ── Progress tick ── */
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current)
    if (!paused && phase === 'playing') {
      tickRef.current = setInterval(() => {
        const p = playerRef.current
        if (!p?.getCurrentTime) return
        setTime(p.getCurrentTime())
        setDur(p.getDuration())
        setBuf((p.getVideoLoadedFraction?.() ?? 0) * 100)
      }, 300)
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [paused, phase])

  /* ── Auto-hide controls ── */
  const resetHide = useCallback(() => {
    setShowBar(true)
    if (hideRef.current) clearTimeout(hideRef.current)
    if (!paused) hideRef.current = setTimeout(() => setShowBar(false), 3000)
  }, [paused])

  useEffect(() => { if (paused) setShowBar(true) }, [paused])

  /* ── Force iframe to fill container ── */
  useEffect(() => {
    if (phase !== 'playing' || !containerRef.current) return
    const iframe = containerRef.current.querySelector('iframe')
    if (iframe) {
      iframe.style.position = 'absolute'
      iframe.style.top = '0'
      iframe.style.left = '0'
      iframe.style.width = '100%'
      iframe.style.height = '100%'
      iframe.style.border = 'none'
    }
  }, [phase])

  /* ── Controls ── */
  const togglePlay = () => {
    const p = playerRef.current
    if (!p) return
    if (paused) p.playVideo(); else p.pauseVideo()
  }
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !dur) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    playerRef.current.seekTo(pct * dur, true)
    setTime(pct * dur)
  }
  const changeVol = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = +e.target.value; setVol(v); setMuted(v === 0)
    playerRef.current?.setVolume(v); if (v > 0) playerRef.current?.unMute()
  }
  const toggleMute = () => {
    if (muted) { playerRef.current?.unMute(); playerRef.current?.setVolume(vol || 80); setMuted(false) }
    else { playerRef.current?.mute(); setMuted(true) }
  }
  const toggleFull = () => setFull(f => !f)

  const pct = dur ? (time / dur) * 100 : 0
  const thumbSrc = thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

  /* ── Poster (before play) ── */
  if (phase === 'poster') {
    return (
      <div className="relative bg-black rounded-xl overflow-hidden shadow-lg cursor-pointer group" style={{ aspectRatio: '16/9' }}
        onClick={() => ensureYTApi(createPlayer)}>
        <img src={thumbSrc} alt={title || ''} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
            <Play size={28} className="text-gray-900 ml-1" fill="currentColor" />
          </div>
        </div>
      </div>
    )
  }

  /* ── Player (loading + playing) ── */
  return (
    <div
      className={`bg-black select-none ${full ? 'fixed inset-0 z-[9999]' : 'relative rounded-xl overflow-hidden shadow-lg'}`}
      style={full ? undefined : { aspectRatio: '16/9' }}
      onMouseMove={resetHide}
      onMouseLeave={() => !paused && setShowBar(false)}
    >
      {/* YT player container — the API creates an iframe inside this div */}
      <div ref={containerRef} className="absolute inset-0" style={{ pointerEvents: 'none' }} />

      {/* Click overlay — captures clicks, blocks YT native UI interaction */}
      <div className="absolute inset-0 z-10 cursor-pointer" onClick={togglePlay} />

      {/* Loading spinner */}
      {phase === 'loading' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Big play when paused */}
      {phase === 'playing' && paused && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 cursor-pointer" onClick={togglePlay}>
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Play size={28} className="text-gray-900 ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Custom controls bar */}
      {phase === 'playing' && (
        <div
          className={`absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-300 ${showBar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={e => e.stopPropagation()}
          style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}
        >
          {/* Progress */}
          <div className="px-4 pt-6">
            <div className="relative h-1 bg-white/20 rounded-full cursor-pointer group/p hover:h-1.5 transition-all" onClick={seek}>
              <div className="absolute inset-y-0 left-0 bg-white/30 rounded-full" style={{ width: `${buf}%` }} />
              <div className="absolute inset-y-0 left-0 bg-white rounded-full" style={{ width: `${pct}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow opacity-0 group-hover/p:opacity-100 transition"
                style={{ left: `calc(${pct}% - 7px)` }} />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 px-4 py-2.5 text-white">
            <button onClick={togglePlay} className="hover:scale-110 transition">
              {paused ? <Play size={22} fill="white" className="ml-0.5" /> : <Pause size={22} fill="white" />}
            </button>
            <span className="text-xs font-mono tabular-nums opacity-90">{fmt(time)} / {fmt(dur)}</span>
            <div className="flex items-center gap-1.5 group/v">
              <button onClick={toggleMute} className="hover:scale-110 transition">
                {muted || vol === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input type="range" min={0} max={100} value={muted ? 0 : vol} onChange={changeVol}
                className="w-0 group-hover/v:w-20 transition-all duration-200 accent-white h-1 cursor-pointer opacity-0 group-hover/v:opacity-100" />
            </div>
            <div className="flex-1" />
            <button onClick={toggleFull} className="hover:scale-110 transition">
              {full ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
