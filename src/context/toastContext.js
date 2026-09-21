import { createContext } from 'react'

/**
 * Objek context dipisah dari komponen provider-nya supaya setiap berkas hanya
 * mengekspor satu jenis nilai — syarat agar Fast Refresh tetap bekerja.
 */
export const ToastContext = createContext(null)
