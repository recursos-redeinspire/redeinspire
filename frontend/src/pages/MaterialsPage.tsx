import { useState, useEffect, type FormEvent } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import { RefreshCw, FileText, Video, Headphones, Image, FileSpreadsheet, Presentation, File, Download, Eye, Pencil, X, Loader2 } from 'lucide-react'

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
  const { getMaterials, deleteMaterial, syncDropbox, getDropboxLink } = useData()
  const { user } = useAuth()
  const { t } = useI18n()
  const isAdmin = user?.role === 'admin'
  const [materials, setMaterials] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [filterCat, setFilterCat] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')
  const [previewMaterial, setPreviewMaterial] = useState<any | null>(null)
  const [previewLink, setPreviewLink] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)

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

  const handlePreview = async (m: any) => {
    setPreviewMaterial(m)
    setPreviewLink('')
    setPreviewLoading(true)
    try {
      if (m.dropboxPath) {
        const result = await getDropboxLink(m.dropboxPath)
        setPreviewLink(result.link)
      } else if (m.fileUrl) {
        setPreviewLink(m.fileUrl)
      }
    } catch {
      setPreviewLink('')
    } finally {
      setPreviewLoading(false)
    }
  }

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'video': return <Video size={24} className="text-purple-500" />
      case 'audio': return <Headphones size={24} className="text-blue-500" />
      case 'pdf': return <FileText size={24} className="text-red-500" />
      case 'imagem': return <Image size={24} className="text-green-500" />
      case 'planilha': return <FileSpreadsheet size={24} className="text-emerald-600" />
      case 'apresentacao': return <Presentation size={24} className="text-orange-500" />
      default: return <File size={24} className="text-gray-500" />
    }
  }

  const formatSize = (bytes: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
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
          <div key={m.id} className="relative group bg-white border rounded-xl p-4 hover:shadow-md transition cursor-pointer" onClick={() => handlePreview(m)}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center">
                {getCategoryIcon(m.category)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-900 truncate">{m.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{m.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{catLabel(m.category)}</span>
                  {m.fileSize > 0 && <span className="text-xs text-gray-400">{formatSize(m.fileSize)}</span>}
                </div>
              </div>
              <Eye size={16} className="text-gray-300 group-hover:text-gray-600 transition flex-shrink-0 mt-1" />
            </div>
            {isAdmin && (
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition" onClick={e => e.stopPropagation()}>
                <button onClick={() => setEditing(m)} className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-blue-700 shadow"><Pencil size={13} /></button>
                <button onClick={() => handleDelete(m.id)} className="bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-red-700 shadow"><X size={13} /></button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setPreviewMaterial(null)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3 min-w-0">
                {getCategoryIcon(previewMaterial.category)}
                <div className="min-w-0">
                  <h2 className="font-bold text-gray-900 truncate">{previewMaterial.title}</h2>
                  <p className="text-xs text-gray-500">{previewMaterial.description} {previewMaterial.fileSize > 0 && `· ${formatSize(previewMaterial.fileSize)}`}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {previewLink && (
                  <a href={previewLink} download target="_blank" rel="noopener noreferrer"
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition flex items-center gap-2">
                    <Download size={16} /> {t('materials.download')}
                  </a>
                )}
                <button onClick={() => setPreviewMaterial(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-50 flex items-center justify-center min-h-[300px]">
              {previewLoading ? (
                <div className="flex flex-col items-center gap-3 text-gray-400">
                  <Loader2 size={32} className="animate-spin" />
                  <p className="text-sm">{t('materials.loadingPreview')}</p>
                </div>
              ) : !previewLink ? (
                <div className="flex flex-col items-center gap-3 text-gray-400">
                  {getCategoryIcon(previewMaterial.category)}
                  <p className="text-sm">{t('materials.noPreview')}</p>
                </div>
              ) : previewMaterial.category === 'imagem' ? (
                <img src={previewLink} alt={previewMaterial.title} className="max-w-full max-h-[60vh] object-contain rounded-lg shadow" />
              ) : previewMaterial.category === 'video' ? (
                <video src={previewLink} controls className="max-w-full max-h-[60vh] rounded-lg shadow" />
              ) : previewMaterial.category === 'audio' ? (
                <div className="flex flex-col items-center gap-4 w-full max-w-md">
                  <Headphones size={64} className="text-blue-400" />
                  <p className="font-medium text-gray-700">{previewMaterial.title}</p>
                  <audio src={previewLink} controls className="w-full" />
                </div>
              ) : previewMaterial.category === 'pdf' ? (
                <iframe src={previewLink} className="w-full h-[60vh] rounded-lg border" title={previewMaterial.title} />
              ) : (
                <div className="flex flex-col items-center gap-4 text-gray-500">
                  {getCategoryIcon(previewMaterial.category)}
                  <p className="font-medium">{previewMaterial.fileName}</p>
                  <p className="text-sm">{t('materials.clickDownload')}</p>
                  <a href={previewLink} download target="_blank" rel="noopener noreferrer"
                    className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition flex items-center gap-2">
                    <Download size={16} /> {t('materials.download')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCreate && <CreateMaterialModal onClose={() => setShowCreate(false)} onCreate={() => { setShowCreate(false); load() }} />}
      {editing && <EditMaterialModal material={editing} onClose={() => setEditing(null)} onUpdate={() => { setEditing(null); load() }} />}
    </div>
  )
}
