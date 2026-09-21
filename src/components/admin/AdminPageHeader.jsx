/** Judul halaman panel admin, dengan ruang untuk tombol aksi di kanan. */
export default function AdminPageHeader({ title, description, children }) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-prose text-sm text-ink-500">{description}</p>}
      </div>

      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  )
}
