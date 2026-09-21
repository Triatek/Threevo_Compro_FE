import { useSite } from '../../hooks/useSite'
import SectionHeading from '../ui/SectionHeading'

/** Logo klien. Seksi ini menghilang selama admin belum mengunggah logo. */
export default function ClientsSection() {
  const { clients } = useSite()
  if (clients.length === 0) return null

  return (
    <section className="container-page py-20 lg:py-24">
      <SectionHeading
        eyebrow="Klien Kami"
        title="Dipercaya oleh brand yang sedang bertumbuh"
        align="center"
      />

      <ul className="mt-12 grid grid-cols-2 items-center gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
        {clients.map((client) => {
          const logo = (
            <img
              src={client.logo}
              alt={client.name}
              loading="lazy"
              className="mx-auto h-10 w-auto object-contain opacity-60 transition hover:opacity-100 sm:h-12"
            />
          )

          return (
            <li key={client.id}>
              {client.website ? (
                <a href={client.website} target="_blank" rel="noopener noreferrer">
                  {logo}
                </a>
              ) : (
                logo
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
