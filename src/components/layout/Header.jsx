import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { mainNav, paths } from '../../routes/paths'
import Button from '../ui/Button'
import Logo from './Logo'

const linkBase = 'text-sm font-medium transition'

export default function Header() {
  const { pathname } = useLocation()

  // Menu mobile disimpan sebagai "dibuka di halaman mana", bukan boolean.
  // Begitu pengguna berpindah halaman, pathname berubah dan menu tertutup
  // dengan sendirinya — tanpa perlu effect yang memanggil setState.
  const [openedAt, setOpenedAt] = useState(null)
  const isOpen = openedAt === pathname
  const toggle = () => setOpenedAt(isOpen ? null : pathname)

  // Kunci scroll latar saat menu mobile terbuka.
  useEffect(() => {
    if (!isOpen) return
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
    }
  }, [isOpen])

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-950/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-6 lg:h-20">
        <Logo />

        <nav aria-label="Navigasi utama" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {mainNav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === paths.home}
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? 'text-white' : 'text-ink-300 hover:text-white'}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden lg:block">
          <Button to={paths.contact} size="sm">
            Konsultasi Gratis
          </Button>
        </div>

        <button
          type="button"
          onClick={toggle}
          className="-mr-2 p-2 text-white lg:hidden"
          aria-expanded={isOpen}
          aria-controls="menu-mobile"
          aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
        >
          {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {isOpen && (
        <div id="menu-mobile" className="border-t border-white/10 bg-ink-950 lg:hidden">
          <nav aria-label="Navigasi utama mobile" className="container-page py-4">
            <ul className="flex flex-col">
              {mainNav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === paths.home}
                    className={({ isActive }) =>
                      `block border-b border-white/5 py-3 text-base font-medium transition ${
                        isActive ? 'text-white' : 'text-ink-300'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <Button to={paths.contact} size="md" className="mt-5 w-full">
              Konsultasi Gratis
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
