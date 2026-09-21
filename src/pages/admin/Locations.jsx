import PaginatedResource from '../../components/admin/PaginatedResource'
import FormField from '../../components/ui/FormField'
import LocationIcon from '../../components/ui/LocationIcon'

const orNull = (value) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

/** Koordinat dikirim sebagai angka, bukan teks; kosong berarti null. */
const numberOrNull = (value) => {
  const trimmed = value?.toString().trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isNaN(parsed) ? null : parsed
}

const TYPE_LABEL = {
  WAREHOUSE: 'Gudang',
  OFFICE: 'Kantor',
  HUB: 'Hub',
}

const rules = {
  name: {
    required: 'Nama lokasi wajib diisi',
    minLength: { value: 2, message: 'Nama minimal 2 karakter' },
    maxLength: { value: 150, message: 'Nama maksimal 150 karakter' },
  },
  address: {
    required: 'Alamat wajib diisi',
    minLength: { value: 5, message: 'Alamat minimal 5 karakter' },
    maxLength: { value: 300, message: 'Alamat maksimal 300 karakter' },
  },
  city: {
    required: 'Kota wajib diisi',
    minLength: { value: 2, message: 'Kota minimal 2 karakter' },
    maxLength: { value: 100, message: 'Kota maksimal 100 karakter' },
  },
  province: { maxLength: { value: 100, message: 'Provinsi maksimal 100 karakter' } },
  phone: { maxLength: { value: 30, message: 'Telepon maksimal 30 karakter' } },
  mapsUrl: {
    validate: (value) =>
      !value?.trim() || /^https?:\/\/\S+$/i.test(value.trim()) || 'Harus berupa URL http(s)',
  },
  latitude: {
    validate: (value) => {
      if (!value?.toString().trim()) return true
      const parsed = Number(value)
      if (Number.isNaN(parsed)) return 'Latitude harus berupa angka'
      return (parsed >= -90 && parsed <= 90) || 'Latitude harus antara -90 dan 90'
    },
  },
  longitude: {
    validate: (value) => {
      if (!value?.toString().trim()) return true
      const parsed = Number(value)
      if (Number.isNaN(parsed)) return 'Longitude harus berupa angka'
      return (parsed >= -180 && parsed <= 180) || 'Longitude harus antara -180 dan 180'
    },
  },
}

export default function Locations() {
  return (
    <PaginatedResource
      title="Lokasi"
      description="Kantor, gudang, dan hub yang tampil di halaman Lokasi."
      endpoint="/admin/locations"
      label="Lokasi"
      emptyDescription="Tambahkan lokasi untuk mengisi halaman Lokasi."
      searchPlaceholder="Nama, alamat, atau kota"
      minWidth="56rem"
      filterControls={[
        {
          key: 'type',
          label: 'Tipe',
          options: Object.entries(TYPE_LABEL).map(([value, label]) => ({ value, label })),
        },
        {
          key: 'isActive',
          label: 'Status',
          options: [
            { value: 'true', label: 'Aktif' },
            { value: 'false', label: 'Nonaktif' },
          ],
        },
      ]}
      columns={[
        {
          key: 'name',
          label: 'Lokasi',
          render: (row) => (
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-brand-600">
                <LocationIcon type={row.type} className="size-5" />
              </span>
              <div>
                <span className="block font-medium text-ink-900">{row.name}</span>
                <span className="block text-xs text-ink-500">{TYPE_LABEL[row.type] ?? row.type}</span>
              </div>
            </div>
          ),
        },
        {
          key: 'address',
          label: 'Alamat',
          render: (row) => (
            <>
              <p className="line-clamp-2 max-w-sm text-ink-600">{row.address}</p>
              <span className="mt-0.5 block text-xs text-ink-500">
                {[row.city, row.province].filter(Boolean).join(', ')}
              </span>
            </>
          ),
        },
        {
          key: 'phone',
          label: 'Telepon',
          render: (row) => <span className="text-ink-600">{row.phone || '—'}</span>,
        },
      ]}
      defaultValues={{
        name: '',
        type: 'WAREHOUSE',
        address: '',
        city: '',
        province: '',
        phone: '',
        mapsUrl: '',
        latitude: '',
        longitude: '',
      }}
      toFormValues={(row) => ({
        name: row.name,
        type: row.type,
        address: row.address,
        city: row.city,
        province: row.province ?? '',
        phone: row.phone ?? '',
        mapsUrl: row.mapsUrl ?? '',
        latitude: row.latitude ?? '',
        longitude: row.longitude ?? '',
      })}
      toPayload={(values) => ({
        name: values.name.trim(),
        type: values.type,
        address: values.address.trim(),
        city: values.city.trim(),
        province: orNull(values.province),
        phone: orNull(values.phone),
        mapsUrl: orNull(values.mapsUrl),
        latitude: numberOrNull(values.latitude),
        longitude: numberOrNull(values.longitude),
      })}
      fields={({ register, watch, formState: { errors } }) => {
        // Backend menolak koordinat yang hanya terisi sebelah; diingatkan di
        // sini supaya tidak perlu menunggu balasan server.
        const lat = watch('latitude')?.toString().trim()
        const lng = watch('longitude')?.toString().trim()
        const halfFilled = Boolean(lat) !== Boolean(lng)

        return (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="location-name" label="Nama lokasi" required error={errors.name?.message}>
                {(props) => (
                  <input type="text" data-autofocus {...props} {...register('name', rules.name)} />
                )}
              </FormField>

              <FormField id="location-type" label="Tipe" required>
                {(props) => (
                  <select {...props} {...register('type')}>
                    {Object.entries(TYPE_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                )}
              </FormField>
            </div>

            <FormField id="location-address" label="Alamat" required error={errors.address?.message}>
              {(props) => <textarea rows={3} {...props} {...register('address', rules.address)} />}
            </FormField>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="location-city" label="Kota" required error={errors.city?.message}>
                {(props) => <input type="text" {...props} {...register('city', rules.city)} />}
              </FormField>

              <FormField id="location-province" label="Provinsi" error={errors.province?.message}>
                {(props) => <input type="text" {...props} {...register('province', rules.province)} />}
              </FormField>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="location-phone" label="Telepon" error={errors.phone?.message}>
                {(props) => <input type="tel" {...props} {...register('phone', rules.phone)} />}
              </FormField>

              <FormField
                id="location-maps-url"
                label="Tautan Google Maps"
                error={errors.mapsUrl?.message}
              >
                {(props) => (
                  <input type="url" placeholder="https://" {...props} {...register('mapsUrl', rules.mapsUrl)} />
                )}
              </FormField>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="location-latitude" label="Latitude" error={errors.latitude?.message}>
                {(props) => (
                  <input type="text" inputMode="decimal" {...props} {...register('latitude', rules.latitude)} />
                )}
              </FormField>

              <FormField id="location-longitude" label="Longitude" error={errors.longitude?.message}>
                {(props) => (
                  <input type="text" inputMode="decimal" {...props} {...register('longitude', rules.longitude)} />
                )}
              </FormField>
            </div>

            {halfFilled && (
              <p role="alert" className="text-xs text-accent-600">
                Latitude dan longitude harus diisi bersamaan, atau dikosongkan keduanya.
              </p>
            )}
          </>
        )
      }}
    />
  )
}
