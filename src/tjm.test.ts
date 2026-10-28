import { describe, expect, it } from 'vitest'
import {
  computeBreakdown,
  computeMinimalTjm,
  evaluate,
  formatDays,
  formatEuro,
  formatNet,
  parseNumber,
  readSavedState,
  validateInputs,
  type CommonInputs,
  type ContributionBase,
  type Inputs,
  type RawInputs,
} from './tjm'

// Intl uses non-breaking spaces in fr-FR; compare with plain spaces.
const plain = (text: string) => text.replace(/\s/g, ' ')

// Reference case A from PLAN.md (fictitious rates).
const caseA: Inputs = {
  tjm: 500,
  workingDays: 250,
  daysOff: 25,
  nonBillableShare: 15,
  yearlyExpenses: 6000,
  contributionRate: 20,
  taxRate: 10,
}

describe('computeBreakdown', () => {
  it('matches reference case A to the cent', () => {
    const result = computeBreakdown(caseA, 'revenue')
    expect(result.billedDays).toBeCloseTo(191.25, 10)
    expect(result.revenue).toBeCloseTo(95625, 2)
    expect(result.expenses).toBeCloseTo(6000, 2)
    expect(result.contributions).toBeCloseTo(19125, 2)
    expect(result.tax).toBeCloseTo(7050, 2)
    expect(result.netPerYear).toBeCloseTo(63450, 2)
    expect(result.netPerMonth).toBeCloseTo(5287.5, 2)
  })

  it('matches reference case A as displayed', () => {
    const result = computeBreakdown(caseA, 'revenue')
    expect(formatDays(result.billedDays)).toBe('191,3')
    expect(plain(formatEuro(result.revenue))).toBe('95 625,00 €')
    expect(plain(formatEuro(result.netPerMonth))).toBe('5 287,50 €')
  })

  it('computes a second case with other fictitious rates', () => {
    // 200 billed days, revenue 80 000, contributions 10 % = 8 000,
    // tax 20 % of 70 800 = 14 160, net 56 640 per year.
    const result = computeBreakdown({
      tjm: 400,
      workingDays: 220,
      daysOff: 20,
      nonBillableShare: 0,
      yearlyExpenses: 1200,
      contributionRate: 10,
      taxRate: 20,
    }, 'revenue')
    expect(result.billedDays).toBeCloseTo(200, 10)
    expect(result.revenue).toBeCloseTo(80000, 2)
    expect(result.contributions).toBeCloseTo(8000, 2)
    expect(result.tax).toBeCloseTo(14160, 2)
    expect(result.netPerYear).toBeCloseTo(56640, 2)
    expect(result.netPerMonth).toBeCloseTo(4720, 2)
  })
})

describe('contribution base and losses', () => {
  it('matches reference case B to the cent', () => {
    const result = computeBreakdown(caseA, 'revenueMinusExpenses')
    expect(result.billedDays).toBeCloseTo(191.25, 10)
    expect(result.revenue).toBeCloseTo(95625, 2)
    expect(result.expenses).toBeCloseTo(6000, 2)
    expect(result.contributions).toBeCloseTo(17925, 2)
    expect(result.tax).toBeCloseTo(7170, 2)
    expect(result.netPerYear).toBeCloseTo(64530, 2)
    expect(result.netPerMonth).toBeCloseTo(5377.5, 2)
  })

  // 50 billed days at 100 = revenue 5 000, expenses 8 000.
  const lossCase: Inputs = {
    tjm: 100,
    workingDays: 50,
    daysOff: 0,
    nonBillableShare: 0,
    yearlyExpenses: 8000,
    contributionRate: 20,
    taxRate: 10,
  }

  it('gives zero contributions and tax when expenses exceed revenue, base revenue minus expenses', () => {
    const result = computeBreakdown(lossCase, 'revenueMinusExpenses')
    expect(result.contributions).toBe(0)
    expect(result.tax).toBe(0)
    // Loss = expenses - revenue = 3 000.
    expect(result.netPerYear).toBeCloseTo(-3000, 2)
    expect(result.netPerMonth).toBeCloseTo(-250, 2)
  })

  it('gives zero tax when expenses exceed revenue, base revenue', () => {
    const result = computeBreakdown(lossCase, 'revenue')
    expect(result.contributions).toBeCloseTo(1000, 2)
    expect(result.tax).toBe(0)
    // Loss = expenses + contributions - revenue = 8 000 + 1 000 - 5 000 = 4 000.
    expect(result.netPerYear).toBeCloseTo(-4000, 2)
  })

  it('shows a negative net income as a loss', () => {
    expect(plain(formatNet(-3000))).toBe('Perte : 3 000,00 €')
    expect(plain(formatNet(5287.5))).toBe('5 287,50 €')
  })
})

