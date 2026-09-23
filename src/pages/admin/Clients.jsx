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
    required: 'Nama klien wajib diisi',
    maxLength: { value: 150, message: 'Nama maksimal 150 karakter' },
  },
  website: {
    validate: (value) =>
      !value?.trim() || /^https?:\/\/\S+$/i.test(value.trim()) || 'Harus berupa URL http(s)',
  },
}

export default function Clients() {
  return (
    <SortableResource
      title="Klien"
      description="Logo klien yang tampil di beranda."
      endpoint="/admin/clients"
      label="Klien"
      emptyDescription="Tambahkan logo klien untuk menampilkan seksi ini di beranda."
      columns={[
        {
          key: 'logo',
          label: 'Logo',
          headerClassName: 'w-24',
          render: (row) => (
            <img
              src={row.logo}
              alt=""
              className="h-10 w-20 rounded-lg border border-ink-200 bg-white object-contain p-1"
            />
          ),
        },
        {
          key: 'name',
          label: 'Nama',
          render: (row) => <span className="font-medium text-ink-900">{row.name}</span>,
        },
        {
          key: 'website',
          label: 'Website',
          render: (row) =>
            row.website ? (
              <a
                href={row.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 underline underline-offset-2 transition hover:text-brand-700"
              >
                {row.website.replace(/^https?:\/\//, '')}
              </a>
            ) : (
              <span className="text-ink-400">—</span>
            ),
        },
      ]}
      defaultValues={{ name: '', logo: '', website: '' }}
      toFormValues={(row) => ({
        name: row.name,
        logo: row.logo,
        website: row.website ?? '',
      })}
      toPayload={(values) => ({
        name: values.name.trim(),
        logo: values.logo,
        website: orNull(values.website),
      })}
      fields={({ register, control, formState: { errors } }) => (
        <>
          <Controller
            name="logo"
            control={control}
            rules={{ required: 'Logo wajib dipilih' }}
            render={({ field }) => (
              <ImageField
                id="client-logo"
                label="Logo"
                required
                hint="Gunakan logo berlatar terang atau transparan agar rapi di beranda."
                value={field.value}
                onChange={field.onChange}
                error={errors.logo?.message}
              />
            )}
          />

          <FormField id="client-name" label="Nama klien" required error={errors.name?.message}>
            {(props) => <input type="text" data-autofocus {...props} {...register('name', rules.name)} />}
          </FormField>

          <FormField
            id="client-website"
            label="Website"
            hint="Opsional. Logo akan jadi tautan bila diisi."
            error={errors.website?.message}
          >
            {(props) => (
              <input type="url" placeholder="https://" {...props} {...register('website', rules.website)} />
            )}
          </FormField>
        </>
      )}
    />
  )
}
