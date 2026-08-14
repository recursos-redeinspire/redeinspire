import { useState } from 'react'
import { Music, BookOpen, Calendar, FileText, Upload, Sparkles } from 'lucide-react'

/**
 * Preview A — Estilo Wizard/Steps com cards flutuantes
 * Formulário dividido em seções visuais com ícones grandes
 */
export default function PreviewPlanA() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ title: '', date: '', worship: '', message: '', notes: '' })

  const steps = [
    { icon: <BookOpen size={20} />, label: 'Informações', color: 'text-blue-600 bg-blue-50' },
    { icon: <Music size={20} />, label: 'Louvor', color: 'text-purple-600 bg-purple-50' },
    { icon: <FileText size={20} />, label: 'Mensagem', color: 'text-amber-600 bg-amber-50' },
    { icon: <Sparkles size={20} />, label: 'Finalizar', color: 'text-green-600 bg-green-50' },
  ]

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Monte sua Celebração</h1>
      <p className="text-sm text-gray-500 mb-8">Preencha as etapas para organizar seu culto</p>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <button key={i} onClick={() => setStep(i)} className="flex-1">
            <div className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${step === i ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${step === i ? 'bg-green-100 text-green-600' : s.color}`}>
                {s.icon}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${step === i ? 'text-green-700' : 'text-gray-500'}`}>{s.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Form content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        {step === 0 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><BookOpen size={20} className="text-blue-600" /></div>
              <div><h2 className="font-semibold text-gray-900">Informações da Celebração</h2><p className="text-xs text-gray-400">Defina o título e a data</p></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Título da Celebração</label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Culto de Domingo - Série Propósitos"
                className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-green-200 focus:bg-white outline-none transition placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Data</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-gray-50 border-0 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-green-200 focus:bg-white outline-none transition" />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><Music size={20} className="text-purple-600" /></div>
              <div><h2 className="font-semibold text-gray-900">Louvor / Worship</h2><p className="text-xs text-gray-400">Liste as músicas da celebração</p></div>
            </div>
            <textarea value={form.worship} onChange={e => setForm({ ...form, worship: e.target.value })} rows={6}
              placeholder="1. Grande é o Senhor&#10;2. Oceanos&#10;3. Way Maker&#10;4. Raridade"
              className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-green-200 focus:bg-white outline-none transition placeholder-gray-400 resize-none" />
            <div className="flex flex-wrap gap-2">
              {['Oceanos', 'Way Maker', 'Raridade', 'Grande é o Senhor', 'Lugar Secreto'].map(m => (
                <button key={m} onClick={() => setForm({ ...form, worship: form.worship + (form.worship ? '\n' : '') + m })}
                  className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-[11px] font-medium hover:bg-purple-100 transition">+ {m}</button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><FileText size={20} className="text-amber-600" /></div>
              <div><h2 className="font-semibold text-gray-900">Mensagem / Pregação</h2><p className="text-xs text-gray-400">Tema, passagem e materiais</p></div>
            </div>
            <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4}
              placeholder="Tema: O Poder da Fé&#10;Texto: Hebreus 11:1-6&#10;Pontos principais..."
              className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-green-200 focus:bg-white outline-none transition placeholder-gray-400 resize-none" />
            <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200">
              <div className="flex items-center gap-2 text-gray-500">
                <Upload size={16} />
                <span className="text-sm">Arraste um arquivo ou clique para vincular material</span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><Sparkles size={20} className="text-green-600" /></div>
              <div><h2 className="font-semibold text-gray-900">Observações Finais</h2><p className="text-xs text-gray-400">Notas e lembretes</p></div>
            </div>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={4}
              placeholder="Lembretes, avisos para a equipe..."
              className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-green-200 focus:bg-white outline-none transition placeholder-gray-400 resize-none" />
            {/* Summary */}
            <div className="bg-green-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-green-700 uppercase">Resumo</p>
              {form.title && <p className="text-sm text-gray-700">📋 {form.title}</p>}
              {form.date && <p className="text-sm text-gray-700">📅 {new Date(form.date + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</p>}
              {form.worship && <p className="text-sm text-gray-700">🎵 {form.worship.split('\n').length} músicas</p>}
              {form.message && <p className="text-sm text-gray-700">📖 Mensagem definida</p>}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
            className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 transition">← Anterior</button>
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)}
              className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition">
              Próximo →
            </button>
          ) : (
            <button className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition">
              ✓ Salvar Celebração
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
