# Contributing to SENRAIL

Thank you for your interest in contributing to SENRAIL.

---

## Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd SENRAIL

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

---

## Project Structure

```
src/
  components/     Reusable UI components
  data/           Static synthetic data
  pages/          Page-level components (one per navigation item)
  prediction/     ETA prediction engine
  services/       API abstraction layer
  simulation/     Simulation engine and scenario presets
  store/          Global state (React Context + useReducer)
  types/          TypeScript type definitions
  index.css       Design system CSS
```

Keep the separation between layers intact:
- **Simulation logic** belongs in `src/simulation/`
- **Prediction logic** belongs in `src/prediction/`
- **UI logic** belongs in `src/components/` and `src/pages/`
- **Types** belong in `src/types/`

---

## Branch Naming

```
feature/<short-description>     New features
fix/<short-description>         Bug fixes
docs/<short-description>        Documentation changes
refactor/<short-description>    Refactoring without feature changes
```

Examples:
```
feature/ml-prediction-engine
fix/eta-chart-timezone
docs/update-demo-guide
```

---

## Commit Conventions

Follow conventional commits:

```
feat: add fog weather condition modelling
fix: correct station ETA proportional distribution
docs: add ETA prediction assumptions
refactor: extract speed simulation into helper function
test: add unit tests for congestion detection
```

Keep commit messages concise and factual.

---

## Pull Requests

1. Create a branch from `main`
2. Make focused, well-scoped changes
3. Ensure the build passes: `npm run build`
4. Update documentation if behaviour changes
5. Write a clear PR description explaining what changed and why

---

## Code Quality

- TypeScript — all new code must be typed; avoid `any`
- No secrets, API keys, or environment variables hardcoded in source
- No live Indian Railways data or claims of live data integration
- All simulated data must be clearly labelled as synthetic

### Style

- Use the existing CSS design system tokens (variables defined in `index.css`)
- Do not introduce new dependencies without discussion
- Keep components focused — one responsibility per component

---

## Testing

Currently the project does not have an automated test suite. Manual verification of the following is expected before any PR:

1. `npm run build` succeeds with no TypeScript errors
2. All five navigation pages render correctly
3. Simulation starts, pauses, and resets correctly
4. All six scenario buttons update conditions and ETA
5. ETA history chart updates as simulation runs
6. Route conditions page shows section statuses
7. Live train monitor allows train selection

If you add logic to the prediction engine or simulation engine, please include inline documentation of any formula or algorithm changes.

---

## Documentation

Any change to prediction logic, simulation behaviour, data structures, or architecture must be reflected in the corresponding documentation file in `docs/`.

---

## Questions

Open an issue to discuss significant changes before starting work.

---

*SENRAIL · RUNTIME REBELS · SIH 2026 · PS SIH26028*
