import { useEffect, useRef, useState } from 'react'
import { CANVAS_SIZE, loadCardFonts, renderCard } from '../lib/renderCard'
import { sizedUrl, trackDownload } from '../lib/unsplash'
import { useCardStore } from '../store/cardStore'
import { Attribution } from './Attribution'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    // 캔버스를 PNG로 내보내려면 CORS 허용 이미지로 불러와야 한다.
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('이미지를 불러오지 못했어요.'))
    img.src = src
  })
}

const fileName = () => {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `season-card-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.png`
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG를 만들지 못했어요.'))), 'image/png')
    } catch (e) {
      reject(e)
    }
  })
}

export function CardPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const photo = useCardStore((s) => s.photo)
  const card = useCardStore((s) => s.card)
  const addRecent = useCardStore((s) => s.addRecent)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [imgError, setImgError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const { w, h } = CANVAS_SIZE[card.ratio]

  useEffect(() => {
    if (!photo) return
    let cancelled = false
    setImgError(null)
    loadImage(sizedUrl(photo.urls.raw, w, h))
      .then((i) => !cancelled && setImg(i))
      .catch((e: Error) => !cancelled && setImgError(e.message))
    return () => {
      cancelled = true
    }
  }, [photo, w, h])

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    let cancelled = false
    renderCard(ctx, img, photo, card)
    // 폰트가 늦게 도착하면 한 번 더 그린다.
    loadCardFonts(card).then(() => !cancelled && renderCard(ctx, img, photo, card))
    return () => {
      cancelled = true
    }
  }, [img, photo, card])

  const makeBlob = async () => {
    const canvas = canvasRef.current
    if (!canvas || !photo) throw new Error('사진을 먼저 골라 주세요.')
    await loadCardFonts(card)
    renderCard(canvas.getContext('2d')!, img, photo, card)
    try {
      return await toBlob(canvas)
    } catch (e) {
      if (e instanceof DOMException && e.name === 'SecurityError')
        throw new Error('이미지 보안 설정 때문에 PNG로 저장할 수 없어요.')
      throw e
    }
  }

  const afterExport = () => {
    if (photo) void trackDownload(photo)
    addRecent()
  }

  const download = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const blob = await makeBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName()
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      afterExport()
      setMessage('저장했어요. 최근 카드에도 추가했어요.')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '저장하지 못했어요.')
    } finally {
      setBusy(false)
    }
  }

  const canShare = typeof navigator !== 'undefined' && 'canShare' in navigator
  const share = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const file = new File([await makeBlob()], fileName(), { type: 'image/png' })
      if (!navigator.canShare({ files: [file] })) throw new Error('이 기기에서는 이미지 공유를 지원하지 않아요.')
      await navigator.share({ files: [file], title: '계절 명언 카드' })
      afterExport()
    } catch (e) {
      if (!(e instanceof DOMException && e.name === 'AbortError'))
        setMessage(e instanceof Error ? e.message : '공유하지 못했어요.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold">미리보기</h2>
      <div className="mx-auto w-full max-w-[420px]">
        <canvas
          ref={canvasRef}
          width={w}
          height={h}
          className="h-auto w-full rounded-lg shadow-lg"
          role="img"
          aria-label={`명언 카드 미리보기: ${card.quote.text}`}
        />
      </div>
      {photo && (
        <div className="text-center">
          <Attribution photo={photo} />
        </div>
      )}
      {imgError && <p className="text-center text-sm text-red-700">{imgError}</p>}
      <div className="flex justify-center gap-2">
        <button
          onClick={download}
          disabled={busy || !photo}
          className="rounded-md bg-stone-900 px-5 py-2 text-white hover:bg-stone-700 disabled:opacity-50"
        >
          PNG 다운로드
        </button>
        {canShare && (
          <button
            onClick={share}
            disabled={busy || !photo}
            className="rounded-md border border-stone-300 px-5 py-2 hover:bg-stone-100 disabled:opacity-50"
          >
            공유
          </button>
        )}
      </div>
      {message && <p className="text-center text-sm text-stone-600">{message}</p>}
    </section>
  )
}
