# Calculateur TJM

A single web page that turns a day rate (TJM) into an estimated net income, and a target monthly income into a minimal TJM. One user, no account, no server.

Simplified model: the contribution and tax rates are the ones the user types. No real rate is stored in this repository.

## Commands

- `npm install`: install the dependencies.
- `npm run dev`: start the app, then open http://127.0.0.1:5173/.
- `npm test`: run the tests once.
- `npm run build`: type-check and build into `dist/`.
- `npm run lint`: run the linter.

## Files

- `src/tjm.ts`: parsing, validation and calculation (pure functions, no React).
- `src/tjm.test.ts`: the tests.
- `src/App.tsx`: the form, the breakdown and the notice.
- `PLAN.md`: the plan, the steps and the log. `AGENTS.md`: the brief for the coding agent.
