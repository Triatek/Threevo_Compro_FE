import { createContext } from 'react'

/**
 * Objek context dipisah dari komponen provider-nya supaya setiap berkas hanya
 * mengekspor satu jenis nilai — syarat agar Fast Refresh tetap bekerja.
 */
export const AuthContext = createContext(null)

/** Peran yang dikenal backend (`enum Role` di schema.prisma). */
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  EDITOR: 'EDITOR',
}

export const ROLE_LABEL = {
  SUPER_ADMIN: 'Super Admin',
  EDITOR: 'Editor',
}
