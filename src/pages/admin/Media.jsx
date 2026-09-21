import { Copy, Search, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import Card from '../../components/admin/Card'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import Button from '../../components/ui/Button'
import Pagination from '../../components/ui/Pagination'
import Seo from '../../components/ui/Seo'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/states'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../hooks/useToast'
import { api } from '../../lib/api'
import { formatDateTime } from '../../lib/format'
import { ACCEPTED_IMAGE_TYPES, ACCEPT_ATTRIBUTE, formatFileSize, uploadImage } from '../../lib/upload'

const PER_PAGE = 24

export default function Media() {
  const toast = useToast()
  const fileInput = useRef(null)

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const { data, meta, loading, error, reload } = useFetch('/admin/media', {
    params: { page, limit: PER_PAGE, ...(query && { q: query }) },
  })

  function submitSearch(event) {
    event.preventDefault()
    setPage(1)
    setQuery(search.trim())
  }

  async function handleFile(event) {
    const file = event.target.files?.[0]
    // Direset lebih dulu supaya berkas yang sama bisa dipilih lagi setelah gagal.
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
      setPage(1)
      reload()
    } catch (uploadError) {
      toast.error(uploadError.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete() {
    try {
      const response = await api.delete(`/admin/media/${pendingDelete.id}`)
      toast.success(response.message)
      setPendingDelete(null)
      reload()
    } catch (deleteError) {
      toast.error(deleteError.message)
    }
  }

  async function copyUrl(url) {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Alamat gambar disalin.')
    } catch {
      // Clipboard ditolak browser (halaman tidak fokus, atau izin dicabut).
      toast.error('Gagal menyalin. Salin manual dari alamat gambar.')
    }
  }

  const items = data ?? []

  return (
    <>
      <Seo title="Media — Admin" noIndex />

      <AdminPageHeader
        title="Media"
        description="Gambar yang dipakai ulang di banner, layanan, dan berita. Semua unggahan otomatis dikonversi ke WebP."
      >
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          onChange={handleFile}
          className="sr-only"
        />
        <Button type="button" size="sm" disabled={uploading} onClick={() => fileInput.current?.click()}>
          <Upload className="size-4" aria-hidden="true" />
          {uploading ? 'Mengunggah...' : 'Unggah gambar'}
        </Button>
      </AdminPageHeader>

      <Card>
        <div className="border-b border-ink-200 px-5 py-4">
          <form onSubmit={submitSearch} className="flex max-w-md items-center gap-2">
            <label htmlFor="media-library-search" className="sr-only">
              Cari media
            </label>
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400"
                aria-hidden="true"
              />
              <input
                id="media-library-search"
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
        </div>

        <div className="px-5 py-5">
          {loading && <LoadingState />}
          {error && <ErrorState error={error} onRetry={reload} />}

          {data && items.length === 0 && (
            <EmptyState
              title="Belum ada gambar"
              description={
                query
                  ? 'Tidak ada berkas yang cocok dengan pencarian Anda.'
                  : 'Unggah gambar untuk dipakai di banner, layanan, dan berita.'
              }
            />
          )}

          {items.length > 0 && (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-ink-200 bg-white"
                >
                  <img
                    src={item.url}
                    alt={item.alt || item.originalName}
                    loading="lazy"
                    className="aspect-4/3 w-full bg-ink-100 object-cover"
                  />

                  <div className="px-3 py-2.5">
                    <p className="truncate text-xs font-medium text-ink-800" title={item.originalName}>
                      {item.originalName}
                    </p>
                    <p className="mt-0.5 text-[0.6875rem] text-ink-500">
                      {item.width}×{item.height} · {formatFileSize(item.size)}
                    </p>
                    <p className="text-[0.6875rem] text-ink-400">{formatDateTime(item.createdAt)}</p>

                    <div className="mt-2 flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => copyUrl(item.url)}
                        aria-label={`Salin alamat ${item.originalName}`}
                        className="rounded-lg p-1.5 text-ink-500 transition hover:bg-ink-100 hover:text-ink-800"
                      >
                        <Copy className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(item)}
                        aria-label={`Hapus ${item.originalName}`}
                        className="rounded-lg p-1.5 text-ink-500 transition hover:bg-accent-500/10 hover:text-accent-600"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Pagination meta={meta} onChange={setPage} className="mt-8" />
        </div>
      </Card>

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Hapus gambar ini?"
        description={`"${pendingDelete?.originalName ?? ''}" akan dihapus permanen. Konten yang masih memakai gambar ini akan menampilkan gambar rusak.`}
      />
    </>
  )
}
