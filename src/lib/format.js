const number = new Intl.NumberFormat('id-ID')

const longDate = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/**
 * 2950000 -> "Rp 2.950.000"
 *
 * Dirakit manual, bukan lewat `style: 'currency'`, karena format mata uang
 * menyisipkan spasi tak-putus di antara "Rp" dan angkanya.
 */
export function formatRupiah(value) {
  if (value == null || Number.isNaN(Number(value))) return null
  return `Rp ${number.format(Number(value))}`
}

/** ISO 8601 -> "17 September 2026" */
export function formatDate(isoString) {
  if (!isoString) return null
  const date = new Date(isoString)
  return Number.isNaN(date.getTime()) ? null : longDate.format(date)
}

/** Atribut datetime untuk elemen <time>. */
export function toDateAttr(isoString) {
  if (!isoString) return undefined
  const date = new Date(isoString)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10)
}

const shortDate = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' })

/** ISO 8601 -> "17 Sep"; untuk label sumbu dan tabel yang sempit. */
export function formatShortDate(isoString) {
  if (!isoString) return null
  const date = new Date(isoString)
  return Number.isNaN(date.getTime()) ? null : shortDate.format(date)
}

const dateTime = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/** ISO 8601 -> "17 Sep 2026, 14.05"; dipakai di panel admin. */
export function formatDateTime(isoString) {
  if (!isoString) return null
  const date = new Date(isoString)
  return Number.isNaN(date.getTime()) ? null : dateTime.format(date)
}
