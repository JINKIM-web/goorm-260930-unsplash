import type { Align, CardState, FontKey, Position, Ratio, SizeKey, TextColor } from '../types'
import { FONTS } from '../lib/renderCard'
import { useCardStore } from '../store/cardStore'

function Segmented<T extends string>(props: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm text-stone-600">{props.label}</legend>
      <div className="flex gap-1">
        {props.options.map((o) => (
          <button
            key={o.value}
            onClick={() => props.onChange(o.value)}
            aria-pressed={props.value === o.value}
            className={`flex-1 rounded-md px-2 py-1 text-sm ${
              props.value === o.value ? 'bg-stone-900 text-white' : 'bg-stone-200 hover:bg-stone-300'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function StylePanel() {
  const card = useCardStore((s) => s.card)
  const update = useCardStore((s) => s.updateCard)
  const set =
    <K extends keyof CardState>(key: K) =>
    (value: CardState[K]) =>
      update({ [key]: value } as Partial<CardState>)

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold">3. 꾸미기</h2>
      <Segmented<Ratio>
        label="비율"
        value={card.ratio}
        onChange={set('ratio')}
        options={[
          { value: '1:1', label: '1:1 정사각형' },
          { value: '4:5', label: '4:5 세로' },
        ]}
      />
      <label className="block">
        <span className="mb-1 block text-sm text-stone-600">폰트</span>
        <select
          value={card.font}
          onChange={(e) => set('font')(e.target.value as FontKey)}
          className="w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm"
        >
          {(Object.keys(FONTS) as FontKey[]).map((k) => (
            <option key={k} value={k} style={{ fontFamily: FONTS[k].family }}>
              {FONTS[k].label}
            </option>
          ))}
        </select>
      </label>
      <Segmented<SizeKey>
        label="글자 크기"
        value={card.size}
        onChange={set('size')}
        options={[
          { value: 'sm', label: '작게' },
          { value: 'md', label: '보통' },
          { value: 'lg', label: '크게' },
        ]}
      />
      <Segmented<Align>
        label="정렬"
        value={card.align}
        onChange={set('align')}
        options={[
          { value: 'left', label: '왼쪽' },
          { value: 'center', label: '가운데' },
          { value: 'right', label: '오른쪽' },
        ]}
      />
      <Segmented<Position>
        label="위치"
        value={card.position}
        onChange={set('position')}
        options={[
          { value: 'top', label: '위' },
          { value: 'middle', label: '가운데' },
          { value: 'bottom', label: '아래' },
        ]}
      />
      <Segmented<TextColor>
        label="글자색"
        value={card.textColor}
        onChange={set('textColor')}
        options={[
          { value: '#FFFFFF', label: '흰색' },
          { value: '#111111', label: '검정' },
        ]}
      />
      <label className="block">
        <span className="mb-1 block text-sm text-stone-600">
          배경 {card.textColor === '#111111' ? '밝게' : '어둡게'} {Math.round(card.dim * 100)}%
        </span>
        <input
          type="range"
          min={0}
          max={0.6}
          step={0.05}
          value={card.dim}
          onChange={(e) => set('dim')(Number(e.target.value))}
          className="w-full"
        />
      </label>
    </section>
  )
}
