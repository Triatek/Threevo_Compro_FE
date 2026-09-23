import { Link } from 'react-router-dom'
import Seo from '../components/ui/Seo'
import { paths } from '../routes/paths'

export default function NotFound() {
  return (
    <>
      {/* noIndex: halaman galat tidak boleh masuk hasil pencarian. */}
      <Seo
        title="Halaman tidak ditemukan"
        description="Alamat yang Anda tuju tidak tersedia di situs Threevo."
        noIndex
      />

      <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="text-sm font-medium text-brand-600">Error 404</p>

        <h1 className="mt-2 text-4xl">Halaman tidak ditemukan</h1>

        <p className="mt-4 max-w-prose text-ink-500">
          Alamat yang Anda tuju sudah dipindahkan atau tidak pernah ada.
        </p>

        <Link
          to={paths.home}
          className="mt-8 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Kembali ke beranda
        </Link>
      </section>
    </>
  )
}
