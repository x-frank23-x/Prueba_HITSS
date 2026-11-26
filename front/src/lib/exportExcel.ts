/** Exporta exactamente las filas/columnas visibles (ya filtradas y ordenadas) a .xlsx */
export async function exportToExcel(headers: string[], rows: (string | number)[][], etiquetaFiltro: string) {
  const XLSX = await import('xlsx')
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
  ws['!cols'] = headers.map((h, i) => ({
    wch: Math.min(40, Math.max(h.length, ...rows.map((r) => String(r[i] ?? '').length)) + 2),
  }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Alarmas')
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')
  XLSX.writeFile(wb, `alarmas_${etiquetaFiltro.toLowerCase()}_${stamp}.xlsx`)
}
