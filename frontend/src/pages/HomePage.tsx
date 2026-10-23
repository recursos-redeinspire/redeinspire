import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { useI18n } from '../i18n/I18nContext'
import { Play, Star, Calendar, ArrowRight, GraphUp, FireFlame, LightBulb, Download, Group, Sparks, Xmark, NavArrowRight, PathArrow, Folder } from 'iconoir-react'

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useI18n()
  const { getYoutubeVideos, getTrails, getWebinars, getPointsRanking, getMyPoints, getMentoringSessions, getTopDownloads, getBanner, getAllVideoThumbnails, getFolderThumbnails, getFolderCover, getDropboxThumbnailBatch } = useData()

  const [videos, setVideos] = useState<any[]>([])
  const [trails, setTrails] = useState<any[]>([])
  const [nextWebinar, setNextWebinar] = useState<any>(null)
  const [upcomingWebinars, setUpcomingWebinars] = useState<any[]>([])
  const [pointsRanking, setPointsRanking] = useState<any[]>([])
  const [myPoints, setMyPoints] = useState(0)
  const [topDownloads, setTopDownloads] = useState<any[]>([])
  const [nextMentoring, setNextMentoring] = useState<any>(null)
  const [upcomingMentorings, setUpcomingMentorings] = useState<any[]>([])
  const [banner, setBanner] = useState<{ active: boolean; message: string; type: string }>({ active: false, message: '', type: 'info' })
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [customThumbnails, setCustomThumbnails] = useState<Record<string, string>>({})
  // Capas reais das pastas de recurso (folderPath em minúsculas -> url da imagem)
  const [resourceCovers, setResourceCovers] = useState<Record<string, string>>({})

  useEffect(() => {
    getYoutubeVideos(undefined, 12).then(d => setVideos(d.videos))
    getAllVideoThumbnails().then(data => setCustomThumbnails(data.thumbnails || {})).catch(() => {})
    getTrails().then(setTrails)
    getPointsRanking().then(setPointsRanking)
    getMyPoints().then(setMyPoints)
    getTopDownloads().then(setTopDownloads)
    getBanner().then(setBanner)
    getWebinars().then(w => {
      const sorted = w.sort((a: any, b: any) => a.scheduledAt?.localeCompare(b.scheduledAt || ''))
      setNextWebinar(sorted[0] || null)
      setUpcomingWebinars(sorted.slice(0, 3))
    })
    getMentoringSessions().then(sessions => {
      const now = new Date().toISOString()
      const upcoming = sessions.filter((s: any) => s.scheduledAt > now && s.status !== 'completed')
        .sort((a: any, b: any) => a.scheduledAt.localeCompare(b.scheduledAt))
      setUpcomingMentorings(upcoming.slice(0, 3))
      if (upcoming.length > 0) setNextMentoring(upcoming[0])
      else {
        const completed = sessions.filter((s: any) => s.status === 'completed')
          .sort((a: any, b: any) => (b.scheduledAt || '').localeCompare(a.scheduledAt || ''))
        if (completed.length > 0) setNextMentoring(completed[0])
      }
    })
  }, [])

  const isAdmin = user?.role === 'admin'
  const inProgressTrails = trails.filter(tr => tr.progress && !tr.progress.completedAt)
  const thumb = (v: any) => customThumbnails[v.id] || v.thumbnail
  const featured = videos[0]
  const secondary = videos.slice(1, 3)
  const moreVideos = videos.slice(3, 7)

  // Capa gerada para recursos (sem thumbnail): cor por hash do nome + iniciais
  const resourceGradients = [
    ['#1e3a5f', '#2563eb'], ['#1e293b', '#334155'], ['#1d4ed8', '#1e40af'],
    ['#0f172a', '#1e3a5f'], ['#334155', '#475569'], ['#1e40af', '#3b82f6'],
  ]
  const resourceHash = (name: string) => name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const resourceColors = (name: string) => resourceGradients[resourceHash(name) % resourceGradients.length]
  const resourceInitials = (name: string) => name.split(/[\s\-_]+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || '#'
  const resourceName = (item: any) => item.folderName || (item.folderPath ? item.folderPath.split('/').pop() : '') || ''
  const resourceAccesses = (item: any) => (item.views || 0) + (item.downloads || 0)
  const openResource = (item: any) => navigate(`/materiais?path=${encodeURIComponent(item.folderPath || '')}`)
  // Capa real da pasta, se já resolvida (admin cover ou primeira imagem da pasta)
  const resourceCover = (item: any): string | null => {
    const p = (item?.folderPath || '').toLowerCase()
    return p ? (resourceCovers[p] || null) : null
  }

  const topResource = topDownloads[0]

  // Resolve capas reais dos recursos do topo (top 5): usa capa definida por admin
  // quando houver; senão busca a primeira imagem da pasta e gera uma miniatura.
  // Roda em segundo plano; enquanto não resolve, cai no fallback (cor + iniciais).
  useEffect(() => {
    if (topDownloads.length === 0) return
    let cancelled = false
    const run = async () => {
      const top = topDownloads.slice(0, 5)
      // 1) Capas definidas por admin
      let adminCovers: Record<string, string> = {}
      try {
        const { thumbnails } = await getFolderThumbnails()
        adminCovers = Object.fromEntries(
          Object.entries(thumbnails || {}).map(([k, v]) => [k.toLowerCase(), v as string])
        )
      } catch { /* segue sem capas de admin */ }

      const resolved: Record<string, string> = {}
      const needsFallback: any[] = []
      for (const item of top) {
        const p = (item.folderPath || '').toLowerCase()
        if (!p) continue
        const admin = adminCovers[p]
        if (admin && !admin.includes('dropboxusercontent.com')) resolved[p] = admin
        else needsFallback.push(item)
      }
      if (!cancelled && Object.keys(resolved).length > 0) {
        setResourceCovers(prev => ({ ...prev, ...resolved }))
      }

      // 2) Fallback: primeira imagem da pasta -> miniatura em lote
      if (needsFallback.length === 0) return
      const covers = await Promise.all(needsFallback.map(async (item) => {
        try {
          const { cover } = await getFolderCover(item.folderPath)
          return cover ? { folderPath: (item.folderPath || '').toLowerCase(), cover } : null
        } catch { return null }
      }))
      const valid = covers.filter((c): c is { folderPath: string; cover: string } => !!c)
      if (valid.length === 0) return
      try {
        const thumbMap = await getDropboxThumbnailBatch(valid.map(v => v.cover), 'w640h480')
        if (cancelled) return
        setResourceCovers(prev => {
          const next = { ...prev }
          for (const v of valid) { const url = thumbMap[v.cover]; if (url) next[v.folderPath] = url }
          return next
        })
      } catch { /* mantém fallback visual */ }
    }
    run()
    return () => { cancelled = true }
  }, [topDownloads, getFolderThumbnails, getFolderCover, getDropboxThumbnailBatch])

  return (
    <div className="space-y-7">
      {/* Admin banner */}
      {banner.active && banner.message && !bannerDismissed && (
        <div className={`rounded-xl p-4 text-sm font-medium relative ${banner.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' : banner.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
          {banner.message}
          <button onClick={() => setBannerDismissed(true)} className="absolute top-3 right-3 opacity-60 hover:opacity-100"><Xmark width={14} height={14} strokeWidth={1.5} /></button>
        </div>
      )}

      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] md:text-[26px] font-bold text-gray-900 tracking-tight">{t('home.welcome')} {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-[13px] text-gray-400 mt-1">Escolha o que assistir ou explore novos conteúdos.</p>
        </div>
        <Link to="/catalogo" className="text-[12px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">Ver vídeos <NavArrowRight width={13} height={13} strokeWidth={1.5} /></Link>
      </div>

      {/* Onboarding slim banner */}
      {showOnboarding && isAdmin && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3 flex items-center gap-4">
          <LightBulb width={16} height={16} strokeWidth={1.5} className="text-blue-600 shrink-0" />
          <p className="text-[12px] text-gray-700 flex-1"><span className="font-semibold">Novo na plataforma?</span> Explore nossos treinamentos e comece sua jornada de capacitação ministerial.</p>
          <Link to="/trilhas" className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700 transition shrink-0">Começar agora</Link>
          <button onClick={() => setShowOnboarding(false)} className="text-gray-400 hover:text-gray-600 transition shrink-0"><Xmark width={14} height={14} strokeWidth={1.5} /></button>
        </div>
      )}

      {/* HERO — vídeo em destaque + recurso em destaque, lado a lado */}
      {(featured || topResource) && (() => {
        const resName = topResource ? resourceName(topResource) : ''
        const [rc1, rc2] = topResource ? resourceColors(resName) : ['', '']
        const resAccesses = topResource ? resourceAccesses(topResource) : 0
        const resCover = topResource ? resourceCover(topResource) : null
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
            {/* Vídeo em destaque (maior, à esquerda) */}
            {featured && (
              <div className={`relative rounded-3xl overflow-hidden group cursor-pointer shadow-lg shadow-slate-900/5 aspect-[16/9] md:aspect-[2.6/1] ${topResource ? 'lg:col-span-2' : 'lg:col-span-3'}`} onClick={() => navigate(`/catalogo?video=${featured.id}`)}>
                <img src={thumb(featured)} alt="" className="w-full h-full object-cover object-[center_30%]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-blue-900/20 to-transparent" />
                <div className="absolute top-4 left-5 md:top-5 md:left-6">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-blue-600 text-white px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-blue-600/30"><FireFlame width={13} height={13} strokeWidth={1.5} /> {t('home.featured') || 'Conteúdo em Destaque'}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                  <h2 className="text-[18px] md:text-[22px] font-bold text-white leading-snug max-w-[650px]">{featured.title}</h2>
                  <p className="text-[12px] md:text-[13px] text-white/60 mt-2">{featured.channelTitle || 'Rede Inspire'}</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/90 shadow-2xl flex items-center justify-center hover:scale-110 transition-transform">
                    <Play width={22} height={22} strokeWidth={1.5} className="text-blue-600 ml-1" />
                  </div>
                </div>
              </div>
            )}

            {/* Recurso em destaque (à direita) */}
            {topResource && (
              <div
                className={`relative rounded-3xl overflow-hidden group cursor-pointer shadow-lg shadow-slate-900/10 flex flex-col justify-between p-5 md:p-6 min-h-[200px] ${featured ? 'lg:col-span-1' : 'lg:col-span-3 aspect-[16/9] md:aspect-[2.6/1]'}`}
                style={resCover ? undefined : { background: `linear-gradient(135deg, ${rc1}, ${rc2})` }}
                onClick={() => openResource(topResource)}
              >
                {/* Capa real da pasta, quando disponível (com overlay para legibilidade) */}
                {resCover && (
                  <>
                    <img src={resCover} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/25" />
                  </>
                )}
                <div className="relative flex items-start justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-white/20 text-white px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-sm"><Folder width={13} height={13} strokeWidth={1.5} /> Recurso em destaque</span>
                  {!resCover && (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
                      <span className="text-[26px] md:text-[32px] font-bold text-white tracking-tight">{resourceInitials(resName)}</span>
                    </div>
                  )}
                </div>
                <div className="relative min-w-0">
                  <h2 className="text-[18px] md:text-[22px] font-bold text-white leading-snug line-clamp-2">{resName}</h2>
                  <p className="text-[12px] md:text-[13px] text-white/80 mt-2">Material mais acessado{resAccesses > 0 ? ` · ${resAccesses} ${resAccesses === 1 ? 'acesso' : 'acessos'}` : ''}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 bg-white text-blue-700 px-4 py-2 rounded-xl text-[12px] md:text-[13px] font-semibold group-hover:gap-2.5 transition-all">
                    Abrir recurso <ArrowRight width={14} height={14} strokeWidth={1.5} />
                  </span>
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* Webinar banner */}
      {nextWebinar && isAdmin && (
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0"><Calendar width={20} height={20} strokeWidth={1.5} className="text-white" /></div>
            <div>
              <p className="text-[10px] text-white/60 uppercase font-semibold tracking-wider">{t('home.nextWebinar')}</p>
              <h3 className="text-[15px] font-bold text-white mt-0.5">{nextWebinar.title}</h3>
              <p className="text-[12px] text-white/60 mt-0.5">{nextWebinar.hostName} · {new Date(nextWebinar.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          <Link to="/mentorias" className="bg-white text-blue-700 px-5 py-2.5 rounded-xl text-[12px] font-semibold hover:bg-blue-50 transition shrink-0">Inscrever-se</Link>
        </div>
      )}

      {/* Main grid: content + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: main content */}
        <div className="lg:col-span-8 space-y-7">

          {/* Sugestões */}
          {secondary.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2"><LightBulb width={17} height={17} strokeWidth={1.5} className="text-slate-400" /> {t('home.suggestions') || 'Sugestões para você'}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.slice(1, 4).map(v => (
                  <div key={v.id} className="group cursor-pointer" onClick={() => navigate(`/catalogo?video=${v.id}`)}>
                    <div className="relative rounded-xl overflow-hidden shadow-sm">
                      <img src={thumb(v)} alt="" className="w-full aspect-video object-cover group-hover:scale-[1.03] transition-transform duration-400" />
                      <span className="absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded-md bg-black/60 text-white font-medium">{v.duration || ''}</span>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center"><Play width={14} height={14} strokeWidth={1.5} className="text-blue-600 ml-0.5" /></div>
                      </div>
                    </div>
                    <h3 className="text-[13px] font-semibold text-gray-800 mt-2.5 line-clamp-2 leading-snug">{v.title}</h3>
                    <p className="text-[11px] text-gray-400 mt-1">{v.channelTitle || 'Rede Inspire'}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Trilhas em andamento */}
          {inProgressTrails.length > 0 && isAdmin && (
            <section>
              <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2 mb-4"><PathArrow width={17} height={17} strokeWidth={1.5} className="text-slate-400" /> {t('home.trainingInProgress')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {inProgressTrails.slice(0, 3).map(tr => (
                  <Link to="/trilhas" key={tr.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition">
                    <p className="text-[13px] font-semibold text-gray-800">{tr.title}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex-1 bg-gray-100 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${tr.progress?.percentComplete ?? 0}%` }} /></div>
                      <span className="text-[11px] font-bold text-gray-500">{tr.progress?.percentComplete ?? 0}%</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Recursos em destaque — hero + lista lateral */}
          {topDownloads.length > 0 && (() => {
            const heroName = resourceName(topResource)
            const [hc1, hc2] = resourceColors(heroName)
            const heroAccesses = resourceAccesses(topResource)
            const heroCover = resourceCover(topResource)
            const sideItems = topDownloads.slice(1, 5)
            return (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2"><Star width={17} height={17} strokeWidth={1.5} className="text-slate-400" /> Recursos em destaque</h2>
                  <Link to="/materiais" className="text-[12px] text-blue-600 font-semibold">Ver todos →</Link>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Hero TOP 1 */}
                  <div
                    className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm flex flex-col justify-between p-6 min-h-[220px]"
                    style={heroCover ? undefined : { background: `linear-gradient(135deg, ${hc1}, ${hc2})` }}
                    onClick={() => openResource(topResource)}
                  >
                    {heroCover && (
                      <>
                        <img src={heroCover} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/25" />
                      </>
                    )}
                    <div className="relative flex items-start justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-white/20 text-white px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-sm"><Star width={13} height={13} strokeWidth={1.5} /> Top 1</span>
                      {!heroCover && (
                        <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
                          <span className="text-[20px] font-bold text-white tracking-tight">{resourceInitials(heroName)}</span>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <h3 className="text-[20px] font-bold text-white leading-snug line-clamp-2">{heroName}</h3>
                      <p className="text-[12px] text-white/80 mt-1.5">Material mais acessado</p>
                      <p className="text-[12px] text-white/80 mt-0.5 flex items-center gap-1"><Folder width={13} height={13} strokeWidth={1.5} /> {heroAccesses} {heroAccesses === 1 ? 'acesso' : 'acessos'}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 bg-white text-blue-700 px-4 py-2 rounded-xl text-[12px] font-semibold group-hover:gap-2.5 transition-all">
                        Abrir recurso <ArrowRight width={14} height={14} strokeWidth={1.5} />
                      </span>
                    </div>
                  </div>

                  {/* Lista 2..5 */}
                  <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
                    {sideItems.length === 0 && (
                      <div className="flex items-center justify-center h-full py-10 text-[12px] text-gray-400">Mais recursos em breve</div>
                    )}
                    {sideItems.map(item => {
                      const name = resourceName(item)
                      const [mc1, mc2] = resourceColors(name)
                      const accesses = resourceAccesses(item)
                      const cover = resourceCover(item)
                      return (
                        <div key={item.folderPath || item.rank} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition" onClick={() => openResource(item)}>
                          <span className={`text-[12px] font-bold w-5 text-center ${item.rank <= 3 ? 'text-blue-600' : 'text-gray-300'}`}>{item.rank}</span>
                          {cover ? (
                            <img src={cover} alt="" className="w-9 h-9 rounded-lg shrink-0 object-cover" />
                          ) : (
                            <span className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-[11px] font-bold text-white" style={{ background: `linear-gradient(135deg, ${mc1}, ${mc2})` }}>{resourceInitials(name)}</span>
                          )}
                          <span className="text-[13px] text-gray-800 flex-1 truncate">{name}</span>
                          {accesses > 0 && <span className="text-[11px] text-gray-400 shrink-0">{accesses} {accesses === 1 ? 'acesso' : 'acessos'}</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>
            )
          })()}

          {/* Top Conteúdos */}
          {videos.length > 0 && (
            <section>
              <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2 mb-4"><FireFlame width={17} height={17} strokeWidth={1.5} className="text-slate-400" /> {t('home.top10Content')}</h2>
              <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                {videos.slice(0, 5).map((video, i) => (
                  <div key={video.id} onClick={() => navigate(`/catalogo?video=${video.id}`)} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition">
                    <span className={`text-[12px] font-bold w-5 text-center ${i < 3 ? 'text-blue-600' : 'text-gray-300'}`}>{i + 1}</span>
                    <img src={thumb(video)} alt="" className="w-14 h-9 rounded-lg object-cover shrink-0" />
                    <span className="text-[13px] text-gray-800 flex-1 line-clamp-1">{video.title}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Conteúdos recentes */}
          {moreVideos.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2"><GraphUp width={17} height={17} strokeWidth={1.5} className="text-slate-400" /> Conteúdos recentes</h2>
                <Link to="/catalogo" className="text-[12px] text-blue-600 font-semibold">Ver todos →</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {moreVideos.map(video => (
                  <div key={video.id} onClick={() => navigate(`/catalogo?video=${video.id}`)} className="group cursor-pointer">
                    <div className="relative rounded-xl overflow-hidden shadow-sm">
                      <img src={thumb(video)} alt="" className="w-full aspect-video object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center"><Play width={11} height={11} strokeWidth={1.5} className="text-blue-600 ml-0.5" /></div>
                      </div>
                    </div>
                    <p className="text-[11px] font-medium text-gray-800 mt-2 line-clamp-2 leading-snug">{video.title}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Próximos eventos */}
          {(upcomingWebinars.length > 0 || upcomingMentorings.length > 0) && isAdmin && (
            <section>
              <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2 mb-4"><Calendar width={17} height={17} strokeWidth={1.5} className="text-slate-400" /> Próximos eventos</h2>
              <div className="space-y-2.5">
                {upcomingWebinars.map(w => (
                  <div key={w.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between hover:shadow-sm transition cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Play width={16} height={16} strokeWidth={1.5} className="text-blue-600" /></div>
                      <div>
                        <p className="text-[13px] font-semibold text-gray-800">{w.title}</p>
                        <p className="text-[11px] text-gray-400">{w.hostName} · {new Date(w.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <Link to="/mentorias" className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">Inscrever</Link>
                  </div>
                ))}
                {upcomingMentorings.map(s => (
                  <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between hover:shadow-sm transition cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Group width={16} height={16} strokeWidth={1.5} className="text-blue-600" /></div>
                      <div>
                        <p className="text-[13px] font-semibold text-gray-800">{s.title}</p>
                        <p className="text-[11px] text-gray-400">{s.mentorName || s.pastorName} · {new Date(s.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <Link to="/mentorias" className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">Ver</Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-4 space-y-5">
          {/* Pontos + Ranking */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center"><Star width={18} height={18} strokeWidth={1.5} className="text-blue-600" /></div>
              <div><p className="text-[20px] font-bold text-gray-900">{myPoints}</p><p className="text-[11px] text-gray-400">{t('header.points')}</p></div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Top Usuários</p>
              <div className="space-y-2">
                {pointsRanking.slice(0, 5).map(u => (
                  <div key={u.rank} className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-400 w-4">{u.rank}º</span>
                    <span className="flex-1 text-[12px] text-gray-700 truncate">{u.name}</span>
                    <span className="text-[11px] font-semibold text-blue-600">{u.points}</span>
                  </div>
                ))}
              </div>
              <Link to="/dashboard" className="mt-3 block text-center text-[11px] text-gray-500 hover:text-gray-900">Ver ranking completo →</Link>
            </div>
          </div>

          {/* Links rápidos */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase mb-3">{t('nav.management')}</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { to: '/materiais', label: t('nav.materials'), icon: <Download width={14} height={14} strokeWidth={1.5} /> },
                { to: '/mensagens', label: t('nav.messages'), icon: <Sparks width={14} height={14} strokeWidth={1.5} /> },
                { to: '/mapa', label: t('nav.map'), icon: <ArrowRight width={14} height={14} strokeWidth={1.5} /> },
                { to: '/planejamento', label: t('nav.planning'), icon: <Calendar width={14} height={14} strokeWidth={1.5} /> },
                { to: '/dashboard', label: t('nav.dashboard'), icon: <GraphUp width={14} height={14} strokeWidth={1.5} /> },
                { to: '/mentorias', label: t('nav.mentoring'), icon: <Group width={14} height={14} strokeWidth={1.5} /> },
              ].map((item) => {
                const comingSoon = !isAdmin && (item.to === '/trilhas' || item.to === '/mentorias' || item.to === '/planejamento')
                if (comingSoon) {
                  return (
                    <span key={item.to} className="flex items-center gap-2 text-[11px] text-gray-400 bg-gray-50 rounded-lg px-3 py-2.5 opacity-60 cursor-not-allowed">
                      {item.icon} {item.label}{t('common.comingSoon')}
                    </span>
                  )
                }
                return (
                <Link key={item.to} to={item.to} className="flex items-center gap-2 text-[11px] text-gray-600 bg-gray-50 rounded-lg px-3 py-2.5 hover:bg-blue-50 hover:text-blue-700 transition">
                  {item.icon} {item.label}
                </Link>
                )
              })}
            </div>
          </div>

          {/* Próximo webinar card */}
          {nextWebinar && isAdmin && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-[10px] text-blue-600 font-semibold uppercase mb-2">{t('home.nextWebinar')}</p>
              <h3 className="text-[13px] font-bold text-gray-900 line-clamp-2">{nextWebinar.title}</h3>
              <p className="text-[11px] text-gray-500 mt-1">{nextWebinar.hostName}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1"><Calendar width={11} height={11} strokeWidth={1.5} /> {new Date(nextWebinar.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              <Link to="/mentorias" className="mt-3 block text-center bg-blue-600 text-white py-2 rounded-lg text-[12px] font-medium hover:bg-blue-700 transition">Ver detalhes</Link>
            </div>
          )}

          {/* Trilha em andamento */}
          {inProgressTrails.length > 0 && isAdmin && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-[10px] text-blue-600 font-semibold uppercase mb-2">Trilha em andamento</p>
              <h3 className="text-[13px] font-bold text-gray-900 line-clamp-2">{inProgressTrails[0].title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-gray-100 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${inProgressTrails[0].progress?.percentComplete ?? 0}%` }} /></div>
                <span className="text-[11px] font-bold text-gray-500">{inProgressTrails[0].progress?.percentComplete ?? 0}%</span>
              </div>
              <Link to="/trilhas" className="mt-3 block text-center bg-blue-600 text-white py-2 rounded-lg text-[12px] font-medium hover:bg-blue-700 transition">Continuar</Link>
            </div>
          )}

          {/* Próxima mentoria */}
          {nextMentoring && isAdmin && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-[10px] text-blue-600 font-semibold uppercase mb-2">Próxima mentoria</p>
              <h3 className="text-[13px] font-bold text-gray-900 line-clamp-2">{nextMentoring.title}</h3>
              <p className="text-[11px] text-gray-500 mt-1">{nextMentoring.mentorName || nextMentoring.pastorName}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1"><Calendar width={11} height={11} strokeWidth={1.5} /> {new Date(nextMentoring.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              <Link to="/mentorias" className="mt-3 block text-center bg-blue-600 text-white py-2 rounded-lg text-[12px] font-medium hover:bg-blue-700 transition">Ver detalhes</Link>
            </div>
          )}

          {/* Igrejas mais ativas */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1"><Sparks width={12} height={12} strokeWidth={1.5} /> Igrejas mais ativas</p>
            <p className="text-[11px] text-gray-400 text-center py-3">Em breve</p>
          </div>
        </div>
      </div>
    </div>
  )
}
