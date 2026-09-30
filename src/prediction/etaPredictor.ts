// ============================================================
// SENRAIL — ETA Prediction Engine
// ============================================================
// This module provides a transparent, rule-based ETA prediction
// for the prototype. The same feature architecture can serve a
// future trained ML model (e.g., XGBoost, Gradient Boosting).
//
// Prediction formula:
//   remaining_time =
//       baseline_time
//     + congestion_effect
//     + maintenance_effect
//     + weather_effect
//     + signal_effect
//     + historical_variance
//     - recovery_component
//
// NOTE: "Prototype Model Confidence" is a heuristic indicator,
// not a scientifically validated metric.
// ============================================================

import type {
  ETAPrediction,
  ContributingFactor,
  WeatherCondition,
  CongestionLevel,
} from '../types';
import { getHistoricalBaseline } from '../data/staticData';

// Re-export ETAPrediction so consumers can import it from here
export type { ETAPrediction };

// ---- Feature coefficients (prototype, tunable) -----------------------------

const CONGESTION_EFFECT: Record<CongestionLevel, number> = {
  Low: 0,
  Moderate: 5,
  High: 13,
};

const WEATHER_EFFECT: Record<WeatherCondition, number> = {
  Clear: 0,
  'Light Rain': 4,
  'Heavy Rain': 9,
  Fog: 7,
};

const MAINTENANCE_BASE_EFFECT = 8; // minutes per active maintenance zone
const SPEED_RESTRICTION_THRESHOLD = 60; // km/h, below which penalty applies

// ---- Utility: add minutes to a HH:MM time string ---------------------------

