import { api } from './api'

/**
 * Unggah satu gambar ke /admin/media.
 *
 * Content-Type sengaja dikosongkan supaya axios membiarkan browser yang
 * menyusunnya sendiri — header multipart harus memuat boundary yang hanya
 * diketahui browser, sedangkan instance api memasang application/json.
 */
export function uploadImage(file, { alt } = {}) {
  const body = new FormData()
  body.append('file', file)
  if (alt) body.append('alt', alt)

  return api.post('/admin/media', body, { headers: { 'Content-Type': undefined } })
}

/** Batas yang sama dengan multer di backend, supaya ditolak sebelum dikirim. */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const ACCEPT_ATTRIBUTE = '.jpg,.jpeg,.png,.webp'

/** 1048576 -> "1 MB" */
export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) return null
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
