import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eraser, Search } from 'lucide-react'
import type { Consulta } from '../types'
import { Field, inputCls } from './Field'

const schema = z
  .object({
    idAlarm: z.string().regex(/^\d*$/, 'Solo números'),
    muni: z.string(),
    depa: z.string(),
    noti: z.enum(['', 'N', 'S']),
    desde: z.string(),
    hasta: z.string(),
  })
  .refine((v) => !v.desde || !v.hasta || v.hasta >= v.desde, { path: ['hasta'], message: 'Debe ser posterior a "Desde"' })
type Values = z.infer<typeof schema>
const VACIO: Values = { idAlarm: '', muni: '', depa: '', noti: '', desde: '', hasta: '' }

export function QueryForm({ onSearch }: { onSearch: (c: Consulta) => void }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: VACIO })

  const submit = (v: Values) =>
    onSearch({
      idAlarm: v.idAlarm ? Number(v.idAlarm) : undefined,
      muni: v.muni.trim() || undefined,
      depa: v.depa.trim() || undefined,
      noti: v.noti || undefined,
      desde: v.desde || undefined,
      hasta: v.hasta || undefined,
    })

  return (
    <form onSubmit={handleSubmit(submit)} className="rounded-2xl border border-line bg-panel p-4">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold"><Search size={17} className="text-accent" aria-hidden /> Consultar alarmas</h2>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        <Field label="ID de alarma" error={errors.idAlarm?.message}><input {...register('idAlarm')} inputMode="numeric" placeholder="4659944" className={inputCls} /></Field>
        <Field label="Municipio"><input {...register('muni')} placeholder="Cabuyaro" className={inputCls} /></Field>
        <Field label="Departamento"><input {...register('depa')} placeholder="Meta" className={inputCls} /></Field>
        <Field label="Notificada">
          <select {...register('noti')} className={inputCls}>
            <option value="">Todas</option><option value="N">No (N)</option><option value="S">Sí (S)</option>
          </select>
        </Field>
        <Field label="Creada desde"><input type="date" {...register('desde')} className={inputCls} /></Field>
        <Field label="Creada hasta" error={errors.hasta?.message}><input type="date" {...register('hasta')} className={inputCls} /></Field>
      </div>
      <div className="mt-4 flex gap-2">
        <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110"><Search size={15} /> Buscar</button>
        <button type="button" onClick={() => { reset(VACIO); onSearch({}) }} className="inline-flex items-center gap-2 rounded-full bg-panel-2 px-5 py-2 text-sm font-medium transition hover:bg-line"><Eraser size={15} /> Limpiar</button>
      </div>
    </form>
  )
}
