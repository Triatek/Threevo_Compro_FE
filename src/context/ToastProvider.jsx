import { CheckCircle2, X, XCircle } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { ToastContext } from './toastContext'

const AUTO_DISMISS_MS = 4000

/**
 * Pemberitahuan singkat setelah aksi simpan/hapus di panel admin.
 *
 * Pesannya selalu datang dari backend (`response.message`) atau dari
 * `ApiError.message`, jadi bahasanya konsisten dengan sisa aplikasi dan tidak
 * ada teks yang dikarang di sisi ini.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((items) => items.filter((item) => item.id !== id))
  }, [])

  const notify = useCallback(
    (type, message) => {
      if (!message) return
      const id = (nextId.current += 1)
      setToasts((items) => [...items, { id, type, message }])
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
    },
    [dismiss],
  )

  const value = useMemo(
    () => ({
      success: (message) => notify('success', message),
      error: (message) => notify('error', message),
    }),
    [notify],
  )

  return (
    <ToastContext value={value}>
      {children}

      {/*
        aria-live="polite": pembaca layar membacakan pesan yang baru muncul
        tanpa memotong apa yang sedang dibaca.
      */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-5 right-5 z-[70] flex w-[min(22rem,calc(100vw-2.5rem))] flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${
              toast.type === 'success'
                ? 'border-brand-200 bg-white text-ink-800'
                : 'border-accent-500/40 bg-white text-ink-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
            ) : (
              <XCircle className="mt-0.5 size-4 shrink-0 text-accent-500" aria-hidden="true" />
            )}

            <span className="flex-1">{toast.message}</span>

            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Tutup pemberitahuan"
              className="-mr-1 rounded-lg p-1 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  )
}
