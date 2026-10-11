import type { Register } from 'claude-code'
import { restoreLabels, rtlQuestions } from './rtl'

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
}
