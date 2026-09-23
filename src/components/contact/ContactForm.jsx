import { AlertCircle, CheckCircle2, Send } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import { useSite } from '../../hooks/useSite'
import { api } from '../../lib/api'
import Button from '../ui/Button'
import FormField from '../ui/FormField'

/** Isian yang dikenal formulir; galat dari backend di luar ini diabaikan. */
const FORM_FIELDS = ['name', 'email', 'phone', 'company', 'serviceInterest', 'message']

/** Aturan divalidasi ulang di sini agar pengunjung dapat umpan balik seketika. */
const rules = {
  name: {
    required: 'Nama wajib diisi',
    minLength: { value: 2, message: 'Nama minimal 2 karakter' },
    maxLength: { value: 100, message: 'Nama maksimal 100 karakter' },
  },
  email: {
    required: 'Email wajib diisi',
    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format email tidak valid' },
  },
  phone: {
    pattern: {
      value: /^\+?[\d\s\-().]{6,30}$/,
      message: 'Nomor telepon tidak valid',
    },
  },
  message: {
    required: 'Pesan wajib diisi',
    minLength: { value: 10, message: 'Pesan minimal 10 karakter' },
    maxLength: { value: 5000, message: 'Pesan maksimal 5000 karakter' },
  },
}

export default function ContactForm() {
  const { services } = useSite()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState(null)

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onTouched' })

  async function onSubmit(values) {
    setStatus(null)

    // Sumber trafik ikut dikirim bila ada, supaya tim tahu lead datang dari mana.
    const utmSource = searchParams.get('utm_source')

    try {
      const response = await api.post('/leads', values, {
        params: utmSource ? { utm_source: utmSource } : undefined,
      })
      setStatus({ type: 'success', message: response.message })
      reset()
    } catch (error) {
      const fieldErrors = error.fieldErrors ?? {}
      for (const [field, message] of Object.entries(fieldErrors)) {
        if (FORM_FIELDS.includes(field)) setError(field, { type: 'server', message })
      }
      setStatus({ type: 'error', message: error.message })
    }
  }

  if (status?.type === 'success') {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center">
        <CheckCircle2 className="mx-auto size-10 text-brand-600" aria-hidden="true" />
        <h2 className="mt-4 text-xl text-brand-900">Pesan terkirim</h2>
        <p className="mt-3 text-sm leading-relaxed text-brand-800">{status.message}</p>
        <Button variant="secondary" className="mt-7" type="button" onClick={() => setStatus(null)}>
          Kirim pesan lain
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {status?.type === 'error' && (
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-accent-500/40 bg-accent-500/5 p-4 text-sm text-ink-700"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-accent-500" aria-hidden="true" />
          <span>{status.message}</span>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="name" label="Nama" required error={errors.name?.message}>
          {(props) => <input type="text" {...props} {...register('name', rules.name)} />}
        </FormField>

        <FormField id="email" label="Email" required error={errors.email?.message}>
          {(props) => <input type="email" {...props} {...register('email', rules.email)} />}
        </FormField>

        <FormField id="phone" label="Nomor telepon" error={errors.phone?.message}>
          {(props) => <input type="tel" {...props} {...register('phone', rules.phone)} />}
        </FormField>

        <FormField id="company" label="Nama brand atau perusahaan" error={errors.company?.message}>
          {(props) => <input type="text" {...props} {...register('company')} />}
        </FormField>
      </div>

      <FormField
        id="serviceInterest"
        label="Layanan yang diminati"
        error={errors.serviceInterest?.message}
      >
        {(props) => (
          <select {...props} {...register('serviceInterest')} defaultValue="">
            <option value="">Belum menentukan</option>
            {services.map((service) => (
              <option key={service.id} value={service.name}>
                {service.name}
              </option>
            ))}
            <option value="Paket terintegrasi">Paket terintegrasi</option>
          </select>
        )}
      </FormField>

      <FormField
        id="message"
        label="Pesan"
        required
        hint="Ceritakan kebutuhan brand Anda, misalnya jumlah pesanan per bulan dan marketplace yang dipakai."
        error={errors.message?.message}
      >
        {(props) => <textarea rows={6} {...props} {...register('message', rules.message)} />}
      </FormField>

      {/*
        Honeypot. Disembunyikan dari mata dan dari pembaca layar, tetapi tetap
        ada di DOM supaya bot pengisi-otomatis mengisinya. Backend membuang
        kiriman yang kolom ini terisi, dengan respons yang sama seperti kiriman
        normal agar bot tidak tahu dirinya tertangkap.
      */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
          {!isSubmitting && <Send className="size-4" aria-hidden="true" />}
        </Button>
        <p className="text-xs text-ink-500">Tanda * menandakan isian wajib.</p>
      </div>
    </form>
  )
}
