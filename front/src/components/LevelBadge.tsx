import { AlertOctagon, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { Nivel } from '../types'

export const NIVEL_META = {
  CRITICO: { label: 'CRÍTICO', short: 'Crítico', icon: AlertOctagon, text: 'text-crit', bg: 'bg-crit/15', ring: 'ring-crit/40', bar: 'border-l-crit', row: 'bg-crit/[0.07]' },
  WARN: { label: 'WARN', short: 'WARN', icon: AlertTriangle, text: 'text-warn', bg: 'bg-warn/15', ring: 'ring-warn/40', bar: 'border-l-warn', row: 'bg-warn/[0.06]' },
  NORMAL: { label: 'NORMAL', short: 'Normales', icon: CheckCircle2, text: 'text-muted', bg: 'bg-white/5', ring: 'ring-white/10', bar: 'border-l-transparent', row: '' },
} as const

export function LevelBadge({ nivel }: { nivel: Nivel }) {
  const m = NIVEL_META[nivel]
  const Icon = m.icon
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${m.text} ${m.bg} ${m.ring}`}>
      <Icon size={13} aria-hidden /> {m.label}
    </span>
  )
}
