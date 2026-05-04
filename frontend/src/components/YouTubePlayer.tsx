import { useState } from 'react'
import { Play } from 'lucide-react'

interface Props {
  videoId: string
  thumbnail?: string
  title?: string
}

export default function YouTubePlayer({ videoId, thumbnail, title }: Props) {
  const [started, setStarted] = useState(false)

  // Only show the iframe when user clicks play — this way the YT UI never shows initially
  if (!started) {
    return (
      <div
        className="relative bg-black rounded-xl overflow-hidden shadow-lg cursor-pointer group"
        style={{ aspectRatio: '16/9' }}
        onClick={() => setStarted(true)}
      >
        {/* Thumbnail */}
        {thumbnail ? (
          <img src={thumbnail} alt={title || ''} className="w-full h-full object-cover" />
        ) : (
          <img
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt={title || ''}
            className="w-full h-full object-cover"
          />
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition" />
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
            <Play size={28} className="text-gray-900 ml-1" fill="currentColor" />
          </div>
        </div>
      </div>
    )
  }

  // Playing state — iframe with controls but overlay blocks share/YT buttons
  return (
    <div
      className="relative bg-black rounded-xl overflow-hidden shadow-lg"
      style={{ aspectRatio: '16/9' }}
    >
      {/* YouTube iframe — full size */}
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&fs=1&playsinline=1`}
        title={title || ''}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; fullscreen"
        allowFullScreen
        style={{ border: 'none' }}
      />
      {/* Top overlay — blocks title, share, watch later buttons */}
      <div className="absolute top-0 left-0 right-0 h-14 z-10 pointer-events-auto" style={{ background: 'linear-gradient(rgba(0,0,0,0.7), transparent)' }} />
      {/* Bottom-right overlay — blocks YT logo */}
      <div className="absolute bottom-0 right-0 w-36 h-10 z-10 pointer-events-auto" style={{ background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.8) 30%)' }} />
    </div>
  )
}
