import { ArrowRight } from 'lucide-react'
import { useMemo } from 'react'
import Button from '../components/ui/Button'
import PageHeader from '../components/ui/PageHeader'
import RichText from '../components/ui/RichText'
import Seo from '../components/ui/Seo'
import { ErrorState, LoadingState } from '../components/ui/states'
import { useFetch } from '../hooks/useFetch'
import { useSite } from '../hooks/useSite'
import { extractHeadings, extractPricingSummary } from '../lib/richText'
import { PRICING_SERVICE_SLUG, paths } from '../routes/paths'

function SummaryCards({ summary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {summary.packages.map((pkg, index) => (
        <div
          key={pkg.name}
          className={`rounded-2xl border p-6 ${
            index === 1
              ? 'border-brand-300 bg-brand-50'
              : 'border-white/15 bg-white/5 backdrop-blur'
          }`}
        >
          <p
            className={`text-sm font-semibold ${index === 1 ? 'text-brand-700' : 'text-ink-200'}`}
          >
            {pkg.name}
          </p>
          <p
            className={`mt-2 text-2xl font-bold tracking-tight ${
              index === 1 ? 'text-brand-900' : 'text-white'
            }`}
          >
            {pkg.price}
          </p>
          <p className={`mt-1 text-xs ${index === 1 ? 'text-brand-700' : 'text-ink-400'}`}>
            per bulan
          </p>
        </div>
      ))}
    </div>
  )
}

export default function Pricing() {
  const { data: page, loading, error, reload } = useFetch(`/services/${PRICING_SERVICE_SLUG}`)
  const { whatsappHref } = useSite()

  const content = page?.content
  const headings = useMemo(() => extractHeadings(content), [content])
  const summary = useMemo(() => extractPricingSummary(content), [content])

  if (loading) return <LoadingState label="Memuat daftar harga..." className="min-h-[60vh]" />
  if (error) return <ErrorState error={error} onRetry={reload} className="min-h-[60vh]" />
  if (!page) return null

  return (
    <>
      <Seo
        title={page.metaTitle || 'Paket dan Harga'}
        description={page.metaDescription || page.shortDesc}
      />

      <PageHeader
        eyebrow="Paket dan Harga"
        title="Investasi yang jelas, tanpa angka tersembunyi"
        description={page.shortDesc}
      >
        {summary && (
          <div className="mt-10">
            <SummaryCards summary={summary} />
          </div>
        )}
      </PageHeader>

      <div className="container-page py-16 lg:py-20">
        <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-14">
          {headings.length > 1 && (
            <nav aria-label="Daftar isi" className="mb-12 lg:mb-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
                Daftar isi
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 lg:sticky lg:top-28 lg:flex-col lg:gap-2">
                {headings.map((heading) => (
                  <li key={heading.id}>
                    <a
                      href={`#${heading.id}`}
                      className="text-sm text-ink-500 transition hover:text-brand-600"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className="min-w-0">
            <RichText html={content} />

            <div className="mt-14 flex flex-col gap-3 border-t border-ink-200 pt-10 sm:flex-row">
              <Button to={paths.contact}>
                Ajukan penawaran
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
              {whatsappHref && (
                <Button href={whatsappHref} variant="secondary">
                  Tanya lewat WhatsApp
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
