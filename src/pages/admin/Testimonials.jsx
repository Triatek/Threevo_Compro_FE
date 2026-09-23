import { Controller } from 'react-hook-form'
import ImageField from '../../components/admin/ImageField'
import SortableResource from '../../components/admin/SortableResource'
import FormField from '../../components/ui/FormField'

const orNull = (value) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

const rules = {
  name: {
    required: 'Nama wajib diisi',
    maxLength: { value: 100, message: 'Nama maksimal 100 karakter' },
  },
  position: { maxLength: { value: 100, message: 'Jabatan maksimal 100 karakter' } },
  company: { maxLength: { value: 150, message: 'Perusahaan maksimal 150 karakter' } },
  message: {
    required: 'Isi testimoni wajib diisi',
    maxLength: { value: 2000, message: 'Testimoni maksimal 2000 karakter' },
  },
}

export default function Testimonials() {
  return (
    <SortableResource
      title="Testimoni"
      description="Kutipan dari klien yang tampil di beranda."
      endpoint="/admin/testimonials"
      label="Testimoni"
      emptyDescription="Tambahkan testimoni untuk menampilkan seksi ini di beranda."
      minWidth="52rem"
      columns={[
        {
          key: 'name',
          label: 'Narasumber',
          render: (row) => (
            <div className="flex items-center gap-3">
              {row.photo && (
                <img
                  src={row.photo}
                  alt=""
                  className="size-9 shrink-0 rounded-full border border-ink-200 object-cover"
                />
              )}
              <div>
                <span className="block font-medium text-ink-900">{row.name}</span>
                {(row.position || row.company) && (
                  <span className="block text-xs text-ink-500">
                    {[row.position, row.company].filter(Boolean).join(' · ')}
                  </span>
                )}
              </div>
            </div>
          ),
        },
        {
          key: 'message',
          label: 'Testimoni',
          render: (row) => (
            <p className="line-clamp-2 max-w-md text-ink-600">{row.message}</p>
          ),
        },
      ]}
      defaultValues={{ name: '', position: '', company: '', message: '', photo: null }}
      toFormValues={(row) => ({
        name: row.name,
        position: row.position ?? '',
        company: row.company ?? '',
        message: row.message,
        photo: row.photo ?? null,
      })}
      toPayload={(values) => ({
        name: values.name.trim(),
        position: orNull(values.position),
        company: orNull(values.company),
        message: values.message.trim(),
        photo: values.photo || null,
      })}
      fields={({ register, control, formState: { errors } }) => (
        <>
          <FormField id="testimonial-name" label="Nama" required error={errors.name?.message}>
            {(props) => <input type="text" data-autofocus {...props} {...register('name', rules.name)} />}
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="testimonial-position" label="Jabatan" error={errors.position?.message}>
              {(props) => <input type="text" {...props} {...register('position', rules.position)} />}
            </FormField>

            <FormField id="testimonial-company" label="Perusahaan" error={errors.company?.message}>
              {(props) => <input type="text" {...props} {...register('company', rules.company)} />}
            </FormField>
          </div>

          <FormField
            id="testimonial-message"
            label="Isi testimoni"
            required
            error={errors.message?.message}
          >
            {(props) => <textarea rows={5} {...props} {...register('message', rules.message)} />}
          </FormField>

          <Controller
            name="photo"
            control={control}
            render={({ field }) => (
              <ImageField
                id="testimonial-photo"
                label="Foto"
                hint="Opsional. Ditampilkan sebagai lingkaran kecil."
                clearable
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </>
      )}
    />
  )
}
