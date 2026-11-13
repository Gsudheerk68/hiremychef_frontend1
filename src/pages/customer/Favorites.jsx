import { Link } from 'react-router-dom'
import DashHeader from '../../components/common/DashHeader'
import ChefCard from '../../components/common/ChefCard'
import Skeleton from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import Button from '../../components/common/Button'
import useAsync from '../../hooks/useAsync'
import useFavorites from '../../hooks/useFavorites'
import { useAuth } from '../../context/AuthContext'
import { customersService } from '../../services/customersService'

export default function Favorites() {
  const { user } = useAuth(); const fav = useFavorites()
  const { data, loading, error, reload, setData } = useAsync(() => customersService.favorites(user.id), [user.id])
  const remove = async (id, on) => { if (on) return; setData((data || []).filter((c) => c.id !== id)); await fav.toggle(id, false) }
  return <>
    <DashHeader title="Favourite chefs" text="Chefs you saved for later." />
    {error ? <ErrorState message={error} onRetry={reload} /> : loading && !data ? <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-80" />)}</div>
      : !data?.length ? <EmptyState icon="💛" title="No favourites yet" text="Tap the heart on a chef to save them here." action={<Link to="/chefs"><Button>Explore chefs</Button></Link>} />
      : <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{data.map((c) => <ChefCard key={c.id} chef={c} fav onToggleFav={remove} />)}</div>}</>
}
