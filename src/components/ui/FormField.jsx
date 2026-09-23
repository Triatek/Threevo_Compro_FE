/**
 * Pembungkus satu isian formulir: label, input, dan pesan galat.
 * `error` dihubungkan ke input lewat aria-describedby agar pembaca layar
 * ikut membacakannya.
 */
export default function FormField({
  id,
  label,
  error,
  required = false,
  hint,
  children,
  className = '',
}) {
  const errorId = error ? `${id}-error` : undefined
  const hintId = hint ? `${id}-hint` : undefined

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-ink-800">
        {label}
        {required && (
          <span className="text-accent-500" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>

      {hint && (
        <p id={hintId} className="mt-1 text-xs text-ink-500">
          {hint}
        </p>
      )}

      <div className="mt-2">
        {children({
          id,
          'aria-invalid': error ? true : undefined,
          'aria-describedby': [errorId, hintId].filter(Boolean).join(' ') || undefined,
          className: `w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-ink-500 ${
            error
              ? 'border-accent-500 focus:border-accent-500'
              : 'border-ink-300 focus:border-brand-400'
          }`,
        })}
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-accent-600">
          {error}
        </p>
      )}
    </div>
  )
}
