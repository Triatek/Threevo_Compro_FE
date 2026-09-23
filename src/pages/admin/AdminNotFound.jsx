import { Link } from 'react-router-dom'
import Seo from '../../components/ui/Seo'
import { adminPaths } from '../../routes/paths'

/** 404 versi panel: mengarahkan kembali ke dasbor, bukan ke beranda publik. */
export default function AdminNotFound() {
  return (
    <>
      <Seo title="Halaman tidak ditemukan" noIndex />

      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-brand-600">Error 404</p>
        <h1 className="mt-2 text-2xl">Halaman tidak ditemukan</h1>
        <p className="mt-3 max-w-prose text-sm text-ink-500">
          Menu yang Anda tuju tidak tersedia di panel admin.
        </p>

        <Link
          to={adminPaths.dashboard}
          className="mt-7 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Kembali ke dasbor
        </Link>
      </div>
    </>
  )
}
