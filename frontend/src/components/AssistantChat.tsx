import { useState, useRef, useEffect } from 'react'
import { X, Send, Loader2, Bot, User } from 'lucide-react'

const API = import.meta.env.VITE_API_BASE_URL || 'https://h28wyjr7u7.execute-api.us-east-1.amazonaws.com'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AssistantChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const token = localStorage.getItem('ri_token')
      const r = await fetch(`${API}/assistant/chat`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, history: messages.slice(-6) }),
      })
      const data = await r.json()
      const reply: Message = { role: 'assistant', content: data.reply || 'Desculpe, não consegui responder.' }
      setMessages(prev => [...prev, reply])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erro de conexão. Tente novamente.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition flex items-center justify-center z-40 hover:scale-110">
          <Bot size={24} />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <div>
                <p className="font-semibold text-sm">Assistente Inspire</p>
                <p className="text-xs text-white/60">Pergunte sobre conteúdos da plataforma</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white"><X size={20} /></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <Bot size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium">Olá! Como posso ajudar?</p>
                <p className="text-xs mt-1">Pergunte sobre vídeos, materiais ou treinamentos</p>
                <div className="mt-4 space-y-2">
                  {['Preciso de material sobre liderança', 'Quais treinamentos temos?', 'Recomende vídeos sobre adolescentes'].map(s => (
                    <button key={s} onClick={() => { setInput(s); }}
                      className="block w-full text-left text-xs bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                      "{s}"
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-gray-900 text-white rounded-br-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t dark:border-gray-700 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Digite sua pergunta..."
                className="flex-1 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-300 dark:text-white dark:placeholder-gray-400"
              />
              <button onClick={sendMessage} disabled={!input.trim() || loading}
                className="bg-gray-900 text-white p-2.5 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
