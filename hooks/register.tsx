import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'
import type { PlanView } from '../types'
import { planLines } from './plan'
import { restoreLabels, rtlQuestions } from './rtl'

const PANE = 'rtl-plan'
const TITLE = 'תוכנית לאישור'
const plan = atom({ plugin: 'rtl-questions', key: 'plan' } as const, {})

export const register: Register = on => {
  const labels = new Map<string, string>()

  // The desktop box is left-to-right and ignores bidi marks: reorder for it.
  // The terminal has no bidi of its own, so it is left as it is.
  on('ui.render', { component: 'AskUserQuestion' }, ($, e, next) => {
    if (e.surface !== 'desktop') return next(e)
    return next({ ...e, props: { ...e.props, questions: rtlQuestions(e.props.questions, labels) } })
  }).catch(($, e, next) => next(e))

  // A chosen label comes back drawn; hand the model the original one.
  on('tool.call', { tool: 'AskUserQuestion' }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny !== undefined || labels.size === 0) return ran
    const json = JSON.stringify(ran)
    const clean = restoreLabels(json, labels)
    labels.clear()
    return clean === json ? ran : JSON.parse(clean)
  }).catch(($, e, next) => next(e))

  // The plan-mode reminder names the file the plan is written to.
  on('prompt.attachment', { type: 'plan_mode' }, async ($, e, next) => {
    const path = e.detail?.planFilePath
    if (path) await update($, plan, p => ({ ...p, path }))
    return next(e)
  }).catch(($, e, next) => next(e))

  const loadPlan = async (readFile: (path: string) => Promise<string>, path: string | undefined): Promise<PlanView> => {
    if (!path) return { error: 'לא ידוע איפה נשמרה התוכנית.' }
    return readFile(path).then(
      text => ({ path, text }),
      () => ({ path, error: `לא נמצא קובץ התוכנית: ${path}` }),
    )
  }

  // The approval dialog is the engine's alone: show the plan beside it.
  on('tool.call', { tool: 'ExitPlanMode' }, async ($, e, next) => {
    const given = (e as { plan?: unknown }).plan
    const { path } = await read($, plan)
    const view = typeof given === 'string' && given.trim() ? { path, text: given } : await loadPlan(p => $.fs.read(p), path)
    await update($, plan, () => view)
    await $.ui.open({ id: PANE, title: TITLE })
    try {
      return await next(e)
    } finally {
      await $.ui.close({ id: PANE })
    }
  }).catch(($, e, next) => next(e))

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'rtl-plan', description: 'הצג את התוכנית האחרונה מימין לשמאל' })
    return next(e)
  })

  on('command.run', { command: 'rtl-plan' }, async $ => {
    const { path } = await read($, plan)
    const view = await loadPlan(p => $.fs.read(p), path)
    await update($, plan, () => view)
    await $.ui.open({ id: PANE, title: TITLE })
    return { text: 'התוכנית נפתחה בחלונית.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const view = await read($, plan)
    const isDesktop = e.surface === 'desktop'
    const width = Math.max(20, (e.viewport?.columns ?? 70) - 4)
    if (!view.text) return <Text dimColor>{view.error ?? 'אין עדיין תוכנית להצגה.'}</Text>
    return (
      // Full width, so there is room to push each line to the right edge.
      <Box flexDirection="column" width="100%" alignItems={isDesktop ? 'flex-end' : 'flex-start'}>
        {planLines(view.text, width, isDesktop).map(line => (
          <Box
            flexDirection="row"
            width="100%"
            alignSelf={line.isCode ? 'flex-start' : 'auto'}
            justifyContent={isDesktop && !line.isCode ? 'flex-end' : 'flex-start'}
          >
            <Text bold={line.isHeading} dimColor={line.isCode}>{line.text || ' '}</Text>
          </Box>
        ))}
      </Box>
    )
  })
}
