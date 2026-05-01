import { useState, useEffect } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n/I18nContext'

function CreateMinistryModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { createMinistry } = useData()
  const { getLeaders } = useAuth()
  const { t } = useI18n()
  const [name, setName] = useState(''); const [description, setDescription] = useState('')
  const [leaderId, setLeaderId] = useState(''); const [leaders, setLeaders] = useState<any[]>([])
  const [saving, setSaving] = useState(false); const [error, setError] = useState('')
  useEffect(() => { getLeaders().then(l => setLeaders(l.filter((u: any) => u.role === 'lider' && u.status === 'active'))) }, [])
  const handleSubmit = async () => {
    if (!name.trim()) { setError(t('common.nameRequired')); return }
    setSaving(true); setError('')
    try { const leader = leaders.find(l => l.id === leaderId); await createMinistry({ name: name.trim(), description: description.trim(), leaderId: leaderId || undefined, leaderName: leader?.name || undefined }); onCreated() }
    catch (e: any) { setError(e.message || 'Erro.') } finally { setSaving(false) }
  }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{t('management.newMinistry')}</h2>
        {error && <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('management.churchName').replace('Igreja', '')} *</label><input value={name} onChange={e => setName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('common.description')}</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" rows={2} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Líder</label><select value={leaderId} onChange={e => setLeaderId(e.target.value)} className="w-full border rounded px-3 py-2 text-sm bg-white"><option value="">-- --</option>{leaders.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">{t('common.cancel')}</button>
          <button onClick={handleSubmit} disabled={saving} className="bg-gray-900 text-white px-6 py-2 rounded text-sm disabled:opacity-50">{saving ? t('common.saving') : t('management.register')}</button>
        </div></div></div>
  )
}

function EditMinistryModal({ item, onClose, onSaved }: { item: any; onClose: () => void; onSaved: () => void }) {
  const { updateMinistry } = useData()
  const { getLeaders } = useAuth()
  const { t } = useI18n()
  const [name, setName] = useState(item.name || ''); const [description, setDescription] = useState(item.description || '')
  const [leaderId, setLeaderId] = useState(item.leaderId || ''); const [leaders, setLeaders] = useState<any[]>([])
  const [saving, setSaving] = useState(false); const [error, setError] = useState('')
  useEffect(() => { getLeaders().then(l => setLeaders(l.filter((u: any) => u.status === 'active'))) }, [])
  const handleSubmit = async () => {
    if (!name.trim()) { setError(t('common.nameRequired')); return }
    setSaving(true); setError('')
    try { const leader = leaders.find(l => l.id === leaderId); await updateMinistry(item.id, { name: name.trim(), description: description.trim(), leaderId: leaderId || undefined, leaderName: leader?.name || undefined }); onSaved() }
    catch (e: any) { setError(e.message || 'Erro.') } finally { setSaving(false) }
  }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{t('management.editMinistry')}</h2>
        {error && <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('management.churchName').replace('Igreja', '')} *</label><input value={name} onChange={e => setName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('common.description')}</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" rows={2} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Líder</label><select value={leaderId} onChange={e => setLeaderId(e.target.value)} className="w-full border rounded px-3 py-2 text-sm bg-white"><option value="">--</option>{leaders.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">{t('common.cancel')}</button>
          <button onClick={handleSubmit} disabled={saving} className="bg-gray-900 text-white px-6 py-2 rounded text-sm disabled:opacity-50">{saving ? t('common.saving') : t('common.save')}</button>
        </div></div></div>
  )
}

function ChurchVisualFields({ logoUrl, setLogoUrl, themeColor, setThemeColor }: { logoUrl: string; setLogoUrl: (v: string) => void; themeColor: string; setThemeColor: (v: string) => void }) {
  const { t } = useI18n()
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return; if (f.size > 500 * 1024) { alert('Máximo 500KB'); return }
    const r = new FileReader(); r.onload = () => setLogoUrl(r.result as string); r.readAsDataURL(f)
  }
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">{t('management.visualIdentity')}</h3>
      <div className="flex items-center gap-4">
        {logoUrl ? <img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-lg object-contain border bg-white" /> : <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-2xl border">&#9962;</div>}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('management.churchLogo')}</label>
          <label className="inline-block cursor-pointer bg-white border rounded px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">{t('management.chooseImage')}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoUpload} className="hidden" /></label>
          <p className="text-xs text-gray-400 mt-1">JPG/PNG/WebP, máx 500KB</p>
          {logoUrl && <button onClick={() => setLogoUrl('')} className="text-xs text-red-500 hover:text-red-700 mt-1">Remover</button>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('management.themeColor')}</label>
        <div className="flex items-center gap-3">
          <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)} className="w-10 h-10 rounded border cursor-pointer" />
          <input type="text" value={themeColor} onChange={e => setThemeColor(e.target.value)} className="border rounded px-3 py-1.5 text-sm w-28 font-mono" />
          <div className="h-8 flex-1 rounded" style={{ backgroundColor: themeColor }} />
        </div>
        <p className="text-xs text-gray-400 mt-1">{t('management.themeColorDesc')}</p>
      </div>
    </div>
  )
}

function CreateChurchModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { createChurch } = useData()
  const { t } = useI18n()
  const [name, setName] = useState(''); const [pastorName, setPastorName] = useState('')
  const [cep, setCep] = useState(''); const [address, setAddress] = useState('')
  const [city, setCity] = useState(''); const [state, setState] = useState('')
  const [lat, setLat] = useState(''); const [lng, setLng] = useState('')
  const [memberCount, setMemberCount] = useState(''); const [phone, setPhone] = useState('')
  const [logoUrl, setLogoUrl] = useState(''); const [themeColor, setThemeColor] = useState('#1f2937')
  const [saving, setSaving] = useState(false); const [error, setError] = useState(''); const [loadingCep, setLoadingCep] = useState(false)
  const brStates = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']
  const formatCep = (v: string) => { const c = v.replace(/\D/g, '').slice(0, 8); return c.length > 5 ? c.slice(0, 5) + '-' + c.slice(5) : c }
  const handleCepBlur = async () => {
    const c = cep.replace(/\D/g, ''); if (c.length !== 8) return; setLoadingCep(true)
    try { const r = await fetch(`https://viacep.com.br/ws/${c}/json/`); const d = await r.json(); if (!d.erro) { setAddress(d.logradouro || ''); setCity(d.localidade || ''); setState(d.uf || ''); try { const g = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${d.logradouro}, ${d.localidade}, ${d.uf}, Brazil`)}&limit=1`); const gd = await g.json(); if (gd.length > 0) { setLat(gd[0].lat); setLng(gd[0].lon) } } catch {} } } catch {} finally { setLoadingCep(false) }
  }
  const handleSubmit = async () => {
    if (!name.trim() || !city.trim() || !pastorName.trim()) { setError(t('common.nameRequired')); return }
    setSaving(true); setError('')
    try { await createChurch({ name: name.trim(), pastorName: pastorName.trim(), cep: cep.replace(/\D/g, ''), address: address.trim(), city: city.trim(), state, lat: parseFloat(lat) || 0, lng: parseFloat(lng) || 0, memberCount: parseInt(memberCount) || 0, phone: phone.trim(), logoUrl, themeColor }); onCreated() }
    catch (e: any) { setError(e.message || 'Erro.') } finally { setSaving(false) }
  }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{t('management.newChurch')}</h2>
        {error && <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
        <div className="space-y-4">
          <ChurchVisualFields logoUrl={logoUrl} setLogoUrl={setLogoUrl} themeColor={themeColor} setThemeColor={setThemeColor} />
          <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('management.churchName')} *</label><input value={name} onChange={e => setName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Pastor *</label><input value={pastorName} onChange={e => setPastorName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">CEP</label><div className="relative"><input value={cep} onChange={e => setCep(formatCep(e.target.value))} onBlur={handleCepBlur} className="w-full border rounded px-3 py-2 text-sm" placeholder="00000-000" />{loadingCep && <span className="absolute right-2 top-2 text-xs text-gray-400">...</span>}</div></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label><input value={phone} onChange={e => setPhone(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label><input value={address} onChange={e => setAddress(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label><input value={city} onChange={e => setCity(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Estado</label><select value={state} onChange={e => setState(e.target.value)} className="w-full border rounded px-3 py-2 text-sm bg-white"><option value="">UF</option>{brStates.map(uf => <option key={uf} value={uf}>{uf}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label><input value={lat} onChange={e => setLat(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label><input value={lng} onChange={e => setLng(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Membros</label><input type="number" value={memberCount} onChange={e => setMemberCount(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">{t('common.cancel')}</button>
          <button onClick={handleSubmit} disabled={saving} className="text-white px-6 py-2 rounded text-sm disabled:opacity-50" style={{ backgroundColor: themeColor }}>{saving ? t('management.registering') : t('management.register')}</button>
        </div></div></div>
  )
}

