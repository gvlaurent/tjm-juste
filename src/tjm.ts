// Parsing and calculation for the TJM calculator.
// Pure functions only: no React, no access to the page or the browser.

// Which calculation the user runs: TJM to net income, or the reverse.
export type Mode = 'tjmToNet' | 'netToTjm'

export type FieldKey =
  | 'tjm'
  | 'targetNetPerMonth'
  | 'workingDays'
  | 'daysOff'
  | 'nonBillableShare'
  | 'yearlyExpenses'
  | 'contributionRate'
  | 'taxRate'

// Raw text typed by the user, one string per field.
export type RawInputs = Record<FieldKey, string>

// Inputs shared by both calculations.
// Shares and rates are percentages as typed, not fractions.
export type CommonInputs = {
  workingDays: number
  daysOff: number
  nonBillableShare: number
  yearlyExpenses: number
  contributionRate: number
  taxRate: number
}

// Inputs of the TJM → net income calculation.
export type Inputs = CommonInputs & { tjm: number }

// What contributions are computed on, chosen by the user.
export type ContributionBase = 'revenue' | 'revenueMinusExpenses'

export type Breakdown = {
  billedDays: number
  revenue: number
  expenses: number
  contributions: number
  tax: number
  netPerYear: number
  netPerMonth: number
}

const COMMON_KEYS: (keyof CommonInputs)[] = [
  'workingDays',
  'daysOff',
  'nonBillableShare',
  'yearlyExpenses',
  'contributionRate',
  'taxRate',
]

// The fields shown for a mode, in display order: the first one changes.
export function fieldsFor(mode: Mode): FieldKey[] {
  return [mode === 'tjmToNet' ? 'tjm' : 'targetNetPerMonth', ...COMMON_KEYS]
}

export type ParseResult =
  | { ok: true; value: number }
  | { ok: false; error: string }

// Error messages per field; a missing key means the field is valid.
export type FieldErrors = Partial<Record<FieldKey, string>>

export type Validation = {
  values: Partial<Record<FieldKey, number>> | null
  errors: FieldErrors
}

const PERCENT_FIELDS: FieldKey[] = ['nonBillableShare', 'contributionRate', 'taxRate']
const NON_ZERO_FIELDS: FieldKey[] = ['tjm', 'targetNetPerMonth', 'workingDays']

// Digits with at most one decimal separator (comma or dot).
// Exponents such as "1e3" are rejected on purpose: likely a typo.
const NUMBER_PATTERN = /^\d+([.,]\d+)?$/

// Reads one typed value. Spaces are removed first so "6 000" reads as 6000;
// \s also covers the non-breaking spaces used in French number formatting.
export function parseNumber(raw: string): ParseResult {
  const text = raw.replace(/\s/g, '')
  if (text === '') return { ok: false, error: 'Ce champ est obligatoire.' }
  if (text.startsWith('-')) {
    return { ok: false, error: 'La valeur ne peut pas être négative.' }
  }
  if (!NUMBER_PATTERN.test(text)) {
    return { ok: false, error: 'Saisissez un nombre, par exemple 12,5.' }
  }
  return { ok: true, value: Number(text.replace(',', '.')) }
}

// Parses the fields of the mode, then applies the range rules of Step 2.
// values is null as long as one field is invalid, so no result is shown.
export function validateInputs(raw: RawInputs, mode: Mode): Validation {
  const errors: FieldErrors = {}
  const values: Partial<Record<FieldKey, number>> = {}

  for (const key of fieldsFor(mode)) {
    const parsed = parseNumber(raw[key])
    if (!parsed.ok) {
      errors[key] = parsed.error
    } else if (PERCENT_FIELDS.includes(key) && parsed.value > 100) {
      errors[key] = 'Le pourcentage ne peut pas dépasser 100.'
    } else if (NON_ZERO_FIELDS.includes(key) && parsed.value === 0) {
      errors[key] = 'La valeur doit être supérieure à 0.'
    } else {
      values[key] = parsed.value
    }
  }

  const { workingDays, daysOff } = values
  if (workingDays !== undefined && daysOff !== undefined && daysOff > workingDays) {
    errors.daysOff = 'Les jours de congés ne peuvent pas dépasser les jours ouvrés.'
    delete values.daysOff
  }

  const hasErrors = Object.keys(errors).length > 0
  return { values: hasErrors ? null : values, errors }
}

// The calculation model. No rounding here: rounding happens at display only.
// A negative base gives zero, never negative contributions or tax (Step 3 rule).
export function computeBreakdown(inputs: Inputs, base: ContributionBase): Breakdown {
  const billedDays =
    (inputs.workingDays - inputs.daysOff) * (1 - inputs.nonBillableShare / 100)
  const revenue = inputs.tjm * billedDays
  const expenses = inputs.yearlyExpenses
  const contributionBase = base === 'revenue' ? revenue : revenue - expenses
  const contributions = (inputs.contributionRate / 100) * Math.max(0, contributionBase)
  const taxBase = revenue - expenses - contributions
  const tax = (inputs.taxRate / 100) * Math.max(0, taxBase)
  const netPerYear = revenue - expenses - contributions - tax
  return {
    billedDays,
    revenue,
    expenses,
    contributions,
    tax,
    netPerYear,
    netPerMonth: netPerYear / 12,
  }
}

