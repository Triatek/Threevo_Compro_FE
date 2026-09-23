import { ArrowRight, Check } from 'lucide-react'
import sociatraxLogo from '../assets/brand/sociatrax-logo.jpg'
import Button from '../components/ui/Button'
import PageHeader from '../components/ui/PageHeader'
import SectionHeading from '../components/ui/SectionHeading'
import Seo from '../components/ui/Seo'
import {
  foundersNote,
  missions,
  sociatrax,
  vision,
  whoWeAre,
} from '../content/about'
import { paths } from '../routes/paths'

export default function About() {
  return (
    <>
      <Seo
        title="Tentang Kami"
        description="Threevo adalah commerce enablement company yang menjadi mesin operasional di balik pertumbuhan brand — dari marketplace, gudang, sampai media sosial."
      />

      <PageHeader
        eyebrow={whoWeAre.eyebrow}
        title={whoWeAre.title}
        description={whoWeAre.paragraphs[0]}
      />

      <section className="container-page py-20 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <SectionHeading eyebrow="Nilai Kami" title={foundersNote.title} />
          <div className="space-y-5 text-ink-500">
            <p className="leading-relaxed">{whoWeAre.paragraphs[1]}</p>
            <p className="leading-relaxed">{foundersNote.body}</p>
          </div>
        </div>
      </section>

      <section className="border-y border-ink-200 bg-white py-20 lg:py-28">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div className="relative overflow-hidden rounded-3xl bg-ink-950 p-9 lg:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background: 'radial-gradient(28rem 20rem at 20% 0%, #6c5ae0 0%, transparent 65%)',
              }}
            />
            <div className="relative">
              <h2 className="text-2xl text-white">{vision.title}</h2>
              <p className="mt-5 leading-relaxed text-ink-200">{vision.body}</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl">Misi Kami</h2>
            <ol className="mt-7 space-y-6">
              {missions.map((mission, index) => (
                <li key={mission} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700"
                  >
                    {index + 1}
                  </span>
                  <p className="leading-relaxed text-ink-500">{mission}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="container-page py-20 lg:py-28">
        <div className="grid items-center gap-10 rounded-3xl border border-ink-200 bg-white p-9 lg:grid-cols-2 lg:gap-16 lg:p-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-500">
              {sociatrax.eyebrow}
            </p>
            <img
              src={sociatraxLogo}
              alt={sociatrax.title}
              className="mt-5 h-8 w-auto"
              loading="lazy"
            />
            <p className="mt-6 leading-relaxed text-ink-500">{sociatrax.body}</p>
          </div>

          <ul className="space-y-3">
            {sociatrax.points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <Check className="mt-0.5 size-5 shrink-0 text-accent-500" aria-hidden="true" />
                <span className="text-ink-600">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page pb-20 lg:pb-28">
        <div className="flex flex-col items-start gap-6 border-t border-ink-200 pt-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl">Tertarik bekerja sama?</h2>
            <p className="mt-2 text-ink-500">
              Ceritakan kebutuhan brand Anda, kami susunkan rekomendasinya.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button to={paths.contact}>
              Hubungi Kami
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button to={paths.services} variant="secondary">
              Lihat Layanan
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
