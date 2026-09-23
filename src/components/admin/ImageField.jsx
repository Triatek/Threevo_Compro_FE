import { ImageOff, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import MediaPicker from './MediaPicker'

/**
 * Isian gambar: pratinjau, tombol pilih/ganti, dan tombol hapus bila boleh
 * kosong.
 *
 * Nilainya berupa URL gambar (string) — bentuk yang sama seperti yang diminta
 * backend (`imageUrlSchema`), bukan id media, supaya konten tidak ikut rusak
 * kalau baris medianya dihapus.
 */
export default function ImageField({
  id,
  label,
  value,
  onChange,
  error,
  required = false,
  hint,
  clearable = false,
}) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const errorId = error ? `${id}-error` : undefined

  return (
    <div>
      <span id={`${id}-label`} className="block text-sm font-medium text-ink-800">
        {label}
        {required && (
          <span className="text-accent-500" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </span>

      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}

      <div className="mt-2 flex items-start gap-4">
        <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-ink-100">
          {value ? (
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <ImageOff className="size-5 text-ink-400" aria-hidden="true" />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            id={id}
            aria-describedby={errorId}
            aria-labelledby={`${id}-label`}
            onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-ink-300 px-4 py-2 text-sm font-medium text-ink-800 transition hover:border-ink-400 hover:bg-ink-100"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            {value ? 'Ganti gambar' : 'Pilih gambar'}
          </button>

          {clearable && value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-2 rounded-full border border-ink-300 px-4 py-2 text-sm font-medium text-accent-600 transition hover:border-accent-500 hover:bg-accent-500/5"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              Hapus
            </button>
          )}
        </div>
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-accent-600">
          {error}
        </p>
      )}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(media) => onChange(media.url)}
      />
    </div>
  )
}
