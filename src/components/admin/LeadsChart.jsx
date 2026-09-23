import { formatShortDate } from '../../lib/format'

/**
 * Jumlah lead per hari selama 30 hari terakhir — satu deret, jadi tidak perlu
 * legenda: judul kartu yang menamainya.
 *
 * Tinggi batang dihitung terhadap nilai tertinggi, bukan terhadap skala tetap,
 * supaya bentuk grafik tetap terbaca saat jumlahnya masih kecil. Hari tanpa
 * lead tetap digambar sebagai garis tipis agar celahnya tidak terbaca sebagai
 * data yang hilang.
 */
export default function LeadsChart({ data }) {
  const peak = Math.max(0, ...data.map((point) => point.count))
  const total = data.reduce((sum, point) => sum + point.count, 0)
  // Pembagi tidak boleh nol saat belum ada lead sama sekali; `peak` yang
  // sebenarnya tetap dipakai untuk labelnya supaya tidak mengarang angka.
  const scale = peak || 1

  return (
    <div className="px-5 py-6">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm text-ink-500">
          Total <span className="font-semibold text-ink-900">{total}</span> lead dalam 30 hari
        </p>
        <p className="text-xs text-ink-500">Tertinggi {peak}/hari</p>
      </div>

      <div className="mt-6 flex h-40 items-end gap-0.5" role="img" aria-label={`Grafik jumlah lead per hari selama 30 hari terakhir, total ${total} lead`}>
        {data.map((point) => {
          const height = (point.count / scale) * 100

          return (
            <div key={point.date} className="group relative flex h-full flex-1 items-end">
              {/* Area arahkan-kursor setinggi kolom, lebih besar dari batangnya. */}
              <div className="absolute inset-0" aria-hidden="true" />

              <div
                className={`w-full rounded-t ${point.count ? 'bg-brand-600 group-hover:bg-brand-700' : 'bg-ink-200'}`}
                style={{ height: point.count ? `max(${height}%, 0.25rem)` : '2px' }}
              />

              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink-950 px-2.5 py-1.5 text-xs text-white group-hover:block">
                <span className="font-semibold">{point.count}</span> lead
                <span className="text-ink-400"> · {formatShortDate(point.date)}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-2 flex justify-between text-xs text-ink-500">
        <span>{formatShortDate(data.at(0)?.date)}</span>
        <span>{formatShortDate(data.at(-1)?.date)}</span>
      </div>

      <details className="mt-5 text-sm">
        <summary className="cursor-pointer text-ink-600 transition hover:text-ink-900">
          Lihat sebagai tabel
        </summary>

        <div className="mt-3 max-h-64 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Jumlah lead per hari, 30 hari terakhir</caption>
            <thead>
              <tr>
                <th scope="col" className="border-b border-ink-200 py-2 font-medium text-ink-900">
                  Tanggal
                </th>
                <th scope="col" className="border-b border-ink-200 py-2 text-right font-medium text-ink-900">
                  Lead
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((point) => (
                <tr key={point.date}>
                  <td className="border-b border-ink-100 py-1.5 text-ink-600">
                    {formatShortDate(point.date)}
                  </td>
                  <td className="border-b border-ink-100 py-1.5 text-right tabular-nums text-ink-700">
                    {point.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
