// Backend simulado en el navegador (modo demo). Replica las reglas de negocio de la prueba.
import type { Alarma, Nivel, NuevaAlarma, ResultadoImportacion, ResumenDia } from '../types'

const pad = (n: number) => String(n).padStart(2, '0')
const toIso = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
const ymd = (d: Date) => toIso(d).slice(0, 10)

const LUGARES: [string, string][] = [
  ['Cabuyaro', 'Meta'], ['Betulia', 'Santander'], ['Salazar', 'N de Santander'], ['Usaquén', 'Bogotá D.C.'],
  ['Rionegro', 'Antioquia'], ['Jamundí', 'Valle del Cauca'], ['Chía', 'Cundinamarca'], ['Pasto', 'Nariño'],
]

function seed(): NuevaAlarma[] {
  let x = 7
  const rnd = () => ((x = (x * 1664525 + 1013904223) % 4294967296) / 4294967296)
  const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)]
  const now = Date.now()
  const inicioHoy = new Date().setHours(0, 0, 0, 0)
  const vals = [100, 100, 100, 100, -1, 85, 60, 0, 13, 37]
  return Array.from({ length: 70 }, (_, i) => {
    const t = i % 2 === 0 ? inicioHoy + rnd() * (now - inicioHoy) : now - rnd() * 70 * 3600_000
    const [muni, depa] = pick(LUGARES)
    return {
      idAlarm: 4659900 + i * 7,
      tec2g: pick(vals), tec3g: pick(vals), tec4g: pick(vals),
      dateCreate: toIso(new Date(t)),
      muni, depa,
      noti: rnd() > 0.25 ? 'N' : 'S',
    }
  })
}

// VITE_MOCK_EMPTY=true arranca el modo demo sin alarmas
let db: NuevaAlarma[] = import.meta.env.VITE_MOCK_EMPTY === 'true' ? [] : seed()

function parseDate(s: string): Date | null {
  const dmy = s.match(/^(\d{2})\/(\d{2})\/(\d{4})[ T](\d{2}):(\d{2})(?::(\d{2}))?/)
  if (dmy) return new Date(+dmy[3], +dmy[2] - 1, +dmy[1], +dmy[4], +dmy[5], +(dmy[6] ?? 0))
  const d = new Date(s.replace(' ', 'T'))
  return Number.isNaN(d.getTime()) ? null : d
}

function classify(a: NuevaAlarma, seconds: number): Nivel {
  const techs = [a.tec2g, a.tec3g, a.tec4g].filter((v) => v >= 0) // tecnologías disponibles
  const base = techs.length > 0 && techs.every((v) => v === 100) && a.noti === 'N'
  if (!base) return 'NORMAL'
  if (seconds > 86400) return 'CRITICO'
  if (seconds > 3600) return 'WARN'
  return 'NORMAL'
}

function toAlarma(a: NuevaAlarma, i: number, now: number): Alarma {
  const seconds = Math.max(0, (now - (parseDate(a.dateCreate)?.getTime() ?? now)) / 1000)
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return { id: i + 1, ...a, timeHours: h, timeText: `${h}h ${m}m`, critical: classify(a, seconds) }
}

const delay = <T,>(v: T, ms = 300) => new Promise<T>((res) => setTimeout(() => res(v), ms))

const ALIAS: Record<keyof NuevaAlarma, string[]> = {
  idAlarm: ['idalarm', 'idalarma', 'id'], tec2g: ['tec2g', '2g'], tec3g: ['tec3g', '3g'], tec4g: ['tec4g', '4g'],
  dateCreate: ['datecreate', 'fechacreacion', 'fecha'], muni: ['muni', 'municipio'], depa: ['depa', 'departamento'],
  noti: ['noti', 'notificada', 'notificado'],
}

function parseCsv(text: string): NuevaAlarma[] {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return []
  const head = lines[0].split('|').map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''))
  const col = (k: keyof NuevaAlarma) => head.findIndex((h) => ALIAS[k].includes(h))
  const idx = Object.fromEntries((Object.keys(ALIAS) as (keyof NuevaAlarma)[]).map((k) => [k, col(k)])) as Record<keyof NuevaAlarma, number>
  if (idx.dateCreate < 0) throw new Error('El CSV debe usar "|" como separador e incluir la columna de fecha de creación.')
  return lines.slice(1).flatMap((l) => {
    const c = l.split('|').map((x) => x.trim())
    const g = (k: keyof NuevaAlarma) => (idx[k] >= 0 ? c[idx[k]] ?? '' : '')
    const f = parseDate(g('dateCreate'))
    if (!f) return []
    return [{
      idAlarm: Number(g('idAlarm')) || 0, tec2g: Number(g('tec2g')), tec3g: Number(g('tec3g')), tec4g: Number(g('tec4g')),
      dateCreate: toIso(f), muni: g('muni'), depa: g('depa'), noti: g('noti').toUpperCase() === 'S' ? 'S' : 'N',
    } as NuevaAlarma]
  })
}

export const mockApi = {
  async listar(): Promise<Alarma[]> {
    const now = Date.now()
    return delay(db.map((a, i) => toAlarma(a, i, now)))
  },
  async crear(n: NuevaAlarma): Promise<Alarma> {
    if (db.some((a) => a.idAlarm === n.idAlarm)) throw new Error('Ya existe una alarma con ese ID.')
    db = [n, ...db]
    return delay(toAlarma(n, 0, Date.now()))
  },
  async importar(file: File): Promise<ResultadoImportacion> {
    const rows = parseCsv(await file.text())
    if (!rows.length) throw new Error('No se encontraron filas válidas en el archivo.')
    db = rows
    return delay({ fileName: file.name, totalProcessed: rows.length })
  },
  async resumen(): Promise<ResumenDia> {
    const hoy = new Date()
    const por = new Array(24).fill(0)
    let total = 0
    for (const a of db) {
      const f = parseDate(a.dateCreate)
      if (f && f.toDateString() === hoy.toDateString()) { por[f.getHours()]++; total++ }
    }
    return delay({ fecha: ymd(hoy), total, por_hora: por.map((t, hora) => ({ hora, total: t })).filter((h) => h.total > 0) })
  },
}
