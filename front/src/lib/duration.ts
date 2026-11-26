/** Segundos transcurridos al momento en que el backend respondió (a partir de timeText / timeHours). */
export function baseSeconds(a: { timeText?: string; timeHours?: number }): number {
  const m = a.timeText?.match(/(\d+)\s*h\s*(\d+)\s*m/i)
  if (m) return Number(m[1]) * 3600 + Number(m[2]) * 60
  return (a.timeHours ?? 0) * 3600
}

/** Segundos transcurridos desde dateCreate hasta "now". timeText/timeHours en BD se calculan al guardar y quedan viejos. */
export function secondsSince(a: { dateCreate: string; timeText?: string; timeHours?: number }, now: number): number {
  const t = Date.parse(a.dateCreate)
  return Number.isNaN(t) ? baseSeconds(a) : Math.max(0, (now - t) / 1000)
}

export function formatHM(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
}

/** Duración con segundos, p. ej. "1130h 45m 07s" (minutos y segundos a 2 dígitos para que no "baile" el ancho). */
export function formatHMS(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const p = (n: number) => String(n).padStart(2, '0')
  return `${Math.floor(s / 3600)}h ${p(Math.floor((s % 3600) / 60))}m ${p(s % 60)}s`
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'medium', hour12: false })
}
