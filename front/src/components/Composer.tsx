import { BarChart3, Plus, Upload, User } from 'lucide-react'

interface Props { onCrear: () => void; onImportar: () => void; onResumen: () => void }

/** Tarjeta tipo “¿Qué estás pensando?” de Facebook. */
export function Composer({ onCrear, onImportar, onResumen }: Props) {
  const acciones = [
    { label: 'Crear alarma', icon: Plus, color: 'text-brand', fn: onCrear },
    { label: 'Importar CSV', icon: Upload, color: 'text-accent', fn: onImportar },
    { label: 'Resumen del día', icon: BarChart3, color: 'text-accent', fn: onResumen },
  ]
  return (
    <section className="rounded-2xl border border-line bg-panel p-4">
      <div className="flex items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-brand/25 text-brand" aria-hidden><User size={19} /></div>
        <button onClick={onCrear} className="flex-1 rounded-full bg-panel-2 px-4 py-2.5 text-left text-sm text-muted transition hover:bg-line">¿Qué alarma quieres registrar?</button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1 border-t border-line pt-2">
        {acciones.map((a) => (
          <button key={a.label} onClick={a.fn} className="flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-muted transition hover:bg-panel-2 hover:text-white">
            <a.icon size={18} className={a.color} aria-hidden /> <span className="hidden sm:inline">{a.label}</span><span className="sm:hidden">{a.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
