import { useContext } from 'react'
import { ToastContext } from '../context/toastContext'

/** Pemberitahuan singkat di panel admin. */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast harus dipakai di dalam <ToastProvider>')
  }
  return context
}
