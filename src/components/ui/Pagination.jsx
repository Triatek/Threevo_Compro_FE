import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Daftar nomor halaman yang ringkas: selalu menampilkan halaman pertama,
 * terakhir, dan tetangga halaman aktif. Sisanya diringkas jadi elipsis.
 */
function buildPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = new Set([1, total, current, current - 1, current + 1])
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b)

  const result = []
  let previous = 0
  for (const page of sorted) {
    if (page - previous > 1) result.push(`gap-${page}`)
    result.push(page)
    previous = page
  }
  return result
}

const buttonBase =
  'flex size-10 items-center justify-center rounded-full text-sm font-medium transition'

export default function Pagination({ meta, onChange, className = 'mt-14' }) {
  if (!meta || meta.totalPages <= 1) return null

  const { page, totalPages, hasPrevPage, hasNextPage } = meta

  return (
    // flex-wrap penting di layar sempit: tujuh nomor halaman ditambah dua
    // tombol panah sudah melebihi lebar ponsel bila dipaksa satu baris.
    <nav
      aria-label="Navigasi halaman"
      className={`flex flex-wrap items-center justify-center gap-1.5 ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={!hasPrevPage}
        aria-label="Halaman sebelumnya"
        className={`${buttonBase} border border-ink-300 text-ink-700 hover:bg-ink-100 disabled:opacity-40 disabled:hover:bg-transparent`}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>

      {buildPages(page, totalPages).map((item) =>
        typeof item === 'number' ? (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
            className={`${buttonBase} ${
              item === page
                ? 'bg-brand-600 text-white'
                : 'text-ink-600 hover:bg-ink-100'
            }`}
          >
            {item}
          </button>
        ) : (
          <span key={item} className="px-1 text-ink-500" aria-hidden="true">
            &hellip;
          </span>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={!hasNextPage}
        aria-label="Halaman berikutnya"
        className={`${buttonBase} border border-ink-300 text-ink-700 hover:bg-ink-100 disabled:opacity-40 disabled:hover:bg-transparent`}
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  )
}
