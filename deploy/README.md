# Deploy frontend Threevo

Situs ini adalah SPA statis: hasil `npm run build` berupa berkas HTML/JS/CSS di
`dist/` yang dilayani Nginx. Tidak ada proses Node yang berjalan di server —
seluruh data diambil browser langsung dari API.

Acuan utama: `docs/FRONTEND_INTEGRATION.md` di repo backend (§1 keadaan
deployment, §8 langkah deploy frontend). Berkas di folder ini adalah versi siap
pakai dari panduan tersebut.

## Keadaan sekarang

| Hal | Nilai |
|---|---|
| Server | VPS `203.175.11.205` (Ubuntu, Docker Compose + Nginx) |
| Protokol | **HTTP, belum HTTPS** — domain belum dibeli |
| Frontend | `http://203.175.11.205/` → berkas statis di `/var/www/threevo` |
| API | `http://203.175.11.205/api/v1` → proxy ke `127.0.0.1:4000` |
| Domain tujuan | `threevo.id` + `api.threevo.id`, belum aktif |

Frontend dan API berbagi **satu origin**, dibagi per path oleh Nginx. Ini
menyederhanakan dua hal sekaligus: tidak ada CORS, dan cookie sesi admin
terkirim apa adanya tanpa perlu `SameSite=None`.

## 1. Build

Vite menanam `VITE_API_URL` ke dalam bundel **saat build**, bukan membacanya
ketika situs berjalan. Jadi alamat API ditentukan di sini, dan mengubahnya
berarti build ulang.

```powershell
Copy-Item .env.production.example .env.production   # sekali saja
npm ci
npm run build
```

Nilainya sengaja relatif (`/api/v1`), bukan `http://203.175.11.205/api/v1`.
Alamat IP tidak ikut tertanam di bundel, jadi pindah ke domain nanti tidak
memaksa build ulang.

`base` di `vite.config.js` tidak diatur, artinya bernilai `'/'` — sudah benar
untuk pemasangan di root. Kalau setelah deploy yang muncul halaman putih,
penyebab tersering justru ini: periksa apakah `base` pernah diubah.

Cek hasilnya sebelum diunggah:

```powershell
npm run preview     # http://localhost:4173
```

> `npm run preview` ikut menerapkan fallback SPA, jadi memuat ulang di
> `/layanan/xxx` seharusnya tidak 404. Kalau di sini saja sudah 404, masalahnya
> di build, bukan di Nginx. Permintaan API akan gagal di mode preview karena
> `/api/v1` relatif menunjuk ke port 4173 — itu wajar, bukan tanda kesalahan.

## 2. Unggah ke server

```powershell
scp -r dist threevo@203.175.11.205:/tmp/fe-baru
```

Lalu di server, tukar isinya sekaligus:

```bash
sudo rm -rf /var/www/threevo.old
sudo mv /var/www/threevo /var/www/threevo.old 2>/dev/null || true
sudo mv /tmp/fe-baru /var/www/threevo
sudo chown -R www-data:www-data /var/www/threevo
```

Unggah ke folder sementara lalu ditukar seperti di atas supaya pergantian versi
berlangsung seketika. Kalau isi `/var/www/threevo` ditimpa langsung, ada
beberapa detik ketika `index.html` sudah versi baru tetapi berkas di `assets/`
belum terunggah semua — pengunjung pada detik itu mendapat halaman putih.

`/var/www/threevo.old` sengaja disimpan: kalau versi baru bermasalah,
kembalikan dengan menukar kedua folder itu lagi.

## 3. Pasang konfigurasi Nginx

