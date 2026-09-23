import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import RichText from '../components/ui/RichText'
import Seo from '../components/ui/Seo'
import ServiceIcon from '../components/ui/ServiceIcon'
import { ErrorState, LoadingState } from '../components/ui/states'
import { useFetch } from '../hooks/useFetch'
import { PRICING_SERVICE_SLUG, paths } from '../routes/paths'
import NotFound from './NotFound'

export default function ServiceDetail() {
  const { slug } = useParams()

  // Konten harga punya halamannya sendiri; hindari dua alamat untuk isi yang
  // sama. Fetch dimatikan agar tidak ada permintaan sia-sia sebelum dialihkan.
  const isPricing = slug === PRICING_SERVICE_SLUG
  const { data: service, loading, error, reload } = useFetch(`/services/${slug}`, {
    enabled: !isPricing,
  })

  if (isPricing) return <Navigate to={paths.pricing} replace />

  if (loading) return <LoadingState label="Memuat layanan..." className="min-h-[60vh]" />
  if (error?.status === 404) return <NotFound />
  if (error) return <ErrorState error={error} onRetry={reload} className="min-h-[60vh]" />
  if (!service) return null

  return (
    <>
      <Seo
        title={service.metaTitle || service.name}
        description={service.metaDescription || service.shortDesc}
        image={service.image}
      />

      <section className="relative overflow-hidden bg-ink-950">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background: 'radial-gradient(45rem 28rem at 15% 0%, #6c5ae0 0%, transparent 62%)',
          }}
        />

        <div className="container-page relative py-16 lg:py-20">
          <Link
            to={paths.services}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-300 transition hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Semua layanan
          </Link>

          <div className="mt-8 flex max-w-3xl flex-col">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-white/10 text-brand-200">
              <ServiceIcon name={service.icon} className="size-7" />
            </span>

            <h1 className="mt-6 text-3xl text-white sm:text-4xl lg:text-5xl">{service.name}</h1>

            {service.shortDesc && (
              <p className="mt-5 max-w-2xl leading-relaxed text-ink-300">{service.shortDesc}</p>
            )}
          </div>
        </div>
      </section>

      {service.image && (
        <div className="container-page -mt-8 lg:-mt-10">
          <img
            src={service.image}
            alt=""
            className="aspect-[16/7] w-full rounded-2xl object-cover shadow-lg"
          />
        </div>
      )}

      <article className="container-page max-w-3xl py-16 lg:py-20">
        <RichText html={service.content} />

        <div className="mt-14 flex flex-col gap-3 border-t border-ink-200 pt-10 sm:flex-row">
          <Button to={paths.contact}>
            Diskusikan kebutuhan Anda
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
          <Button to={paths.pricing} variant="secondary">
            Lihat paket dan harga
          </Button>
        </div>
      </article>
    </>
  )
}
