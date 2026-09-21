/**
 * Sakelar aktif/nonaktif.
 *
 * Dirender sebagai <button role="switch"> alih-alih checkbox bergaya, supaya
 * statusnya dibacakan pembaca layar sebagai "aktif"/"nonaktif" dan bisa
 * ditekan dengan spasi maupun enter.
 */
export default function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? 'bg-brand-600' : 'bg-ink-300'
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-block size-4 rounded-full bg-white transition ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
