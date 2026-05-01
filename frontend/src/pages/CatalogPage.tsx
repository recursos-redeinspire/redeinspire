import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import ContentCard from '../components/ContentCard'

const CATEGORIES = [
  { slug: 'mensagens', name: 'Mensagens', description: 'Mensagens e pregações para uso em cultos' },
  { slug: 'serie-de-mensagens', name: 'Série de Mensagens', description: 'Séries temáticas de mensagens' },
  { slug: 'campanhas', name: 'Campanhas', description: 'Materiais para campanhas da igreja' },
  { slug: 'pequenos-grupos', name: 'Pequenos Grupos', description: 'Conteúdos para células e pequenos grupos' },
  { slug: 'criancas', name: 'Crianças', description: 'Ministério infantil' },
  { slug: 'jovens', name: 'Jovens', description: 'Ministério de jovens' },
  { slug: 'adolescentes', name: 'Adolescentes', description: 'Ministério de adolescentes' },
  { slug: 'homens', name: 'Homens', description: 'Materiais para o ministério de homens' },
  { slug: 'mulheres', name: 'Mulheres', description: 'Materiais para o ministério de mulheres' },
  { slug: 'casais', name: 'Casais', description: 'Conteúdos para o ministério de casais' },
  { slug: '5-propositos', name: '5 Propósitos', description: 'Materiais baseados nos 5 propósitos' },
  { slug: 'empresarios', name: 'Empresários', description: 'Conteúdos para líderes empresariais' },
  { slug: '30-semanas', name: '30 Semanas', description: 'Programa de 30 semanas' },
  { slug: 'velos', name: 'Velos', description: 'Programa Velos de capacitação' },
  { slug: 'gestao-ministerial', name: 'Gestão Ministerial', description: 'Ferramentas para gestão de ministérios' },
  { slug: 'mentorias', name: 'Mentorias', description: 'Sessões de mentoria pastoral' },
  { slug: 'webinar', name: 'Webinar', description: 'Webinars ao vivo e gravados' },
  { slug: 'trilhas', name: 'Trilhas', description: 'Trilhas de aprendizado estruturadas' },
  { slug: 'eventos', name: 'Eventos', description: 'Materiais sobre eventos da rede' },
  { slug: 'casa-de-paz', name: 'Casa de Paz', description: 'Recursos para Casa de Paz' },
  { slug: 'materiais-para-lideranca', name: 'Materiais para Liderança', description: 'Recursos para desenvolvimento de líderes' },
  { slug: 'retiros', name: 'Retiros', description: 'Materiais para retiros espirituais' },
  { slug: 'pesquisas', name: 'Pesquisas', description: 'Pesquisas e estudos para liderança' },
]

