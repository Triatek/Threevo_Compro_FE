/**
 * Pengolahan HTML yang datang dari backend.
 *
 * Isi HTML sudah disanitasi backend sebelum tersimpan, jadi aman di-parse
 * ulang di sini. Semua fungsi mengembalikan nilai apa adanya bila dijalankan
 * di luar browser atau bila HTML-nya kosong.
 */

const canParse = () => typeof DOMParser !== 'undefined'

const parse = (html) => new DOMParser().parseFromString(html, 'text/html')

/** "Total investasi bulanan" -> "total-investasi-bulanan" */
export function slugifyHeading(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Menyiapkan HTML untuk ditampilkan:
 * - setiap <table> dibungkus div yang bisa digulir mendatar
 * - setiap <h2> diberi id agar bisa dituju dari daftar isi
 */
export function prepareRichText(html) {
  if (!html || !canParse()) return html

  const doc = parse(html)

  for (const table of doc.querySelectorAll('table')) {
    const wrapper = doc.createElement('div')
    wrapper.className = 'table-scroll'
    table.replaceWith(wrapper)
    wrapper.append(table)
  }

  for (const heading of doc.querySelectorAll('h2')) {
    if (!heading.id) heading.id = slugifyHeading(heading.textContent)
  }

  return doc.body.innerHTML
}

/** Daftar <h2> beserta id-nya, untuk membangun daftar isi. */
export function extractHeadings(html) {
  if (!html || !canParse()) return []

  return [...parse(html).querySelectorAll('h2')].map((heading) => ({
    id: heading.id || slugifyHeading(heading.textContent),
    text: heading.textContent.trim(),
  }))
}

/**
 * Menarik ringkasan paket dari tabel pertama pada konten harga.
 *
 * Sengaja diturunkan dari isi tabel, bukan ditulis ulang di frontend, supaya
 * angka di kartu ringkasan tidak pernah berbeda dari tabel di bawahnya.
 * Mengembalikan null bila bentuk tabelnya tidak sesuai dugaan, sehingga
 * kartu ringkasan hilang alih-alih menampilkan angka yang keliru.
 */
export function extractPricingSummary(html) {
  if (!html || !canParse()) return null

  const table = parse(html).querySelector('table')
  if (!table) return null

  const headers = [...table.querySelectorAll('thead th')].map((th) => th.textContent.trim())
  // Kolom pertama adalah label baris, sisanya nama paket. Minimal dua paket.
  if (headers.length < 3) return null

  const totalRow = [...table.querySelectorAll('tbody tr')].find((row) =>
    /total/i.test(row.querySelector('th')?.textContent ?? ''),
  )
  if (!totalRow) return null

  const values = [...totalRow.querySelectorAll('td')].map((td) => td.textContent.trim())
  if (values.length !== headers.length - 1) return null

  return {
    label: totalRow.querySelector('th').textContent.trim(),
    packages: headers.slice(1).map((name, index) => ({ name, price: values[index] })),
  }
}
