import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { useI18n } from '../i18n/I18nContext'
import { CheckCircle, Megaphone, Route, Settings, ArrowLeft, BarChart3, Users, Download, Trophy, Loader2 } from 'lucide-react'

export default function AdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t: _t } = useI18n()
  const { getTrails, getBanner } = useData()

  const [tab, setTab] = useState<'analytics' | 'trails' | 'banner'>('analytics')
  const [pendingTrails, setPendingTrails] = useState<any[]>([])
  const [bannerMessage, setBannerMessage] = useState('')
  const [bannerType, setBannerType] = useState('info')
  const [bannerActive, setBannerActive] = useState(false)
  const [bannerExpires, setBannerExpires] = useState('')
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [analytics, setAnalytics] = useState<any>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

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

  if (!user || user.role !== 'admin') return null

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Settings size={22} /> Administração</h1>
          <p className="text-sm text-gray-500">Gerencie trilhas pendentes, banners e configurações</p>
        </div>
      </div>

      {successMsg && <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{successMsg}</div>}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button onClick={() => setTab('analytics')}
          className={`pb-2 px-1 text-sm font-medium flex items-center gap-1.5 ${tab === 'analytics' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500'}`}>
          <BarChart3 size={16} /> Analytics
        </button>
        <button onClick={() => setTab('trails')}
          className={`pb-2 px-1 text-sm font-medium flex items-center gap-1.5 ${tab === 'trails' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500'}`}>
          <Route size={16} /> Aprovar Trilhas
          {pendingTrails.length > 0 && <span className="bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingTrails.length}</span>}
        </button>
        <button onClick={() => setTab('banner')}
          className={`pb-2 px-1 text-sm font-medium flex items-center gap-1.5 ${tab === 'banner' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500'}`}>
          <Megaphone size={16} /> Banner
        </button>
      </div>

      {/* Analytics */}
      {tab === 'analytics' && (
        analyticsLoading ? (
          <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-gray-400" /></div>
        ) : analytics ? (
          <div className="space-y-6">
            {/* Overview cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white border rounded-xl p-4 text-center">
                <Users size={20} className="mx-auto text-blue-500 mb-1" />
                <p className="text-2xl font-bold text-gray-900">{analytics.users.total}</p>
                <p className="text-xs text-gray-500">Total usuários</p>
              </div>
              <div className="bg-white border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{analytics.users.active}</p>
                <p className="text-xs text-gray-500">Ativos</p>
              </div>
              <div className="bg-white border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{analytics.totalChurches}</p>
                <p className="text-xs text-gray-500">Igrejas</p>
              </div>
              <div className="bg-white border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{analytics.trails.total}</p>
                <p className="text-xs text-gray-500">Trilhas</p>
              </div>
            </div>

            {/* Users breakdown */}
            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Users size={18} /> Usuários por papel</h3>
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
              {/* Top Downloads */}
              <div className="bg-white border rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Download size={18} /> Top Materiais Baixados</h3>
                {analytics.topDownloads.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Nenhum download registrado</p>
                ) : (
                  <div className="space-y-2">
                    {analytics.topDownloads.map((d: any) => (
                      <div key={d.fileName} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 w-5">{d.rank}º</span>
                        <span className="flex-1 text-sm text-gray-700 truncate">{d.fileName?.replace(/\.[^/.]+$/, '')}</span>
                        <span className="text-xs font-semibold text-gray-500">{d.downloads} ↓</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Viewed */}
              <div className="bg-white border rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">👁 Top Materiais Visualizados</h3>
                {(!analytics.topViewed || analytics.topViewed.length === 0) ? (
                  <p className="text-sm text-gray-400 text-center py-4">Nenhuma visualização registrada</p>
                ) : (
                  <div className="space-y-2">
                    {analytics.topViewed.map((d: any) => (
                      <div key={d.fileName} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 w-5">{d.rank}º</span>
                        <span className="flex-1 text-sm text-gray-700 truncate">{d.fileName?.replace(/\.[^/.]+$/, '')}</span>
                        <span className="text-xs font-semibold text-gray-500">{d.views} 👁</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Users */}
              <div className="bg-white border rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Trophy size={18} className="text-yellow-500" /> Usuários mais ativos</h3>
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
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Route size={18} /> Trilhas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-gray-900">{analytics.trails.enrollments}</p>
                  <p className="text-xs text-gray-500">Inscrições</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-green-600">{analytics.trails.completed}</p>
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
                        <span className="text-xs text-green-600">{tr.completed} concluídos</span>
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
              <CheckCircle size={48} className="mx-auto mb-3 text-gray-300" />
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
                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">⏳ Pendente</span>
                      </div>
                      {trail.description && <p className="text-sm text-gray-600 mb-2">{trail.description}</p>}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>👤 Criada por: <strong>{trail.createdByName || 'Pastor'}</strong></span>
                        <span>📚 {trail.modules?.length || 0} módulos</span>
                        <span>🏆 {trail.points} pontos</span>
                        {trail.isMandatory && <span className="text-red-600">⚠ Obrigatória</span>}
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
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-1">
                        <CheckCircle size={16} /> Aprovar
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
                  <option value="info">ℹ️ Informativo (azul)</option>
                  <option value="warning">⚠️ Atenção (amarelo)</option>
                  <option value="error">🚨 Urgente (vermelho)</option>
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
    </div>
  )
}