export type TjmResult = { ok: true; tjm: number } | { ok: false; error: string }

// Minimal TJM, in whole euros, whose monthly net reaches the target (> 0).
export function computeMinimalTjm(
  common: CommonInputs,
  targetNetPerMonth: number,
  base: ContributionBase,
): TjmResult {
  const billedDays =
    (common.workingDays - common.daysOff) * (1 - common.nonBillableShare / 100)
  if (billedDays <= 0) {
    return {
      ok: false,
      error:
        'Objectif inatteignable : aucun jour n\'est facturable. Réduisez les congés ou la part de temps non facturable.',
    }
  }
  if (common.contributionRate >= 100) {
    return {
      ok: false,
      error:
        'Objectif inatteignable : un taux de cotisations de 100 % ne laisse aucun revenu.',
    }
  }
  if (common.taxRate >= 100) {
    return {
      ok: false,
      error: 'Objectif inatteignable : un taux d\'imposition de 100 % ne laisse aucun revenu.',
    }
  }

  // Inverse of the model in the region where the target is reached. The target
  // is positive, so the contribution and tax bases are positive there too.
  const c = common.contributionRate / 100
  const t = common.taxRate / 100
  const expenses = common.yearlyExpenses
  const targetPerYear = targetNetPerMonth * 12
  const revenue =
    base === 'revenue'
      ? (targetPerYear / (1 - t) + expenses) / (1 - c)
      : expenses + targetPerYear / ((1 - c) * (1 - t))

  // Floating-point residue can push the exact TJM just above a whole euro
  // (500.00000000000006 → 501). The forward model settles it instead.
  const reaches = (tjm: number) =>
    computeBreakdown({ ...common, tjm }, base).netPerMonth >= targetNetPerMonth
  let tjm = Math.ceil(revenue / billedDays)
  while (tjm > 0 && reaches(tjm - 1)) tjm -= 1
  while (!reaches(tjm)) tjm += 1
  return { ok: true, tjm }
}

// What the page keeps between visits: the typed text, not parsed numbers.
export type SavedState = { raw: RawInputs; mode: Mode; base: ContributionBase }

const ALL_KEYS: FieldKey[] = ['tjm', 'targetNetPerMonth', ...COMMON_KEYS]

// Reads what the page saved earlier. Saved data is input too: anything that
// is not what we wrote is dropped, field by field, and a field is kept only
// if parseNumber accepts it, exactly as if it had been typed.
// Returns null when nothing usable was saved.
export function readSavedState(text: string | null): SavedState | null {
  if (text === null) return null
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return null
  }
  if (typeof data !== 'object' || data === null) return null
  const saved = data as Record<string, unknown>
  const savedRaw = (typeof saved.raw === 'object' && saved.raw !== null ? saved.raw : {}) as Record<
    string,
    unknown
  >

  const raw = Object.fromEntries(
    ALL_KEYS.map((key) => {
      const value = savedRaw[key]
      return [key, typeof value === 'string' && parseNumber(value).ok ? value : '']
    }),
  ) as RawInputs
  const mode: Mode = saved.mode === 'netToTjm' ? 'netToTjm' : 'tjmToNet'
  const base: ContributionBase =
    saved.base === 'revenueMinusExpenses' ? 'revenueMinusExpenses' : 'revenue'
  return { raw, mode, base }
}

export type Result =
  | { kind: 'net'; breakdown: Breakdown }
  | { kind: 'tjm'; tjm: number; breakdown: Breakdown }
  | { kind: 'unreachable'; message: string }

// Validates the fields of the mode and runs its calculation.
// result is null while a field is invalid.
export function evaluate(
  raw: RawInputs,
  mode: Mode,
  base: ContributionBase,
): { errors: FieldErrors; result: Result | null } {
  const { values, errors } = validateInputs(raw, mode)
  if (values === null) return { errors, result: null }

  // validateInputs guarantees every field of the mode is present here.
  const common = Object.fromEntries(
    COMMON_KEYS.map((key) => [key, values[key]]),
  ) as CommonInputs

  if (mode === 'tjmToNet') {
    const tjm = values.tjm as number
    return { errors, result: { kind: 'net', breakdown: computeBreakdown({ ...common, tjm }, base) } }
  }

  const reverse = computeMinimalTjm(common, values.targetNetPerMonth as number, base)
  if (!reverse.ok) return { errors, result: { kind: 'unreachable', message: reverse.error } }
  const breakdown = computeBreakdown({ ...common, tjm: reverse.tjm }, base)
  return { errors, result: { kind: 'tjm', tjm: reverse.tjm, breakdown } }
}

const euroFormat = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const wholeEuroFormat = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const daysFormat = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function formatEuro(amount: number): string {
  return euroFormat.format(amount)
}

// For the minimal TJM, already a whole number of euros.
export function formatWholeEuro(amount: number): string {
  return wholeEuroFormat.format(amount)
}

export function formatDays(days: number): string {
  return daysFormat.format(days)
}

// A negative net income reads as a loss, never as a negative amount.
export function formatNet(amount: number): string {
  return amount < 0 ? `Perte : ${formatEuro(-amount)}` : formatEuro(amount)
}
