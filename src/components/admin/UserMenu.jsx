import { ChevronDown, ExternalLink, KeyRound, LogOut } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROLE_LABEL } from '../../context/authContext'
import { useAuth } from '../../hooks/useAuth'
import { adminPaths, paths } from '../../routes/paths'

const itemClass =
  'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ink-700 transition hover:bg-ink-100'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return

    const close = (event) => {
      // pointerdown, bukan click: menu harus tertutup sebelum elemen di
      // belakangnya sempat menerima klik yang sama.
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => event.key === 'Escape' && setOpen(false)

    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    navigate(adminPaths.login, { replace: true })
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 transition hover:bg-ink-100"
      >
        <span
          aria-hidden="true"
          className="flex size-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white"
        >
          {user.name.slice(0, 2).toUpperCase()}
        </span>

        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium text-ink-900">{user.name}</span>
          <span className="block text-xs text-ink-500">{ROLE_LABEL[user.role] ?? user.role}</span>
        </span>

        <ChevronDown className="size-4 text-ink-500" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-ink-200 bg-white py-1.5 shadow-lg"
        >
          <p className="border-b border-ink-200 px-4 pb-2.5 pt-1.5 text-xs text-ink-500 sm:hidden">
            {user.name}
          </p>

          <Link to={adminPaths.account} role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
            <KeyRound className="size-4 text-ink-500" aria-hidden="true" />
            Ubah password
          </Link>

          <a
            href={paths.home}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            className={itemClass}
            onClick={() => setOpen(false)}
          >
            <ExternalLink className="size-4 text-ink-500" aria-hidden="true" />
            Lihat situs
          </a>

          <button type="button" role="menuitem" onClick={handleLogout} className={`${itemClass} text-accent-600`}>
            <LogOut className="size-4" aria-hidden="true" />
            Keluar
          </button>
        </div>
      )}
    </div>
  )
}
