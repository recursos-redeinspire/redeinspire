import { useState, useEffect, useCallback } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import {
  Folder, ChevronRight, Home, Loader2, X, ArrowLeft
} from 'lucide-react'

/**
 * Preview: Pastas de materiais com visual estilo Life.Church
 * Thumb + título + categoria + tags + descritivo
 */
export default function PreviewMateriaisCards() {
  const { browseDropbox, getFolderThumbnails, saveFolderThumbnail, getUploadPresignedUrl, getFolderVideos, getAllFolderTags, saveFolderTags } = useData()
  const { user } = useAuth()

  const [path, setPath] = useState('')
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [folderThumbs, setFolderThumbs] = useState<Record<string, string>>({})
  const [folderTagMap, setFolderTagMap] = useState<Record<string, string[]>>({})
  const [autoThumbs, setAutoThumbs] = useState<Record<string, string>>({})

  // Admin edit state
  const [editingFolder, setEditingFolder] = useState<any | null>(null)
  const [editDesc, setEditDesc] = useState('')
  const [editTags, setEditTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [uploading, setUploading] = useState(false)

  const isAdmin = user?.role === 'admin'

  const loadFolder = useCallback(async (p: string) => {
    setLoading(true)
    try {
      const result = await browseDropbox(p)
      setEntries(result.entries); setPath(p)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [browseDropbox])

  useEffect(() => { loadFolder('') }, [loadFolder])
  useEffect(() => {
    getFolderThumbnails().then(d => setFolderThumbs(d.thumbnails || {})).catch(() => {})
    getAllFolderTags().then(d => setFolderTagMap(d.tagMap || {})).catch(() => {})
  }, [])

  // Auto-fetch thumbs from linked videos for folders without custom thumb
  const folders = entries.filter(e => e.tag === 'folder')

  useEffect(() => {
    if (folders.length === 0) return
    const fetchAutoThumbs = async () => {
      const newThumbs: Record<string, string> = {}
      for (const folder of folders) {
        if (folderThumbs[folder.path]) continue
        try {
          const vids = await getFolderVideos(folder.path).catch(() => ({ videos: [] }))
          if (vids.videos && vids.videos.length > 0) {
            newThumbs[folder.path] = vids.videos[0].thumbnail || `https://img.youtube.com/vi/${vids.videos[0].id}/mqdefault.jpg`
          }
        } catch { /* ignore */ }
      }
      if (Object.keys(newThumbs).length > 0) setAutoThumbs(newThumbs)
    }
    fetchAutoThumbs()
  }, [folders.length, folderThumbs])

  const breadcrumbs = path ? path.split('/').filter(Boolean).map((part, i, arr) => ({
    name: part, path: '/' + arr.slice(0, i + 1).join('/'),
  })) : []

  const isRoot = !path
  const getThumb = (folderPath: string) => folderThumbs[folderPath] || autoThumbs[folderPath] || ''
  const getTags = (folderPath: string) => folderTagMap[folderPath] || []

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Materiais</h1>
          <p className="text-sm text-gray-500 mt-1">Recursos para seu ministério</p>
        </div>
      </div>

      {/* Breadcrumb */}
      {!isRoot && (
        <div className="flex items-center gap-1.5 mb-5 text-sm flex-wrap">
          <button onClick={() => { const parts = path.split('/'); parts.pop(); loadFolder(parts.join('/')) }}
            className="text-gray-400 hover:text-gray-700 mr-1 p-1 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={16} /></button>
          <button onClick={() => loadFolder('')} className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition">
            <Home size={14} /> Materiais
          </button>
          {breadcrumbs.map((bc, i) => (
            <span key={bc.path} className="flex items-center gap-1.5">
              <ChevronRight size={13} className="text-gray-300" />
              <button onClick={() => loadFolder(bc.path)}
                className={`hover:text-gray-900 transition ${i === breadcrumbs.length - 1 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>{bc.name}</button>
            </span>
          ))}
        </div>
      )}

      {loading && <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-green-500" /></div>}

      {/* ═══ FOLDER CARDS — Life.Church style ═══ */}
      {!loading && folders.length > 0 && (
        <div>
          {isRoot && <h2 className="text-[15px] font-bold text-gray-900 mb-4">Conteúdos disponíveis</h2>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {folders.map(folder => {
              const thumb = getThumb(folder.path)
              const tags = getTags(folder.path)
              // Get parent folder as "category"
              const parentName = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : 'Materiais'
              return (
                <div key={folder.id} className="group">
                  <button onClick={() => loadFolder(folder.path)} className="w-full text-left">
                    {/* Thumbnail */}
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 mb-3">
                      {thumb ? (
                        <img src={thumb} alt={folder.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                          <Folder size={40} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    {/* Title */}
                    <h3 className="font-semibold text-[14px] text-gray-900 leading-snug line-clamp-2 group-hover:text-green-700 transition">{folder.name}</h3>
                    {/* Category */}
                    <p className="text-[11px] text-gray-500 mt-1">{parentName}</p>
                    {/* Tags */}
                    {tags.length > 0 && (
                      <p className="text-[11px] text-gray-400 mt-0.5">{tags.join(' · ')}</p>
                    )}
                  </button>
                  {/* Admin edit button */}
                  {isAdmin && (
                    <button onClick={(e) => { e.stopPropagation(); setEditingFolder(folder); setEditTags(getTags(folder.path)); setEditDesc('') }}
                      className="mt-1.5 text-[10px] text-gray-400 hover:text-green-600 transition opacity-0 group-hover:opacity-100">
                      ✏️ Editar card
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!loading && folders.length === 0 && entries.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Folder size={48} className="mx-auto mb-3 text-gray-300" />
          <p>Pasta vazia</p>
        </div>
      )}

      {/* ═══ ADMIN EDIT MODAL ═══ */}
      {editingFolder && isAdmin && (
        <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4" onClick={() => setEditingFolder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b">
              <h2 className="font-bold text-gray-900">Editar card da pasta</h2>
              <p className="text-xs text-gray-400 mt-1">{editingFolder.name}</p>
            </div>
            <div className="p-5 space-y-4">
              {/* Thumb upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Thumbnail</label>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border shrink-0">
                    {getThumb(editingFolder.path) ? (
                      <img src={getThumb(editingFolder.path)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Folder size={24} className="text-gray-300" /></div>
                    )}
                  </div>
                  <div>
                    <label className="inline-flex items-center gap-1.5 text-xs text-green-600 hover:text-green-800 cursor-pointer font-medium">
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setUploading(true)
                        try {
                          const { uploadUrl, fileUrl } = await getUploadPresignedUrl(file.name, file.type)
                          await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
                          await saveFolderThumbnail(editingFolder.path, fileUrl)
                          setFolderThumbs(prev => ({ ...prev, [editingFolder.path]: fileUrl }))
                        } catch { /* ignore */ }
                        finally { setUploading(false) }
                      }} />
                      {uploading ? 'Enviando...' : getThumb(editingFolder.path) ? '📷 Trocar imagem' : '📷 Subir imagem'}
                    </label>
                    {getThumb(editingFolder.path) && (
                      <button onClick={async () => {
                        await saveFolderThumbnail(editingFolder.path, '')
                        setFolderThumbs(prev => { const n = { ...prev }; delete n[editingFolder.path]; return n })
                      }} className="block text-[10px] text-red-500 hover:text-red-700 mt-1">Remover thumb</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {editTags.map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-700 text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1">
                      {tag}
                      <button onClick={() => setEditTags(prev => prev.filter(t => t !== tag))} className="text-gray-400 hover:text-red-500"><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && tagInput.trim()) { setEditTags(prev => [...prev, tagInput.trim().toLowerCase()]); setTagInput('') } }}
                    placeholder="Adicionar tag..."
                    className="flex-1 border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-green-300" />
                  <button onClick={() => { if (tagInput.trim()) { setEditTags(prev => [...prev, tagInput.trim().toLowerCase()]); setTagInput('') } }}
                    className="text-xs text-green-600 font-medium px-2">+ Add</button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descritivo breve</label>
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={2}
                  placeholder="Breve descrição do conteúdo desta pasta..."
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-200" />
              </div>
            </div>
            <div className="p-5 border-t flex gap-3">
              <button onClick={() => setEditingFolder(null)} className="flex-1 border rounded-lg py-2.5 text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={async () => {
                await saveFolderTags(editingFolder.path, editTags)
                setFolderTagMap(prev => ({ ...prev, [editingFolder.path]: editTags }))
                setEditingFolder(null)
              }}
                className="flex-1 bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
