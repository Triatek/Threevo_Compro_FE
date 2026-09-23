import { useMemo } from 'react'
import { useFetch } from '../hooks/useFetch'
import { EMPTY_SITE, SiteContext } from './siteContext'

/**
 * Memuat GET /site satu kali di akar aplikasi: settings, banner, klien,
 * testimoni, dan layanan unggulan — semua kebutuhan header, footer, dan
 * beranda dalam satu permintaan.
 */
export function SiteProvider({ children }) {
  const { data, loading, error, reload } = useFetch('/site')

  const value = useMemo(() => {
    const site = data ?? EMPTY_SITE
    const settings = site.settings ?? {}

    const waNumber = settings.whatsapp_number
    const waMessage = settings.whatsapp_message ?? ''

    return {
      ...site,
      settings,
      loading,
      error,
      reload,
      // Tautan WhatsApp siap pakai; null bila nomornya belum diisi admin.
      whatsappHref: waNumber
        ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`
        : null,
      companyName: settings.company_name || 'Threevo',
    }
  }, [data, loading, error, reload])

  return <SiteContext value={value}>{children}</SiteContext>
}
