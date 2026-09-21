import { AlertCircle, Inbox, LoaderCircle } from 'lucide-react'

/** Placeholder saat data sedang diambil. */
export function LoadingState({ label = 'Memuat...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-ink-500 ${className}`}>
      <LoaderCircle className="size-6 animate-spin text-brand-600" aria-hidden="true" />
      <p className="mt-3 text-sm" role="status">
        {label}
      </p>
    </div>
  )
}

/**
 * Kegagalan pengambilan data. `error` adalah ApiError dari lib/api.js,
 * yang pesannya sudah berbahasa Indonesia.
 */
export function ErrorState({ error, onRetry, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      <AlertCircle className="size-6 text-accent-500" aria-hidden="true" />
      <p className="mt-3 max-w-prose text-sm text-ink-600">
        {error?.message ?? 'Terjadi kesalahan saat memuat data.'}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-full border border-ink-300 px-5 py-2 text-sm font-medium text-ink-700 transition hover:border-ink-400 hover:bg-ink-100"
        >
          Coba lagi
        </button>
      )}
    </div>
  )
}

/** Data berhasil diambil tetapi kosong. */
export function EmptyState({ title = 'Belum ada data', description, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      <Inbox className="size-6 text-ink-400" aria-hidden="true" />
      <p className="mt-3 font-medium text-ink-700">{title}</p>
      {description && <p className="mt-1 max-w-prose text-sm text-ink-500">{description}</p>}
    </div>
  )
}
