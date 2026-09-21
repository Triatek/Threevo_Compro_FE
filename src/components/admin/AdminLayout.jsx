import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import UserMenu from './UserMenu'

/**
 * Kerangka panel admin: sidebar tetap di layar lebar, laci geser di ponsel.
 */
export default function AdminLayout() {
  // Laci ditutup oleh tautan di dalamnya (lewat onNavigate), tombol tutup,
  // dan lapisan gelap di belakangnya — tidak ada jalan pindah halaman lain
  // selagi laci terbuka, jadi tidak perlu effect yang mengawasi rute.
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-dvh bg-ink-100">
      <a
        href="#konten-admin"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-brand-600 focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
      >
        Lewati ke konten
      </a>

      {/* Sidebar tetap */}
      <div className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <AdminSidebar />
      </div>

      {/* Laci ponsel */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-ink-950/60"
          />
          <div className="absolute inset-y-0 left-0 w-64 shadow-xl">
            <AdminSidebar onNavigate={() => setDrawerOpen(false)} />
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Tutup menu"
            className="absolute left-[17rem] top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          >
            <X className="size-5" />
          </button>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-ink-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Buka menu"
            className="rounded-xl p-2 text-ink-700 transition hover:bg-ink-100 lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <div className="ml-auto">
            <UserMenu />
          </div>
        </header>

        <main id="konten-admin" className="px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
