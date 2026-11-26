import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  maxWidth?: string
  children: ReactNode
}

/** Modal estilo Facebook: título centrado, botón de cierre circular. */
export function Modal({ open, onClose, title, subtitle, maxWidth = 'max-w-lg', children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog" aria-modal="true" aria-label={title}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className={`flex max-h-[92vh] w-full ${maxWidth} flex-col overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl shadow-brand/10`}
          >
            <div className="relative border-b border-line px-14 py-4 text-center">
              <h2 className="text-lg font-semibold">{title}</h2>
              {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
              <button onClick={onClose} aria-label="Cerrar" className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-panel-2 text-muted transition hover:bg-line hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="scroll-thin overflow-y-auto p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
