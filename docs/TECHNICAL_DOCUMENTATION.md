# SENRAIL — Technical Documentation

**RUNTIME REBELS · Smart India Hackathon 2026 · PS SIH26028**

> All data in this prototype is synthetic. No real Indian Railways operational data is used.

---

## 1. System Overview

SENRAIL is a browser-based prototype for dynamic ETA forecasting of Indian coaching trains. It consists of:

- **Simulation engine** — produces live train state updates every 3 seconds
- **ETA prediction engine** — stateless formula-based predictor
- **100-train fleet catalog** — deterministic synthetic train dataset
- **6-page dashboard** — fleet overview, live monitor, route conditions, ETA analysis, simulation lab, train search
- **SVG network map** — schematic Indian railway corridor diagram

The entire application runs client-side with no backend, no database, and no external API calls.

---

## 2. Technology Stack

| Component | Technology | Version |
|---|---|---|
| Frontend framework | React with TypeScript | 18.x |
| Build tool | Vite | 8.x |
| Charts | Recharts | latest |
| Icons | Lucide React | latest |
| Network map | Pure SVG (custom) | — |
| CSS | Vanilla CSS with custom design tokens | — |
| State management | React Context + useReducer | — |
| Fonts | Inter, JetBrains Mono (Google Fonts) | — |
| Package manager | npm | — |
| Linter | oxlint | — |

---

## 3. Application Pages

### 3.1 Overview (`OverviewPage.tsx`)

Fleet-wide dashboard. Combines live simulation data from AppContext with catalog data from ALL_TRAINS.

**Components used:** `RouteVisualization`, `ETAPanel`, `SpeedChart`, `DelayChart`

**Sections:**
- **Fleet stats strip** — 5 tiles: Total (100), Running, Delayed, Halted, On-Time
- **LIVE SIM card** — 12627 Karnataka Express, only when simulation is active; shows speed, delay, ETA, confidence; includes route corridor visualization
- **Speed + Delay charts** — appear when simulation is running and history arrays have > 1 point
- **Selected train quick detail** — expands when a row is clicked; shows station corridor timeline
- **Fleet table** — ALL_TRAINS (100 trains), paginated 20/page, with text/type/status filters

### 3.2 Live Train Monitor (`LiveMonitorPage.tsx`)

Full 100-train fleet view with click-to-inspect detail.

**Components used:** `StationTable`, `NetworkMap`

**Sections:**
- **Stats strip** — 6 tiles: Total, Running, Delayed, Halted, Avg Speed, Avg Delay
- **LIVE SIM card** — Karnataka Express with live station ETA table
- **Click-to-inspect panel** — dark navy header, metrics bar, network map (left), station schedule table (right)
- **Fleet table** — ALL_TRAINS (100 trains), paginated 20/page, with text/type/status filters; Predicted ETA column (color-coded)
- The live-simulated train (12627) is marked with a 🔴 pulsing dot in the table

### 3.3 Route Conditions (`RouteConditionsPage.tsx`)

Section-level operational conditions for all 100 trains plus live simulation sections.

**Data source:** Deterministic hash of train ID assigns condition/weather/congestion to each route section.

**Sections:**
- **8-tile summary** — Normal, Congested, Restricted, Weather, Signal Hold, Active Events, Heavy Rain Routes
- **LIVE SIM card** — actual simulated sections from AppContext, updated by scenario changes
- **All-sections table** — 100 rows, paginated 20/page, with condition/weather filters

### 3.4 ETA Analysis (`ETAAnalysisPage.tsx`)

Time-series visualization of prediction history.

**Components used:** `ETAChart`, `SpeedChart`, `DelayChart`, `ImpactBarChart`

**Charts:**
- **ETA Trend** — AreaChart showing `predictedMinutes` over sim time; reference line = scheduled ETA
- **Speed History** — AreaChart with speed restriction reference line
- **Delay Trend** — AreaChart with 0-minute baseline reference
- **Factor Impact** — Horizontal BarChart showing per-factor ETA contributions; color-coded by type

### 3.5 Simulation Lab (`SimLabPage.tsx`)

Interactive scenario control panel.

**Scenarios:**

| Scenario | Speed Effect | Delay Cause |
|---|---|---|
| Normal | Full speed | None |
| Heavy Congestion | −35 km/h | Congestion |
| Track Maintenance | Max 45 km/h | Maintenance + speed restriction |
| Heavy Rain | −25 km/h | Weather |
| Signal Hold | Full speed | Discrete +18 min hold |
| Combined Disruption | Max 38 km/h | All of the above |

