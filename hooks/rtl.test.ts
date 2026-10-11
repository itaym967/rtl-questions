import { test, expect } from 'claude-code/testing'
import { restoreLabels, rtl, rtlQuestions } from './rtl'

test('pure Hebrew: trailing punctuation moves to the front', () => {
  expect(rtl('איזה מסלול?')).toBe('?איזה מסלול')
})

test('Hebrew with an English word: runs reversed', () => {
  expect(rtl('מה עם Claude באמצע?')).toBe('?באמצע Claude מה עם')
})

test('digits travel with the letters beside them', () => {
  // Digits touching Hebrew stay in the Hebrew run, which the box lays out itself.
  expect(rtl('יש 3 קבצים')).toBe('יש 3 קבצים')
  expect(rtl('גרסה v2 חדשה')).toBe('חדשה v2 גרסה')
  expect(rtl('לבדוק את 8 הבדיקות.')).toBe('.לבדוק את 8 הבדיקות')
})

test('English text is left alone', () => {
  expect(rtl('Which path?')).toBe('Which path?')
  expect(rtl(undefined)).toBe(undefined)
})

test('labels map back to the original for the answer', () => {
  const labels = new Map<string, string>()
  const [q] = rtlQuestions(
    [{ question: 'מה?', header: 'בדיקה', multiSelect: false, options: [{ label: 'כן עם API', description: 'x', preview: 'code' }] }],
    labels,
  ) as any[]
  expect(q.options[0].label).toBe('API כן עם')
  expect(q.options[0].preview).toBe('code')
  expect(restoreLabels('"answer":"API כן עם"', labels)).toBe('"answer":"כן עם API"')
})
