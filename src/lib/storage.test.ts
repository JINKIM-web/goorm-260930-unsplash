import { beforeEach, describe, expect, it } from 'vitest'
import { readCache, writeCache } from './storage'

// Node에는 localStorage가 없으므로 간단한 메모리 구현을 쓴다.
class MemoryStorage {
  private data = new Map<string, string>()
  getItem = (k: string) => this.data.get(k) ?? null
  setItem = (k: string, v: string) => void this.data.set(k, v)
  removeItem = (k: string) => void this.data.delete(k)
  clear = () => this.data.clear()
  key = (i: number) => [...this.data.keys()][i] ?? null
  get length() {
    return this.data.size
  }
}

beforeEach(() => {
  const mem = new MemoryStorage()
  // Object.keys(localStorage)가 저장된 키를 돌려주도록 Proxy로 감싼다.
  const proxy = new Proxy(mem, {
    ownKeys: () => [...(mem as unknown as { data: Map<string, string> }).data.keys()],
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
  })
  Object.defineProperty(globalThis, 'localStorage', { value: proxy, configurable: true })
})

describe('검색 캐시', () => {
  it('1시간 안에는 저장한 값을 돌려준다', () => {
    writeCache('q', { a: 1 }, 0)
    expect(readCache('q', 59 * 60 * 1000)).toEqual({ a: 1 })
  })

  it('1시간이 지나면 만료된다', () => {
    writeCache('q', { a: 1 }, 0)
    expect(readCache('q', 61 * 60 * 1000)).toBeNull()
  })

  it('최대 30개만 남기고 오래된 것부터 지운다', () => {
    for (let i = 0; i < 35; i++) writeCache(`q${i}`, i, i)
    expect(readCache('q0', 100)).toBeNull()
    expect(readCache('q34', 100)).toBe(34)
    expect(Object.keys(localStorage).filter((k) => k.includes(':cache:'))).toHaveLength(30)
  })
})
