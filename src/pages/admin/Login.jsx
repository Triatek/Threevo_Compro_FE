import { AlertCircle, LogIn } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Seo from '../../components/ui/Seo'
import { LoadingState } from '../../components/ui/states'
import { useAuth } from '../../hooks/useAuth'
import { adminPaths } from '../../routes/paths'

const FORM_FIELDS = ['email', 'password']

const rules = {
  email: {
    required: 'Email wajib diisi',
    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format email tidak valid' },
  },
  password: { required: 'Password wajib diisi' },
}

export default function Login() {
  const { user, status, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onTouched' })

  if (status === 'loading') {
    return <LoadingState label="Memeriksa sesi..." className="min-h-dvh" />
  }

  // Sesi masih hidup: tidak perlu login lagi.
  if (user) return <Navigate to={adminPaths.dashboard} replace />

  async function onSubmit(values) {
    setFormError(null)

    try {
      await login(values)
      // Kembali ke halaman yang tadi dicoba dibuka, kalau ada.
      navigate(location.state?.from ?? adminPaths.dashboard, { replace: true })
    } catch (error) {
      for (const [field, message] of Object.entries(error.fieldErrors ?? {})) {
        if (FORM_FIELDS.includes(field)) setError(field, { type: 'server', message })
      }
      setFormError(error.message)
    }
  }

  return (
    <>
      <Seo title="Masuk Panel Admin" noIndex />

      <div className="flex min-h-dvh items-center justify-center bg-ink-950 px-5 py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 opacity-60"
          style={{
            background: 'radial-gradient(45rem 28rem at 50% 0%, #6c5ae0 0%, transparent 62%)',
          }}
        />

        <div className="relative w-full max-w-md">
          <div className="text-center">
            <span className="text-2xl font-extrabold lowercase tracking-tight text-white">
              threevo
            </span>
            <h1 className="mt-6 text-2xl text-white">Panel Admin</h1>
            <p className="mt-2 text-sm text-ink-300">Masuk dengan akun yang terdaftar.</p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-8 space-y-5 rounded-2xl bg-white p-7 shadow-xl"
          >
            {formError && (
              <div
                role="alert"
                className="flex gap-3 rounded-xl border border-accent-500/40 bg-accent-500/5 p-4 text-sm text-ink-700"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-accent-500" aria-hidden="true" />
                <span>{formError}</span>
              </div>
            )}

            <FormField id="email" label="Email" required error={errors.email?.message}>
              {(props) => (
                <input
                  type="email"
                  autoComplete="username"
                  autoFocus
                  {...props}
                  {...register('email', rules.email)}
                />
              )}
            </FormField>

            <FormField id="password" label="Password" required error={errors.password?.message}>
              {(props) => (
                <input
                  type="password"
                  autoComplete="current-password"
                  {...props}
                  {...register('password', rules.password)}
                />
              )}
            </FormField>

            <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Memproses...' : 'Masuk'}
              {!isSubmitting && <LogIn className="size-4" aria-hidden="true" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-ink-400">
            Lupa password? Hubungi Super Admin untuk mengatur ulang.
          </p>
        </div>
      </div>
    </>
  )
}
