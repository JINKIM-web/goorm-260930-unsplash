import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import type { CardState, Photo, Quote, RecentCard } from '../types'
import { readJSON, storageKey, writeJSON } from '../lib/storage'

const MAX_RECENT = 20
const MAX_FAVORITES = 100

export const defaultCard: CardState = {
  quote: { text: '계절이 지나가는 하늘에는 가을로 가득 차 있습니다.', author: '윤동주, 「별 헤는 밤」' },
  ratio: '4:5',
  font: 'NotoSerifKR',
  size: 'md',
  align: 'center',
  position: 'middle',
  textColor: '#FFFFFF',
  dim: 0.3,
}

type Store = {
  photo: Photo | null
  card: CardState
  favorites: Quote[]
  recent: RecentCard[]
  setPhoto: (photo: Photo) => void
  updateCard: (patch: Partial<CardState>) => void
  setQuote: (quote: { text: string; author: string }) => void
  toggleFavorite: (quote: { text: string; author: string }) => void
  addRecent: () => void
  restoreRecent: (id: string) => void
  removeRecent: (id: string) => void
}

const sameQuote = (a: { text: string; author: string }, b: { text: string; author: string }) =>
  a.text.trim() === b.text.trim() && a.author.trim() === b.author.trim()

// zustand persist가 storage.ts를 거치도록 연결한다 (예외 처리와 용량 부족 대응을 공유).
const safeStorage: StateStorage = {
  getItem: (name) => {
    const v = readJSON<unknown>(name)
    return v === null ? null : JSON.stringify(v)
  },
  setItem: (name, value) => {
    writeJSON(name, JSON.parse(value))
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name)
    } catch {
      /* 무시 */
    }
  },
}

export const useCardStore = create<Store>()(
  persist(
    (set, get) => ({
      photo: null,
      card: defaultCard,
      favorites: [],
      recent: [],
      setPhoto: (photo) => set({ photo }),
      updateCard: (patch) => set((s) => ({ card: { ...s.card, ...patch } })),
      setQuote: (quote) => set((s) => ({ card: { ...s.card, quote } })),
      toggleFavorite: (quote) =>
        set((s) => {
          const exists = s.favorites.some((f) => sameQuote(f, quote))
          if (exists) return { favorites: s.favorites.filter((f) => !sameQuote(f, quote)) }
          const fav: Quote = { id: `fav-${Date.now()}`, text: quote.text.trim(), author: quote.author.trim(), season: 'any' }
          return { favorites: [fav, ...s.favorites].slice(0, MAX_FAVORITES) }
        }),
      addRecent: () => {
        const { photo, card, recent } = get()
        if (!photo) return
        const entry: RecentCard = { id: `card-${Date.now()}`, createdAt: Date.now(), photo, card }
        set({ recent: [entry, ...recent].slice(0, MAX_RECENT) })
      },
      restoreRecent: (id) => {
        const entry = get().recent.find((r) => r.id === id)
        if (entry) set({ photo: entry.photo, card: entry.card })
      },
      removeRecent: (id) => set((s) => ({ recent: s.recent.filter((r) => r.id !== id) })),
    }),
    {
      name: storageKey('state'),
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      // 편집 중인 카드(draft), 즐겨찾기, 최근 카드만 저장한다. 이미지 데이터는 저장하지 않는다.
      partialize: (s) => ({ photo: s.photo, card: s.card, favorites: s.favorites, recent: s.recent }),
    },
  ),
)

export const isFavorite = (favorites: Quote[], quote: { text: string; author: string }) =>
  favorites.some((f) => sameQuote(f, quote))
