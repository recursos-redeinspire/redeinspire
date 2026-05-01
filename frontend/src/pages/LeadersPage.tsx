import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, type User } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { useI18n } from '../i18n/I18nContext'

const AVAILABLE_MINISTRIES = ['Louvor', 'Jovens', 'Crianças', 'Casais', 'Missões', 'Ensino', 'Diaconia', 'Intercessão', 'Comunicação', 'Acolhimento']

function EditUserModal({ item, onClose, onSaved, churches, isAdmin }: { item: any; onClose: () => void; onSaved: () => void; churches: any[]; isAdmin: boolean }) {
  const { updateUser, resetPassword } = useAuth()
  const { getMinistries } = useData()
  const { t } = useI18n()
  const [name, setName] = useState(item.name || '')
  const [email, setEmail] = useState(item.email || '')
  const [churchId, setChurchId] = useState(item.churchId || '')
  const [role, setRole] = useState(item.role || 'lider')
  const [ministries, setMinistries] = useState<string[]>(item.ministries || [])
  const [photoUrl, setPhotoUrl] = useState(item.photoUrl || '')
  const [birthDate, setBirthDate] = useState(item.birthDate || '')
  const [availableMinistries, setAvailableMinistries] = useState<string[]>(AVAILABLE_MINISTRIES)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => { getMinistries().then((m: any[]) => { if (m.length > 0) setAvailableMinistries(m.map(x => x.name)) }) }, [])

  const toggleMinistry = (m: string) => setMinistries(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    if (f.size > 200 * 1024) { setError('Foto: máximo 200KB'); return }
    const r = new FileReader(); r.onload = () => setPhotoUrl(r.result as string); r.readAsDataURL(f)
  }

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) { setError(t('leaders.name') + ' / ' + t('leaders.email')); return }
    setSaving(true); setError(''); setSuccessMsg('')
    const result = await updateUser(item.id, { name: name.trim(), email: email.trim(), churchId: churchId || undefined, role, ministries, photoUrl, birthDate })
    if (result.success) onSaved(); else { setError(result.error || 'Erro.'); setSaving(false) }
  }

  const handleResetPassword = async () => {
    if (!confirm(t('leaders.confirmResetPassword'))) return
    setResetting(true); setError(''); setSuccessMsg('')
    const result = await resetPassword(item.id)
    if (result.success) { setSuccessMsg(t('leaders.resetSuccess')) }
    else { setError(result.error || 'Erro ao resetar senha.') }
    setResetting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{t('leaders.editUser')}</h2>
        {error && <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
        {successMsg && <div className="mb-3 text-sm text-green-700 bg-green-50 p-2 rounded">{successMsg}</div>}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {photoUrl ? <img src={photoUrl} alt="" className="w-14 h-14 rounded-full object-cover border" /> : <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xl">👤</div>}
            <div>
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded text-sm text-gray-700 inline-block">📷 {photoUrl ? 'Trocar foto' : 'Enviar foto'}<input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" /></label>
              <p className="text-xs text-gray-400 mt-1">JPG/PNG, máx 200KB</p>
              {photoUrl && <button onClick={() => setPhotoUrl('')} className="text-xs text-red-500 hover:text-red-700">Remover</button>}
            </div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('leaders.name')} *</label><input value={name} onChange={e => setName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('leaders.email')} *</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('register.birthDate')}</label><input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
          {isAdmin && <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('leaders.church')}</label><select value={churchId} onChange={e => setChurchId(e.target.value)} className="w-full border rounded px-3 py-2 text-sm bg-white"><option value="">--</option>{churches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('leaders.role')}</label><select value={role} onChange={e => setRole(e.target.value)} className="w-full border rounded px-3 py-2 text-sm bg-white"><option value="lider">{t('role.leader')}</option>{isAdmin && <><option value="pastor_presidente">{t('role.pastor')}</option><option value="admin">{t('role.admin')}</option></>}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">{t('leaders.ministries')}</label><div className="flex flex-wrap gap-2">{availableMinistries.map(m => <button key={m} type="button" onClick={() => toggleMinistry(m)} className={`px-3 py-1 rounded-full text-xs border transition-colors ${ministries.includes(m) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>{m}</button>)}</div></div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-amber-800">🔑 {t('leaders.resetPassword')}</p><p className="text-xs text-amber-600 mt-0.5">{t('leaders.resetPasswordDesc')}</p></div>
              <button onClick={handleResetPassword} disabled={resetting} className="bg-amber-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-amber-700 disabled:opacity-50">{resetting ? t('leaders.resetting') : t('leaders.resetBtn')}</button>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">{t('common.cancel')}</button>
          <button onClick={handleSubmit} disabled={saving} className="bg-gray-900 text-white px-6 py-2 rounded text-sm disabled:opacity-50">{saving ? t('common.saving') : t('common.save')}</button>
        </div></div></div>
  )
}

