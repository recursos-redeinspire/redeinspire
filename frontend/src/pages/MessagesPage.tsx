import { useState, useEffect } from 'react'
import { useData } from '../contexts/DataContext'
import { useI18n } from '../i18n/I18nContext'

export default function MessagesPage() {
  const { getMessages, getUnreadCount, markAsRead, sendMessage, getMessageRecipients } = useData()
  const { t } = useI18n()
  const [tab, setTab] = useState<'inbox' | 'enviar'>('inbox')
  const [selectedMsg, setSelectedMsg] = useState<string | null>(null)
  const [newMsg, setNewMsg] = useState({ toUserId: '', subject: '', body: '' })
  const [sendSuccess, setSendSuccess] = useState('')
  const [sendError, setSendError] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [recipients, setRecipients] = useState<any[]>([])
  const [sending, setSending] = useState(false)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    getMessages().then(setMessages)
    getUnreadCount().then(setUnreadCount)
    getMessageRecipients().then(setRecipients)
  }, [refresh])

  const selected = messages.find(m => m.id === selectedMsg)

  const handleSelectMsg = async (msgId: string) => {
    setSelectedMsg(msgId)
    await markAsRead(msgId)
    setRefresh(r => r + 1)
  }

  const handleSend = async () => {
    if (!newMsg.toUserId || !newMsg.subject.trim() || !newMsg.body.trim()) return
    setSending(true); setSendError(''); setSendSuccess('')
    try {
      const result = await sendMessage(newMsg.toUserId, newMsg.subject, newMsg.body)
      if (result && result.message) {
        setSendSuccess(result.message)
      } else {
        setSendSuccess(t('messages.sentSuccess'))
      }
      setNewMsg({ toUserId: '', subject: '', body: '' })
      setTimeout(() => setSendSuccess(''), 4000)
    } catch (err: any) {
      setSendError(err?.message || t('messages.sendError'))
    }
    setSending(false)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">{t('messages.title')}</h1>
        {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{unreadCount} {t('messages.unread')}</span>}
      </div>

      <div className="flex gap-4 mb-6 border-b">
        <button onClick={() => { setTab('inbox'); setSelectedMsg(null) }} className={`pb-2 px-1 font-medium ${tab === 'inbox' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500'}`}>
          {t('messages.inbox')}
        </button>
        <button onClick={() => setTab('enviar')} className={`pb-2 px-1 font-medium ${tab === 'enviar' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500'}`}>
          {t('messages.sendMessage')}
        </button>
      </div>

      {tab === 'inbox' && !selectedMsg && (
        <div className="space-y-2">
          {messages.length === 0 && <p className="text-gray-500 text-center py-8">{t('messages.noMessages')}</p>}
          {messages.map(m => (
            <div key={m.id} onClick={() => handleSelectMsg(m.id)} className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${!m.isRead ? 'bg-gray-50 border-gray-300' : 'bg-white'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${!m.isRead ? 'font-bold' : 'font-medium'}`}>{m.fromName}</p>
                    {m.groupName && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{m.groupName}</span>}
                  </div>
                  <p className={!m.isRead ? 'font-semibold' : ''}>{m.subject}</p>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-1">{m.body}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(m.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'inbox' && selected && (
        <div className="bg-white border rounded-lg p-6">
          <button onClick={() => setSelectedMsg(null)} className="text-gray-900 text-sm mb-4 hover:underline">← {t('messages.backToInbox')}</button>
          <div className="border-b pb-4 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{selected.subject}</h2>
              {selected.groupName && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{selected.groupName}</span>}
            </div>
            <p className="text-sm text-gray-500 mt-1">{t('messages.from')}: {selected.fromName} · {new Date(selected.createdAt).toLocaleString('pt-BR')}</p>
          </div>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.body}</p>
        </div>
      )}

      {tab === 'enviar' && (
        <div className="bg-white border rounded-lg p-6 max-w-2xl">
          {sendSuccess && <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{sendSuccess}</div>}
          {sendError && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{sendError}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('messages.to')}</label>
              <select value={newMsg.toUserId} onChange={e => setNewMsg({ ...newMsg, toUserId: e.target.value })} className="w-full border rounded-lg px-3 py-2 bg-white">
                <option value="">{t('messages.selectRecipient')}</option>
                {recipients.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.role === 'group' ? r.name : `${r.name}${r.role === 'pastor_presidente' ? ' (Pastor)' : r.role === 'admin' ? ' (Admin)' : ''}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('messages.subject')}</label>
              <input type="text" value={newMsg.subject} onChange={e => setNewMsg({ ...newMsg, subject: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder={t('messages.subjectPlaceholder')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('messages.body')}</label>
              <textarea value={newMsg.body} onChange={e => setNewMsg({ ...newMsg, body: e.target.value })} rows={5} className="w-full border rounded-lg px-3 py-2" placeholder={t('messages.bodyPlaceholder')} />
            </div>
            <button onClick={handleSend} disabled={sending || !newMsg.toUserId || !newMsg.subject.trim() || !newMsg.body.trim()} className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
              {sending ? t('messages.sending') : t('messages.send')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
