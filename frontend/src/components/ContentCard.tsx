import type { Content } from '../types'
import { MediaVideo, Headset, Page, Link as LinkIcon, Folder } from 'iconoir-react'
import type { ComponentType } from 'react'

const TYPE_ICONS: Record<string, ComponentType<any>> = {
  video: MediaVideo,
  audio: Headset,
  document: Page,
  link: LinkIcon,
}

interface Props {
  content: Content
  onClick?: () => void
}

export default function ContentCard({ content, onClick }: Props) {
  const Icon = TYPE_ICONS[content.type] ?? Folder
  return (
    <button
      onClick={onClick}
      className="flex w-full flex-col overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md text-left"
    >
      <div className="aspect-video w-full bg-gradient-to-br from-gray-200 to-gray-200 flex items-center justify-center text-slate-400">
        <Icon width={40} height={40} strokeWidth={1.5} />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{content.title}</h3>
        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{content.description}</p>
        <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
          <span>{content.durationMinutes} min</span>
          <span className="capitalize">{content.type}</span>
        </div>
      </div>
    </button>
  )
}
