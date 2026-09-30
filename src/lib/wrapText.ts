// 캔버스는 자동 줄바꿈을 하지 않으므로 직접 나눈다.
// 한글은 어절(공백) 단위로 나누고, 한 어절이 한 줄보다 길면 글자 단위로 자른다.
export function wrapText(text: string, maxWidth: number, measure: (s: string) => number): string[] {
  const lines: string[] = []
  for (const paragraph of text.split('\n')) {
    const words = paragraph.split(/\s+/).filter(Boolean)
    let line = ''
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word
      if (measure(candidate) <= maxWidth) {
        line = candidate
        continue
      }
      if (line) lines.push(line)
      line = ''
      if (measure(word) <= maxWidth) {
        line = word
        continue
      }
      for (const ch of word) {
        if (measure(line + ch) > maxWidth && line) {
          lines.push(line)
          line = ''
        }
        line += ch
      }
    }
    lines.push(line)
  }
  return lines
}