describe('parseNumber', () => {
  it('reads a comma and a dot the same way', () => {
    expect(parseNumber('24,6')).toEqual({ ok: true, value: 24.6 })
    expect(parseNumber('24.6')).toEqual({ ok: true, value: 24.6 })
  })

  it('ignores spaces, including French non-breaking ones', () => {
    expect(parseNumber('6 000')).toEqual({ ok: true, value: 6000 })
    expect(parseNumber('6\u202f000')).toEqual({ ok: true, value: 6000 })
    expect(parseNumber(' 500 ')).toEqual({ ok: true, value: 500 })
  })

  it.each(['', '   ', '-3', 'abc', '1e3', '12,5,3', '12.', ',5', '500 €'])(
    'rejects %j with a message',
    (raw) => {
      const result = parseNumber(raw)
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error).not.toBe('')
    },
  )

  it('gives a specific message for each kind of rejection', () => {
    expect(parseNumber('')).toEqual({ ok: false, error: 'Ce champ est obligatoire.' })
    expect(parseNumber('-3')).toEqual({
      ok: false,
      error: 'La valeur ne peut pas être négative.',
    })
    expect(parseNumber('abc')).toEqual({
      ok: false,
      error: 'Saisissez un nombre, par exemple 12,5.',
    })
  })
})

describe('validateInputs', () => {
  const raw: RawInputs = {
    tjm: '500',
    targetNetPerMonth: '',
    workingDays: '250',
    daysOff: '25',
    nonBillableShare: '15',
    yearlyExpenses: '6 000',
    contributionRate: '20',
    taxRate: '10',
  }

  it('parses a complete form into reference case A', () => {
    expect(validateInputs(raw, 'tjmToNet')).toEqual({ values: caseA, errors: {} })
  })

  it('gives the same result for 24,6 and 24.6', () => {
    const comma = evaluate({ ...raw, daysOff: '24,6' }, 'tjmToNet', 'revenue').result
    const dot = evaluate({ ...raw, daysOff: '24.6' }, 'tjmToNet', 'revenue').result
    expect(comma?.kind).toBe('net')
    expect(comma).toEqual(dot)
  })

  it.each(['', '-3', 'abc'])('gives no inputs and a field message for %j', (value) => {
    const result = validateInputs({ ...raw, taxRate: value }, 'tjmToNet')
    expect(result.values).toBeNull()
    expect(result.errors.taxRate).toBeDefined()
    expect(Object.keys(result.errors)).toEqual(['taxRate'])
  })

  it.each(['nonBillableShare', 'contributionRate', 'taxRate'] as const)(
    'rejects 150 in the percentage field %s',
    (key) => {
      const result = validateInputs({ ...raw, [key]: '150' }, 'tjmToNet')
      expect(result.values).toBeNull()
      expect(result.errors[key]).toBe('Le pourcentage ne peut pas dépasser 100.')
    },
  )

  it('accepts exactly 100 in a percentage field', () => {
    expect(validateInputs({ ...raw, nonBillableShare: '100' }, 'tjmToNet').values).not.toBeNull()
  })

  it.each(['tjm', 'workingDays'] as const)('rejects 0 in %s', (key) => {
    const result = validateInputs({ ...raw, [key]: '0' }, 'tjmToNet')
    expect(result.values).toBeNull()
    expect(result.errors[key]).toBe('La valeur doit être supérieure à 0.')
  })

  it('accepts 0 days off and 0 expenses', () => {
    expect(validateInputs({ ...raw, daysOff: '0', yearlyExpenses: '0' }, 'tjmToNet').values).not.toBeNull()
  })

  it('rejects more days off than working days', () => {
    const result = validateInputs({ ...raw, workingDays: '250', daysOff: '260' }, 'tjmToNet')
    expect(result.values).toBeNull()
    expect(result.errors).toEqual({
      daysOff: 'Les jours de congés ne peuvent pas dépasser les jours ouvrés.',
    })
  })
})

