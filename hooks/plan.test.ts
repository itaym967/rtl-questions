import { test, expect } from 'claude-code/testing'
import { planLines } from './plan'

test('headings and bullets: the mark is kept apart from the reordered text', () => {
  const lines = planLines('## שלב ראשון\n- להתקין את gh עכשיו\n1. לבדוק את 8 הבדיקות', 80, true)
  expect(lines[0]).toEqual({ text: 'שלב ראשון', mark: '', indent: 0, isHeading: true, isCode: false })
  expect(lines[1]).toMatchObject({ text: 'עכשיו gh להתקין את', mark: '•' })
  expect(lines[2]).toMatchObject({ text: 'לבדוק את 8 הבדיקות', mark: '.1' })
})

test('code blocks are kept as written', () => {
  expect(planLines('```\nnpm test\n```', 80, true)).toEqual([{ text: 'npm test', mark: '', indent: 0, isHeading: false, isCode: true }])
})

test('long lines wrap before they are reordered', () => {
  expect(planLines('אחת שתיים שלוש ארבע חמש', 12, true).map(l => l.text)).toEqual(['אחת שתיים', 'שלוש ארבע', 'חמש'])
})

test('the terminal gets the lines unreordered, mark inline', () => {
  expect(planLines('- step with API', 80, false)[0]).toMatchObject({ text: '• step with API', mark: '' })
})
