import { Link } from 'react-router-dom'
import { paths } from '../../routes/paths'

/**
 * Wordmark Threevo.
 *
 * SEMENTARA: dirender sebagai teks, bukan aset gambar. Logo di company profile
 * hanya tersedia dalam bentuk raster berlatar gradient gelap, sehingga kalau
 * dipasang di header akan tampak sebagai kotak gradient yang mengganggu.
 * Begitu file SVG atau PNG transparan tersedia, cukup ganti isi komponen ini
 * dengan <img> — tidak ada berkas lain yang perlu disentuh.
 */
export default function Logo({
  withTagline = false,
  className = '',
  to = paths.home,
  label = 'Threevo, kembali ke beranda',
}) {
  return (
    <Link
      to={to}
      className={`group inline-flex flex-col leading-none ${className}`}
      aria-label={label}
    >
      <span className="text-2xl font-extrabold tracking-tight text-white lowercase">
        threevo
      </span>
      {withTagline && (
        <span className="mt-2 text-[0.625rem] font-medium uppercase leading-[1.7] tracking-[0.16em] text-ink-400">
          Powering Commerce Operations
        </span>
      )}
    </Link>
  )
}
