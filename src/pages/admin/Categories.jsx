import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import Card from '../../components/admin/Card'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import DataTable from '../../components/admin/DataTable'
import Modal from '../../components/admin/Modal'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Seo from '../../components/ui/Seo'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/states'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../hooks/useToast'
import { api } from '../../lib/api'

const rules = {
  name: {
    required: 'Nama kategori wajib diisi',
    minLength: { value: 2, message: 'Nama minimal 2 karakter' },
    maxLength: { value: 100, message: 'Nama maksimal 100 karakter' },
  },
  slug: {
    maxLength: { value: 200, message: 'Slug maksimal 200 karakter' },
    validate: (value) =>
      !value?.trim() ||
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim()) ||
      'Slug hanya boleh huruf kecil, angka, dan tanda hubung',
  },
}

function CategoryForm({ defaultValues, onSubmit, onCancel, submitLabel, isEdit }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onTouched', defaultValues })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-5 px-5 py-5">
        <FormField id="category-name" label="Nama kategori" required error={errors.name?.message}>
          {(props) => <input type="text" data-autofocus {...props} {...register('name', rules.name)} />}
        </FormField>

        <FormField
          id="category-slug"
          label="Slug"
          hint={
            isEdit
              ? 'Mengubah slug akan mengubah alamat filter berita yang sudah tersebar.'
              : 'Kosongkan untuk dibuatkan otomatis dari nama.'
          }
          error={errors.slug?.message}
        >
          {(props) => <input type="text" {...props} {...register('slug', rules.slug)} />}
        </FormField>
      </div>

      <div className="flex justify-end gap-2 border-t border-ink-200 px-5 py-4">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel} disabled={isSubmitting}>
          Batal
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default function Categories() {
  const toast = useToast()
  const { data, loading, error, reload } = useFetch('/admin/categories')

  const [editing, setEditing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const items = data ?? []

  async function handleSubmit(values) {
    // Slug kosong dibiarkan tidak terkirim supaya backend yang membuatkannya.
    const payload = { name: values.name.trim() }
    if (values.slug?.trim()) payload.slug = values.slug.trim()

    try {
      const response =
        editing === 'new'
          ? await api.post('/admin/categories', payload)
          : await api.patch(`/admin/categories/${editing.id}`, payload)

      toast.success(response.message)
      setEditing(null)
      reload()
    } catch (submitError) {
      toast.error(submitError.message)
    }
  }

  async function handleDelete() {
    try {
      const response = await api.delete(`/admin/categories/${pendingDelete.id}`)
      toast.success(response.message)
      setPendingDelete(null)
      reload()
    } catch (deleteError) {
      toast.error(deleteError.message)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Nama',
      render: (row) => <span className="font-medium text-ink-900">{row.name}</span>,
    },
    {
      key: 'slug',
      label: 'Slug',
      render: (row) => <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">{row.slug}</code>,
    },
    {
      key: 'articleCount',
      label: 'Jumlah berita',
      render: (row) => (
        <span className="tabular-nums text-ink-600">{row.articleCount ?? row._count?.articles ?? 0}</span>
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
            aria-label={`Ubah ${row.name}`}
            className="rounded-lg p-2 text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setPendingDelete(row)}
            aria-label={`Hapus ${row.name}`}
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
      <Seo title="Kategori — Admin" noIndex />

      <AdminPageHeader title="Kategori" description="Pengelompokan berita.">
        <Button type="button" size="sm" onClick={() => setEditing('new')}>
          <Plus className="size-4" aria-hidden="true" />
          Tambah Kategori
        </Button>
      </AdminPageHeader>

      <Card>
        {loading && <LoadingState />}
        {error && <ErrorState error={error} onRetry={reload} />}

        {data && items.length === 0 && (
          <EmptyState
            title="Belum ada kategori"
            description="Tambahkan kategori untuk mengelompokkan berita."
          />
        )}

        {items.length > 0 && <DataTable columns={columns} rows={items} minWidth="36rem" />}
      </Card>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Tambah Kategori' : 'Ubah Kategori'}
      >
        {editing !== null && (
          <CategoryForm
            key={editing === 'new' ? 'new' : editing.id}
            isEdit={editing !== 'new'}
            defaultValues={
              editing === 'new' ? { name: '', slug: '' } : { name: editing.name, slug: editing.slug }
            }
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
        title="Hapus kategori ini?"
        description={`"${pendingDelete?.name ?? ''}" akan dihapus. Berita yang memakainya akan kehilangan kategori.`}
      />
    </>
  )
}
