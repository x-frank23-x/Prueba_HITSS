import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, Inbox, Loader2, Plus, RefreshCw, Upload, WifiOff } from 'lucide-react'
import { api, API_URL, errorMessage, USE_MOCK } from './lib/api'
import { aplicarConsulta } from './lib/consulta'
import type { Consulta, FiltroNivel } from './types'
import { TopBar, type EstadoConexion } from './components/TopBar'
import { Sidebar } from './components/Sidebar'
import { Composer } from './components/Composer'
import { QueryForm } from './components/QueryForm'
import { AlarmTable } from './components/AlarmTable'
import { CreateAlarmModal } from './components/CreateAlarmModal'
import { ImportModal } from './components/ImportModal'
import { SummaryModal } from './components/SummaryModal'

type Panel = 'crear' | 'importar' | 'resumen' | null

function useNow(ms: number) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(id)
  }, [ms])
  return now
}

export default function App() {
  const [filtro, setFiltro] = useState<FiltroNivel>('TODOS')
  const [consulta, setConsulta] = useState<Consulta>({})
  const [busqueda, setBusqueda] = useState('')
  const [panel, setPanel] = useState<Panel>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [latencia, setLatencia] = useState<number | null>(null)
  const now = useNow(1_000) // 1 s: la duración acumulada muestra segundos

  const { data: todas = [], isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['alarmas'],
    queryFn: async () => {
      const t = performance.now()
      const r = await api.listarAlarmas()
      setLatencia(Math.round(performance.now() - t))
      return r
    },
    refetchInterval: 60_000,
  })
  const estado: EstadoConexion = USE_MOCK ? 'demo' : error ? 'offline' : isLoading ? 'checking' : 'online'
  const data = useMemo(() => aplicarConsulta(todas, consulta), [todas, consulta])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const cerrar = useCallback(() => setPanel(null), [])
  const abrir = (p: Panel) => () => setPanel(p)

  return (
    <>
      <TopBar busqueda={busqueda} onBusqueda={setBusqueda} fetching={isFetching} estado={estado} latencia={latencia} onRefresh={() => refetch()} onCrear={abrir('crear')} onImportar={abrir('importar')} onResumen={abrir('resumen')} />

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Sidebar data={data} value={filtro} onChange={setFiltro} onCrear={abrir('crear')} onImportar={abrir('importar')} onResumen={abrir('resumen')} />

        <main className="min-w-0 space-y-4">
          <Composer onCrear={abrir('crear')} onImportar={abrir('importar')} onResumen={abrir('resumen')} />
          <QueryForm onSearch={setConsulta} />
          {isLoading ? (
            <div className="grid h-48 place-items-center rounded-2xl border border-line bg-panel text-muted"><Loader2 className="animate-spin" /></div>
          ) : error ? (
            <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-crit/40 bg-crit/10 p-8 text-center">
              <WifiOff size={30} className="text-crit" aria-hidden />
              <p className="font-semibold text-crit">No se pudieron cargar las alarmas</p>
              <p className="max-w-md text-sm text-muted">{errorMessage(error)}</p>
              <p className="font-mono text-xs text-muted">GET {API_URL}/api/alarms/</p>
              <button onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-full bg-panel-2 px-5 py-2 text-sm font-medium hover:bg-line"><RefreshCw size={15} /> Reintentar</button>
            </div>
          ) : todas.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-panel p-10 text-center">
              <div className="grid size-14 place-items-center rounded-full bg-brand/20 text-brand"><Inbox size={26} aria-hidden /></div>
              <p className="text-lg font-semibold">Aún no hay alarmas</p>
              <p className="max-w-sm text-sm text-muted">El inventario está vacío. Importa un CSV o crea la primera alarma para empezar.</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button onClick={abrir('importar')} className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:brightness-110"><Upload size={15} /> Importar CSV</button>
                <button onClick={abrir('crear')} className="inline-flex items-center gap-2 rounded-full bg-panel-2 px-5 py-2 text-sm font-medium hover:bg-line"><Plus size={15} /> Crear alarma</button>
              </div>
            </div>
          ) : (
            <AlarmTable data={data} filtro={filtro} busqueda={busqueda} now={now} />
          )}
        </main>
      </div>

      <CreateAlarmModal open={panel === 'crear'} onClose={cerrar} onDone={setToast} />
      <ImportModal open={panel === 'importar'} onClose={cerrar} onDone={setToast} />
      <SummaryModal open={panel === 'resumen'} onClose={cerrar} />

      <AnimatePresence>
        {toast && (
          <motion.div role="status" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="fixed bottom-5 left-5 z-60 flex items-center gap-2 rounded-xl border border-line bg-panel-2 px-4 py-3 text-sm shadow-xl">
            <CheckCircle2 size={18} className="text-ok" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
