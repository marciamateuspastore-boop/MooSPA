import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Activity, ArrowUpRight, CalendarDays, Check, CheckCheck, ChevronRight, Clock3, Droplets, Heart, House, Plus, ScanLine, ShieldCheck, UsersRound, Waves, Wrench, X, ChartNoAxesCombined } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Activity as ActivityRecord, Animal, Schedule } from './model'
import { dailyChartData } from './model'
import { weekLabels } from './time'

export type Page = 'overview' | 'station' | 'herd' | 'schedule' | 'reports'
export const nav: { id: Page; label: string; short: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'Visão geral', short: 'Início', icon: House },
  { id: 'station', label: 'Minha estação', short: 'Estação', icon: ScanLine },
  { id: 'herd', label: 'Meu rebanho', short: 'Rebanho', icon: UsersRound },
  { id: 'schedule', label: 'Agenda', short: 'Agenda', icon: CalendarDays },
  { id: 'reports', label: 'Relatórios', short: 'Relatórios', icon: ChartNoAxesCombined },
]
export const asset = (name: string) => `${import.meta.env.BASE_URL}images/${name}`
export const number = (n: number, decimals = 0) => n.toLocaleString('pt-BR', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })

export function Logo({ compact = false }: { compact?: boolean }) {
  return <div className={`logo ${compact ? 'compact' : ''}`}><svg width="38" height="38" viewBox="0 0 40 40" fill="none" aria-hidden="true"><rect width="40" height="40" rx="13" fill="currentColor"/><path d="M10 27V16c0-4 5-4 5 0v6-8c0-4 5-4 5 0v8-8c0-4 5-4 5 0v8-6c0-4 5-4 5 0v11" stroke="#e5f0d4" strokeWidth="3.3" strokeLinecap="round"/></svg><span>Moo<span className="logo-light">SPA</span><i /></span></div>
}
export function CowAvatar({ animal, size = 'normal' }: { animal: Animal; size?: 'normal' | 'large' }) {
  return <span className={`cow-avatar ${size} cow-${Number(animal.id) % 4}`} aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="m15 17-6-5c-6 4-3 11 5 11m19-6 6-5c6 4 3 11-5 11" fill="#b5ac8c"/><path d="m16 15-2-7m18 7 2-7" stroke="#7f806e" strokeWidth="3" strokeLinecap="round"/><path d="M14 18c0-9 20-9 20 0l-1 16H15z" fill="#faf8ef"/><path d="M15 14c5-5 11-1 9 5s-7 3-10 3m18-6c-6-1-7 6 1 10" fill={animal.breed === 'Jersey' ? '#a47e54' : '#404b40'}/><rect x="12" y="29" width="24" height="12" rx="6" fill="#d8bbaa"/><circle cx="18" cy="34" r="1.4" fill="#826c5e"/><circle cx="30" cy="34" r="1.4" fill="#826c5e"/><circle cx="18" cy="25" r="1.5" fill="#283e30"/><circle cx="30" cy="25" r="1.5" fill="#283e30"/></svg></span>
}
export function Badge({ children, tone = 'green' }: { children: ReactNode; tone?: 'green' | 'amber' | 'neutral' }) { return <span className={`badge ${tone}`}>{children}</span> }
export function SectionTitle({ title, subtitle, action, onClick }: { title: string; subtitle?: string; action?: string; onClick?: () => void }) { return <div className="section-title"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action && <button className="text-button" onClick={onClick}>{action}<ArrowUpRight size={15} /></button>}</div> }
export function Dialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const d = ref.current!; const previous = document.activeElement as HTMLElement
    d.showModal()
    const cancel = (e: Event) => { e.preventDefault(); closeRef.current() }
    d.addEventListener('cancel', cancel)
    const old = document.body.style.overflow; document.body.style.overflow = 'hidden'
    return () => { d.removeEventListener('cancel', cancel); d.close(); document.body.style.overflow = old; previous?.focus() }
  }, [])
  return <dialog ref={ref} aria-label={title} className="dialog" onClick={e => {
    if (e.target === ref.current) {
      const r = ref.current.getBoundingClientRect()
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose()
    }
  }}><div className="dialog-header"><h2>{title}</h2><button className="icon-button" aria-label="Fechar janela" onClick={onClose}><X size={20} /></button></div>{children}</dialog>
}
export function Chart({ range = 'today', activities, now }: { range?: string; activities: ActivityRecord[]; now: Date }) {
  const [hover, setHover] = useState<number | null>(null)
  const daily = dailyChartData(activities)
  const values = range === 'today' ? daily.values : range === 'week' ? [12, 16, 13, 19, 15, 17, 14] : [68, 76, 82, 91]
  const labels = range === 'today' ? daily.labels : range === 'week' ? weekLabels(now) : ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
  const max = Math.max(...values) * 1.2
  return <div className="chart-wrap"><div className="chart-key"><span><i /> Passagens</span><span className="muted">{hover !== null ? `${labels[hover]} · ${values[hover]} passagens` : 'Dados ilustrativos'}</span></div><div className="bar-chart" aria-label="Passagens por horário">{values.map((v, i) => <button className={`bar-column ${i === 3 ? 'highlight' : ''}`} key={labels[i]} aria-label={`${labels[i]}: ${v} passagens`} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} onClick={() => setHover(i)}><div className="bar-track"><div className="bar" style={{ height: `${Math.max(v / max * 100, 3)}%` }}><span>{v || '–'}</span></div></div><span className="bar-label">{labels[i]}</span></button>)}</div></div>
}
export function ActivityList({ activities, animals, onAnimal, limit }: { activities: ActivityRecord[]; animals: Animal[]; onAnimal: (id: string) => void; limit?: number }) {
  return <div className="activity-list">{activities.slice(0, limit).map(a => <button className="activity-row" key={a.id} onClick={() => onAnimal(a.animalId)}><CowAvatar animal={animals.find(v => v.id === a.animalId)!} /><div className="activity-name"><strong>{a.name} <span>#{a.animalId}</span></strong><small>{a.kind}</small></div><time>{a.time}</time><span className={`activity-state ${a.status}`} aria-label={a.status === 'complete' ? 'Concluído' : 'Requer atenção'}>{a.status === 'complete' ? <Check size={15} /> : <Clock3 size={15} />}</span><ChevronRight className="row-chevron" size={15} /></button>)}</div>
}
export function AgendaRows({ items, compact = false, onToggle }: { items: Schedule[]; compact?: boolean; onToggle?: (id: string) => void }) {
  return <div className={`agenda-rows ${compact ? 'compact-agenda' : ''}`}>{items.length === 0 ? <div className="empty-state"><CheckCheck size={30} /><h3>Tudo em dia.</h3><p>Nenhum cuidado por aqui. Adicione um novo à agenda.</p></div> : items.map(item => <div className={`agenda-row ${item.done ? 'done' : ''}`} key={item.id}><time>{item.time}</time><span className={`agenda-icon ${item.type}`}>{item.type === 'maintenance' ? <Wrench size={17} /> : item.type === 'review' ? <Heart size={17} /> : <Droplets size={17} />}</span><div><strong>{item.title}</strong>{!compact && <p>{item.detail}</p>}<small>{item.type === 'maintenance' ? 'Manutenção' : item.type === 'review' ? 'Revisão individual' : 'Bem-estar'}</small></div>{!compact && <button className={`check-button ${item.done ? 'checked' : ''}`} aria-label={item.done ? `Reabrir ${item.title}` : `Concluir ${item.title}`} onClick={() => onToggle?.(item.id)}><Check size={17} /></button>}</div>)}</div>
}
export function Metric({ icon: Icon, label, value, suffix, note, trend, progress, status, blue }: { icon: LucideIcon; label: string; value: string; suffix?: string; note: string; trend?: string; progress?: number; status?: boolean; blue?: boolean }) {
  return <article className={`metric-card ${blue ? 'blue' : ''}`}><div className="metric-top"><span>{label}</span><Icon size={18} /></div><div className={`metric-value ${status !== undefined ? 'text-value' : ''}`}>{status !== undefined && <span className={`status-dot ${!status ? 'paused' : ''}`} />}{value}{suffix && <span>{suffix}</span>}</div><p>{note}</p>{progress !== undefined ? <div className="metric-progress"><div style={{ width: `${progress}%` }} /></div> : trend ? <span className="metric-trend">{blue ? <Waves size={13} /> : <ArrowUpRight size={13} />}{trend}</span> : <span className="metric-trend">{status !== undefined ? <><ShieldCheck size={13} /> Monitoramento simulado</> : <><Clock3 size={13} /> Tempo de referência</>}</span>}</article>
}
export function Resource({ icon: Icon, title, value, note, progress }: { icon: LucideIcon; title: string; value: string; note: string; progress?: number }) { return <div className="resource"><Icon size={22} /><span>{title}</span><strong>{value}</strong><p>{note}</p>{progress !== undefined && <div className="metric-progress"><div style={{ width: `${progress}%` }} /></div>}</div> }
export function AddCareButton({ onClick }: { onClick: () => void }) { return <button className="agenda-add" onClick={onClick}><Plus size={15} /> Agendar um cuidado</button> }
export { Activity as ActivityIcon }
