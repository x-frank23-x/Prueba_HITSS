import { useMemo, useState } from 'react'
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender, type ColumnDef, type SortingState } from '@tanstack/react-table'
import { motion } from 'motion/react'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download, Inbox } from 'lucide-react'
import type { Alarma, FiltroNivel } from '../types'
import { formatDate, formatHMS, secondsSince } from '../lib/duration'
import { exportToExcel } from '../lib/exportExcel'
import { LevelBadge, NIVEL_META } from './LevelBadge'

interface Props { data: Alarma[]; filtro: FiltroNivel; busqueda: string; now: number }

const tec = (v: number) => (v < 0 ? <span className="text-muted/60" title="No disponible">N/D</span> : <span className={v === 100 ? 'font-semibold text-accent' : ''}>{v}</span>)

export function AlarmTable({ data, filtro, busqueda, now }: Props) {
  const [sorting, setSorting] = useState<SortingState>([])
  const filas = useMemo(() => (filtro === 'TODOS' ? data : data.filter((a) => a.critical === filtro)), [data, filtro])
  const dur = (a: Alarma) => secondsSince(a, now) // duración acumulada hasta ahora, desde dateCreate

  const columns = useMemo<ColumnDef<Alarma>[]>(() => [
    { id: 'critical', header: 'Nivel', accessorFn: (a) => a.critical, cell: (c) => <LevelBadge nivel={c.row.original.critical} /> },
    { id: 'idAlarm', header: 'ID alarma', accessorFn: (a) => a.idAlarm, cell: (c) => <span className="font-mono">{c.getValue<number>()}</span> },
    { id: 'tec2g', header: '2G', accessorFn: (a) => a.tec2g, cell: (c) => tec(c.getValue<number>()) },
    { id: 'tec3g', header: '3G', accessorFn: (a) => a.tec3g, cell: (c) => tec(c.getValue<number>()) },
    { id: 'tec4g', header: '4G', accessorFn: (a) => a.tec4g, cell: (c) => tec(c.getValue<number>()) },
    { id: 'muni', header: 'Municipio', accessorFn: (a) => a.muni },
    { id: 'depa', header: 'Departamento', accessorFn: (a) => a.depa },
    { id: 'noti', header: 'Notificada', accessorFn: (a) => a.noti },
    { id: 'dateCreate', header: 'Fecha creación', accessorFn: (a) => a.dateCreate, cell: (c) => formatDate(c.getValue<string>()) },
    { id: 'duracion', header: 'Duración acumulada', accessorFn: (a) => dur(a), cell: (c) => <span className="font-mono tabular-nums">{formatHMS(dur(c.row.original))}</span> },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [now])

  const table = useReactTable({
    data: filas,
    columns,
    state: { sorting, globalFilter: busqueda },
    onSortingChange: setSorting,
    globalFilterFn: 'includesString',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  })

  const visibles = table.getPrePaginationRowModel().rows.map((r) => r.original) // lo que el usuario ve: filtrado + búsqueda + orden
  const { pageIndex } = table.getState().pagination

  const exportar = () =>
    exportToExcel(
      ['Nivel', 'ID alarma', '2G', '3G', '4G', 'Municipio', 'Departamento', 'Notificada', 'Fecha creación', 'Duración acumulada'],
      visibles.map((a) => [a.critical, a.idAlarm, a.tec2g, a.tec3g, a.tec4g, a.muni, a.depa, a.noti, formatDate(a.dateCreate), formatHMS(dur(a))]),
      filtro,
    )

  return (
    <section className="rounded-2xl border border-line bg-panel">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <h2 className="text-base font-semibold">Alarmas</h2>
        <span className="rounded-full bg-panel-2 px-2.5 py-0.5 text-xs tabular-nums text-muted">{visibles.length} registros</span>
        <button onClick={exportar} disabled={!visibles.length} className="ml-auto inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/25 disabled:opacity-40">
          <Download size={16} aria-hidden /> Exportar a Excel
        </button>
      </div>

      <div className="scroll-thin overflow-x-auto border-t border-line">
        <table className="w-full border-collapse text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="text-left text-xs text-muted">
                {hg.headers.map((h) => {
                  const dir = h.column.getIsSorted()
                  return (
                    <th key={h.id} aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : 'none'} className="whitespace-nowrap border-b border-line px-4 py-2.5 font-semibold">
                      <button onClick={h.column.getToggleSortingHandler()} className="inline-flex items-center gap-1 hover:text-white">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {dir === 'asc' ? <ArrowUp size={12} /> : dir === 'desc' ? <ArrowDown size={12} /> : <ArrowUpDown size={12} className="opacity-40" />}
                      </button>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <motion.tbody key={`${filtro}-${pageIndex}-${busqueda}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}>
            {table.getRowModel().rows.map((r) => {
              const m = NIVEL_META[r.original.critical]
              return (
                <tr key={r.id} className={`border-b border-l-4 border-b-line/50 ${m.bar} ${m.row} transition-colors hover:bg-brand/[0.07]`}>
                  {r.getVisibleCells().map((c) => <td key={c.id} className="whitespace-nowrap px-4 py-2.5">{flexRender(c.column.columnDef.cell, c.getContext())}</td>)}
                </tr>
              )
            })}
          </motion.tbody>
        </table>
        {!visibles.length && (
          <div className="flex flex-col items-center gap-2 py-14 text-muted"><Inbox size={30} aria-hidden /><p>No hay alarmas para mostrar.</p></div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm text-muted">
        <span>Página {pageIndex + 1} de {Math.max(1, table.getPageCount())}</span>
        <div className="flex gap-2">
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Página anterior" className="grid size-8 place-items-center rounded-full bg-panel-2 hover:bg-line disabled:opacity-30"><ChevronLeft size={16} /></button>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Página siguiente" className="grid size-8 place-items-center rounded-full bg-panel-2 hover:bg-line disabled:opacity-30"><ChevronRight size={16} /></button>
        </div>
      </div>
    </section>
  )
}
