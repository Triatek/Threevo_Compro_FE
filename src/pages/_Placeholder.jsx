import Seo from '../components/ui/Seo'

/**
 * Rangka sementara. Setiap halaman diganti isi sebenarnya pada fasenya
 * masing-masing (lihat rencana Fase 2-8).
 */
export function Placeholder({ title, note, seoTitle, seoDescription }) {
  return (
    <>
      <Seo title={seoTitle ?? title} description={seoDescription ?? note} />
      <section className="container-page py-20 lg:py-28">
        <p className="text-sm font-medium text-brand-600">Dalam pengembangan</p>
        <h1 className="mt-2 text-4xl lg:text-5xl">{title}</h1>
        {note && <p className="mt-4 max-w-prose text-ink-500">{note}</p>}
      </section>
    </>
  )
}
