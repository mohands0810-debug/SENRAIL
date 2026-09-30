// ============================================================
// SENRAIL — Simulation Lab Page
// ============================================================

import React from 'react';
import { FlaskConical, Play, Pause, RotateCcw } from 'lucide-react';
import { useAppState } from '../store/AppContext';
import type { SimulationScenario } from '../types';
import { SCENARIO_PRESETS } from '../simulation/engine';
import ImpactAnalysis from '../components/ImpactAnalysis';
import RouteConditionsTiles from '../components/RouteConditionsTiles';

interface ScenarioDef {
  id: SimulationScenario;
  name: string;
  desc: string;
  tag?: string;
}

const SCENARIOS: ScenarioDef[] = [
  { id: 'normal', name: 'Normal Operations', desc: 'Clear conditions, no disruptions' },
  { id: 'heavyCongestion', name: 'Heavy Congestion', desc: 'Multiple trains in section, speed reduced', tag: 'High Impact' },
  { id: 'trackMaintenance', name: 'Track Maintenance', desc: 'Engineering work, 30 km/h restriction', tag: 'Speed Restricted' },
  { id: 'heavyRain', name: 'Heavy Rain', desc: 'Severe weather, reduced visibility', tag: 'Weather' },
  { id: 'signalHold', name: 'Signal Hold', desc: '7-minute signal clearance delay', tag: 'Signal' },
  { id: 'combinedDisruption', name: 'Combined Disruption', desc: 'Congestion + Maintenance + Rain + Signal', tag: 'Severe' },
];

function ScenarioTag({ label }: { label: string }) {
  const colorMap: Record<string, string> = {
    'High Impact': 'badge-red',
    'Speed Restricted': 'badge-amber',
    Weather: 'badge-blue',
    Signal: 'badge-amber',
    Severe: 'badge-red',
  };
  return <span className={`badge ${colorMap[label] ?? 'badge-gray'}`} style={{ fontSize: 10 }}>{label}</span>;
}

