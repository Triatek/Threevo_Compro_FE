import PageHeader from '../components/ui/PageHeader'
import Seo from '../components/ui/Seo'
import ServiceCard from '../components/ui/ServiceCard'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/states'
import { useFetch } from '../hooks/useFetch'
import { PRICING_SERVICE_SLUG } from '../routes/paths'

export default function Services() {
  const { data, loading, error, reload } = useFetch('/services')

  // Halaman harga disimpan sebagai layanan juga; jangan tampil di grid ini.
  const services = (data ?? []).filter((service) => service.slug !== PRICING_SERVICE_SLUG)

  return (
    <>
      <Seo
        title="Layanan"
        description="Marketplace management, warehouse fulfillment, dan social media management — solusi commerce menyeluruh dari Threevo."
      />

      <PageHeader
        eyebrow="Layanan Kami"
        title="Solusi commerce menyeluruh dalam satu atap"
        description="Memadukan manajemen marketplace, fulfillment gudang, dan pengelolaan media sosial agar brand Anda beroperasi lebih efisien dan tumbuh dengan percaya diri."
      />

      <section className="container-page py-16 lg:py-20">
        {loading && <LoadingState label="Memuat layanan..." />}
        {error && <ErrorState error={error} onRetry={reload} />}

        {!loading && !error && services.length === 0 && (
          <EmptyState
            title="Belum ada layanan"
            description="Daftar layanan sedang disiapkan. Silakan kembali beberapa saat lagi."
          />
        )}

        {services.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
