export function AntiGuruSection({
  content,
}: {
  content: {
    intro: string
    items: {
      not: string
      instead: string
    }[]
  }
}) {
  return (
    <section className="bg-neutral-100 text-neutral-900 py-20 px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold mb-6">
          What we don't promise
        </h2>

        <p className="text-lg text-neutral-600 mb-12 max-w-3xl">
          {content.intro}
        </p>

        <div className="space-y-6">
          {content.items.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded-lg shadow-sm"
            >
              <div>
                <p className="text-sm uppercase tracking-wide text-red-500 mb-2">
                  What others promise
                </p>
                <p className="font-semibold">{item.not}</p>
              </div>

              <div>
                <p className="text-sm uppercase tracking-wide text-green-600 mb-2">
                  What we do instead
                </p>
                <p>{item.instead}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
