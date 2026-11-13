export default function AuthCard({ title, text, children, wide }) {
  return <div className="container-x section grid place-items-center"><div className={`card w-full space-y-4 p-8 ${wide ? 'max-w-xl' : 'max-w-md'}`}>
    <div><h1 className="text-3xl">{title}</h1>{text && <p className="mt-1 text-sm text-ink-700">{text}</p>}</div>{children}</div></div>
}
