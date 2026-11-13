export default function PageHeader({ kicker, title, text }) {
  return <div className="bg-gradient-to-b from-brand-50 to-cream-100"><div className="container-x py-14 text-center">
    {kicker && <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">{kicker}</p>}
    <h1 className="mt-2 text-4xl sm:text-5xl">{title}</h1>{text && <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-700">{text}</p>}</div></div>
}
