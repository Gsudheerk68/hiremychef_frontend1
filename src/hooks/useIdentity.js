import { useAuth } from '../context/AuthContext'
import { useDash } from '../layouts/DashboardLayout'
/** { role, userId, name, chefId } – chefId is only set for chefs (loaded once by DashboardLayout). */
export default function useIdentity() {
  const { user } = useAuth(); const { chef } = useDash()
  return { role: user?.role, userId: user?.id, name: user?.name, chefId: chef?.id }
}
