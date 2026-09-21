import { useState } from 'react'
import Button from '../ui/Button'
import Modal from './Modal'

/**
 * Konfirmasi untuk aksi yang tidak bisa dibatalkan.
 *
 * `onConfirm` ditunggu sampai selesai supaya tombolnya bisa menampilkan status
 * "Menghapus..." dan tidak bisa ditekan dua kali.
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Hapus data ini?',
  description,
  confirmLabel = 'Hapus',
  busyLabel = 'Menghapus...',
}) {
  const [busy, setBusy] = useState(false)

  async function handleConfirm() {
    setBusy(true)
    try {
      await onConfirm()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="px-5 py-5">
        <p className="text-sm text-ink-600">
          {description ?? 'Tindakan ini tidak bisa dibatalkan.'}
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={busy}>
            Batal
          </Button>

          <button
            type="button"
            data-autofocus
            onClick={handleConfirm}
            disabled={busy}
            className="inline-flex items-center justify-center rounded-full bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
