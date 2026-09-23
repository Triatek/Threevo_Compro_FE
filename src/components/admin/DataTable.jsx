/**
 * Tabel daftar untuk panel admin.
 *
 * `columns` berisi `{ key, label, render, className, headerClassName }`.
 * `render(row)` bebas mengembalikan elemen apa pun; kalau tidak diisi, nilai
 * `row[key]` yang ditampilkan. Kolom aksi cukup diberi `label` kosong dan
 * `render` sendiri.
 */
export default function DataTable({ columns, rows, getRowKey = (row) => row.id, minWidth = '44rem' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        <thead>
          <tr className="text-xs uppercase tracking-wide text-ink-500">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`border-b border-ink-200 px-5 py-3 font-medium ${column.headerClassName ?? ''}`}
              >
                {column.label ? column.label : <span className="sr-only">Aksi</span>}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="align-middle">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`border-b border-ink-100 px-5 py-3 ${column.className ?? ''}`}
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
