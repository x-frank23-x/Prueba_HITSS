export type Nivel = 'WARN' | 'CRITICO' | 'NORMAL'
export type FiltroNivel = 'TODOS' | Nivel

/** Alarma tal como la devuelve GET /api/alarmas */
export interface Alarma {
  id: number
  idAlarm: number
  tec2g: number
  tec3g: number
  tec4g: number
  dateCreate: string // ISO sin zona, p. ej. 2026-10-09T22:12:56
  muni: string
  depa: string
  noti: string // 'N' | 'S'
  timeHours: number
  timeText: string // p. ej. "1130h 45m"
  critical: Nivel
}

/** Cuerpo de POST /api/alarmas */
export interface NuevaAlarma {
  idAlarm: number
  tec2g: number
  tec3g: number
  tec4g: number
  dateCreate: string
  muni: string
  depa: string
  noti: 'N' | 'S'
}

/** Parámetros de consulta de GET /api/alarmas */
export interface Consulta {
  idAlarm?: number
  muni?: string
  depa?: string
  noti?: 'N' | 'S'
  desde?: string // YYYY-MM-DD
  hasta?: string // YYYY-MM-DD
}

export interface ResumenDia {
  fecha: string
  total: number
  por_hora: { hora: number; total: number }[]
}

/** Respuesta de POST /api/alarms/import */
export interface ResultadoImportacion {
  fileName: string
  totalProcessed: number
}
