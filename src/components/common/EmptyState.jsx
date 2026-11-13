export default function EmptyState({ icon='🍽️', title, text, action }) {
  return <div className="card flex flex-col items-center px-6 py-12 text-center"><div className="text-4xl">{icon}</div><h3 className="mt-3 text-xl">{title}</h3><p className="mt-1 max-w-sm text-sm text-ink-700">{text}</p>{action && <div className="mt-5">{action}</div>}</div>
}
