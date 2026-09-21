import { Quote } from 'lucide-react'
import { useSite } from '../../hooks/useSite'
import SectionHeading from '../ui/SectionHeading'

/** Testimoni. Seksi ini menghilang selama belum ada datanya. */
export default function TestimonialsSection() {
  const { testimonials } = useSite()
  if (testimonials.length === 0) return null

  return (
    <section className="border-y border-ink-200 bg-white py-20 lg:py-28">
      <div className="container-page">
        <SectionHeading eyebrow="Testimoni" title="Kata mereka tentang Threevo" align="center" />

        <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <li key={item.id} className="flex">
              <figure className="flex flex-1 flex-col rounded-2xl border border-ink-200 bg-ink-50 p-7">
                <Quote className="size-7 text-brand-300" aria-hidden="true" />

                <blockquote className="mt-4 flex-1 leading-relaxed text-ink-600">
                  {item.message}
                </blockquote>

                <figcaption className="mt-6 flex items-center gap-3 border-t border-ink-200 pt-5">
                  {item.photo && (
                    <img
                      src={item.photo}
                      alt=""
                      loading="lazy"
                      className="size-11 rounded-full object-cover"
                    />
                  )}
                  <span>
                    <span className="block font-semibold text-ink-900">{item.name}</span>
                    {(item.position || item.company) && (
                      <span className="block text-sm text-ink-500">
                        {[item.position, item.company].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
