import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'
const Ctx = createContext(null)
export const useToast = () => useContext(Ctx)
export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const push = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setItems((s) => [...s, { id, message, type }])
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 4000)
  }, [])
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className="card flex items-center gap-3 px-4 py-3 text-sm">
            {t.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />}
            {t.message}
            <button aria-label="Dismiss" onClick={() => setItems((s) => s.filter((x) => x.id !== t.id))}><X className="h-4 w-4" /></button>
          </div>))}
      </div>
    </Ctx.Provider>)
}
