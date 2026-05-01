import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { useI18n } from '../i18n/I18nContext'
import { LANG_OPTIONS, type Lang } from '../i18n/translations'

function isValidCPF(cpf: string): boolean {
  return cpf.replace(/\D/g, '').length === 11
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { user, registerLeader } = useAuth()
  const { getChurches, getMinistries } = useData()
  const { t } = useI18n()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [churchId, setChurchId] = useState('')
  const [isPastor, setIsPastor] = useState(false)
  const [ministries, setMinistries] = useState<string[]>([])
  const [churches, setChurches] = useState<any[]>([])
  const [availableMinistries, setAvailableMinistries] = useState<string[]>([])
  const [photoUrl, setPhotoUrl] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [preferredLang, setPreferredLang] = useState<Lang>('pt')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const isPastorUser = user?.role === 'pastor_presidente'

  useEffect(() => {
    getChurches().then(setChurches)
    getMinistries().then((m: any[]) => setAvailableMinistries(m.map(x => x.name)))
    if (isPastorUser && user?.churchId) setChurchId(user.churchId)
  }, [])

  if (!user || (user.role !== 'admin' && user.role !== 'pastor_presidente')) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('register.onlyAdmins')}</p>
        <button onClick={() => navigate('/')} className="mt-4 text-gray-900 hover:underline">{t('register.backHome')}</button>
      </div>
    )
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const cpfValid = isValidCPF(cpf)
  const formValid = name.trim().length >= 2 && emailValid && cpfValid && churchId && ministries.length > 0 && birthDate && password.length >= 6 && password === confirmPassword

  function toggleMinistry(m: string) {
    setMinistries(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  }

  function handleCpfChange(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    let masked = digits
    if (digits.length > 9) masked = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
    else if (digits.length > 6) masked = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    else if (digits.length > 3) masked = `${digits.slice(0, 3)}.${digits.slice(3)}`
    setCpf(masked)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!formValid) { setError(t('register.fillAll')); return }

    setLoading(true)
    try {
      const role = isPastor ? 'pastor_presidente' : 'lider'
      const result = await registerLeader({ name: name.trim(), email: email.trim().toLowerCase(), cpf: cpf.replace(/\D/g, ''), ministries, churchId, role, photoUrl, birthDate, password, preferredLang })
      if (result.success) {
        setSuccess(t('register.success'))
        setName(''); setEmail(''); setCpf(''); setMinistries([]); setChurchId(''); setIsPastor(false); setPhotoUrl(''); setBirthDate(''); setPassword(''); setConfirmPassword('')
      } else {
        setError(result.error ?? 'Erro ao cadastrar.')
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">{t('register.title')}</h1>
      <p className="text-sm text-gray-500 mb-6">{t('register.subtitle')}</p>

      {error && <div role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white border rounded-lg p-6" noValidate>
        <div className="flex items-center gap-4">
          {photoUrl ? <img src={photoUrl} className="w-16 h-16 rounded-full object-cover border" alt="" /> : <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl">👤</div>}
          <div><label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded text-sm text-gray-700">📷 {photoUrl ? t('register.changePhoto') : t('register.photo')}<input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (!f) return; if (f.size > 200*1024) { alert('Máximo 200KB'); return }; const r = new FileReader(); r.onload = () => setPhotoUrl(r.result as string); r.readAsDataURL(f) }} className="hidden" /></label><p className="text-xs text-gray-400 mt-1">JPG/PNG, máx 200KB</p></div>
        </div>
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">{t('register.name')}</label>
          <input id="name" type="text" value={name} onChange={e => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-800 focus:ring-2 focus:ring-gray-300" />
        </div>
        <div>
          <label htmlFor="reg-email" className="mb-1 block text-sm font-medium text-gray-700">{t('register.email')}</label>
          <input id="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@email.com"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-800 focus:ring-2 focus:ring-gray-300" />
        </div>
        <div>
          <label htmlFor="cpf" className="mb-1 block text-sm font-medium text-gray-700">{t('register.cpf')}</label>
          <input id="cpf" type="text" inputMode="numeric" value={cpf} onChange={e => handleCpfChange(e.target.value)} placeholder="000.000.000-00"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-800 focus:ring-2 focus:ring-gray-300" />
        </div>
        <div>
          <label htmlFor="birthDate" className="mb-1 block text-sm font-medium text-gray-700">{t('register.birthDate')} *</label>
          <input id="birthDate" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-800 focus:ring-2 focus:ring-gray-300" />
        </div>
        <div>
          <label htmlFor="reg-password" className="mb-1 block text-sm font-medium text-gray-700">{t('register.password')} *</label>
          <input id="reg-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('register.minPassword')}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-800 focus:ring-2 focus:ring-gray-300" />
        </div>
        <div>
          <label htmlFor="reg-confirm-password" className="mb-1 block text-sm font-medium text-gray-700">{t('register.confirmPassword')} *</label>
          <input id="reg-confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder={t('register.repeatPassword')}
            className={`w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-300 ${confirmPassword && confirmPassword !== password ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-gray-800'}`} />
          {confirmPassword && confirmPassword !== password && <p className="text-xs text-red-500 mt-1">{t('register.passwordMismatch')}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{t('register.language')} *</label>
          <div className="flex flex-wrap gap-2">
            {LANG_OPTIONS.map(opt => (
              <button key={opt.value} type="button" onClick={() => setPreferredLang(opt.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${preferredLang === opt.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {opt.flag} {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="church" className="mb-1 block text-sm font-medium text-gray-700">{t('register.church')} *</label>
          {isPastorUser ? (
            <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              {churches.find(c => c.id === user?.churchId)?.name || t('register.yourChurch')}
              <p className="text-xs text-gray-400 mt-1">{t('register.pastorOnlyOwnChurch')}</p>
            </div>
          ) : (
            <select id="church" value={churchId} onChange={e => setChurchId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-800 focus:ring-2 focus:ring-gray-300 bg-white">
              <option value="">{t('register.selectChurch')}</option>
              {churches.map((c: any) => <option key={c.id} value={c.id}>{c.name} ({c.city}/{c.state})</option>)}
            </select>
          )}
          {churches.length === 0 && !isPastorUser && <p className="text-xs text-amber-600 mt-1">{t('register.noChurches')}</p>}
        </div>
        {!isPastorUser && (
          <>
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
              <input id="isPastor" type="checkbox" checked={isPastor} onChange={e => setIsPastor(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500" />
              <label htmlFor="isPastor" className="text-sm font-medium text-gray-700">{t('register.isPastor')}</label>
            </div>
            {isPastor && <p className="text-xs text-amber-600 -mt-3 ml-1">{t('register.pastorWarning')}</p>}
          </>
        )}
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-gray-700">{t('register.ministries')}</legend>
          <div className="flex flex-wrap gap-2">
            {availableMinistries.length === 0 && <p className="text-xs text-amber-600">{t('register.noMinistries')}</p>}
            {availableMinistries.map(m => (
              <button key={m} type="button" onClick={() => toggleMinistry(m)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition ${ministries.includes(m) ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {m}
              </button>
            ))}
          </div>
        </fieldset>
        <button type="submit" disabled={!formValid || loading}
          className="w-full rounded-lg bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? t('register.submitting') : t('register.submit')}
        </button>
      </form>
    </div>
  )
}
