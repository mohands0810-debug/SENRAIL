# SENRAIL — Demo Guide

**RUNTIME REBELS · Smart India Hackathon 2026 · PS SIH26028**

> All data shown is synthetic and for demonstration purposes only.

---

## Before You Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. Hard-refresh (`Ctrl+Shift+R`) if you've opened it before.

The SENRAIL logo appears in the **browser tab**, **sidebar**, and **top header**.

---

## Page-by-Page Demo Script

---

### 1. Overview — Fleet Dashboard (2 min)

**Navigate to:** Overview (default landing page)

**What to show:**

1. **Fleet stats strip** — Point out: 100 trains, X running, X delayed, X halted, X on-time
2. **LIVE SIM card** — Train 12627 Karnataka Express with a 🔴 LIVE badge
   - Before simulation starts, speed and ETA are static
3. Click **Start** in the Simulation Lab (or use the header controls) — return to Overview
   - Speed chart and delay chart appear and animate live
   - The LIVE SIM card updates every 3 seconds
4. **Fleet table** — Scroll through all 100 trains (20 per page)
   - Filter: change Type to "Rajdhani" → only Rajdhani trains shown
   - Filter: change Status to "Delayed" → only delayed trains shown
   - Click any row → route corridor + station schedule expands below
5. Point out pagination (5 pages × 20 trains)

**Key talking points:**
- 100 synthetic trains representing real Indian railway routes
- Live simulation ticks every 3 seconds — ETA recalculates each tick
- Filters are instant — no page reload

---

### 2. Live Train Monitor (2 min)

**Navigate to:** Live Train Monitor

**What to show:**

1. **Stats strip** — Total fleet, Running, Delayed, Halted, Avg Speed, Avg Delay
2. **🔴 LIVE SIM card** — Karnataka Express 12627 with:
   - Current speed, delay, predicted ETA, confidence
   - Station-by-station table (Passed / Approaching / Upcoming / Destination)
3. **Full fleet table** — All 100 trains with:
   - Train No, Name, From/To codes (hover for full name)
   - Predicted ETA column (color: green/amber/red based on delay)
   - Speed, distance remaining, delay, status, days of operation
4. **Search** — Type `MAS` → shows all trains through Chennai Central
   - Type `Rajdhani` → shows only Rajdhani trains
   - Type `SBC` → shows all Bengaluru trains
5. **Click any row** → Detail panel expands:
   - Dark navy header with train number, type, ETA
   - Metrics bar (departure, arrival, ETA, speed, distance, delay)
   - Network map (left) — route highlighted in blue, current station pulsing orange
   - Station schedule table (right) — predicted arrival per stop with delay
6. Click another row → detail switches to that train

**Key talking points:**
- The 🔴 LIVE badge marks the actively simulated train
- Any of the 100 trains can be inspected in detail
- Network map is a pure SVG schematic — no external mapping library

---

### 3. Route Conditions (1.5 min)

**Navigate to:** Route Conditions

**What to show:**

1. **8-tile summary** — Total sections, Normal, Congested, Restricted, Weather, Signal Hold, Active Events, Heavy Rain routes
2. **🔴 LIVE SIM sections** card — Karnataka Express 12627 sections
   - These update when you change scenario in Simulation Lab
   - Currently shows weather, congestion, signal status
3. **All sections table** — 100 rows (one per train)
   - Columns: Train, Name, Route, Section, Condition, Weather, Congestion, Active Event, ETA Impact, Speed Limit
   - Filter: Condition = "Congested" → shows all congested sections
   - Filter: Weather = "Heavy Rain" → shows rain-affected routes
4. **Demo interaction:**
   - Switch to Simulation Lab → activate Heavy Rain → come back → LIVE SIM card updates

**Key talking points:**
- Each of the 100 trains has a synthetic route section with deterministic conditions
- Conditions are consistent across page loads (seeded data)
- The LIVE SIM card reflects actual simulation state in real time

---

### 4. Simulation Lab (1.5 min)

**Navigate to:** Simulation Lab

**What to show:**

1. **Scenario presets** — Six buttons:
   - **Normal** — baseline conditions
   - **Heavy Congestion** — speed drops, delay climbs
   - **Track Maintenance** — speed restriction enforced
   - **Heavy Rain** — weather impact on travel time
   - **Signal Hold** — discrete signal delay added
   - **Combined Disruption** — everything at once
2. **Activate Heavy Congestion:**
   - Watch speed drop in the stats
   - ETA increases by several minutes
