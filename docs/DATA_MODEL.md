# SENRAIL — Data Model

**RUNTIME REBELS · Smart India Hackathon 2026 · PS SIH26028**

> All data in this prototype is synthetic. No real Indian Railways operational data is used.

---

## Overview

SENRAIL's data model is divided into two distinct layers:

1. **Simulation State** — the live train being actively simulated (managed in `AppContext.tsx`)
2. **Fleet Catalog** — the full 100-train dataset consumed by the fleet-facing pages

---

## Core Types (`src/types/index.ts`)

### `Train`

The primary domain object representing an actively tracked coaching train.

```typescript
interface Train {
  id: string;                  // Unique internal ID
  number: string;              // Official train number (e.g., "12627")
  name: string;                // Train name (e.g., "Karnataka Express")
  origin: string;              // Origin station name
  destination: string;         // Destination station name
  status: TrainStatus;         // 'Running' | 'Delayed' | 'Halted' | 'Arrived'
  currentSpeed: number;        // km/h
  currentDelay: number;        // minutes (positive = late, negative = early)
  currentSection: string;      // Current route section ID
  distanceRemaining: number;   // km to destination
  stations: StationETA[];      // All intermediate station ETAs
  route: string[];             // Ordered station IDs
}
```

### `StationETA`

Per-station ETA information for a train in motion.

```typescript
interface StationETA {
  stationId: string;
  stationName: string;
  stationCode: string;         // e.g., "MAS", "SBC", "KPD"
  scheduledArrival: string;    // HH:MM — from timetable
  predictedArrival: string;    // HH:MM — dynamically computed
  delayMinutes: number;        // Predicted delay at this station
  status: StationStatus;       // 'Passed' | 'Approaching' | 'Upcoming' | 'Destination'
  distanceFromCurrent: number; // km from current position
}
```

### `RouteSection`

A track section between two consecutive stations on a route.

```typescript
interface RouteSection {
  id: string;                  // e.g., "SEC-101"
  name: string;                // e.g., "MAS – KPD"
  fromStation: string;
  toStation: string;
  distanceKm: number;
  baselineMinutes: number;     // Historical average travel time
  condition: SectionCondition; // 'Normal' | 'Congested' | 'Restricted' | 'Weather Affected' | 'Signal Hold'
  activeEvents: OperationalEvent[];
}
```

### `OperationalEvent`

An event that impacts travel time on a route section.

```typescript
interface OperationalEvent {
  id: string;
  sectionId: string;
  type: 'Congestion' | 'Track Maintenance' | 'Speed Restriction' | 'Signal Hold' | 'Weather';
  description: string;
  speedRestriction?: number;   // km/h — applicable for speed restriction events
  startTime: string;           // HH:MM
  endTime: string;             // HH:MM (estimated)
  status: EventStatus;         // 'Active' | 'Upcoming' | 'Cleared'
  etaImpactMinutes: number;    // Total ETA contribution of this event
  isSimulated: boolean;        // Always true in the prototype
}
```

### `Station`

Static station definition used in route definitions.

```typescript
interface Station {
  id: string;
  name: string;
  code: string;                // e.g., "MAS"
  distanceFromOrigin: number;  // km from route origin
  scheduledArrival: string;    // HH:MM
  scheduledDeparture: string;  // HH:MM
}
```

### `HistoricalRecord`

One record in the synthetic historical baseline dataset.

```typescript
interface HistoricalRecord {
  trainId: string;
  route: string;
  sectionId: string;
  dayOfWeek: number;             // 1 = Monday, 7 = Sunday
  timeOfDay: string;             // HH:MM
  historicalTravelMinutes: number;
  averageDelayMinutes: number;
  weatherCondition: WeatherCondition;
  congestionLevel: CongestionLevel;
}
```

---

## Fleet Catalog Types (`src/data/staticData.ts`)

### `TrainCatalogEntry`

Used by all fleet-facing pages (Overview, Live Monitor, Route Conditions, Train Search).
Richer than `Train` — includes schedule metadata, days of operation, and station stops.

```typescript
interface TrainCatalogEntry {
  id: string;                  // Unique catalog ID
  number: string;              // Train number (e.g., "12627")
  name: string;                // Full train name
  origin: string;              // Origin station full name
  destination: string;         // Destination station full name
  originCode: string;          // e.g., "MAS"
  destinationCode: string;     // e.g., "SBC"
  scheduledDeparture: string;  // HH:MM from origin
  scheduledArrival: string;    // HH:MM at destination
  distanceKm: number;          // Total route distance
  daysOfWeek: number[];        // [1,2,3,4,5,6,7] = Daily; [3,7] = Wed/Sun; etc.
  daysLabel: string;           // Human-readable: "Daily", "Mon / Thu / Sat", etc.
  trainType: TrainType;        // 'Rajdhani' | 'Shatabdi' | 'Duronto' | 'Superfast' | 'Express' | 'Mail' | 'Passenger'
  status: TrainStatus;         // 'Running' | 'Delayed' | 'Halted' | 'Arrived'
  currentDelay: number;        // minutes
  currentSpeed: number;        // km/h
  currentSection: string;      // Section ID
  distanceRemaining: number;   // km to destination
  stationStops: StationStop[]; // All intermediate and terminal stops
}

interface StationStop {
  code: string;                // Station code
  name: string;                // Station name
  scheduledArrival: string;    // HH:MM
  scheduledDeparture: string;  // HH:MM
  distanceFromOrigin: number;  // km
}
```

