import { useMemo } from 'react'
import { prepareRichText } from '../../lib/richText'

/** Merender HTML dari backend dengan tipografi Threevo. */
export default function RichText({ html, className = '' }) {
  const prepared = useMemo(() => prepareRichText(html), [html])
  if (!prepared) return null

  return (
    <div
      className={`prose-threevo ${className}`}
      dangerouslySetInnerHTML={{ __html: prepared }}
    />
  )
}