### 3.6 Train Search (`TrainSearchPage.tsx`)

Multi-dimensional search across all 100 trains.

**Components used:** `NetworkMap`

**Search dimensions:**
- **Text** — train number, name, origin, destination, station code (substring match)
- **Date** — picks a calendar date; filters by day of week against `daysOfWeek[]`
- **Time from/to** — filters `scheduledDeparture` against a time window

**Result display:**
- Card grid (before search: first 20 trains; after search: all matches)
- Click card → detail panel: route corridor, network map, station schedule table

---

## 4. State Management

### 4.1 AppContext (`src/store/AppContext.tsx`)

Single global state tree via React Context + `useReducer`.

```typescript
interface AppState {
  simState: SimulationState;
  trains: Train[];
  sections: RouteSection[];
  events: OperationalEvent[];
  prediction: ETAPrediction | null;
  etaHistory: ETAHistoryPoint[];     // max 60 points
  speedHistory: SpeedHistoryPoint[]; // max 60 points
  delayHistory: DelayHistoryPoint[]; // max 60 points
  lastUpdated: string;
}
```

### 4.2 Actions

| Action | Trigger | Effect |
|---|---|---|
| `TICK` | Every 3s when running | Full re-computation: trains, prediction, sections, events, histories |
| `START_SIM` | User click | Sets `isRunning = true` |
| `STOP_SIM` | User click | Sets `isRunning = false` |
| `SET_SCENARIO` | User clicks a preset | Updates condition parameters in `simState` |
| `SELECT_TRAIN` | User clicks a train row | Updates `selectedTrainId` |

### 4.3 Simulated Railway Clock

The simulation does not use wall-clock time. Instead:

```typescript
// On each TICK:
newSimClock = (state.simState.simClock + 20) % (24 * 60 * 60);
// 20 simulated seconds per real 3-second tick
// At 20 sim-sec/tick: 1 real minute ≈ 400 simulated seconds (≈6.7 sim-minutes)
```

The clock starts at `13:05:00` so predicted ETAs (~15:30) are meaningfully close to the current simulated time, making chart movements visible.

### 4.4 History Arrays

All three history arrays are capped at 60 points using `.slice(-59)` with `?? []` null-safety guards:

```typescript
const newEtaHistory = newPrediction
  ? [...(state.etaHistory ?? []).slice(-59), newPoint]
  : (state.etaHistory ?? []);
```

---

## 5. Prediction Engine (`src/prediction/etaPredictor.ts`)

### 5.1 Inputs

The prediction engine accepts a `PredictionInput` assembled from the current simulation state:

```
currentSpeed, currentDelay, distanceRemaining, weatherCondition,
congestionLevel, maintenanceActive, speedRestriction,
signalDelayMinutes, sections, historicalBaseline
```

### 5.2 Formula

```
effectiveSpeed = max(currentSpeed × speedMultiplier, 10 km/h)
baseRemainingMinutes = (distanceRemaining / effectiveSpeed) × 60

congestion_effect    = f(congestionLevel)  [Low: 0, Moderate: +8, High: +22]
maintenance_effect   = maintenanceActive ? +15 + speedPenalty : 0
weather_effect       = f(weatherCondition) [Clear: 0, LightRain: +5, HeavyRain: +14, Fog: +10]
signal_effect        = signalDelayMinutes
historical_variance  = small stochastic term (seeded to train)
recovery_component   = currentDelay < 0 ? recoverySavings : 0

totalRemainingMinutes = baseRemainingMinutes + all_effects

destinationETA = simClock + totalRemainingMinutes
predictedDelay = totalRemainingMinutes - scheduledRemainingTime
confidence     = 85 − penalties (weather/congestion/maintenance penalties)
```

### 5.3 Contributing Factors

Each factor is computed and returned individually as an `ETAFactor`:

```typescript
[
  { name: 'Congestion',        impactMinutes: congestion_effect    },
  { name: 'Track Maintenance', impactMinutes: maintenance_effect   },
  { name: 'Weather',           impactMinutes: weather_effect       },
  { name: 'Signal Delay',      impactMinutes: signal_effect        },
  { name: 'Historical Variance', impactMinutes: historical_variance },
  { name: 'Schedule Recovery', impactMinutes: -recovery_component  },
]
```

