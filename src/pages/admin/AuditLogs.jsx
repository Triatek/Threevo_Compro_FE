import { useState } from 'react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import Card from '../../components/admin/Card'
import DataTable from '../../components/admin/DataTable'
import Pagination from '../../components/ui/Pagination'
import Seo from '../../components/ui/Seo'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/states'
import { useFetch } from '../../hooks/useFetch'
import { formatDateTime } from '../../lib/format'

const PER_PAGE = 25

/** Sama dengan `AuditAction` di backend (`src/lib/audit.js`). */
const ACTION_LABEL = {
  LOGIN: 'Masuk',
  LOGOUT: 'Keluar',
  CHANGE_PASSWORD: 'Ubah password',
  TOKEN_REUSE: 'Token dipakai ulang',
  CREATE: 'Tambah',
  UPDATE: 'Ubah',
  DELETE: 'Hapus',
  PUBLISH: 'Terbitkan',
  UNPUBLISH: 'Tarik',
  REORDER: 'Ubah urutan',
  EXPORT: 'Ekspor',
}

/** Nama entitas apa adanya dari backend, diterjemahkan sekadarnya. */
const ENTITY_LABEL = {
  User: 'Pengguna',
  Banner: 'Banner',
  Client: 'Klien',
  Testimonial: 'Testimoni',
  Service: 'Layanan',
  Location: 'Lokasi',
  Category: 'Kategori',
  Article: 'Berita',
  Media: 'Media',
  Lead: 'Lead',
  Setting: 'Pengaturan',
}

/** Aksi yang menandakan kemungkinan penyalahgunaan sesi. */
const ALARMING = new Set(['TOKEN_REUSE'])

export default function AuditLogs() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ action: '', entity: '' })

  const activeFilters = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== ''),
  )

  const { data, meta, loading, error, reload } = useFetch('/admin/audit-logs', {
    params: { page, limit: PER_PAGE, ...activeFilters },
  })

  function updateFilter(key, value) {
    setPage(1)
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const items = data ?? []

  const columns = [
    {
      key: 'createdAt',
      label: 'Waktu',
      headerClassName: 'w-44',
      render: (row) => <span className="text-ink-600">{formatDateTime(row.createdAt)}</span>,
    },
    {
      key: 'user',
      label: 'Pengguna',
      render: (row) =>
        row.user ? (
          <>
            <span className="block font-medium text-ink-900">{row.user.name}</span>
            <span className="block text-xs text-ink-500">{row.user.email}</span>
          </>
        ) : (
          <span className="text-ink-400">Sistem</span>
        ),
    },
    {
      key: 'action',
      label: 'Aksi',
      headerClassName: 'w-36',
      render: (row) => (
        <span
          className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${
            ALARMING.has(row.action)
              ? 'border-accent-500/40 bg-accent-500/5 text-accent-600'
              : 'border-ink-200 text-ink-600'
          }`}
        >
          {ACTION_LABEL[row.action] ?? row.action}
        </span>
      ),
    },
    {
      key: 'entity',
      label: 'Objek',
      render: (row) => (
        <span className="text-ink-700">
          {ENTITY_LABEL[row.entity] ?? row.entity}
          {row.entityId && <span className="text-ink-400"> #{row.entityId}</span>}
        </span>
      ),
    },
    {
      key: 'ipAddress',
      label: 'IP',
      headerClassName: 'w-32',
      render: (row) => <span className="text-xs text-ink-500">{row.ipAddress || '—'}</span>,
    },
  ]

  return (
    <>
      <Seo title="Log Aktivitas — Admin" noIndex />

      <AdminPageHeader
        title="Log Aktivitas"
        description="Jejak perubahan data dan aktivitas masuk. Hanya bisa dibaca, tidak bisa diubah atau dihapus."
      />

      <Card>
        <div className="flex flex-wrap items-end gap-3 border-b border-ink-200 px-5 py-4">
          <div>
            <label htmlFor="audit-action" className="block text-xs font-medium text-ink-600">
              Aksi
            </label>
            <select
              id="audit-action"
              value={filters.action}
              onChange={(event) => updateFilter('action', event.target.value)}
              className="mt-1.5 rounded-xl border border-ink-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400"
            >
              <option value="">Semua aksi</option>
              {Object.entries(ACTION_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="audit-entity" className="block text-xs font-medium text-ink-600">
              Objek
            </label>
            <select
              id="audit-entity"
              value={filters.entity}
              onChange={(event) => updateFilter('entity', event.target.value)}
              className="mt-1.5 rounded-xl border border-ink-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400"
            >
              <option value="">Semua objek</option>
              {Object.entries(ENTITY_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && <LoadingState />}
        {error && <ErrorState error={error} onRetry={reload} />}

        {data && items.length === 0 && (
          <EmptyState
            title="Belum ada aktivitas"
            description="Perubahan data akan tercatat di sini secara otomatis."
          />
        )}

        {items.length > 0 && (
          <>
            <DataTable columns={columns} rows={items} minWidth="48rem" />
            <div className="px-5 pb-5">
              <Pagination meta={meta} onChange={setPage} className="mt-6" />
            </div>
          </>
        )}
      </Card>
    </>
  )
}
