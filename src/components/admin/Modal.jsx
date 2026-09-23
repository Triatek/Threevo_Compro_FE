import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'

/**
 * Dialog bertumpuk di atas halaman.
 *
 * Fokus dipindahkan ke dalam dialog saat dibuka dan dikembalikan ke elemen
 * pemicunya saat ditutup, dan Tab ditahan di dalam dialog — tanpa itu,
 * pengguna keyboard bisa "keluar" ke halaman yang tertutup di belakangnya.
 */
export default function Modal({ open, onClose, title, description, size = 'md', children }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement

    // Satu elemen saja yang difokuskan. Versi berantai dengan `??` sempat
    // memfokuskan isian lalu panelnya, sehingga isian itu langsung ter-blur
    // dan react-hook-form menandainya "touched" — galat wajib-isi muncul
    // sebelum pengguna mengetik apa pun.
    const autofocusTarget = panelRef.current?.querySelector('[data-autofocus]')
    if (autofocusTarget) autofocusTarget.focus()
    else panelRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    // Halaman di belakang tidak ikut bergulir selagi dialog terbuka.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 h-full w-full cursor-default bg-ink-950/60"
      />

      <div className="relative flex min-h-full items-start justify-center p-4 sm:p-6">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          className={`relative w-full rounded-2xl bg-white shadow-xl ${
            size === 'lg' ? 'max-w-3xl' : size === 'xl' ? 'max-w-5xl' : 'max-w-xl'
          }`}
        >
          <div className="flex items-start justify-between gap-4 border-b border-ink-200 px-5 py-4">
            <div>
              <h2 className="text-base">{title}</h2>
              {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="-mr-1 rounded-lg p-1.5 text-ink-500 transition hover:bg-ink-100 hover:text-ink-800"
            >
              <X className="size-4" />
            </button>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
