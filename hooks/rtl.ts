// The desktop draws the dialog in a left-to-right box and drops bidi control
// characters, so a Hebrew line with an English word comes out in the wrong
// order. Reversing the order of the line's direction runs makes a
// left-to-right box show it as a right-to-left one would, with no marks at all.

type Kind = 'R' | 'L' | 'N'

const R_CHAR = /[\u0590-\u05FF\u0600-\u06FF\uFB1D-\uFDFF\uFE70-\uFEFF]/
const L_CHAR = /[\p{L}\p{N}]/u
const MIRROR: Record<string, string> = { '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<' }

const kindOf = (c: string): Kind => (R_CHAR.test(c) ? 'R' : L_CHAR.test(c) ? 'L' : 'N')

export const hasRtl = (text: unknown): text is string => typeof text === 'string' && R_CHAR.test(text)

const visualLine = (line: string): string => {
  const chars = [...line]
  // Maximal runs of one kind.
  const runs: { kind: Kind; text: string }[] = []
  for (const c of chars) {
    const k = kindOf(c)
    const last = runs[runs.length - 1]
    if (last && last.kind === k) last.text += c
    else runs.push({ kind: k, text: c })
  }
  // A neutral gap between two runs of the same direction belongs to them.
  const merged: { kind: Kind; text: string }[] = []
  for (let i = 0; i < runs.length; i++) {
    const run = runs[i]!
    const prev = merged[merged.length - 1]
    const next = runs[i + 1]
    if (run.kind === 'N' && prev && next && prev.kind === next.kind) {
      prev.text += run.text + next.text
      i++
    } else if (prev && prev.kind === run.kind) prev.text += run.text
    else merged.push({ ...run })
  }
  // Runs right to left; a gap's own characters reversed and mirrored.
  return merged
    .reverse()
    .map(r => (r.kind === 'N' ? [...r.text].reverse().map(c => MIRROR[c] ?? c).join('') : r.text))
    .join('')
}

export const rtl = (text: unknown): unknown =>
  hasRtl(text) ? text.split('\n').map(visualLine).join('\n') : text

type Option = { label?: unknown; description?: unknown; [k: string]: unknown }
type Question = { question?: unknown; header?: unknown; options?: Option[]; [k: string]: unknown }

// Rewrites the questions for drawing; `labels` collects drawn label -> original.
export const rtlQuestions = (questions: unknown[], labels?: Map<string, string>): unknown[] =>
  questions.map(q => {
    const { question, header, options, ...rest } = q as Question
    return {
      ...rest,
      question: rtl(question),
      header: rtl(header),
      ...(Array.isArray(options) && {
        options: options.map(o => {
          const label = rtl(o.label)
          if (labels && typeof label === 'string' && label !== o.label) labels.set(label, o.label as string)
          return { ...o, label, description: rtl(o.description) }
        }),
      }),
    }
  })

// Puts the original labels back into the answer text.
export const restoreLabels = (text: string, labels: Map<string, string>): string => {
  let out = text
  for (const [drawn, original] of labels) out = out.split(drawn).join(original)
  return out
}
