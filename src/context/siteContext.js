import { createContext } from 'react'

/**
 * Objek context dipisah dari komponen provider-nya supaya setiap berkas hanya
 * mengekspor satu jenis nilai — syarat agar Fast Refresh tetap bekerja.
 */
export const SiteContext = createContext(null)

/** Nilai cadangan supaya layout tetap tampil saat API belum/gagal merespons. */
export const EMPTY_SITE = {
  settings: {},
  banners: [],
  clients: [],
  testimonials: [],
  services: [],
}
