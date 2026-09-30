import { useEffect, useState } from 'react'
import { CardPreview } from './components/CardPreview'
import { PhotoPanel } from './components/PhotoPanel'
import { QuotePanel } from './components/QuotePanel'
import { RecentCards } from './components/RecentCards'
import { StylePanel } from './components/StylePanel'
import { hasAccessKey, onRateLimit, UNSPLASH_HOME } from './lib/unsplash'

export default function App() {
  const [remaining, setRemaining] = useState<number | null>(null)
  useEffect(() => {
    const off = onRateLimit(setRemaining)
    return () => {
      off()
    }
  }, [])

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-4">
          <h1 className="shrink-0 text-xl font-bold">계절 명언 카드</h1>
          <p className="text-xs text-stone-500">
            사진 제공{' '}
            <a href={UNSPLASH_HOME()} target="_blank" rel="noreferrer" className="underline">
              Unsplash
            </a>
            {remaining !== null && <span> · 남은 API 호출 {remaining}회</span>}
          </p>
        </div>
      </header>

      {!hasAccessKey() ? (
        <main className="mx-auto max-w-xl p-6">
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-5 text-sm leading-6">
            <p className="font-bold">Unsplash Access Key가 필요해요.</p>
            <p>
              프로젝트 루트에 <code>.env.local</code> 파일을 만들고 <code>VITE_UNSPLASH_ACCESS_KEY=발급받은키</code>를
              적은 뒤 개발 서버를 다시 실행해 주세요.
            </p>
          </div>
        </main>
      ) : (
        <main className="mx-auto grid max-w-6xl gap-6 p-4 lg:grid-cols-[1fr_minmax(0,420px)_1fr]">
          <div className="lg:order-1">
            <PhotoPanel />
          </div>
          <div className="lg:sticky lg:top-4 lg:order-2 lg:self-start">
            <CardPreview />
          </div>
          <div className="space-y-6 lg:order-3">
            <QuotePanel />
            <StylePanel />
          </div>
          <div className="lg:order-4 lg:col-span-3">
            <RecentCards />
          </div>
        </main>
      )}
    </div>
  )
}