```bash
sudo cp deploy/nginx/threevo.conf /etc/nginx/sites-available/threevo
sudo ln -s /etc/nginx/sites-available/threevo /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Kalau saat deploy backend sudah ada server block yang melayani IP ini, **jangan
dipasang berdampingan** — dua `default_server` di port yang sama membuat
`nginx -t` gagal. Ganti isi berkas lama dengan berkas ini, atau hapus dulu
symlink lama dari `sites-enabled` (biasanya `default`).

Isi konfigurasinya:

| Bagian | Gunanya |
|---|---|
| `try_files $uri $uri/ /index.html` | **Fallback SPA.** Tanpa ini, membuka `/admin/banners` atau menekan refresh di `/berita/judul-artikel` menghasilkan 404 dari Nginx |
| `location ~ ^/(api/v1...)` | Path milik backend: `api/v1`, `uploads`, `docs`, `sitemap.xml`, `robots.txt`. `uploads` wajib ada, tanpa itu gambar dari panel admin tidak tampil |
| `location /assets/` | Cache selamanya — nama berkasnya sudah mengandung hash isi |
| `location = /index.html` | Justru tidak boleh di-cache; berkas inilah yang menunjuk nama aset terbaru |
| `client_max_body_size 10m` | Batas upload gambar 5 MB + overhead multipart |

## 4. Uji setelah deploy

```bash
curl -I http://203.175.11.205/                      # 200
curl -I http://203.175.11.205/admin/banners         # 200, bukan 404  <- fallback SPA
curl -I http://203.175.11.205/assets/tidak-ada.js   # 404, bukan 200  <- aset hilang tetap 404
curl -s http://203.175.11.205/api/v1/health         # {"success":true,...}
curl -s http://203.175.11.205/sitemap.xml | head
curl -s http://203.175.11.205/robots.txt
```

Lalu di browser: buka `/admin/login`, login, **muat ulang halaman**. Kalau
setelah muat ulang kembali ke layar login, penyebabnya cookie, bukan fallback —
periksa `COOKIE_SECURE` di backend (harus `false` selama masih HTTP; cookie
`Secure` tidak akan pernah terkirim lewat koneksi HTTP).

Periksa juga satu gambar dari panel admin benar-benar tampil di situs publik —
itu yang membuktikan proxy `/uploads` bekerja.

## 5. Deploy berikutnya

```powershell
git pull
npm ci
npm run build
# ulangi langkah 2
```

Nginx tidak perlu di-reload selama berkas konfigurasinya tidak berubah.

## 6. Saat domain threevo.id aktif

Urutannya penting supaya situs tidak mati di tengah jalan.

1. **DNS** `threevo.id`, `www.threevo.id`, dan `api.threevo.id` diarahkan ke
   `203.175.11.205`.
2. **Nginx**: ganti `listen 80 default_server` / `server_name _` menjadi
   `server_name threevo.id www.threevo.id;`. Susunan satu-origin di berkas ini
   tetap bisa dipakai apa adanya — API cukup diakses lewat `threevo.id/api/v1`.
   Kalau API dipisah ke `api.threevo.id`, buat server block tersendiri seperti
   `docs/DEPLOYMENT.md` §4 backend, dan tetap biarkan proxy `/uploads`,
   `/sitemap.xml`, `/robots.txt` di server block frontend.
3. **SSL**: `sudo certbot --nginx -d threevo.id -d www.threevo.id -d api.threevo.id`,
   lalu `sudo certbot renew --dry-run`. Certbot menambahkan sendiri blok
   `listen 443 ssl` dan pengalihan HTTP→HTTPS ke berkas konfigurasi. Karena itu
   berkas di repo ini hanya berisi blok port 80 — jangan menyalin ulang berkas
   repo ke server setelah certbot berjalan, kecuali siap menjalankan certbot
   sekali lagi.
4. **Backend** (`.env.production` di repo backend): `SITE_URL`, `API_URL`, dan
   `CORS_ORIGINS` ke `https://threevo.id`, lalu `COOKIE_SECURE=true` dan
   `COOKIE_DOMAIN=.threevo.id`.
5. **Turnstile**: site key asli, dan tambahkan `threevo.id` + `www.threevo.id`
   ke daftar Hostnames widget di dashboard Cloudflare.
6. **Frontend**: `VITE_API_URL` tidak perlu diubah selama tetap relatif. Build
   ulang hanya diperlukan kalau site key Turnstile ikut berubah.
7. Daftarkan `https://threevo.id/sitemap.xml` ke Google Search Console.

Kalau memakai proxy Cloudflare, set SSL mode **Full (strict)**.

## Yang belum beres

- **Form kontak akan gagal di production.** Backend memverifikasi
  `captchaToken` Turnstile, dan frontend belum memasang widget-nya sama sekali —
  tidak ada satu pun kode yang menyebut Turnstile. Token kosong ditolak lebih
  dulu sebelum sampai ke Cloudflare (`src/lib/captcha.js` di backend), jadi
  memakai kunci uji pun tidak menolong: setiap kiriman dibalas
  `400 Verifikasi CAPTCHA gagal`. Ini pekerjaan frontend yang masih terbuka,
  bukan urusan konfigurasi deployment.
- **Halaman 404 membalas status 200.** Konsekuensi wajar fallback SPA: server
  tidak tahu alamat mana yang sah, jadi semuanya dibalas `index.html` dan React
  yang memutuskan menampilkan `pages/NotFound.jsx`. Mesin pencari membacanya
  sebagai *soft 404*. Memperbaikinya butuh daftar rute sah di sisi Nginx atau
  rendering di server — keduanya di luar cakupan saat ini.
- **Aset belum di-precompress.** `gzip on` menekan saat permintaan datang. Kalau
  nanti terasa berat, `gzip_static` dengan berkas `.gz`/`.br` hasil build lebih
  hemat CPU.