These are displayed in the **Impact Breakdown** bar chart on the ETA Analysis page.

---

## 6. Fleet Catalog System

### 6.1 `staticData.ts` — Manual Trains

6 manually authored `TrainCatalogEntry` objects with full station-level schedules, route sections, and historical baselines.

### 6.2 `trainGenerator.ts` — Generated Trains

Deterministic generator producing 94 additional trains.

```typescript
export function generateTrains(startIndex: number, count: number): TrainCatalogEntry[]
```

**Algorithm:**
1. 25 route templates with station stops and distances
2. For each route: 4 trains × type (chosen by distance range)
3. Seeded RNG: `mkRng(idx * 31337 + routeIdx * 997)`
4. Train number: type-appropriate prefix (12xxx for Rajdhani, 13xxx for Mail, etc.) + seeded offset
5. Speed: pulled from per-type range (e.g., Rajdhani: 85–130 km/h)
6. Delay: probability-weighted (40% on-time, 30% 1–15 min, 20% 16–45 min, 10% 46–120 min)
7. Station stops: proportional times from scheduled departure, using type's average speed

### 6.3 `ALL_TRAINS`

```typescript
export const ALL_TRAINS: TrainCatalogEntry[] = [
  ...TRAIN_CATALOG,          // 6 manual
  ...generateTrains(7, 94),  // 94 generated
];
// Total: 100 trains
```

`ALL_TRAINS` is imported directly by:
- `OverviewPage.tsx`
- `LiveMonitorPage.tsx`
- `RouteConditionsPage.tsx`
- `TrainSearchPage.tsx`

---

## 7. Network Map (`src/components/NetworkMap.tsx`)

### 7.1 Overview

A pure SVG schematic diagram of major Indian railway corridors. No external mapping library.

**ViewBox:** `0 0 560 710`

### 7.2 Station Data

20 stations with `(x, y)` coordinates in the SVG viewbox:

| Code | Station | Approx. Position |
|---|---|---|
| NZM | Hazrat Nizamuddin (Delhi) | North-centre |
| BPL | Bhopal Junction | North-west-centre |
| NGP | Nagpur Junction | Centre |
| CSMT | Mumbai CSMT | West |
| BCT | Mumbai Central | West (near CSMT) |
| SUR | Solapur | West-centre |
| SC | Secunderabad | Centre-south |
| MAS | Chennai Central | East-south |
| KPD | Katpadi Junction | South-east |
| JTJ | Jolarpettai | South-centre |
| BWT | Bangarapet | South-centre |
| KJM | Krishnarajapuram | South-centre |
| SBC | Bengaluru City | South-centre |
| MYS | Mysuru Junction | South |
| ASK | Arsikere Junction | South |
| DVG | Davangere | West-south |
| UBL | Hubballi (Hubli) | West-south |
| CBE | Coimbatore | South |
| ERS | Ernakulam Junction | South-west |
| TVC | Thiruvananthapuram | South-west |

### 7.3 Rendering

- **Corridors** — 11 polylines connecting station pairs (gray, 1.5px)
- **Highlighted route** — segments on the selected train's route drawn in blue (3.5px) with a glow overlay
- **Station nodes** — circles: junction stations larger (r=6), regular stations smaller (r=4)
- **Highlighted station nodes** — blue fill, white stroke, glow ring
- **Current station** — orange fill + SVG `<animate>` element for pulsing ring
- **Labels** — right-anchored for eastern stations, left-anchored for western stations; blue/bold for route stations

### 7.4 Route Definitions

```typescript
export const TRAIN_ROUTES: Record<string, string[]> = {
  '12627': ['MAS', 'KPD', 'JTJ', 'BWT', 'KJM', 'SBC'],
  '12431': ['NZM', 'BPL', 'NGP', 'SC', 'MAS', 'CBE', 'ERS', 'TVC'],
  '12007': ['MYS', 'ASK', 'SBC', 'BWT', 'JTJ', 'KPD', 'MAS'],
  '11013': ['CSMT', 'SUR', 'SC', 'CBE'],
  '12245': ['BCT', 'SUR', 'SC', 'SBC'],
  '16591': ['SBC', 'ASK', 'DVG', 'UBL'],
};
```

Generated trains use the generic corridor highlighting based on their `originCode` and `destinationCode`.

---

## 8. CSS Design System (`src/index.css`)

### 8.1 Design Tokens

