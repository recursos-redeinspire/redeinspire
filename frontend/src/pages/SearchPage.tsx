import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { useI18n } from '../i18n/I18nContext'

const autocompleteSuggestions = [
  'Mensagens', 'Pequenos Grupos', 'Campanhas', 'Jovens', 'Crianças',
  'Trilhas de Liderança', 'Mentorias', 'Webinar', 'Casa de Paz', 'Retiros',
]

export default function SearchPage() {
  const { searchContents } = useData()
  const navigate = useNavigate()
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [sortBy, setSortBy] = useState('relevance')
  const [typeFilter, setTypeFilter] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    const found = await searchContents(query, typeFilter || undefined, sortBy)
    setResults(found)
    setSearched(true)
    setShowSuggestions(false)
  }, [query, sortBy, typeFilter, searchContents])

  const filteredAutoComplete = autocompleteSuggestions.filter(s => s.toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('search.title')}</h1>
      <div className="relative mb-6">
        <div className="flex gap-2">
          <input type="text" value={query} onChange={e => { setQuery(e.target.value); setShowSuggestions(e.target.value.length >= 2) }}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder={t('search.placeholder')} className="flex-1 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-800 focus:outline-none" />
          <button onClick={handleSearch} className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800">{t('search.button')}</button>
        </div>
        {showSuggestions && filteredAutoComplete.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg">
            {filteredAutoComplete.map(s => (<li key={s} className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => { setQuery(s); setShowSuggestions(false) }}>{s}</li>))}
          </ul>
        )}
      </div>
      <div className="flex gap-4 mb-6">
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border rounded-lg px-3 py-2">
          <option value="relevance">{t('search.relevance')}</option><option value="date">{t('search.date')}</option><option value="popularity">{t('search.popularity')}</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border rounded-lg px-3 py-2">
          <option value="">{t('catalog.allTypes')}</option><option value="video">{t('common.video')}</option><option value="audio">{t('common.audio')}</option><option value="document">{t('common.document')}</option>
        </select>
      </div>
      {searched && results.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg mb-4">{t('search.noResults')} "{query}"</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['Mensagens', 'Pequenos Grupos', 'Trilhas', 'Campanhas', 'Jovens'].map(s => (
              <button key={s} onClick={() => { setQuery(s) }} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm hover:bg-gray-300">{s}</button>
            ))}
          </div>
        </div>
      )}
      {!searched && <div className="text-center py-12 bg-gray-50 rounded-lg"><p className="text-gray-400 text-lg">{t('search.typeToSearch')}</p></div>}
      <div className="space-y-4">
        {results.map(item => (
          <div key={item.id} onClick={() => navigate(`/conteudo/${item.id}`)} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded">{item.type === 'video' ? `🎬 ${t('common.video')}` : item.type === 'audio' ? `🎧 ${t('common.audio')}` : `📄 ${t('common.document')}`}</span>
                  <span>{item.durationMinutes} {t('home.min')}</span><span>{item.views} {t('home.views')}</span>
                </div>
              </div>
              <span className="text-xs text-gray-400">{item.createdAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
