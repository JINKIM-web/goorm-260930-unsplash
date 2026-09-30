import { describe, expect, it } from 'vitest'
import { wrapText } from './wrapText'

// 글자 하나 = 10px로 가정한 측정 함수
const measure = (s: string) => [...s].length * 10

describe('wrapText', () => {
  it('어절 단위로 줄을 나눈다', () => {
    expect(wrapText('가을 하늘 공활한데 높고 구름 없이', 90, measure)).toEqual(['가을 하늘', '공활한데 높고', '구름 없이'])
  })

  it('한 줄보다 긴 어절은 글자 단위로 자른다', () => {
    expect(wrapText('가나다라마바사아자차카', 50, measure)).toEqual(['가나다라마', '바사아자차', '카'])
  })

  it('줄바꿈 문자를 유지한다', () => {
    expect(wrapText('첫 줄\n둘째 줄', 1000, measure)).toEqual(['첫 줄', '둘째 줄'])
  })
})
