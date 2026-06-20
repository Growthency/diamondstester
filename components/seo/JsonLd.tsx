/** Renders one or more JSON-LD structured-data blocks for rich results. */
export function JsonLd({ data }: { data: Record<string, any> | Record<string, any>[] }) {
  const items = Array.isArray(data) ? data : [data]
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  )
}
