import type { Photo } from '../types'
import { UNSPLASH_HOME } from '../lib/unsplash'

// Unsplash 가이드라인: 사진이 보이는 곳마다 작가와 Unsplash를 링크와 함께 표기한다.
export function Attribution({ photo }: { photo: Photo }) {
  return (
    <p className="text-xs text-stone-600">
      Photo by{' '}
      <a href={photo.photographer.profileUrl} target="_blank" rel="noreferrer" className="underline">
        {photo.photographer.name}
      </a>{' '}
      on{' '}
      <a href={UNSPLASH_HOME()} target="_blank" rel="noreferrer" className="underline">
        Unsplash
      </a>
    </p>
  )
}
