import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { storeGetList, storeSet, generateId } from '../store/localStore'
import { useAuth, authHeaders } from './AuthContext'

const API = import.meta.env.VITE_API_BASE_URL || ''

// ---- Types ----
interface ContentItem {
  id: string; title: string; description: string; categorySlug: string; type: string
  durationMinutes: number; thumbnailUrl: string; createdAt: string; popularity: number; views: number
}
interface TrailItem {
  id: string; title: string; description: string; modules: any[]; totalDurationMinutes: number
  points: number; isMandatory: boolean
}
interface TrailProgressItem {
  id: string; trailId: string; userId: string; completedModules: string[]
  percentComplete: number; startedAt: string; completedAt?: string
}
interface MessageItem {
  id: string; fromUserId: string; fromName: string; toUserId: string
  subject: string; body: string; isRead: boolean; createdAt: string
}
interface PlanItem {
  id: string; userId: string; type: string; title: string; data: any
  createdAt: string; updatedAt: string
}
interface ChurchItem {
  id: string; name: string; city: string; state: string; lat: number; lng: number
  pastorName: string; memberCount: number; engagementScore: number
}
interface PodcastItem {
  id: string; title: string; description: string; durationSeconds: number
  audioUrl: string; publishedAt: string
}
interface PodcastProgressItem {
  id: string; episodeId: string; userId: string; currentTime: number; completed: boolean
}

interface DataContextType {
  getContents: (categorySlug?: string, type?: string, sortBy?: string) => Promise<ContentItem[]>
  getContentById: (id: string) => Promise<ContentItem | null>
  createContent: (data: { title: string; description: string; categorySlug: string; type: string; durationMinutes: number; thumbnailUrl?: string; contentUrl?: string }) => Promise<ContentItem | null>
  deleteContent: (id: string) => Promise<boolean>
  updateContent: (id: string, data: Record<string, any>) => Promise<boolean>
  deleteContentByCategory: (categorySlug: string) => Promise<number>
  searchContents: (query: string, type?: string, sortBy?: string) => Promise<ContentItem[]>
  getTopContents: (limit?: number) => Promise<ContentItem[]>
  getTrendingContents: (limit?: number) => Promise<ContentItem[]>
  getRecommendedContents: () => Promise<ContentItem[]>
  getNewReleases: (limit?: number) => Promise<ContentItem[]>
  recordContentAccess: (contentId: string) => Promise<void>
  getUserHistory: () => { contentId: string; title: string; accessedAt: string }[]
  getTrails: () => Promise<(TrailItem & { progress?: TrailProgressItem })[]>
  createTrail: (data: { title: string; description: string; points: number; isMandatory: boolean; modules: { title: string; order: number; durationMinutes: number; contentId?: string }[] }) => Promise<TrailItem | null>
  deleteTrail: (trailId: string) => Promise<boolean>
  startTrail: (trailId: string) => Promise<void>
  completeModule: (trailId: string, moduleId: string) => Promise<void>
  getAcademyCourses: () => Promise<any[]>
  enrollCourse: (trailId: string) => Promise<boolean>
  getWebinars: () => Promise<any[]>
  createWebinar: (data: { title: string; description: string; scheduledAt: string; meetingUrl: string; hostName: string }) => Promise<any>
  deleteWebinar: (webinarId: string) => Promise<boolean>
  enrollWebinar: (webinarId: string) => Promise<boolean>
  getMentoringSessions: () => Promise<any[]>
  createMentoringSession: (data: { title: string; description: string; scheduledAt: string; meetingUrl?: string; mentorName: string; mentorId: string; pastorName: string; pastorId: string }) => Promise<any>
  deleteMentoringSession: (sessionId: string) => Promise<boolean>
  completeMentoringSession: (sessionId: string) => Promise<boolean>
  getMetrics: () => Promise<any>
  getLeaderRanking: () => Promise<any[]>
  getTimeline: () => Promise<any[]>
  getRecentAccesses: () => Promise<any[]>
  getMessages: () => Promise<MessageItem[]>
  getUnreadCount: () => Promise<number>
  markAsRead: (messageId: string) => Promise<void>
  sendMessage: (toUserId: string, subject: string, body: string) => Promise<any>
  getMessageRecipients: () => Promise<any[]>
  getMinistries: () => Promise<any[]>
  getMyPoints: () => Promise<number>
  getPointsRanking: () => Promise<{ rank: number; name: string; points: number }[]>
  getMaterials: () => Promise<any[]>
  createMaterial: (data: { title: string; description: string; category: string; fileUrl?: string; fileName?: string }) => Promise<any>
  updateMaterial: (id: string, data: Record<string, any>) => Promise<boolean>
  deleteMaterial: (id: string) => Promise<boolean>
  syncDropbox: () => Promise<{ synced: number; total: number; message: string }>
  browseDropbox: (path: string) => Promise<{ path: string; entries: any[] }>
  downloadDropbox: (path: string, action?: 'view' | 'download') => Promise<{ url: string; name: string }>
  smartSearchDropbox: (q: string) => Promise<{ entries: any[]; totalResults: number; keywords: string[] }>
  getDropboxLink: (dropboxPath: string) => Promise<{ link: string }>
  getYoutubeVideos: (pageToken?: string, limit?: number) => Promise<{ videos: any[]; totalResults: number; nextPageToken: string | null; prevPageToken: string | null }>
  searchYoutube: (q: string, pageToken?: string) => Promise<{ videos: any[]; totalResults: number; nextPageToken: string | null }>
  smartSearchYoutube: (q: string) => Promise<{ videos: any[]; totalResults: number; keywords: string[] }>
  getComments: (videoId: string) => Promise<any[]>
  addComment: (videoId: string, videoTitle: string, text: string) => Promise<any>
  getVideoTags: (videoId: string) => Promise<{ videoId: string; tags: string[] }>
  saveVideoTags: (videoId: string, tags: string[]) => Promise<any>
  getAllVideoTags: () => Promise<{ tagMap: Record<string, string[]>; allTags: string[] }>
  getVideoRecs: (videoId: string) => Promise<{ videoId: string; items: any[] }>
  addVideoRec: (videoId: string, data: any) => Promise<any>
  deleteVideoRec: (videoId: string, itemId: string) => Promise<any>
  getTopDownloads: () => Promise<{ rank: number; filePath: string; fileName: string; downloads: number }[]>
  getBanner: () => Promise<{ active: boolean; message: string; type: string }>
  getUploadPresignedUrl: (fileName: string, contentType: string) => Promise<{ uploadUrl: string; fileUrl: string }>
  createMinistry: (data: { name: string; description: string; leaderId?: string; leaderName?: string }) => Promise<any>
  updateMinistry: (id: string, data: Record<string, any>) => Promise<boolean>
  deleteMinistry: (id: string) => Promise<boolean>
  getChurches: () => Promise<ChurchItem[]>
  getTopChurches: (limit?: number) => Promise<ChurchItem[]>
  createChurch: (data: { name: string; pastorId?: string; pastorName?: string; cep: string; address: string; city: string; state: string; lat: number; lng: number; memberCount: number; phone: string; logoUrl?: string; themeColor?: string }) => Promise<any>
  updateChurch: (id: string, data: Record<string, any>) => Promise<boolean>
  deleteChurch: (id: string) => Promise<boolean>
  getPlans: () => Promise<PlanItem[]>
  savePlan: (type: string, title: string, data: any, planId?: string) => Promise<void>
  deletePlan: (planId: string) => Promise<void>
  getPodcastEpisodes: () => Promise<PodcastItem[]>
  createPodcast: (data: { title: string; description: string; durationSeconds: number; audioUrl: string; publishedAt?: string }) => Promise<any>
  updatePodcast: (id: string, data: Record<string, any>) => Promise<boolean>
  deletePodcast: (id: string) => Promise<boolean>
  getPodcastProgress: (episodeId: string) => Promise<PodcastProgressItem | null>
  updatePodcastProgress: (episodeId: string, currentTime: number, completed?: boolean) => Promise<void>
}

