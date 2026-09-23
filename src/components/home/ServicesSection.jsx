import { useSite } from '../../hooks/useSite'
import { paths } from '../../routes/paths'
import Button from '../ui/Button'
import SectionHeading from '../ui/SectionHeading'
import ServiceCard from '../ui/ServiceCard'
import { LoadingState } from '../ui/states'

export default function ServicesSection() {
  const { services, loading } = useSite()

  return (
    <section className="border-y border-ink-200 bg-white py-20 lg:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Layanan Kami"
          title="Solusi commerce menyeluruh dalam satu atap"
          description="Memadukan manajemen marketplace, fulfillment gudang, dan pengelolaan media sosial agar brand Anda beroperasi lebih efisien dan tumbuh dengan percaya diri."
          align="center"
        />

        {loading ? (
          <LoadingState label="Memuat layanan..." />
        ) : (
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button to={paths.pricing} variant="secondary">
            Lihat paket dan harga
          </Button>
        </div>
      </div>
    </section>
  )
}
