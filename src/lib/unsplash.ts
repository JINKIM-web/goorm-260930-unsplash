import type { Photo } from '../types'
import { readCache, writeCache } from './storage'

const API = 'https://api.unsplash.com'
const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined
export const APP_NAME = (import.meta.env.VITE_UNSPLASH_APP_NAME as string | undefined) || 'season_quote_card'

export const hasAccessKey = () => Boolean(ACCESS_KEY)

export class UnsplashError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

// Unsplash 가이드라인: Unsplash로 가는 모든 링크에 utm 파라미터를 붙인다.
export function withUtm(url: string): string {
  const u = new URL(url)
  u.searchParams.set('utm_source', APP_NAME)
  u.searchParams.set('utm_medium', 'referral')
  return u.toString()
}

export const UNSPLASH_HOME = () => withUtm('https://unsplash.com/')

type ApiPhoto = {
  id: string
  width: number
  height: number
  color: string | null
  alt_description: string | null
  urls: { raw: string; small: string; regular: string }
  links: { html: string; download_location: string }
  user: { name: string; username: string; links: { html: string } }
}

export function toPhoto(p: ApiPhoto): Photo {
  return {
    id: p.id,
    width: p.width,
    height: p.height,
    color: p.color ?? '#888888',
    alt: p.alt_description,
    urls: { raw: p.urls.raw, small: p.urls.small, regular: p.urls.regular },
    downloadLocation: p.links.download_location,
    photographer: {
      name: p.user.name,
      username: p.user.username,
      profileUrl: withUtm(p.user.links.html),
    },
    photoPageUrl: withUtm(p.links.html),
  }
}

// 남은 호출 수. 화면 구석에 보여줘서 데모 한도(시간당 50회)를 확인한다.
let remaining: number | null = null
const listeners = new Set<(n: number | null) => void>()
export const onRateLimit = (fn: (n: number | null) => void) => {
  listeners.add(fn)
  fn(remaining)
  return () => listeners.delete(fn)
}

async function request<T>(path: string, params: Record<string, string | undefined> = {}): Promise<T> {
  if (!ACCESS_KEY) throw new UnsplashError('Unsplash Access Key가 설정되지 않았어요. .env.local을 확인해 주세요.', 0)
  const url = new URL(path.startsWith('http') ? path : API + path)
  for (const [k, v] of Object.entries(params)) if (v) url.searchParams.set(k, v)
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${ACCESS_KEY}`, 'Accept-Version': 'v1' } })
  const left = res.headers.get('X-Ratelimit-Remaining')
  if (left !== null) {
    remaining = Number(left)
    listeners.forEach((fn) => fn(remaining))
  }
  if (res.status === 403 && left === '0') throw new UnsplashError('시간당 호출 한도를 다 썼어요. 잠시 후 다시 시도해 주세요.', 403)
  if (res.status === 401) throw new UnsplashError('Access Key가 올바르지 않아요.', 401)
  if (!res.ok) throw new UnsplashError(`Unsplash 요청이 실패했어요 (${res.status}).`, res.status)
  return res.json() as Promise<T>
}

export type SearchOptions = { orientation?: 'portrait' | 'squarish'; color?: string }
export type SearchResult = { results: Photo[]; totalPages: number }

export async function searchPhotos(query: string, page: number, opts: SearchOptions = {}): Promise<SearchResult> {
  const cacheId = JSON.stringify([query.trim().toLowerCase(), page, opts.orientation ?? '', opts.color ?? ''])
  const cached = readCache<SearchResult>(cacheId)
  if (cached) return cached
  const data = await request<{ results: ApiPhoto[]; total_pages: number }>('/search/photos', {
    query,
    page: String(page),
    per_page: '20',
    orientation: opts.orientation,
    color: opts.color,
    content_filter: 'high',
  })
  const result = { results: data.results.map(toPhoto), totalPages: data.total_pages }
  writeCache(cacheId, result)
  return result
}

export async function getRandomPhoto(query: string, opts: SearchOptions = {}): Promise<Photo> {
  const data = await request<ApiPhoto>('/photos/random', {
    query,
    orientation: opts.orientation,
    content_filter: 'high',
  })
  return toPhoto(data)
}

// Unsplash 가이드라인: 사용자가 사진을 내려받을 때마다 download_location을 호출한다.
// 실패해도 사용자의 다운로드는 막지 않는다.
export async function trackDownload(photo: Photo): Promise<void> {
  try {
    await request(photo.downloadLocation)
  } catch (e) {
    console.warn('Unsplash 다운로드 트리거 호출 실패', e)
  }
}

// 카드 크기에 맞춰 imgix 파라미터로 잘라 받은 이미지 주소. ixid 등 기존 파라미터는 유지한다.
export function sizedUrl(raw: string, width: number, height: number): string {
  const u = new URL(raw)
  u.searchParams.set('w', String(width))
  u.searchParams.set('h', String(height))
  u.searchParams.set('fit', 'crop')
  u.searchParams.set('crop', 'entropy')
  u.searchParams.set('fm', 'jpg')
  u.searchParams.set('q', '85')
  return u.toString()
}
