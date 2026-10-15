import { useEffect, useLayoutEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type Theme = 'light' | 'dark'

export default function ThemeControls() {
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [choice, setChoice] = useState<Theme | null>(null)
  const theme = choice ?? (systemDark ? 'dark' : 'light')
  const dark = theme === 'dark'

  useEffect(() => {
    const preference = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => setSystemDark(preference.matches)
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', dark ? '#111813' : '#f6f7f4')
  }, [theme, dark])

  return <button
    type="button"
    className="icon-button theme-toggle"
    aria-label="Modo escuro"
    aria-pressed={dark}
    title={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    onClick={() => setChoice(dark ? 'light' : 'dark')}
  >{dark ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}</button>
}
