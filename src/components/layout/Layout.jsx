import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'
import WhatsAppButton from './WhatsAppButton'

/** Kerangka yang membungkus seluruh halaman publik. */
export default function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-brand-600 focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
      >
        Lewati ke konten utama
      </a>

      <Header />

      <main id="konten-utama" className="flex-1">
        <Outlet />
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
