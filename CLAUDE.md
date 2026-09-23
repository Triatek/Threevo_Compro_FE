# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# CLAUDE.md — Threevo Compro Frontend

Situs company profile perusahaan jasa **fulfillment & logistik** plus panel admin-nya,
dibangun dengan React + Vite. Semua data datang dari backend di repo terpisah
(`Threevo_Compro_BE`, biasanya di `../Threevo_Compro_BE`). Repo ini tidak punya
database maupun server sendiri.

Kontrak API yang jadi acuan ada di backend: **`docs/openapi.yaml`** dan
**`docs/BACKEND_SPEC.md`**. Baca skema Zod di `src/modules/<fitur>/<fitur>.schema.js`
sebelum membuat atau mengubah formulir.

Ringkasan kontraknya tersedia langsung di repo ini: **`docs/BACKEND_INTEGRATION.md`**
(salinan `docs/FRONTEND_INTEGRATION.md` milik backend) — bentuk respons, aturan
form kontak, daftar endpoint, dan keadaan deployment.

## Komunikasi

- Gunakan **Bahasa Indonesia** saat berkomunikasi dengan saya. Kode, nama variabel,
  dan pesan commit dalam bahasa Inggris; **komentar kode dan seluruh teks yang dilihat
  pengguna dalam Bahasa Indonesia**.
- Tanyakan dulu sebelum: menghapus data di database backend, mengubah keputusan teknis
  di bawah, atau menambah dependency baru.

## Lingkungan

- OS **Windows**, shell **PowerShell**. Node.js 22.
- Repo Git: `Triatek/Threevo_Compro_FE` (SSH).
- Butuh backend berjalan di `http://localhost:4000` dan origin dev (`http://localhost:5173`)
  terdaftar di `CORS_ORIGINS` backend. Alamat API diatur lewat `VITE_API_URL` di `.env`.
- Sesi admin memakai cookie httpOnly, jadi backend dan frontend harus sama-sama berjalan
  di `localhost` agar cookie-nya terkirim.

## Keputusan teknis (jangan diubah tanpa persetujuan)

| Hal | Pilihan |
|---|---|
| Bahasa | **JavaScript** (ES Modules), bukan TypeScript |
| Build | **Vite 8** + `@vitejs/plugin-react` |
| UI | **React 19** |
| Routing | **react-router-dom 7** |
| Styling | **Tailwind CSS 4** lewat `@tailwindcss/vite` — token di `@theme` dalam `src/index.css`, **tidak ada `tailwind.config.js`** |
| Formulir | **react-hook-form** |
| HTTP | **axios**, satu instance di `src/lib/api.js` |
| Ikon | **lucide-react** |
| Animasi | **motion** |
| Font | Plus Jakarta Sans, dimuat di `index.html` |

Tidak ada framework pengujian — repo ini belum punya tes sama sekali.

## Struktur

```
src/
  components/
    admin/     kerangka & komponen panel admin
    home/      seksi-seksi beranda
    layout/    Header, Footer, Layout, Logo, WhatsAppButton
    ui/        primitif dipakai bersama publik & admin
  content/     about.js — teks halaman Tentang Kami (hardcoded, bukan dari API)
  context/     <nama>Context.js (createContext) + <Nama>Provider.jsx
  hooks/       useFetch, useSite, useAuth, useToast
  lib/         api.js, format.js, upload.js, richText.js, locations.js
  pages/       halaman publik; pages/admin/ untuk panel
  routes/      paths.js, AppRoutes.jsx, AdminRoutes.jsx
```

## Aturan & pola yang tidak terlihat dari satu file

**Amplop respons.** Backend selalu membungkus `{ success, data, meta? }`. Interceptor di
`lib/api.js` mengembalikan amplopnya, jadi pemanggil menulis
`const { data, meta } = await api.get('/articles')`. Kegagalan selalu berupa `ApiError`
dengan `message` berbahasa Indonesia; `error.fieldErrors` sudah berbentuk
`{ namaField: pesan }` siap dipakai `setError` react-hook-form.

