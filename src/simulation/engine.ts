// ============================================================
// SENRAIL — Simulation Engine
// ============================================================
// Maintains simulation state and updates train data every tick.
// Designed so this layer can be replaced by a live RTIS feed
// without modifying the prediction engine.
// ============================================================

import type {
  SimulationState,
  Train,
  SimulationScenario,
  RouteSection,
  OperationalEvent,
  WeatherCondition,
  CongestionLevel,
  ETAHistoryPoint,
} from '../types';
import { INITIAL_TRAINS, KARNATAKA_EXPRESS_SECTIONS } from '../data/staticData';
import {
  predictETA,
  predictStationETA,
  timeToMinutes,
  minutesToTime,
  currentTimeHM,
  currentTimeHMS,
} from '../prediction/etaPredictor';

// ---- Scenario Presets -------------------------------------------------------

interface ScenarioPreset {
  congestionLevel: CongestionLevel;
  maintenanceActive: boolean;
  speedRestriction: number | null;
  weatherCondition: WeatherCondition;
  signalDelayMinutes: number;
  baseSpeedOverride?: number;
}

export const SCENARIO_PRESETS: Record<SimulationScenario, ScenarioPreset> = {
  normal: {
    congestionLevel: 'Low',
    maintenanceActive: false,
    speedRestriction: null,
    weatherCondition: 'Clear',
    signalDelayMinutes: 0,
    baseSpeedOverride: undefined,
  },
  heavyCongestion: {
    congestionLevel: 'High',
    maintenanceActive: false,
    speedRestriction: null,
    weatherCondition: 'Clear',
    signalDelayMinutes: 0,
    baseSpeedOverride: 43,
  },
  trackMaintenance: {
    congestionLevel: 'Low',
    maintenanceActive: true,
    speedRestriction: 30,
    weatherCondition: 'Clear',
    signalDelayMinutes: 0,
    baseSpeedOverride: 30,
  },
  heavyRain: {
    congestionLevel: 'Moderate',
    maintenanceActive: false,
    speedRestriction: null,
    weatherCondition: 'Heavy Rain',
    signalDelayMinutes: 0,
    baseSpeedOverride: 55,
  },
  signalHold: {
    congestionLevel: 'Low',
    maintenanceActive: false,
    speedRestriction: null,
    weatherCondition: 'Clear',
    signalDelayMinutes: 7,
    baseSpeedOverride: undefined,
  },
  combinedDisruption: {
    congestionLevel: 'High',
    maintenanceActive: true,
    speedRestriction: 30,
    weatherCondition: 'Heavy Rain',
    signalDelayMinutes: 5,
    baseSpeedOverride: 28,
  },
};

// ---- Congestion Detection ---------------------------------------------------

interface SpeedObservation {
  trainId: string;
  sectionId: string;
  speed: number;
  timestamp: number;
}

const speedObservations: SpeedObservation[] = [];
const OBS_WINDOW_MS = 30000; // 30 seconds

export function recordSpeedObservation(
  trainId: string,
  sectionId: string,
  speed: number
): void {
  speedObservations.push({ trainId, sectionId, speed, timestamp: Date.now() });
  // Prune old observations
  const cutoff = Date.now() - OBS_WINDOW_MS;
  while (speedObservations.length > 0 && speedObservations[0].timestamp < cutoff) {
    speedObservations.shift();
  }
}

export function detectCongestion(sectionId: string): boolean {
  const recent = speedObservations.filter((o) => o.sectionId === sectionId);
  if (recent.length < 2) return false;
  const avgSpeed = recent.reduce((s, o) => s + o.speed, 0) / recent.length;
  return avgSpeed < 45;
}

// ---- Operational Events ----------------------------------------------------

