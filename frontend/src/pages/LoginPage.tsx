import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import { LANG_OPTIONS, type Lang } from '../i18n/translations'

function BirthdayModal({ name, onClose }: { name: string; onClose: () => void }) {
  const { t } = useI18n()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    try {
      const ctx = new AudioContext()
      const notes: [number, number][] = [
        [262, 0.3], [262, 0.3], [294, 0.6], [262, 0.6], [349, 0.6], [330, 1.2],
        [262, 0.3], [262, 0.3], [294, 0.6], [262, 0.6], [392, 0.6], [349, 1.2],
        [262, 0.3], [262, 0.3], [523, 0.6], [440, 0.6], [349, 0.6], [330, 0.6], [294, 1.2],
        [466, 0.3], [466, 0.3], [440, 0.6], [349, 0.6], [392, 0.6], [349, 1.2],
      ]
      let time = ctx.currentTime + 0.2
      notes.forEach(([freq, dur]) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.15, time)
        gain.gain.exponentialRampToValueAtTime(0.01, time + dur * 0.9)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(time)
        osc.stop(time + dur)
        time += dur
      })
      audioRef.current = ctx as any
    } catch {}
    return () => { try { (audioRef.current as any)?.close() } catch {} }
  }, [])

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center animate-bounce-in shadow-2xl">
        <div className="text-6xl mb-4">🎂</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('birthday.title')}</h2>
        <p className="text-lg text-gray-700 mb-1">{t('birthday.congrats')} <span className="font-semibold">{name}</span>!</p>
        <p className="text-gray-500 mb-6">{t('birthday.message')}</p>
        <div className="text-4xl mb-6">🎈🎁🎊🎉🎈</div>
        <button onClick={onClose} className="bg-gray-900 text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-gray-800 transition">
          {t('birthday.close')}
        </button>
      </div>
    </div>
  )
}

function ChangePasswordModal({ onDone }: { onDone: () => void }) {
  const { changePassword } = useAuth()
  const { t } = useI18n()
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const valid = newPass.length >= 6 && newPass === confirmPass

  async function handleSubmit() {
    if (newPass !== confirmPass) { setError(t('firstLogin.mismatch')); return }
    if (newPass.length < 6) { setError(t('firstLogin.minChars')); return }
    setSaving(true); setError('')
    try {
      const r = await changePassword(newPass)
      if (r.success) onDone()
      else setError(r.error || t('common.error'))
    } catch { setError(t('login.connectionError')) } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔐</div>
          <h2 className="text-xl font-bold text-gray-900">{t('firstLogin.title')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('firstLogin.subtitle')}</p>
        </div>
        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('firstLogin.newPassword')}</label>
            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder={t('firstLogin.minChars')}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('firstLogin.confirmPassword')}</label>
            <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder={t('firstLogin.confirmPassword')}
              className={`w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-300 ${confirmPass && confirmPass !== newPass ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'}`} />
            {confirmPass && confirmPass !== newPass && <p className="text-xs text-red-500 mt-1">{t('firstLogin.mismatch')}</p>}
          </div>
        </div>
        <button onClick={handleSubmit} disabled={!valid || saving}
          className="w-full mt-6 rounded-lg bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? t('firstLogin.saving') : t('firstLogin.submit')}
        </button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const { t, lang, setLang } = useI18n()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showBirthday, setShowBirthday] = useState(false)
  const [birthdayName, setBirthdayName] = useState('')
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [manualLangChange, setManualLangChange] = useState(false)

  if (isAuthenticated && !showChangePassword && !showBirthday) {
    navigate('/', { replace: true })
    return null
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const formValid = emailValid && password.length >= 6

  function isBirthdayToday(birthDate: string): boolean {
    if (!birthDate) return false
    const today = new Date()
    const [, month, day] = birthDate.split('-').map(Number)
    return today.getMonth() + 1 === month && today.getDate() === day
  }

  function applyUserLang() {
    if (!manualLangChange) {
      const storedUser = localStorage.getItem('ri_user')
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          if (userData.preferredLang && ['pt', 'en', 'es', 'fr'].includes(userData.preferredLang)) {
            setLang(userData.preferredLang as Lang)
          }
        } catch {}
      }
    }
  }

  function checkBirthdayAndNavigate() {
    applyUserLang()
    const storedUser = localStorage.getItem('ri_user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        if (userData.birthDate && isBirthdayToday(userData.birthDate)) {
          setBirthdayName(userData.name?.split(' ')[0] || '')
          setShowBirthday(true)
          return
        }
      } catch {}
    }
    navigate('/')
  }

  function handlePasswordChanged() {
    setShowChangePassword(false)
    checkBirthdayAndNavigate()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!emailValid) { setError(t('login.invalidEmail')); return }
    if (password.length < 6) { setError(t('login.shortPassword')); return }
    setLoading(true)
    try {
      const result = await login(email, password)
      if (result.success) {
        if (result.firstLogin) { setShowChangePassword(true); return }
        checkBirthdayAndNavigate()
      } else {
        setError(result.error ?? t('login.error'))
      }
    } catch {
      setError(t('login.connectionError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 relative">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img src="/fundo_login.png" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      {showBirthday && <BirthdayModal name={birthdayName} onClose={() => { setShowBirthday(false); navigate('/') }} />}
      {showChangePassword && <ChangePasswordModal onDone={handlePasswordChanged} />}

      {/* Language selector - top right */}
      <div className="fixed top-4 right-4 z-50 flex gap-1">
        {LANG_OPTIONS.map(opt => (
          <button key={opt.value} onClick={() => { setLang(opt.value as Lang); setManualLangChange(true) }}
            className={`px-2 py-1 rounded text-sm transition ${lang === opt.value ? 'bg-white text-gray-900 font-semibold shadow' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
            {opt.flag} {opt.label}
          </button>
        ))}
      </div>

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl relative z-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <img src="/logo_rede.png" alt="Rede Inspire" className="h-16 w-16 object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{t('login.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('login.subtitle')}</p>
        </div>

        {error && <div role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">{t('login.email')}</label>
            <input id="email" type="email" autoComplete="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-300" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">{t('login.password')}</label>
            <input id="password" type="password" autoComplete="current-password" required value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-300" />
          </div>
          <button type="submit" disabled={!formValid || loading}
            className="w-full rounded-lg bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? t('login.loading') : t('login.submit')}
          </button>
        </form>

        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <p className="text-xs font-medium text-gray-600 mb-2">{t('login.testAccounts')}</p>
          <div className="space-y-1 text-xs text-gray-500">
            <p>{t('login.pastor')}: carlos@inspire.com / 123456</p>
            <p>{t('login.leader')}: maria@inspire.com / 123456</p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">© {new Date().getFullYear()} Rede Inspire</p>
      </div>
    </main>
  )
}
