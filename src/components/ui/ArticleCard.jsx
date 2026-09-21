import { Link } from 'react-router-dom'
import { formatDate, toDateAttr } from '../../lib/format'
import { paths } from '../../routes/paths'

/** Kartu artikel; dipakai di daftar berita dan blok artikel terkait. */
export default function ArticleCard({ article }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white transition hover:border-brand-300 hover:shadow-lg hover:shadow-brand-600/5">
      <Link to={paths.articleDetail(article.slug)} className="flex flex-1 flex-col">
        {article.coverImage ? (
          <img
            src={article.coverImage}
            alt=""
            loading="lazy"
            className="aspect-[16/9] w-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="aspect-[16/9] w-full bg-gradient-to-br from-brand-100 to-ink-100"
          />
        )}

        <div className="flex flex-1 flex-col p-6">
          {article.category && (
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-600">
              {article.category.name}
            </span>
          )}

          <h3 className="mt-2 text-lg leading-snug transition group-hover:text-brand-700">
            {article.title}
          </h3>

          {article.excerpt && (
            <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-500">{article.excerpt}</p>
          )}

          <p className="mt-5 text-xs text-ink-500">
            {article.publishedAt && (
              <time dateTime={toDateAttr(article.publishedAt)}>
                {formatDate(article.publishedAt)}
              </time>
            )}
            {article.author?.name && <> &middot; {article.author.name}</>}
          </p>
        </div>
      </Link>
    </article>
  )
}
