import { Download, Eye, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import Card from '../../components/admin/Card'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import DataTable from '../../components/admin/DataTable'
import Modal from '../../components/admin/Modal'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Pagination from '../../components/ui/Pagination'
import Seo from '../../components/ui/Seo'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/states'
import { useAuth } from '../../hooks/useAuth'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../hooks/useToast'
import { api } from '../../lib/api'
import { formatDateTime } from '../../lib/format'

const PER_PAGE = 20

const STATUS_LABEL = {
  NEW: 'Baru',
  CONTACTED: 'Dihubungi',
  CLOSED: 'Selesai',
}

function StatusBadge({ status }) {
  const isNew = status === 'NEW'

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${
        isNew ? 'border-brand-200 bg-brand-50 text-brand-800' : 'border-ink-200 text-ink-600'
      }`}
    >
      {isNew && <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-600" />}
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

/**
 * Isi dialog detail.
 *
 * Endpoint daftar sengaja tidak mengirim `message` (lihat `listLeads` di
 * backend), jadi isi pesannya diambil lewat endpoint detail. Baris dari tabel
 * dipakai sebagai tampilan sementara supaya dialognya tidak kosong selagi
 * permintaan berjalan.
 */
function LeadDetail({ leadId, onSaved, onClose }) {
  const { data, loading, error, reload } = useFetch(`/admin/leads/${leadId}`)

  if (loading) return <LoadingState label="Memuat detail..." />
  if (error) return <ErrorState error={error} onRetry={reload} />

  return <LeadDetailForm key={data.updatedAt} lead={data} onSaved={onSaved} onClose={onClose} />
}

/** Formulir tindak lanjut di dalam dialog detail. */
function LeadDetailForm({ lead, onSaved, onClose }) {
  const toast = useToast()
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    mode: 'onTouched',
    defaultValues: { status: lead.status, notes: lead.notes ?? '' },
  })

  async function onSubmit(values) {
    try {
      const response = await api.patch(`/admin/leads/${lead.id}`, {
        status: values.status,
        // Catatan kosong dikirim sebagai null, bukan string kosong.
        notes: values.notes.trim() || null,
      })
      toast.success(response.message)
      onSaved()
      onClose()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const rows = [
    { label: 'Email', value: lead.email },
    { label: 'Telepon', value: lead.phone },
    { label: 'Perusahaan', value: lead.company },
    { label: 'Layanan diminati', value: lead.serviceInterest },
    { label: 'Sumber', value: lead.source },
    { label: 'Masuk', value: formatDateTime(lead.createdAt) },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-5 px-5 py-5">
        <dl className="grid gap-x-5 gap-y-3 text-sm sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-xs uppercase tracking-wide text-ink-500">{row.label}</dt>
              <dd className="mt-0.5 break-words text-ink-800">{row.value || '—'}</dd>
            </div>
          ))}
        </dl>

        <div>
          <p className="text-xs uppercase tracking-wide text-ink-500">Pesan</p>
          <p className="mt-1 whitespace-pre-wrap rounded-xl bg-ink-50 p-4 text-sm leading-relaxed text-ink-700">
            {lead.message}
          </p>
        </div>

        <FormField id="lead-status" label="Status">
          {(props) => (
            <select data-autofocus {...props} {...register('status')}>
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField
          id="lead-notes"
          label="Catatan internal"
          hint="Hanya terlihat di panel admin."
        >
          {(props) => <textarea rows={4} {...props} {...register('notes')} />}
        </FormField>
      </div>

      <div className="flex justify-end gap-2 border-t border-ink-200 px-5 py-4">
        <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
          Tutup
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </form>
  )
}

export default function Leads() {
  const toast = useToast()
  const { isSuperAdmin } = useAuth()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ q: '', status: '', from: '', to: '' })
  const [detail, setDetail] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [exporting, setExporting] = useState(false)

  // Hanya filter yang terisi yang dikirim; backend menolak string kosong pada
  // `status` dan tanggal.
  const activeFilters = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== ''),
  )

  const { data, meta, loading, error, reload } = useFetch('/admin/leads', {
    params: { page, limit: PER_PAGE, ...activeFilters },
  })

  function updateFilter(key, value) {
    setPage(1)
    setFilters((current) => ({ ...current, [key]: value }))
  }

  function submitSearch(event) {
    event.preventDefault()
    updateFilter('q', search.trim())
  }

  async function handleDelete() {
    try {
      const response = await api.delete(`/admin/leads/${pendingDelete.id}`)
      toast.success(response.message)
      setPendingDelete(null)
      reload()
    } catch (deleteError) {
      toast.error(deleteError.message)
    }
  }

  /**
   * Unduh CSV lewat XHR, bukan tautan biasa, supaya galat otorisasi tetap
   * melewati interceptor dan tampil sebagai pesan — bukan tab baru berisi JSON.
   */
  async function handleExport() {
    setExporting(true)
    try {
      const blob = await api.get('/admin/leads/export', {
        params: activeFilters,
        responseType: 'blob',
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (exportError) {
      toast.error(exportError.message)
    } finally {
      setExporting(false)
    }
  }

  const items = data ?? []

  const columns = [
    {
      key: 'name',
      label: 'Nama',
      render: (row) => (
        <>
          <span className="block font-medium text-ink-900">{row.name}</span>
          <span className="block text-xs text-ink-500">{row.email}</span>
          {row.company && <span className="block text-xs text-ink-500">{row.company}</span>}
        </>
      ),
    },
    {
      key: 'serviceInterest',
      label: 'Layanan',
      render: (row) => <span className="text-ink-600">{row.serviceInterest || '—'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      headerClassName: 'w-28',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'createdAt',
      label: 'Masuk',
      headerClassName: 'w-44',
      render: (row) => <span className="text-ink-600">{formatDateTime(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      label: '',
      headerClassName: 'w-28',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => setDetail(row)}
            aria-label={`Lihat detail lead ${row.name}`}
            className="rounded-lg p-2 text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
          >
            <Eye className="size-4" />
          </button>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setPendingDelete(row)}
              aria-label={`Hapus lead ${row.name}`}
              className="rounded-lg p-2 text-ink-500 transition hover:bg-accent-500/10 hover:text-accent-600"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <Seo title="Leads — Admin" noIndex />

      <AdminPageHeader
        title="Leads"
        description="Prospek yang masuk lewat formulir kontak di situs."
      >
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleExport}
          disabled={exporting || items.length === 0}
        >
          <Download className="size-4" aria-hidden="true" />
          {exporting ? 'Menyiapkan...' : 'Ekspor CSV'}
        </Button>
      </AdminPageHeader>

      <Card>
        <div className="flex flex-wrap items-end gap-3 border-b border-ink-200 px-5 py-4">
          <form onSubmit={submitSearch} className="flex min-w-[16rem] flex-1 items-end gap-2">
            <div className="flex-1">
              <label htmlFor="lead-search" className="block text-xs font-medium text-ink-600">
                Cari
              </label>
              <div className="relative mt-1.5">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400"
                  aria-hidden="true"
                />
                <input
                  id="lead-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Nama, email, atau perusahaan"
                  className="w-full rounded-xl border border-ink-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-ink-500 focus:border-brand-400"
                />
              </div>
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Cari
            </Button>
          </form>

          <div>
            <label htmlFor="lead-status-filter" className="block text-xs font-medium text-ink-600">
              Status
            </label>
            <select
              id="lead-status-filter"
              value={filters.status}
              onChange={(event) => updateFilter('status', event.target.value)}
              className="mt-1.5 rounded-xl border border-ink-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400"
            >
              <option value="">Semua</option>
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="lead-from" className="block text-xs font-medium text-ink-600">
              Dari
            </label>
            <input
              id="lead-from"
              type="date"
              value={filters.from}
              onChange={(event) => updateFilter('from', event.target.value)}
              className="mt-1.5 rounded-xl border border-ink-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400"
            />
          </div>

          <div>
            <label htmlFor="lead-to" className="block text-xs font-medium text-ink-600">
              Sampai
            </label>
            <input
              id="lead-to"
              type="date"
              value={filters.to}
              onChange={(event) => updateFilter('to', event.target.value)}
              className="mt-1.5 rounded-xl border border-ink-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400"
            />
          </div>
        </div>

        {loading && <LoadingState />}
        {error && <ErrorState error={error} onRetry={reload} />}

        {data && items.length === 0 && (
          <EmptyState
            title="Belum ada lead"
            description="Kiriman dari formulir kontak akan muncul di sini."
          />
        )}

        {items.length > 0 && (
          <>
            <DataTable columns={columns} rows={items} minWidth="52rem" />
            <div className="px-5 pb-5">
              <Pagination meta={meta} onChange={setPage} className="mt-6" />
            </div>
          </>
        )}
      </Card>

      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        title={detail?.name ?? ''}
        description="Detail prospek dan tindak lanjutnya."
        size="lg"
      >
        {detail && (
          <LeadDetail
            key={detail.id}
            leadId={detail.id}
            onSaved={reload}
            onClose={() => setDetail(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Hapus lead ini?"
        description={`Lead dari "${pendingDelete?.name ?? ''}" akan dihapus dari daftar.`}
      />
    </>
  )
}
