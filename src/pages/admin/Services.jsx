import { Star } from 'lucide-react'
import { Controller } from 'react-hook-form'
import ImageField from '../../components/admin/ImageField'
import PaginatedResource from '../../components/admin/PaginatedResource'
import FormField from '../../components/ui/FormField'
import ServiceIcon from '../../components/ui/ServiceIcon'

const orNull = (value) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

/**
 * Pilihan ikon dibatasi pada yang dikenali `ServiceIcon`. Backend menerima
 * teks bebas, tetapi nilai di luar daftar ini akan jatuh ke ikon bawaan di
 * situs publik — jadi lebih baik tidak bisa diketik sembarangan.
 */
const ICON_OPTIONS = [
  { value: '', label: 'Bawaan (kotak)' },
  { value: 'store', label: 'Toko' },
  { value: 'package', label: 'Paket' },
  { value: 'boxes', label: 'Gudang / stok' },
  { value: 'truck', label: 'Pengiriman' },
  { value: 'receipt', label: 'Pembukuan' },
  { value: 'megaphone', label: 'Pemasaran' },
]

const rules = {
  name: {
    required: 'Nama layanan wajib diisi',
    minLength: { value: 2, message: 'Nama minimal 2 karakter' },
    maxLength: { value: 150, message: 'Nama maksimal 150 karakter' },
  },
  slug: {
    validate: (value) =>
      !value?.trim() ||
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim()) ||
      'Slug hanya boleh huruf kecil, angka, dan tanda hubung',
  },
  shortDesc: { maxLength: { value: 300, message: 'Deskripsi singkat maksimal 300 karakter' } },
  metaTitle: { maxLength: { value: 70, message: 'Meta title maksimal 70 karakter' } },
  metaDescription: { maxLength: { value: 160, message: 'Meta description maksimal 160 karakter' } },
}

export default function Services() {
  return (
    <PaginatedResource
      title="Layanan"
      description="Daftar layanan Threevo, isi halamannya, dan urutan tampilnya."
      endpoint="/admin/services"
      label="Layanan"
      emptyDescription="Tambahkan layanan untuk mengisi halaman Layanan dan seksi di beranda."
      searchPlaceholder="Nama atau deskripsi layanan"
      minWidth="56rem"
      filterControls={[
        {
          key: 'isActive',
          label: 'Status',
          options: [
            { value: 'true', label: 'Aktif' },
            { value: 'false', label: 'Nonaktif' },
          ],
        },
        {
          key: 'isFeatured',
          label: 'Unggulan',
          options: [
            { value: 'true', label: 'Unggulan' },
            { value: 'false', label: 'Biasa' },
          ],
        },
      ]}
      columns={[
        {
          key: 'name',
          label: 'Layanan',
          render: (row) => (
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-brand-600">
                <ServiceIcon name={row.icon} className="size-5" />
              </span>
              <div>
                <span className="flex items-center gap-1.5 font-medium text-ink-900">
                  {row.name}
                  {row.isFeatured && (
                    <Star
                      className="size-3.5 fill-brand-600 text-brand-600"
                      aria-label="Layanan unggulan"
                    />
                  )}
                </span>
                <code className="mt-0.5 block text-xs text-ink-500">{row.slug}</code>
              </div>
            </div>
          ),
        },
        {
          key: 'shortDesc',
          label: 'Deskripsi singkat',
          render: (row) => (
            <p className="line-clamp-2 max-w-sm text-ink-600">{row.shortDesc || '—'}</p>
          ),
        },
      ]}
      defaultValues={{
        name: '',
        slug: '',
        shortDesc: '',
        content: '',
        icon: '',
        image: null,
        metaTitle: '',
        metaDescription: '',
        isFeatured: false,
      }}
      toFormValues={(row) => ({
        name: row.name,
        slug: row.slug ?? '',
        shortDesc: row.shortDesc ?? '',
        content: row.content ?? '',
        icon: row.icon ?? '',
        image: row.image ?? null,
        metaTitle: row.metaTitle ?? '',
        metaDescription: row.metaDescription ?? '',
        isFeatured: row.isFeatured,
      })}
      toPayload={(values) => ({
        name: values.name.trim(),
        // Slug kosong dibiarkan dibuatkan backend saat menambah; saat mengubah,
        // nilai yang ada selalu ikut terkirim sehingga tidak pernah kosong.
        ...(values.slug?.trim() && { slug: values.slug.trim() }),
        shortDesc: orNull(values.shortDesc),
        content: orNull(values.content),
        icon: orNull(values.icon),
        image: values.image || null,
        metaTitle: orNull(values.metaTitle),
        metaDescription: orNull(values.metaDescription),
        isFeatured: values.isFeatured,
      })}
      fields={({ register, control, formState: { errors } }) => (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="service-name" label="Nama layanan" required error={errors.name?.message}>
              {(props) => (
                <input type="text" data-autofocus {...props} {...register('name', rules.name)} />
              )}
            </FormField>

            <FormField
              id="service-slug"
              label="Slug"
              hint="Kosongkan untuk dibuatkan otomatis."
              error={errors.slug?.message}
            >
              {(props) => <input type="text" {...props} {...register('slug', rules.slug)} />}
            </FormField>
          </div>

          <FormField
            id="service-short-desc"
            label="Deskripsi singkat"
            hint="Tampil di kartu layanan pada beranda dan halaman Layanan."
            error={errors.shortDesc?.message}
          >
            {(props) => <textarea rows={3} {...props} {...register('shortDesc', rules.shortDesc)} />}
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="service-icon" label="Ikon">
              {(props) => (
                <select {...props} {...register('icon')}>
                  {ICON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </FormField>

            <div className="flex items-end">
              <label className="flex items-center gap-2.5 pb-3 text-sm text-ink-800">
                <input
                  type="checkbox"
                  {...register('isFeatured')}
                  className="size-4 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
                />
                Tampilkan sebagai layanan unggulan
              </label>
            </div>
          </div>

          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <ImageField
                id="service-image"
                label="Gambar"
                hint="Opsional. Dipakai di halaman detail layanan."
                clearable
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <FormField
            id="service-content"
            label="Isi halaman"
            hint="HTML sederhana: <h2>, <p>, <ul>, <table>, <a>, <strong>. Tag di luar daftar aman backend akan dibuang saat disimpan."
          >
            {(props) => (
              // className digabung, bukan ditimpa: gaya dasar isian datang dari
              // FormField lewat `props`.
              <textarea
                rows={12}
                {...props}
                className={`${props.className} font-mono text-xs`}
                {...register('content')}
              />
            )}
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="service-meta-title"
              label="Meta title"
              hint="Maksimal 70 karakter."
              error={errors.metaTitle?.message}
            >
              {(props) => <input type="text" {...props} {...register('metaTitle', rules.metaTitle)} />}
            </FormField>

            <FormField
              id="service-meta-description"
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
