import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import Card from '../../components/admin/Card'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Seo from '../../components/ui/Seo'
import { ROLE_LABEL } from '../../context/authContext'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../lib/api'
import { formatDateTime } from '../../lib/format'

const FORM_FIELDS = ['currentPassword', 'newPassword']

/** Disalin dari `newPasswordSchema` backend agar galatnya muncul sebelum dikirim. */
const rules = {
  currentPassword: { required: 'Password saat ini wajib diisi' },
  newPassword: {
    required: 'Password baru wajib diisi',
    minLength: { value: 8, message: 'Password minimal 8 karakter' },
    maxLength: { value: 72, message: 'Password maksimal 72 karakter' },
    validate: {
      letter: (value) => /[A-Za-z]/.test(value) || 'Password harus mengandung huruf',
      digit: (value) => /\d/.test(value) || 'Password harus mengandung angka',
    },
  },
}

export default function Account() {
  const { user } = useAuth()
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

    try {
      const response = await api.patch('/auth/me/password', values)
      setStatus({ type: 'success', message: response.message })
      reset()
    } catch (error) {
      for (const [field, message] of Object.entries(error.fieldErrors ?? {})) {
        if (FORM_FIELDS.includes(field)) setError(field, { type: 'server', message })
      }
      setStatus({ type: 'error', message: error.message })
    }
  }

  return (
    <>
      <Seo title="Akun Saya" noIndex />

      <AdminPageHeader title="Akun saya" description="Detail akun dan penggantian password." />

      <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
        <Card title="Detail akun">
          <dl className="divide-y divide-ink-100 text-sm">
            {[
              { label: 'Nama', value: user.name },
              { label: 'Email', value: user.email },
              { label: 'Peran', value: ROLE_LABEL[user.role] ?? user.role },
              { label: 'Login terakhir', value: formatDateTime(user.lastLoginAt) ?? 'Belum pernah' },
            ].map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 px-5 py-3.5">
                <dt className="text-ink-500">{row.label}</dt>
                <dd className="text-right font-medium text-ink-900">{row.value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card title="Ubah password">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 px-5 py-5">
            {status && (
              <div
                role="alert"
                className={`flex gap-3 rounded-xl border p-4 text-sm ${
                  status.type === 'success'
                    ? 'border-brand-200 bg-brand-50 text-brand-800'
                    : 'border-accent-500/40 bg-accent-500/5 text-ink-700'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
                ) : (
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-accent-500" aria-hidden="true" />
                )}
                <span>{status.message}</span>
              </div>
            )}

            <FormField
              id="currentPassword"
              label="Password saat ini"
              required
              error={errors.currentPassword?.message}
            >
              {(props) => (
                <input
                  type="password"
                  autoComplete="current-password"
                  {...props}
                  {...register('currentPassword', rules.currentPassword)}
                />
              )}
            </FormField>

            <FormField
              id="newPassword"
              label="Password baru"
              required
              hint="Minimal 8 karakter, mengandung huruf dan angka."
              error={errors.newPassword?.message}
            >
              {(props) => (
                <input
                  type="password"
                  autoComplete="new-password"
                  {...props}
                  {...register('newPassword', rules.newPassword)}
                />
              )}
            </FormField>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan password'}
            </Button>
          </form>
        </Card>
      </div>
    </>
  )
}