export function buildOperationalEvents(
  preset: ScenarioPreset,
  currentTime: Date
): OperationalEvent[] {
  const events: OperationalEvent[] = [];
  const now = currentTimeHM(currentTime);
  const later = minutesToTime(timeToMinutes(now) + 120);

  if (preset.congestionLevel === 'High' || preset.congestionLevel === 'Moderate') {
    events.push({
      id: 'EVT-CONG-001',
      sectionId: 'SEC-103',
      type: 'Congestion',
      description: 'Heavy traffic — multiple trains in section',
      startTime: now,
      endTime: later,
      status: 'Active',
      etaImpactMinutes: 8,
      isSimulated: true,
    });
  }

  if (preset.maintenanceActive) {
    events.push({
      id: 'EVT-MAINT-001',
      sectionId: 'SEC-104',
      type: 'Track Maintenance',
      description: `Track maintenance — speed restriction ${preset.speedRestriction ?? 30} km/h`,
      speedRestriction: preset.speedRestriction ?? 30,
      startTime: now,
      endTime: later,
      status: 'Active',
      etaImpactMinutes: 8,
      isSimulated: true,
    });
  }

  if (preset.weatherCondition !== 'Clear') {
    events.push({
      id: 'EVT-WX-001',
      sectionId: 'SEC-103',
      type: 'Weather',
      description: `${preset.weatherCondition} — reduced visibility and caution speed`,
      startTime: now,
      endTime: later,
      status: 'Active',
      etaImpactMinutes: preset.weatherCondition === 'Heavy Rain' ? 9 : preset.weatherCondition === 'Fog' ? 7 : 4,
      isSimulated: true,
    });
  }

  if (preset.signalDelayMinutes > 0) {
    events.push({
      id: 'EVT-SIG-001',
      sectionId: 'SEC-104',
      type: 'Signal Hold',
      description: `Signal hold — estimated ${preset.signalDelayMinutes} min clearance`,
      startTime: now,
      endTime: minutesToTime(timeToMinutes(now) + preset.signalDelayMinutes + 5),
      status: 'Active',
      etaImpactMinutes: preset.signalDelayMinutes,
      isSimulated: true,
    });
  }

  return events;
}

// ---- Build Sections with Events --------------------------------------------

export function buildSections(
  preset: ScenarioPreset,
  events: OperationalEvent[]
): RouteSection[] {
  return KARNATAKA_EXPRESS_SECTIONS.map((sec) => {
    const secEvents = events.filter((e) => e.sectionId === sec.id);
    let condition = sec.condition;
    if (secEvents.some((e) => e.type === 'Congestion')) condition = 'Congested';
    else if (secEvents.some((e) => e.type === 'Track Maintenance')) condition = 'Restricted';
    else if (secEvents.some((e) => e.type === 'Weather')) condition = 'Weather Affected';
    else if (secEvents.some((e) => e.type === 'Signal Hold')) condition = 'Signal Hold';
    else condition = 'Normal';
    return { ...sec, condition, activeEvents: secEvents };
  });
}

// ---- Speed simulation with realistic variation -----------------------------

function simulateSpeed(
  base: number,
  preset: ScenarioPreset,
  tick: number
): number {
  const target = preset.baseSpeedOverride ?? base;
  // Small ±2 km/h jitter per tick
  const jitter = (Math.random() - 0.5) * 4;
  return Math.max(0, Math.round(target + jitter));
}

// ---- Update trains ---------------------------------------------------------

