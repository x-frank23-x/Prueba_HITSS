import axios from 'axios'
import type { Alarma, Nivel, NuevaAlarma, ResultadoImportacion, ResumenDia } from '../types'
import { mockApi } from './mock'

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const http = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30_000,
})

export function errorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    if (!e.response) return `Sin respuesta de ${API_URL}. ¿Está corriendo el backend y tiene CORS habilitado para este origen?`
    const d = e.response?.data?.detail
    // FastAPI devuelve `detail` como string (HTTPException) o como lista (errores de validación 422)
    if (Array.isArray(d)) return d.map((x) => `${(x.loc ?? []).slice(1).join('.')}: ${x.msg}`).join(' · ')
    return d ?? e.response?.data?.message ?? e.message
  }
  return e instanceof Error ? e.message : 'Error desconocido'
}

/** Tolera "CRÍTICO", "CRITICAL", "critico", etc. */
function nivel(v: unknown): Nivel {
  const s = String(v ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase()
  if (s.startsWith('CRIT')) return 'CRITICO'
  if (s.startsWith('WARN')) return 'WARN'
  return 'NORMAL'
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const pick = (o: any, keys: string[]) => keys.map((k) => o?.[k]).find((v) => v !== undefined && v !== null)

/** Acepta varias formas de DailySummaryResponse: lista de {hora,total}, o mapa {"08:00": 2}. */
function normalizeResumen(raw: any): ResumenDia {
  let src: any = Array.isArray(raw)
    ? raw
    : pick(raw, ['perHour', 'por_hora', 'porHora', 'byHour', 'by_hour', 'hours', 'hourly', 'groups', 'items', 'data', 'summary'])
  if (src && !Array.isArray(src) && typeof src === 'object') src = Object.entries(src).map(([hora, total]) => ({ hora, total }))
  const por_hora = ((src ?? []) as any[])
    .map((x) => ({
      hora: parseInt(String(pick(x, ['hora', 'hour', 'range', 'slot', 'franja', 'label', 'time'])), 10),
      total: Number(pick(x, ['amount', 'total', 'count', 'cantidad', 'alarms', 'totalAlarms', 'total_alarms']) ?? 0),
    }))
    .filter((x) => x.hora >= 0 && x.hora <= 23)
  return {
    fecha: String(pick(raw, ['fecha', 'date', 'day']) ?? new Date().toISOString().slice(0, 10)),
    total: Number(pick(raw, ['totalDay', 'total', 'totalAlarms', 'total_alarms', 'count']) ?? por_hora.reduce((s, x) => s + x.total, 0)),
    por_hora,
  }
}

// Las rutas del router FastAPI llevan barra final ("/api/alarms/"): sin ella FastAPI responde 307 y el navegador puede romper CORS.
export const api = {
  /** GET /api/alarms/ (el backend solo filtra por `criticality`; el resto de consultas se hace en el cliente) */
  listarAlarmas: async (): Promise<Alarma[]> => {
    if (USE_MOCK) return mockApi.listar()
    const { data } = await http.get<any[]>('/alarms/')
    return data.map((a) => ({ ...a, critical: nivel(a.critical) }))
  },

  /** POST /api/alarms/ (JSON) */
  crearAlarma: async (n: NuevaAlarma): Promise<Alarma> => {
    if (USE_MOCK) return mockApi.crear(n)
    const { data } = await http.post<Alarma>('/alarms/', n)
    return { ...data, critical: nivel(data.critical) }
  },

  /** POST /api/alarms/import (multipart, campo "file", solo .csv). Reemplaza todas las alarmas. */
  importarCsv: async (file: File): Promise<ResultadoImportacion> => {
    if (USE_MOCK) return mockApi.importar(file)
    const body = new FormData()
    body.append('file', file)
    const { data } = await http.post('/alarms/import', body)
    return { fileName: data.fileName ?? file.name, totalProcessed: data.totalProcessed ?? data.items?.length ?? 0 }
  },

  /** GET /api/alarms/summary/today */
  resumenDia: async (): Promise<ResumenDia> =>
    USE_MOCK ? mockApi.resumen() : normalizeResumen((await http.get('/alarms/summary/today')).data),
}
