/**
 * Metadata dokumen per halaman.
 *
 * React 19 otomatis memindahkan <title>, <meta>, dan <link rel="canonical">
 * ke dalam <head>, jadi tidak perlu pustaka tambahan seperti react-helmet.
 */
const SITE_NAME = 'Threevo'
const DEFAULT_TITLE = 'Threevo — Powering Commerce Operations'
const DEFAULT_DESCRIPTION =
  'Threevo membantu brand yang sedang tumbuh membangun, mengoperasikan, dan menskalakan bisnis lewat manajemen marketplace, warehouse fulfillment, dan social media management.'

export default function Seo({ title, description, image, noIndex = false }) {
  // metaTitle dari backend sering sudah memuat nama brand, jadi jangan
  // ditambahkan dua kali.
  const fullTitle = !title
    ? DEFAULT_TITLE
    : title.includes(SITE_NAME)
      ? title
      : `${title} — ${SITE_NAME}`
  // Selalu dirender agar tidak ada halaman tanpa deskripsi.
  const metaDescription = description || DEFAULT_DESCRIPTION

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {noIndex && <meta name="robots" content="noindex" />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
    </>
  )
}
