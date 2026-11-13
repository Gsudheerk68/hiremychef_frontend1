export const isEmail = (v) => /\S+@\S+\.\S+/.test(v)
export const validatePassword = (v) => (v.length < 8 ? 'Minimum 8 characters' : v.length > 64 ? 'Maximum 64 characters' : '')