3. **Activate Track Maintenance:**
   - Speed restriction appears
   - ETA jumps further
4. **Activate Normal:**
   - ETA begins recovering (partially — delay already accumulated)

**Key talking points:**
- Each scenario changes the condition parameters fed into the ETA prediction engine
- The prediction formula re-runs every tick — changes are visible within 3 seconds
- This demonstrates the explainability goal: we can see exactly why ETA changed

---

### 5. ETA Analysis (1.5 min)

**Navigate to:** ETA Analysis

**What to show:**

1. **ETA Trend chart** — Area chart showing predicted ETA over simulated time
   - Blue reference line = scheduled ETA
   - Red area moving above it = delay accumulating
2. **Speed History chart** — Shows speed dropping when you activated Heavy Congestion
   - Orange reference line = speed restriction
3. **Delay Trend chart** — Minutes of delay over time
   - Green baseline = on time
4. **Impact Breakdown** — Horizontal bar chart showing per-factor contributions:
   - Congestion effect
   - Maintenance effect
   - Weather effect
   - Signal hold effect
   - Historical variance

**Key talking points:**
- Charts record rolling 60-point history — last ~20 minutes of simulated time
- This is the explainability layer — we show *why* ETA changed, not just that it did
- The prediction formula is fully transparent, documented in `docs/ETA_PREDICTION.md`

---

### 6. Train Search (1.5 min)

**Navigate to:** Train Search

**What to show:**

1. **Default view** — First 20 trains shown as cards with Predicted ETA badge (green/amber/red)
2. **Search by number:**
   - Type `12431` → Thiruvananthapuram Rajdhani card appears
   - Click the card → detail panel expands
3. **Detail panel:**
   - Network map with highlighted route (NZM → TVC — entire length of India)
   - Route corridor with station stops and train emoji animating
   - Station table with predicted arrival per stop
4. **Date search:**
   - Pick a Wednesday → only trains running on Wednesday shown
   - Pick a Sunday → Daily trains + Wed/Sun trains visible
5. **Time range search:**
   - Set Departure From `06:00`, To `10:00` → only morning trains shown
6. **Combined search:**
   - Search `Bengaluru`, pick a Monday → all Monday trains through Bengaluru

**Key talking points:**
- 100 trains fully searchable across multiple dimensions
- Date filter uses day-of-week (trains run on specific days)
- Network map shows the full route on the schematic — great for route visualization

---

## Full 10-Minute Demonstration Sequence

| Time | Action |
|---|---|
| 0:00 | Open Overview — show fleet stats and 100-train table |
| 1:00 | Start simulation — show live speed/delay charts updating |
| 2:00 | Open Simulation Lab — activate Heavy Congestion |
| 2:30 | Return to Overview — show ETA has increased |
| 3:00 | Open Live Monitor — search "Rajdhani" — click a result |
| 4:00 | Show network map + station schedule in detail panel |
| 4:30 | Open ETA Analysis — show all 4 charts |
| 5:30 | Open Route Conditions — filter by "Congested" |
| 6:00 | Return to Simulation Lab — activate Track Maintenance |
| 6:30 | Return to ETA Analysis — show new impact bars |
| 7:00 | Open Train Search — search "12431" — click result |
| 7:30 | Show Rajdhani route on network map (Delhi to Trivandrum) |
| 8:00 | Use date picker (Wednesday) — show filtered results |
| 8:30 | Summary — emphasise: 100 trains, 6 pages, full ETA explainability |
| 10:00 | End |

---

## Quick Demo Points (Talking Points)

- **"100 trains across all major Indian railway zones"** — overview table, live monitor
- **"ETA updates every 3 seconds as conditions change"** — simulation lab + overview
- **"We show *why* ETA changed, not just that it did"** — ETA analysis impact chart
- **"Search by train number, name, station, date, or time"** — train search page
- **"Full network map with highlighted route"** — live monitor or train search detail
- **"No external API or backend required — runs entirely in the browser"** — tech stack
- **"The architecture is ready for authorised railway data integration"** — future integration

---

## Demo Environment Notes

- The **simulated railway clock** starts at **13:05** and advances **20 seconds per tick** (3-second real-time interval)
- Charts begin filling only after simulation starts — always start the simulation before showing ETA Analysis
- Conditions reset when you navigate away from Simulation Lab and back — use scenario presets
- All data is **synthetic** — stated on every page and in the footer

---

*SENRAIL · RUNTIME REBELS · SIH 2026 · PS SIH26028*
