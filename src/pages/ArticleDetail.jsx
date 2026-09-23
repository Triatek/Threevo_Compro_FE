import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import ArticleCard from '../components/ui/ArticleCard'
import RichText from '../components/ui/RichText'
import Seo from '../components/ui/Seo'
import { ErrorState, LoadingState } from '../components/ui/states'
import { useFetch } from '../hooks/useFetch'
import { formatDate, toDateAttr } from '../lib/format'
import { paths } from '../routes/paths'
import NotFound from './NotFound'

export default function ArticleDetail() {
  const { slug } = useParams()
  const { data: article, loading, error, reload } = useFetch(`/articles/${slug}`)

  if (loading) return <LoadingState label="Memuat artikel..." className="min-h-[60vh]" />
  if (error?.status === 404) return <NotFound />
  if (error) return <ErrorState error={error} onRetry={reload} className="min-h-[60vh]" />
  if (!article) return null

  const related = article.related ?? []

  return (
    <>
      <Seo
        title={article.metaTitle || article.title}
        description={article.metaDescription || article.excerpt}
        image={article.coverImage}
      />

      <section className="relative overflow-hidden bg-ink-950">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background: 'radial-gradient(45rem 28rem at 15% 0%, #6c5ae0 0%, transparent 62%)',
          }}
        />

        <div className="container-page relative py-16 lg:py-20">
          <Link
            to={paths.articles}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-300 transition hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Semua berita
          </Link>

          <div className="mt-8 max-w-3xl">
            {article.category && (
              <Link
                to={`${paths.articles}?category=${article.category.slug}`}
                className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-300 transition hover:text-brand-200"
              >
                {article.category.name}
              </Link>
            )}

            <h1 className="mt-3 text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>

            <p className="mt-6 text-sm text-ink-400">
              {article.publishedAt && (
                <time dateTime={toDateAttr(article.publishedAt)}>
                  {formatDate(article.publishedAt)}
                </time>
              )}
              {article.author?.name && <> &middot; {article.author.name}</>}
            </p>
          </div>
        </div>
      </section>

      {article.coverImage && (
        <div className="container-page -mt-8 lg:-mt-10">
          <img
            src={article.coverImage}
            alt=""
            className="aspect-[16/7] w-full rounded-2xl object-cover shadow-lg"
          />
        </div>
      )}

      <article className="container-page max-w-3xl py-16 lg:py-20">
        {article.excerpt && (
          <p className="mb-8 border-l-2 border-brand-300 pl-5 text-lg leading-relaxed text-ink-600">
            {article.excerpt}
          </p>
        )}

        <RichText html={article.content} />
      </article>

      {related.length > 0 && (
        <section className="border-t border-ink-200 bg-white py-16 lg:py-20">
          <div className="container-page">
            <h2 className="text-2xl">Artikel lainnya</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ArticleCard key={item.id} article={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
