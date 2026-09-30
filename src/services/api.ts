// ============================================================
// SENRAIL — Mock API Service
// ============================================================
// Exposes data through service functions that mirror the shape
// of future REST API endpoints. When authorized railway data
// feeds become available, only this layer changes.
// ============================================================

import type { Train, RouteSection, OperationalEvent, ETAPrediction } from '../types';

// These functions accept the current app state as a parameter
// rather than fetching from a real API. This keeps the interface
// clean for future backend replacement.

export function getTrains(trains: Train[]): Train[] {
  return trains;
}

export function getTrainById(trains: Train[], id: string): Train | undefined {
  return trains.find((t) => t.id === id);
}

export function getTrainETA(
  trains: Train[],
  id: string,
  prediction: ETAPrediction | null
): ETAPrediction | null {
  const train = getTrainById(trains, id);
  if (!train || !prediction) return null;
  return prediction;
}

export function getRouteConditions(sections: RouteSection[]): RouteSection[] {
  return sections;
}

export function getActiveEvents(sections: RouteSection[]): OperationalEvent[] {
  return sections.flatMap((s) => s.activeEvents).filter((e) => e.status === 'Active');
}
