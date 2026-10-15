export const DEMO_DATE = '2026-10-14'
export type Animal = { id: string; name: string; breed: string; group: string; washed: boolean; washIncomplete: boolean; lastVisit: string; visits: number; attention: boolean }
export type Schedule = { id: string; time: string; title: string; detail: string; type: 'care' | 'maintenance' | 'review'; done: boolean }
export type Activity = { id: string; animalId: string; name: string; time: string; kind: string; status: 'complete' | 'interrupted' | 'blocked'; water: number }
export type Scenario = 'normal' | 'rfid' | 'occupancy'
export type Cycle = { animalId: string; stage: number; status: 'running' | 'complete' | 'interrupted' | 'blocked'; washEligible: boolean; reason?: string }

const names = ['Amora', 'Mimosa', 'Estrela', 'Luna', 'Flor', 'Aurora', 'Margarida', 'Pérola', 'Mel', 'Jade', 'Lua', 'Dália']
export const initialAnimals: Animal[] = names.map((name, i) => ({
  id: String(i + 1).padStart(3, '0'), name,
  breed: i % 3 === 0 ? 'Jersey' : 'Holandesa', group: i < 8 ? 'Lote A' : 'Lote B',
  washed: i < 8, washIncomplete: false, lastVisit: i < 8 ? ['09:42', '09:36', '09:28', '09:15', '08:56', '08:42', '08:30', '08:18'][i] : 'Ontem',
  visits: i < 6 ? 2 : i < 8 ? 1 : 0, attention: i === 2,
}))
export const initialActivities: Activity[] = [
  { id: 'p5', animalId: '001', name: 'Amora', time: '09:42', kind: 'Escovação', status: 'complete', water: 0 },
  { id: 'p4', animalId: '002', name: 'Mimosa', time: '09:36', kind: 'Escovação', status: 'complete', water: 0 },
  { id: 'p3', animalId: '003', name: 'Estrela', time: '09:28', kind: 'Ciclo interrompido', status: 'interrupted', water: 0 },
  { id: 'p2', animalId: '004', name: 'Luna', time: '09:15', kind: 'Higiene + escovação', status: 'complete', water: 0.8 },
  { id: 'p1', animalId: '005', name: 'Flor', time: '08:56', kind: 'Higiene + escovação', status: 'complete', water: 0.8 },
]
export const initialSchedule: Schedule[] = [
  { id: 's1', time: '10:30', title: 'Revisão da Estrela', detail: 'Avaliar a passagem interrompida · Animal #003', type: 'review', done: false },
  { id: 's2', time: '14:00', title: 'Inspeção das escovas', detail: 'Verificar cerdas e proteções · ECV-01', type: 'maintenance', done: false },
  { id: 's3', time: '16:30', title: 'Rotina de higienização', detail: 'Limpeza dos coletores · ECV-01', type: 'care', done: false },
  { id: 's4', time: '07:00', title: 'Inspeção de abertura', detail: 'Piso, saída e níveis verificados', type: 'maintenance', done: true },
]
export function createCycle(animal: Animal, scenario: Scenario, paused: boolean): Cycle {
  const reason = paused ? 'A estação está pausada. Retome a operação antes de iniciar.' : scenario === 'rfid' ? 'RFID não identificado. Água e produto bloqueados; saída livre.' : scenario === 'occupancy' ? 'Ocupação ambígua. Água e produto bloqueados; saída livre.' : undefined
  return { animalId: animal.id, stage: 0, status: reason ? 'blocked' : 'running', washEligible: !animal.washed && !reason, reason }
}
export const stages = [
  { title: 'Identificação', description: 'Leitura individual do brinco RFID.' },
  { title: 'Validação', description: 'Verificando identidade e permissões do ciclo.' },
  { title: 'Escovação', description: 'Escovas lateral e superior em movimento.' },
  { title: 'Lavagem', description: 'Primeira passagem elegível do dia.' },
  { title: 'Ventilação', description: 'Removendo o excesso de água.' },
  { title: 'Saída livre', description: 'Finalizando o registro da passagem.' },
]
export function cycleWater(cycle: Cycle): number { return cycle.washEligible && cycle.stage >= 3 ? 0.8 : 0 }
export function downloadCsv(activities: Activity[]) {
  const rows = [['Animal', 'Nome', 'Horário', 'Atividade', 'Estado', 'Água (L)', 'Origem'], ...activities.map(a => [a.animalId, a.name, a.time, a.kind, a.status === 'complete' ? 'Concluído' : a.status === 'blocked' ? 'Bloqueado' : 'Interrompido', String(a.water).replace('.', ','), 'Dados fictícios — demo'])]
  const csv = '\uFEFF' + rows.map(row => row.map(v => '"' + v.replaceAll('"', '""') + '"').join(';')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const a = document.createElement('a'); a.href = url; a.download = `moospa-demo-${DEMO_DATE}.csv`; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
