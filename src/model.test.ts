import { describe, it, expect } from 'vitest'
import { createCycle, cycleWater, initialAnimals } from './model'
describe('regras da simulação', () => {
  it('libera água apenas na primeira passagem elegível', () => {
    expect(createCycle(initialAnimals[8], 'normal', false).washEligible).toBe(true)
    expect(createCycle(initialAnimals[0], 'normal', false).washEligible).toBe(false)
  })
  it.each(['rfid', 'occupancy'] as const)('bloqueia fluidos no cenário %s', scenario => {
    const cycle = createCycle(initialAnimals[8], scenario, false)
    expect(cycle.status).toBe('blocked')
    expect(cycle.washEligible).toBe(false)
    expect(cycleWater({ ...cycle, stage: 5 })).toBe(0)
  })
  it('não inicia enquanto a estação estiver pausada', () => {
    expect(createCycle(initialAnimals[8], 'normal', true).status).toBe('blocked')
  })
  it('mantém a lavagem bloqueada quando a autorização foi consumida em um ciclo incompleto', () => {
    const interruptedAnimal = { ...initialAnimals[8], washed: true, washIncomplete: true }
    expect(createCycle(interruptedAnimal, 'normal', false).washEligible).toBe(false)
  })
  it('contabiliza água somente a partir da etapa de lavagem', () => {
    const cycle = createCycle(initialAnimals[8], 'normal', false)
    expect(cycleWater({ ...cycle, stage: 2 })).toBe(0)
    expect(cycleWater({ ...cycle, stage: 3 })).toBe(0.8)
    expect(cycleWater({ ...cycle, stage: 5, status: 'interrupted' })).toBe(0.8)
  })
})
