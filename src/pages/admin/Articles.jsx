import { Eye, EyeOff } from 'lucide-react'
import { Controller } from 'react-hook-form'
import ImageField from '../../components/admin/ImageField'
import PaginatedResource from '../../components/admin/PaginatedResource'
import FormField from '../../components/ui/FormField'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../hooks/useToast'
import { api } from '../../lib/api'
import { formatDateTime } from '../../lib/format'

const orNull = (value) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

const rules = {
  title: {
    required: 'Judul wajib diisi',
    minLength: { value: 3, message: 'Judul minimal 3 karakter' },
    maxLength: { value: 200, message: 'Judul maksimal 200 karakter' },
  },
  slug: {
    validate: (value) =>
      !value?.trim() ||
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim()) ||
      'Slug hanya boleh huruf kecil, angka, dan tanda hubung',
  },
  excerpt: { maxLength: { value: 500, message: 'Ringkasan maksimal 500 karakter' } },
  content: { required: 'Isi artikel wajib diisi' },
  metaTitle: { maxLength: { value: 70, message: 'Meta title maksimal 70 karakter' } },
  metaDescription: { maxLength: { value: 160, message: 'Meta description maksimal 160 karakter' } },
}

function StatusBadge({ status }) {
  const published = status === 'PUBLISHED'

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${
        published ? 'border-brand-200 bg-brand-50 text-brand-800' : 'border-ink-200 text-ink-600'
      }`}
    >
      {published && <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-600" />}
      {published ? 'Terbit' : 'Draf'}
    </span>
  )
}

export default function Articles() {
  const toast = useToast()
  // Kategori dipakai untuk penyaring dan pilihan di formulir.
  const { data: categories } = useFetch('/admin/categories')
  const categoryOptions = categories ?? []

  /**
   * Terbit/tarik memakai endpoint khusus, bukan PATCH status, karena backend
   * juga mengatur `publishedAt` dan mencatat aksinya sendiri di log.
   */
  async function togglePublish(row, reload, setBusyId) {
    const action = row.status === 'PUBLISHED' ? 'unpublish' : 'publish'
    setBusyId(row.id)
    try {
      const response = await api.patch(`/admin/articles/${row.id}/${action}`)
      toast.success(response.message)
      reload()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <PaginatedResource
      title="Berita"
      description="Tulis, terbitkan, dan tarik kembali artikel."
      endpoint="/admin/articles"
      label="Berita"
      emptyDescription="Tambahkan artikel untuk mengisi halaman Berita."
      searchPlaceholder="Judul atau isi artikel"
      minWidth="58rem"
      sortable={false}
      activeToggle={false}
      formSize="xl"
      filterControls={[
        {
          key: 'status',
          label: 'Status',
          options: [
            { value: 'PUBLISHED', label: 'Terbit' },
            { value: 'DRAFT', label: 'Draf' },
          ],
        },
        {
          key: 'categoryId',
          label: 'Kategori',
          options: categoryOptions.map((category) => ({
            value: String(category.id),
            label: category.name,
          })),
        },
      ]}
      columns={[
        {
          key: 'title',
          label: 'Judul',
          render: (row) => (
            <div className="flex items-start gap-3">
              {row.coverImage && (
                <img
                  src={row.coverImage}
                  alt=""
                  className="h-11 w-16 shrink-0 rounded-lg border border-ink-200 object-cover"
                />
              )}
              <div>
                <span className="block font-medium text-ink-900">{row.title}</span>
                <code className="mt-0.5 block text-xs text-ink-500">{row.slug}</code>
              </div>
            </div>
          ),
        },
        {
          key: 'category',
          label: 'Kategori',
          render: (row) => <span className="text-ink-600">{row.category?.name ?? '—'}</span>,
        },
        {
          key: 'status',
          label: 'Status',
          headerClassName: 'w-24',
          render: (row) => <StatusBadge status={row.status} />,
        },
        {
          key: 'publishedAt',
          label: 'Terbit',
          headerClassName: 'w-44',
          render: (row) => (
            <span className="text-ink-600">{formatDateTime(row.publishedAt) ?? '—'}</span>
          ),
        },
      ]}
      rowActions={(row, { reload, busy, setBusyId }) => (
        <button
          type="button"
          disabled={busy}
          onClick={() => togglePublish(row, reload, setBusyId)}
          aria-label={`${row.status === 'PUBLISHED' ? 'Tarik' : 'Terbitkan'} ${row.title}`}
          className="rounded-lg p-2 text-ink-600 transition hover:bg-ink-100 hover:text-ink-900 disabled:opacity-40"
        >
          {row.status === 'PUBLISHED' ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      )}
      defaultValues={{
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        coverImage: null,
        categoryId: '',
        metaTitle: '',
        metaDescription: '',
      }}
      toFormValues={(row) => ({
        title: row.title,
        slug: row.slug ?? '',
        excerpt: row.excerpt ?? '',
        content: row.content ?? '',
        coverImage: row.coverImage ?? null,
        categoryId: row.categoryId ? String(row.categoryId) : '',
        metaTitle: row.metaTitle ?? '',
        metaDescription: row.metaDescription ?? '',
      })}
      toPayload={(values) => ({
        title: values.title.trim(),
        ...(values.slug?.trim() && { slug: values.slug.trim() }),
        excerpt: orNull(values.excerpt),
        content: values.content,
        coverImage: values.coverImage || null,
        // Select mengembalikan teks; backend menuntut angka atau null.
        categoryId: values.categoryId ? Number(values.categoryId) : null,
        metaTitle: orNull(values.metaTitle),
        metaDescription: orNull(values.metaDescription),
      })}
      fields={({ register, control, formState: { errors } }) => (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="article-title" label="Judul" required error={errors.title?.message}>
              {(props) => (
                <input type="text" data-autofocus {...props} {...register('title', rules.title)} />
              )}
            </FormField>

            <FormField
              id="article-slug"
              label="Slug"
              hint="Kosongkan untuk dibuatkan otomatis."
              error={errors.slug?.message}
            >
              {(props) => <input type="text" {...props} {...register('slug', rules.slug)} />}
            </FormField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="article-category" label="Kategori">
              {(props) => (
                <select {...props} {...register('categoryId')}>
                  <option value="">Tanpa kategori</option>
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            </FormField>

            <Controller
              name="coverImage"
              control={control}
              render={({ field }) => (
                <ImageField
                  id="article-cover"
                  label="Gambar sampul"
                  clearable
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <FormField
            id="article-excerpt"
            label="Ringkasan"
            hint="Tampil di kartu daftar berita."
            error={errors.excerpt?.message}
          >
            {(props) => <textarea rows={3} {...props} {...register('excerpt', rules.excerpt)} />}
          </FormField>

          <FormField
            id="article-content"
            label="Isi artikel"
            required
            hint="HTML sederhana: <h2>, <p>, <ul>, <blockquote>, <a>, <img>. Tag di luar daftar aman backend akan dibuang saat disimpan."
            error={errors.content?.message}
          >
            {(props) => (
              <textarea
                rows={16}
                {...props}
                className={`${props.className} font-mono text-xs`}
                {...register('content', rules.content)}
              />
            )}
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="article-meta-title"
              label="Meta title"
              hint="Maksimal 70 karakter."
              error={errors.metaTitle?.message}
            >
              {(props) => <input type="text" {...props} {...register('metaTitle', rules.metaTitle)} />}
            </FormField>

            <FormField
              id="article-meta-description"
              label="Meta description"
              hint="Maksimal 160 karakter."
              error={errors.metaDescription?.message}
            >
              {(props) => (
                <textarea rows={2} {...props} {...register('metaDescription', rules.metaDescription)} />
              )}
            </FormField>
          </div>
        </>
      )}
    />
  )
}
