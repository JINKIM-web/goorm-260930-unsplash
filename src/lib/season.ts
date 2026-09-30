import type { Season } from '../types'

export const SEASONS: { key: Season; label: string; query: string }[] = [
  { key: 'spring', label: '봄', query: 'spring blossom' },
  { key: 'summer', label: '여름', query: 'summer sea' },
  { key: 'autumn', label: '가을', query: 'autumn leaves' },
  { key: 'winter', label: '겨울', query: 'winter snow' },
]

export function currentSeason(date = new Date()): Season {
  const m = date.getMonth() + 1
  if (m >= 3 && m <= 5) return 'spring'
  if (m >= 6 && m <= 8) return 'summer'
  if (m >= 9 && m <= 11) return 'autumn'
  return 'winter'
}
