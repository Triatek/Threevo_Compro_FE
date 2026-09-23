/** Judul seksi dengan label kecil di atasnya. */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'dark',
  className = '',
}) {
  const isCenter = align === 'center'
  const onDark = tone === 'light'

  return (
    <div className={`${isCenter ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} ${className}`}>
      {eyebrow && (
        <p
          className={`text-xs font-semibold uppercase tracking-[0.16em] ${
            onDark ? 'text-brand-300' : 'text-brand-600'
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2 className={`mt-3 text-3xl lg:text-4xl ${onDark ? 'text-white' : ''}`}>{title}</h2>
      {description && (
        <p className={`mt-4 leading-relaxed ${onDark ? 'text-ink-300' : 'text-ink-500'}`}>
          {description}
        </p>
      )}
    </div>
  )
}
