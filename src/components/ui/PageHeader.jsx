/** Kepala halaman bernuansa gelap, dipakai di seluruh halaman dalam. */
export default function PageHeader({ eyebrow, title, description, children }) {
  return (
    <section className="relative overflow-hidden bg-ink-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: 'radial-gradient(45rem 28rem at 15% 0%, #6c5ae0 0%, transparent 62%)',
        }}
      />

      <div className="container-page relative py-16 lg:py-20">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-300">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-3 text-3xl text-white sm:text-4xl lg:text-5xl">{title}</h1>
          {description && (
            <p className="mt-5 max-w-2xl leading-relaxed text-ink-300">{description}</p>
          )}
          {children}
        </div>
      </div>
    </section>
  )
}
