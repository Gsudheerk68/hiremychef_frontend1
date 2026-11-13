import DashHeader from '../../components/common/DashHeader'
import Stars from '../../components/common/Stars'
import Skeleton from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import useAsync from '../../hooks/useAsync'
import { useDash } from '../../layouts/DashboardLayout'
import { reviewsService } from '../../services/reviewsService'
import { fmtDate } from '../../utils/format'

export default function ChefReviews() {
  const { chef } = useDash()
  const { data, loading, error, reload } = useAsync(() => reviewsService.forChef(chef.id), [chef.id])
  return <>
    <DashHeader title="Reviews" text="What customers say about you." />
    <div className="card mb-6 flex items-center gap-4 p-5"><p className="font-display text-5xl font-bold text-ink-900">{chef.rating || '–'}</p><div><Stars value={chef.rating} size="h-5 w-5" /><p className="text-sm text-ink-700">{chef.reviews} reviews in total</p></div></div>
    {error ? <ErrorState message={error} onRetry={reload} /> : loading && !data ? <Skeleton className="h-40" /> : !data?.length ? <EmptyState icon="⭐" title="No written reviews yet" text="Reviews appear after customers rate completed bookings." />
      : <ul className="space-y-4">{data.map((r) => <li key={r.id} className="card p-5"><div className="flex items-center justify-between"><p className="font-semibold">{r.customer_name || 'Customer'}</p><span className="text-xs text-ink-700">{fmtDate(r.created_at)}</span></div><Stars value={r.rating} />{r.comment && <p className="mt-2 text-sm text-ink-700">{r.comment}</p>}</li>)}</ul>}</>
}
