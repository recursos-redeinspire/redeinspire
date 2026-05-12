import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { useI18n } from '../i18n/I18nContext'
import { useTheme } from '../contexts/ThemeContext'
import { LANG_OPTIONS, type Lang } from '../i18n/translations'
import {
  Home, BookOpen, Search, Route, GraduationCap,
  CalendarDays, FolderDown, MapPin, BarChart3, MessageSquare,
  Users, UserPlus, Settings, ChevronDown,
  Menu, Bell, LogOut, Star
} from 'lucide-react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t, lang, setLang } = useI18n()
  const { isDark, toggleTheme } = useTheme()

  const navItems = [
    { path: '/', label: t('nav.home'), icon: <Home size={18} />, key: 'home' },
    { path: '/catalogo', label: t('nav.catalog'), icon: <BookOpen size={18} />, key: 'catalogo' },
    { path: '/trilhas', label: t('nav.trails'), icon: <Route size={18} />, key: 'trilhas' },
    { path: '/mentorias', label: t('nav.mentoring'), icon: <GraduationCap size={18} />, key: 'mentorias' },
    { path: '/planejamento', label: t('nav.planning'), icon: <CalendarDays size={18} />, key: 'planejamento' },
    { path: '/materiais', label: t('nav.materials'), icon: <FolderDown size={18} />, key: 'materiais' },
    { path: '/mapa', label: t('nav.map'), icon: <MapPin size={18} />, key: 'mapa' },
    { path: '/dashboard', label: t('nav.dashboard'), icon: <BarChart3 size={18} />, key: 'dashboard' },
  ]

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [headerSearch, setHeaderSearch] = useState('')
  const [churchName, setChurchName] = useState('')
  const [churchLogo, setChurchLogo] = useState('')
  const [themeColor, setThemeColor] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { getUnreadCount, getChurches, getMyPoints } = useData()

  // Filter nav items based on user permissions (only applies to lider role)
  const userPermissions = (user as any)?.permissions as string[] | null | undefined
  const filteredNavItems = (!userPermissions || user?.role !== 'lider')
    ? navItems
    : navItems.filter(item => item.key === 'home' || userPermissions.includes(item.key))
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b dark:border-gray-700 sticky top-0 z-30" style={themeColor ? { backgroundColor: themeColor } : undefined}>
        <div className={`px-4 flex items-center justify-between h-16 ${!themeColor ? 'bg-white dark:bg-gray-800' : ''}`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`lg:hidden ${themeColor ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>
              <Menu size={24} />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo_rede.png" alt="Rede Inspire" className="h-8 w-8 object-contain" />
              {churchLogo && <img src={churchLogo} alt={churchName} className="h-8 w-8 object-contain" />}
              <span className={`text-xl font-bold hidden sm:inline ${themeColor ? 'text-white' : 'text-gray-900 dark:text-white'}`}>Rede Inspire{churchName ? ` - ${churchName}` : ''}</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className={`w-full flex items-center rounded-lg px-4 py-2 ${themeColor ? 'bg-white/20' : 'bg-gray-100'}`}>
              <Search size={16} className={`mr-2 flex-shrink-0 ${themeColor ? 'text-white/60' : 'text-gray-400'}`} />
              <input
                type="text"
                value={headerSearch}
                onChange={e => setHeaderSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && headerSearch.trim()) { navigate(`/busca?q=${encodeURIComponent(headerSearch.trim())}`); setHeaderSearch('') } }}
                placeholder={t('nav.searchContent')}
                className={`w-full bg-transparent outline-none text-sm ${themeColor ? 'text-white placeholder-white/60' : 'text-gray-700 placeholder-gray-500'}`}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark mode toggle */}
            <button onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}
              title={isDark ? 'Modo claro' : 'Modo escuro'}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-200 ${isDark ? 'translate-x-6' : 'translate-x-0.5'}`}>
                {isDark ? (
                  <svg className="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                ) : (
                  <svg className="w-3 h-3 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                )}
              </span>
            </button>
            {/* Language selector */}
            <div className="relative">
              <button onClick={() => setShowLangMenu(!showLangMenu)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition ${themeColor ? 'text-white/80 hover:bg-white/20' : 'text-gray-600 hover:bg-gray-100'}`}>
                {LANG_OPTIONS.find(o => o.value === lang)?.flag} <span className="hidden sm:inline text-xs">{LANG_OPTIONS.find(o => o.value === lang)?.label}</span>
                <ChevronDown size={12} />
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
              <MessageSquare size={22} />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{unreadCount}</span>}
            </Link>
            <Link to="/mensagens" className={`relative ${themeColor ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>
              <Bell size={22} />
            </Link>
            <div className="relative flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${themeColor ? 'bg-white/20 text-white' : 'bg-yellow-100 text-yellow-700'}`} title={t('header.points')}>
                <Star size={14} /> {userPoints}
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
                      <p className="text-xs text-yellow-600 font-medium mt-0.5 flex items-center gap-1"><Star size={12} /> {userPoints} {t('header.points')}</p>
                    </div>
                  </div>
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setShowUserMenu(false)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b">
                      <Settings size={16} /> Administrar
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <LogOut size={16} /> {t('header.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-start">
        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 z-20 overflow-y-auto transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <nav className="p-4 space-y-1">
            {filteredNavItems.map((item) => {
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
                  <span><Users size={18} /></span><span>{t('nav.users')}</span>
                </Link>
                <Link to="/registro" onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${location.pathname === '/registro' ? 'font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                  style={location.pathname === '/registro' && themeColor ? { backgroundColor: themeColor + '15', color: themeColor } : location.pathname === '/registro' ? { backgroundColor: '#f9fafb', color: '#1f2937' } : {}}>
                  <span><UserPlus size={18} /></span><span>{t('nav.registerUser')}</span>
                </Link>
              </>
            )}
            <div className="pt-3 pb-1 px-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('nav.management')}</span>
            </div>
            <Link to="/gestao" onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${location.pathname === '/gestao' ? 'font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
              style={location.pathname === '/gestao' && themeColor ? { backgroundColor: themeColor + '15', color: themeColor } : location.pathname === '/gestao' ? { backgroundColor: '#f9fafb', color: '#1f2937' } : {}}>
              <span><Settings size={18} /></span><span>{user?.role === 'lider' ? t('nav.ministries') : t('nav.ministriesChurches')}</span>
            </Link>
          </nav>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-10 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">{children}</main>
      </div>

      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-12">
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
