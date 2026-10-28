import { useEffect, useState } from 'react'

export function useCurrentTime() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    // Read the device clock each time, so suspended tabs never accumulate drift.
    const refresh = () => setNow(new Date())
    const onVisible = () => { if (document.visibilityState === 'visible') refresh() }
    const timer = window.setInterval(refresh, 1000)
    window.addEventListener('focus', refresh)
    window.addEventListener('pageshow', refresh)
    document.addEventListener('visibilitychange', onVisible)
    refresh()
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refresh)
      window.removeEventListener('pageshow', refresh)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])
  return now
}
