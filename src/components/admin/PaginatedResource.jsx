import { ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../hooks/useToast'
import { api } from '../../lib/api'
import Button from '../ui/Button'
import Pagination from '../ui/Pagination'
import Seo from '../ui/Seo'
import { EmptyState, ErrorState, LoadingState } from '../ui/states'
import AdminPageHeader from './AdminPageHeader'
import Card from './Card'
import ConfirmDialog from './ConfirmDialog'
import DataTable from './DataTable'
import Modal from './Modal'
import Toggle from './Toggle'

const PER_PAGE = 20

/**
 * Ambil satu baris utuh sebelum formulir dipasang.
 *
 * Endpoint daftar memangkas kolom besar demi ukuran respons — `listServices`
 * membuang `content`, misalnya. Kalau formulir diisi dari baris tabel, kolom
 * yang dipangkas itu tampak kosong dan ikut terkirim sebagai null saat
 * disimpan, sehingga isi halaman terhapus tanpa disadari. Karena itu ubah
 * selalu berangkat dari `GET <endpoint>/<id>`.
 */
function EditForm({ endpoint, id, toFormValues, ...props }) {
  const { data, loading, error, reload } = useFetch(`${endpoint}/${id}`)

  if (loading) return <LoadingState label="Memuat data..." />
  if (error) return <ErrorState error={error} onRetry={reload} />

  return <ResourceForm defaultValues={toFormValues(data)} {...props} />
}

/** Dipasang ulang lewat `key`, jadi nilai awalnya cukup diberikan sekali. */
function ResourceForm({ defaultValues, fields, onSubmit, onCancel, submitLabel, isNew }) {
  const form = useForm({ mode: 'onTouched', defaultValues })
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* `isNew` diteruskan agar aturan bisa berbeda antara tambah dan ubah. */}
      <div className="space-y-5 px-5 py-5">{fields(form, { isNew })}</div>

      <div className="flex justify-end gap-2 border-t border-ink-200 px-5 py-4">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

/**
 * Halaman daftar untuk resource berpaginasi yang juga punya urutan — layanan
 * dan lokasi.
 *
 * Bedanya dengan `SortableResource`: daftarnya dipotong per halaman, sehingga
 * urutan tidak bisa dirapikan ulang jadi 0..n-1 (baris di halaman lain tidak
 * ikut terkirim dan nomornya akan bentrok). Karena itu pemindahan dilakukan
 * dengan menukar nilai `sortOrder` dua baris yang bersebelahan saja — aman
 * berapa pun halamannya. Kalau kebetulan nilainya sama (mis. semua masih 0),
 * seluruh baris di halaman ini diberi nomor ulang berdasarkan posisinya.
 */
export default function PaginatedResource({
  title,
  description,
  endpoint,
  label,
  emptyDescription,
  columns,
  filterControls = [],
  searchPlaceholder = 'Cari...',
  // Tidak semua resource berpaginasi punya urutan atau sakelar aktif: berita
  // memakai status terbit/draf, bukan keduanya.
  sortable = true,
  activeToggle = true,
  rowActions,
  defaultValues,
  toFormValues,
  toPayload,
  fields,
  formSize = 'lg',
  minWidth,
}) {
  const toast = useToast()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({})
  const [editing, setEditing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const activeFilters = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== ''),
  )

  const { data, meta, loading, error, reload } = useFetch(endpoint, {
    params: { page, limit: PER_PAGE, ...(query && { q: query }), ...activeFilters },
  })

  const items = data ?? []
  const nameOf = (row) => row?.name ?? row?.title ?? ''

  function submitSearch(event) {
    event.preventDefault()
    setPage(1)
    setQuery(search.trim())
  }

  function updateFilter(key, value) {
    setPage(1)
    setFilters((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(values) {
    const payload = toPayload(values)

    try {
      const response =
        editing === 'new'
          ? await api.post(endpoint, payload)
          : await api.patch(`${endpoint}/${editing.id}`, payload)

      toast.success(response.message)
      setEditing(null)
      reload()
    } catch (submitError) {
      toast.error(submitError.message)
    }
  }

  async function handleDelete() {
    try {
      const response = await api.delete(`${endpoint}/${pendingDelete.id}`)
      toast.success(response.message)
      setPendingDelete(null)
      reload()
    } catch (deleteError) {
      toast.error(deleteError.message)
    }
  }

  async function toggleActive(row) {
    setBusyId(row.id)
    try {
      await api.patch(`${endpoint}/${row.id}`, { isActive: !row.isActive })
      reload()
    } catch (toggleError) {
      toast.error(toggleError.message)
    } finally {
      setBusyId(null)
    }
  }

  async function move(index, direction) {
    const target = index + direction
    if (target < 0 || target >= items.length) return

    const current = items[index]
    const neighbour = items[target]

    const payload =
      current.sortOrder === neighbour.sortOrder
        ? items.map((item, position) => ({ id: item.id, sortOrder: position }))
        : [
            { id: current.id, sortOrder: neighbour.sortOrder },
            { id: neighbour.id, sortOrder: current.sortOrder },
          ]

    setBusyId(current.id)
    try {
      await api.patch(`${endpoint}/reorder`, payload)
      reload()
    } catch (reorderError) {
      toast.error(reorderError.message)
    } finally {
      setBusyId(null)
    }
  }

  const orderColumn = {
    key: 'order',
    label: 'Urutan',
    headerClassName: 'w-24',
    render: (row) => {
        const index = items.indexOf(row)
        return (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => move(index, -1)}
              disabled={index === 0 || busyId === row.id}
              aria-label={`Naikkan ${nameOf(row)}`}
              className="rounded-lg border border-ink-300 p-1.5 text-ink-600 transition hover:bg-ink-100 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ArrowUp className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => move(index, 1)}
              disabled={index === items.length - 1 || busyId === row.id}
              aria-label={`Turunkan ${nameOf(row)}`}
              className="rounded-lg border border-ink-300 p-1.5 text-ink-600 transition hover:bg-ink-100 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ArrowDown className="size-3.5" />
            </button>
        </div>
      )
    },
  }

  const activeColumn = {
    key: 'active',
    label: 'Aktif',
    headerClassName: 'w-20',
    render: (row) => (
      <Toggle
        checked={row.isActive}
        disabled={busyId === row.id}
        onChange={() => toggleActive(row)}
        label={`${row.isActive ? 'Nonaktifkan' : 'Aktifkan'} ${nameOf(row)}`}
      />
    ),
  }

  const tableColumns = [
    ...(sortable ? [orderColumn] : []),
    ...columns,
    ...(activeToggle ? [activeColumn] : []),
    {
      key: 'actions',
      label: '',
      headerClassName: rowActions ? 'w-36' : 'w-28',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          {rowActions?.(row, { reload, busy: busyId === row.id, setBusyId })}
          <button
            type="button"
            onClick={() => setEditing(row)}
            aria-label={`Ubah ${nameOf(row)}`}
            className="rounded-lg p-2 text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setPendingDelete(row)}
            aria-label={`Hapus ${nameOf(row)}`}
            className="rounded-lg p-2 text-ink-500 transition hover:bg-accent-500/10 hover:text-accent-600"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <Seo title={`${title} — Admin`} noIndex />

      <AdminPageHeader title={title} description={description}>
        <Button type="button" size="sm" onClick={() => setEditing('new')}>
          <Plus className="size-4" aria-hidden="true" />
          Tambah {label}
        </Button>
      </AdminPageHeader>

      <Card>
        <div className="flex flex-wrap items-end gap-3 border-b border-ink-200 px-5 py-4">
          <form onSubmit={submitSearch} className="flex min-w-[16rem] flex-1 items-end gap-2">
            <div className="flex-1">
              <label htmlFor={`${label}-search`} className="block text-xs font-medium text-ink-600">
                Cari
              </label>
              <div className="relative mt-1.5">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400"
                  aria-hidden="true"
                />
                <input
                  id={`${label}-search`}
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-xl border border-ink-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-ink-500 focus:border-brand-400"
                />
              </div>
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Cari
            </Button>
          </form>

          {filterControls.map((control) => (
            <div key={control.key}>
              <label
                htmlFor={`filter-${control.key}`}
                className="block text-xs font-medium text-ink-600"
              >
                {control.label}
              </label>
              <select
                id={`filter-${control.key}`}
                value={filters[control.key] ?? ''}
                onChange={(event) => updateFilter(control.key, event.target.value)}
                className="mt-1.5 rounded-xl border border-ink-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400"
              >
                <option value="">{control.allLabel ?? 'Semua'}</option>
                {control.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {loading && <LoadingState />}
        {error && <ErrorState error={error} onRetry={reload} />}

        {data && items.length === 0 && (
          <EmptyState title={`Belum ada ${label.toLowerCase()}`} description={emptyDescription} />
        )}

        {items.length > 0 && (
          <>
            <DataTable columns={tableColumns} rows={items} minWidth={minWidth} />
            <div className="px-5 pb-5">
              <Pagination meta={meta} onChange={setPage} className="mt-6" />
            </div>
          </>
        )}
      </Card>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? `Tambah ${label}` : `Ubah ${label}`}
        size={formSize}
      >
        {editing === 'new' && (
          <ResourceForm
            key="new"
            defaultValues={defaultValues}
            fields={fields}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
            submitLabel="Simpan"
            isNew
          />
        )}

        {editing !== null && editing !== 'new' && (
          <EditForm
            key={editing.id}
            endpoint={endpoint}
            id={editing.id}
            toFormValues={toFormValues}
            fields={fields}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
            submitLabel="Simpan perubahan"
            isNew={false}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title={`Hapus ${label.toLowerCase()} ini?`}
        description={`"${nameOf(pendingDelete)}" akan dihapus permanen dan langsung hilang dari situs.`}
      />
    </>
  )
}