describe('computeMinimalTjm', () => {
  // Reference case A without its TJM, and the same with an awkward share.
  const commons: CommonInputs[] = [
    {
      workingDays: 250,
      daysOff: 25,
      nonBillableShare: 15,
      yearlyExpenses: 6000,
      contributionRate: 20,
      taxRate: 10,
    },
    {
      workingDays: 218,
      daysOff: 33,
      nonBillableShare: 30,
      yearlyExpenses: 4321.5,
      contributionRate: 10,
      taxRate: 20,
    },
  ]
  const bases: ContributionBase[] = ['revenue', 'revenueMinusExpenses']

  const netPerMonth = (common: CommonInputs, tjm: number, base: ContributionBase) =>
    computeBreakdown({ ...common, tjm }, base).netPerMonth

  for (const common of commons) {
    for (const base of bases) {
      it.each([100, 350, 500, 650, 1000, 1234])(
        `round trip: TJM %i -> exact monthly net -> same TJM (${base}, ${common.nonBillableShare} %)`,
        (tjm) => {
          const target = netPerMonth(common, tjm, base)
          expect(computeMinimalTjm(common, target, base)).toEqual({ ok: true, tjm })
        },
      )

      it.each([1, 999.99, 2500, 4000, 5287.5, 12345.67])(
        `property: target %f is reached by the TJM, not by the TJM minus 1 (${base}, ${common.nonBillableShare} %)`,
        (target) => {
          const result = computeMinimalTjm(common, target, base)
          if (!result.ok) throw new Error(result.error)
          expect(netPerMonth(common, result.tjm, base)).toBeGreaterThanOrEqual(target)
          expect(netPerMonth(common, result.tjm - 1, base)).toBeLessThan(target)
        },
      )
    }
  }

  it('gives a message, no number, for a non-billable share of 100 %', () => {
    const result = computeMinimalTjm({ ...commons[0], nonBillableShare: 100 }, 4000, 'revenue')
    expect(result.ok).toBe(false)
    expect(result).not.toHaveProperty('tjm')
  })

  it('gives a message when days off equal working days', () => {
    const result = computeMinimalTjm({ ...commons[0], daysOff: 250 }, 4000, 'revenue')
    expect(result.ok).toBe(false)
  })

  it.each(bases)('gives a message, no number, for a contribution rate of 100 %% (%s)', (base) => {
    const result = computeMinimalTjm({ ...commons[0], contributionRate: 100 }, 4000, base)
    expect(result.ok).toBe(false)
    expect(result).not.toHaveProperty('tjm')
  })

  it.each(bases)('gives a message, no number, for a tax rate of 100 %% (%s)', (base) => {
    const result = computeMinimalTjm({ ...commons[0], taxRate: 100 }, 4000, base)
    expect(result.ok).toBe(false)
    expect(result).not.toHaveProperty('tjm')
  })
})

describe('evaluate', () => {
  const raw: RawInputs = {
    tjm: '',
    targetNetPerMonth: '5 287,50',
    workingDays: '250',
    daysOff: '25',
    nonBillableShare: '15',
    yearlyExpenses: '6000',
    contributionRate: '20',
    taxRate: '10',
  }

  it('finds TJM 500 for the monthly net of reference case A', () => {
    const { result } = evaluate(raw, 'netToTjm', 'revenue')
    expect(result?.kind).toBe('tjm')
    if (result?.kind === 'tjm') {
      expect(result.tjm).toBe(500)
      expect(result.breakdown.netPerMonth).toBeCloseTo(5287.5, 2)
    }
  })

  it('ignores the TJM field in the reverse calculation, and the target in the direct one', () => {
    expect(evaluate({ ...raw, tjm: 'abc' }, 'netToTjm', 'revenue').errors).toEqual({})
    expect(evaluate({ ...raw, tjm: '500', targetNetPerMonth: 'abc' }, 'tjmToNet', 'revenue').errors).toEqual({})
  })

  it('rejects a target of 0', () => {
    const { errors, result } = evaluate({ ...raw, targetNetPerMonth: '0' }, 'netToTjm', 'revenue')
    expect(result).toBeNull()
    expect(errors.targetNetPerMonth).toBe('La valeur doit être supérieure à 0.')
  })

  it('shows a message instead of a number when the target is unreachable', () => {
    const { result } = evaluate({ ...raw, taxRate: '100' }, 'netToTjm', 'revenue')
    expect(result?.kind).toBe('unreachable')
  })
})

describe('readSavedState', () => {
  const saved = {
    raw: {
      tjm: '500',
      targetNetPerMonth: '',
      workingDays: '250',
      daysOff: '25',
      nonBillableShare: '15',
      yearlyExpenses: '6 000',
      contributionRate: '20',
      taxRate: '10,5',
    },
    mode: 'netToTjm',
    base: 'revenueMinusExpenses',
  }

  it('reads back exactly what the page saved', () => {
    expect(readSavedState(JSON.stringify(saved))).toEqual(saved)
  })

  it('returns null when nothing usable was saved', () => {
    expect(readSavedState(null)).toBeNull()
    expect(readSavedState('{not json')).toBeNull()
    expect(readSavedState('42')).toBeNull()
    expect(readSavedState('null')).toBeNull()
  })

  it('drops each corrupted field and keeps the others', () => {
    const corrupted = {
      raw: { ...saved.raw, tjm: 'abc', workingDays: 250, daysOff: '-5', extra: '1' },
      mode: 'other',
      base: 7,
    }
    const result = readSavedState(JSON.stringify(corrupted))
    expect(result?.raw.tjm).toBe('')
    expect(result?.raw.workingDays).toBe('')
    expect(result?.raw.daysOff).toBe('')
    expect(result?.raw.yearlyExpenses).toBe('6 000')
    expect(result?.raw).not.toHaveProperty('extra')
    expect(result?.mode).toBe('tjmToNet')
    expect(result?.base).toBe('revenue')
  })

  it('gives empty fields when raw is missing', () => {
    expect(readSavedState('{"mode":"netToTjm"}')?.raw.tjm).toBe('')
  })
})
