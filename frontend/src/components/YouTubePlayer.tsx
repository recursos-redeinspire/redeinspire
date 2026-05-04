import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react'

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

const fmt = (s: number) => {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

interface Props { videoId: string; thumbnail?: string; title?: string }

export default function YouTubePlayer({ videoId, thumbnail, title }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const ytDivRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [phase, setPhase] = useState<'poster' | 'loading' | 'ready'>('poster')
  const [paused, setPaused] = useState(true)
  const [time, setTime] = useState(0)
  const [dur, setDur] = useState(0)
  const [buf, setBuf] = useState(0)
  const [vol, setVol] = useState(80)
  const [muted, setMuted] = useState(false)
  const [full, setFull] = useState(false)
  const [showBar, setShowBar] = useState(true)

  const startPlayer = useCallback(() => {
    setPhase('loading')
    ensureYTApi(() => {
      if (!ytDivRef.current) return
      // Create a fresh div for the player
      const el = document.createElement('div')
      ytDivRef.current.innerHTML = ''
      ytDivRef.current.appendChild(el)

      playerRef.current = new window.YT.Player(el, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1, controls: 0, modestbranding: 1, rel: 0,
          showinfo: 0, iv_load_policy: 3, disablekb: 1, fs: 0,
          playsinline: 1, cc_load_policy: 0, origin: window.location.origin,
        },
        events: {
          onReady(e: any) {
            e.target.setVolume(80)
            setDur(e.target.getDuration())
            setPhase('ready')
            setPaused(false)
            // Force iframe sizing
            const iframe = ytDivRef.current?.querySelector('iframe')
            if (iframe) {
              iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none;'
            }
          },
          onStateChange(e: any) {
            const S = window.YT.PlayerState
            if (e.data === S.PLAYING) setPaused(false)
            else if (e.data === S.PAUSED || e.data === S.ENDED) setPaused(true)
          },
        },
      })
    })
  }, [videoId])

  // Cleanup
  useEffect(() => () => {
    if (tickRef.current) clearInterval(tickRef.current)
    if (playerRef.current?.destroy) try { playerRef.current.destroy() } catch {}
  }, [])

  // Progress tick
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current)
    if (!paused && phase === 'ready') {
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

  // Auto-hide bar
  const resetHide = useCallback(() => {
    setShowBar(true)
    if (hideRef.current) clearTimeout(hideRef.current)
    if (!paused) hideRef.current = setTimeout(() => setShowBar(false), 3000)
  }, [paused])
  useEffect(() => { if (paused) setShowBar(true) }, [paused])

  // Controls
  const togglePlay = () => { if (!playerRef.current) return; paused ? playerRef.current.playVideo() : playerRef.current.pauseVideo() }
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !dur) return
    const pct = Math.max(0, Math.min(1, (e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.getBoundingClientRect().width))
    playerRef.current.seekTo(pct * dur, true); setTime(pct * dur)
  }
  const changeVol = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = +e.target.value; setVol(v); setMuted(v === 0)
    playerRef.current?.setVolume(v); if (v > 0) playerRef.current?.unMute()
  }
  const toggleMute = () => {
    if (muted) { playerRef.current?.unMute(); playerRef.current?.setVolume(vol || 80); setMuted(false) }
    else { playerRef.current?.mute(); setMuted(true) }
  }

  const pct = dur ? (time / dur) * 100 : 0
  const thumbSrc = thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

  // ── Poster ──
  if (phase === 'poster') {
    return (
      <div className="relative bg-black rounded-xl overflow-hidden shadow-lg cursor-pointer group" style={{ aspectRatio: '16/9' }}
        onClick={startPlayer}>
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

  // ── Player ──
  return (
    <div
      ref={wrapperRef}
      className={`bg-black select-none ${full ? 'fixed inset-0 z-[9999]' : 'relative rounded-xl overflow-hidden shadow-lg'}`}
      style={full ? undefined : { aspectRatio: '16/9' }}
      onMouseMove={resetHide}
      onMouseLeave={() => !paused && setShowBar(false)}
    >
      {/* YT player lives here */}
      <div ref={ytDivRef} className="absolute inset-0" />

      {/* Transparent overlay — blocks ALL interaction with YouTube iframe */}
      <div className="absolute inset-0 z-10" onClick={togglePlay} />

      {/* Loading */}
      {phase === 'loading' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Big play when paused */}
      {phase === 'ready' && paused && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 cursor-pointer" onClick={togglePlay}>
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Play size={28} className="text-gray-900 ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Controls */}
      {phase === 'ready' && (
        <div
          className={`absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-300 ${showBar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={e => e.stopPropagation()}
          style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}
        >
          <div className="px-4 pt-6">
            <div className="relative h-1 bg-white/20 rounded-full cursor-pointer group/p hover:h-1.5 transition-all" onClick={seek}>
              <div className="absolute inset-y-0 left-0 bg-white/30 rounded-full" style={{ width: `${buf}%` }} />
              <div className="absolute inset-y-0 left-0 bg-white rounded-full" style={{ width: `${pct}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow opacity-0 group-hover/p:opacity-100 transition"
                style={{ left: `calc(${pct}% - 7px)` }} />
            </div>
          </div>
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
            <button onClick={() => setFull(f => !f)} className="hover:scale-110 transition">
              {full ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
