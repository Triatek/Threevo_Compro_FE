import { Link } from 'react-router-dom'
import { paths } from '../../routes/paths'
import SectionHeading from '../ui/SectionHeading'

/** Narasi "Built by founders, for founders" dari company profile. */
export default function Intro() {
  return (
    <section className="container-page py-20 lg:py-28">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <SectionHeading
          eyebrow="Tentang Threevo"
          title="Dibangun oleh founder, untuk founder"
        />

        <div className="space-y-5 text-ink-500">
          <p className="leading-relaxed">
            Threevo hadir untuk membantu brand yang sedang bertumbuh mengatasi tantangan
            operasional, agar Anda bisa fokus pada inovasi, pelanggan, dan pertumbuhan yang
            berkelanjutan.
          </p>
          <p className="leading-relaxed">
            Kami percaya founder seharusnya menghabiskan waktu membangun visinya, bukan mengurus
            kerumitan operasional. Karena itu kami menjadi mesin operasional di balik setiap tahap
            pertumbuhan Anda.
          </p>
          <Link
            to={paths.about}
            className="inline-block font-semibold text-brand-600 transition hover:text-brand-700"
          >
            Kenali kami lebih jauh
          </Link>
        </div>
      </div>
    </section>
  )
}
