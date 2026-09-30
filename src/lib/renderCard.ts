import type { CardState, FontKey, Photo, Ratio, SizeKey } from '../types'
import { wrapText } from './wrapText'

export const CANVAS_SIZE: Record<Ratio, { w: number; h: number }> = {
  '1:1': { w: 1080, h: 1080 },
  '4:5': { w: 1080, h: 1350 },
}

export const FONTS: Record<FontKey, { family: string; label: string }> = {
  NotoSerifKR: { family: 'Noto Serif KR', label: '노토 세리프' },
  GowunBatang: { family: 'Gowun Batang', label: '고운 바탕' },
  NanumMyeongjo: { family: 'Nanum Myeongjo', label: '나눔명조' },
  NotoSansKR: { family: 'Noto Sans KR', label: '노토 산스' },
}

const BODY_SIZE: Record<Ratio, Record<SizeKey, number>> = {
  '1:1': { sm: 44, md: 56, lg: 68 },
  '4:5': { sm: 48, md: 60, lg: 72 },
}
const AUTHOR_SIZE: Record<Ratio, number> = { '1:1': 28, '4:5': 30 }
const CREDIT_SIZE = 20
const MARGIN = 96
const LINE_HEIGHT = 1.5
const MAX_LINES = 6
const AUTHOR_GAP = 32

export const creditText = (photo: Photo) => `Photo by ${photo.photographer.name} on Unsplash`

// 사용하는 폰트를 먼저 불러온다. 캔버스는 웹폰트 로딩을 기다리지 않는다.
export async function loadCardFonts(card: CardState) {
  const family = FONTS[card.font].family
  const px = BODY_SIZE[card.ratio][card.size]
  await Promise.all([
    document.fonts.load(`700 ${px}px "${family}"`, card.quote.text || '가'),
    document.fonts.load(`400 ${AUTHOR_SIZE[card.ratio]}px "${family}"`, card.quote.author || '가'),
  ])
}

export type Layout = { fontSize: number; lines: string[] }

// 최대 줄 수를 넘으면 글자 크기를 한 단계씩 줄인다.
export function layoutQuote(card: CardState, measureAt: (size: number) => (s: string) => number): Layout {
  const { w } = CANVAS_SIZE[card.ratio]
  const steps: SizeKey[] = ['lg', 'md', 'sm']
  const start = steps.indexOf(card.size)
  let result: Layout = { fontSize: BODY_SIZE[card.ratio][card.size], lines: [] }
  for (const key of steps.slice(start)) {
    const fontSize = BODY_SIZE[card.ratio][key]
    const lines = wrapText(card.quote.text, w - MARGIN * 2, measureAt(fontSize))
    result = { fontSize, lines }
    if (lines.length <= MAX_LINES) break
  }
  return result
}

export function renderCard(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, photo: Photo | null, card: CardState) {
  const { w, h } = CANVAS_SIZE[card.ratio]
  const family = FONTS[card.font].family
  ctx.canvas.width = w
  ctx.canvas.height = h
  ctx.clearRect(0, 0, w, h)

  // 1. 배경 사진 (cover)
  ctx.fillStyle = photo?.color ?? '#444'
  ctx.fillRect(0, 0, w, h)
  if (img) {
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
    const dw = img.naturalWidth * scale
    const dh = img.naturalHeight * scale
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
  }

  // 2. 어둡게 처리 + 텍스트 쪽 그라데이션
  const darkText = card.textColor === '#111111'
  const shade = darkText ? '255,255,255' : '0,0,0'
  ctx.fillStyle = `rgba(${shade},${card.dim})`
  ctx.fillRect(0, 0, w, h)
  if (card.position !== 'middle') {
    const top = card.position === 'top'
    const g = ctx.createLinearGradient(0, top ? 0 : h, 0, top ? h * 0.6 : h * 0.4)
    g.addColorStop(0, `rgba(${shade},0.45)`)
    g.addColorStop(1, `rgba(${shade},0)`)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }

  // 3. 명언 본문과 4. 출처
  const measureAt = (size: number) => {
    ctx.font = `700 ${size}px "${family}"`
    return (s: string) => ctx.measureText(s).width
  }
  const { fontSize, lines } = layoutQuote(card, measureAt)
  const lineH = fontSize * LINE_HEIGHT
  const authorSize = AUTHOR_SIZE[card.ratio]
  const hasAuthor = card.quote.author.trim().length > 0
  const blockH = lines.length * lineH + (hasAuthor ? AUTHOR_GAP + authorSize * LINE_HEIGHT : 0)
  const creditSpace = CREDIT_SIZE * 2
  const y0 =
    card.position === 'top' ? MARGIN : card.position === 'bottom' ? h - MARGIN - creditSpace - blockH : (h - blockH) / 2
  const x = card.align === 'left' ? MARGIN : card.align === 'right' ? w - MARGIN : w / 2

  ctx.textAlign = card.align
  ctx.textBaseline = 'top'
  ctx.fillStyle = card.textColor
  ctx.shadowColor = darkText ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 12
  ctx.font = `700 ${fontSize}px "${family}"`
  lines.forEach((line, i) => ctx.fillText(line, x, y0 + i * lineH + (lineH - fontSize) / 2))
  if (hasAuthor) {
    ctx.font = `400 ${authorSize}px "${family}"`
    ctx.fillText(`— ${card.quote.author.trim()}`, x, y0 + lines.length * lineH + AUTHOR_GAP)
  }

  // 5. 사진 크레딧 (끌 수 없음)
  if (photo) {
    ctx.shadowBlur = 6
    ctx.globalAlpha = 0.8
    ctx.font = `400 ${CREDIT_SIZE}px "Noto Sans KR"`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(creditText(photo), w - 40, h - 36)
    ctx.globalAlpha = 1
  }
  ctx.shadowBlur = 0
}