export default function CatalogPage() {
  const { getContents, createContent, updateContent, deleteContent, deleteContentByCategory } = useData()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useI18n()
  const isAdmin = user?.role === 'admin'

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filterType, setFilterType] = useState('')
  const [sortBy, setSortBy] = useState('popularity')
  const [contents, setContents] = useState<any[]>([])
  const [allContents, setAllContents] = useState<any[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingContent, setEditingContent] = useState<any | null>(null)
  const [deletingCategory, setDeletingCategory] = useState(false)

  const loadAll = () => getContents().then(setAllContents)
  const loadFiltered = () => getContents(selectedCategory ?? undefined, filterType || undefined, sortBy).then(setContents)

  useEffect(() => { loadAll() }, [])
  useEffect(() => { loadFiltered() }, [selectedCategory, filterType, sortBy])

  const categoryCounts: Record<string, number> = {}
  allContents.forEach(c => { categoryCounts[c.categorySlug] = (categoryCounts[c.categorySlug] || 0) + 1 })

  const handleContentCreated = () => {
    setShowCreateModal(false)
    loadAll()
    loadFiltered()
  }

  const handleContentUpdated = () => {
    setEditingContent(null)
    loadAll()
    loadFiltered()
  }

  const handleDeleteContent = async (id: string) => {
    if (!confirm(t('catalog.confirmDelete'))) return
    await deleteContent(id)
    loadAll()
    loadFiltered()
  }

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return
    const catName = CATEGORIES.find(c => c.slug === selectedCategory)?.name || selectedCategory
    if (!confirm(`${t('catalog.confirmDeleteCategory')} "${catName}"?`)) return
    setDeletingCategory(true)
    await deleteContentByCategory(selectedCategory)
    setDeletingCategory(false)
    loadAll()
    loadFiltered()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('catalog.title')}</h1>
        {isAdmin && (
          <button onClick={() => setShowCreateModal(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition flex items-center gap-2">
            <span>+</span> {t('catalog.newContent')}
          </button>
        )}
      </div>

      {!selectedCategory && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
          {CATEGORIES.map(cat => (
            <button key={cat.slug} onClick={() => setSelectedCategory(cat.slug)} className="rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition text-left">
              <h3 className="text-sm font-semibold text-gray-800">{cat.name}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
              <span className="text-xs text-gray-900 mt-2 inline-block">{categoryCounts[cat.slug] || 0} {t('catalog.items')}</span>
            </button>
          ))}
        </div>
      )}

      {selectedCategory && (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button onClick={() => setSelectedCategory(null)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">{t('catalog.allCategories')}</button>
            <h2 className="text-lg font-semibold text-gray-800 flex-1">{CATEGORIES.find(c => c.slug === selectedCategory)?.name}</h2>
            {isAdmin && contents.length > 0 && (
              <button onClick={handleDeleteCategory} disabled={deletingCategory}
                className="rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-1">
                🗑 {deletingCategory ? t('catalog.deleting') : t('catalog.deleteCategory')}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3 mb-6">
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">{t('catalog.allTypes')}</option><option value="video">{t('common.video')}</option><option value="audio">{t('common.audio')}</option><option value="document">{t('common.document')}</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="popularity">{t('catalog.mostPopular')}</option><option value="date">{t('catalog.mostRecent')}</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {contents.map(content => (
              <div key={content.id} className="relative group">
                <ContentCard content={content as any} onClick={() => navigate(`/conteudo/${content.id}`)} />
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={(e) => { e.stopPropagation(); setEditingContent(content) }}
                      className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-blue-700 shadow"
                      title={t('catalog.editContent')}>
                      ✏️
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteContent(content.id) }}
                      className="bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-red-700 shadow"
                      title={t('catalog.deleteCategory')}>
                      ✕
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {contents.length === 0 && <p className="text-center text-gray-500 py-12">{t('catalog.noCategoryContent')}</p>}
        </>
      )}

      {showCreateModal && (
        <CreateContentModal
          categories={CATEGORIES}
          preselectedCategory={selectedCategory}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleContentCreated}
          createContent={createContent}
        />
      )}

      {editingContent && (
        <EditContentModal
          categories={CATEGORIES}
          content={editingContent}
          onClose={() => setEditingContent(null)}
          onUpdate={handleContentUpdated}
          updateContent={updateContent}
        />
      )}
    </div>
  )
}

