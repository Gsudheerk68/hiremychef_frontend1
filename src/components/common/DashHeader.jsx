export default function DashHeader({ title, text, action }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl">{title}</h1>{text && <p className="mt-1 text-ink-700">{text}</p>}</div>{action}</div>
}
