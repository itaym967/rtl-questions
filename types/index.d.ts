export type PlanView = { path?: string; text?: string; error?: string }

declare module 'claude-code' {
  interface PluginState {
    'rtl-questions': { plan: PlanView }
  }
}
