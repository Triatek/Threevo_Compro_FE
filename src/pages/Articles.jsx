import { Search, X } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ArticleCard from '../components/ui/ArticleCard'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import Seo from '../components/ui/Seo'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/states'
import { useFetch } from '../hooks/useFetch'

const PER_PAGE = 9

export default function Articles() {
  // Filter disimpan di URL supaya hasil pencarian bisa dibagikan dan tombol
  // kembali di browser bekerja sebagaimana mestinya.
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  const category = searchParams.get('category') ?? ''
  const q = searchParams.get('q') ?? ''

  const [searchDraft, setSearchDraft] = useState(q)

  const { data: categories } = useFetch('/categories')
  const { data, meta, loading, error, reload } = useFetch('/articles', {
    params: {
      page,
      limit: PER_PAGE,
      ...(category && { category }),
      ...(q && { q }),
    },
  })

  const articles = data ?? []

  /** Mengubah filter selalu mengembalikan ke halaman pertama. */
  function updateParams(changes) {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    if (!('page' in changes)) next.delete('page')
    setSearchParams(next)
  }

  const activeCategories = (categories ?? []).filter((item) => item.articleCount > 0)

  return (
    <>
      <Seo
        title="Berita"
        description="Kabar terbaru, tips operasional, dan wawasan seputar commerce dari tim Threevo."
      />

      <PageHeader
        eyebrow="Berita"
        title="Kabar dan wawasan dari Threevo"
        description="Cerita di balik operasional kami, tips praktis, dan perkembangan terbaru seputar commerce."
      />

      <section className="container-page py-16 lg:py-20">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {activeCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateParams({ category: '' })}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  category === ''
                    ? 'bg-brand-600 text-white'
                    : 'border border-ink-300 text-ink-600 hover:bg-ink-100'
                }`}
              >
                Semua
              </button>
              {activeCategories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateParams({ category: item.slug })}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    category === item.slug
                      ? 'bg-brand-600 text-white'
                      : 'border border-ink-300 text-ink-600 hover:bg-ink-100'
                  }`}
                >
                  {item.name}
                  <span className="ml-1.5 text-xs opacity-70">{item.articleCount}</span>
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(event) => {
              event.preventDefault()
              updateParams({ q: searchDraft.trim() })
            }}
            className="relative lg:w-72"
            role="search"
          >
            <label htmlFor="cari-artikel" className="sr-only">
              Cari artikel
            </label>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-400"
              aria-hidden="true"
            />
            <input
              id="cari-artikel"
              type="search"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Cari artikel..."
              className="w-full rounded-full border border-ink-300 bg-white py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-brand-400"
            />
          </form>
        </div>

        {q && (
          <p className="mt-6 flex items-center gap-2 text-sm text-ink-500">
            Menampilkan hasil untuk <strong className="text-ink-900">&ldquo;{q}&rdquo;</strong>
            <button
              type="button"
              onClick={() => {
                setSearchDraft('')
                updateParams({ q: '' })
              }}
              className="inline-flex items-center gap-1 rounded-full border border-ink-300 px-2.5 py-1 text-xs transition hover:bg-ink-100"
            >
              <X className="size-3" aria-hidden="true" />
              Hapus
            </button>
          </p>
        )}

        <div className="mt-10">
          {loading && <LoadingState label="Memuat artikel..." />}
          {error && <ErrorState error={error} onRetry={reload} />}

          {!loading && !error && articles.length === 0 && (
            <EmptyState
              title={q || category ? 'Tidak ada artikel yang cocok' : 'Belum ada artikel'}
              description={
                q || category
                  ? 'Coba kata kunci lain atau pilih kategori yang berbeda.'
                  : 'Kami sedang menyiapkan tulisan pertama. Silakan kembali lagi nanti.'
              }
            />
          )}

          {articles.length > 0 && (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
              <Pagination meta={meta} onChange={(next) => updateParams({ page: String(next) })} />
            </>
          )}
        </div>
      </section>
    </>
  )
}
