import { useEffect, useState } from 'react'
import { ArrowRight, ArrowUpRight, Bell, CalendarDays, Check, CheckCheck, ChevronDown, ChevronRight, CircleHelp, Clock3, Droplets, Heart, Leaf, Plus, Radio, RotateCcw, Sparkles, Sprout, Wrench, X } from 'lucide-react'
import { createCycle, cycleWater, downloadCsv, initialActivities, initialAnimals, initialSchedule } from './model'
import type { Activity, Animal, Cycle, Scenario, Schedule } from './model'
import { ActivityIcon, Badge, CowAvatar, Dialog, Logo, nav, number } from './ui'
import type { Page } from './ui'
import { Agenda, Herd, Overview, Reports, Station } from './pages'
import PwaControls from './PwaControls'
import ThemeControls from './ThemeControls'
import LiveDateTime from './LiveDateTime'
import { calendarLabels, greeting, localTime } from './time'
import { useCurrentTime } from './useCurrentTime'

type Modal = 'about' | 'notifications' | 'schedule' | 'reset' | null
export default function App() {
  const now = useCurrentTime()
  const calendar = calendarLabels(now)
  const [page, setPage] = useState<Page>('overview')
  const [animals, setAnimals] = useState<Animal[]>(() => initialAnimals.map(a => ({ ...a })))
  const [activities, setActivities] = useState<Activity[]>(() => [...initialActivities])
  const [schedule, setSchedule] = useState<Schedule[]>(() => initialSchedule.map(s => ({ ...s })))
  const [modal, setModal] = useState<Modal>(null)
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null)
  const [range, setRange] = useState('today')
  const [read, setRead] = useState(false)
  const [paused, setPaused] = useState(false)
  const [simAnimal, setSimAnimal] = useState('009')
  const [scenario, setScenario] = useState<Scenario>('normal')
  const [cycle, setCycle] = useState<Cycle | null>(null)
  const [waterUsed, setWaterUsed] = useState(6.4)
  const [toast, setToast] = useState('')
  const [formAnimal, setFormAnimal] = useState('003')
  const [formType, setFormType] = useState<Schedule['type']>('review')
  const [formTime, setFormTime] = useState(() => localTime())
  const [formNotes, setFormNotes] = useState('')
  const running = cycle?.status === 'running'
  const pending = schedule.filter(s => !s.done).sort((a, b) => a.time.localeCompare(b.time))
  const currentAnimal = selectedAnimal ? animals.find(a => a.id === selectedAnimal) : undefined


  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 4500); return () => clearTimeout(timer) }, [toast])
  useEffect(() => {
    if (!cycle || cycle.status !== 'running') return
    const timer = setTimeout(() => {
      if (cycle.stage < 5) {
        if (cycle.stage === 2 && cycle.washEligible) {
          setAnimals(prev => prev.map(a => a.id === cycle.animalId ? { ...a, washed: true, washIncomplete: true } : a))
          setWaterUsed(prev => prev + 0.8)
        }
        setCycle({ ...cycle, stage: cycle.stage + 1 })
      } else {
        const animal = animals.find(a => a.id === cycle.animalId)!
        const time = localTime()
        setAnimals(prev => prev.map(a => a.id === cycle.animalId ? { ...a, visits: a.visits + 1, lastVisit: time, washIncomplete: cycle.washEligible ? false : a.washIncomplete } : a))
        setActivities(prev => [{ id: crypto.randomUUID(), animalId: animal.id, name: animal.name, time, kind: cycle.washEligible ? 'Higiene + escovação' : 'Escovação', status: 'complete', water: cycleWater(cycle) }, ...prev])
        setCycle({ ...cycle, status: 'complete' })
        setToast(`Passagem de ${animal.name} concluída na simulação.`)
      }
    }, 1800)
    return () => clearTimeout(timer)
  }, [cycle, animals, activities.length])

  function navigate(next: Page) { setPage(next); window.scrollTo({ top: 0, behavior: 'instant' }) }
  function startCycle() {
    if (running) return
    const animal = animals.find(a => a.id === simAnimal)!
    const next = createCycle(animal, scenario, paused)
    setCycle(next)
    if (next.status === 'blocked') setActivities(prev => [{ id: crypto.randomUUID(), animalId: animal.id, name: scenario === 'normal' ? animal.name : 'Não identificado', time: localTime(), kind: scenario === 'rfid' ? 'Falha de leitura RFID' : scenario === 'occupancy' ? 'Ocupação ambígua' : 'Estação pausada', status: 'blocked', water: 0 }, ...prev])
  }
  function interruptCycle() {
    if (!cycle || !running) return
    const animal = animals.find(a => a.id === cycle.animalId)!
    setCycle({ ...cycle, status: 'interrupted' })
    setAnimals(prev => prev.map(a => a.id === animal.id ? { ...a, attention: true } : a))
    setActivities(prev => [{ id: crypto.randomUUID(), animalId: animal.id, name: animal.name, time: localTime(), kind: 'Ciclo interrompido', status: 'interrupted', water: cycleWater(cycle) }, ...prev])
    setToast('Ciclo interrompido. Saída livre e revisão sinalizada.')
  }
  function resetDemo() { setAnimals(initialAnimals.map(a => ({ ...a }))); setActivities([...initialActivities]); setSchedule(initialSchedule.map(s => ({ ...s }))); setWaterUsed(6.4); setCycle(null); setPaused(false); setRead(false); setScenario('normal'); setSimAnimal('009'); setModal(null); setToast('Demo reiniciada. Tudo pronto para explorar de novo.') }
  function addSchedule(e: React.FormEvent) {
    e.preventDefault()
    const animal = animals.find(a => a.id === formAnimal)!
    setSchedule(prev => [...prev, { id: crypto.randomUUID(), time: formTime, title: formType === 'review' ? `Revisão de ${animal.name}` : formType === 'care' ? `Cuidado de ${animal.name}` : 'Inspeção da estação', detail: formNotes.trim() || (formType === 'maintenance' ? 'Verificação de rotina · ECV-01' : `Animal #${animal.id} · ${animal.group}`), type: formType, done: false }])
    setModal(null); setFormNotes(''); setToast('Cuidado adicionado à agenda desta demonstração.')
  }
  function openSchedule(animalId?: string) { if (animalId) setFormAnimal(animalId); setSelectedAnimal(null); setFormTime(localTime()); setModal('schedule') }
  const common = { animals, activities, range, waterUsed, onAnimal: setSelectedAnimal, now }
  return <div className="app-shell">
    <a className="skip-link" href="#main">Pular para o conteúdo</a>
    <aside className="sidebar"><button className="brand-button" aria-label="MooSPA — início" onClick={() => navigate('overview')}><Logo /></button><span className="sidebar-label">ESPAÇO DA FAZENDA</span><nav aria-label="Navegação principal">{nav.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} aria-label={label} aria-current={page === id ? 'page' : undefined} onClick={() => navigate(id)}><Icon size={20} /><span>{label}</span>{id === 'schedule' && <small>{pending.length}</small>}</button>)}</nav><div className="sidebar-bottom"><div className="demo-note"><div><span className="demo-dot" /> EXPERIÊNCIA DEMO</div><p>Um novo jeito de cuidar.<br />Explore o que vem por aí.</p><button onClick={() => setModal('about')}>Conheça o projeto <ArrowUpRight size={15} /></button></div><button className="sidebar-help" onClick={() => setModal('about')}><CircleHelp size={19} /> Sobre o MooSPA</button><button className="farm-switch" onClick={() => setModal('about')}><span><Sprout size={20} /></span><div><strong>Fazenda Boa Vista</strong><small>Ambiente demonstrativo</small></div><ChevronDown size={15} /></button></div></aside>
    <div className="app-main"><header className="topbar"><div className="desktop-breadcrumb">Meu espaço <ChevronRight size={13} /><span>{nav.find(n => n.id === page)?.label}</span></div><button className="mobile-brand brand-button" aria-label="MooSPA — início" onClick={() => navigate('overview')}><Logo compact /></button><div className="topbar-actions"><ThemeControls /><PwaControls /><span className="environment-pill"><span /> Dados demonstrativos</span><button className="icon-button notification-button" aria-label="Ver notificações" onClick={() => { setModal('notifications'); setRead(true) }}><Bell size={20} />{!read && <i />}</button><button className="profile-button" aria-label="Perfil demonstrativo de Vilmar" onClick={() => setModal('about')}>V</button></div></header>
    <main id="main" className="content" tabIndex={-1}>
      <div className="page-heading"><div><LiveDateTime now={now} /><h1>{page === 'overview' ? <>{greeting(now)}, Vilmar<span className="heading-dot">.</span></> : page === 'station' ? 'Cuidado em movimento.' : page === 'herd' ? 'Cada uma importa.' : page === 'schedule' ? 'Cuidar também é planejar.' : 'Os detalhes fazem a diferença.'}</h1><p>{page === 'overview' ? 'Seu rebanho bem cuidado. Seu dia mais tranquilo.' : page === 'station' ? 'Conheça a ECV-01 e experimente uma passagem simulada.' : page === 'herd' ? 'Uma história de cuidado para cada animal do seu rebanho.' : page === 'schedule' ? 'Toda a rotina de cuidado, no tempo certo.' : 'Acompanhe a rotina e os recursos da sua estação.'}</p></div>{page === 'overview' || page === 'reports' ? <label className="period-select"><CalendarDays size={16} /><select aria-label="Período dos indicadores" value={range} onChange={e => setRange(e.target.value)}><option value="today">{calendar.today}</option><option value="week">Últimos 7 dias</option><option value="month">Últimos 30 dias</option></select><ChevronDown size={14} /></label> : page === 'schedule' ? <button className="button primary" onClick={() => openSchedule()}><Plus size={17} /> Novo cuidado</button> : <Badge tone="neutral"><span className="status-dot" /> {page === 'herd' ? `${animals.length} animais` : 'ECV-01'}</Badge>}</div>
      {page === 'overview' && <Overview {...common} {...{ pending, paused, navigate }} running={!!running} onSchedule={() => openSchedule()} />}
      {page === 'station' && <Station {...{ animals, paused, cycle, simAnimal, scenario, waterUsed }} onAnimalChange={id => { setSimAnimal(id); setCycle(null) }} onScenarioChange={s => { setScenario(s); setCycle(null) }} onStart={startCycle} onInterrupt={interruptCycle} onPause={() => { setPaused(p => !p); setCycle(null) }} />}
      {page === 'herd' && <Herd animals={animals} onAnimal={setSelectedAnimal} />}
      {page === 'schedule' && <Agenda now={now} schedule={schedule} onToggle={id => setSchedule(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s))} />}
      {page === 'reports' && <Reports {...common} onExport={() => { downloadCsv(activities); setToast('Histórico da demonstração exportado em CSV.') }} />}
      <footer className="page-footer"><span><Sprout size={14} /> Feito para cuidar, por natureza.</span><button onClick={() => setModal('reset')}><RotateCcw size={13} /> Reiniciar demo</button><span className="footer-demo">MooSPA · Conceito interativo</span></footer>
    </main></div>
    <nav className="mobile-nav" aria-label="Navegação mobile">{nav.map(({ id, short, icon: Icon }) => <button key={id} className={page === id ? 'active' : ''} aria-current={page === id ? 'page' : undefined} onClick={() => navigate(id)}><span><Icon size={21} strokeWidth={page === id ? 2.1 : 1.7} /></span>{short}</button>)}</nav>
    {toast && <div className="toast" role="status"><CheckCheck size={18} /><span>{toast}</span><button aria-label="Dispensar aviso" onClick={() => setToast('')}><X size={15} /></button></div>}
    {modal === 'about' && <Dialog title="Um novo jeito de cuidar." onClose={() => setModal(null)}><div className="about-content"><Logo /><p className="dialog-lead">Tecnologia a serviço do bem-estar animal.</p><p>O MooSPA é uma experiência de produto para a estação automatizada ECV-01, baseada no projeto conceitual fornecido. Um lugar para acompanhar o rebanho, explorar uma passagem e organizar o cuidado.</p><div className="about-features"><span><Radio size={19} /> Identificação individual</span><span><Sparkles size={19} /> Higiene e escovação</span><span><Heart size={19} /> Histórico de cuidado</span><span><Leaf size={19} /> Passagem voluntária</span></div><div className="info-box"><strong>Você está em uma demonstração.</strong><p>Fazenda, perfil e indicadores são fictícios. As mudanças ficam apenas na memória desta aba e são reiniciadas ao recarregar. Não há conexão com animais, sensores ou equipamentos reais.</p></div><p className="small-print">O projeto está em fase conceitual. A interface não comprova desempenho, segurança ou prontidão para fabricação.</p><button className="button primary full-width" onClick={() => { setModal(null); navigate('station') }}>Experimentar minha estação <ArrowRight size={17} /></button></div></Dialog>}
    {modal === 'notifications' && <Dialog title="Seu cuidado em dia." onClose={() => setModal(null)}><div className="notification-list"><div><span className="agenda-icon review"><Heart size={20} /></span><div><strong>Estrela precisa de uma revisão</strong><p>A passagem das 09:28 foi interrompida. Confira a ficha do animal antes do próximo cuidado.</p><button className="text-button" onClick={() => { setModal(null); setSelectedAnimal('003') }}>Ver Estrela <ArrowUpRight size={14} /></button></div></div><div><span className="agenda-icon maintenance"><Wrench size={20} /></span><div><strong>Inspeção das escovas às 14h</strong><p>Seu próximo lembrete de manutenção está na agenda de hoje.</p><button className="text-button" onClick={() => { setModal(null); navigate('schedule') }}>Abrir agenda <ArrowUpRight size={14} /></button></div></div></div><p className="small-print">Notificações ilustrativas da demonstração.</p></Dialog>}
    {modal === 'schedule' && <Dialog title="Um cuidado a mais." onClose={() => setModal(null)}><p className="dialog-subtitle">Adicione um lembrete à rotina de hoje, {calendar.long}.</p><form onSubmit={addSchedule} className="schedule-form"><label>Tipo de cuidado<select value={formType} onChange={e => setFormType(e.target.value as Schedule['type'])}><option value="review">Revisão individual</option><option value="care">Rotina de cuidado</option><option value="maintenance">Inspeção da estação</option></select></label>{formType !== 'maintenance' && <label>Animal<select value={formAnimal} onChange={e => setFormAnimal(e.target.value)}>{animals.map(a => <option key={a.id} value={a.id}>{a.name} · #{a.id}</option>)}</select></label>}<label>Horário<input type="time" required value={formTime} onChange={e => setFormTime(e.target.value)} /></label><label>Observação <span className="muted">(opcional)</span><textarea maxLength={180} placeholder="O que precisa de atenção?" value={formNotes} onChange={e => setFormNotes(e.target.value)} /></label><p className="small-print">Este lembrete é salvo apenas durante sua visita à demo.</p><button className="button primary full-width" type="submit"><Plus size={17} /> Adicionar à agenda</button></form></Dialog>}
    {modal === 'reset' && <Dialog title="Explorar tudo de novo?" onClose={() => setModal(null)}><p className="dialog-subtitle">Isso restaura os dados fictícios iniciais e remove os ciclos e cuidados adicionados nesta sessão.</p><div className="dialog-actions"><button className="button secondary" onClick={() => setModal(null)}>Continuar explorando</button><button className="button primary" onClick={resetDemo}><RotateCcw size={16} /> Reiniciar demo</button></div></Dialog>}
    {currentAnimal && <Dialog title="Cada cuidado, uma história." onClose={() => setSelectedAnimal(null)}><div className="animal-detail-heading"><CowAvatar animal={currentAnimal} size="large" /><div><span className="eyebrow">ANIMAL #{currentAnimal.id}</span><h3>{currentAnimal.name}</h3><p>{currentAnimal.breed} · {currentAnimal.group}</p></div><Badge tone={currentAnimal.attention ? 'amber' : 'green'}>{currentAnimal.attention ? 'Em revisão' : 'Acompanhada'}</Badge></div><div className="animal-detail-stats"><div><Droplets size={19} /><strong>{currentAnimal.washIncomplete ? 'Em revisão' : currentAnimal.washed ? 'Realizada' : 'Disponível'}</strong><span>Lavagem de hoje</span></div><div><ActivityIcon size={19} /><strong>{currentAnimal.visits}</strong><span>Passagens hoje</span></div><div><Clock3 size={19} /><strong>{currentAnimal.lastVisit}</strong><span>Última passagem</span></div></div>{currentAnimal.attention && <div className="info-box amber"><strong>Uma atenção especial.</strong><p>Uma passagem foi interrompida. Agende uma revisão para acompanhar o animal.</p></div>}<h4 className="detail-section-title">Histórico recente</h4>{activities.filter(a => a.animalId === currentAnimal.id).length ? <div className="detail-history">{activities.filter(a => a.animalId === currentAnimal.id).map(a => <div key={a.id}><span className={`activity-state ${a.status}`}>{a.status === 'complete' ? <Check size={14} /> : <Clock3 size={14} />}</span><div><strong>{a.kind}</strong><small>{a.status === 'complete' ? 'Concluído' : a.status === 'blocked' ? 'Bloqueado' : 'Interrompido'} · {number(a.water, 1)} L de água</small></div><time>{a.time}</time></div>)}</div> : <p className="empty-detail">Ainda não há registros detalhados nesta demonstração.</p>}<div className="dialog-actions"><button className="button secondary" onClick={() => openSchedule(currentAnimal.id)}><CalendarDays size={16} /> Agendar cuidado</button><button className="button primary" onClick={() => { if (!running) { setSimAnimal(currentAnimal.id); setCycle(null) }; setSelectedAnimal(null); navigate('station') }}>Ver na estação <ArrowUpRight size={16} /></button></div></Dialog>}
  </div>
}
