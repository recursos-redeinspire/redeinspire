import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { useI18n } from '../i18n/I18nContext'
import { CheckCircle, Megaphone, PathArrow, Settings, NavArrowLeft, StatsReport, Group, Download, Trophy, RefreshDouble, Link, Eye, Clock, User, Book, WarningTriangle, Check, Xmark, MediaVideoList, NavArrowUp, NavArrowDown, Star, EyeClosed } from 'iconoir-react'

export default function AdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t: _t } = useI18n()
  const { getTrails, getBanner, getYoutubePlaylists, getYoutubeCuration, saveYoutubeCuration, getYoutubeCuratedSections } = useData()

  const [tab, setTab] = useState<'analytics' | 'trails' | 'banner' | 'reports' | 'conexa' | 'videos'>('analytics')
  const [pendingTrails, setPendingTrails] = useState<any[]>([])
  const [bannerMessage, setBannerMessage] = useState('')
  const [bannerType, setBannerType] = useState('info')
  const [bannerActive, setBannerActive] = useState(false)
  const [bannerExpires, setBannerExpires] = useState('')
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [analytics, setAnalytics] = useState<any>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [materialsFilter, setMaterialsFilter] = useState<'downloads' | 'views'>('downloads')
  const [reportData, setReportData] = useState<any>(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState('')
  const [conexaStatus, setConexaStatus] = useState<any>(null)
  const [conexaSyncing, setConexaSyncing] = useState(false)
  const [conexaSyncResult, setConexaSyncResult] = useState<any>(null)

  // Vídeos / curadoria
  const [playlists, setPlaylists] = useState<any[]>([])
  const [curationSections, setCurationSections] = useState<any[]>([])
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([])
  const [hiddenVideoIds, setHiddenVideoIds] = useState<string[]>([])
  const [featuredVideoId, setFeaturedVideoId] = useState<string | null>(null)
  const [videosLoading, setVideosLoading] = useState(false)
  const [videosLoaded, setVideosLoaded] = useState(false)
  const [savingCuration, setSavingCuration] = useState(false)

  // Redirect non-admin
  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/')
  }, [user, navigate])

  // Load data
  useEffect(() => {
    getTrails().then(trails => {
      setPendingTrails(trails.filter((tr: any) => tr.status === 'pending'))
    })
    getBanner().then(data => {
      setBannerActive(data.active)
      setBannerMessage(data.message || '')
      setBannerType(data.type || 'info')
    })
    // Load analytics
    const token = localStorage.getItem('ri_token')
    fetch('https://h28wyjr7u7.execute-api.us-east-1.amazonaws.com/admin/analytics', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(setAnalytics).catch(() => {}).finally(() => setAnalyticsLoading(false))
  }, [getTrails, getBanner])

  // Carrega curadoria de vídeos ao abrir a aba (uma vez)
  useEffect(() => {
    if (tab !== 'videos' || videosLoaded || videosLoading) return
    setVideosLoading(true)
    Promise.all([
      getYoutubePlaylists().then(d => d.playlists || []).catch(() => []),
      getYoutubeCuration().catch(() => ({ selectedPlaylists: [], hiddenVideoIds: [], featuredVideoId: null })),
      getYoutubeCuratedSections({ includeHidden: true }).then(d => d.sections || []).catch(() => []),
    ]).then(([pls, curation, sections]) => {
      setPlaylists(pls)
      setSelectedPlaylists(curation.selectedPlaylists || [])
      setHiddenVideoIds(curation.hiddenVideoIds || [])
      setFeaturedVideoId(curation.featuredVideoId ?? null)
      setCurationSections(sections)
      setVideosLoaded(true)
    }).finally(() => setVideosLoading(false))
  }, [tab, videosLoaded, videosLoading, getYoutubePlaylists, getYoutubeCuration, getYoutubeCuratedSections])

  const handleApproveTrail = async (trailId: string) => {
    try {
      const token = localStorage.getItem('ri_token')
      await fetch(`https://h28wyjr7u7.execute-api.us-east-1.amazonaws.com/trails/${trailId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      setPendingTrails(prev => prev.filter(tr => tr.id !== trailId))
      setSuccessMsg('Trilha aprovada!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch { /* ignore */ }
  }

  const handleSaveBanner = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('ri_token')
      await fetch('https://h28wyjr7u7.execute-api.us-east-1.amazonaws.com/banner', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: bannerActive, message: bannerMessage, type: bannerType, expiresAt: bannerExpires || null }),
      })
      setSuccessMsg('Banner salvo!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch { /* ignore */ }
    finally { setSaving(false) }
  }

  // ── Curadoria de vídeos ──
  const togglePlaylist = (id: string) => {
    setSelectedPlaylists(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  const movePlaylist = (index: number, dir: -1 | 1) => {
    setSelectedPlaylists(prev => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const toggleHidden = (videoId: string) => {
    setHiddenVideoIds(prev => prev.includes(videoId) ? prev.filter(v => v !== videoId) : [...prev, videoId])
  }

  const handleSaveCuration = async () => {
    setSavingCuration(true)
    try {
      await saveYoutubeCuration({ selectedPlaylists, hiddenVideoIds, featuredVideoId })
      setSuccessMsg('Curadoria de vídeos salva!')
      setTimeout(() => setSuccessMsg(''), 3000)
      // Recarrega as seções para refletir a nova seleção/ordem
      try {
        const d = await getYoutubeCuratedSections({ includeHidden: true })
        setCurationSections(d.sections || [])
      } catch { /* mantém seções atuais */ }
    } catch { /* ignore */ }
    finally { setSavingCuration(false) }
  }

  const playlistTitle = (id: string) => playlists.find(p => p.id === id)?.title || id

  if (!user || user.role !== 'admin') return null

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-700">
          <NavArrowLeft width={20} height={20} strokeWidth={1.5} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Settings width={22} height={22} strokeWidth={1.5} /> Administração</h1>
          <p className="text-sm text-gray-500">Gerencie trilhas pendentes, banners e configurações</p>
        </div>
      </div>

      {successMsg && <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">{successMsg}</div>}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button onClick={() => setTab('analytics')}
          className={`pb-2 px-1 text-sm font-medium flex items-center gap-1.5 ${tab === 'analytics' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500'}`}>
          <StatsReport width={16} height={16} strokeWidth={1.5} /> Analytics
        </button>
        <button onClick={() => setTab('trails')}
          className={`pb-2 px-1 text-sm font-medium flex items-center gap-1.5 ${tab === 'trails' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500'}`}>
          <PathArrow width={16} height={16} strokeWidth={1.5} /> Aprovar Trilhas
          {pendingTrails.length > 0 && <span className="bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingTrails.length}</span>}
        </button>
        <button onClick={() => setTab('banner')}
          className={`pb-2 px-1 text-sm font-medium flex items-center gap-1.5 ${tab === 'banner' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500'}`}>
          <Megaphone width={16} height={16} strokeWidth={1.5} /> Banner
        </button>
        <button onClick={() => setTab('reports')}
          className={`pb-2 px-1 text-sm font-medium flex items-center gap-1.5 ${tab === 'reports' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500'}`}>
          <Download width={16} height={16} strokeWidth={1.5} /> Relatórios
        </button>
        <button onClick={() => setTab('conexa')}
          className={`pb-2 px-1 text-sm font-medium flex items-center gap-1.5 ${tab === 'conexa' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500'}`}>
          <Link width={16} height={16} strokeWidth={1.5} /> Conexa
        </button>
        <button onClick={() => setTab('videos')}
          className={`pb-2 px-1 text-sm font-medium flex items-center gap-1.5 ${tab === 'videos' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500'}`}>
          <MediaVideoList width={16} height={16} strokeWidth={1.5} /> Vídeos
        </button>
      </div>

      {/* Analytics */}
      {tab === 'analytics' && (
        analyticsLoading ? (
          <div className="flex justify-center py-20"><RefreshDouble width={32} height={32} strokeWidth={1.5} className="animate-spin text-gray-400" /></div>
        ) : analytics ? (
          <div className="space-y-6">
            {/* Overview cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white border rounded-xl p-4 text-center">
                <Group width={20} height={20} strokeWidth={1.5} className="mx-auto text-blue-500 mb-1" />
                <p className="text-2xl font-bold text-gray-900">{analytics.users.total}</p>
                <p className="text-xs text-gray-500">Total usuários</p>
              </div>
              <div className="bg-white border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{analytics.users.active}</p>
                <p className="text-xs text-gray-500">Ativos</p>
              </div>
              <div className="bg-white border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-slate-600">{analytics.totalChurches}</p>
                <p className="text-xs text-gray-500">Igrejas</p>
              </div>
              <div className="bg-white border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{analytics.trails.total}</p>
                <p className="text-xs text-gray-500">Trilhas</p>
              </div>
            </div>

            {/* Users breakdown */}
            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Group width={18} height={18} strokeWidth={1.5} /> Usuários por papel</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-gray-900">{analytics.users.admins}</p>
                  <p className="text-xs text-gray-500">Admins</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-gray-900">{analytics.users.pastors}</p>
                  <p className="text-xs text-gray-500">Pastores</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-gray-900">{analytics.users.leaders}</p>
                  <p className="text-xs text-gray-500">Líderes</p>
                </div>
              </div>
            </div>

            {/* Two columns */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Materials - unified with toggle */}
              <div className="bg-white border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Download width={18} height={18} strokeWidth={1.5} /> Top Materiais</h3>
                  <div className="flex bg-gray-100 rounded-lg p-0.5">
                    <button onClick={() => setMaterialsFilter('downloads')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 ${materialsFilter === 'downloads' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
                      <Download width={13} height={13} strokeWidth={1.5} /> Baixados
                    </button>
                    <button onClick={() => setMaterialsFilter('views')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 ${materialsFilter === 'views' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
                      <Eye width={13} height={13} strokeWidth={1.5} /> Visualizados
                    </button>
                  </div>
                </div>
                {(() => {
                  const list = materialsFilter === 'downloads' ? analytics.topDownloads : (analytics.topViewed || [])
                  return list.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Nenhum dado registrado</p>
                  ) : (
                    <div className="space-y-2">
                      {list.map((d: any) => (
                        <div key={d.fileName} className="flex items-center gap-3">
                          <span className="text-xs font-bold text-gray-400 w-5">{d.rank}º</span>
                          <span className="flex-1 text-sm text-gray-700 truncate">{d.fileName?.replace(/\.[^/.]+$/, '')}</span>
                          <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                            {materialsFilter === 'downloads' ? <>{d.downloads} <Download width={12} height={12} strokeWidth={1.5} /></> : <>{d.views} <Eye width={12} height={12} strokeWidth={1.5} /></>}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>

              {/* Top Users */}
              <div className="bg-white border rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Trophy width={18} height={18} strokeWidth={1.5} className="text-yellow-500" /> Usuários mais ativos</h3>
                {analytics.topUsers.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Nenhum dado</p>
                ) : (
                  <div className="space-y-2">
                    {analytics.topUsers.map((u: any) => (
                      <div key={u.rank} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 w-5">{u.rank}º</span>
                        <span className="flex-1 text-sm text-gray-700 truncate">{u.name}</span>
                        <span className="text-xs font-semibold text-yellow-600">{u.points} pts</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Trails stats */}
            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><PathArrow width={18} height={18} strokeWidth={1.5} /> Trilhas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-gray-900">{analytics.trails.enrollments}</p>
                  <p className="text-xs text-gray-500">Inscrições</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-blue-600">{analytics.trails.completed}</p>
                  <p className="text-xs text-gray-500">Concluídas</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-blue-600">{analytics.trails.completionRate}%</p>
                  <p className="text-xs text-gray-500">Taxa conclusão</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-yellow-600">{analytics.trails.pending}</p>
                  <p className="text-xs text-gray-500">Pendentes</p>
                </div>
              </div>
              {analytics.popularTrails.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Trilhas mais populares</p>
                  <div className="space-y-2">
                    {analytics.popularTrails.slice(0, 5).map((tr: any) => (
                      <div key={tr.trailId} className="flex items-center gap-3">
                        <span className="flex-1 text-sm text-gray-700 truncate">{tr.title}</span>
                        <span className="text-xs text-gray-500">{tr.enrolled} inscritos</span>
                        <span className="text-xs text-blue-600">{tr.completed} concluídos</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Church ranking */}
            {analytics.churchRanking.length > 0 && (
              <div className="bg-white border rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Usuários por igreja</h3>
                <div className="space-y-2">
                  {analytics.churchRanking.map((c: any, i: number) => (
                    <div key={c.churchId} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-5">{i + 1}º</span>
                      <span className="flex-1 text-sm text-gray-700">{c.churchName}</span>
                      <span className="text-xs font-semibold text-gray-500">{c.users} usuários</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-12">Erro ao carregar analytics</p>
        )
      )}

      {/* Approve Trails */}
      {tab === 'trails' && (
        <div>
          {pendingTrails.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <CheckCircle width={48} height={48} strokeWidth={1.5} className="mx-auto mb-3 text-gray-300" />
              <p>Nenhuma trilha pendente de aprovação</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTrails.map(trail => (
                <div key={trail.id} className="bg-white border rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-gray-900">{trail.title}</h3>
                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><Clock width={12} height={12} strokeWidth={1.5} /> Pendente</span>
                      </div>
                      {trail.description && <p className="text-sm text-gray-600 mb-2">{trail.description}</p>}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><User width={13} height={13} strokeWidth={1.5} /> Criada por: <strong>{trail.createdByName || 'Pastor'}</strong></span>
                        <span className="flex items-center gap-1"><Book width={13} height={13} strokeWidth={1.5} /> {trail.modules?.length || 0} módulos</span>
                        <span className="flex items-center gap-1"><Trophy width={13} height={13} strokeWidth={1.5} /> {trail.points} pontos</span>
                        {trail.isMandatory && <span className="text-red-600 flex items-center gap-1"><WarningTriangle width={13} height={13} strokeWidth={1.5} /> Obrigatória</span>}
                      </div>
                      {trail.modules?.length > 0 && (
                        <div className="mt-3 bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-500 mb-2">Módulos:</p>
                          <div className="space-y-1">
                            {trail.modules.map((mod: any, i: number) => (
                              <p key={i} className="text-xs text-gray-700">{i + 1}. {mod.title} ({mod.durationMinutes} min)</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleApproveTrail(trail.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-1">
                        <CheckCircle width={16} height={16} strokeWidth={1.5} /> Aprovar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Banner Management */}
      {tab === 'banner' && (
        <div className="bg-white border rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Comunicado na tela inicial</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={bannerActive} onChange={e => setBannerActive(e.target.checked)} className="rounded" />
                <span className="text-sm font-medium text-gray-700">Ativar banner</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
              <textarea value={bannerMessage} onChange={e => setBannerMessage(e.target.value)}
                rows={3} placeholder="Digite o comunicado que aparecerá na home..."
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select value={bannerType} onChange={e => setBannerType(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="info">Informativo (azul)</option>
                  <option value="warning">Atenção (amarelo)</option>
                  <option value="error">Urgente (vermelho)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expira em (opcional)</label>
                <input type="datetime-local" value={bannerExpires} onChange={e => setBannerExpires(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>

            {/* Preview */}
            {bannerMessage && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Preview:</p>
                <div className={`rounded-xl p-4 text-sm font-medium ${
                  bannerType === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                  bannerType === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                  'bg-blue-50 text-blue-800 border border-blue-200'
                }`}>
                  {bannerMessage}
                </div>
              </div>
            )}

            <button onClick={handleSaveBanner} disabled={saving}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition">
              {saving ? 'Salvando...' : 'Salvar banner'}
            </button>
          </div>
        </div>
      )}

      {/* Reports */}
      {tab === 'reports' && (
        <div className="space-y-4">
          {/* Report selector */}
          <div className="bg-white border rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Selecione o relatório</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { key: 'active-users', label: 'Usuários mais ativos' },
                { key: 'inactive-users', label: 'Usuários que não estão acessando' },
                { key: 'top-downloaders', label: 'Quem mais baixou materiais' },
                { key: 'top-materials', label: 'Materiais mais baixados' },
                { key: 'top-trainings', label: 'Treinamentos mais assistidos' },
                { key: 'churches-downloads', label: 'Igrejas que mais baixam' },
                { key: 'categories-downloads', label: 'Categorias mais baixadas' },
              ].map(r => (
                <button key={r.key} onClick={async () => {
                  setSelectedReport(r.key); setReportLoading(true); setReportData(null)
                  try {
                    const token = localStorage.getItem('ri_token')
                    const resp = await fetch(`https://h28wyjr7u7.execute-api.us-east-1.amazonaws.com/admin/reports?report=${r.key}`, { headers: { 'Authorization': `Bearer ${token}` } })
                    const data = await resp.json()
                    setReportData(data)
                  } catch {} finally { setReportLoading(false) }
                }}
                  className={`text-left px-4 py-3 rounded-lg border text-sm transition ${selectedReport === r.key ? 'bg-gray-900 text-white border-gray-900' : 'hover:bg-gray-50 text-gray-700'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Report results */}
          {reportLoading && <div className="flex justify-center py-12"><RefreshDouble width={32} height={32} strokeWidth={1.5} className="animate-spin text-gray-400" /></div>}

          {reportData && !reportLoading && (
            <div className="bg-white border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{reportData.title}</h3>
                <div className="flex gap-2">
                  <button onClick={() => {
                    if (!reportData?.data?.length) return
                    const headers = Object.keys(reportData.data[0])
                    const csv = [headers.join(','), ...reportData.data.map((row: any) => headers.map(h => `"${(row[h] ?? '').toString().replace(/"/g, '""')}"`).join(','))].join('\n')
                    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a'); a.href = url; a.download = `${reportData.title}.csv`; a.click()
                  }} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 flex items-center gap-1">
                    <Download width={14} height={14} strokeWidth={1.5} /> CSV
                  </button>
                  <button onClick={() => {
                    if (!reportData?.data?.length) return
                    const headers = Object.keys(reportData.data[0])
                    const printWindow = window.open('', '_blank')
                    if (!printWindow) return
                    printWindow.document.write(`<html><head><title>${reportData.title}</title><style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse;margin-top:10px}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background:#f3f4f6;font-weight:600}h1{font-size:18px}</style></head><body>`)
                    printWindow.document.write(`<h1>${reportData.title}</h1><p style="color:#666;font-size:12px">Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>`)
                    printWindow.document.write('<table><thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>')
                    reportData.data.forEach((row: any) => { printWindow.document.write('<tr>' + headers.map(h => `<td>${row[h] ?? ''}</td>`).join('') + '</tr>') })
                    printWindow.document.write('</tbody></table></body></html>')
                    printWindow.document.close()
                    setTimeout(() => printWindow.print(), 500)
                  }} className="bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-700 flex items-center gap-1">
                    <Download width={14} height={14} strokeWidth={1.5} /> PDF
                  </button>
                </div>
              </div>
              {reportData.data?.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Nenhum dado disponível</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        {Object.keys(reportData.data[0] || {}).map(key => (
                          <th key={key} className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {reportData.data.map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50">
                          {Object.values(row).map((val: any, j: number) => (
                            <td key={j} className="px-3 py-2 text-gray-700">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Conexa Integration */}
      {tab === 'conexa' && (
        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Link width={20} height={20} strokeWidth={1.5} className="text-blue-500" /> Integração Conexa.app
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Controle de acesso baseado no status de pagamento dos clientes no Conexa.
              Usuários bloqueados por inadimplência não conseguem fazer login na plataforma.
            </p>

            {/* Status */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-700">Status da Conexão</h4>
                <button
                  onClick={async () => {
                    const token = localStorage.getItem('ri_token')
                    const r = await fetch('https://h28wyjr7u7.execute-api.us-east-1.amazonaws.com/conexa/status', {
                      headers: { 'Authorization': `Bearer ${token}` }
                    })
                    const data = await r.json()
                    setConexaStatus(data)
                  }}
                  className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100"
                >
                  Verificar
                </button>
              </div>
              {conexaStatus ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center">
                    <p className={`text-lg font-bold flex items-center justify-center ${conexaStatus.connected ? 'text-blue-600' : 'text-red-600'}`}>{conexaStatus.connected ? <Check width={18} height={18} strokeWidth={1.5} /> : <Xmark width={18} height={18} strokeWidth={1.5} />}</p>
                    <p className="text-xs text-gray-500">Conectado</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{conexaStatus.totalCustomers || 0}</p>
                    <p className="text-xs text-gray-500">Clientes Conexa</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{conexaStatus.cacheEntries || 0}</p>
                    <p className="text-xs text-gray-500">Emails no Cache</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mt-1">Subdomínio</p>
                    <p className="text-sm font-medium text-gray-700">{conexaStatus.subdomain}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Clique em "Verificar" para ver o status</p>
              )}
            </div>

            {/* Sync */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-700">Sincronizar Clientes</h4>
                  <p className="text-xs text-gray-500">Atualiza o cache local com os dados do Conexa (bloqueados/desbloqueados)</p>
                </div>
                <button
                  onClick={async () => {
                    setConexaSyncing(true)
                    setConexaSyncResult(null)
                    const token = localStorage.getItem('ri_token')
                    try {
                      const r = await fetch('https://h28wyjr7u7.execute-api.us-east-1.amazonaws.com/conexa/sync', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                      })
                      const data = await r.json()
                      setConexaSyncResult(data)
                    } catch (e: any) {
                      setConexaSyncResult({ ok: false, message: e.message })
                    }
                    setConexaSyncing(false)
                  }}
                  disabled={conexaSyncing}
                  className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                >
                  {conexaSyncing ? <RefreshDouble width={14} height={14} strokeWidth={1.5} className="animate-spin" /> : 'Sincronizar'}
                </button>
              </div>
              {conexaSyncResult && (
                <div className={`text-sm p-3 rounded-lg ${conexaSyncResult.ok ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                  <p className="font-medium">{conexaSyncResult.message}</p>
                  {conexaSyncResult.ok && (
                    <div className="mt-1 text-xs space-y-0.5">
                      <p>Emails sincronizados: {conexaSyncResult.emailsSynced}</p>
                      <p>Clientes bloqueados neste lote: {conexaSyncResult.blockedCustomers}</p>
                      {!conexaSyncResult.completed && (
                        <p className="text-yellow-600 font-medium mt-1 flex items-center gap-1"><WarningTriangle width={13} height={13} strokeWidth={1.5} /> Sincronização parcial — clique novamente para continuar</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
              <p className="font-medium mb-1">Como funciona:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>No login, o sistema verifica se o email do usuário está bloqueado no Conexa</li>
                <li>Se estiver bloqueado (inadimplente), o acesso é negado com mensagem explicativa</li>
                <li>Quando o cliente regulariza no Conexa, basta sincronizar para liberar o acesso</li>
                <li>Usuários que não existem no Conexa têm acesso normal (não são afetados)</li>
                <li>Recomendado sincronizar diariamente para manter o cache atualizado</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Curadoria de Vídeos */}
      {tab === 'videos' && (
        videosLoading && !videosLoaded ? (
          <div className="flex justify-center py-20"><RefreshDouble width={32} height={32} strokeWidth={1.5} className="animate-spin text-gray-400" /></div>
        ) : (
          <div className="space-y-6">
            {/* Parte 1: Playlists disponíveis */}
            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2"><MediaVideoList width={18} height={18} strokeWidth={1.5} /> Playlists do canal</h3>
              <p className="text-sm text-gray-500 mb-4">Escolha quais playlists aparecem na plataforma. Apenas as marcadas como visíveis serão exibidas.</p>
              {playlists.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Nenhuma playlist encontrada</p>
              ) : (
                <div className="space-y-2">
                  {playlists.map(pl => {
                    const checked = selectedPlaylists.includes(pl.id)
                    return (
                      <label key={pl.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                        <input type="checkbox" checked={checked} onChange={() => togglePlaylist(pl.id)} className="rounded" />
                        {pl.thumbnail ? (
                          <img src={pl.thumbnail} alt="" className="w-16 h-10 rounded object-cover shrink-0" />
                        ) : (
                          <span className="w-16 h-10 rounded bg-gray-100 flex items-center justify-center shrink-0"><MediaVideoList width={16} height={16} strokeWidth={1.5} className="text-gray-300" /></span>
                        )}
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium text-gray-800 truncate">{pl.title}</span>
                          <span className="block text-xs text-gray-400">{pl.itemCount || 0} vídeo(s)</span>
                        </span>
                        <span className={`text-xs font-medium ${checked ? 'text-blue-600' : 'text-gray-400'}`}>{checked ? 'visível' : 'oculta'}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Parte 2: Ordem das playlists selecionadas */}
            {selectedPlaylists.length > 0 && (
              <div className="bg-white border rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-1">Ordem de exibição</h3>
                <p className="text-sm text-gray-500 mb-4">Defina a ordem em que as playlists aparecem no catálogo.</p>
                <div className="space-y-2">
                  {selectedPlaylists.map((id, i) => (
                    <div key={id} className="flex items-center gap-3 p-2 rounded-lg border border-gray-100">
                      <span className="text-xs font-bold text-gray-400 w-5 text-center">{i + 1}</span>
                      <span className="flex-1 min-w-0 text-sm text-gray-800 truncate">{playlistTitle(id)}</span>
                      <button onClick={() => movePlaylist(i, -1)} disabled={i === 0}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition" aria-label="Mover para cima">
                        <NavArrowUp width={16} height={16} strokeWidth={1.5} />
                      </button>
                      <button onClick={() => movePlaylist(i, 1)} disabled={i === selectedPlaylists.length - 1}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition" aria-label="Mover para baixo">
                        <NavArrowDown width={16} height={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Parte 3: Grade de vídeos */}
            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-1">Vídeos</h3>
              <p className="text-sm text-gray-500 mb-4">Oculte vídeos individuais e escolha o destaque da home. Vídeos marcados como "possível short" estão em formato vertical.</p>
              {curationSections.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Nenhum vídeo para exibir</p>
              ) : (
                <div className="space-y-6">
                  {curationSections.map((section, si) => (
                    <div key={section.playlistId || si}>
                      {section.title && <p className="text-xs font-semibold text-gray-400 uppercase mb-3">{section.title}</p>}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {(section.videos || []).map((v: any) => {
                          const hidden = hiddenVideoIds.includes(v.id)
                          const isFeatured = featuredVideoId === v.id
                          return (
                            <div key={v.id} className="border border-gray-100 rounded-xl overflow-hidden">
                              <div className="relative aspect-video bg-gray-100">
                                <img src={v.thumbnail} alt="" className={`w-full h-full object-cover transition ${hidden ? 'opacity-30' : ''}`} />
                                {hidden && (
                                  <span className="absolute top-2 left-2 text-[10px] font-semibold bg-slate-700 text-white px-2 py-0.5 rounded-full">oculto</span>
                                )}
                                {v.likelyShort && (
                                  <span className="absolute top-2 right-2 text-[10px] font-semibold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">possível short</span>
                                )}
                                {isFeatured && (
                                  <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-600 text-white px-2 py-0.5 rounded-full"><Star width={11} height={11} strokeWidth={1.5} /> destaque da home</span>
                                )}
                              </div>
                              <div className="p-3">
                                <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">{v.title}</p>
                                <div className="flex items-center gap-2 mt-3">
                                  <button onClick={() => toggleHidden(v.id)}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                                    {hidden ? <><Eye width={13} height={13} strokeWidth={1.5} /> Mostrar</> : <><EyeClosed width={13} height={13} strokeWidth={1.5} /> Ocultar</>}
                                  </button>
                                  <button onClick={() => setFeaturedVideoId(isFeatured ? null : v.id)} disabled={hidden}
                                    className={`inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed ${isFeatured ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                    <Star width={13} height={13} strokeWidth={1.5} /> {isFeatured ? 'Destaque' : 'Definir como destaque'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Salvar */}
            <div className="flex justify-end">
              <button onClick={handleSaveCuration} disabled={savingCuration}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition inline-flex items-center gap-2">
                {savingCuration && <RefreshDouble width={14} height={14} strokeWidth={1.5} className="animate-spin" />} Salvar alterações
              </button>
            </div>
          </div>
        )
      )}
    </div>
  )
}
