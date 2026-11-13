import api, { isMock, mock } from '../api/client'
const MOCK_IDS = { customer: 1, chef: 101, admin: 900 }
export const authService = {
  login: (body) => isMock('auth') ? mock({ token:'mock-jwt', user:{ id:MOCK_IDS[body.role || 'customer'], name:body.email.split('@')[0], full_name:body.email.split('@')[0], email:body.email, role:body.role || 'customer' } }) : api.post('/auth/login', body),
  register: (body) => isMock('auth') ? mock({ token:'mock-jwt', user:{ id:body.role === 'chef' ? 101 : 1, name:body.full_name, full_name:body.full_name, email:body.email, role:body.role } }) : api.post('/auth/register', body),
  forgotPassword: (email) => isMock('auth') ? mock({ ok:true }) : api.post('/auth/forgot-password', { email }),
  resetPassword: (body) => isMock('auth') ? mock({ ok:true }) : api.post('/auth/reset-password', body),
}