```css
--navy: #0f2044           /* Primary brand colour */
--blue-accent: #1d6fa5    /* Interactive elements */
--green: #16a34a          /* On-time / normal */
--amber: #d97706          /* Warning / moderate delay */
--red: #dc2626            /* Alert / heavy delay */
--surface: #ffffff        /* Card backgrounds */
--bg: #f1f5f9             /* Page background */
```

### 8.2 Animations

```css
@keyframes fadeIn       { opacity: 0 → 1 }
@keyframes slideInLeft  { translateX(-20px) → 0 }
@keyframes scaleIn      { scale(0.96) → 1 }
@keyframes pulse        { opacity 1 → 0.4 → 1 }
@keyframes shimmer      { background-position slide }
@keyframes trainMove    { translateX(-4px) → 4px }
```

Key classes:
- `.anim-fadein` — `fadeIn` + `slideInLeft` combined (card entry)
- `.train-result-card` — hover: `translateY(-2px)` lift + blue border glow
- `.train-result-card.selected` — persistent blue border + info background
- `.data-table tbody tr:hover` — row highlight
- `.data-table tbody tr.selected` — row blue highlight (for detail panels)

### 8.3 Responsive Layout

- `.two-col` — `grid-template-columns: 1fr 1fr`; collapses to 1 column below `min-width: 300px`
- `.stat-grid` — `repeat(auto-fill, minmax(140px, 1fr))`
- `.train-results-grid` — `repeat(auto-fill, minmax(340px, 1fr))`
- `.search-form-grid` — flex wrap with `min-width: 160px` per field

---

## 9. File Reference

| File | Purpose |
|---|---|
| `src/App.tsx` | Root component; page router |
| `src/index.css` | Complete design system |
| `src/main.tsx` | React entry point |
| `src/types/index.ts` | All TypeScript interfaces and type aliases |
| `src/store/AppContext.tsx` | Global state: simulated clock, train state, history |
| `src/simulation/engine.ts` | Simulation: tick updates, scenario presets, event building |
| `src/prediction/etaPredictor.ts` | Stateless ETA formula |
| `src/services/api.ts` | API abstraction layer (future integration boundary) |
| `src/data/staticData.ts` | Manual train catalog (6 trains), historical data, helpers |
| `src/data/trainGenerator.ts` | Deterministic 100-train fleet generator |
| `src/components/NetworkMap.tsx` | SVG railway network schematic |
| `src/components/RouteVisualization.tsx` | Horizontal corridor timeline |
| `src/components/ETAChart.tsx` | ETA trend area chart |
| `src/components/SpeedChart.tsx` | Speed trend area chart |
| `src/components/DelayChart.tsx` | Delay trend area chart |
| `src/components/ImpactBarChart.tsx` | Factor impact horizontal bar chart |
| `src/components/ETAPanel.tsx` | ETA summary display |
| `src/components/ImpactAnalysis.tsx` | Contributing factors panel |
| `src/components/StationTable.tsx` | Station ETA table |
| `src/components/RouteConditionsTiles.tsx` | Section condition tiles |
| `src/components/Sidebar.tsx` | Navigation sidebar (6 pages) |
| `src/components/TopHeader.tsx` | Top bar with logo and sim clock |
| `src/pages/OverviewPage.tsx` | Fleet dashboard (redesigned) |
| `src/pages/LiveMonitorPage.tsx` | 100-train monitor (redesigned) |
| `src/pages/RouteConditionsPage.tsx` | 100-section conditions (redesigned) |
| `src/pages/ETAAnalysisPage.tsx` | ETA + Speed + Delay + Impact charts |
| `src/pages/SimLabPage.tsx` | Scenario controls |
| `src/pages/TrainSearchPage.tsx` | Multi-dimensional train search (new) |
| `public/senrail-logo.jpg` | Brand logo (favicon + sidebar + header) |
| `index.html` | HTML shell; sets favicon to senrail-logo.jpg |
| `docs/` | Full documentation suite |

---

## 10. Build and Deployment

### Development

```bash
npm install
npm run dev
# → http://localhost:5173
```

### Production Build

```bash
npm run build
# Output: dist/
# Bundle: ~718 KB JS (gzipped: ~205 KB)
# CSS: ~19.5 KB (gzipped: ~4.3 KB)
```

### Lint

```bash
npx oxlint .
```

### Type Check (without build)

```bash
npx tsc --noEmit
```

---

*SENRAIL · RUNTIME REBELS · SIH 2026 · PS SIH26028*
