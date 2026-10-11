import { rtl } from './rtl'

export type PlanLine = { text: string; isHeading: boolean; isCode: boolean }

const MARKER = /^(\s*)(#{1,6}\s+|[-*+]\s+|\d+[.)]\s+|>\s*)?(.*)$/

// Splits a line into chunks of at most `width` characters, at spaces.
const wrap = (line: string, width: number): string[] => {
  if (line.length <= width) return [line]
  const out: string[] = []
  let cur = ''
  for (const word of line.split(' ')) {
    if (cur && cur.length + 1 + word.length > width) {
      out.push(cur)
      cur = word
    } else cur = cur ? `${cur} ${word}` : word
  }
  if (cur) out.push(cur)
  return out
}

const plain = (s: string) => s.replace(/\*\*|__|`/g, '')

const bulletOf = (mark: string): string => {
  if (mark === '' || mark.startsWith('#')) return ''
  if (/^\d/.test(mark)) return mark.trim().replace(/[.)]$/, '.')
  return mark.startsWith('>') ? '│' : '•'
}

// The plan's markdown as lines for a left-to-right box: wrapped first (so the
// lines read top to bottom), then each reordered with its list or quote mark
// at the right end. Code blocks are left as written.
export const planLines = (markdown: string, width: number, reorder: boolean): PlanLine[] => {
  const out: PlanLine[] = []
  let isCode = false
  for (const raw of markdown.split(/\r?\n/)) {
    if (/^\s*```/.test(raw)) {
      isCode = !isCode
      continue
    }
    if (isCode) {
      out.push({ text: raw, isHeading: false, isCode: true })
      continue
    }
    const [, indent = '', mark = '', rest = ''] = raw.match(MARKER) ?? []
    const isHeading = mark.startsWith('#')
    const bullet = bulletOf(mark)
    // "1." reads ".1" in a right-to-left line.
    const shown = reorder && /^\d/.test(bullet) ? `.${bullet.slice(0, -1)}` : bullet
    const room = Math.max(10, width - indent.length - bullet.length - 1)
    const chunks = rest.trim() === '' ? [''] : wrap(plain(rest), room)
    chunks.forEach((chunk, i) => {
      const mk = bullet === '' ? '' : i === 0 ? shown : ' '.repeat(shown.length)
      const text = reorder
        ? [rtl(chunk) as string, mk].filter(Boolean).join(' ') + indent
        : indent + [mk, chunk].filter(Boolean).join(' ')
      out.push({ text, isHeading, isCode: false })
    })
  }
  return out
}
