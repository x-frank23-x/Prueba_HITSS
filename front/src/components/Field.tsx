import type { ReactNode } from 'react'

export const inputCls =
  'w-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-white placeholder:text-muted/70 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
      {error ? <span role="alert" className="mt-1 block text-xs text-crit">{error}</span> : hint ? <span className="mt-1 block text-xs text-muted/70">{hint}</span> : null}
    </label>
  )
}
