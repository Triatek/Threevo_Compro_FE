import { ShieldAlert } from 'lucide-react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { adminPaths } from '../../routes/paths'
import { LoadingState } from '../ui/states'

/**
 * Penjaga rute panel admin.
 *
 * `roles` bersifat opsional: bila diisi, hanya peran itu yang boleh masuk.
 * Penjagaan di sini semata-mata demi pengalaman pakai — backend tetap
 * memeriksa token dan peran pada setiap permintaan.
 */
export default function RequireAuth({ roles }) {
  const { user, status, hasRole } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <LoadingState label="Memeriksa sesi..." className="min-h-dvh" />
  }

  if (!user) {
    // Alamat yang dituju dititipkan agar login bisa mengembalikan ke sana.
    return (
      <Navigate to={adminPaths.login} replace state={{ from: location.pathname + location.search }} />
    )
  }

  if (!hasRole(roles)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShieldAlert className="size-7 text-accent-500" aria-hidden="true" />
        <h1 className="mt-4 text-xl">Akses ditolak</h1>
        <p className="mt-2 max-w-prose text-sm text-ink-500">
          Halaman ini hanya untuk Super Admin. Hubungi pemilik akun bila Anda memerlukan aksesnya.
        </p>
      </div>
    )
  }

  return <Outlet />
}
