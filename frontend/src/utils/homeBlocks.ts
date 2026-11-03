// Funções puras de composição dos blocos da Home (Top / Sugestões / Recentes).
// Toda a lógica de ranking e cascata de recomendação vive aqui, isolada do
// efeito (fetch/estado/render) para ser determinística e testável.
import { similarity } from './textSimilarity'

// Limiares e pesos (valores decididos no design, fáceis de ajustar).
export const MIN_TOTAL_VIEWS_FOR_TOP = 10
export const MIN_HISTORY_FOR_PERSONALIZED = 4
export const W_PLAYLIST = 3
export const W_TITLE = 2
export const W_TAGCAT = 2

type Video = { id: string; title?: string; [k: string]: any }
type RecentItem = { type: string; refId: string; title?: string; [k: string]: any }
type Views = Record<string, number>
type TagMap = Record<string, string[]>
type CategoriesMap = Record<string, string[]>
type VideoPlaylist = Record<string, string>

// Top Conteúdos: ordena por views reais quando a plataforma já acumulou views
// suficientes; senão devolve o pool na ordem atual das seções (modo padrão).
export function rankTop(rest: Video[], views: Views): Video[] {
  const totalViews = Object.values(views).reduce((a, b) => a + (b || 0), 0)
  if (totalViews < MIN_TOTAL_VIEWS_FOR_TOP) return rest // modo padrão: ordem atual
  return [...rest]
    .map((v, i) => ({ v, i }))
    .sort((a, b) => ((views[b.v.id] || 0) - (views[a.v.id] || 0)) || (a.i - b.i))
    .map(x => x.v)
}

// Sugestões para você: cascata de sinais (playlist + título + tag/categoria)
// sobre o histórico pessoal. Abaixo do limiar de histórico, cai para modo
// padrão (mais vistos ainda-não-vistos; se views baixo, primeiros do pool).
export function rankSuggestions({
  rest,
  recent,
  videoPlaylist,
  tagMap,
  categoriesMap,
  views,
}: {
  rest: Video[]
  recent: RecentItem[]
  videoPlaylist: VideoPlaylist
  tagMap: TagMap
  categoriesMap: CategoriesMap
  views: Views
}): Video[] {
  const seenVideosRecent = recent.filter(r => r.type === 'video')
  const seenIds = new Set(seenVideosRecent.map(r => r.refId))
  const seenVideos = rest.filter(v => seenIds.has(v.id)) // vistos que ainda temos no pool

  // Título do visto: SEMPRE preferir o título real do pool; só cair para o
  // título cru do histórico quando o id visto não está no pool.
  const poolTitleById = new Map(rest.map(v => [v.id, v.title || '']))
  const seenTitles = seenVideosRecent
    .map(r => poolTitleById.get(r.refId) || r.title || '')
    .filter(t => t.trim().length > 0)
  const seenPlaylists = new Set(seenVideos.map(v => videoPlaylist[v.id]).filter(Boolean))
  const seenTags = new Set(seenVideos.flatMap(v => tagMap[v.id] || []))
  const seenCats = new Set(seenVideos.flatMap(v => categoriesMap[v.id] || []))

  const scoreCandidate = (v: Video): number => {
    let s = 0
    if (videoPlaylist[v.id] && seenPlaylists.has(videoPlaylist[v.id])) s += W_PLAYLIST
    const bestSim = seenTitles.reduce((m, t) => Math.max(m, similarity(v.title || '', t)), 0)
    s += W_TITLE * bestSim
    const tags = tagMap[v.id] || []
    if (tags.some(t => seenTags.has(t))) s += W_TAGCAT
    const cats = categoriesMap[v.id] || []
    if (cats.some(c => seenCats.has(c))) s += W_TAGCAT
    return s
  }

  const notSeen = rest.filter(v => !seenIds.has(v.id))

  if (seenIds.size >= MIN_HISTORY_FOR_PERSONALIZED) {
    return notSeen
      .map(v => ({ v, s: scoreCandidate(v) }))
      .filter(x => x.s > 0) // só recomenda quem tem algum sinal
      .sort((a, b) => b.s - a.s)
      .map(x => x.v)
  }

  // Modo padrão: mais vistos ainda-não-vistos; se views abaixo do limiar,
  // primeiros do pool (ordem atual das seções).
  const totalViews = Object.values(views).reduce((a, b) => a + (b || 0), 0)
  if (totalViews < MIN_TOTAL_VIEWS_FOR_TOP) return notSeen
  return [...notSeen]
    .map((v, i) => ({ v, i }))
    .sort((a, b) => ((views[b.v.id] || 0) - (views[a.v.id] || 0)) || (a.i - b.i))
    .map(x => x.v)
}

// Dedup entre blocos: Top(5) -> Sugestões(3) -> Recentes(4), cada bloco
// excluindo o destaque, os vistos e os ids já usados por blocos anteriores.
export function composeBlocks({
  videos,
  featured,
  views,
  recent,
  videoPlaylist,
  tagMap,
  categoriesMap,
}: {
  videos: Video[]
  featured: Video | null
  views: Views
  recent: RecentItem[]
  videoPlaylist: VideoPlaylist
  tagMap: TagMap
  categoriesMap: CategoriesMap
}): { topContent: Video[]; suggestions: Video[]; moreVideos: Video[] } {
  const rest = videos.filter(v => v.id !== featured?.id)
  const seenIds = new Set(recent.filter(r => r.type === 'video').map(r => r.refId))
  const used = new Set<string>()

  const topContent = rankTop(rest, views).filter(v => !used.has(v.id)).slice(0, 5)
  topContent.forEach(v => used.add(v.id))

  const suggestions = rankSuggestions({ rest, recent, videoPlaylist, tagMap, categoriesMap, views })
    .filter(v => !used.has(v.id) && !seenIds.has(v.id))
    .slice(0, 3)
  suggestions.forEach(v => used.add(v.id))

  const moreVideos = rest.filter(v => !used.has(v.id) && !seenIds.has(v.id)).slice(0, 4)

  return { topContent, suggestions, moreVideos }
}
