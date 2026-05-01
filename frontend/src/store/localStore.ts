// =============================================================================
// LocalStore — Simula backend usando localStorage
// =============================================================================

const STORE_PREFIX = 'rede_inspire_'

function getKey(key: string): string {
  return `${STORE_PREFIX}${key}`
}

export function storeGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(getKey(key))
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function storeSet<T>(key: string, value: T): void {
  localStorage.setItem(getKey(key), JSON.stringify(value))
}

export function storeRemove(key: string): void {
  localStorage.removeItem(getKey(key))
}

export function storeGetList<T>(key: string): T[] {
  return storeGet<T[]>(key) ?? []
}

export function storeAppend<T extends { id?: string }>(key: string, item: T): T {
  const list = storeGetList<T>(key)
  if (!item.id) {
    (item as any).id = crypto.randomUUID()
  }
  list.push(item)
  storeSet(key, list)
  return item
}

export function storeUpdate<T extends { id?: string }>(key: string, id: string, updates: Partial<T>): T | null {
  const list = storeGetList<T>(key)
  const idx = list.findIndex((item: any) => item.id === id)
  if (idx === -1) return null
  list[idx] = { ...list[idx], ...updates }
  storeSet(key, list)
  return list[idx]
}

export function storeDelete(key: string, id: string): boolean {
  const list = storeGetList<any>(key)
  const filtered = list.filter((item: any) => item.id !== id)
  if (filtered.length === list.length) return false
  storeSet(key, filtered)
  return true
}

// Generate a unique ID
export function generateId(): string {
  return crypto.randomUUID()
}