**Sesi admin.** Token ada di cookie httpOnly dan tidak pernah tersentuh JavaScript.
Balasan 401 memicu satu kali `POST /auth/refresh` lalu permintaan aslinya diulang;
beberapa 401 bersamaan hanya memicu satu refresh. Kalau refresh ikut gagal,
`setSessionExpiredHandler` memberi tahu `AuthProvider` untuk mengosongkan sesi —
kait itu ada supaya `lib/api.js` tidak perlu tahu soal React atau router.

**Context selalu dipecah dua berkas.** `xContext.js` hanya mengekspor `createContext()`,
`XProvider.jsx` hanya mengekspor komponen. Satu berkas satu jenis ekspor, syarat agar
Fast Refresh tetap bekerja.

**`routes/paths.js` adalah satu-satunya sumber alamat halaman** dan harus tetap sinkron
dengan `FRONTEND_ROUTES` di backend (`src/modules/seo/seo.service.js`) karena dipakai
membentuk sitemap.xml. Alamat publik berbahasa Indonesia (demi SEO), alamat admin
berbahasa Inggris dan sepadan satu-satu dengan nama resource di API.

**Panel admin dimuat terpisah.** `AppRoutes` me-`lazy()` `AdminRoutes`, jadi pengunjung
situs tidak pernah mengunduh bundel admin. `SiteProvider` hanya membungkus rute publik;
`AuthProvider` + `ToastProvider` hanya membungkus rute admin.

**Jangan setState di dalam effect.** ESLint memasang `react-hooks/set-state-in-effect`
sebagai *error*. Pola yang dipakai di repo ini: formulir diisi nilai awal lewat
`defaultValues` dan **dipasang ulang dengan prop `key`** ketika barisnya berganti,
bukan di-`reset()` dari effect. `useFetch` juga menurunkan status `loading` saat render
dengan membandingkan permintaan yang diminta dan yang selesai.

`watch()` dari react-hook-form memicu peringatan `react-hooks/incompatible-library`.
Pakai hanya kalau memang perlu nilai yang berubah langsung.

**`FormField` memberi `className` lewat argumen render.** Kalau isian butuh gaya
tambahan, gabungkan (`` className={`${props.className} font-mono`} ``), jangan ditimpa —
menimpanya menghilangkan gaya dasar dan penanda galat.

**Komponen ikon memakai `switch` yang mengembalikan JSX**, bukan peta nama→komponen.
Pola peta membuat React menganggap ada komponen baru tiap render sehingga state-nya
ter-reset. Lihat `ServiceIcon.jsx` dan `LocationIcon.jsx`.

**Metadata halaman** memakai komponen `<Seo>`; React 19 sendiri yang memindahkan
`<title>` dan `<meta>` ke `<head>`, jadi tidak perlu react-helmet. `index.html` sengaja
tidak memuat meta description — React 19 menambah tag baru alih-alih menggantinya,
sehingga akan muncul ganda.

**HTML dari backend** (`service.content`, `article.content`) sudah disanitasi backend
dengan allow-list, dirender lewat `<RichText>` dan ditata oleh kelas `.prose-threevo`
di `index.css` — penataannya lewat selektor turunan, bukan class per elemen.

**Token warna** ada di blok `@theme` `src/index.css`: `brand` (ungu), `ink` (netral
hangat), `accent` (oranye Sociatrax). `ink-500` dipilih agar kontrasnya di atas latar
krem lolos WCAG AA — jangan diterangkan.

Alias `@` → `./src` ada di `vite.config.js` tetapi belum dipakai; impor di repo ini
memakai path relatif.

## Panel admin

Tiga jenis halaman daftar, pilih sesuai bentuk endpoint-nya di backend:

| Komponen | Untuk | Ciri endpoint |
|---|---|---|
| `SortableResource` | banner, klien, testimoni | daftar utuh tanpa paginasi + `PATCH /reorder` (backend: `createSortableService`) |
| `PaginatedResource` | layanan, lokasi, berita, pengguna | daftar berpaginasi; `sortable`/`activeToggle` bisa dimatikan |
| halaman sendiri | media, leads, kategori, pengaturan, log | bentuknya tidak seragam |

