export type PwaState = {
  offlineReady: boolean
  updateReady: boolean
  registrationError: boolean
}

let state: PwaState = { offlineReady: false, updateReady: false, registrationError: false }
const listeners = new Set<() => void>()
let registration: ServiceWorkerRegistration | undefined
let started = false
let applyingUpdate = false
let reloading = false

function setState(patch: Partial<PwaState>) {
  const next = { ...state, ...patch }
  if (Object.keys(next).every((key) => next[key as keyof PwaState] === state[key as keyof PwaState])) return
  state = next
  listeners.forEach((listener) => listener())
}

export function getPwaState(): PwaState {
  return state
}

export function subscribePwa(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

function updateRegistrationState() {
  setState({
    offlineReady: registration?.active?.state === 'activated',
    updateReady: Boolean(registration?.waiting),
  })
}

function trackInstallingWorker(worker: ServiceWorker | null) {
  if (!worker) return
  worker.addEventListener('statechange', () => {
    updateRegistrationState()
    if (worker.state === 'redundant' && !registration?.active) {
      setState({ registrationError: true })
    }
    if (worker.state === 'activated') setState({ offlineReady: true, registrationError: false })
  })
}

export function startPwa(): void {
  // Vite development stays uncached; HTTPS (or localhost) is required in production.
  if (started || !import.meta.env.PROD || !('serviceWorker' in navigator)) return
  started = true

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    updateRegistrationState()
    // First installation and updates in other tabs must not interrupt this demo session.
    if (applyingUpdate && !reloading) {
      reloading = true
      window.location.reload()
    }
  })

  const register = async () => {
    try {
      const appBase = new URL(import.meta.env.BASE_URL, document.baseURI)
      registration = await navigator.serviceWorker.register(new URL('sw.js', appBase), {
        scope: appBase.pathname,
        updateViaCache: 'none',
      })
      updateRegistrationState()
      trackInstallingWorker(registration.installing)
      registration.addEventListener('updatefound', () => {
        trackInstallingWorker(registration?.installing ?? null)
      })

      // This resolves after initial precaching succeeds, without reloading the page.
      void navigator.serviceWorker.ready.then(() => {
        updateRegistrationState()
        setState({ registrationError: false })
      })

      // A returning user can discover a published update without reloading first.
      const checkForUpdate = () => {
        if (document.visibilityState === 'visible' && navigator.onLine) {
          void registration?.update().catch(() => { /* An offline update check is harmless. */ })
        }
      }
      document.addEventListener('visibilitychange', checkForUpdate)
      window.addEventListener('online', checkForUpdate)
    } catch {
      setState({ registrationError: true })
    }
  }

  if (document.readyState === 'complete') void register()
  else window.addEventListener('load', () => { void register() }, { once: true })
}

export function applyPwaUpdate(): boolean {
  const waitingWorker = registration?.waiting
  if (!waitingWorker || applyingUpdate) return false
  applyingUpdate = true
  waitingWorker.postMessage({ type: 'SKIP_WAITING' })
  return true
}
