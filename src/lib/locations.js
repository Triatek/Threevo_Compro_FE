/** Label tipe lokasi untuk ditampilkan ke pengunjung. */
export const LOCATION_TYPE_LABELS = {
  WAREHOUSE: 'Gudang',
  OFFICE: 'Kantor',
  HUB: 'Hub',
}

export const locationTypeLabel = (type) => LOCATION_TYPE_LABELS[type] ?? 'Lokasi'

/**
 * Tautan peta untuk sebuah lokasi.
 *
 * `mapsUrl` yang diisi admin selalu menang. Bila kosong tetapi koordinatnya
 * ada, tautan dibentuk dari koordinat. Bila keduanya kosong, dicarikan
 * berdasarkan alamat — lebih baik daripada tidak ada tautan sama sekali.
 */
export function mapsHref(location) {
  if (location.mapsUrl) return location.mapsUrl

  if (location.latitude != null && location.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
  }

  const query = [location.address, location.city, location.province]
    .filter(Boolean)
    .join(', ')
  return query
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    : null
}
