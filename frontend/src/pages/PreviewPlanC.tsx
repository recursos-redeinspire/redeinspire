import { useState } from 'react'
import { Music, BookOpen, Calendar, FileText, Upload, Sparkles, Check } from 'lucide-react'

/**
 * Preview C — Estilo Apple/Minimal: form com seções colapsáveis e visual clean
 * Fundo claro, seções que expandem ao clicar, visual de app premium
 */
export default function PreviewPlanC() {
  const [form, setForm] = useState({ title: '', date: '', worship: '', message: '', notes: '' })
  const [expandedSections, setExpandedSections] = useState<string[]>(['info', 'worship', 'message', 'extras'])
  const toggle = (s: string) => setExpandedSections(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const sections = [
    { id: 'info', icon: <Calendar size={18} />, title: 'Informações', color: 'bg-blue-500', filled: !!(form.title && form.date) },
    { id: 'worship', icon: <Music size={18} />, title: 'Louvor', color: 'bg-purple-500', filled: !!form.worship },
    { id: 'message', icon: <BookOpen size={18} />, title: 'Mensagem', color: 'bg-amber-500', filled: !!form.message },
    { id: 'extras', icon: <Sparkles size={18} />, title: 'Extras', color: 'bg-green-500', filled: !!form.notes },
  ]

  return (
    <div className="max-w-xl mx-auto py-8">
      {/* Header with progress */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Monte sua Celebração</h1>
        <p className="text-sm text-gray-500 mt-1 mb-4">Preencha os campos para organizar seu culto</p>
        {/* Progress bar */}
        <div className="flex gap-1.5">
          {sections.map(s => (
            <div key={s.id} className={`h-1.5 flex-1 rounded-full transition-all ${s.filled ? s.color : 'bg-gray-100'}`} />
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {/* Info */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <button onClick={() => toggle('info')} className="w-full flex items-center gap-3 p-4 text-left">
            <div className={`w-9 h-9 rounded-xl ${form.title && form.date ? 'bg-blue-500' : 'bg-blue-50'} flex items-center justify-center transition-colors`}>
              {form.title && form.date ? <Check size={16} className="text-white" /> : <Calendar size={16} className="text-blue-500" />}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-gray-900">Informações</h3>
              {form.title && <p className="text-xs text-gray-400 truncate mt-0.5">{form.title}</p>}
            </div>
          </button>
          {expandedSections.includes('info') && (
            <div className="px-4 pb-5 pt-1 space-y-4 border-t border-gray-50">
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Nome da celebração"
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border-0 focus:ring-2 focus:ring-blue-100 outline-none placeholder-gray-400" />
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border-0 focus:ring-2 focus:ring-blue-100 outline-none" />
            </div>
          )}
        </div>

        {/* Worship */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <button onClick={() => toggle('worship')} className="w-full flex items-center gap-3 p-4 text-left">
            <div className={`w-9 h-9 rounded-xl ${form.worship ? 'bg-purple-500' : 'bg-purple-50'} flex items-center justify-center transition-colors`}>
              {form.worship ? <Check size={16} className="text-white" /> : <Music size={16} className="text-purple-500" />}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-gray-900">Louvor / Worship</h3>
              {form.worship && <p className="text-xs text-gray-400 mt-0.5">{form.worship.split('\n').length} músicas</p>}
            </div>
          </button>
          {expandedSections.includes('worship') && (
            <div className="px-4 pb-5 pt-1 border-t border-gray-50">
              <textarea value={form.worship} onChange={e => setForm({ ...form, worship: e.target.value })} rows={4}
                placeholder="1. Grande é o Senhor&#10;2. Oceanos&#10;3. Way Maker"
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border-0 focus:ring-2 focus:ring-purple-100 outline-none placeholder-gray-400 resize-none" />
              <div className="flex gap-2 mt-3 flex-wrap">
                {['Oceanos', 'Way Maker', 'Raridade', 'Lugar Secreto', 'Grande é o Senhor'].map(m => (
                  <button key={m} onClick={() => setForm({ ...form, worship: form.worship + (form.worship ? '\n' : '') + m })}
                    className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 text-[10px] font-medium hover:bg-purple-100 transition">+ {m}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Message */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <button onClick={() => toggle('message')} className="w-full flex items-center gap-3 p-4 text-left">
            <div className={`w-9 h-9 rounded-xl ${form.message ? 'bg-amber-500' : 'bg-amber-50'} flex items-center justify-center transition-colors`}>
              {form.message ? <Check size={16} className="text-white" /> : <BookOpen size={16} className="text-amber-500" />}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-gray-900">Mensagem / Pregação</h3>
              {form.message && <p className="text-xs text-gray-400 truncate mt-0.5">{form.message.split('\n')[0]}</p>}
            </div>
          </button>
          {expandedSections.includes('message') && (
            <div className="px-4 pb-5 pt-1 space-y-3 border-t border-gray-50">
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4}
                placeholder="Tema: O Poder da Fé&#10;Texto: Hebreus 11:1-6&#10;Pontos principais..."
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border-0 focus:ring-2 focus:ring-amber-100 outline-none placeholder-gray-400 resize-none" />
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-gray-500 text-xs hover:border-amber-300 hover:bg-amber-50/50 transition">
                  <FileText size={14} /> Vincular material
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-gray-500 text-xs hover:border-amber-300 hover:bg-amber-50/50 transition">
                  <Upload size={14} /> Upload arquivo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Extras */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <button onClick={() => toggle('extras')} className="w-full flex items-center gap-3 p-4 text-left">
            <div className={`w-9 h-9 rounded-xl ${form.notes ? 'bg-green-500' : 'bg-green-50'} flex items-center justify-center transition-colors`}>
              {form.notes ? <Check size={16} className="text-white" /> : <Sparkles size={16} className="text-green-500" />}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-gray-900">Observações & Extras</h3>
              {form.notes && <p className="text-xs text-gray-400 truncate mt-0.5">{form.notes.split('\n')[0]}</p>}
            </div>
          </button>
          {expandedSections.includes('extras') && (
            <div className="px-4 pb-5 pt-1 border-t border-gray-50">
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
                placeholder="Avisos, lembretes para a equipe, detalhes extras..."
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border-0 focus:ring-2 focus:ring-green-100 outline-none placeholder-gray-400 resize-none" />
            </div>
          )}
        </div>
      </div>

      {/* Save */}
      <div className="mt-6 flex gap-3">
        <button className="flex-1 bg-green-600 text-white py-3.5 rounded-2xl text-sm font-semibold hover:bg-green-700 transition shadow-lg shadow-green-600/20">
          Salvar Celebração
        </button>
        <button className="px-6 py-3.5 rounded-2xl text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 transition">
          Cancelar
        </button>
      </div>
    </div>
  )
}