**Formulir ubah di `PaginatedResource` selalu mengambil `GET <endpoint>/<id>` dulu.**
Ini wajib, bukan optimasi: beberapa endpoint daftar memangkas kolom besar
(`listServices` dan `listArticles` membuang `content`). Mengisi formulir dari baris
tabel membuat kolom itu tampak kosong dan **ikut terkirim sebagai null saat disimpan,
sehingga isi halaman terhapus tanpa disadari.**

**Urutan pada resource berpaginasi ditukar, bukan dirapikan ulang.** Nomor 0..n-1 hanya
aman untuk daftar utuh; pada daftar terpotong, baris di halaman lain tidak ikut terkirim
dan nomornya bentrok. Karena itu `PaginatedResource` menukar nilai `sortOrder` dua baris
bersebelahan saja.

**Aturan validasi di formulir menyalin skema Zod backend** supaya galat muncul sebelum
permintaan dikirim. Kalau skema di backend berubah, aturan di sini ikut diperbarui.
Perhatikan beda **string kosong vs null**: untuk kolom nullable bertipe URL/tautan,
backend menolak `''` — kirim `null`.

`Modal` memindahkan fokus ke elemen ber-atribut `data-autofocus`, menahan Tab di dalam
dialog, dan mengembalikan fokus ke pemicunya saat ditutup. Tandai satu isian dengan
`data-autofocus` di tiap formulir.

Pembatasan peran di sidebar (`adminNav` di `paths.js`) dan `RequireAuth roles={[...]}`
hanya demi pengalaman pakai. Penjagaan sebenarnya ada di backend: `/admin/settings`,
`/admin/users`, `/admin/audit-logs`, dan hapus lead memasang `requireRole('SUPER_ADMIN')`.

## Perintah

```powershell
npm run dev      # Vite dev server di http://localhost:5173
npm run build    # build produksi ke dist/
npm run preview  # pratinjau hasil build
npm run lint     # eslint (harus bersih sebelum commit)
```

Deploy ke VPS: lihat **`deploy/README.md`** (server block Nginx siap pakai ada di
`deploy/nginx/threevo.conf`; fallback SPA-nya wajib, tanpa itu `/admin/banners`
404 saat dibuka langsung).

Backend harus berjalan lebih dulu (`npm run dev` di repo BE). Kalau permintaan gagal
tanpa respons, `lib/api.js` mencetak petunjuk penyebabnya di console saat development.

## Belum dikerjakan

- **Jadwal terbit artikel.** Backend menjadwalkan artikel lewat `publishedAt` di masa
  depan, tetapi panel admin hanya punya tombol terbit/tarik — tanggalnya belum bisa diisi.
- **Alt text media.** `uploadImage()` sudah menerima `alt` dan backend menyimpannya,
  tetapi belum ada layar yang mengirimkannya.
- **CAPTCHA form kontak.** Backend memverifikasi `captchaToken` Turnstile dan menolak
  token kosong sebelum menghubungi Cloudflare, sedangkan frontend belum memasang
  widget-nya sama sekali. Akibatnya **form kontak selalu gagal di production**
  (`400 Verifikasi CAPTCHA gagal`), termasuk saat backend memakai kunci uji.
  Honeypot `website` sudah ada di `ContactForm.jsx`; yang kurang hanya widget dan
  `captchaToken` di payload. Lihat `docs/BACKEND_INTEGRATION.md` §5.
- **Halaman cek resi.** Backend punya `/tracking/:awb` dan setting `tracking_url`;
  halamannya sengaja ditunda.
- **Logo** masih dirender sebagai teks (lihat catatan di `Logo.jsx`), menunggu aset SVG
  atau PNG transparan.
- Teks Intro & CTA di beranda dan seluruh halaman Tentang Kami **sengaja hardcoded**
  (`components/home/Intro.jsx`, `CtaSection.jsx`, `content/about.js`). Membuatnya bisa
  diatur admin butuh perubahan backend lebih dulu, bukan hanya frontend.