const DataContext = createContext<DataContextType | null>(null)

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const resp = await fetch(`${API}${path}`, { ...opts, headers: { ...authHeaders(), ...opts?.headers } })
  return resp.json()
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id ?? ''

  // ---- Content ----
  const getContents = useCallback(async (categorySlug?: string, type?: string, sortBy?: string) => {
    if (API) {
      try {
        const params = new URLSearchParams()
        if (categorySlug) params.set('categorySlug', categorySlug)
        if (type) params.set('type', type)
        if (sortBy) params.set('sortBy', sortBy)
        return await apiFetch<ContentItem[]>(`/content?${params}`)
      } catch {}
    }
    let items = storeGetList<ContentItem>('contents')
    if (categorySlug) items = items.filter(c => c.categorySlug === categorySlug)
    if (type) items = items.filter(c => c.type === type)
    if (sortBy === 'date') items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    else items.sort((a, b) => b.popularity - a.popularity)
    return items
  }, [])

  const getContentById = useCallback(async (id: string): Promise<ContentItem | null> => {
    if (API) {
      try { return await apiFetch<ContentItem>(`/content/${id}`) } catch {}
    }
    return storeGetList<ContentItem>('contents').find(c => c.id === id) ?? null
  }, [])

  const createContent = useCallback(async (data: { title: string; description: string; categorySlug: string; type: string; durationMinutes: number; thumbnailUrl?: string; contentUrl?: string }): Promise<ContentItem | null> => {
    if (API) {
      try {
        const result = await apiFetch<ContentItem>('/content', { method: 'POST', body: JSON.stringify(data) })
        return result
      } catch {}
    }
    // Local fallback
    const item: ContentItem = { id: generateId(), ...data, thumbnailUrl: data.thumbnailUrl || '', createdAt: new Date().toISOString(), popularity: 0, views: 0 }
    const items = storeGetList<ContentItem>('contents')
    items.push(item)
    storeSet('contents', items)
    return item
  }, [])

  const deleteContent = useCallback(async (id: string): Promise<boolean> => {
    if (API) {
      try { const r = await apiFetch<{ ok: boolean }>(`/content/${id}`, { method: 'DELETE' }); return !!r.ok } catch {}
    }
    const items = storeGetList<ContentItem>('contents').filter(c => c.id !== id)
    storeSet('contents', items)
    return true
  }, [])

  const updateContent = useCallback(async (id: string, data: Record<string, any>): Promise<boolean> => {
    if (API) { try { const r = await apiFetch<{ ok: boolean }>(`/content/${id}`, { method: 'PUT', body: JSON.stringify(data) }); return !!r.ok } catch {} }
    return false
  }, [])

  const deleteContentByCategory = useCallback(async (categorySlug: string): Promise<number> => {
    if (API) {
      try { const r = await apiFetch<{ ok: boolean; deleted: number }>(`/content/category/${categorySlug}`, { method: 'DELETE' }); return r.deleted ?? 0 } catch {}
    }
    const all = storeGetList<ContentItem>('contents')
    const remaining = all.filter(c => c.categorySlug !== categorySlug)
    const count = all.length - remaining.length
    storeSet('contents', remaining)
    return count
  }, [])

  const searchContents = useCallback(async (query: string, type?: string, sortBy?: string) => {
    if (API) {
      try {
        const params = new URLSearchParams({ q: query })
        if (type) params.set('type', type)
        if (sortBy) params.set('sortBy', sortBy)
        return await apiFetch<ContentItem[]>(`/search?${params}`)
      } catch {}
    }
    const q = query.toLowerCase()
    let items = storeGetList<ContentItem>('contents').filter(c =>
      c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.categorySlug.toLowerCase().includes(q)
    )
    if (type) items = items.filter(c => c.type === type)
    if (sortBy === 'date') items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    else if (sortBy === 'popularity') items.sort((a, b) => b.popularity - a.popularity)
    return items
  }, [])

  const getTopContents = useCallback(async (limit = 10) => {
    if (API) { try { return await apiFetch<ContentItem[]>('/content/top10') } catch {} }
    return storeGetList<ContentItem>('contents').sort((a, b) => b.views - a.views).slice(0, limit)
  }, [])

  const getTrendingContents = useCallback(async (limit = 5) => {
    if (API) { try { return await apiFetch<ContentItem[]>('/content/trending') } catch {} }
    return storeGetList<ContentItem>('contents').sort((a, b) => b.popularity - a.popularity).slice(0, limit)
  }, [])

  const getRecommendedContents = useCallback(async () => {
    if (API) { try { return await apiFetch<ContentItem[]>('/content?sortBy=popularity') } catch {} }
    if (!user) return []
    const all = storeGetList<ContentItem>('contents')
    return all.slice(0, 6)
  }, [user])

  const getNewReleases = useCallback(async (limit = 4) => {
    if (API) { try { return await apiFetch<ContentItem[]>('/content/releases') } catch {} }
    return storeGetList<ContentItem>('contents').sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit)
  }, [])

  const recordContentAccess = useCallback(async (contentId: string) => {
    if (API) { try { await apiFetch('/content/access', { method: 'POST', body: JSON.stringify({ contentId }) }); return } catch {} }
    if (!userId) return
    const contents = storeGetList<ContentItem>('contents')
    const idx = contents.findIndex(c => c.id === contentId)
    if (idx >= 0) { contents[idx].views = (contents[idx].views || 0) + 1; storeSet('contents', contents) }
  }, [userId])

  const getUserHistory = useCallback(() => {
    return storeGetList<any>(`user_history_${userId}`)
  }, [userId])

  // ---- Trails ----
  const getTrails = useCallback(async () => {
    if (API) { try { return await apiFetch<(TrailItem & { progress?: TrailProgressItem })[]>('/trails') } catch {} }
    const trails = storeGetList<TrailItem>('trails')
    const progress = storeGetList<TrailProgressItem>('trail_progress')
    return trails.map(t => ({ ...t, progress: progress.find(p => p.trailId === t.id && p.userId === userId) }))
  }, [userId])

  const createTrail = useCallback(async (data: { title: string; description: string; points: number; isMandatory: boolean; modules: { title: string; order: number; durationMinutes: number; contentId?: string }[] }): Promise<TrailItem | null> => {
    if (API) {
      try { return await apiFetch<TrailItem>('/trails', { method: 'POST', body: JSON.stringify(data) }) } catch {}
    }
    const totalDurationMinutes = data.modules.reduce((s, m) => s + (m.durationMinutes || 0), 0)
    const item: TrailItem = { id: generateId(), title: data.title, description: data.description, modules: data.modules.map((m, i) => ({ moduleId: generateId(), ...m, order: m.order ?? i + 1 })), totalDurationMinutes, points: data.points, isMandatory: data.isMandatory }
    const items = storeGetList<TrailItem>('trails')
    items.push(item)
    storeSet('trails', items)
    return item
  }, [])

  const deleteTrail = useCallback(async (trailId: string): Promise<boolean> => {
    if (API) { try { const r = await apiFetch<{ ok: boolean }>(`/trails/${trailId}`, { method: 'DELETE' }); return !!r.ok } catch {} }
    const items = storeGetList<TrailItem>('trails').filter(t => t.id !== trailId)
    storeSet('trails', items)
    return true
  }, [])

  const startTrail = useCallback(async (trailId: string) => {
    if (API) { try { await apiFetch(`/trails/${trailId}/start`, { method: 'POST' }); return } catch {} }
    if (!userId) return
    const progress = storeGetList<TrailProgressItem>('trail_progress')
    if (progress.some(p => p.trailId === trailId && p.userId === userId)) return
    progress.push({ id: generateId(), trailId, userId, completedModules: [], percentComplete: 0, startedAt: new Date().toISOString() })
    storeSet('trail_progress', progress)
  }, [userId])

  const completeModule = useCallback(async (trailId: string, moduleId: string) => {
    if (API) { try { await apiFetch(`/trails/${trailId}/complete-module`, { method: 'POST', body: JSON.stringify({ moduleId }) }); return } catch {} }
    if (!userId) return
    const progress = storeGetList<TrailProgressItem>('trail_progress')
    const trails = storeGetList<TrailItem>('trails')
    const trail = trails.find(t => t.id === trailId)
    let p = progress.find(pr => pr.trailId === trailId && pr.userId === userId)
    if (!p) { p = { id: generateId(), trailId, userId, completedModules: [], percentComplete: 0, startedAt: new Date().toISOString() }; progress.push(p) }
    if (!p.completedModules.includes(moduleId)) p.completedModules.push(moduleId)
    const totalModules = trail?.modules.length ?? 1
    p.percentComplete = Math.round((p.completedModules.length / totalModules) * 100)
    if (p.percentComplete >= 100) p.completedAt = new Date().toISOString()
    storeSet('trail_progress', progress)
  }, [userId])

  const getAcademyCourses = useCallback(async () => {
    if (API) { try { return await apiFetch<any[]>('/trails/academy') } catch {} }
    return storeGetList<any>('academy_courses')
  }, [])

  const enrollCourse = useCallback(async (trailId: string): Promise<boolean> => {
    if (API) {
      try {
        const r = await apiFetch<{ ok: boolean }>(`/trails/${trailId}/enroll`, { method: 'POST' })
        return !!r.ok
      } catch {}
    }
    // Local fallback: create trail progress
    const progress = storeGetList<TrailProgressItem>('trail_progress')
    if (progress.some(p => p.trailId === trailId && p.userId === userId)) return true
    progress.push({ id: generateId(), trailId, userId, completedModules: [], percentComplete: 0, startedAt: new Date().toISOString() })
    storeSet('trail_progress', progress)
    return true
  }, [userId])

  // ---- Mentoring ----
  const getWebinars = useCallback(async () => {
    if (API) { try { return await apiFetch<any[]>('/mentoring/webinars') } catch {} }
    return storeGetList<any>('webinars')
  }, [])

  const createWebinar = useCallback(async (data: { title: string; description: string; scheduledAt: string; meetingUrl: string; hostName: string }) => {
    if (API) { try { return await apiFetch<any>('/mentoring/webinars', { method: 'POST', body: JSON.stringify(data) }) } catch {} }
    const item = { id: generateId(), ...data, createdBy: userId, enrolledUsers: [] as string[], enrolledCount: 0 }
    const items = storeGetList<any>('webinars')
    items.push(item)
    storeSet('webinars', items)
    return item
  }, [userId])

  const deleteWebinar = useCallback(async (webinarId: string): Promise<boolean> => {
    if (API) { try { await apiFetch(`/mentoring/webinars/${webinarId}`, { method: 'DELETE' }); return true } catch {} }
    const items = storeGetList<any>('webinars').filter((w: any) => w.id !== webinarId)
    storeSet('webinars', items)
    return true
  }, [])

  const enrollWebinar = useCallback(async (webinarId: string): Promise<boolean> => {
    if (API) { try { await apiFetch(`/mentoring/webinars/${webinarId}/enroll`, { method: 'POST' }); return true } catch {} }
    if (!userId) return false
    const webinars = storeGetList<any>('webinars')
    const idx = webinars.findIndex((w: any) => w.id === webinarId)
    if (idx < 0) return false
    const enrolled = webinars[idx].enrolledUsers || []
    if (enrolled.includes(userId)) return true
    enrolled.push(userId)
    webinars[idx].enrolledUsers = enrolled
    webinars[idx].enrolledCount = enrolled.length
    storeSet('webinars', webinars)
    // Add to planning as a webinar plan
    const plans = storeGetList<any>('plans')
    const now = new Date().toISOString().split('T')[0]
    plans.push({
      id: generateId(), userId, type: 'webinar', title: `Webinar: ${webinars[idx].title}`,
      data: { webinarId, title: webinars[idx].title, description: webinars[idx].description, scheduledAt: webinars[idx].scheduledAt, meetingUrl: webinars[idx].meetingUrl, hostName: webinars[idx].hostName },
      createdAt: now, updatedAt: now,
    })
    storeSet('plans', plans)
    return true
  }, [userId])

  const getMentoringSessions = useCallback(async () => {
    if (API) { try { return await apiFetch<any[]>('/mentoring/sessions') } catch {} }
    return storeGetList<any>('mentoring_sessions')
  }, [])

  const createMentoringSession = useCallback(async (data: { title: string; description: string; scheduledAt: string; meetingUrl?: string; mentorName: string; mentorId: string; pastorName: string; pastorId: string }) => {
    if (API) { try { return await apiFetch<any>('/mentoring/sessions', { method: 'POST', body: JSON.stringify(data) }) } catch {} }
    const item = { id: generateId(), ...data, status: 'scheduled', createdBy: userId }
    const items = storeGetList<any>('mentoring_sessions')
    items.push(item)
    storeSet('mentoring_sessions', items)
    // Send notification to the other party
    const messages = storeGetList<any>('messages')
    const notifyUserId = userId === data.pastorId ? data.mentorId : data.pastorId
    const notifyName = userId === data.pastorId ? data.pastorName : data.mentorName
    messages.push({
      id: generateId(), fromUserId: userId, fromName: notifyName,
      toUserId: notifyUserId,
      subject: `Nova mentoria agendada: ${data.title}`,
      body: `Você tem uma nova mentoria agendada: "${data.title}" em ${new Date(data.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}. ${data.meetingUrl ? 'Link: ' + data.meetingUrl : ''}`,
      isRead: false, createdAt: new Date().toISOString(),
    })
    storeSet('messages', messages)
    return item
  }, [userId])

  const deleteMentoringSession = useCallback(async (sessionId: string): Promise<boolean> => {
    if (API) { try { await apiFetch(`/mentoring/sessions/${sessionId}`, { method: 'DELETE' }); return true } catch {} }
    const items = storeGetList<any>('mentoring_sessions').filter((s: any) => s.id !== sessionId)
    storeSet('mentoring_sessions', items)
    return true
  }, [])

  const completeMentoringSession = useCallback(async (sessionId: string): Promise<boolean> => {
    if (API) { try { await apiFetch('/mentoring/complete', { method: 'POST', body: JSON.stringify({ sessionId }) }); return true } catch {} }
    const items = storeGetList<any>('mentoring_sessions')
    const idx = items.findIndex((s: any) => s.id === sessionId)
    if (idx >= 0) { items[idx].status = 'completed'; storeSet('mentoring_sessions', items) }
    return true
  }, [])

  // ---- Dashboard ----
  const getMetrics = useCallback(async () => {
    if (API) { try { return await apiFetch<any>('/dashboard/metrics') } catch {} }
    const users = storeGetList<any>('users').filter((u: any) => u.churchId === user?.churchId)
    const progress = storeGetList<TrailProgressItem>('trail_progress')
    const contents = storeGetList<ContentItem>('contents')
    return {
      totalLeaders: users.length, activeLeaders: users.filter((u: any) => u.status === 'active').length,
      totalContentAccessed: contents.reduce((sum, c) => sum + (c.views || 0), 0),
      trailsInProgress: progress.filter(p => !p.completedAt).length, trailsCompleted: progress.filter(p => !!p.completedAt).length,
    }
  }, [user])

  const getLeaderRanking = useCallback(async () => {
    if (API) { try { return await apiFetch<any[]>('/dashboard/ranking') } catch {} }
    const users = storeGetList<any>('users').filter((u: any) => u.churchId === user?.churchId)
    const progress = storeGetList<TrailProgressItem>('trail_progress')
    return users.map((u: any) => {
      const up = progress.filter(p => p.userId === u.id)
      const completed = up.filter(p => !!p.completedAt).length
      const score = completed * 20 + up.reduce((s, p) => s + p.percentComplete, 0) / Math.max(up.length, 1)
      return { name: u.name, score: Math.round(score), trails: completed }
    }).sort((a: any, b: any) => b.score - a.score)
  }, [user])

  const getTimeline = useCallback(async () => {
    if (API) { try { return await apiFetch<any[]>('/dashboard/timeline') } catch {} }
    return storeGetList<any>('timeline_events')
  }, [])

  const getRecentAccesses = useCallback(async () => {
    if (API) { try { return await apiFetch<any[]>('/dashboard/recent') } catch {} }
    return storeGetList<any>('recent_accesses')
  }, [])

  // ---- Messages ----
  const getMessages = useCallback(async () => {
    if (API) { try { return await apiFetch<MessageItem[]>('/messages') } catch {} }
    return storeGetList<MessageItem>('messages').filter(m => m.toUserId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [userId])

  const getUnreadCount = useCallback(async () => {
    if (API) { try { const r = await apiFetch<{ count: number }>('/messages/unread-count'); return r.count } catch {} }
    return storeGetList<MessageItem>('messages').filter(m => m.toUserId === userId && !m.isRead).length
  }, [userId])

  const markAsRead = useCallback(async (messageId: string) => {
    if (API) { try { await apiFetch('/messages/read', { method: 'POST', body: JSON.stringify({ messageId }) }); return } catch {} }
    const messages = storeGetList<MessageItem>('messages')
    const msg = messages.find(m => m.id === messageId)
    if (msg) { msg.isRead = true; storeSet('messages', messages) }
  }, [])

  const sendMessage = useCallback(async (toUserId: string, subject: string, msgBody: string) => {
    if (API) { try { const r = await apiFetch<any>('/messages', { method: 'POST', body: JSON.stringify({ toUserId, subject, body: msgBody }) }); return r } catch (e: any) { throw e } }
    if (!user) return
    const messages = storeGetList<MessageItem>('messages')
    messages.push({ id: generateId(), fromUserId: userId, fromName: user.name, toUserId, subject, body: msgBody, isRead: false, createdAt: new Date().toISOString() })
    storeSet('messages', messages)
  }, [user, userId])

  const getMessageRecipients = useCallback(async () => {
    if (API) { try { return await apiFetch<any[]>('/messages/recipients') } catch {} }
    return []
  }, [])


  // ---- Ministries ----
  const getMyPoints = useCallback(async (): Promise<number> => {
    if (API) { try { const r = await apiFetch<{ points: number }>('/points/me'); return r.points || 0 } catch {} }
    return 0
  }, [])

  const getPointsRanking = useCallback(async (): Promise<{ rank: number; name: string; points: number }[]> => {
    if (API) { try { return await apiFetch<{ rank: number; name: string; points: number }[]>('/points/ranking') } catch {} }
    return []
  }, [])

  const getMaterials = useCallback(async () => {
    if (API) { try { return await apiFetch<any[]>('/materials') } catch {} }
    return []
  }, [])

  const createMaterial = useCallback(async (data: { title: string; description: string; category: string; fileUrl?: string; fileName?: string }): Promise<any> => {
    if (API) { try { return await apiFetch<any>('/materials', { method: 'POST', body: JSON.stringify(data) }) } catch {} }
    return null
  }, [])

  const updateMaterial = useCallback(async (id: string, data: Record<string, any>): Promise<boolean> => {
    if (API) { try { const r = await apiFetch<{ ok: boolean }>(`/materials/${id}`, { method: 'PUT', body: JSON.stringify(data) }); return !!r.ok } catch {} }
    return false
  }, [])

  const deleteMaterial = useCallback(async (id: string): Promise<boolean> => {
    if (API) { try { const r = await apiFetch<{ ok: boolean }>(`/materials/${id}`, { method: 'DELETE' }); return !!r.ok } catch {} }
    return false
  }, [])

  const syncDropbox = useCallback(async (): Promise<{ synced: number; total: number; message: string }> => {
    return apiFetch<{ synced: number; total: number; message: string }>('/dropbox/sync', { method: 'POST' })
  }, [])

  const browseDropbox = useCallback(async (path: string): Promise<{ path: string; entries: any[] }> => {
    const encoded = encodeURIComponent(path)
    return apiFetch<{ path: string; entries: any[] }>(`/dropbox/browse?path=${encoded}`)
  }, [])

  const downloadDropbox = useCallback(async (path: string, action?: 'view' | 'download'): Promise<{ url: string; name: string }> => {
    return apiFetch<{ url: string; name: string }>('/dropbox/download', { method: 'POST', body: JSON.stringify({ path, action: action || 'view' }) })
  }, [])

  const smartSearchDropbox = useCallback(async (q: string): Promise<{ entries: any[]; totalResults: number; keywords: string[] }> => {
    return apiFetch(`/dropbox/smart-search?q=${encodeURIComponent(q)}`)
  }, [])

  const getDropboxLink = useCallback(async (dropboxPath: string): Promise<{ link: string }> => {
    return apiFetch<{ link: string }>('/dropbox/link', { method: 'POST', body: JSON.stringify({ dropboxPath }) })
  }, [])

  const getYoutubeVideos = useCallback(async (pageToken?: string, limit?: number): Promise<{ videos: any[]; totalResults: number; nextPageToken: string | null; prevPageToken: string | null }> => {
    let url = `/youtube/videos?limit=${limit || 20}`
    if (pageToken) url += `&pageToken=${pageToken}`
    return apiFetch(url)
  }, [])

  const searchYoutube = useCallback(async (q: string, pageToken?: string): Promise<{ videos: any[]; totalResults: number; nextPageToken: string | null }> => {
    let url = `/youtube/search?q=${encodeURIComponent(q)}`
    if (pageToken) url += `&pageToken=${pageToken}`
    return apiFetch(url)
  }, [])

  const smartSearchYoutube = useCallback(async (q: string): Promise<{ videos: any[]; totalResults: number; keywords: string[] }> => {
    return apiFetch(`/youtube/smart-search?q=${encodeURIComponent(q)}`)
  }, [])

  const getComments = useCallback(async (videoId: string): Promise<any[]> => {
    return apiFetch<any[]>(`/comments?videoId=${encodeURIComponent(videoId)}`)
  }, [])

  const addComment = useCallback(async (videoId: string, videoTitle: string, text: string): Promise<any> => {
    return apiFetch<any>('/comments', { method: 'POST', body: JSON.stringify({ videoId, videoTitle, text }) })
  }, [])

  const getVideoTags = useCallback(async (videoId: string): Promise<{ videoId: string; tags: string[] }> => {
    return apiFetch(`/video-tags?videoId=${encodeURIComponent(videoId)}`)
  }, [])

  const saveVideoTags = useCallback(async (videoId: string, tags: string[]): Promise<any> => {
    return apiFetch('/video-tags', { method: 'POST', body: JSON.stringify({ videoId, tags }) })
  }, [])

  const getAllVideoTags = useCallback(async (): Promise<{ tagMap: Record<string, string[]>; allTags: string[] }> => {
    return apiFetch('/video-tags/all')
  }, [])

  const getVideoRecs = useCallback(async (videoId: string): Promise<{ videoId: string; items: any[] }> => {
    return apiFetch(`/video-recs?videoId=${encodeURIComponent(videoId)}`)
  }, [])

  const addVideoRec = useCallback(async (videoId: string, data: any): Promise<any> => {
    return apiFetch('/video-recs', { method: 'POST', body: JSON.stringify({ videoId, ...data }) })
  }, [])

  const deleteVideoRec = useCallback(async (videoId: string, itemId: string): Promise<any> => {
    return apiFetch(`/video-recs/${encodeURIComponent(videoId)}?itemId=${encodeURIComponent(itemId)}`, { method: 'DELETE' })
  }, [])

  const getTopDownloads = useCallback(async (): Promise<{ rank: number; filePath: string; fileName: string; downloads: number }[]> => {
    return apiFetch('/dropbox/top-downloads')
  }, [])

  const getBanner = useCallback(async (): Promise<{ active: boolean; message: string; type: string }> => {
    try { return await apiFetch('/banner') } catch { return { active: false, message: '', type: 'info' } }
  }, [])

  const getUploadPresignedUrl = useCallback(async (fileName: string, contentType: string) => {
    return apiFetch<{ uploadUrl: string; fileUrl: string }>('/upload/presign', { method: 'POST', body: JSON.stringify({ fileName, contentType }) })
  }, [])

  const getMinistries = useCallback(async () => {
    if (API) { try { return await apiFetch<any[]>('/ministries') } catch {} }
    return storeGetList<any>('ministries')
  }, [])

  const createMinistry = useCallback(async (data: { name: string; description: string; leaderId?: string; leaderName?: string }) => {
    if (API) { try { return await apiFetch<any>('/ministries', { method: 'POST', body: JSON.stringify(data) }) } catch {} }
    const item = { id: generateId(), ...data, createdAt: new Date().toISOString() }
    const items = storeGetList<any>('ministries')
    items.push(item)
    storeSet('ministries', items)
    return item
  }, [])

  const deleteMinistry = useCallback(async (id: string): Promise<boolean> => {
    if (API) { try { await apiFetch(`/ministries/${id}`, { method: 'DELETE' }); return true } catch {} }
    const items = storeGetList<any>('ministries').filter((m: any) => m.id !== id)
    storeSet('ministries', items)
    return true
  }, [])

  const updateMinistry = useCallback(async (id: string, data: Record<string, any>): Promise<boolean> => {
    if (API) { try { const r = await apiFetch<{ ok: boolean }>(`/ministries/${id}`, { method: 'PUT', body: JSON.stringify(data) }); return !!r.ok } catch {} }
    return false
  }, [])

  // ---- Map / Churches ----
  const getChurches = useCallback(async () => {
    if (API) { try { return await apiFetch<ChurchItem[]>('/map') } catch {} }
    return storeGetList<ChurchItem>('churches')
  }, [])

  const getTopChurches = useCallback(async (limit = 5) => {
    if (API) { try { return await apiFetch<ChurchItem[]>('/map/top') } catch {} }
    return storeGetList<ChurchItem>('churches').sort((a, b) => b.engagementScore - a.engagementScore).slice(0, limit)
  }, [])

  const createChurch = useCallback(async (data: { name: string; pastorId?: string; pastorName?: string; cep: string; address: string; city: string; state: string; lat: number; lng: number; memberCount: number; phone: string; logoUrl?: string; themeColor?: string }) => {
    if (API) { try { return await apiFetch<any>('/map', { method: 'POST', body: JSON.stringify(data) }) } catch {} }
    const item = { id: generateId(), ...data, engagementScore: 0 }
    const items = storeGetList<any>('churches')
    items.push(item)
    storeSet('churches', items)
    return item
  }, [])

  const deleteChurch = useCallback(async (id: string): Promise<boolean> => {
    if (API) { try { await apiFetch(`/map/${id}`, { method: 'DELETE' }); return true } catch {} }
    const items = storeGetList<any>('churches').filter((c: any) => c.id !== id)
    storeSet('churches', items)
    return true
  }, [])

  const updateChurch = useCallback(async (id: string, data: Record<string, any>): Promise<boolean> => {
    if (API) { try { const r = await apiFetch<{ ok: boolean }>(`/map/${id}`, { method: 'PUT', body: JSON.stringify(data) }); return !!r.ok } catch {} }
    return false
  }, [])

  // ---- Planning ----
  const getPlans = useCallback(async () => {
    if (API) { try { return await apiFetch<PlanItem[]>('/planning') } catch {} }
    return storeGetList<PlanItem>('plans').filter(p => p.userId === userId)
  }, [userId])

  const savePlan = useCallback(async (type: string, title: string, data: any, planId?: string) => {
    if (API) {
      try {
        if (planId) { await apiFetch(`/planning/${planId}`, { method: 'PUT', body: JSON.stringify({ title, data }) }) }
        else { await apiFetch('/planning', { method: 'POST', body: JSON.stringify({ type, title, data }) }) }
        return
      } catch {}
    }
    if (!userId) return
    const plans = storeGetList<PlanItem>('plans')
    if (planId) {
      const idx = plans.findIndex(p => p.id === planId)
      if (idx >= 0) { plans[idx] = { ...plans[idx], title, data, updatedAt: new Date().toISOString().split('T')[0] }; storeSet('plans', plans) }
    } else {
      const now = new Date().toISOString().split('T')[0]
      plans.push({ id: generateId(), userId, type, title, data, createdAt: now, updatedAt: now })
      storeSet('plans', plans)
    }
  }, [userId])

  const deletePlan = useCallback(async (planId: string) => {
    if (API) { try { await apiFetch(`/planning/${planId}`, { method: 'DELETE' }); return } catch {} }
    const plans = storeGetList<PlanItem>('plans').filter(p => p.id !== planId)
    storeSet('plans', plans)
  }, [])

  // ---- Podcast ----
  const getPodcastEpisodes = useCallback(async () => {
    if (API) { try { return await apiFetch<PodcastItem[]>('/podcast') } catch {} }
    return storeGetList<PodcastItem>('podcast_episodes')
  }, [])

  const createPodcast = useCallback(async (data: { title: string; description: string; durationSeconds: number; audioUrl: string; publishedAt?: string }): Promise<any> => {
    if (API) { try { return await apiFetch<any>('/podcast', { method: 'POST', body: JSON.stringify(data) }) } catch {} }
    return null
  }, [])

  const updatePodcast = useCallback(async (id: string, data: Record<string, any>): Promise<boolean> => {
    if (API) { try { const r = await apiFetch<{ ok: boolean }>(`/podcast/${id}`, { method: 'PUT', body: JSON.stringify(data) }); return !!r.ok } catch {} }
    return false
  }, [])

  const deletePodcast = useCallback(async (id: string): Promise<boolean> => {
    if (API) { try { const r = await apiFetch<{ ok: boolean }>(`/podcast/${id}`, { method: 'DELETE' }); return !!r.ok } catch {} }
    return false
  }, [])

  const getPodcastProgress = useCallback(async (episodeId: string) => {
    if (API) { try { return await apiFetch<PodcastProgressItem | null>(`/podcast/${episodeId}/progress`) } catch {} }
    return storeGetList<PodcastProgressItem>('podcast_progress').find(p => p.episodeId === episodeId && p.userId === userId) ?? null
  }, [userId])

  const updatePodcastProgress = useCallback(async (episodeId: string, currentTime: number, completed = false) => {
    if (API) { try { await apiFetch('/podcast/progress', { method: 'POST', body: JSON.stringify({ episodeId, currentTime, completed }) }); return } catch {} }
    if (!userId) return
    const all = storeGetList<PodcastProgressItem>('podcast_progress')
    const idx = all.findIndex(p => p.episodeId === episodeId && p.userId === userId)
    if (idx >= 0) { all[idx].currentTime = currentTime; all[idx].completed = completed }
    else all.push({ id: generateId(), episodeId, userId, currentTime, completed })
    storeSet('podcast_progress', all)
  }, [userId])

  const value: DataContextType = {
    getContents, getContentById, createContent, deleteContent, updateContent, deleteContentByCategory, searchContents, getTopContents, getTrendingContents,
    getRecommendedContents, getNewReleases, recordContentAccess, getUserHistory,
    getTrails, createTrail, deleteTrail, startTrail, completeModule, getAcademyCourses, enrollCourse,
    getWebinars, createWebinar, deleteWebinar, enrollWebinar, getMentoringSessions, createMentoringSession, deleteMentoringSession, completeMentoringSession,
    getMetrics, getLeaderRanking, getTimeline, getRecentAccesses,
    getMessages, getUnreadCount, markAsRead, sendMessage, getMessageRecipients,
    getMinistries, createMinistry, deleteMinistry, updateMinistry, getMyPoints, getPointsRanking,
    getMaterials, createMaterial, updateMaterial, deleteMaterial, syncDropbox, browseDropbox, downloadDropbox, smartSearchDropbox, getDropboxLink, getYoutubeVideos, searchYoutube, smartSearchYoutube, getComments, addComment, getVideoTags, saveVideoTags, getAllVideoTags, getVideoRecs, addVideoRec, deleteVideoRec, getTopDownloads, getBanner, getUploadPresignedUrl,
    getChurches, getTopChurches, createChurch, deleteChurch, updateChurch,
    getPlans, savePlan, deletePlan,
    getPodcastEpisodes, createPodcast, updatePodcast, deletePodcast, getPodcastProgress, updatePodcastProgress,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