export function addMinutesToTime(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  const totalMinutes = h * 60 + m + Math.round(minutes);
  const newH = Math.floor(totalMinutes / 60) % 24;
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

// ---- Utility: time string to minutes from midnight -------------------------

export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// ---- Utility: minutes from midnight to HH:MM --------------------------------

export function minutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = Math.round(totalMinutes % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ---- Utility: current time as HH:MM:SS -------------------------------------

export function currentTimeHMS(date: Date): string {
  return date.toLocaleTimeString('en-IN', { hour12: false });
}

// ---- Utility: current time as HH:MM ----------------------------------------

export function currentTimeHM(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ---- Main prediction function -----------------------------------------------

export interface PredictionInput {
  trainId: string;
  currentSpeed: number;           // km/h
  currentDelayMinutes: number;
  distanceRemainingKm: number;
  currentSectionId: string;
  congestionLevel: CongestionLevel;
  maintenanceActive: boolean;
  speedRestriction: number | null; // km/h override
  weatherCondition: WeatherCondition;
  signalDelayMinutes: number;
  scheduledDestinationETA: string; // HH:MM
  currentTime: Date;
}

export function predictETA(input: PredictionInput): ETAPrediction {
  const {
    trainId,
    currentSpeed,
    currentDelayMinutes,
    distanceRemainingKm,
    currentSectionId,
    congestionLevel,
    maintenanceActive,
    speedRestriction,
    weatherCondition,
    signalDelayMinutes,
    scheduledDestinationETA,
    currentTime,
  } = input;

  // 1. Baseline travel time from historical data
  const historicalBaseline = getHistoricalBaseline(
    currentSectionId,
    weatherCondition,
    congestionLevel
  );

  // 2. Speed-based remaining time
  const effectiveSpeed =
    speedRestriction !== null
      ? Math.min(currentSpeed, speedRestriction)
      : currentSpeed;
  const speedBasedMinutes =
    effectiveSpeed > 0 ? (distanceRemainingKm / effectiveSpeed) * 60 : historicalBaseline;

  // 3. Blend historical baseline with speed-based estimate (60/40 weight)
  const blendedBaseline =
    historicalBaseline * 0.4 + speedBasedMinutes * 0.6;

  // 4. Congestion effect
  const congestionEffect = CONGESTION_EFFECT[congestionLevel];

  // 5. Maintenance effect
  let maintenanceEffect = 0;
  if (maintenanceActive) {
    maintenanceEffect = MAINTENANCE_BASE_EFFECT;
    // Additional penalty if speed restriction applies
    if (speedRestriction !== null && speedRestriction < SPEED_RESTRICTION_THRESHOLD) {
      const restrictionPenalty = Math.max(
        0,
        ((SPEED_RESTRICTION_THRESHOLD - speedRestriction) / SPEED_RESTRICTION_THRESHOLD) * 6
      );
      maintenanceEffect += Math.round(restrictionPenalty);
    }
  }

  // 6. Weather effect
  const weatherEffect = WEATHER_EFFECT[weatherCondition];

  // 7. Signal delay
  const signalEffect = signalDelayMinutes;

  // 8. Historical variance (small stochastic component ±1 min)
  const historicalVariance = Math.random() > 0.5 ? 1 : 0;

  // 9. Recovery component — if currently ahead/on time, slight positive
  const recoveryEffect = currentDelayMinutes < 0 ? Math.abs(currentDelayMinutes) * 0.1 : 0;

  // 10. Total remaining minutes
  const totalRemainingMinutes =
    blendedBaseline +
    congestionEffect +
    maintenanceEffect +
    weatherEffect +
    signalEffect +
    historicalVariance -
    recoveryEffect;

  // 11. ETA
  const etaMinutes = timeToMinutes(currentTimeHM(currentTime)) + totalRemainingMinutes;
  const destinationETA = minutesToTime(etaMinutes);

  // 12. Predicted delay relative to schedule
  const scheduledMinutes = timeToMinutes(scheduledDestinationETA);
  const predictedDelayMinutes = Math.max(-5, Math.round(etaMinutes - scheduledMinutes));

  // 13. Contributing factors
  const factors: ContributingFactor[] = [];

  if (congestionEffect > 0) {
    factors.push({ label: `Congestion (${congestionLevel})`, impactMinutes: Math.round(congestionEffect), type: 'congestion' });
  }
  if (maintenanceEffect > 0) {
    factors.push({ label: 'Track maintenance / speed restriction', impactMinutes: Math.round(maintenanceEffect), type: 'maintenance' });
  }
  if (weatherEffect > 0) {
    factors.push({ label: `${weatherCondition} conditions`, impactMinutes: Math.round(weatherEffect), type: 'weather' });
  }
  if (signalEffect > 0) {
    factors.push({ label: 'Signal hold', impactMinutes: Math.round(signalEffect), type: 'signal' });
  }
  if (historicalVariance > 0) {
    factors.push({ label: 'Historical section variance', impactMinutes: historicalVariance, type: 'historical' });
  }
  if (recoveryEffect > 0) {
    factors.push({ label: 'Schedule recovery margin', impactMinutes: -Math.round(recoveryEffect), type: 'recovery' });
  }

  // 14. Confidence heuristic (decreases with more disruptions)
  const disruptionPenalty =
    (congestionLevel === 'High' ? 10 : congestionLevel === 'Moderate' ? 5 : 0) +
    (maintenanceActive ? 5 : 0) +
    (weatherCondition === 'Heavy Rain' ? 8 : weatherCondition === 'Fog' ? 6 : weatherCondition === 'Light Rain' ? 3 : 0) +
    (signalDelayMinutes > 0 ? 4 : 0);
  const confidence = Math.max(55, Math.min(95, 92 - disruptionPenalty));

  return {
    trainId,
    destinationETA,
    scheduledETA: scheduledDestinationETA,
    remainingMinutes: Math.round(totalRemainingMinutes),
    predictedDelayMinutes,
    confidence,
    contributingFactors: factors,
    lastRecalculated: currentTimeHMS(currentTime),
    baselineRemainingMinutes: Math.round(blendedBaseline),
  };
}

// ---- Per-station ETA prediction --------------------------------------------

export function predictStationETA(
  stationScheduledArrival: string,
  distanceToStationKm: number,
  totalDistanceRemainingKm: number,
  prediction: ETAPrediction,
  currentTime: Date
): string {
  if (totalDistanceRemainingKm <= 0) return stationScheduledArrival;
  // Proportion of remaining journey to this station
  const fraction = Math.min(1, distanceToStationKm / totalDistanceRemainingKm);
  const stationRemainingMinutes = prediction.remainingMinutes * fraction;
  const etaMinutes = timeToMinutes(currentTimeHM(currentTime)) + stationRemainingMinutes;
  return minutesToTime(etaMinutes);
}
