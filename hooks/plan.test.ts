import { test, expect } from 'claude-code/testing'
import { planLines } from './plan'

test('headings and bullets are reordered with the mark at the right end', () => {
  const lines = planLines('## שלב ראשון\n- להתקין את gh עכשיו\n1. לבדוק', 80, true)
  expect(lines[0]).toEqual({ text: 'שלב ראשון', isHeading: true, isCode: false })
  expect(lines[1]?.text).toBe('עכשיו gh להתקין את •')
  expect(lines[2]?.text).toBe('לבדוק .1')
})

test('code blocks are kept as written', () => {
  expect(planLines('```\nnpm test\n```', 80, true)).toEqual([{ text: 'npm test', isHeading: false, isCode: true }])
})

test('long lines wrap before they are reordered', () => {
  expect(planLines('אחת שתיים שלוש ארבע חמש', 12, true).map(l => l.text)).toEqual(['אחת שתיים', 'שלוש ארבע', 'חמש'])
})

test('the terminal gets the lines unreordered', () => {
  expect(planLines('- step with API', 80, false)[0]?.text).toBe('• step with API')
})
