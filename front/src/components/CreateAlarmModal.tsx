import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus } from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import { Modal } from './Modal'
import { Field, inputCls } from './Field'

const num = (label: string) => z.number({ error: `${label} requerido` }).int('Debe ser entero')
const tech = z.number({ error: 'Requerido' }).int('Entero').min(-1, 'Mín. -1').max(100, 'Máx. 100')

const schema = z.object({
  idAlarm: num('ID').positive('Debe ser positivo'),
  tec2g: tech, tec3g: tech, tec4g: tech,
  dateCreate: z.string().min(1, 'Requerida').refine((v) => new Date(v) <= new Date(), 'No puede ser futura'),
  muni: z.string().trim().min(2, 'Requerido'),
  depa: z.string().trim().min(2, 'Requerido'),
  noti: z.enum(['N', 'S']),
})
type Values = z.infer<typeof schema>

const ahora = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export function CreateAlarmModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (msg: string) => void }) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { noti: 'N', dateCreate: ahora() },
  })

  const m = useMutation({
    mutationFn: (v: Values) => api.crearAlarma({ ...v, dateCreate: v.dateCreate.length === 16 ? `${v.dateCreate}:00` : v.dateCreate }),
    onSuccess: (_r, v) => {
      qc.invalidateQueries({ queryKey: ['alarmas'] })
      qc.invalidateQueries({ queryKey: ['resumen'] })
      reset({ noti: 'N', dateCreate: ahora() })
      onDone(`Alarma ${v.idAlarm} creada`)
      onClose()
    },
  })

  const n = { valueAsNumber: true } as const
  return (
    <Modal open={open} onClose={onClose} title="Crear alarma" subtitle="Se enviará al backend como JSON">
      <form onSubmit={handleSubmit((v) => m.mutate(v))} className="space-y-4" noValidate>
        <Field label="ID de alarma" error={errors.idAlarm?.message}><input type="number" {...register('idAlarm', n)} placeholder="4659944" className={inputCls} /></Field>
        <div>
          <p className="mb-1 text-xs font-medium text-muted">Capacidad por tecnología (-1 = no disponible)</p>
          <div className="grid grid-cols-3 gap-3">
            {(['tec2g', 'tec3g', 'tec4g'] as const).map((k) => (
              <Field key={k} label={k.slice(3).toUpperCase()} error={errors[k]?.message}><input type="number" {...register(k, n)} placeholder="0-100" className={inputCls} /></Field>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Municipio" error={errors.muni?.message}><input {...register('muni')} placeholder="Cabuyaro" className={inputCls} /></Field>
          <Field label="Departamento" error={errors.depa?.message}><input {...register('depa')} placeholder="Meta" className={inputCls} /></Field>
          <Field label="Fecha de creación" error={errors.dateCreate?.message}><input type="datetime-local" {...register('dateCreate')} className={inputCls} /></Field>
          <Field label="Notificada"><select {...register('noti')} className={inputCls}><option value="N">No (N)</option><option value="S">Sí (S)</option></select></Field>
        </div>
        {m.error && <p role="alert" className="rounded-lg bg-crit/10 px-3 py-2 text-sm text-crit">{errorMessage(m.error)}</p>}
        <button type="submit" disabled={m.isPending} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50">
          {m.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Crear alarma
        </button>
      </form>
    </Modal>
  )
}
