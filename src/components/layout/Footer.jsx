import { Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSite } from '../../hooks/useSite'
import {
  InstagramIcon,
  LinkedinIcon,
  TiktokIcon,
  YoutubeIcon,
} from '../ui/SocialIcons'
import { mainNav, paths } from '../../routes/paths'
import Logo from './Logo'

const SOCIAL_LINKS = [
  { key: 'social_instagram', label: 'Instagram', Icon: InstagramIcon },
  { key: 'social_linkedin', label: 'LinkedIn', Icon: LinkedinIcon },
  { key: 'social_youtube', label: 'YouTube', Icon: YoutubeIcon },
  { key: 'social_tiktok', label: 'TikTok', Icon: TiktokIcon },
]

function ContactRow({ Icon, children, href }) {
  if (!children) return null

  const content = (
    <span className="flex gap-3 text-sm text-ink-300">
      <Icon className="mt-0.5 size-4 shrink-0 text-brand-400" aria-hidden="true" />
      <span>{children}</span>
    </span>
  )

  return <li>{href ? <a href={href} className="hover:text-white">{content}</a> : content}</li>
}

export default function Footer() {
  const { settings } = useSite()
  const year = new Date().getFullYear()

  const socials = SOCIAL_LINKS.filter(({ key }) => settings[key])

  return (
    <footer className="mt-auto bg-ink-950 text-ink-300">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:py-16">
        <div className="lg:pr-6">
          <Logo withTagline />
          {settings.company_tagline && (
            <p className="mt-5 max-w-xs text-sm leading-relaxed">
              Mitra operasional bagi brand yang sedang bertumbuh — dari marketplace, gudang,
              sampai media sosial.
            </p>
          )}
        </div>

        <nav aria-label="Navigasi footer">
          <h2 className="text-sm font-semibold text-white">Halaman</h2>
          <ul className="mt-4 space-y-2.5">
            {mainNav.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-sm transition hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold text-white">Kontak</h2>
          <ul className="mt-4 space-y-3">
            <ContactRow
              Icon={Phone}
              href={settings.contact_phone ? `tel:${settings.contact_phone.replace(/[^\d+]/g, '')}` : undefined}
            >
              {settings.contact_phone}
            </ContactRow>
            <ContactRow
              Icon={Mail}
              href={settings.contact_email ? `mailto:${settings.contact_email}` : undefined}
            >
              {settings.contact_email}
            </ContactRow>
            <ContactRow Icon={MapPin} href={settings.contact_maps_url || undefined}>
              {settings.contact_address}
            </ContactRow>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">Ikuti Kami</h2>
          {socials.length > 0 ? (
            <ul className="mt-4 flex gap-3">
              {socials.map(({ key, label, Icon }) => (
                <li key={key}>
                  <a
                    href={settings[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex size-10 items-center justify-center rounded-full border border-white/15 transition hover:border-white/40 hover:text-white"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm">Segera hadir.</p>
          )}

          <Link
            to={paths.contact}
            className="mt-6 inline-block text-sm font-semibold text-brand-400 transition hover:text-brand-300"
          >
            Ajukan penawaran
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {settings.footer_text || 'Threevo. Seluruh hak cipta dilindungi.'}
          </p>
          <p>Social media dikelola oleh Sociatrax.</p>
        </div>
      </div>
    </footer>
  )
}
