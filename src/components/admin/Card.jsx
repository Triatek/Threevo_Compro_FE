/** Panel putih dasar untuk mengelompokkan isi di panel admin. */
export default function Card({ title, description, className = '', children }) {
  return (
    <section className={`rounded-2xl border border-ink-200 bg-white ${className}`}>
      {(title || description) && (
        <div className="border-b border-ink-200 px-5 py-4">
          {title && <h2 className="text-base">{title}</h2>}
          {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
        </div>
      )}
      {children}
    </section>
  )
}
