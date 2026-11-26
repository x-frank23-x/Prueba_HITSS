import { motion } from 'motion/react'
import { BarChart3, Layers, Plus, Upload } from 'lucide-react'
import clsx from 'clsx'
import type { Alarma, FiltroNivel } from '../types'
import { NIVEL_META } from './LevelBadge'

const FILTROS: { id: FiltroNivel; label: string }[] = [
  { id: 'TODOS', label: 'Todos los registros' },
  { id: 'WARN', label: 'Solo WARN' },
  { id: 'CRITICO', label: 'Solo CRÍTICO' },
  { id: 'NORMAL', label: 'Solo normales' },
]

interface Props {
  data: Alarma[]
  value: FiltroNivel
  onChange: (f: FiltroNivel) => void
  onCrear: () => void
  onImportar: () => void
  onResumen: () => void
}

const count = (d: Alarma[], f: FiltroNivel) => (f === 'TODOS' ? d.length : d.filter((a) => a.critical === f).length)

function Chip({ children, tone }: { children: React.ReactNode; tone: string }) {
  return <span className={clsx('grid size-9 shrink-0 place-items-center rounded-full', tone)}>{children}</span>
}

export function Sidebar({ data, value, onChange, onCrear, onImportar, onResumen }: Props) {
  return (
    <>
      {/* móvil: pastillas horizontales */}
      <div role="radiogroup" aria-label="Filtrar por nivel" className="scroll-thin -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
        {FILTROS.map((f) => (
          <button key={f.id} role="radio" aria-checked={value === f.id} onClick={() => onChange(f.id)}
            className={clsx('shrink-0 rounded-full px-4 py-2 text-sm font-medium transition', value === f.id ? 'bg-brand text-white' : 'bg-panel text-muted')}>
            {f.label} <span className="ml-1 tabular-nums opacity-80">{count(data, f.id)}</span>
          </button>
        ))}
      </div>

      <aside className="sticky top-[76px] hidden space-y-4 self-start lg:block">
        <nav role="radiogroup" aria-label="Filtrar por nivel" className="rounded-2xl border border-line bg-panel p-2">
          <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted">Nivel de alerta</p>
          {FILTROS.map((f) => {
            const active = value === f.id
            const meta = f.id === 'TODOS' ? null : NIVEL_META[f.id]
            const Icon = meta?.icon ?? Layers
            return (
              <button key={f.id} role="radio" aria-checked={active} onClick={() => onChange(f.id)}
                className={clsx('relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors', active ? 'text-white' : 'text-muted hover:bg-panel-2')}>
                {active && <motion.span layoutId="filtro-sidebar" className="absolute inset-0 rounded-xl bg-brand/20" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                <Chip tone={clsx('relative', meta ? `${meta.bg} ${meta.text}` : 'bg-brand/25 text-brand')}><Icon size={17} aria-hidden /></Chip>
                <span className="relative flex-1">{f.label}</span>
                <span className="relative rounded-full bg-panel-2 px-2 py-0.5 text-xs tabular-nums">{count(data, f.id)}</span>
              </button>
            )
          })}
        </nav>

        <nav className="rounded-2xl border border-line bg-panel p-2">
          <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted">Accesos directos</p>
          {[
            { label: 'Crear alarma', icon: Plus, tone: 'bg-brand/25 text-brand', fn: onCrear },
            { label: 'Importar CSV', icon: Upload, tone: 'bg-accent/20 text-accent', fn: onImportar },
            { label: 'Resumen del día', icon: BarChart3, tone: 'bg-accent/20 text-accent', fn: onResumen },
          ].map((a) => (
            <button key={a.label} onClick={a.fn} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-muted transition-colors hover:bg-panel-2 hover:text-white">
              <Chip tone={a.tone}><a.icon size={17} aria-hidden /></Chip> {a.label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  )
}
