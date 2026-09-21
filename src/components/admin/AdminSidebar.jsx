import {
  Building2,
  Image,
  Images,
  Inbox,
  LayoutDashboard,
  MapPin,
  Newspaper,
  Quote,
  ScrollText,
  Settings,
  Sparkles,
  Tags,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { adminNav, adminPaths } from '../../routes/paths'
import Logo from '../layout/Logo'

/**
 * Nama ikon disimpan sebagai teks di `adminNav` supaya berkas rute tetap
 * bebas dari impor komponen; pemetaannya dikumpulkan di sini.
 */
const ICONS = {
  Building2,
  Image,
  Images,
  Inbox,
  LayoutDashboard,
  MapPin,
  Newspaper,
  Quote,
  ScrollText,
  Settings,
  Sparkles,
  Tags,
  Users,
}

const linkBase =
  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition outline-offset-[-2px]'

export default function AdminSidebar({ onNavigate }) {
  const { hasRole } = useAuth()

  return (
    <div className="flex h-full flex-col bg-ink-950">
      <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-5">
        {/* Di dalam panel, logo pulang ke dasbor — bukan keluar ke situs publik. */}
        <Logo to={adminPaths.dashboard} label="Threevo, kembali ke dasbor" />
        <span className="ml-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand-300">
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
        {adminNav.map((group) => {
          const items = group.items.filter((item) => hasRole(item.roles))
          if (!items.length) return null

          return (
            <div key={group.label}>
              <p className="px-3 pb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-400">
                {group.label}
              </p>

              <ul className="space-y-0.5">
                {items.map((item) => {
                  const Icon = ICONS[item.icon]

                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                          `${linkBase} ${
                            isActive
                              ? 'bg-brand-600 text-white'
                              : 'text-ink-300 hover:bg-white/10 hover:text-white'
                          }`
                        }
                      >
                        {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
                        {item.label}
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>
    </div>
  )
}
