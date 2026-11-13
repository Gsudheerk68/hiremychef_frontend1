import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth, dashboardPath } from '../context/AuthContext'
// UI-level guard only. The FastAPI backend must enforce real authorization.
export default function ProtectedRoute({ role }) {
  const { user } = useAuth(); const loc = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />
  if (role && user.role !== role) return <Navigate to={dashboardPath(user.role)} replace />
  return <Outlet />
}
