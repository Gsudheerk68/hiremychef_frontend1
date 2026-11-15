import { createContext, useContext, useEffect, useState } from 'react'
import { TOKEN_KEY } from '../api/client'
import { authService } from '../services/authService'
const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)
export const dashboardPath = (role) => ({ customer:'/customer', chef:'/chef', admin:'/admin' }[role] || '/')
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('hmc_user') || 'null'))
  const logout = () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem('hmc_user'); setUser(null) }
  useEffect(() => { window.addEventListener('hmc:unauthorized', logout); return () => window.removeEventListener('hmc:unauthorized', logout) }, [])
  const persist = ({ token, user: u }) => {
    const user = { ...u, name: u.full_name || u.name } // backend sends full_name, mock sends name
    localStorage.setItem(TOKEN_KEY, token); localStorage.setItem('hmc_user', JSON.stringify(user)); setUser(user)
    return user
  }
  const login = async (body) => persist(await authService.login(body))
  const register = async (body) => persist(await authService.register(body))
  // used by "Continue with Google": the backend already returned { token, user }, so just start the session
  const loginWithResult = async (result) => persist(result)
  return <Ctx.Provider value={{ user, login, register, loginWithResult, logout, isAuthenticated: !!user }}>{children}</Ctx.Provider>
}
