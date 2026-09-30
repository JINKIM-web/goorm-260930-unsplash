import { useState } from 'react'
import quotes from '../data/quotes.json'
import type { Quote, Season } from '../types'
import { SEASONS, currentSeason } from '../lib/season'
import { isFavorite, useCardStore } from '../store/cardStore'

const ALL = quotes as Quote[]
const MAX_TEXT = 120
const MAX_AUTHOR = 30

export function QuotePanel() {
  const card = useCardStore((s) => s.card)
  const favorites = useCardStore((s) => s.favorites)
  const setQuote = useCardStore((s) => s.setQuote)
  const toggleFavorite = useCardStore((s) => s.toggleFavorite)
  const [tab, setTab] = useState<Season | 'favorites'>(currentSeason())

  const list = tab === 'favorites' ? favorites : ALL.filter((q) => q.season === tab || q.season === 'any')
  const faved = isFavorite(favorites, card.quote)

  const pickRandom = () => {
    const pool = list.length ? list : ALL
    setQuote(pool[Math.floor(Math.random() * pool.length)])
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold">2. 명언 고르기</h2>
      <div className="space-y-2">
        <textarea
          value={card.quote.text}
          maxLength={MAX_TEXT}
          rows={3}
          onChange={(e) => setQuote({ ...card.quote, text: e.target.value })}
          aria-label="명언 본문"
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <input
            value={card.quote.author}
            maxLength={MAX_AUTHOR}
            onChange={(e) => setQuote({ ...card.quote, author: e.target.value })}
            placeholder="출처 (인물명)"
            aria-label="명언 출처"
            className="min-w-0 flex-1 rounded-md border border-stone-300 px-3 py-1.5 text-sm"
          />
          <button
            onClick={() => toggleFavorite(card.quote)}
            disabled={!card.quote.text.trim()}
            aria-pressed={faved}
            className="rounded-md border border-stone-300 px-3 text-sm hover:bg-stone-100 disabled:opacity-50"
            title={faved ? '즐겨찾기에서 빼기' : '즐겨찾기에 추가'}
          >
            {faved ? '♥ 저장됨' : '♡ 즐겨찾기'}
          </button>
        </div>
        <p className="text-right text-xs text-stone-500">
          {card.quote.text.length}/{MAX_TEXT}자
        </p>
      </div>

      <div className="flex flex-wrap gap-1 text-sm">
        {SEASONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setTab(s.key)}
            className={`rounded-md px-2.5 py-1 ${tab === s.key ? 'bg-stone-900 text-white' : 'bg-stone-200'}`}
          >
            {s.label}
          </button>
        ))}
        <button
          onClick={() => setTab('favorites')}
          className={`rounded-md px-2.5 py-1 ${tab === 'favorites' ? 'bg-stone-900 text-white' : 'bg-stone-200'}`}
        >
          즐겨찾기 {favorites.length}
        </button>
        <button onClick={pickRandom} className="ml-auto rounded-md border border-stone-300 px-2.5 py-1 hover:bg-stone-100">
          랜덤
        </button>
      </div>
      <ul className="max-h-56 space-y-1 overflow-y-auto">
        {list.map((q) => (
          <li key={q.id}>
            <button
              onClick={() => setQuote({ text: q.text, author: q.author })}
              className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-stone-100"
            >
              {q.text} <span className="text-stone-500">— {q.author}</span>
            </button>
          </li>
        ))}
        {list.length === 0 && <li className="px-2 text-sm text-stone-500">즐겨찾기한 명언이 없어요.</li>}
      </ul>
    </section>
  )
}
