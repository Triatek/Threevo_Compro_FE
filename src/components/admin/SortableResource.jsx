import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../hooks/useToast'
import { api } from '../../lib/api'
import Button from '../ui/Button'
import Seo from '../ui/Seo'
import { EmptyState, ErrorState, LoadingState } from '../ui/states'
import AdminPageHeader from './AdminPageHeader'
import Card from './Card'
import ConfirmDialog from './ConfirmDialog'
import DataTable from './DataTable'
import Modal from './Modal'
import Toggle from './Toggle'

/**
 * Formulir tambah/ubah.
 *
 * Dipasang ulang (lewat `key` di pemanggil) setiap kali barisnya berganti,
 * sehingga nilai awalnya cukup diberikan sekali lewat `defaultValues` — tidak
 * perlu menyetel state dari dalam effect.
 */
function ResourceForm({ defaultValues, fields, onSubmit, onCancel, submitLabel }) {
  const form = useForm({ mode: 'onTouched', defaultValues })
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-5 px-5 py-5">{fields(form)}</div>

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
 * Halaman daftar untuk resource "konten berurutan" — banner, klien, testimoni.
 *
 * Ketiganya berbagi bentuk yang sama di backend (`createSortableService`):
 * daftar tanpa paginasi, `sortOrder`, `isActive`, dan endpoint `/reorder`.
 * Komponen ini pasangannya di sisi ini; tiap modul hanya menyumbang kolom
 * tabel, isian formulir, dan bentuk payload-nya.
 */
export default function SortableResource({
  title,
  description,
  endpoint,
  label,
  emptyDescription,
  columns,
  defaultValues,
  toFormValues,
  toPayload,
  fields,
  formSize = 'md',
  minWidth,
}) {
  const toast = useToast()
  const { data, loading, error, reload } = useFetch(endpoint)

  // Baris yang sedang dibuka di formulir: objek baris, 'new', atau null.
  const [editing, setEditing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const items = data ?? []
  const nameOf = (row) => row?.title ?? row?.name ?? ''

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

  /**
   * Geser satu baris ke atas/bawah lalu kirim ulang seluruh urutan.
   *
   * Nomor urut dirapikan jadi 0..n-1 setiap kali, supaya celah yang
   * ditinggalkan baris terhapus tidak menumpuk.
   */
  async function move(index, direction) {
    const target = index + direction
    if (target < 0 || target >= items.length) return

    const reordered = [...items]
    const moved = reordered[index]
    reordered[index] = reordered[target]
    reordered[target] = moved

    setBusyId(items[index].id)
    try {
      await api.patch(
        `${endpoint}/reorder`,
        reordered.map((item, position) => ({ id: item.id, sortOrder: position })),
      )
      reload()
    } catch (reorderError) {
      toast.error(reorderError.message)
    } finally {
      setBusyId(null)
    }
  }

  const tableColumns = [
    {
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
    },
    ...columns,
    {
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
        {loading && <LoadingState />}
        {error && <ErrorState error={error} onRetry={reload} />}

        {data && items.length === 0 && (
          <EmptyState title={`Belum ada ${label.toLowerCase()}`} description={emptyDescription} />
        )}

        {items.length > 0 && <DataTable columns={tableColumns} rows={items} minWidth={minWidth} />}
      </Card>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? `Tambah ${label}` : `Ubah ${label}`}
        size={formSize}
      >
        {editing !== null && (
          <ResourceForm
            key={editing === 'new' ? 'new' : editing.id}
            defaultValues={editing === 'new' ? defaultValues : toFormValues(editing)}
            fields={fields}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
            submitLabel={editing === 'new' ? 'Simpan' : 'Simpan perubahan'}
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