---

## ETA Prediction Types (`src/prediction/etaPredictor.ts`)

### `PredictionInput`

Feature vector assembled by the processing layer before calling the prediction engine.

```typescript
interface PredictionInput {
  trainId: string;
  currentSpeed: number;
  currentDelay: number;
  distanceRemaining: number;
  currentSection: string;
  weatherCondition: WeatherCondition;
  congestionLevel: CongestionLevel;
  maintenanceActive: boolean;
  speedRestriction: number;
  signalDelayMinutes: number;
  sections: RouteSection[];
  historicalBaseline: number;    // from getHistoricalBaseline()
}
```

### `ETAPrediction`

Output of the prediction engine — consumed by all display components.

```typescript
interface ETAPrediction {
  trainId: string;
  remainingMinutes: number;      // Minutes to destination
  destinationETA: string;        // HH:MM — absolute predicted arrival
  predictedDelayMinutes: number; // Total delay at destination
  confidence: number;            // 0–100 prototype confidence score
  factors: ETAFactor[];          // Per-factor breakdown
  scheduledETA: string;          // HH:MM — original schedule
  lastUpdated: string;           // Sim clock timestamp
}

interface ETAFactor {
  name: string;                  // e.g., "Congestion", "Track Maintenance"
  impactMinutes: number;         // Positive = adds delay; negative = recovery
  description: string;
}
```

---

## History Types (`src/store/AppContext.tsx`)

Rolling 60-point arrays used to populate the trend charts.

```typescript
interface ETAHistoryPoint {
  time: string;             // HH:MM sim time
  predictedETA: string;     // Absolute ETA (HH:MM)
  predictedMinutes: number; // Minutes remaining (for chart Y-axis)
  scenario: string;         // Active scenario label
}

interface SpeedHistoryPoint {
  time: string;   // HH:MM sim time
  speed: number;  // km/h
  scenario: string;
}

interface DelayHistoryPoint {
  time: string;   // HH:MM sim time
  delay: number;  // minutes
  scenario: string;
}
```

---

## Simulation State (`SimulationState`)

```typescript
interface SimulationState {
  isRunning: boolean;
  selectedTrainId: string;
  scenario: SimulationScenario;     // 'normal' | 'heavyCongestion' | 'trackMaintenance' | 'heavyRain' | 'signalHold' | 'combinedDisruption'
  weatherCondition: WeatherCondition;
  congestionLevel: CongestionLevel;
  maintenanceActive: boolean;
  speedRestriction: number;         // km/h — 0 = unrestricted
  signalDelayMinutes: number;
  simClock: number;                 // Simulated epoch in minutes from midnight
  simTimeDisplay: string;           // HH:MM:SS for display
}
```

---

## Fleet Dataset (`ALL_TRAINS`)

### Source

```typescript
// src/data/staticData.ts
import { generateTrains } from './trainGenerator';

export const ALL_TRAINS: TrainCatalogEntry[] = [
  ...TRAIN_CATALOG,          // 6 manually authored trains
  ...generateTrains(7, 94),  // 94 deterministically generated trains
];
// Total: 100 trains
```

### Manual Catalog (6 Trains)

| No. | Name | Route | Distance |
|---|---|---|---|
| 12627 | Karnataka Express | MAS → SBC | 362 km |
| 12431 | Thiruvananthapuram Rajdhani | NZM → TVC | 3145 km |
| 12007 | Mysuru–Chennai Shatabdi | MYS → MAS | 495 km |
| 11013 | Coimbatore Express | CSMT → CBE | 1152 km |
| 12245 | Yeshwantpur Duronto | BCT → SBC | 1215 km |
| 16591 | Hampi Express | SBC → UBL | 432 km |

### Generated Trains (94 Trains)

Generated across 25 route templates spanning all major Indian railway zones:

| Route Template | Zone | Typical Types |
|---|---|---|
| NZM → MAS (2175 km) | NR/SR | Rajdhani, Duronto, SF, Express |
| NZM → SBC (2444 km) | NR/SWR | Rajdhani, Duronto, SF, Express |
| NZM → TVC (3145 km) | NR/SR | Rajdhani, Duronto, SF, Express |
| NZM → CSMT (1388 km) | NR/CR | Rajdhani, Duronto, SF, Express |
| NZM → CBE (2600 km) | NR/SR | Duronto, SF, Express, Mail |
| NZM → SC (1850 km) | NR/SCR | Duronto, SF, Express, Mail |
| NZM → ERS (2975 km) | NR/SR | Rajdhani, Duronto, SF, Express |
| CSMT → MAS (1279 km) | CR/SR | Duronto, SF, Express, Mail |
| CSMT → SBC (1210 km) | CR/SWR | Duronto, SF, Express, Mail |
| CSMT → TVC (1895 km) | CR/SR | Duronto, SF, Express, Mail |
| CSMT → CBE (1558 km) | CR/SR | Duronto, SF, Express, Mail |
| BCT → SBC (1215 km) | WR/SWR | Duronto, SF, Express, Mail |
| BCT → ADI (491 km) | WR | Shatabdi, SF, Express, Mail |
| MAS → SBC (362 km) | SR/SWR | Shatabdi, SF, Express, Express |
| MAS → CBE (498 km) | SR | Shatabdi, SF, Express, Mail |
| MAS → TVC (706 km) | SR | Shatabdi, SF, Express, Mail |
| MYS → MAS (495 km) | SWR/SR | Shatabdi, SF, Express, Mail |
| SBC → UBL (432 km) | SWR | Shatabdi, SF, Express, Mail |
| SBC → CBE (365 km) | SWR/SR | Shatabdi, SF, Express, Mail |
| SBC → MYS (139 km) | SWR | Shatabdi, Express, Mail, Express |
| SC → MAS (843 km) | SCR/SR | Duronto, SF, Express, Mail |
| SC → SBC (685 km) | SCR/SWR | Duronto, SF, Express, Mail |
| CSMT → SC (780 km) | CR/SCR | Duronto, SF, Express, Mail |
| SBC → MAS (362 km) | SWR/SR | Shatabdi, SF, Express, Express |
| CSMT → ERS (1680 km) | CR/SR | Duronto, SF, Express, Mail |

### Generator Algorithm

```typescript
// Deterministic seeded RNG — same seed → same train every time
function mkRng(seed: number) { /* XOR-shift RNG */ }

// For each route template × 4 train types:
// 1. Pick type (Rajdhani/Duronto/SF/Express based on distance)
// 2. Generate train number (type-appropriate prefix + seeded offset)
// 3. Assign days of week (from 9 patterns: Daily, Mon/Wed/Fri/Sun, etc.)
// 4. Compute speed range by type (Rajdhani: 85–130 km/h, Mail: 48–88 km/h)
// 5. Assign delay (40% on-time, 30% 1–15 min, 20% 16–45 min, 10% 46–120 min)
// 6. Compute station stops with proportional times from scheduled departure
```

---

## Static Historical Data

`HISTORICAL_DATA` in `staticData.ts` contains synthetic records for the 5 manually authored Karnataka Express sections:

| Section | ID | Weather Conditions | Delay Range |
|---|---|---|---|
| MAS – KPD | SEC-101 | Clear / Light Rain / Heavy Rain | 5–18 min |
| KPD – JTJ | SEC-102 | Clear / Light Rain / Heavy Rain | 3–15 min |
| JTJ – BWT | SEC-103 | Clear / Light Rain / Heavy Rain | 4–22 min |
| BWT – KJM | SEC-104 | Clear / Light Rain / Heavy Rain | 3–19 min |
| KJM – SBC | SEC-105 | Clear / Light Rain / Heavy Rain | 2–14 min |

The `getHistoricalBaseline(sectionId, weather, congestion)` function queries this data with graceful fallback:
1. Exact match (section + weather + congestion)
2. Section + weather match
3. Section-only average
4. Generic fallback: 90 minutes

---

## Route Conditions Data

Route conditions for all 100 catalog trains are computed deterministically in `RouteConditionsPage.tsx` using a string hash of each train's ID:

```typescript
function hashStr(s: string): number { /* djb2-variant hash */ }

// Per train:
condition    = CONDITIONS[h % 8]     // Normal (×4), Congested, Restricted, Weather, Signal Hold
weather      = WEATHERS[h % 7]       // Clear (×3), Light Rain (×2), Heavy Rain, Fog
congestion   = CONGESTIONS[h % 6]    // Low (×2), Moderate (×3), High
activeEvent  = EVENTS[h % 8]         // null (×3), Maintenance, Congestion, Speed Restrict, Signal, Weather
etaImpact    = condition=Normal ? 0 : (h % 25) + 3  // 3–27 minutes
speedLimit   = event=SpeedRestriction ? [30,45,60,75][(h>>4)%4] : null
```

---

*SENRAIL · RUNTIME REBELS · SIH 2026 · PS SIH26028*