function EditChurchModal({ item, onClose, onSaved }: { item: any; onClose: () => void; onSaved: () => void }) {
  const { updateChurch } = useData()
  const { t } = useI18n()
  const [name, setName] = useState(item.name || ''); const [pastorName, setPastorName] = useState(item.pastorName || '')
  const [cep, setCep] = useState(item.cep || ''); const [address, setAddress] = useState(item.address || '')
  const [city, setCity] = useState(item.city || ''); const [state, setState] = useState(item.state || '')
  const [lat, setLat] = useState(String(item.lat || '')); const [lng, setLng] = useState(String(item.lng || ''))
  const [memberCount, setMemberCount] = useState(String(item.memberCount || '')); const [phone, setPhone] = useState(item.phone || '')
  const [logoUrl, setLogoUrl] = useState(item.logoUrl || ''); const [themeColor, setThemeColor] = useState(item.themeColor || '#1f2937')
  const [saving, setSaving] = useState(false); const [error, setError] = useState(''); const [loadingCep, setLoadingCep] = useState(false)
  const brStates = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']
  const formatCep = (v: string) => { const c = v.replace(/\D/g, '').slice(0, 8); return c.length > 5 ? c.slice(0, 5) + '-' + c.slice(5) : c }
  const handleCepBlur = async () => {
    const c = cep.replace(/\D/g, ''); if (c.length !== 8) return; setLoadingCep(true)
    try { const r = await fetch(`https://viacep.com.br/ws/${c}/json/`); const d = await r.json(); if (!d.erro) { setAddress(d.logradouro || ''); setCity(d.localidade || ''); setState(d.uf || ''); try { const g = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${d.logradouro}, ${d.localidade}, ${d.uf}, Brazil`)}&limit=1`); const gd = await g.json(); if (gd.length > 0) { setLat(gd[0].lat); setLng(gd[0].lon) } } catch {} } } catch {} finally { setLoadingCep(false) }
  }
  const handleSubmit = async () => {
    if (!name.trim() || !city.trim()) { setError(t('common.nameRequired')); return }
    setSaving(true); setError('')
    try { await updateChurch(item.id, { name: name.trim(), pastorName: pastorName.trim(), cep: cep.replace(/\D/g, ''), address: address.trim(), city: city.trim(), state, lat: parseFloat(lat) || 0, lng: parseFloat(lng) || 0, memberCount: parseInt(memberCount) || 0, phone: phone.trim(), logoUrl, themeColor }); onSaved() }
    catch (e: any) { setError(e.message || 'Erro.') } finally { setSaving(false) }
  }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{t('management.editChurch')}</h2>
        {error && <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
        <div className="space-y-4">
          <ChurchVisualFields logoUrl={logoUrl} setLogoUrl={setLogoUrl} themeColor={themeColor} setThemeColor={setThemeColor} />
          <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('management.churchName')} *</label><input value={name} onChange={e => setName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Pastor</label><input value={pastorName} onChange={e => setPastorName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">CEP</label><div className="relative"><input value={cep} onChange={e => setCep(formatCep(e.target.value))} onBlur={handleCepBlur} className="w-full border rounded px-3 py-2 text-sm" placeholder="00000-000" />{loadingCep && <span className="absolute right-2 top-2 text-xs text-gray-400">...</span>}</div></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label><input value={phone} onChange={e => setPhone(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label><input value={address} onChange={e => setAddress(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label><input value={city} onChange={e => setCity(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Estado</label><select value={state} onChange={e => setState(e.target.value)} className="w-full border rounded px-3 py-2 text-sm bg-white"><option value="">UF</option>{brStates.map(uf => <option key={uf} value={uf}>{uf}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label><input value={lat} onChange={e => setLat(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label><input value={lng} onChange={e => setLng(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Membros</label><input type="number" value={memberCount} onChange={e => setMemberCount(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">{t('common.cancel')}</button>
          <button onClick={handleSubmit} disabled={saving} className="text-white px-6 py-2 rounded text-sm disabled:opacity-50" style={{ backgroundColor: themeColor }}>{saving ? t('common.saving') : t('common.save')}</button>
        </div></div></div>
  )
}


