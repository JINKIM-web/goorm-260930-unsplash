export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export type Photo = {
  id: string
  width: number
  height: number
  color: string
  alt: string | null
  urls: { raw: string; small: string; regular: string }
  downloadLocation: string
  photographer: {
    name: string
    username: string
    profileUrl: string
  }
  photoPageUrl: string
}

export type Quote = {
  id: string
  text: string
  author: string
  season: Season | 'any'
}

export type Ratio = '1:1' | '4:5'
export type FontKey = 'NotoSerifKR' | 'GowunBatang' | 'NanumMyeongjo' | 'NotoSansKR'
export type SizeKey = 'sm' | 'md' | 'lg'
export type Align = 'left' | 'center' | 'right'
export type Position = 'top' | 'middle' | 'bottom'
export type TextColor = '#FFFFFF' | '#111111'

export type CardState = {
  quote: { text: string; author: string }
  ratio: Ratio
  font: FontKey
  size: SizeKey
  align: Align
  position: Position
  textColor: TextColor
  dim: number
}

export type RecentCard = {
  id: string
  createdAt: number
  photo: Photo
  card: CardState
}