export default function LeadersPage() {
  const { user, getLeaders, blockLeader, deleteLeader } = useAuth()
  const { getChurches } = useData()
  const { t } = useI18n()
  const [leaders, setLeaders] = useState<User[]>([])
  const [churches, setChurches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [editUser, setEditUser] = useState<any>(null)

  const isAdm = user?.role === 'admin'

  useEffect(() => {
    setLoading(true)
    Promise.all([getLeaders(), getChurches()]).then(([l, c]) => { setLeaders(l); setChurches(c); setLoading(false) }).catch(() => setLoading(false))
  }, [getLeaders, refresh])

  if (!user || (user.role !== 'admin' && user.role !== 'pastor_presidente')) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('leaders.restricted')}</p>
      </div>
    )
  }

  const filtered = search
    ? leaders.filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase()))
    : leaders

  const handleBlock = async (leaderId: string, currentlyBlocked: boolean) => {
    const action = currentlyBlocked ? t('leaders.unblock') : t('leaders.block')
    if (!confirm(t('leaders.confirmBlock') + ` ${action}?`)) return
    await blockLeader(leaderId, !currentlyBlocked)
    setRefresh(r => r + 1)
  }

  const handleDelete = async (leaderId: string, name: string) => {
    if (!confirm(`${t('leaders.confirmDelete')} "${name}"${t('leaders.confirmDeleteSuffix')}`)) return
    await deleteLeader(leaderId)
    setRefresh(r => r + 1)
  }

  const canManage = (leader: any) => isAdm || leader.role === 'lider'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('leaders.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{leaders.length} {t('leaders.count')}{!isAdm ? ` ${t('leaders.inYourChurch')}` : ''}</p>
        </div>
        <Link to="/registro" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
          + {t('leaders.newUser')}
        </Link>
      </div>

      <div className="mb-4">
        <input type="text" placeholder={t('leaders.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300" />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">{t('leaders.loading')}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">{search ? t('leaders.noUsers') : t('leaders.noUsersYet')}</p>
          {!search && <Link to="/registro" className="text-gray-900 hover:underline text-sm mt-2 inline-block">{t('leaders.registerFirst')}</Link>}
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase">{t('leaders.name')}</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">{t('leaders.email')}</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">{t('leaders.church')}</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase">{t('leaders.role')}</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">{t('leaders.ministries')}</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase">{t('leaders.status')}</th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-gray-500 uppercase">{t('leaders.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(leader => {
                const isBlocked = leader.status === 'blocked'
                const isAdminUser = leader.role === 'admin'
                const isPastorUser = leader.role === 'pastor_presidente'
                return (
                  <tr key={leader.id} className="hover:bg-gray-50 transition">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        {leader.photoUrl ? (
                          <img src={leader.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover border flex-shrink-0" />
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0 ${isBlocked ? 'bg-red-500' : isAdminUser ? 'bg-red-700' : isPastorUser ? 'bg-purple-700' : 'bg-gray-900'}`}>
                            {leader.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{leader.name}</p>
                          <p className="text-xs text-gray-400 sm:hidden">{leader.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600 hidden sm:table-cell">{leader.email}</td>
                    <td className="px-3 py-3 text-sm text-gray-600 hidden lg:table-cell">{churches.find(c => c.id === leader.churchId)?.name || '—'}</td>
                    <td className="px-3 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${isAdminUser ? 'bg-red-50 text-red-700' : isPastorUser ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                        {isAdminUser ? `🛡️ ${t('role.admin')}` : isPastorUser ? `⛪ ${t('role.pastor')}` : `👤 ${t('role.leader')}`}
                      </span>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(leader.ministries || []).slice(0, 2).map(m => (
                          <span key={m} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{m}</span>
                        ))}
                        {(leader.ministries || []).length > 2 && (
                          <span className="text-xs text-gray-400">+{leader.ministries.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        isBlocked ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {isBlocked ? t('leaders.blocked') : t('leaders.active')}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {canManage(leader) && (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditUser(leader)} className="text-xs px-2 py-1 rounded-lg font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition" title={t('leaders.editUser')}>✏️</button>
                          <button onClick={() => handleBlock(leader.id, isBlocked)} className={`text-xs px-2 py-1 rounded-lg font-medium transition ${isBlocked ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`} title={isBlocked ? t('leaders.unblock') : t('leaders.block')}>{isBlocked ? '🔓' : '🔒'}</button>
                          <button onClick={() => handleDelete(leader.id, leader.name)} className="text-xs px-2 py-1 rounded-lg font-medium bg-red-50 text-red-700 hover:bg-red-100 transition" title={t('common.cancel')}>🗑</button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {editUser && <EditUserModal item={editUser} onClose={() => setEditUser(null)} onSaved={() => { setEditUser(null); setRefresh(r => r + 1) }} churches={churches} isAdmin={!!isAdm} />}
    </div>
  )
}
