# SENRAIL — Project Scope

**RUNTIME REBELS · Smart India Hackathon 2026 · PS SIH26028**

---

## Problem Statement

**SIH26028:** Dynamic Forecast of Expected Time of Arrival (ETA) for Coaching Trains

Indian coaching trains operate across a vast network under continuously changing conditions. Published schedules are static and cannot account for real-time disruptions — congestion, track maintenance, weather, signal delays, or unscheduled stoppages. Passengers, station operators, and railway control staff lack reliable forward-looking arrival estimates.

---

## What SENRAIL Solves

SENRAIL is a predictive intelligence layer that sits above existing railway information systems and produces **dynamic, explained ETA forecasts** for coaching trains.

It answers three questions continuously:
1. **Where is the train?** — position, speed, section, delay
2. **What is ahead?** — congestion, maintenance, weather, signals
3. **When will it arrive?** — predicted ETA at every upcoming station and destination

---

## Prototype Scope

### In Scope (Built in this prototype)

| Capability | Status |
|---|---|
| Dynamic ETA forecasting (formula-based) | ✅ Complete |
| Per-factor ETA explainability | ✅ Complete |
| Congestion, maintenance, weather, signal handling | ✅ Complete |
| Synthetic historical baseline for sectional averages | ✅ Complete |
| Station-wise ETA prediction (all intermediate stops) | ✅ Complete |
| ETA, speed, delay history charts (rolling time-series) | ✅ Complete |
| Interactive simulation lab (6 scenario presets) | ✅ Complete |
| **100-train fleet dataset** (synthetic, deterministic) | ✅ Complete |
| **Fleet overview dashboard** (search, filter, paginate) | ✅ Complete |
| **Live train monitor** (100 trains, per-train detail) | ✅ Complete |
| **Route conditions monitor** (100 route sections) | ✅ Complete |
| **Train search** (by number, name, station, date, time) | ✅ Complete |
| **SVG railway network map** (schematic with route highlight) | ✅ Complete |
| **Route corridor visualisation** | ✅ Complete |
| SENRAIL branding (logo, favicon, header) | ✅ Complete |
| Simulated railway clock (not wall time) | ✅ Complete |
| API abstraction layer (future integration boundary) | ✅ Complete |
| Full TypeScript typing for all domain objects | ✅ Complete |
| Responsive design, dark navy theme, micro-animations | ✅ Complete |
| Full documentation suite (7 docs) | ✅ Complete |

### Out of Scope (Prototype Boundary)

| Capability | Reason |
|---|---|
| Live RTIS/NTES data integration | Requires authorised railway data access — architectural boundary defined |
| ML-based prediction model | Formula-based predictor is the prototype; ML-ready input schema defined |
| Backend server / database | Not required for prototype; architecture supports it |
| Real geographic map (Google Maps / OpenStreetMap) | No API key required; schematic diagram serves demo purpose |
| Passenger-facing mobile app | Separate product vertical |
| Multi-user authentication | Not applicable for prototype |
| Push notifications | Infrastructure out of scope for prototype |

---

## Prototype Constraints

- All train telemetry, operational events, and route conditions are **synthetic**
- All 100 trains are generated deterministically — not real operational data
- The prediction engine is formula-based — not an ML model
- The simulation clock is independent of wall time — starting at 13:05 sim time
- The application is frontend-only — no backend, no database, no network requests

All screens and documentation clearly state that data is synthetic and for demonstration only.

---

## What "Production-Ready" Looks Like

The prototype is architecturally structured for production deployment. The key integration points are:

| Prototype Component | Production Replacement |
|---|---|
| `simulation/engine.ts` | RTIS-style train position stream |
| `data/trainGenerator.ts` | Live fleet data from railway API |
| `data/staticData.ts` (historical) | Real historical sectional travel time database |
| `services/api.ts` | Actual REST/gRPC backend endpoints |
| `prediction/etaPredictor.ts` | Same formula OR trained ML model (input schema unchanged) |

See [`docs/FUTURE_INTEGRATION.md`](FUTURE_INTEGRATION.md) for the full integration plan.

---

## Evaluation Criteria Alignment

| SIH Criterion | SENRAIL Implementation |
|---|---|
| **Feasibility** | Runs in browser; production path clearly defined; no speculative tech |
| **Innovation** | Per-factor ETA explainability; real-time visual prediction; network map |
| **Completeness** | 6 functional pages; 100 trains; all major disruption types modelled |
| **Technical depth** | TypeScript typing; formula-based prediction; simulated clock; seeded RNG |
| **Presentation quality** | Dark navy design; micro-animations; SENRAIL logo; live charts |
| **Documentation** | 7 comprehensive docs (Architecture, Data Model, ETA Prediction, Demo Guide, Future Integration, Technical, Scope) |
| **Scalability** | Fleet catalog decoupled from simulation; API-ready layer; generator extensible |

---

## Team

**RUNTIME REBELS**

SENRAIL · Smart India Hackathon 2026 · PS SIH26028

---

*All simulated data in this prototype is synthetic and for demonstration purposes only.*
