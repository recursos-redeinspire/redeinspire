import { useState } from 'react'
import { Music, BookOpen, Calendar, FileText, Upload, Sparkles } from 'lucide-react'

/**
 * Preview B — Estilo Notion/Linear: formulário limpo com sidebar de contexto
 * Layout split: form à esquerda, resumo visual à direita
 */
export default function PreviewPlanB() {
  const [form, setForm] = useState({ title: '', date: '', worship: '', message: '', notes: '' })

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Monte sua Celebração</h1>
      <p className="text-sm text-gray-500 mb-8">Organize todos os detalhes do seu culto num só lugar</p>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Form */}
        <div className="flex-1 space-y-6">
          {/* Title + Date row */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Título</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Culto de Celebração"
                  className="w-full bg-transparent border-b-2 border-gray-100 focus:border-green-500 px-0 py-2 text-lg font-semibold text-gray-900 outline-none transition placeholder-gray-300" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Data</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-sm border-0 focus:ring-2 focus:ring-green-200 outline-none" />
              </div>
            </div>
          </div>

          {/* Worship */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center"><Music size={14} className="text-purple-600" /></div>
              <h3 className="font-semibold text-sm text-gray-900">Louvor / Worship</h3>
            </div>
            <textarea value={form.worship} onChange={e => setForm({ ...form, worship: e.target.value })} rows={4}
              placeholder="Liste as músicas do momento de louvor..."
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border-0 focus:ring-2 focus:ring-purple-100 outline-none transition placeholder-gray-400 resize-none" />
            <div className="flex gap-2 mt-3 flex-wrap">
              {['Oceanos', 'Way Maker', 'Raridade', 'Lugar Secreto'].map(m => (
                <button key={m} onClick={() => setForm({ ...form, worship: form.worship + (form.worship ? '\n' : '') + m })}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-600 text-[10px] font-medium hover:bg-purple-100 transition border border-purple-100">+ {m}</button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center"><BookOpen size={14} className="text-amber-600" /></div>
              <h3 className="font-semibold text-sm text-gray-900">Mensagem / Pregação</h3>
            </div>
            <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4}
              placeholder="Tema, passagem bíblica, pontos principais..."
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border-0 focus:ring-2 focus:ring-amber-100 outline-none transition placeholder-gray-400 resize-none" />

            {/* Material link */}
            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-dashed border-gray-200 hover:border-green-300 hover:bg-green-50/50 cursor-pointer transition">
              <FileText size={18} className="text-gray-400" />
              <span className="text-sm text-gray-500">Vincular material (PDF, DOC)...</span>
            </div>
          </div>

          {/* Upload + Notes */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center"><Sparkles size={14} className="text-green-600" /></div>
              <h3 className="font-semibold text-sm text-gray-900">Extras</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center hover:border-green-300 cursor-pointer transition">
                <Upload size={20} className="mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">Upload de arquivo</p>
              </div>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
                placeholder="Observações..."
                className="bg-gray-50 rounded-xl px-4 py-3 text-sm border-0 focus:ring-2 focus:ring-green-100 outline-none placeholder-gray-400 resize-none" />
            </div>
          </div>

          {/* Save */}
          <div className="flex gap-3">
            <button className="flex-1 bg-green-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-green-700 transition shadow-sm shadow-green-200">
              Salvar Celebração
            </button>
            <button className="px-5 py-3 rounded-xl text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition">
              Cancelar
            </button>
          </div>
        </div>

        {/* Right: Live preview card */}
        <div className="lg:w-72 shrink-0">
          <div className="sticky top-24 space-y-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-5">
              <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wider mb-3">Preview</p>
              <div className="space-y-3">
                <div>
                  <p className="text-lg font-bold text-gray-900 leading-snug">{form.title || 'Título da Celebração'}</p>
                  {form.date && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Calendar size={11} /> {new Date(form.date + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</p>}
                </div>
                {form.worship && (
                  <div className="pt-2 border-t border-green-200/50">
                    <p className="text-[10px] font-semibold text-purple-600 uppercase mb-1">Louvor</p>
                    <p className="text-xs text-gray-600 whitespace-pre-line line-clamp-4">{form.worship}</p>
                  </div>
                )}
                {form.message && (
                  <div className="pt-2 border-t border-green-200/50">
                    <p className="text-[10px] font-semibold text-amber-600 uppercase mb-1">Mensagem</p>
                    <p className="text-xs text-gray-600 whitespace-pre-line line-clamp-3">{form.message}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Sugestões rápidas</p>
              <div className="space-y-1.5">
                {['Série: Propósitos de Deus', 'Louvor: Oceanos', 'Dinâmica: Quebra-gelo'].map(s => (
                  <button key={s} className="w-full text-left text-xs text-gray-600 hover:text-green-700 hover:bg-green-50 px-2 py-1.5 rounded-lg transition">+ {s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
