import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

const API = import.meta.env.VITE_API_BASE_URL || ''

// Types
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'pastor_presidente' | 'lider' | 'membro'
  churchId: string
  ministries: string[]
  status: string
  photoUrl?: string
  birthDate?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; firstLogin?: boolean }>
  logout: () => void
  registerLeader: (data: { name: string; email: string; cpf: string; ministries: string[]; churchId?: string; role?: string; photoUrl?: string; birthDate?: string; password?: string; preferredLang?: string }) => Promise<{ success: boolean; error?: string }>
  updateUser: (userId: string, data: Record<string, any>) => Promise<{ success: boolean; error?: string }>
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>
  getLeaders: () => Promise<User[]>
  blockLeader: (leaderId: string, blocked: boolean) => Promise<{ success: boolean; error?: string }>
  deleteLeader: (leaderId: string) => Promise<{ success: boolean; error?: string }>
  resetPassword: (userId: string) => Promise<{ success: boolean; error?: string; message?: string }>
}

const AuthContext = createContext<AuthContextType | null>(null)

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('ri_user')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function getToken(): string | null {
  return localStorage.getItem('ri_token')
}

export function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser)

  const login = useCallback(async (email: string, password: string) => {
    // If no API configured, use local fallback
    if (!API) return loginLocal(email, password, setUser)
    try {
      const resp = await fetch(`${API}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await resp.json()
      if (!resp.ok) return { success: false, error: data.blockedMessage || data.message || 'Erro ao fazer login' }
      localStorage.setItem('ri_token', data.token)
      localStorage.setItem('ri_user', JSON.stringify(data.user))
      if (data.firstLogin) localStorage.setItem('ri_first_login', 'true')
      else localStorage.removeItem('ri_first_login')
      setUser(data.user)
      return { success: true, firstLogin: !!data.firstLogin }
    } catch (err) {
      console.error('Login API error, falling back to local:', err)
      return loginLocal(email, password, setUser)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ri_token')
    localStorage.removeItem('ri_user')
    setUser(null)
  }, [])

  const registerLeader = useCallback(async (data: { name: string; email: string; cpf: string; ministries: string[]; churchId?: string; role?: string; photoUrl?: string; birthDate?: string; password?: string; preferredLang?: string }) => {
    if (!user || (user.role !== 'admin' && user.role !== 'pastor_presidente')) return { success: false, error: 'Apenas administradores ou pastores podem cadastrar usuários.' }
    if (!API) return registerLocal(data, user, setUser)
    try {
      const resp = await fetch(`${API}/auth/register`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const result = await resp.json()
      if (!resp.ok) return { success: false, error: result.message }
      return { success: true }
    } catch {
      return registerLocal(data, user, setUser)
    }
  }, [user])

  const updateUser = useCallback(async (userId: string, data: Record<string, any>) => {
    if (!user || (user.role !== 'admin' && user.role !== 'pastor_presidente')) return { success: false, error: 'Sem permissão.' }
    if (!API) return { success: false, error: 'API não configurada.' }
    try {
      const resp = await fetch(`${API}/auth/leader/${userId}`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify(data),
      })
      if (!resp.ok) { const d = await resp.json(); return { success: false, error: d.message } }
      return { success: true }
    } catch {
      return { success: false, error: 'Erro de conexão.' }
    }
  }, [user])

  const getLeaders = useCallback(async (): Promise<User[]> => {
    if (!user) return []
    if (!API) return getLeadersLocal(user)
    try {
      const resp = await fetch(`${API}/auth/leaders`, { headers: authHeaders() })
      if (!resp.ok) return getLeadersLocal(user)
      return await resp.json()
    } catch {
      return getLeadersLocal(user)
    }
  }, [user])

  const blockLeader = useCallback(async (leaderId: string, blocked: boolean) => {
    if (!user || (user.role !== 'admin' && user.role !== 'pastor_presidente')) return { success: false, error: 'Sem permissão.' }
    if (!API) return blockLeaderLocal(leaderId, blocked)
    try {
      const resp = await fetch(`${API}/auth/leader/${leaderId}/block`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ blocked }),
      })
      if (!resp.ok) { const d = await resp.json(); return { success: false, error: d.message } }
      return { success: true }
    } catch {
      return blockLeaderLocal(leaderId, blocked)
    }
  }, [user])

  const deleteLeader = useCallback(async (leaderId: string) => {
    if (!user || (user.role !== 'admin' && user.role !== 'pastor_presidente')) return { success: false, error: 'Sem permissão.' }
    if (!API) return deleteLeaderLocal(leaderId)
    try {
      const resp = await fetch(`${API}/auth/leader/${leaderId}`, {
        method: 'DELETE', headers: authHeaders(),
      })
      if (!resp.ok) { const d = await resp.json(); return { success: false, error: d.message } }
      return { success: true }
    } catch {
      return deleteLeaderLocal(leaderId)
    }
  }, [user])

  const changePassword = useCallback(async (newPassword: string) => {
    if (!API) return { success: false, error: 'API não configurada.' }
    try {
      const resp = await fetch(`${API}/auth/change-password`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ newPassword }),
      })
      if (!resp.ok) { const d = await resp.json(); return { success: false, error: d.message } }
      localStorage.removeItem('ri_first_login')
      return { success: true }
    } catch {
      return { success: false, error: 'Erro de conexão.' }
    }
  }, [])


  const resetPassword = useCallback(async (userId: string) => {
    if (!user || (user.role !== 'admin' && user.role !== 'pastor_presidente')) return { success: false, error: 'Sem permissão.' }
    if (!API) return { success: false, error: 'API não configurada.' }
    try {
      const resp = await fetch(`${API}/auth/leader/${userId}/reset-password`, {
        method: 'POST', headers: authHeaders(),
      })
      const data = await resp.json()
      if (!resp.ok) return { success: false, error: data.message }
      return { success: true, message: data.message }
    } catch {
      return { success: false, error: 'Erro de conexão.' }
    }
  }, [user])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, registerLeader, updateUser, changePassword, getLeaders, blockLeader, deleteLeader, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// ---- Local fallbacks (localStorage) ----
import { storeGetList, storeAppend } from '../store/localStore'

interface StoredUser extends User { password: string }

function loginLocal(email: string, password: string, setUser: (u: User) => void) {
  const users = storeGetList<StoredUser>('users')
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
  if (!found) return { success: false, error: 'E-mail ou senha incorretos.' }
  if (found.status === 'blocked') return { success: false, error: '🚗 Sua conta está bloqueada. Para voltar a ter acesso, lave o carro do pastor!' }
  const { password: _, ...safe } = found
  localStorage.setItem('ri_user', JSON.stringify(safe))
  setUser(safe)
  return { success: true }
}

function registerLocal(data: { name: string; email: string; cpf: string; ministries: string[]; churchId?: string; role?: string }, user: User, _setUser: (u: User) => void) {
  const users = storeGetList<StoredUser>('users')
  if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) return { success: false, error: 'E-mail já cadastrado.' }
  storeAppend('users', { id: `u${Date.now()}`, name: data.name, email: data.email, password: '123456', role: data.role || 'lider', churchId: data.churchId || user.churchId, ministries: data.ministries, status: 'active' } as any)
  return { success: true }
}

function getLeadersLocal(user: User): User[] {
  return storeGetList<StoredUser>('users').filter(u => u.churchId === user.churchId && u.id !== user.id).map(({ password: _, ...rest }) => rest)
}

function blockLeaderLocal(leaderId: string, blocked: boolean) {
  const users = storeGetList<StoredUser>('users')
  const idx = users.findIndex(u => u.id === leaderId)
  if (idx === -1) return { success: false, error: 'Líder não encontrado.' }
  users[idx].status = blocked ? 'blocked' : 'active'
  localStorage.setItem('ri_users', JSON.stringify(users))
  return { success: true }
}

function deleteLeaderLocal(leaderId: string) {
  const users = storeGetList<StoredUser>('users')
  const filtered = users.filter(u => u.id !== leaderId)
  localStorage.setItem('ri_users', JSON.stringify(filtered))
  return { success: true }
}
