import { Boxes, LayoutGrid, Megaphone, Package, Receipt, Store, Truck } from 'lucide-react'

/**
 * Menerjemahkan `service.icon` dari backend (teks, mis. "store") menjadi ikon.
 *
 * Sengaja memakai switch yang mengembalikan JSX, bukan peta nama ke komponen
 * lalu dirender lewat variabel. Pola variabel membuat React menganggap ada
 * komponen baru yang dibuat setiap render, sehingga state-nya ikut ter-reset.
 */
export default function ServiceIcon({ name, className = 'size-6' }) {
  const props = { className, 'aria-hidden': true }

  switch (String(name || '').toLowerCase()) {
    case 'store':
      return <Store {...props} />
    case 'package':
      return <Package {...props} />
    case 'megaphone':
      return <Megaphone {...props} />
    case 'receipt':
      return <Receipt {...props} />
    case 'truck':
      return <Truck {...props} />
    case 'boxes':
      return <Boxes {...props} />
    default:
      return <LayoutGrid {...props} />
  }
}
