import { useState, useEffect, type FormEvent } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import { RefreshCw } from 'lucide-react'

const MATERIAL_CATEGORIES = [
  { value: 'mensagem', label: 'Mensagem' },
  { value: 'estudo', label: 'Estudo Bíblico' },
  { value: 'liturgia', label: 'Liturgia' },
  { value: 'louvor', label: 'Louvor' },
  { value: 'devocional', label: 'Devocional' },
  { value: 'video', label: 'Vídeo' },
  { value: 'audio', label: 'Áudio' },
  { value: 'pdf', label: 'PDF' },
  { value: 'documento', label: 'Documento' },
  { value: 'apresentacao', label: 'Apresentação' },
  { value: 'planilha', label: 'Planilha' },
  { value: 'imagem', label: 'Imagem' },
  { value: 'outro', label: 'Outro' },
]

function CreateMaterialModal({ onClose, onCreate }: { onClose: () => void; onCreate: () => void }) {
  const { createMaterial, getUploadPresignedUrl } = useData()
  const { t } = useI18n()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('mensagem')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const formValid = title.trim().length >= 3

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!formValid) return
    setLoading(true); setError('')
    try {
      let fileUrl = '', fileName = ''
      if (file) {
        const presign = await getUploadPresignedUrl(file.name, file.type)
        await fetch(presign.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
        fileUrl = presign.fileUrl
        fileName = file.name
      }
      const r = await createMaterial({ title: title.trim(), description: description.trim(), category, fileUrl, fileName })
      if (r) onCreate(); else setError('Erro ao criar material.')
    } catch { setError('Erro de conexão.') }
    finally { setLoading(false) }
  }
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">{t('materials.newMaterial')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        {error && <div className="mx-6 mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.title')} *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('materials.materialName')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.description')}</label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder={t('materials.describeMaterial')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.category')}</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300">
              {MATERIAL_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('materials.file')} (PDF, DOC, etc.)</label>
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">{t('common.cancel')}</button>
            <button type="submit" disabled={!formValid || loading}
              className="flex-1 rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? t('materials.creating') : t('materials.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditMaterialModal({ material, onClose, onUpdate }: { material: any; onClose: () => void; onUpdate: () => void }) {
  const { updateMaterial, getUploadPresignedUrl } = useData()
  const { t } = useI18n()
  const [title, setTitle] = useState(material.title || '')
  const [description, setDescription] = useState(material.description || '')
  const [category, setCategory] = useState(material.category || 'mensagem')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const formValid = title.trim().length >= 3

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!formValid) return
    setLoading(true); setError('')
    try {
      const updates: Record<string, any> = { title: title.trim(), description: description.trim(), category }
      if (file) {
        const presign = await getUploadPresignedUrl(file.name, file.type)
        await fetch(presign.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
        updates.fileUrl = presign.fileUrl
        updates.fileName = file.name
      }
      const ok = await updateMaterial(material.id, updates)
      if (ok) onUpdate(); else setError('Erro ao atualizar material.')
    } catch { setError('Erro de conexão.') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">{t('materials.edit')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        {error && <div className="mx-6 mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.title')} *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.description')}</label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.category')}</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300">
              {MATERIAL_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('materials.replaceFile')}</label>
            {material.fileName && <p className="text-xs text-gray-500 mb-1">{t('materials.current')}: {material.fileName}</p>}
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">{t('common.cancel')}</button>
            <button type="submit" disabled={!formValid || loading}
              className="flex-1 rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? t('catalog.saving') : t('catalog.saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function MaterialsPage() {
  const { getMaterials, deleteMaterial, syncDropbox } = useData()
  const { user } = useAuth()
  const { t } = useI18n()
  const isAdmin = user?.role === 'admin'
  const [materials, setMaterials] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [filterCat, setFilterCat] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')

  const load = () => getMaterials().then(setMaterials)
  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm(t('materials.confirmDelete'))) return
    await deleteMaterial(id)
    load()
  }

  const handleSync = async () => {
    setSyncing(true)
    setSyncMsg('')
    try {
      const result = await syncDropbox()
      setSyncMsg(result.message)
      load()
    } catch (e: any) {
      setSyncMsg(e.message || 'Erro ao sincronizar')
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncMsg(''), 6000)
    }
  }

  const filtered = filterCat ? materials.filter(m => m.category === filterCat) : materials
  const catLabel = (v: string) => MATERIAL_CATEGORIES.find(c => c.value === v)?.label || v

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('materials.title')}</h1>
        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={handleSync} disabled={syncing}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2 disabled:opacity-50">
              <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} /> {syncing ? t('materials.syncing') : t('materials.syncDropbox')}
            </button>
            <button onClick={() => setShowCreate(true)}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition flex items-center gap-2">
              <span>+</span> {t('materials.newMaterial')}
            </button>
          </div>
        )}
      </div>

      {syncMsg && <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">{syncMsg}</div>}

      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setFilterCat('')} className={`px-3 py-1.5 rounded-full text-sm ${!filterCat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{t('materials.all')}</button>
        {MATERIAL_CATEGORIES.map(c => (
          <button key={c.value} onClick={() => setFilterCat(c.value)} className={`px-3 py-1.5 rounded-full text-sm ${filterCat === c.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{c.label}</button>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-center text-gray-500 py-12">{t('materials.noMaterials')}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(m => (
          <div key={m.id} className="relative group bg-white border rounded-xl p-4 hover:shadow-md transition">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{m.category === 'mensagem' ? '📝' : m.category === 'louvor' ? '🎵' : m.category === 'estudo' ? '📖' : m.category === 'liturgia' ? '⛪' : m.category === 'devocional' ? '🙏' : '📄'}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-900 truncate">{m.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{m.description}</p>
                <span className="text-xs text-gray-400 mt-1 inline-block">{catLabel(m.category)}</span>
              </div>
            </div>
            {m.fileUrl && (
              <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                📎 {m.fileName || t('materials.download')}
              </a>
            )}
            {isAdmin && (
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => setEditing(m)} className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-blue-700 shadow" title={t('materials.edit')}>✏️</button>
                <button onClick={() => handleDelete(m.id)} className="bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-red-700 shadow" title={t('materials.delete')}>✕</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showCreate && <CreateMaterialModal onClose={() => setShowCreate(false)} onCreate={() => { setShowCreate(false); load() }} />}
      {editing && <EditMaterialModal material={editing} onClose={() => setEditing(null)} onUpdate={() => { setEditing(null); load() }} />}
    </div>
  )
}
