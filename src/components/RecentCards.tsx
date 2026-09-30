import { useCardStore } from '../store/cardStore'

export function RecentCards() {
  const recent = useCardStore((s) => s.recent)
  const restore = useCardStore((s) => s.restoreRecent)
  const remove = useCardStore((s) => s.removeRecent)
  if (recent.length === 0) return null

  return (
    <section className="space-y-2">
      <h2 className="text-lg font-bold">최근 만든 카드</h2>
      <ul className="flex gap-3 overflow-x-auto pb-2">
        {recent.map((r) => (
          <li key={r.id} className="relative w-24 shrink-0">
            <button onClick={() => restore(r.id)} className="block w-full text-left" title="에디터로 불러오기">
              <img
                src={r.photo.urls.small}
                alt={r.photo.alt ?? ''}
                className={`w-full rounded-md object-cover ${r.card.ratio === '1:1' ? 'aspect-square' : 'aspect-[4/5]'}`}
                style={{ backgroundColor: r.photo.color }}
              />
              <p className="mt-1 line-clamp-2 text-xs">{r.card.quote.text}</p>
            </button>
            <button
              onClick={() => remove(r.id)}
              aria-label="최근 카드에서 삭제"
              className="absolute top-1 right-1 rounded-full bg-black/60 px-1.5 text-xs text-white"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
