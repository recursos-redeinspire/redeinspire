import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { useI18n } from '../i18n/I18nContext'
import { LANG_OPTIONS, type Lang } from '../i18n/translations'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t, lang, setLang } = useI18n()

  const navItems = [
    { path: '/', label: t('nav.home'), icon: '🏠' },
    { path: '/catalogo', label: t('nav.catalog'), icon: '📚' },
    { path: '/busca', label: t('nav.search'), icon: '🔍' },
    { path: '/trilhas', label: t('nav.trails'), icon: '🎯' },
    { path: '/mentorias', label: t('nav.mentoring'), icon: '🎓' },
    { path: '/podcast', label: t('nav.podcast'), icon: '🎙️' },
    { path: '/planejamento', label: t('nav.planning'), icon: '📅' },
    { path: '/materiais', label: t('nav.materials'), icon: '📁' },
    { path: '/mapa', label: t('nav.map'), icon: '🗺️' },
    { path: '/dashboard', label: t('nav.dashboard'), icon: '📊' },
    { path: '/mensagens', label: t('nav.messages'), icon: '💬' },
  ]

  const categories = [
    'Mensagens', 'Série de Mensagens', 'Campanhas', 'Pequenos Grupos',
    'Crianças', 'Jovens', 'Adolescentes', 'Homens', 'Mulheres', 'Casais',
    '5 Propósitos', 'Empresários', '30 Semanas', 'Velos',
    'Gestão Ministerial', 'Pesquisas', 'Mentorias', 'Webinar',
    'Trilhas', 'Eventos', 'Casa de Paz', 'Materiais para Liderança', 'Retiros',
  ]

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [churchName, setChurchName] = useState('')
  const [churchLogo, setChurchLogo] = useState('')
  const [themeColor, setThemeColor] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { getUnreadCount, getChurches, getMyPoints } = useData()
  const [unreadCount, setUnreadCount] = useState(0)
  const [userPoints, setUserPoints] = useState(0)

  useEffect(() => {
    getUnreadCount().then(setUnreadCount).catch(() => {})
    getMyPoints().then(setUserPoints).catch(() => {})
  }, [getUnreadCount, getMyPoints, location.pathname])

  useEffect(() => {
    if (user?.churchId) {
      getChurches().then(churches => {
        const c = churches.find((ch: any) => ch.id === user.churchId)
        if (c) {
          setChurchName(c.name)
          setChurchLogo((c as any).logoUrl || '')
          const color = (c as any).themeColor || ''
          setThemeColor(color)
          if (color) {
            document.documentElement.style.setProperty('--church-color', color)
            document.documentElement.style.setProperty('--church-color-light', color + '15')
          } else {
            document.documentElement.style.removeProperty('--church-color')
            document.documentElement.style.removeProperty('--church-color-light')
          }
        }
      }).catch(() => {})
    }
    return () => {
      document.documentElement.style.removeProperty('--church-color')
      document.documentElement.style.removeProperty('--church-color-light')
    }
  }, [user?.churchId])

  const handleLogout = () => { logout(); navigate('/login') }
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U'
  const roleLabel = user?.role === 'admin' ? t('role.admin') : user?.role === 'pastor_presidente' ? t('role.pastor') : user?.role === 'lider' ? t('role.leader') : t('role.member')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b sticky top-0 z-30" style={themeColor ? { backgroundColor: themeColor } : { backgroundColor: 'white' }}>
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`lg:hidden ${themeColor ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo_rede.png" alt="Rede Inspire" className="h-8 w-8 object-contain" />
              {churchLogo && <img src={churchLogo} alt={churchName} className="h-8 w-8 object-contain" />}
              <span className={`text-xl font-bold ${themeColor ? 'text-white' : 'text-gray-900'}`}>Rede Inspire{churchName ? ` - ${churchName}` : ''}</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <Link to="/busca" className={`w-full flex items-center rounded-lg px-4 py-2 transition-colors ${themeColor ? 'bg-white/20 text-white/80 hover:bg-white/30' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              {t('nav.searchContent')}
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Language selector */}
            <div className="relative">
              <button onClick={() => setShowLangMenu(!showLangMenu)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition ${themeColor ? 'text-white/80 hover:bg-white/20' : 'text-gray-600 hover:bg-gray-100'}`}>
                {LANG_OPTIONS.find(o => o.value === lang)?.flag} <span className="hidden sm:inline text-xs">{LANG_OPTIONS.find(o => o.value === lang)?.label}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showLangMenu && (
                <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg py-1 z-50 w-36">
                  {LANG_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => { setLang(opt.value as Lang); setShowLangMenu(false) }}
                      className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 flex items-center gap-2 ${lang === opt.value ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                      {opt.flag} {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link to="/mensagens" className={`relative ${themeColor ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{unreadCount}</span>}
            </Link>
            <div className="relative flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${themeColor ? 'bg-white/20 text-white' : 'bg-yellow-100 text-yellow-700'}`} title={t('header.points')}>
                ⭐ {userPoints}
              </span>
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium hover:opacity-90 overflow-hidden">
                {user?.photoUrl ? <img src={user.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover" /> : <span className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white">{initials}</span>}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg py-2 z-50" style={{ top: '100%' }}>
                  <div className="px-4 py-2 border-b flex items-center gap-3">
                    {user?.photoUrl ? <img src={user.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover border" /> : <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-bold">{initials}</div>}
                    <div>
                      <p className="font-medium text-sm">{user?.name}</p>
                      <p className="text-xs text-gray-500">{roleLabel}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                      <p className="text-xs text-yellow-600 font-medium mt-0.5">⭐ {userPoints} {t('header.points')}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    🚪 {t('header.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-start">
        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r z-20 overflow-y-auto transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                style={isActive && themeColor ? { backgroundColor: themeColor + '15', color: themeColor } : isActive ? { backgroundColor: '#f9fafb', color: '#1f2937' } : {}}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.path === '/mensagens' && unreadCount > 0 && (
                  <span className="ml-auto text-white text-xs px-1.5 py-0.5 rounded-full" style={themeColor ? { backgroundColor: themeColor } : { backgroundColor: '#ef4444' }}>{unreadCount}</span>
                )}
              </Link>
              )
            })}
            {(user?.role === 'admin' || user?.role === 'pastor_presidente') && (
              <>
                <div className="pt-3 pb-1 px-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('nav.users')}</span>
                </div>
                <Link to="/lideres" onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${location.pathname === '/lideres' ? 'font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                  style={location.pathname === '/lideres' && themeColor ? { backgroundColor: themeColor + '15', color: themeColor } : location.pathname === '/lideres' ? { backgroundColor: '#f9fafb', color: '#1f2937' } : {}}>
                  <span>👥</span><span>{t('nav.users')}</span>
                </Link>
                <Link to="/registro" onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${location.pathname === '/registro' ? 'font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                  style={location.pathname === '/registro' && themeColor ? { backgroundColor: themeColor + '15', color: themeColor } : location.pathname === '/registro' ? { backgroundColor: '#f9fafb', color: '#1f2937' } : {}}>
                  <span>➕</span><span>{t('nav.registerUser')}</span>
                </Link>
              </>
            )}
            <div className="pt-3 pb-1 px-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('nav.management')}</span>
            </div>
            <Link to="/gestao" onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${location.pathname === '/gestao' ? 'font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
              style={location.pathname === '/gestao' && themeColor ? { backgroundColor: themeColor + '15', color: themeColor } : location.pathname === '/gestao' ? { backgroundColor: '#f9fafb', color: '#1f2937' } : {}}>
              <span>⚙️</span><span>{user?.role === 'lider' ? t('nav.ministries') : t('nav.ministriesChurches')}</span>
            </Link>
          </nav>
          <div className="border-t p-4">
            <button onClick={() => setShowCategories(!showCategories)} className="flex items-center justify-between w-full text-sm font-medium text-gray-700">
              <span>{t('nav.categories')}</span>
              <span className="text-xs">{showCategories ? '▲' : '▼'}</span>
            </button>
            {showCategories && (
              <div className="mt-2 space-y-1">
                {categories.map((cat) => (
                  <Link key={cat} to={`/catalogo?category=${encodeURIComponent(cat)}`} onClick={() => setSidebarOpen(false)} className="block px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded">
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-10 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">{children}</main>
      </div>

      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Rede Inspire</h3>
              <p className="text-sm text-gray-500">{t('footer.description')}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">{t('footer.content')}</h4>
              <div className="space-y-2 text-sm text-gray-500">
                <Link to="/catalogo" className="block hover:text-gray-900">{t('nav.catalog')}</Link>
                <Link to="/trilhas" className="block hover:text-gray-900">{t('nav.trails')}</Link>
                <Link to="/podcast" className="block hover:text-gray-900">{t('nav.podcast')}</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">{t('footer.tools')}</h4>
              <div className="space-y-2 text-sm text-gray-500">
                <Link to="/planejamento" className="block hover:text-gray-900">{t('nav.planning')}</Link>
                <Link to="/dashboard" className="block hover:text-gray-900">{t('nav.dashboard')}</Link>
                <Link to="/mapa" className="block hover:text-gray-900">{t('nav.map')}</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">{t('footer.support')}</h4>
              <div className="space-y-2 text-sm text-gray-500">
                <Link to="/mentorias" className="block hover:text-gray-900">{t('nav.mentoring')}</Link>
                <Link to="/mensagens" className="block hover:text-gray-900">{t('nav.messages')}</Link>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-4 text-center text-xs text-gray-400">© 2026 Rede Inspire. {t('footer.rights')}</div>
        </div>
      </footer>
    </div>
  )
}
