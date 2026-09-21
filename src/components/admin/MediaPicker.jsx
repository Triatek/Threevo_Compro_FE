import { Check, Search, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../hooks/useToast'
import { ACCEPTED_IMAGE_TYPES, ACCEPT_ATTRIBUTE, uploadImage } from '../../lib/upload'
import Button from '../ui/Button'
import Pagination from '../ui/Pagination'
import { EmptyState, ErrorState, LoadingState } from '../ui/states'
import Modal from './Modal'

const PER_PAGE = 12

/**
 * Pemilih gambar: menelusuri media yang sudah ada atau mengunggah yang baru.
 *
 * Unggahan baru langsung dipilih dan dialog ditutup, karena hampir selalu
 * itulah yang diinginkan setelah seseorang memilih berkas.
 */
export default function MediaPicker({ open, onClose, onSelect }) {
  const toast = useToast()
  const fileInput = useRef(null)

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [uploading, setUploading] = useState(false)

  const { data, meta, loading, error, reload } = useFetch('/admin/media', {
    enabled: open,
    params: { page, limit: PER_PAGE, ...(query && { q: query }) },
  })

  function submitSearch(event) {
    event.preventDefault()
    setPage(1)
    setQuery(search.trim())
  }

  async function handleFile(event) {
    const file = event.target.files?.[0]
    // Input direset lebih dulu supaya berkas yang sama bisa dipilih lagi
    // setelah gagal.
    event.target.value = ''
    if (!file) return

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.')
      return
    }

    setUploading(true)
    try {
      const response = await uploadImage(file)
      toast.success(response.message)
      onSelect(response.data)
      onClose()
    } catch (uploadError) {
      toast.error(uploadError.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Pilih gambar" size="xl">
      <div className="px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <form onSubmit={submitSearch} className="flex flex-1 items-center gap-2">
            <label htmlFor="media-search" className="sr-only">
              Cari media
            </label>
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400"
                aria-hidden="true"
              />
              <input
                id="media-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari berdasarkan nama berkas"
                className="w-full rounded-xl border border-ink-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-ink-500 focus:border-brand-400"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Cari
            </Button>
          </form>

          <div>
            <input
              ref={fileInput}
              type="file"
              accept={ACCEPT_ATTRIBUTE}
              onChange={handleFile}
              className="sr-only"
            />
            <Button
              type="button"
              size="sm"
              disabled={uploading}
              onClick={() => fileInput.current?.click()}
            >
              <Upload className="size-4" aria-hidden="true" />
              {uploading ? 'Mengunggah...' : 'Unggah baru'}
            </Button>
          </div>
        </div>

        <div className="mt-5 min-h-[18rem]">
          {loading && <LoadingState />}
          {error && <ErrorState error={error} onRetry={reload} />}

          {data && data.length === 0 && (
            <EmptyState
              title="Belum ada gambar"
              description={query ? 'Tidak ada yang cocok dengan pencarian Anda.' : 'Unggah gambar pertama Anda.'}
            />
          )}

          {data && data.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {data.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(item)
                      onClose()
                    }}
                    className="group relative block w-full overflow-hidden rounded-xl border border-ink-200 bg-ink-100 transition hover:border-brand-400"
                  >
                    <img
                      src={item.url}
                      alt={item.alt || item.originalName}
                      loading="lazy"
                      className="aspect-4/3 w-full object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-brand-600/0 transition group-hover:bg-brand-600/70">
                      <Check
                        className="size-6 text-white opacity-0 transition group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="block truncate px-2.5 py-2 text-left text-xs text-ink-600">
                      {item.originalName}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Pagination meta={meta} onChange={setPage} className="mt-6" />
      </div>
    </Modal>
  )
}