export default function ManagementPage() {
  const { user } = useAuth()
  const { getMinistries, deleteMinistry, getChurches, deleteChurch } = useData()
  const { t } = useI18n()
  const [tab, setTab] = useState<'ministerios' | 'igrejas'>('ministerios')
  const [ministries, setMinistries] = useState<any[]>([]); const [churches, setChurches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateMinistry, setShowCreateMinistry] = useState(false); const [showCreateChurch, setShowCreateChurch] = useState(false)
  const [editMinistry, setEditMinistry] = useState<any>(null); const [editChurch, setEditChurch] = useState<any>(null)
  const loadData = async () => {
    setLoading(true)
    try { const [m, c] = await Promise.all([getMinistries(), getChurches()]); setMinistries(m); setChurches(c) }
    catch {} finally { setLoading(false) }
  }
  useEffect(() => { loadData() }, [])
  const handleDeleteMinistry = async (id: string) => { if (!confirm(t('management.confirmDeleteMinistry'))) return; await deleteMinistry(id); loadData() }
  const handleDeleteChurch = async (id: string) => { if (!confirm(t('management.confirmDeleteChurch'))) return; await deleteChurch(id); loadData() }

  const isLider = user?.role === 'lider'
  const allTabs = [
    { key: 'ministerios' as const, label: t('management.ministries'), count: ministries.length },
    { key: 'igrejas' as const, label: t('management.churches'), count: churches.length },
  ]
  const tabs = isLider ? allTabs.filter(tb => tb.key === 'ministerios') : allTabs
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('management.title')}</h1>
        {tab === 'ministerios' && <button onClick={() => setShowCreateMinistry(true)} className="bg-gray-900 text-white px-4 py-2 rounded text-sm">+ {t('management.addMinistry')}</button>}
        {tab === 'igrejas' && user?.role === 'admin' && <button onClick={() => setShowCreateChurch(true)} className="bg-gray-900 text-white px-4 py-2 rounded text-sm">+ {t('management.addChurch')}</button>}
      </div>
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
        {tabs.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)} className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${tab === tb.key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {tb.label} <span className="ml-1 text-xs opacity-60">({tb.count})</span>
          </button>
        ))}
      </div>
      {loading ? <div className="text-center py-12 text-gray-400">...</div> : (
        <>
          {tab === 'ministerios' && (
            <div className="space-y-3">
              {ministries.length === 0 ? <p className="text-center py-8 text-gray-400">{t('management.noMinistries')}</p> : ministries.map(m => (
                <div key={m.id} className="bg-white rounded-lg border p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{m.name}</h3>
                    {m.description && <p className="text-sm text-gray-500 mt-1">{m.description}</p>}
                    {m.leaderName && <p className="text-xs text-gray-400 mt-1">Líder: {m.leaderName}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditMinistry(m)} className="text-sm text-blue-600 hover:text-blue-800">{t('common.edit')}</button>
                    <button onClick={() => handleDeleteMinistry(m.id)} className="text-sm text-red-500 hover:text-red-700">{t('common.delete')}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === 'igrejas' && (
            <div className="space-y-3">
              {churches.length === 0 ? <p className="text-center py-8 text-gray-400">{t('management.noChurches')}</p> : churches.map(c => (
                <div key={c.id} className="bg-white rounded-lg border p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {c.logoUrl ? <img src={c.logoUrl} alt="" className="w-10 h-10 rounded object-contain border" /> : <span className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-lg">&#9962;</span>}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{c.name}</h3>
                        {c.themeColor && c.themeColor !== '#1f2937' && <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: c.themeColor }} />}
                      </div>
                      <p className="text-sm text-gray-500">{c.city}{c.state ? ` - ${c.state}` : ''}</p>
                      {c.pastorName && <p className="text-xs text-gray-400">Pastor: {c.pastorName}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(user?.role === 'admin' || user?.churchId === c.id) && <button onClick={() => setEditChurch(c)} className="text-sm text-blue-600 hover:text-blue-800">{t('common.edit')}</button>}
                    {user?.role === 'admin' && <button onClick={() => handleDeleteChurch(c.id)} className="text-sm text-red-500 hover:text-red-700">{t('common.delete')}</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {showCreateMinistry && <CreateMinistryModal onClose={() => setShowCreateMinistry(false)} onCreated={() => { setShowCreateMinistry(false); loadData() }} />}
      {showCreateChurch && <CreateChurchModal onClose={() => setShowCreateChurch(false)} onCreated={() => { setShowCreateChurch(false); loadData() }} />}
      {editMinistry && <EditMinistryModal item={editMinistry} onClose={() => setEditMinistry(null)} onSaved={() => { setEditMinistry(null); loadData() }} />}
      {editChurch && <EditChurchModal item={editChurch} onClose={() => setEditChurch(null)} onSaved={() => { setEditChurch(null); loadData() }} />}
    </div>
  )
}
