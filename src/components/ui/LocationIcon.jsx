import { Building2, MapPin, Warehouse } from 'lucide-react'

/**
 * Ikon per tipe lokasi. Memakai switch yang mengembalikan JSX, bukan peta
 * nama ke komponen, dengan alasan yang sama seperti ServiceIcon.
 */
export default function LocationIcon({ type, className = 'size-5' }) {
  const props = { className, 'aria-hidden': true }

  switch (type) {
    case 'WAREHOUSE':
      return <Warehouse {...props} />
    case 'OFFICE':
      return <Building2 {...props} />
    default:
      return <MapPin {...props} />
  }
}
