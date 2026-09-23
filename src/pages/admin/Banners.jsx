import { Controller } from 'react-hook-form'
import ImageField from '../../components/admin/ImageField'
import SortableResource from '../../components/admin/SortableResource'
import FormField from '../../components/ui/FormField'

/** Isian kosong dikirim sebagai null; backend menolak string kosong untuk tautan. */
const orNull = (value) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

const rules = {
  title: {
    required: 'Judul wajib diisi',
    maxLength: { value: 150, message: 'Judul maksimal 150 karakter' },
  },
  subtitle: { maxLength: { value: 300, message: 'Subjudul maksimal 300 karakter' } },
  ctaText: { maxLength: { value: 50, message: 'Teks tombol maksimal 50 karakter' } },
  ctaLink: {
    validate: (value) =>
      !value?.trim() ||
      /^https?:\/\/\S+$/i.test(value.trim()) ||
      /^\/(?!\/)\S*$/.test(value.trim()) ||
      'Harus berupa URL http(s) atau path yang diawali "/"',
  },
}

export default function Banners() {
  return (
    <SortableResource
      title="Banner"
      description="Gambar sorot di bagian atas beranda. Banner aktif pertama yang dipakai."
      endpoint="/admin/banners"
      label="Banner"
      emptyDescription="Tambahkan banner untuk mengisi hero di beranda."
      minWidth="52rem"
      columns={[
        {
          key: 'image',
          label: 'Gambar',
          headerClassName: 'w-24',
          render: (row) => (
            <img
              src={row.image}
              alt=""
              className="h-12 w-20 rounded-lg border border-ink-200 object-cover"
            />
          ),
        },
        {
          key: 'title',
          label: 'Judul',
          render: (row) => (
            <>
              <span className="block font-medium text-ink-900">{row.title}</span>
              {row.subtitle && (
                <span className="mt-0.5 block max-w-md truncate text-xs text-ink-500">
                  {row.subtitle}
                </span>
              )}
            </>
          ),
        },
        {
          key: 'cta',
          label: 'Tombol',
          render: (row) =>
            row.ctaText ? (
              <>
                <span className="block text-ink-700">{row.ctaText}</span>
                <span className="block max-w-[14rem] truncate text-xs text-ink-500">
                  {row.ctaLink}
                </span>
              </>
            ) : (
              <span className="text-ink-400">—</span>
            ),
        },
      ]}
      defaultValues={{ title: '', subtitle: '', image: '', ctaText: '', ctaLink: '' }}
      toFormValues={(row) => ({
        title: row.title,
        subtitle: row.subtitle ?? '',
        image: row.image,
        ctaText: row.ctaText ?? '',
        ctaLink: row.ctaLink ?? '',
      })}
      toPayload={(values) => ({
        title: values.title.trim(),
        subtitle: orNull(values.subtitle),
        image: values.image,
        ctaText: orNull(values.ctaText),
        ctaLink: orNull(values.ctaLink),
      })}
      fields={({ register, control, formState: { errors } }) => (
        <>
          <Controller
            name="image"
            control={control}
            rules={{ required: 'Gambar wajib dipilih' }}
            render={({ field }) => (
              <ImageField
                id="banner-image"
                label="Gambar"
                required
                hint="Ukuran lebar disarankan minimal 1600px. Gambar otomatis dikonversi ke WebP."
                value={field.value}
                onChange={field.onChange}
                error={errors.image?.message}
              />
            )}
          />

          <FormField id="banner-title" label="Judul" required error={errors.title?.message}>
            {(props) => <input type="text" data-autofocus {...props} {...register('title', rules.title)} />}
          </FormField>

          <FormField id="banner-subtitle" label="Subjudul" error={errors.subtitle?.message}>
            {(props) => <textarea rows={3} {...props} {...register('subtitle', rules.subtitle)} />}
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="banner-cta-text" label="Teks tombol" error={errors.ctaText?.message}>
              {(props) => <input type="text" {...props} {...register('ctaText', rules.ctaText)} />}
            </FormField>

            <FormField
              id="banner-cta-link"
              label="Tautan tombol"
              hint='Contoh: /kontak atau https://...'
              error={errors.ctaLink?.message}
            >
              {(props) => <input type="text" {...props} {...register('ctaLink', rules.ctaLink)} />}
            </FormField>
          </div>
        </>
      )}
    />
  )
}
