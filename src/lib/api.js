import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1'

/**
 * Error dengan bentuk seragam untuk seluruh aplikasi.
 * `message` selalu berbahasa Indonesia: dari backend bila ada, jika tidak
 * memakai teks cadangan di bawah.
 */
export class ApiError extends Error {
  constructor({ message, code, status, details }) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details ?? []
  }

  /**
   * Field mana yang ditolak backend, untuk react-hook-form.
   * Backend mengirim `{ location, field, message }` per isian yang gagal.
   */
  get fieldErrors() {
    return Object.fromEntries(
      this.details.filter((detail) => detail?.field).map((detail) => [detail.field, detail.message]),
    )
  }
}

const FALLBACK_MESSAGE = {
  404: 'Halaman atau data yang Anda cari tidak ditemukan.',
  422: 'Ada isian yang belum sesuai. Periksa kembali formulir Anda.',
  429: 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.',
  500: 'Terjadi gangguan di server kami. Coba lagi beberapa saat lagi.',
}

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Sesi admin disimpan backend sebagai cookie httpOnly, jadi JavaScript tidak
 * bisa membaca masa berlakunya. Satu-satunya tanda access token kedaluwarsa
 * adalah balasan 401; saat itu terjadi kita menukarnya lewat /auth/refresh dan
 * mengulang permintaan aslinya sekali.
 */
const NON_REFRESHABLE = ['/auth/login', '/auth/refresh', '/auth/logout']

let refreshPromise = null
let onSessionExpired = null

/**
 * Dipasang oleh AuthProvider untuk membersihkan state pengguna ketika sesi
 * benar-benar habis. Ditaruh di sini, bukan di dalam React, supaya lib ini
 * tidak bergantung pada router.
 */
export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler
}

/** Beberapa permintaan yang gagal bersamaan cukup memicu satu kali refresh. */
function refreshSession() {
  refreshPromise ??= api.post('/auth/refresh').finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

function canRefresh(config) {
  if (!config || config._retried) return false
  return !NON_REFRESHABLE.some((path) => (config.url ?? '').startsWith(path))
}

// Backend membungkus semua respons: { success, data, meta? }.
// Interceptor mengembalikan amplopnya, jadi pemanggil cukup menulis:
//   const { data, meta } = await api.get('/articles')
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (axios.isCancel(error)) return Promise.reject(error)

    const status = error.response?.status
    const backendError = error.response?.data?.error

    if (status === 401 && canRefresh(error.config)) {
      error.config._retried = true
      try {
        await refreshSession()
        return await api.request(error.config)
      } catch {
        // Refresh token ikut kedaluwarsa atau dicabut: sesi sudah selesai.
        // Galat 401 yang asli tetap diteruskan ke pemanggil di bawah.
        onSessionExpired?.()
      }
    }

    if (!error.response) {
      // Browser menyembunyikan detail kegagalan CORS dari JavaScript, sehingga
      // origin yang tidak diizinkan tampak sama persis dengan internet putus.
      // Petunjuk ini hanya muncul saat pengembangan.
      if (import.meta.env.DEV) {
        console.warn(
          [
            `[api] Permintaan ke ${BASE_URL} gagal tanpa respons. Kemungkinan penyebab:`,
            '  1. Backend belum berjalan',
            `  2. Origin halaman ini (${window.location.origin}) tidak terdaftar di CORS_ORIGINS backend`,
            '  3. Alamat VITE_API_URL salah',
          ].join('\n'),
        )
      }

      return Promise.reject(
        new ApiError({
          message: 'Tidak dapat menghubungi server. Coba muat ulang halaman beberapa saat lagi.',
          code: 'NETWORK_ERROR',
        }),
      )
    }

    return Promise.reject(
      new ApiError({
        message:
          backendError?.message ??
          FALLBACK_MESSAGE[status] ??
          'Terjadi kesalahan yang tidak terduga.',
        code: backendError?.code,
        status,
        details: backendError?.details,
      }),
    )
  },
)

/** URL absolut ke file upload; backend sudah mengirim URL penuh. */
export const mediaUrl = (url) => url || null
