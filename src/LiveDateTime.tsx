import { Clock3 } from 'lucide-react'
import { calendarLabels, localDateKey, localTime } from './time'

export default function LiveDateTime({ now }: { now: Date }) {
  return <div className="eyebrow live-date-time">
    <time dateTime={localDateKey(now)}>{calendarLabels(now).full}</time>
    <span className="live-clock-wrap" title="Horário local do seu dispositivo">
      <Clock3 size={13} aria-hidden="true" />
      <time className="live-clock" dateTime={now.toISOString()} aria-label={`Hora local: ${localTime(now, true)}`}>{localTime(now, true)}</time>
    </span>
  </div>
}