export function updateTrains(
  trains: Train[],
  simState: SimulationState,
  preset: ScenarioPreset
): Train[] {
  return trains.map((train) => {
    if (train.id !== '12627') {
      // Other trains: minor updates only
      const speedJitter = (Math.random() - 0.5) * 6;
      const newSpeed = Math.max(30, Math.min(120, Math.round(train.currentSpeed + speedJitter)));
      const delayDrift = Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0;
      const newDelay = Math.max(-5, train.currentDelay + delayDrift);

      // Update station ETAs proportionally
      const updatedStations = train.stations.map((s) => {
        if (s.status === 'Passed') return s;
        const delayDiffMinutes = newDelay - train.currentDelay;
        if (Math.abs(delayDiffMinutes) < 0.5) return s;
        const newPredicted = minutesToTime(
          timeToMinutes(s.predictedArrival) + delayDiffMinutes
        );
        return {
          ...s,
          predictedArrival: newPredicted,
          delayMinutes: Math.round(
            timeToMinutes(newPredicted) - timeToMinutes(s.scheduledArrival)
          ),
        };
      });

      return { ...train, currentSpeed: newSpeed, currentDelay: Math.round(newDelay), stations: updatedStations };
    }

    // ---- Primary train: 12627 -----------------------------------------------
    const newSpeed = simulateSpeed(train.currentSpeed, preset, simState.tickCount);
    recordSpeedObservation(train.id, train.currentSection, newSpeed);

    // Distance advance per tick (3s tick)
    const TICK_SECONDS = 3;
    const distanceAdvancedKm = (newSpeed / 3600) * TICK_SECONDS;
    const newDistanceRemaining = Math.max(0, train.distanceRemaining - distanceAdvancedKm);

    // Delay drift: congestion / weather adds delay, normal recovers slightly
    let delayDrift = 0;
    if (preset.congestionLevel === 'High') delayDrift += 0.05;
    if (preset.congestionLevel === 'Moderate') delayDrift += 0.02;
    if (preset.weatherCondition === 'Heavy Rain') delayDrift += 0.04;
    if (preset.weatherCondition === 'Light Rain') delayDrift += 0.01;
    if (preset.maintenanceActive) delayDrift += 0.03;
    if (preset.signalDelayMinutes > 0) delayDrift += 0.03;
    if (preset.congestionLevel === 'Low' && !preset.maintenanceActive) delayDrift -= 0.01; // slight recovery

    const newDelay = Math.max(-5, train.currentDelay + delayDrift);

    // ETA prediction
    const prediction = predictETA({
      trainId: train.id,
      currentSpeed: newSpeed,
      currentDelayMinutes: newDelay,
      distanceRemainingKm: newDistanceRemaining,
      currentSectionId: train.currentSection,
      congestionLevel: simState.congestionLevel,
      maintenanceActive: simState.maintenanceActive,
      speedRestriction: simState.speedRestriction,
      weatherCondition: simState.weatherCondition,
      signalDelayMinutes: simState.signalDelayMinutes,
      scheduledDestinationETA: '15:30',
      currentTime: simState.currentTime,
    });

    // Update station ETAs
    const updatedStations = train.stations.map((s) => {
      if (s.status === 'Passed') return s;
      if (s.distanceFromCurrent <= 0) return { ...s, status: 'Passed' as const };
      const newDistFromCurrent = Math.max(0, s.distanceFromCurrent - distanceAdvancedKm);
      const newPredicted = predictStationETA(
        s.scheduledArrival,
        newDistFromCurrent,
        newDistanceRemaining,
        prediction,
        simState.currentTime
      );
      const delayMins = Math.round(timeToMinutes(newPredicted) - timeToMinutes(s.scheduledArrival));
      return {
        ...s,
        distanceFromCurrent: newDistFromCurrent,
        predictedArrival: newPredicted,
        delayMinutes: delayMins,
      };
    });

    return {
      ...train,
      currentSpeed: newSpeed,
      currentDelay: Math.round(newDelay),
      distanceRemaining: newDistanceRemaining,
      stations: updatedStations,
    };
  });
}

// ---- Initial state ---------------------------------------------------------

export function createInitialSimState(): SimulationState {
  return {
    isRunning: false,
    scenario: 'normal',
    currentTime: new Date(),
    selectedTrainId: '12627',
    congestionLevel: 'Low',
    maintenanceActive: false,
    speedRestriction: null,
    weatherCondition: 'Clear',
    signalDelayMinutes: 0,
    tickCount: 0,
  };
}

// ---- ETA History tracker ---------------------------------------------------

export function buildETAHistoryPoint(
  currentTime: Date,
  destinationETA: string,
  scenario: SimulationScenario
): ETAHistoryPoint {
  const label = scenario
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase());
  return {
    time: currentTimeHM(currentTime),
    predictedETA: destinationETA,
    predictedMinutes: timeToMinutes(destinationETA),
    scenario: label,
  };
}
