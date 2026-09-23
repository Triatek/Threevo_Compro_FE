/**
 * Satu-satunya sumber kebenaran untuk alamat halaman.
 *
 * Harus tetap sinkron dengan `FRONTEND_ROUTES` di backend
 * (`src/modules/seo/seo.service.js`) karena dipakai membentuk sitemap.xml.
 */
export const paths = {
  home: '/',
  about: '/tentang-kami',
  services: '/layanan',
  serviceDetail: (slug = ':slug') => `/layanan/${slug}`,
  pricing: '/harga',
  articles: '/berita',
  articleDetail: (slug = ':slug') => `/berita/${slug}`,
  locations: '/lokasi',
  contact: '/kontak',
}

/** Slug layanan yang isinya tabel harga; tidak ikut tampil di grid /layanan. */
export const PRICING_SERVICE_SLUG = 'paket-harga'

/** Menu utama di header dan footer. */
export const mainNav = [
  { label: 'Beranda', to: paths.home },
  { label: 'Tentang Kami', to: paths.about },
  { label: 'Layanan', to: paths.services },
  { label: 'Harga', to: paths.pricing },
  { label: 'Lokasi', to: paths.locations },
  { label: 'Berita', to: paths.articles },
  { label: 'Kontak', to: paths.contact },
]

/**
 * Alamat panel admin.
 *
 * Sengaja berbahasa Inggris dan sepadan satu-satu dengan nama resource di
 * backend (`/api/v1/admin/<resource>`) supaya hubungan halaman-endpoint
 * langsung terbaca. Halaman publik tetap memakai slug Indonesia karena ia
 * yang diindeks mesin pencari; panel admin tidak.
 */
export const adminPaths = {
  root: '/admin',
  login: '/admin/login',
  dashboard: '/admin',
  banners: '/admin/banners',
  services: '/admin/services',
  locations: '/admin/locations',
  categories: '/admin/categories',
  articles: '/admin/articles',
  media: '/admin/media',
  clients: '/admin/clients',
  testimonials: '/admin/testimonials',
  leads: '/admin/leads',
  users: '/admin/users',
  auditLogs: '/admin/audit-logs',
  settings: '/admin/settings',
  account: '/admin/account',
}

/**
 * Menu sisi panel admin, dikelompokkan seperti alur kerjanya.
 *
 * `roles` membatasi item ke peran tertentu; tanpa `roles` berarti terbuka
 * untuk semua peran yang sudah login. Pembatasan di sini hanya menyembunyikan
 * menu — penjagaan sebenarnya tetap di backend.
 */
export const adminNav = [
  {
    label: 'Ringkasan',
    items: [{ label: 'Dasbor', to: adminPaths.dashboard, icon: 'LayoutDashboard', end: true }],
  },
  {
    label: 'Konten',
    items: [
      { label: 'Banner', to: adminPaths.banners, icon: 'Images' },
      { label: 'Layanan', to: adminPaths.services, icon: 'Sparkles' },
      { label: 'Lokasi', to: adminPaths.locations, icon: 'MapPin' },
      { label: 'Kategori', to: adminPaths.categories, icon: 'Tags' },
      { label: 'Berita', to: adminPaths.articles, icon: 'Newspaper' },
      { label: 'Media', to: adminPaths.media, icon: 'Image' },
    ],
  },
  {
    label: 'Profil Perusahaan',
    items: [
      { label: 'Klien', to: adminPaths.clients, icon: 'Building2' },
      { label: 'Testimoni', to: adminPaths.testimonials, icon: 'Quote' },
    ],
  },
  {
    label: 'Prospek',
    items: [{ label: 'Leads', to: adminPaths.leads, icon: 'Inbox' }],
  },
  {
    label: 'Sistem',
    items: [
      { label: 'Pengguna', to: adminPaths.users, icon: 'Users', roles: ['SUPER_ADMIN'] },
      { label: 'Log Aktivitas', to: adminPaths.auditLogs, icon: 'ScrollText', roles: ['SUPER_ADMIN'] },
      { label: 'Pengaturan', to: adminPaths.settings, icon: 'Settings', roles: ['SUPER_ADMIN'] },
    ],
  },
]
