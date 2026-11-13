import { AlertTriangle } from 'lucide-react'
import Button from './Button'
export default function ErrorState({ message = 'Something went wrong', onRetry }) {
  return <div className="card flex flex-col items-center px-6 py-10 text-center" role="alert"><AlertTriangle className="h-9 w-9 text-red-500" />
    <p className="mt-3 font-semibold text-ink-900">We could not load this</p><p className="mt-1 max-w-md text-sm text-ink-700">{message}</p>
    {onRetry && <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>Try again</Button>}</div>
}
