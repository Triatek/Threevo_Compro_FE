import { ArrowRight } from 'lucide-react'
import { useSite } from '../../hooks/useSite'
import { paths } from '../../routes/paths'
import Button from '../ui/Button'

const FALLBACK = {
  title: 'Fokus membangun brand Anda, operasionalnya biar kami yang urus',
  subtitle:
    'Threevo membantu brand yang sedang bertumbuh membangun, menjalankan, dan menskalakan bisnis lewat operasi terintegrasi, fulfillment, manajemen marketplace, dan media sosial.',
}

export default function Hero() {
  const { banners, settings } = useSite()

  // Banner dari admin menang bila ada; kalau belum diisi, pakai narasi brand.
  const banner = banners[0]
  const title = banner?.title ?? FALLBACK.title
  const subtitle = banner?.subtitle ?? FALLBACK.subtitle

  return (
    <section className="relative overflow-hidden bg-ink-950">
      {/*
        Gradient brand dibuat dengan CSS, bukan memakai berkas gambar dari
        company profile: hasilnya praktis sama karena aset itu memang hanya
        gradient kabur, tetapi tanpa biaya unduh 378 KB di layar pertama.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(60rem 40rem at 12% 35%, #6c5ae0 0%, transparent 62%), radial-gradient(45rem 35rem at 85% 20%, #4a3a9e 0%, transparent 60%)',
        }}
      />

      <div className="container-page relative py-24 lg:py-32">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-200">
            {settings.company_tagline || 'Powering Commerce Operations'}
          </p>

          <h1 className="mt-6 text-4xl leading-[1.1] text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-200">{subtitle}</p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            {banner?.ctaLink ? (
              <Button href={banner.ctaLink} size="lg">
                {banner.ctaText || 'Selengkapnya'}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button to={paths.contact} size="lg">
                Konsultasi Gratis
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            )}

            <Button to={paths.services} variant="ghostLight" size="lg">
              Lihat Layanan
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
