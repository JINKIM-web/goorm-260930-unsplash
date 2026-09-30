import { useEffect, useState } from 'react'
import type { Photo, Season } from '../types'
import { SEASONS, currentSeason } from '../lib/season'
import { searchPhotos, type SearchOptions, UnsplashError } from '../lib/unsplash'
import { useCardStore } from '../store/cardStore'

const COLORS: { value: string; label: string }[] = [
  { value: '', label: '모든 색' },
  { value: 'orange', label: '주황' },
  { value: 'yellow', label: '노랑' },
  { value: 'red', label: '빨강' },
  { value: 'green', label: '초록' },
  { value: 'blue', label: '파랑' },
  { value: 'white', label: '흰색' },
  { value: 'black_and_white', label: '흑백' },
]

export function PhotoPanel() {
  const [season, setSeason] = useState<Season>(currentSeason())
  const [input, setInput] = useState('')
  const [query, setQuery] = useState(SEASONS.find((s) => s.key === currentSeason())!.query)
  const [opts, setOpts] = useState<SearchOptions>({ orientation: 'portrait' })
  const [page, setPage] = useState(1)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const selected = useCardStore((s) => s.photo)
  const setPhoto = useCardStore((s) => s.setPhoto)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    searchPhotos(query, page, opts)
      .then((r) => {
        if (cancelled) return
        setPhotos((prev) => (page === 1 ? r.results : [...prev, ...r.results]))
        setTotalPages(r.totalPages)
        if (page === 1 && !useCardStore.getState().photo && r.results[0]) setPhoto(r.results[0])
      })
      .catch((e: unknown) => !cancelled && setError(e instanceof UnsplashError ? e.message : '사진을 불러오지 못했어요.'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [query, page, opts, setPhoto])

  const runSearch = (q: string) => {
    setPage(1)
    setQuery(q)
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold">1. 사진 고르기</h2>
      <div className="flex gap-1" role="tablist" aria-label="계절">
        {SEASONS.map((s) => (
          <button
            key={s.key}
            role="tab"
            aria-selected={season === s.key && query === s.query}
            onClick={() => {
              setSeason(s.key)
              setInput('')
              runSearch(s.query)
            }}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm ${
              season === s.key && query === s.query ? 'bg-stone-900 text-white' : 'bg-stone-200 hover:bg-stone-300'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (input.trim()) runSearch(input.trim())
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="키워드 검색 (예: maple, 단풍)"
          aria-label="사진 검색어"
          className="min-w-0 flex-1 rounded-md border border-stone-300 px-3 py-1.5 text-sm"
        />
        <button className="rounded-md bg-stone-900 px-3 py-1.5 text-sm text-white">검색</button>
      </form>
      <div className="flex gap-2 text-sm">
        <select
          aria-label="사진 방향"
          value={opts.orientation}
          onChange={(e) => {
            setPage(1)
            setOpts((o) => ({ ...o, orientation: e.target.value as SearchOptions['orientation'] }))
          }}
          className="rounded-md border border-stone-300 px-2 py-1"
        >
          <option value="portrait">세로 사진</option>
          <option value="squarish">정사각형 사진</option>
        </select>
        <select
          aria-label="사진 색상"
          value={opts.color ?? ''}
          onChange={(e) => {
            setPage(1)
            setOpts((o) => ({ ...o, color: e.target.value || undefined }))
          }}
          className="rounded-md border border-stone-300 px-2 py-1"
        >
          {COLORS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid max-h-[60vh] grid-cols-3 gap-2 overflow-y-auto pr-1">
        {photos.map((p) => (
          <button
            key={p.id}
            onClick={() => setPhoto(p)}
            className={`relative aspect-[4/5] overflow-hidden rounded-md ring-offset-2 ${
              selected?.id === p.id ? 'ring-2 ring-stone-900' : ''
            }`}
            style={{ backgroundColor: p.color }}
            title={`Photo by ${p.photographer.name}`}
          >
            <img src={p.urls.small} alt={p.alt ?? ''} loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      {!loading && photos.length === 0 && !error && <p className="text-sm text-stone-500">검색 결과가 없어요.</p>}
      {page < totalPages && (
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={loading}
          className="w-full rounded-md border border-stone-300 py-1.5 text-sm hover:bg-stone-100 disabled:opacity-50"
        >
          {loading ? '불러오는 중…' : '사진 더 보기'}
        </button>
      )}
    </section>
  )
}
