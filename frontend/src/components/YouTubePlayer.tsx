import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2 } from 'lucide-react'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: (() => void) | undefined
  }
}

let apiLoaded = false
let apiReady = false
const readyCallbacks: (() => void)[] = []

function loadYTApi() {
  if (apiLoaded) return
  apiLoaded = true
  const tag = document.createElement('script')
  tag.src = 'https://www.youtube.com/iframe_api'
  document.head.appendChild(tag)
  window.onYouTubeIframeAPIReady = () => {
    apiReady = true
    readyCallbacks.forEach(cb => cb())
    readyCallbacks.length = 0
  }
}

function onApiReady(cb: () => void) {
  if (apiReady) cb()
  else readyCallbacks.push(cb)
}

interface Props {
  videoId: string
  autoplay?: boolean
}

export default function YouTubePlayer({ videoId, autoplay = true }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(80)
  const [muted, setMuted] = useState(false)
  const [buffered, setBuffered] = useState(0)
  const [ready, setReady] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const startHideTimer = useCallback(() => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current)
    setShowControls(true)
    if (playing) {
      hideTimeout.current = setTimeout(() => setShowControls(false), 3000)
    }
  }, [playing])

  // Load API and create player
  useEffect(() => {
    loadYTApi()
    onApiReady(() => {
      if (!containerRef.current) return
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (e: any) => {
            setReady(true)
            setDuration(e.target.getDuration())
            e.target.setVolume(volume)
            if (autoplay) setPlaying(true)
          },
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.PLAYING) setPlaying(true)
            else if (e.data === window.YT.PlayerState.PAUSED) setPlaying(false)
            else if (e.data === window.YT.PlayerState.ENDED) setPlaying(false)
          },
        },
      })
    })

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current)
      if (playerRef.current?.destroy) playerRef.current.destroy()
    }
  }, [videoId])

  // Progress tracking
  useEffect(() => {
    if (progressInterval.current) clearInterval(progressInterval.current)
    if (playing && playerRef.current) {
      progressInterval.current = setInterval(() => {
        const p = playerRef.current
        if (p?.getCurrentTime) {
          setCurrentTime(p.getCurrentTime())
          setDuration(p.getDuration())
          setBuffered(p.getVideoLoadedFraction() * 100)
        }
      }, 250)
    }
    return () => { if (progressInterval.current) clearInterval(progressInterval.current) }
  }, [playing])

  // Fullscreen listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const togglePlay = () => {
    if (!playerRef.current) return
    if (playing) playerRef.current.pauseVideo()
    else playerRef.current.playVideo()
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    playerRef.current.seekTo(pct * duration, true)
    setCurrentTime(pct * duration)
  }

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    setVolume(v)
    setMuted(v === 0)
    playerRef.current?.setVolume(v)
    if (v > 0) playerRef.current?.unMute()
  }

  const toggleMute = () => {
    if (muted) { playerRef.current?.unMute(); playerRef.current?.setVolume(volume || 80); setMuted(false) }
    else { playerRef.current?.mute(); setMuted(true) }
  }

  const toggleFullscreen = () => {
    if (!wrapperRef.current) return
    if (document.fullscreenElement) document.exitFullscreen()
    else wrapperRef.current.requestFullscreen()
  }

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const progressPct = duration ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={wrapperRef}
      className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-lg group select-none"
      onMouseMove={startHideTimer}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={togglePlay}
    >
      {/* YouTube player container */}
      <div ref={containerRef} className="absolute inset-0 pointer-events-none" />

      {/* Loading overlay */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
          <Loader2 size={40} className="animate-spin text-white" />
        </div>
      )}

      {/* Big play button when paused */}
      {ready && !playing && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/30">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Play size={28} className="text-gray-900 ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Custom controls bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 transition-opacity duration-300 ${showControls || !playing ? 'opacity-100' : 'opacity-0'}`}
        onClick={e => e.stopPropagation()}
        style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}
      >
        {/* Progress bar */}
        <div className="px-3 pt-4">
          <div className="relative h-1 bg-white/20 rounded-full cursor-pointer group/prog hover:h-1.5 transition-all" onClick={seek}>
            <div className="absolute inset-y-0 left-0 bg-white/30 rounded-full" style={{ width: `${buffered}%` }} />
            <div className="absolute inset-y-0 left-0 bg-white rounded-full" style={{ width: `${progressPct}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/prog:opacity-100 transition" style={{ left: `${progressPct}%`, marginLeft: '-6px' }} />
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3 px-3 py-2 text-white">
          <button onClick={togglePlay} className="hover:scale-110 transition">
            {playing ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-0.5" />}
          </button>

          <span className="text-xs font-mono tabular-nums">{fmt(currentTime)} / {fmt(duration)}</span>

          <div className="flex items-center gap-1 group/vol">
            <button onClick={toggleMute} className="hover:scale-110 transition">
              {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range" min={0} max={100} value={muted ? 0 : volume}
              onChange={handleVolume}
              className="w-0 group-hover/vol:w-20 transition-all duration-200 accent-white h-1 cursor-pointer opacity-0 group-hover/vol:opacity-100"
            />
          </div>

          <div className="flex-1" />

          <button onClick={toggleFullscreen} className="hover:scale-110 transition">
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}
