import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { useI18n } from '../i18n/I18nContext'

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useI18n()
  const { getNewReleases, getTopContents, getTrendingContents, getRecommendedContents, getUserHistory, getTrails, getWebinars, getPointsRanking } = useData()

  const [newReleases, setNewReleases] = useState<any[]>([])
  const [top10, setTop10] = useState<any[]>([])
  const [trending, setTrending] = useState<any[]>([])
  const [recommended, setRecommended] = useState<any[]>([])
  const [trails, setTrails] = useState<any[]>([])
  const [nextWebinar, setNextWebinar] = useState<any>(null)
  const [pointsRanking, setPointsRanking] = useState<{ rank: number; name: string; points: number }[]>([])
  const history = getUserHistory()

  useEffect(() => {
    getNewReleases(4).then(setNewReleases)
    getTopContents(5).then(setTop10)
    getTrendingContents(3).then(setTrending)
    getRecommendedContents().then(setRecommended)
    getTrails().then(setTrails)
    getPointsRanking().then(setPointsRanking)
    getWebinars().then(w => {
      const sorted = w.sort((a: any, b: any) => a.scheduledAt.localeCompare(b.scheduledAt))
      setNextWebinar(sorted[0] || null)
    })
  }, [])

  const inProgressTrails = trails.filter(tr => tr.progress && !tr.progress.completedAt)

  const testimonials = [
    { name: 'Pr. Marcos - SP', text: 'A plataforma transformou a forma como capacitamos nossos líderes.' },
    { name: 'Pra. Ana - RJ', text: 'As trilhas de aprendizado são incríveis. Nossos líderes estão mais preparados.' },
  ]

  return (
    <div className="space-y-10">
      <section className="bg-gradient-to-r from-gray-900 to-gray-900 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">{t('home.welcome')} {user?.name?.split(' ')[0]}!</h1>
        <p className="text-gray-200 mb-4">{t('home.subtitle')}</p>
        <div className="flex gap-3">
          <Link to="/catalogo" className="bg-white text-gray-900 px-5 py-2 rounded-lg font-medium hover:bg-gray-50">{t('home.exploreCatalog')}</Link>
          <Link to="/trilhas" className="bg-gray-800 text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-700">{t('home.myTrails')}</Link>
        </div>
      </section>

      {nextWebinar && (
        <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <p className="text-xs text-yellow-600 font-medium uppercase">{t('home.nextWebinar')}</p>
              <h3 className="font-semibold text-lg mt-1">{nextWebinar.title}</h3>
              <p className="text-sm text-gray-600">{nextWebinar.hostName} · {new Date(nextWebinar.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <a href={nextWebinar.meetingUrl} target="_blank" rel="noopener noreferrer" className="bg-yellow-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-yellow-600">{t('home.accessZoom')}</a>
          </div>
        </section>
      )}

      {inProgressTrails.length > 0 && (
        <section className="bg-white border rounded-lg p-5">
          <h2 className="font-semibold text-lg mb-3">📚 {t('home.trainingInProgress')}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {inProgressTrails.slice(0, 3).map((tr) => (
              <Link to="/trilhas" key={tr.id} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition">
                <p className="font-medium text-sm">{tr.title}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2"><div className="bg-gray-900 h-2 rounded-full" style={{ width: `${tr.progress?.percentComplete ?? 0}%` }} /></div>
                  <span className="text-xs text-gray-500">{tr.progress?.percentComplete ?? 0}%</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-semibold text-lg mb-3">🆕 {t('home.newReleases')}</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {newReleases.map((item) => (
            <div key={item.id} onClick={() => navigate(`/conteudo/${item.id}`)} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="bg-gray-200 rounded-lg h-24 flex items-center justify-center mb-3">
                <span className="text-2xl">{item.type === 'video' ? '🎬' : item.type === 'audio' ? '🎧' : '📄'}</span>
              </div>
              <h3 className="font-medium text-sm">{item.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{item.categorySlug} · {item.durationMinutes} {t('home.min')}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold text-lg mb-3">🔥 {t('home.top10Content')}</h2>
            <div className="bg-white border rounded-lg divide-y">
              {top10.map((item, i) => (
                <div key={item.id} onClick={() => navigate(`/conteudo/${item.id}`)} className="flex items-center gap-4 p-3 hover:bg-gray-50 cursor-pointer">
                  <span className="text-2xl font-bold text-gray-600 w-8 text-center">{i + 1}</span>
                  <span className="flex-1 font-medium text-sm">{item.title}</span>
                  <span className="text-xs text-gray-500">{item.views} {t('home.views')}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-lg mb-3">⭐ {t('home.top10Leaders')}</h2>
            <div className="bg-white border rounded-lg divide-y">
              {pointsRanking.length === 0 && <p className="text-center text-gray-400 py-6 text-sm">{t('home.noLeadersYet')}</p>}
              {pointsRanking.map((u) => (
                <div key={u.rank} className="flex items-center gap-4 p-3">
                  <span className="text-2xl font-bold text-gray-600 w-8 text-center">{u.rank}</span>
                  <span className="flex-1 font-medium text-sm">{u.name}</span>
                  <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">⭐ {u.points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {recommended.length > 0 && (
        <section>
          <h2 className="font-semibold text-lg mb-3">💡 {t('home.suggestions')}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {recommended.slice(0, 3).map((item) => (
              <div key={item.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-sm">{item.title}</h3>
                <p className="text-xs text-gray-900 mt-1">{t('home.basedOnMinistry')}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-semibold text-lg mb-3">📈 {t('home.trending')}</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {trending.map((item) => (
            <div key={item.id} className="bg-white border rounded-lg p-4 min-w-[200px] hover:shadow-md transition-shadow">
              <h3 className="font-medium text-sm">{item.title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${item.popularity}%` }} /></div>
                <span className="text-xs text-gray-500">{item.popularity}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg p-6">
        <h2 className="font-semibold text-lg mb-4">✨ {t('home.stories')}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {testimonials.map((item) => (
            <div key={item.name} className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-gray-700 italic">"{item.text}"</p>
              <p className="text-sm font-medium text-gray-900 mt-2">— {item.name}</p>
            </div>
          ))}
        </div>
      </section>

      {history.length > 0 && (
        <section>
          <h2 className="font-semibold text-lg mb-3">🕐 {t('home.recentAccess')}</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {history.slice(0, 5).map((h: any, i: number) => (
              <div key={i} className="bg-white border rounded-lg p-4 min-w-[180px] hover:shadow-md transition-shadow">
                <h3 className="font-medium text-sm">{h.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{new Date(h.accessedAt).toLocaleDateString('pt-BR')}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
