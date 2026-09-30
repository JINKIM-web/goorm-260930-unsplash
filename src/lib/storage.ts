// localStorage 접근은 모두 여기서 한다. 시크릿 창이나 용량 초과에서도 앱이 멈추지 않도록 예외를 삼킨다.
const PREFIX = 'qcm:v1:'
const CACHE_PREFIX = `${PREFIX}cache:`
const CACHE_TTL_MS = 60 * 60 * 1000
const MAX_CACHE_ENTRIES = 30

export const storageKey = (name: string) => `${PREFIX}${name}`

export function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  const raw = JSON.stringify(value)
  try {
    localStorage.setItem(key, raw)
    return true
  } catch {
    // 용량이 부족하면 검색 캐시부터 비우고 한 번 더 시도한다.
    clearCache()
    try {
      localStorage.setItem(key, raw)
      return true
    } catch {
      return false
    }
  }
}

type CacheEntry<T> = { savedAt: number; value: T }

export function readCache<T>(id: string, now = Date.now()): T | null {
  const entry = readJSON<CacheEntry<T>>(CACHE_PREFIX + id)
  if (!entry || now - entry.savedAt > CACHE_TTL_MS) return null
  return entry.value
}

export function writeCache<T>(id: string, value: T, now = Date.now()) {
  pruneCache(MAX_CACHE_ENTRIES - 1)
  writeJSON(CACHE_PREFIX + id, { savedAt: now, value } satisfies CacheEntry<T>)
}

function cacheKeys(): string[] {
  try {
    return Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX))
  } catch {
    return []
  }
}

function pruneCache(keep: number) {
  const keys = cacheKeys()
  if (keys.length <= keep) return
  const byAge = keys
    .map((k) => ({ k, savedAt: readJSON<CacheEntry<unknown>>(k)?.savedAt ?? 0 }))
    .sort((a, b) => a.savedAt - b.savedAt)
  for (const { k } of byAge.slice(0, keys.length - keep)) {
    try {
      localStorage.removeItem(k)
    } catch {
      /* 무시 */
    }
  }
}

export function clearCache() {
  for (const k of cacheKeys()) {
    try {
      localStorage.removeItem(k)
    } catch {
      /* 무시 */
    }
  }
}
