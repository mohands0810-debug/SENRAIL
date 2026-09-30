// ============================================================
// SENRAIL — Type Definitions
// ============================================================

export type WeatherCondition = 'Clear' | 'Light Rain' | 'Heavy Rain' | 'Fog';
export type CongestionLevel = 'Low' | 'Moderate' | 'High';
export type TrainStatus = 'Running' | 'Delayed' | 'Halted' | 'Arrived';
export type StationStatus = 'Passed' | 'Approaching' | 'Upcoming' | 'Destination';
export type SectionCondition = 'Normal' | 'Congested' | 'Restricted' | 'Weather Affected' | 'Signal Hold';
export type EventStatus = 'Active' | 'Upcoming' | 'Cleared';
export type SimulationScenario =
  | 'normal'
  | 'heavyCongestion'
  | 'trackMaintenance'
  | 'heavyRain'
  | 'signalHold'
  | 'combinedDisruption';

// ---- Station ----------------------------------------------------------------

export interface Station {
  id: string;
  name: string;
  code: string;
  distanceFromOrigin: number; // km
  scheduledArrival: string;   // HH:MM
  scheduledDeparture: string; // HH:MM
}

// ---- Route Section ----------------------------------------------------------

export interface RouteSection {
  id: string;
  name: string;
  fromStation: string;
  toStation: string;
  distanceKm: number;
  baselineMinutes: number;  // historical avg travel time
  condition: SectionCondition;
  activeEvents: OperationalEvent[];
}

// ---- Operational Event -------------------------------------------------------

export interface OperationalEvent {
  id: string;
  sectionId: string;
  type: 'Congestion' | 'Track Maintenance' | 'Speed Restriction' | 'Signal Hold' | 'Weather';
  description: string;
  speedRestriction?: number;  // km/h, if applicable
  startTime: string;
  endTime: string;
  status: EventStatus;
  etaImpactMinutes: number;
  isSimulated: boolean;
}

// ---- Train ------------------------------------------------------------------

export interface Train {
  id: string;
  number: string;
  name: string;
  origin: string;
  destination: string;
  status: TrainStatus;
  currentSpeed: number;       // km/h
  currentDelay: number;       // minutes (positive = late)
  currentSection: string;
  distanceRemaining: number;  // km
  stations: StationETA[];
  route: string[];            // station ids in order
}

// ---- Station ETA ------------------------------------------------------------

export interface StationETA {
  stationId: string;
  stationName: string;
  stationCode: string;
  scheduledArrival: string;
  predictedArrival: string;
  delayMinutes: number;
  status: StationStatus;
  distanceFromCurrent: number; // km
}

// ---- ETA Prediction ---------------------------------------------------------

export interface ContributingFactor {
  label: string;
  impactMinutes: number;
  type: 'congestion' | 'maintenance' | 'weather' | 'signal' | 'historical' | 'recovery';
}

export interface ETAPrediction {
  trainId: string;
  destinationETA: string;       // HH:MM
  scheduledETA: string;
  remainingMinutes: number;
  predictedDelayMinutes: number;
  confidence: number;           // 0–100
  contributingFactors: ContributingFactor[];
  lastRecalculated: string;     // HH:MM:SS
  baselineRemainingMinutes: number;
}

// ---- Simulation State -------------------------------------------------------

export interface SimulationState {
  isRunning: boolean;
  scenario: SimulationScenario;
  currentTime: Date;
  selectedTrainId: string;
  congestionLevel: CongestionLevel;
  maintenanceActive: boolean;
  speedRestriction: number | null;
  weatherCondition: WeatherCondition;
  signalDelayMinutes: number;
  tickCount: number;
}

// ---- Historical Data --------------------------------------------------------

export interface HistoricalRecord {
  trainId: string;
  route: string;
  sectionId: string;
  dayOfWeek: number;   // 0=Sun
  timeOfDay: string;   // HH:MM
  historicalTravelMinutes: number;
  averageDelayMinutes: number;
  weatherCondition: WeatherCondition;
  congestionLevel: CongestionLevel;
}

// ---- ETA History point ------------------------------------------------------

export interface ETAHistoryPoint {
  time: string;       // HH:MM
  predictedETA: string; // HH:MM
  predictedMinutes: number; // minutes from midnight for charting
  scenario: string;
}

// ---- Route Condition Row ---------------------------------------------------

export interface RouteConditionRow {
  section: string;
  condition: SectionCondition;
  event: string;
  impact: string;
  status: EventStatus | '—';
}
