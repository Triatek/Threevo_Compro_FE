import { useContext } from 'react'
import { SiteContext } from '../context/siteContext'

/** Akses data GET /site yang sudah dimuat di akar aplikasi. */
export function useSite() {
  const context = useContext(SiteContext)
  if (!context) {
    throw new Error('useSite harus dipakai di dalam <SiteProvider>')
  }
  return context
}
