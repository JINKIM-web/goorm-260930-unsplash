import { describe, expect, it } from 'vitest'
import { sizedUrl, toPhoto, withUtm } from './unsplash'

describe('withUtm', () => {
  it('utm 파라미터를 붙인다', () => {
    const u = new URL(withUtm('https://unsplash.com/@jane'))
    expect(u.searchParams.get('utm_source')).toBe('season_quote_card')
    expect(u.searchParams.get('utm_medium')).toBe('referral')
  })
})

describe('sizedUrl', () => {
  it('ixid를 유지하면서 크롭 파라미터를 추가한다', () => {
    const u = new URL(sizedUrl('https://images.unsplash.com/photo-1?ixid=abc&ixlib=rb-4', 1080, 1350))
    expect(u.searchParams.get('ixid')).toBe('abc')
    expect(u.searchParams.get('w')).toBe('1080')
    expect(u.searchParams.get('h')).toBe('1350')
    expect(u.searchParams.get('fit')).toBe('crop')
  })
})

describe('toPhoto', () => {
  it('필요한 필드만 뽑고 링크에 utm을 붙인다', () => {
    const photo = toPhoto({
      id: 'p1',
      width: 4000,
      height: 5000,
      color: '#c08040',
      alt_description: 'maple leaves',
      urls: { raw: 'https://images.unsplash.com/r', small: 'https://images.unsplash.com/s', regular: 'https://images.unsplash.com/g' },
      links: { html: 'https://unsplash.com/photos/p1', download_location: 'https://api.unsplash.com/photos/p1/download?ixid=x' },
      user: { name: 'Jane Doe', username: 'jane', links: { html: 'https://unsplash.com/@jane' } },
    })
    expect(photo.downloadLocation).toBe('https://api.unsplash.com/photos/p1/download?ixid=x')
    expect(photo.photographer.name).toBe('Jane Doe')
    expect(photo.photographer.profileUrl).toContain('utm_source=')
    expect(photo.photoPageUrl).toContain('utm_medium=referral')
  })
})
