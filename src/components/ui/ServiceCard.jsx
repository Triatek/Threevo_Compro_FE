import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { paths } from '../../routes/paths'
import ServiceIcon from './ServiceIcon'

/** Kartu layanan; dipakai di beranda dan halaman Layanan. */
export default function ServiceCard({ service }) {
  return (
    <Link
      to={paths.serviceDetail(service.slug)}
      className="group flex flex-col rounded-2xl border border-ink-200 bg-white p-7 transition hover:border-brand-300 hover:shadow-lg hover:shadow-brand-600/5"
    >
      <span className="flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
        <ServiceIcon name={service.icon} />
      </span>

      <h3 className="mt-5 text-xl">{service.name}</h3>
      {service.shortDesc && (
        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-500">{service.shortDesc}</p>
      )}

      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
        Selengkapnya
        <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
      </span>
    </Link>
  )
}
