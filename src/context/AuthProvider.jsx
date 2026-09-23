import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, setSessionExpiredHandler } from '../lib/api'
import { AuthContext } from './authContext'

/**
 * Sesi panel admin.
 *
 * Token tidak pernah menyentuh JavaScript: backend menyimpannya sebagai cookie
 * httpOnly, jadi satu-satunya cara mengetahui apakah pengguna masih login
 * adalah menanyakannya lewat GET /auth/me saat panel dibuka. Selama jawaban
 * itu belum tiba, status bernilai 'loading' dan penjaga rute menahan render —
 * tanpa itu, membuka ulang halaman admin akan berkedip ke layar login.
 */
export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading')
  const [user, setUser] = useState(null)

  useEffect(() => {
    let alive = true

    api
      .get('/auth/me')
      .then(({ data }) => alive && setUser(data))
      .catch(() => alive && setUser(null))
      .finally(() => alive && setStatus('ready'))

    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    // Sesi bisa habis di tengah pemakaian, bukan hanya saat memuat halaman:
    // interceptor memberi tahu lewat kait ini setelah refresh-nya ikut gagal.
    setSessionExpiredHandler(() => setUser(null))
    return () => setSessionExpiredHandler(null)
  }, [])

  const login = useCallback(async (credentials) => {
    const { data } = await api.post('/auth/login', credentials)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      // Apa pun jawaban server, sesi di sisi ini harus berakhir.
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      status,
      login,
      logout,
      isSuperAdmin: user?.role === 'SUPER_ADMIN',
      hasRole: (roles) => !roles?.length || roles.includes(user?.role),
    }),
    [user, status, login, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
