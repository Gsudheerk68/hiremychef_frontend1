import { useEffect, useState } from 'react'
/** Runs an async function on mount / when deps change. Keeps the previous data while reloading. */
export default function useAsync(fn, deps = []) {
  const [s, set] = useState({ data: null, loading: true, error: '' })
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let alive = true
    set((x) => ({ ...x, loading: true, error: '' }))
    Promise.resolve().then(fn).then((data) => alive && set({ data, loading: false, error: '' }))
      .catch((e) => alive && set({ data: null, loading: false, error: e?.message || 'Something went wrong' }))
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])
  return { ...s, reload: () => setTick((t) => t + 1), setData: (data) => set((x) => ({ ...x, data })) }
}
