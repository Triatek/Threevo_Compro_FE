import { ExternalLink, MapPin, Phone } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import LocationIcon from '../components/ui/LocationIcon'
import PageHeader from '../components/ui/PageHeader'
import Seo from '../components/ui/Seo'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/states'
import { useFetch } from '../hooks/useFetch'
import { useSite } from '../hooks/useSite'
import { locationTypeLabel, mapsHref } from '../lib/locations'
import { paths } from '../routes/paths'

function LocationCard({ location }) {
  const href = mapsHref(location)

  return (
    <article className="flex flex-col rounded-2xl border border-ink-200 bg-white p-7">
      <div className="flex items-start justify-between gap-4">
        <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <LocationIcon type={location.type} />
        </span>
        <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-600">
          {locationTypeLabel(location.type)}
        </span>
      </div>

      <h2 className="mt-5 text-xl">{location.name}</h2>

      <address className="mt-4 flex-1 space-y-3 not-italic text-sm text-ink-500">
        <span className="flex gap-3">
          <MapPin className="mt-0.5 size-4 shrink-0 text-ink-400" aria-hidden="true" />
          <span>
            {location.address}
            <br />
            {[location.city, location.province].filter(Boolean).join(', ')}
          </span>
        </span>

        {location.phone && (
          <span className="flex gap-3">
            <Phone className="mt-0.5 size-4 shrink-0 text-ink-400" aria-hidden="true" />
            <a
              href={`tel:${location.phone.replace(/[^\d+]/g, '')}`}
              className="transition hover:text-brand-600"
            >
              {location.phone}
            </a>
          </span>
        )}
      </address>

      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
        >
          Lihat di peta
          <ExternalLink className="size-4" aria-hidden="true" />
        </a>
      )}
    </article>
  )
}

export default function Locations() {
  const [searchParams, setSearchParams] = useSearchParams()
  const city = searchParams.get('city') ?? ''
  const { whatsappHref } = useSite()

  // Tanpa filter, supaya daftar kota bisa disusun dari seluruh lokasi aktif.
  const { data, loading, error, reload } = useFetch('/locations')
  const locations = useMemo(() => data ?? [], [data])

  const cities = useMemo(
    () => [...new Set(locations.map((location) => location.city))].sort(),
    [locations],
  )

  const visible = city ? locations.filter((location) => location.city === city) : locations

  function selectCity(value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('city', value)
    else next.delete('city')
    setSearchParams(next)
  }

  return (
    <>
      <Seo
        title="Lokasi"
        description="Gudang dan kantor Threevo. Lihat alamat lengkap, nomor telepon, dan penunjuk arah ke lokasi kami."
      />

      <PageHeader
        eyebrow="Lokasi"
        title="Tempat barang Anda kami rawat"
        description="Kunjungi gudang kami untuk melihat langsung bagaimana stok ditangani, atau hubungi tim untuk menjadwalkan kunjungan."
      />

      <section className="container-page py-16 lg:py-20">
        {/* Filter kota hanya berguna bila ada lebih dari satu kota. */}
        {cities.length > 1 && (
          <div className="mb-10 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => selectCity('')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                city === ''
                  ? 'bg-brand-600 text-white'
                  : 'border border-ink-300 text-ink-600 hover:bg-ink-100'
              }`}
            >
              Semua kota
            </button>
            {cities.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => selectCity(item)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  city === item
                    ? 'bg-brand-600 text-white'
                    : 'border border-ink-300 text-ink-600 hover:bg-ink-100'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {loading && <LoadingState label="Memuat lokasi..." />}
        {error && <ErrorState error={error} onRetry={reload} />}

        {!loading && !error && visible.length === 0 && (
          <EmptyState
            title="Belum ada lokasi"
            description="Informasi lokasi sedang disiapkan. Hubungi kami untuk menanyakan alamat terkini."
          />
        )}

        {visible.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))}
          </div>
        )}

        <div className="mt-14 flex flex-col gap-3 border-t border-ink-200 pt-10 sm:flex-row">
          <Button to={paths.contact}>Jadwalkan kunjungan</Button>
          {whatsappHref && (
            <Button href={whatsappHref} variant="secondary">
              Tanya lewat WhatsApp
            </Button>
          )}
        </div>
      </section>
    </>
  )
}
