import { useEffect, useState, type KeyboardEvent } from 'react'
import {
  evaluate,
  fieldsFor,
  formatDays,
  formatEuro,
  formatNet,
  formatWholeEuro,
  readSavedState,
  type Breakdown,
  type ContributionBase,
  type FieldKey,
  type Mode,
  type RawInputs,
  type SavedState,
} from './tjm'
import './App.css'

const LABELS: Record<FieldKey, string> = {
  tjm: 'TJM (€ HT)',
  targetNetPerMonth: 'Revenu net mensuel visé (€)',
  workingDays: "Jours ouvrés dans l'année",
  daysOff: 'Jours de congés',
  nonBillableShare: 'Part de temps non facturable (%)',
  yearlyExpenses: 'Frais professionnels annuels (€)',
  contributionRate: 'Taux de cotisations (%)',
  taxRate: "Taux d'imposition estimé (%)",
}

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: 'tjmToNet', label: 'TJM → revenu' },
  { value: 'netToTjm', label: 'Revenu → TJM' },
]

const BASE_OPTIONS: { value: ContributionBase; label: string }[] = [
  { value: 'revenue', label: "Chiffre d'affaires" },
  { value: 'revenueMinusExpenses', label: "Chiffre d'affaires moins les frais" },
]

// Every field starts empty: no rate is ever pre-filled.
const EMPTY: RawInputs = {
  tjm: '',
  targetNetPerMonth: '',
  workingDays: '',
  daysOff: '',
  nonBillableShare: '',
  yearlyExpenses: '',
  contributionRate: '',
  taxRate: '',
}

const STORAGE_KEY = 'calculateur-tjm'

// Storage can be missing or blocked (private window, browser settings):
// the page then works normally and simply doesn't remember.
function loadState(): SavedState {
  try {
    const saved = readSavedState(localStorage.getItem(STORAGE_KEY))
    if (saved) return saved
  } catch {
    // Storage unavailable: start empty.
  }
  return { raw: EMPTY, mode: 'tjmToNet', base: 'revenue' }
}

function saveState(state: SavedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable or full: nothing to keep, nothing to report.
  }
}

// Arrow Down / Arrow Up move to the next / previous field; no wrap at the ends.
// Tab and Shift+Tab keep working as usual.
function moveFocus(event: KeyboardEvent<HTMLInputElement>, fields: FieldKey[], index: number) {
  const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0
  const target = fields[index + step]
  if (step === 0 || target === undefined) return
  event.preventDefault()
  document.getElementById(target)?.focus()
}

function BreakdownList({ breakdown }: { breakdown: Breakdown }) {
  return (
    <dl>
      <dt>Jours facturés</dt>
      <dd>{formatDays(breakdown.billedDays)}</dd>
      <dt>Chiffre d&apos;affaires</dt>
      <dd>{formatEuro(breakdown.revenue)}</dd>
      <dt>Frais professionnels</dt>
      <dd>{formatEuro(breakdown.expenses)}</dd>
      <dt>Cotisations</dt>
      <dd>{formatEuro(breakdown.contributions)}</dd>
      <dt>Impôt</dt>
      <dd>{formatEuro(breakdown.tax)}</dd>
      <dt>Revenu net par an</dt>
      <dd>{formatNet(breakdown.netPerYear)}</dd>
      <dt className="total">Revenu net par mois</dt>
      <dd className="total">{formatNet(breakdown.netPerMonth)}</dd>
    </dl>
  )
}

function App() {
  // Read storage once, on the first render only.
  const [initial] = useState(loadState)
  const [raw, setRaw] = useState<RawInputs>(initial.raw)
  // Fields the user has left at least once: an empty field only shows
  // its message after that, so the page doesn't open full of errors.
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({})
  const [mode, setMode] = useState<Mode>(initial.mode)
  const [base, setBase] = useState<ContributionBase>(initial.base)

  useEffect(() => saveState({ raw, mode, base }), [raw, mode, base])
  // Text of the live region: set only when a field is left, so screen
  // readers announce errors once instead of on every keystroke.
  const [announcement, setAnnouncement] = useState('')
  const fields = fieldsFor(mode)
  const { errors, result } = evaluate(raw, mode, base)

  function leaveField(key: FieldKey) {
    setTouched({ ...touched, [key]: true })
    const error = errors[key]
    if (error) setAnnouncement(`${LABELS[key]} : ${error}`)
    else if (result?.kind === 'unreachable') setAnnouncement(result.message)
    else setAnnouncement('')
  }

  return (
    <main>
      <header>
        <h1>
          <img className="logo" src="/favicon.svg" alt="" width="48" height="46" />
          Calculateur TJM
        </h1>
        <p className="notice">
          Modèle simplifié. Les taux sont ceux que vous saisissez : vérifiez-les
          sur les sources officielles. Ce résultat ne remplace ni le simulateur
          officiel de l&apos;Urssaf ni un expert-comptable.
        </p>
      </header>

      <div className="layout">
        <form className="card" onSubmit={(event) => event.preventDefault()}>
          <fieldset className="choice">
            <legend>Calcul</legend>
            <div className="segmented">
              {MODE_OPTIONS.map((option) => (
                <label key={option.value}>
                  <input
                    type="radio"
                    name="mode"
                    value={option.value}
                    checked={mode === option.value}
                    onChange={() => setMode(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="fields">
            {fields.map((key, index) => {
              const error = touched[key] || raw[key] !== '' ? errors[key] : undefined
              const errorId = `${key}-error`
              return (
                <div className="field" key={key}>
                  <label htmlFor={key}>{LABELS[key]}</label>
                  <input
                    id={key}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={raw[key]}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    onChange={(event) => setRaw({ ...raw, [key]: event.target.value })}
                    onBlur={() => leaveField(key)}
                    onKeyDown={(event) => moveFocus(event, fields, index)}
                  />
                  {error && (
                    <p className="error" id={errorId}>
                      {error}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <fieldset className="choice">
            <legend>Assiette des cotisations</legend>
            <div className="segmented">
              {BASE_OPTIONS.map((option) => (
                <label key={option.value}>
                  <input
                    type="radio"
                    name="contributionBase"
                    value={option.value}
                    checked={base === option.value}
                    onChange={() => setBase(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        </form>

        <section className="result card">
          <h2>Détail</h2>
          {result === null && (
            <p className="empty">Remplissez tous les champs pour voir le résultat.</p>
          )}
          {result?.kind === 'unreachable' && <p className="error">{result.message}</p>}
          {result?.kind === 'tjm' && (
            <p className="headline">
              TJM minimal :<br />
              <strong>{formatWholeEuro(result.tjm)}</strong> HT
            </p>
          )}
          {(result?.kind === 'net' || result?.kind === 'tjm') && (
            <BreakdownList breakdown={result.breakdown} />
          )}
        </section>
      </div>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </main>
  )
}

export default App
