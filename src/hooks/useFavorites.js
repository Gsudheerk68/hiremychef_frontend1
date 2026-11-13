import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { customersService } from '../services/customersService'
/** Favourite chef ids for the logged-in customer. For other roles/visitors it is empty and `enabled` is false. */
export default function useFavorites() {
  const { user } = useAuth(); const toast = useToast()
  const enabled = user?.role === 'customer'
  const [ids, setIds] = useState([])
  useEffect(() => { if (enabled) customersService.favoriteIds(user.id).then(setIds).catch(() => {}); else setIds([]) }, [enabled, user?.id])
  const toggle = useCallback(async (chefId, on) => {
    setIds((s) => (on ? [...new Set([...s, chefId])] : s.filter((x) => x !== chefId)))
    try { await customersService.setFavorite(chefId, on, user.id); toast(on ? 'Saved to favourites' : 'Removed from favourites') }
    catch (e) { setIds((s) => (on ? s.filter((x) => x !== chefId) : [...s, chefId])); toast(e.message, 'error') }
  }, [user?.id, toast])
  return { ids, enabled, toggle }
}
