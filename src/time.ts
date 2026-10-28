export function localDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function localTime(date = new Date(), seconds = false): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit', minute: '2-digit', ...(seconds ? { second: '2-digit' as const } : {}), hourCycle: 'h23',
  }).format(date)
}

export function calendarLabels(date: Date) {
  const month = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' })
  return {
    full: date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }),
    day: String(date.getDate()), month: month.toUpperCase(),
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
    today: `Hoje, ${date.getDate()} ${month}`,
    long: date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }),
  }
}

export function greeting(date: Date): string {
  return date.getHours() < 12 ? 'Bom dia' : date.getHours() < 18 ? 'Boa tarde' : 'Boa noite'
}

export function weekLabels(date: Date): string[] {
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 6 + index, 12)
    const label = day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
    return label.charAt(0).toUpperCase() + label.slice(1)
  })
}