export default function SimLabPage() {
  const { state, dispatch } = useAppState();
  const { simState, prediction, trains } = state;
  const selectedTrain = trains.find((t) => t.id === simState.selectedTrainId);

  const preset = SCENARIO_PRESETS[simState.scenario];
  const totalAdditional = prediction
    ? prediction.contributingFactors.reduce((sum: number, f) => sum + f.impactMinutes, 0)
    : 0;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Simulation Lab</h1>
        <p className="page-subtitle">
          Test how changing railway conditions affect SENRAIL's ETA forecast.
        </p>
      </div>

      {/* Simulation Controls */}
      <div className="card mb-16">
        <div className="card-header">
          <div className="card-title">Simulation Controls</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {simState.isRunning ? (
              <button className="btn btn-outline btn-sm" onClick={() => dispatch({ type: 'PAUSE_SIM' })}>
                <Pause size={12} /> Pause
              </button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => dispatch({ type: 'START_SIM' })}>
                <Play size={12} /> Start
              </button>
            )}
            <button className="btn btn-outline btn-sm" onClick={() => dispatch({ type: 'RESET_SIM' })}>
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        </div>
        <div className="card-body">
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              padding: '8px 12px',
              background: simState.isRunning ? 'var(--green-bg)' : 'var(--bg)',
              border: `1px solid ${simState.isRunning ? 'var(--green-border)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              fontSize: 12,
              color: simState.isRunning ? 'var(--green)' : 'var(--text-muted)',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: simState.isRunning ? 'var(--green)' : 'var(--text-muted)',
                animation: simState.isRunning ? 'pulse-amber 2s infinite' : 'none',
              }}
            />
            {simState.isRunning ? 'Simulation running — updates every 3 seconds' : 'Simulation paused'}
          </div>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="card mb-16">
        <div className="card-header">
          <div className="card-title">Scenario Selection</div>
          <div className="card-subtitle">Each scenario directly updates train state and ETA forecast</div>
        </div>
        <div className="card-body">
          <div className="scenario-grid">
            {SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                className={`scenario-btn${simState.scenario === sc.id ? ' active' : ''}`}
                onClick={() => dispatch({ type: 'SET_SCENARIO', scenario: sc.id })}
                aria-pressed={simState.scenario === sc.id}
              >
                <div className="flex-between w-full mb-4">
                  <span className="scenario-btn-name">{sc.name}</span>
                  {sc.tag && <ScenarioTag label={sc.tag} />}
                </div>
                <div className="scenario-btn-desc">{sc.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current scenario state */}
      <div className="two-col mb-16">
        {/* Conditions */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Active Conditions</div>
            <div className="card-subtitle">
              Scenario: {SCENARIOS.find((s) => s.id === simState.scenario)?.name}
            </div>
          </div>
          <div className="card-body">
            <RouteConditionsTiles
              congestionLevel={simState.congestionLevel}
              maintenanceActive={simState.maintenanceActive}
              weatherCondition={simState.weatherCondition}
              signalDelayMinutes={simState.signalDelayMinutes}
            />

            {/* Speed and delay */}
            <div className="divider" />
            <div className="stat-grid">
              <div className="stat-tile">
                <div className="stat-label">Train Speed</div>
                <div className="stat-value mono">{selectedTrain?.currentSpeed ?? '—'}</div>
                <div className="stat-sub">km/h</div>
              </div>
              <div className="stat-tile">
                <div className="stat-label">Current Delay</div>
                <div className={`stat-value mono ${(selectedTrain?.currentDelay ?? 0) > 15 ? 'red' : (selectedTrain?.currentDelay ?? 0) > 5 ? 'amber' : 'green'}`}>
                  {selectedTrain ? `${selectedTrain.currentDelay > 0 ? '+' : ''}${selectedTrain.currentDelay}` : '—'}
                </div>
                <div className="stat-sub">minutes</div>
              </div>
            </div>

            {preset.speedRestriction && (
              <div
                style={{
                  marginTop: 10,
                  padding: '8px 12px',
                  background: 'var(--amber-bg)',
                  border: '1px solid var(--amber-border)',
                  borderRadius: 'var(--radius)',
                  fontSize: 12,
                  color: 'var(--amber)',
                }}
              >
                ⚠ Speed restriction active: {preset.speedRestriction} km/h
                {' '}<span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>(simulated operational event)</span>
              </div>
            )}
          </div>
        </div>

        {/* ETA Impact */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">ETA Impact</div>
            <div className="card-subtitle">How scenario affects predicted arrival</div>
          </div>

          <div style={{ padding: '14px 16px 0', borderBottom: '1px solid var(--border-light)' }}>
            <div className="flex-between mb-8">
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Scheduled ETA</span>
              <span className="text-mono font-semibold">
                {prediction?.scheduledETA ?? '15:30'}
              </span>
            </div>
            <div className="flex-between mb-12">
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Predicted ETA</span>
              <span
                className="text-mono font-bold"
                style={{
                  fontSize: 20,
                  color: (prediction?.predictedDelayMinutes ?? 0) > 15 ? 'var(--red)' : 'var(--navy)',
                }}
              >
                {prediction?.destinationETA ?? '—'}
              </span>
            </div>
          </div>

          <ImpactAnalysis
            factors={prediction?.contributingFactors ?? []}
            totalAdditionalDelay={totalAdditional}
          />
        </div>
      </div>

      {/* Scenario comparison table */}
      <div className="card mb-16">
        <div className="card-header">
          <div className="card-title">Scenario Reference</div>
          <div className="card-subtitle">Expected conditions per scenario</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" aria-label="Scenario reference table">
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Speed (approx.)</th>
                <th>Congestion</th>
                <th>Maintenance</th>
                <th>Weather</th>
                <th>Signal</th>
              </tr>
            </thead>
            <tbody>
              {SCENARIOS.map((sc) => {
                const p = SCENARIO_PRESETS[sc.id];
                const isActive = simState.scenario === sc.id;
                return (
                  <tr
                    key={sc.id}
                    className={isActive ? 'selected' : ''}
                    style={{ cursor: 'pointer' }}
                    onClick={() => dispatch({ type: 'SET_SCENARIO', scenario: sc.id })}
                  >
                    <td style={{ fontWeight: isActive ? 700 : 400 }}>{sc.name}</td>
                    <td className="mono">{p.baseSpeedOverride ? `~${p.baseSpeedOverride} km/h` : 'Normal'}</td>
                    <td>
                      <span className={`badge ${p.congestionLevel === 'High' ? 'badge-red' : p.congestionLevel === 'Moderate' ? 'badge-amber' : 'badge-green'}`}>
                        {p.congestionLevel}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.maintenanceActive ? 'badge-amber' : 'badge-gray'}`}>
                        {p.maintenanceActive ? 'Active' : 'None'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{p.weatherCondition}</td>
                    <td style={{ fontSize: 12 }}>
                      {p.signalDelayMinutes > 0 ? `${p.signalDelayMinutes} min hold` : 'None'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Technical note */}
      <div
        style={{
          padding: '14px 16px',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          fontSize: 12,
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
          Technical Note — Simulation Architecture
        </div>
        The simulation engine maintains train state and applies scenario presets to adjust
        speed, delay drift, and operational events each tick (every 3 seconds). The ETA
        prediction engine receives these as inputs and computes a transparent formula-based
        forecast. Both layers are decoupled: in a production deployment, the simulation
        layer is replaced by an authorized railway data feed without modifying the
        prediction engine.
      </div>
    </div>
  );
}
