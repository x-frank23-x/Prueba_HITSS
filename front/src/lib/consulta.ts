import type { Alarma, Consulta } from '../types'

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/** El backend solo filtra por criticidad, así que las consultas se aplican aquí sobre las alarmas cargadas. */
export function aplicarConsulta(data: Alarma[], q: Consulta): Alarma[] {
  return data.filter((a) => {
    const dia = String(a.dateCreate ?? '').slice(0, 10)
    return (
      (q.idAlarm == null || a.idAlarm === q.idAlarm) &&
      (!q.muni || norm(a.muni ?? '').includes(norm(q.muni))) &&
      (!q.depa || norm(a.depa ?? '').includes(norm(q.depa))) &&
      (!q.noti || String(a.noti).toUpperCase() === q.noti) &&
      (!q.desde || dia >= q.desde) &&
      (!q.hasta || dia <= q.hasta)
    )
  })
}
