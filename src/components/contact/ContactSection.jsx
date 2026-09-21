import { Mail, MapPin, Phone } from 'lucide-react'
import { useSite } from '../../hooks/useSite'
import SectionHeading from '../ui/SectionHeading'
import ContactForm from './ContactForm'

function InfoRow({ Icon, label, children }) {
  if (!children) return null

  return (
    <li className="flex gap-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
          {label}
        </span>
        <span className="mt-1 block text-sm text-ink-700">{children}</span>
      </span>
    </li>
  )
}

/**
 * Formulir kontak beserta informasi kontaknya.
 *
 * Dipakai di halaman /kontak dan di bagian bawah beranda. Di /kontak judul
 * seksinya datang dari <PageHeader>, sedangkan di beranda seksi ini menyediakan
 * judulnya sendiri lewat prop `withHeading` — karena itu judul "Kirim pesan"
 * dan "Informasi kontak" ikut turun jadi h3 agar urutan headingnya tetap benar.
 */
export default function ContactSection({ withHeading = false, className = 'py-16 lg:py-20' }) {
  const { settings, whatsappHref } = useSite()
  const Subheading = withHeading ? 'h3' : 'h2'
  const CardHeading = withHeading ? 'h4' : 'h3'

  return (
    <section className={`container-page ${className}`}>
      {withHeading && (
        <SectionHeading
          eyebrow="Kontak"
          title="Mari bicarakan kebutuhan brand Anda"
          description="Ceritakan kondisi operasional Anda saat ini, dan tim kami akan menyusun rekomendasi paket yang paling sesuai."
          className="mb-12"
        />
      )}

      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <div>
          <Subheading className="text-2xl">Kirim pesan</Subheading>
          <p className="mt-2 text-sm text-ink-500">Kami biasanya membalas dalam satu hari kerja.</p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>

        <aside className="lg:pl-4">
          <Subheading className="text-2xl">Informasi kontak</Subheading>

          <ul className="mt-8 space-y-6">
            <InfoRow Icon={MapPin} label="Alamat">
              {settings.contact_address}
            </InfoRow>

            <InfoRow Icon={Phone} label="Telepon">
              {settings.contact_phone && (
                <a
                  href={`tel:${settings.contact_phone.replace(/[^\d+]/g, '')}`}
                  className="transition hover:text-brand-600"
                >
                  {settings.contact_phone}
                </a>
              )}
            </InfoRow>

            <InfoRow Icon={Mail} label="Email">
              {settings.contact_email && (
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="transition hover:text-brand-600"
                >
                  {settings.contact_email}
                </a>
              )}
            </InfoRow>

            {/*
              Jam operasional sengaja belum ditampilkan karena datanya belum
              ada. Tambahkan <InfoRow Icon={Clock} label="Jam operasional">
              di sini setelah jam sebenarnya diketahui.
            */}
          </ul>

          {whatsappHref && (
            <div className="mt-10 rounded-2xl border border-ink-200 bg-white p-6">
              <CardHeading className="text-base">Butuh jawaban cepat?</CardHeading>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                Chat WhatsApp biasanya dibalas lebih cepat daripada formulir.
              </p>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center justify-center rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
              >
                Chat via WhatsApp
              </a>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}
