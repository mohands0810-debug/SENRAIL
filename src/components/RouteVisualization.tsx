// ============================================================
// SENRAIL — Route Visualization Component
// ============================================================

import React from 'react';
import type { Train, RouteSection, OperationalEvent } from '../types';

interface RouteVisualizationProps {
  train: Train;
  sections: RouteSection[];
  events: OperationalEvent[];
}

const STATION_DISPLAY: Record<string, string> = {
  MAS: 'Chennai',
  KPD: 'Katpadi',
  JTJ: 'Jolarpettai',
  BWT: 'Bangarapet',
  KJM: 'Krishnarajapuram',
  SBC: 'Bengaluru',
};

export default function RouteVisualization({
  train,
  sections,
  events,
}: RouteVisualizationProps) {
  const routeStations = train.route;
  const stationETAs = train.stations;

  // Determine which stations are passed
  const passedIds = new Set(
    stationETAs.filter((s) => s.status === 'Passed').map((s) => s.stationId)
  );

  // Current position approximation
  const currentSec = sections.find((s) => s.id === train.currentSection);
  const currentAfterStation = currentSec?.fromStation ?? '';

  // Active events map
  const eventMap: Record<string, OperationalEvent> = {};
  events.forEach((e) => {
    const sec = sections.find((s) => s.id === e.sectionId);
    if (sec) eventMap[sec.id] = e;
  });

  return (
    <div
      className="route-diagram"
      role="img"
      aria-label={`Route diagram: ${train.origin} to ${train.destination}`}
    >
      {routeStations.map((stationId, idx) => {
        const isPassed = passedIds.has(stationId);
        const isCurrent = stationId === currentAfterStation && !isPassed;
        const isDestination = idx === routeStations.length - 1;

        const nextSectionId = sections.find(
          (s) => s.fromStation === stationId
        )?.id;
        const hasEvent = nextSectionId ? eventMap[nextSectionId] : null;
        const isPassedSegment = isPassed && idx < routeStations.length - 1;

        return (
          <React.Fragment key={stationId}>
            {/* Station node */}
            <div className="route-station">
              <div
                className={`station-dot${isPassed ? ' passed' : ''}${isCurrent ? ' current' : ''}${isDestination ? ' destination' : ''}`}
                title={STATION_DISPLAY[stationId] ?? stationId}
              />
              <div
                className={`station-label${isPassed ? ' passed' : ''}${isCurrent ? ' current' : ''}`}
              >
                {STATION_DISPLAY[stationId] ?? stationId}
              </div>
            </div>

            {/* Segment between stations */}
            {idx < routeStations.length - 1 && (
              <>
                {/* Left segment */}
                <div
                  className={`route-segment${isPassedSegment ? ' passed' : ''}${hasEvent ? ' event-ahead' : ''}`}
                />
                {/* Train icon at current position */}
                {stationId === currentAfterStation && (
                  <div className="train-icon" title="Train current position" aria-label="Train position">
                    🚆
                  </div>
                )}
                {/* Event marker */}
                {hasEvent && (
                  <div className="event-marker">
                    <div
                      className="event-marker-dot"
                      title={hasEvent.description}
                    >
                      ⚠
                    </div>
                    <div className="event-marker-label">
                      {hasEvent.type}
                    </div>
                  </div>
                )}
                {/* Right segment if event present */}
                {hasEvent && (
                  <div
                    className={`route-segment${isPassedSegment ? ' passed' : ''}`}
                  />
                )}
              </>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
