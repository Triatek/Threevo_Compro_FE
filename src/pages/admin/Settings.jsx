import { useForm } from 'react-hook-form'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import Card from '../../components/admin/Card'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Seo from '../../components/ui/Seo'
import { ErrorState, LoadingState } from '../../components/ui/states'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../hooks/useToast'
import { api } from '../../lib/api'

/**
 * Aturan di sini menyalin `SETTING_DEFINITIONS` backend
 * (`settings.schema.js`). Semua nilai boleh kosong — pengaturan yang belum
 * diisi disimpan sebagai string kosong, bukan null.
 */
const optionalUrl = {
  validate: (value) =>
    !value?.trim() || /^https?:\/\/\S+$/i.test(value.trim()) || 'Harus berupa URL http(s)',
}

const GROUPS = [
  {
    title: 'Identitas perusahaan',
    fields: [
      { key: 'company_name', label: 'Nama perusahaan', rules: { maxLength: { value: 150, message: 'Maksimal 150 karakter' } } },
      { key: 'company_tagline', label: 'Tagline', hint: 'Tampil kecil di atas judul hero beranda.', rules: { maxLength: { value: 300, message: 'Maksimal 300 karakter' } } },
      { key: 'footer_text', label: 'Teks footer', rules: { maxLength: { value: 500, message: 'Maksimal 500 karakter' } } },
    ],
  },
  {
    title: 'Kontak',
    fields: [
      { key: 'contact_phone', label: 'Telepon', rules: { maxLength: { value: 50, message: 'Maksimal 50 karakter' } } },
      {
        key: 'contact_email',
        label: 'Email',
        type: 'email',
        rules: {
          validate: (value) =>
            !value?.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || 'Format email tidak valid',
        },
      },
      { key: 'contact_address', label: 'Alamat', multiline: true, rules: { maxLength: { value: 500, message: 'Maksimal 500 karakter' } } },
      { key: 'contact_maps_url', label: 'Tautan Google Maps', type: 'url', rules: optionalUrl },
    ],
  },
  {
    title: 'WhatsApp',
    fields: [
      {
        key: 'whatsapp_number',
        label: 'Nomor WhatsApp',
        hint: 'Format internasional tanpa tanda "+", misalnya 6281234567890.',
        rules: {
          validate: (value) =>
            !value?.trim() ||
            /^[1-9]\d{7,14}$/.test(value.trim()) ||
            'Gunakan format internasional tanpa "+", mis. 6281234567890',
        },
      },
      {
        key: 'whatsapp_message',
        label: 'Pesan awal',
        multiline: true,
        hint: 'Terisi otomatis saat pengunjung menekan tombol WhatsApp.',
        rules: { maxLength: { value: 500, message: 'Maksimal 500 karakter' } },
      },
    ],
  },
  {
    title: 'Media sosial',
    fields: [
      { key: 'social_instagram', label: 'Instagram', type: 'url', rules: optionalUrl },
      { key: 'social_linkedin', label: 'LinkedIn', type: 'url', rules: optionalUrl },
      { key: 'social_youtube', label: 'YouTube', type: 'url', rules: optionalUrl },
      { key: 'social_tiktok', label: 'TikTok', type: 'url', rules: optionalUrl },
    ],
  },
  {
    title: 'Lain-lain',
    fields: [
      {
        key: 'tracking_url',
        label: 'Tautan cek resi',
        type: 'url',
        hint: 'Dipakai bila pelacakan diarahkan ke layanan luar.',
        rules: optionalUrl,
      },
      {
        key: 'lead_notification_email',
        label: 'Email pemberitahuan lead',
        hint: 'Pisahkan dengan koma untuk lebih dari satu alamat. Tidak pernah tampil di situs publik.',
        rules: {
          validate: (value) =>
            !value?.trim() ||
            value.split(',').every((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) ||
            'Harus berupa email yang valid (pisahkan dengan koma untuk lebih dari satu)',
        },
      },
    ],
  },
]

const ALL_KEYS = GROUPS.flatMap((group) => group.fields.map((field) => field.key))

/**
 * Formulir dipasang ulang lewat `key` begitu data tiba, sehingga nilai awalnya
 * cukup diberikan sekali — tidak ada reset dari dalam effect.
 */
function SettingsForm({ values, onSaved }) {
  const toast = useToast()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onTouched', defaultValues: values })

  async function onSubmit(formValues) {
    try {
      // PUT mengganti seluruh set; kirim semua kunci yang dikenal agar isian
      // yang dikosongkan benar-benar ikut terhapus.
      const response = await api.put('/admin/settings', formValues)
      toast.success(response.message)
      onSaved()
    } catch (error) {
      for (const [field, message] of Object.entries(error.fieldErrors ?? {})) {
        if (ALL_KEYS.includes(field)) setError(field, { type: 'server', message })
      }
      toast.error(error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {GROUPS.map((group) => (
        <Card key={group.title} title={group.title}>
          <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
            {group.fields.map((field) => (
              <FormField
                key={field.key}
                id={`setting-${field.key}`}
                label={field.label}
                hint={field.hint}
                error={errors[field.key]?.message}
                className={field.multiline ? 'sm:col-span-2' : undefined}
              >
                {(props) =>
                  field.multiline ? (
                    <textarea rows={3} {...props} {...register(field.key, field.rules)} />
                  ) : (
                    <input
                      type={field.type ?? 'text'}
                      {...props}
                      {...register(field.key, field.rules)}
                    />
                  )
                }
              </FormField>
            ))}
          </div>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : 'Simpan pengaturan'}
        </Button>
      </div>
    </form>
  )
}

export default function Settings() {
  const { data, loading, error, reload } = useFetch('/admin/settings')

  return (
    <>
      <Seo title="Pengaturan — Admin" noIndex />

      <AdminPageHeader
        title="Pengaturan"
        description="Identitas perusahaan, kontak, dan media sosial yang dipakai di seluruh situs."
      />

      {loading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={reload} />}

      {data && (
        <div className="max-w-4xl">
          <SettingsForm key={JSON.stringify(data)} values={data} onSaved={reload} />
        </div>
      )}
    </>
  )
}
