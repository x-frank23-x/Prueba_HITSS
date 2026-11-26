import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { FileSpreadsheet, Loader2, UploadCloud, X } from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import { Modal } from './Modal'

const MAX_MB = 10
const schema = z.object({
  file: z
    .instanceof(File, { message: 'Selecciona un archivo CSV' })
    .refine((f) => /\.csv$/i.test(f.name), 'El archivo debe ser .csv')
    .refine((f) => f.size <= MAX_MB * 1024 * 1024, `Máximo ${MAX_MB} MB`),
})
type Values = z.infer<typeof schema>

export function ImportModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (msg: string) => void }) {
  const qc = useQueryClient()
  const [rechazo, setRechazo] = useState<string | null>(null)
  const { handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) })
  const file = watch('file')

  const m = useMutation({
    mutationFn: (f: File) => api.importarCsv(f),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ['alarmas'] })
      qc.invalidateQueries({ queryKey: ['resumen'] })
      reset()
      onDone(`${r.totalProcessed} alarmas importadas desde ${r.fileName}`)
      onClose()
    },
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: { 'text/csv': ['.csv'] },
    onDropAccepted: ([f]) => { setRechazo(null); m.reset(); setValue('file', f, { shouldValidate: true }) },
    onDropRejected: () => setRechazo('El archivo debe ser .csv'),
  })

  return (
    <Modal open={open} onClose={onClose} title="Importar alarmas" subtitle='CSV separado por "|"'>
      <form onSubmit={handleSubmit((v) => m.mutate(v.file))} className="space-y-4">
        <div {...getRootProps()} className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors ${isDragActive ? 'border-accent bg-accent/10' : 'border-line hover:border-brand'}`}>
          <input {...getInputProps()} aria-label="Archivo CSV de alarmas" />
          <UploadCloud size={32} className="text-accent" aria-hidden />
          <p className="text-sm font-medium">{isDragActive ? 'Suelta el archivo aquí' : 'Arrastra el CSV o haz clic para seleccionarlo'}</p>
          <p className="text-xs text-muted">.csv · máx {MAX_MB} MB</p>
        </div>

        <p className="rounded-lg bg-warn/10 px-3 py-2 text-xs text-warn">Al importar se reemplazan todas las alarmas existentes.</p>

        <AnimatePresence>
          {file && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 rounded-lg bg-panel-2 px-3 py-2 text-sm">
              <FileSpreadsheet size={16} className="shrink-0 text-ok" aria-hidden />
              <span className="truncate">{file.name}</span>
              <span className="text-xs text-muted">{(file.size / 1024).toFixed(1)} KB</span>
              <button type="button" onClick={() => reset()} aria-label="Quitar archivo" className="ml-auto text-muted hover:text-white"><X size={14} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {(errors.file?.message || rechazo || m.error) && (
          <p role="alert" className="rounded-lg bg-crit/10 px-3 py-2 text-sm text-crit">{errors.file?.message ?? rechazo ?? errorMessage(m.error)}</p>
        )}
        <button type="submit" disabled={!file || m.isPending} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
          {m.isPending ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />} Importar alarmas
        </button>
      </form>
    </Modal>
  )
}
