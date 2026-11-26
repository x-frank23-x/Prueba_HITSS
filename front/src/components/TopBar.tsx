import { BarChart3, BellRing, Plus, RefreshCw, Search, Upload, User } from 'lucide-react'
import clsx from 'clsx'

const circle = 'grid size-10 place-items-center rounded-full bg-panel-2 text-white transition hover:bg-line'

export type EstadoConexion = 'demo' | 'checking' | 'online' | 'offline'

const ESTADO = {
  demo: { dot: 'bg-accent', text: 'Modo demo (datos simulados)' },
  checking: { dot: 'bg-warn animate-pulse', text: 'Conectando…' },
  online: { dot: 'bg-ok', text: 'API conectada' },
  offline: { dot: 'bg-crit', text: 'Sin conexión con el backend' },
} as const

interface Props {
  busqueda: string
  onBusqueda: (v: string) => void
  fetching: boolean
  estado: EstadoConexion
  latencia: number | null
  onRefresh: () => void
  onCrear: () => void
  onImportar: () => void
  onResumen: () => void
}

export function TopBar({ busqueda, onBusqueda, fetching, estado, latencia, onRefresh, onCrear, onImportar, onResumen }: Props) {
  const e = ESTADO[estado]
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-panel/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="relative grid size-10 place-items-center rounded-full bg-gradient-to-br from-brand to-accent text-ink">
            <BellRing size={20} aria-hidden />
            <span className={clsx('absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-panel sm:hidden', e.dot)} aria-hidden />
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="font-semibold">Monitor de Alarmas</p>
            <button onClick={onRefresh} title="Probar conexión" className="flex items-center gap-1.5 text-[11px] text-muted hover:text-white" role="status">
              <span className={clsx('size-2 rounded-full', e.dot)} aria-hidden />
              {e.text}{estado === 'online' && latencia != null ? ` · ${latencia} ms` : ''}
            </button>
          </div>
        </div>

        <label className="relative ml-1 max-w-sm flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <input value={busqueda} onChange={(ev) => onBusqueda(ev.target.value)} placeholder="Buscar en los resultados…" aria-label="Buscar en los resultados"
            className="w-full rounded-full bg-panel-2 py-2.5 pl-10 pr-4 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/60" />
        </label>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={onCrear} aria-label="Crear alarma" title="Crear alarma" className={circle}><Plus size={19} /></button>
          <button onClick={onImportar} aria-label="Importar CSV" title="Importar CSV" className={circle}><Upload size={18} /></button>
          <button onClick={onResumen} aria-label="Resumen del día" title="Resumen del día" className={circle}><BarChart3 size={18} /></button>
          <button onClick={onRefresh} aria-label="Actualizar" title="Actualizar" className={circle}><RefreshCw size={17} className={fetching ? 'animate-spin' : ''} /></button>
          <div className="ml-1 hidden size-10 place-items-center rounded-full bg-brand/25 text-brand sm:grid" aria-hidden><User size={19} /></div>
        </div>
      </div>
    </header>
  )
}