function CreateContentModal({ categories, preselectedCategory, onClose, onCreate, createContent }: {
  categories: { slug: string; name: string }[]
  preselectedCategory: string | null
  onClose: () => void
  onCreate: () => void
  createContent: (data: any) => Promise<any>
}) {
  const { t } = useI18n()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categorySlug, setCategorySlug] = useState(preselectedCategory || '')
  const [type, setType] = useState('video')
  const [durationMinutes, setDurationMinutes] = useState(0)
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [contentUrl, setContentUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formValid = title.trim().length >= 3 && categorySlug && type

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!formValid) return
    setLoading(true)
    setError('')
    try {
      const result = await createContent({ title: title.trim(), description: description.trim(), categorySlug, type, durationMinutes, thumbnailUrl: thumbnailUrl.trim(), contentUrl: contentUrl.trim() })
      if (result) { onCreate() } else { setError(t('catalog.errorCreate')) }
    } catch { setError(t('common.connectionError')) }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">{t('catalog.newContent')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {error && <div className="mx-6 mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="ct-title" className="block text-sm font-medium text-gray-700 mb-1">{t('common.title')} *</label>
            <input id="ct-title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('catalog.contentName')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300" />
          </div>

          <div>
            <label htmlFor="ct-desc" className="block text-sm font-medium text-gray-700 mb-1">{t('common.description')}</label>
            <textarea id="ct-desc" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder={t('catalog.describeContent')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ct-cat" className="block text-sm font-medium text-gray-700 mb-1">{t('common.category')} *</label>
              <select id="ct-cat" value={categorySlug} onChange={e => setCategorySlug(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300">
                <option value="">{t('catalog.select')}</option>
                {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="ct-type" className="block text-sm font-medium text-gray-700 mb-1">{t('common.type')} *</label>
              <select id="ct-type" value={type} onChange={e => setType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300">
                <option value="video">{t('common.video')}</option>
                <option value="audio">{t('common.audio')}</option>
                <option value="document">{t('common.document')}</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="ct-dur" className="block text-sm font-medium text-gray-700 mb-1">{t('common.duration')}</label>
            <input id="ct-dur" type="number" min={0} value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300" />
          </div>

          <div>
            <label htmlFor="ct-url" className="block text-sm font-medium text-gray-700 mb-1">{t('catalog.contentUrl')}</label>
            <input id="ct-url" type="url" value={contentUrl} onChange={e => setContentUrl(e.target.value)} placeholder="https://..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300" />
          </div>

          <div>
            <label htmlFor="ct-thumb" className="block text-sm font-medium text-gray-700 mb-1">{t('catalog.thumbnailUrl')}</label>
            <input id="ct-thumb" type="url" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} placeholder="https://..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={!formValid || loading}
              className="flex-1 rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? t('catalog.creating') : t('catalog.createContent')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


function EditContentModal({ categories, content, onClose, onUpdate, updateContent }: {
  categories: { slug: string; name: string }[]
  content: any
  onClose: () => void
  onUpdate: () => void
  updateContent: (id: string, data: Record<string, any>) => Promise<boolean>
}) {
  const { t } = useI18n()
  const [title, setTitle] = useState(content.title || '')
  const [description, setDescription] = useState(content.description || '')
  const [categorySlug, setCategorySlug] = useState(content.categorySlug || '')
  const [type, setType] = useState(content.type || 'video')
  const [durationMinutes, setDurationMinutes] = useState(content.durationMinutes || 0)
  const [thumbnailUrl, setThumbnailUrl] = useState(content.thumbnailUrl || '')
  const [contentUrl, setContentUrl] = useState(content.contentUrl || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formValid = title.trim().length >= 3 && categorySlug && type

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!formValid) return
    setLoading(true)
    setError('')
    try {
      const ok = await updateContent(content.id, {
        title: title.trim(), description: description.trim(), categorySlug, type,
        durationMinutes, thumbnailUrl: thumbnailUrl.trim(), contentUrl: contentUrl.trim()
      })
      if (ok) { onUpdate() } else { setError(t('catalog.errorUpdate')) }
    } catch { setError(t('common.connectionError')) }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">{t('catalog.editContent')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {error && <div className="mx-6 mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="ed-title" className="block text-sm font-medium text-gray-700 mb-1">{t('common.title')} *</label>
            <input id="ed-title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('catalog.contentName')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300" />
          </div>

          <div>
            <label htmlFor="ed-desc" className="block text-sm font-medium text-gray-700 mb-1">{t('common.description')}</label>
            <textarea id="ed-desc" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder={t('catalog.describeContent')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ed-cat" className="block text-sm font-medium text-gray-700 mb-1">{t('common.category')} *</label>
              <select id="ed-cat" value={categorySlug} onChange={e => setCategorySlug(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300">
                <option value="">{t('catalog.select')}</option>
                {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="ed-type" className="block text-sm font-medium text-gray-700 mb-1">{t('common.type')} *</label>
              <select id="ed-type" value={type} onChange={e => setType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300">
                <option value="video">{t('common.video')}</option>
                <option value="audio">{t('common.audio')}</option>
                <option value="document">{t('common.document')}</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="ed-dur" className="block text-sm font-medium text-gray-700 mb-1">{t('common.duration')}</label>
            <input id="ed-dur" type="number" min={0} value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300" />
          </div>

          <div>
            <label htmlFor="ed-url" className="block text-sm font-medium text-gray-700 mb-1">{t('catalog.contentUrl')}</label>
            <input id="ed-url" type="url" value={contentUrl} onChange={e => setContentUrl(e.target.value)} placeholder="https://..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300" />
          </div>

          <div>
            <label htmlFor="ed-thumb" className="block text-sm font-medium text-gray-700 mb-1">{t('catalog.thumbnailUrl')}</label>
            <input id="ed-thumb" type="url" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} placeholder="https://..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-300" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {t('common.cancel')}
            </button>
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
