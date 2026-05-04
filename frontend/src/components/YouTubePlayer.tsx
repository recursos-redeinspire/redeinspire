import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react'

/* ── YouTube IFrame API loader (singleton) ── */
declare global {
  interface Window { YT: any; onYouTubeIframeAPIReady?: () => void }
}
let _apiReady = false
const _cbs: (() => void)[] = []
function ensureApi(cb: () => void) {
  if (_apiReady) return cb()
  _cbs.push(cb)
  if (document.querySelector('script[src*="youtube.com/iframe_api"]')) return
  const s = document.createElement('script')
  s.src = 'https://www.youtube.com/iframe_api'
  document.head.appendChild(s)
  window.onYouTubeIframeAPIReady = () => { _apiReady = true; _cbs.forEach(fn => fn()); _cbs.length = 0 }
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface Props { videoId: string; thumbnail?: string; title?: string }

export default function YouTubePlayer({ videoId, thumbnail, title }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const ytDivRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [phase, setPhase] = useState<'poster' | 'loading' | 'playing'>('poster')
  const [paused, setPaused] = useState(true)
  const [cur, setCur] = useState(0)
  const [dur, setDur] = useState(0)
  const [buf, setBuf] = useState(0)
  const [vol, setVol] = useState(80)
  const [muted, setMuted] = useState(false)
  const [fs, setFs] = useState(false)
  const [showBar, setShowBar] = useState(true)

  /* ── create / destroy player ── */
  const createPlayer = useCallback(() => {
    if (!ytDivRef.current) return
    setPhase('loading')
    ensureApi(() => {
      if (playerRef.current) { try { playerRef.current.destroy() } catch {} }
      // The API replaces the div with an iframe; we need a fresh div each time
      const el = document.createElement('div')
      el.id = 'yt-' + videoId + '-' + Date.now()
      ytDivRef.current!.innerHTML = ''
      ytDivRef.current!.appendChild(el)

      playerRef.current = new window.YT.Player(el.id, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1, controls: 0, modestbranding: 1, rel: 0,
          showinfo: 0, iv_load_policy: 3, disablekb: 1, fs: 0,
          playsinline: 1, cc_load_policy: 0,
        },
        events: {
          onReady(e: any) {
            e.target.setVolume(vol)
            setDur(e.target.getDuration())
            setPhase('playing')
            setPaused(false)
          },
          onStateChange(e: any) {
            const YT = window.YT.PlayerState
            if (e.data === YT.PLAYING) setPaused(false)
            else if (e.data === YT.PAUSED || e.data === YT.ENDED) setPaused(true)
          },
        },
      })
    })
  }, [videoId, vol])

  /* cleanup */
  useEffect(() => () => {
    if (tickRef.current) clearInterval(tickRef.current)
    if (playerRef.current) { try { playerRef.current.destroy() } catch {} }
  }, [])

  /* progress tick */
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current)
    if (phase === 'playing' && !paused) {
      tickRef.current = setInterval(() => {
        const p = playerRef.current
        if (!p?.getCurrentTime) return
        setCur(p.getCurrentTime())
        setDur(p.getDuration())
        setBuf((p.getVideoLoadedFraction?.() ?? 0) * 100)
      }, 300)
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [phase, paused])

  /* auto-hide controls */
  const armHide = useCallback(() => {
    if (hideRef.current) clearTimeout(hideRef.current)
    setShowBar(true)
    if (!paused) hideRef.current = setTimeout(() => setShowBar(false), 3000)
  }, [paused])

  /* ESC to exit CSS fullscreen */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && fs) setFs(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [fs])

  /* ── actions ── */
  const toggle = () => {
    if (!playerRef.current) return
    if (paused) playerRef.current.playVideo(); else playerRef.current.pauseVideo()
  }
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !dur) return
    const r = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
    playerRef.current.seekTo(pct * dur, true)
    setCur(pct * dur)
  }
  const changeVol = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = +e.target.value; setVol(v); setMuted(v === 0)
    playerRef.current?.setVolume(v); if (v > 0) playerRef.current?.unMute()
  }
  const toggleMute = () => {
    if (muted) { playerRef.current?.unMute(); playerRef.current?.setVolume(vol || 80); setMuted(false) }
    else { playerRef.current?.mute(); setMuted(true) }
  }
  const toggleFs = () => setFs(f => !f)

  const pct = dur ? (cur / dur) * 100 : 0

  /* ── CSS fullscreen (not native — our overlay stays on top) ── */
  const containerCls = fs
    ? 'fixed inset-0 z-[9999] bg-black'
    : 'relative rounded-xl overflow-hidden shadow-lg'

  /* ── POSTER (before play) ── */
  if (phase === 'poster') {
    return (
      <div className="relative rounded-xl overflow-hidden shadow-lg cursor-pointer group bg-black" style={{ aspectRatio: '16/9' }}
        onClick={createPlayer}>
        <img
          src={thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          alt={title || ''} className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
            <Play size={28} className="text-gray-900 ml-1" fill="currentColor" />
          </div>
        </div>
      </div>
    )
  }

  /* ── PLAYER ── */
  return (
    <div ref={wrapperRef} className={containerCls}
      style={fs ? undefined : { aspectRatio: '16/9' }}
      onMouseMove={armHide} onMouseLeave={() => !paused && setShowBar(false)}>

      {/* YT iframe lives here — pointer-events:none so user can't click YT buttons */}
      <div ref={ytDivRef} className="absolute inset-0" style={{ pointerEvents: 'none' }} />

      {/* Make the iframe fill the container */}
      <style>{`
        #${ytDivRef.current?.firstElementChild?.id} { position:absolute!important; inset:0!important; width:100%!important; height:100%!important; }
        #${ytDivRef.current?.firstElementChild?.id} iframe { width:100%!important; height:100%!important; }
      `}</style>

      {/* Click area (play/pause) */}
      <div className="absolute inset-0 z-10 cursor-pointer" onClick={toggle} />

      {/* Loading spinner */}
      {phase === 'loading' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Big play when paused */}
      {phase === 'playing' && paused && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 cursor-pointer" onClick={toggle}>
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-110 transition">
            <Play size={28} className="text-gray-900 ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Controls bar */}
      {phase === 'playing' && (
        <div className={`absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-300 ${showBar || paused ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={e => e.stopPropagation()}
          style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}>

          {/* Progress */}
          <div className="px-3 pt-6">
            <div className="relative h-1 bg-white/20 rounded-full cursor-pointer group/p hover:h-1.5 transition-all" onClick={seek}>
              <div className="absolute inset-y-0 left-0 bg-white/30 rounded-full" style={{ width: `${buf}%` }} />
              <div className="absolute inset-y-0 left-0 bg-white rounded-full" style={{ width: `${pct}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow opacity-0 group-hover/p:opacity-100 transition"
                style={{ left: `calc(${pct}% - 7px)` }} />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 px-3 py-2.5 text-white">
            <button onClick={toggle} className="hover:scale-110 transition">
              {paused ? <Play size={22} fill="white" className="ml-0.5" /> : <Pause size={22} fill="white" />}
            </button>
            <span className="text-xs font-mono tabular-nums opacity-90">{fmt(cur)} / {fmt(dur)}</span>
            <div className="flex items-center gap-1.5 group/v">
              <button onClick={toggleMute} className="hover:scale-110 transition">
                {muted || vol === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input type="range" min={0} max={100} value={muted ? 0 : vol} onChange={changeVol}
                className="w-0 group-hover/v:w-20 transition-all duration-200 accent-white h-1 cursor-pointer opacity-0 group-hover/v:opacity-100" />
            </div>
            <div className="flex-1" />
            <button onClick={toggleFs} className="hover:scale-110 transition">
              {fs ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      )}

      {/* ESC to exit fullscreen */}
      {fs && <div className="absolute top-4 right-4 z-40 text-white/50 text-xs">ESC para sair</div>}
    </div>
  )
}
