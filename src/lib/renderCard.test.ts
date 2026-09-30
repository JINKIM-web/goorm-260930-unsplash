import { describe, expect, it } from 'vitest'
import { layoutQuote } from './renderCard'
import { defaultCard } from '../store/cardStore'

// 글자 폭 = 글자 크기로 가정
const measureAt = (size: number) => (s: string) => [...s].length * size

describe('layoutQuote', () => {
  it('짧은 명언은 고른 글자 크기를 그대로 쓴다', () => {
    const card = { ...defaultCard, ratio: '4:5' as const, size: 'md' as const, quote: { text: '가을', author: '' } }
    expect(layoutQuote(card, measureAt)).toEqual({ fontSize: 60, lines: ['가을'] })
  })

  it('6줄을 넘으면 글자 크기를 한 단계 줄인다', () => {
    const text = Array.from({ length: 16 }, () => '가나다라마바').join(' ')
    const card = { ...defaultCard, ratio: '1:1' as const, size: 'lg' as const, quote: { text, author: '' } }
    const layout = layoutQuote(card, measureAt)
    expect(layout.fontSize).toBeLessThan(68)
  })
})
