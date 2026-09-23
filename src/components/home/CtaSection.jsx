import { ArrowRight } from 'lucide-react'
import { useSite } from '../../hooks/useSite'
import { paths } from '../../routes/paths'
import Button from '../ui/Button'

export default function CtaSection() {
  const { whatsappHref } = useSite()

  return (
    <section className="container-page py-20 lg:py-24">
      <div className="relative overflow-hidden rounded-3xl bg-ink-950 px-8 py-16 text-center lg:px-16 lg:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(40rem 25rem at 50% 0%, #6c5ae0 0%, transparent 65%)',
          }}
        />

        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl text-white lg:text-4xl">
            Siap menyerahkan operasional Anda kepada kami?
          </h2>
          <p className="mt-5 leading-relaxed text-ink-200">
            Ceritakan kebutuhan brand Anda, dan tim kami akan menyusun rekomendasi paket yang
            paling sesuai dengan tahap pertumbuhan bisnis Anda.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button to={paths.contact} size="lg">
              Ajukan Penawaran
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            {whatsappHref && (
              <Button href={whatsappHref} variant="ghostLight" size="lg">
                Chat WhatsApp
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
