import { useEffect } from 'react'
import { X } from 'lucide-react'
export default function Modal({ open, onClose, title, children }) {
  useEffect(() => { const f = (e) => e.key === 'Escape' && onClose(); if (open) window.addEventListener('keydown', f); return () => window.removeEventListener('keydown', f) }, [open, onClose])
  if (!open) return null
  return <div className="fixed inset-0 z-50 grid place-items-center bg-ink-900/50 p-4" onClick={onClose}>
    <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className="card w-full max-w-md p-6">
      <div className="mb-4 flex items-center justify-between"><h3 className="text-xl">{title}</h3><button aria-label="Close" onClick={onClose}><X className="h-5 w-5" /></button></div>{children}</div></div>
}
