import { useContext } from 'react'
import { AuthContext } from '../context/authContext'

/** Akses sesi admin yang dimuat di akar panel. */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth harus dipakai di dalam <AuthProvider>')
  }
  return context
}
