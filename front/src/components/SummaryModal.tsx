import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Loader2 } from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import { Modal } from './Modal'

const hh = (h: number) => `${String(h).padStart(2, '0')}:00`

export function SummaryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['resumen'], queryFn: api.resumenDia, enabled: open, staleTime: 0 })

  const serie = useMemo(() => {
    const m = new Map((data?.por_hora ?? []).map((x) => [x.hora, x.total]))
    return Array.from({ length: 24 }, (_, h) => ({ hora: hh(h), total: m.get(h) ?? 0 }))
  }, [data])
  const pico = serie.reduce((a, b) => (b.total > a.total ? b : a), serie[0])

  return (
    <Modal open={open} onClose={onClose} title="Resumen del día" subtitle={`${data?.fecha ?? 'Hoy'} · alarmas creadas por hora`} maxWidth="max-w-4xl">
      {isLoading && <div className="grid h-72 place-items-center text-muted"><Loader2 className="animate-spin" /></div>}
      {error && (
        <div className="py-8 text-center text-crit">
          <p>{errorMessage(error)}</p>
          <button onClick={() => refetch()} className="mt-3 rounded-full bg-panel-2 px-4 py-1.5 text-sm text-white hover:bg-line">Reintentar</button>
        </div>
      )}
      {data && (
        <div className="grid gap-5 md:grid-cols-[1fr_220px]">
          <div className="h-72 min-w-0" role="img" aria-label="Gráfico de barras de alarmas por hora">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serie} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#2b2b3a" vertical={false} />
                <XAxis dataKey="hora" tick={{ fill: '#9a9ab0', fontSize: 11 }} interval={2} tickLine={false} axisLine={{ stroke: '#2b2b3a' }} />
                <YAxis allowDecimals={false} tick={{ fill: '#9a9ab0', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(139,92,246,.12)' }} contentStyle={{ background: '#1c1c26', border: '1px solid #2b2b3a', borderRadius: 10, color: '#eceaf5' }} formatter={(v) => [v, 'Alarmas']} />
                <Bar dataKey="total" fill="#5ec8f2" radius={[5, 5, 0, 0]} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div className="rounded-xl bg-gradient-to-br from-brand/25 to-accent/10 p-4">
              <p className="text-xs text-muted">Total del día</p>
              <p className="text-4xl font-semibold tabular-nums">{data.total}</p>
              {data.total > 0 && <p className="mt-1 text-xs text-muted">Hora pico: {pico.hora} ({pico.total})</p>}
            </div>
            <ul className="scroll-thin mt-3 max-h-48 divide-y divide-line/60 overflow-y-auto pr-1 text-sm tabular-nums">
              {serie.filter((s) => s.total > 0).map((s) => (
                <li key={s.hora} className="flex justify-between py-1.5"><span className="text-muted">{s.hora}</span><span className="font-medium">{s.total}</span></li>
              ))}
              {data.total === 0 && <li className="py-2 text-muted">Sin alarmas creadas hoy.</li>}
            </ul>
          </div>
        </div>
      )}
    </Modal>
  )
}
