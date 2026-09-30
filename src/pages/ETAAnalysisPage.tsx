// ============================================================
// SENRAIL — ETA Analysis Page (with all charts)
// ============================================================

import React from 'react';
import { useAppState } from '../store/AppContext';
import ETAChart from '../components/ETAChart';
import SpeedChart from '../components/SpeedChart';
import DelayChart from '../components/DelayChart';
import ImpactBarChart from '../components/ImpactBarChart';
import StationTable from '../components/StationTable';

export default function ETAAnalysisPage() {
  const { state } = useAppState();
  const { prediction, etaHistory, speedHistory, delayHistory, trains, simState } = state;
  const train = trains.find(t => t.id === simState.selectedTrainId);

  const totalAdditional = prediction
    ? prediction.contributingFactors.reduce((sum: number, f) => sum + f.impactMinutes, 0)
    : 0;

  const delayColor = (prediction?.predictedDelayMinutes ?? 0) > 15 ? 'red'
    : (prediction?.predictedDelayMinutes ?? 0) > 5 ? 'amber' : 'green';

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">ETA Analysis</h1>
        <p className="page-subtitle">
          Live ETA forecast, contributing factor breakdown, and historical trend charts.
        </p>
      </div>

      {/* Summary tiles */}
      <div className="three-col mb-16">
        <div className="stat-tile card anim-fadein" style={{ borderTop: '3px solid var(--green)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="stat-label">Scheduled ETA</div>
          <div className="stat-value mono">{prediction?.scheduledETA ?? '15:30'}</div>
          <div className="stat-sub">at destination</div>
        </div>
        <div className="stat-tile card anim-fadein" style={{ borderTop: `3px solid var(--${delayColor})`, boxShadow: 'var(--shadow-sm)', animationDelay: '80ms' }}>
          <div className="stat-label">Predicted ETA</div>
          <div className={`stat-value mono ${delayColor}`}>{prediction?.destinationETA ?? '—'}</div>
          <div className="stat-sub">current forecast</div>
        </div>
        <div className="stat-tile card anim-fadein" style={{ borderTop: '3px solid var(--blue-accent)', boxShadow: 'var(--shadow-sm)', animationDelay: '160ms' }}>
          <div className="stat-label">Predicted Delay</div>
          <div className={`stat-value mono ${delayColor}`}>
            {prediction ? `${prediction.predictedDelayMinutes > 0 ? '+' : ''}${prediction.predictedDelayMinutes}` : '—'}
          </div>
          <div className="stat-sub">minutes</div>
        </div>
      </div>

      {/* ETA History Chart */}
      <div className="card mb-16 anim-fadein">
        <div className="card-header">
          <div>
            <div className="card-title">ETA Trend</div>
            <div className="card-subtitle">Predicted destination ETA over simulation time</div>
          </div>
          <span className="badge badge-blue" style={{ fontSize: 10 }}>{etaHistory.length} points</span>
        </div>
        <div className="card-body">
          <ETAChart history={etaHistory} scheduledETA={prediction?.scheduledETA ?? '15:30'} />
        </div>
      </div>

      {/* Speed + Delay charts */}
      <div className="two-col mb-16">
        <div className="card anim-fadein">
          <div className="card-header">
            <div className="card-title">Speed History</div>
            <div className="card-subtitle">km/h over simulation time</div>
          </div>
          <div className="card-body">
            <SpeedChart history={speedHistory} speedRestriction={simState.speedRestriction} />
          </div>
        </div>
        <div className="card anim-fadein">
          <div className="card-header">
            <div className="card-title">Delay Trend</div>
            <div className="card-subtitle">Running delay (minutes)</div>
          </div>
          <div className="card-body">
            <DelayChart history={delayHistory} />
          </div>
        </div>
      </div>

      {/* Impact breakdown: list + bar chart */}
      <div className="two-col mb-16">
        <div className="card anim-fadein">
          <div className="card-header">
            <div className="card-title">ETA Impact Analysis</div>
            <div className="card-subtitle">Contributing factors breakdown</div>
          </div>
          <div className="card-body">
            <ImpactBarChart factors={prediction?.contributingFactors ?? []} />
          </div>
        </div>

        <div>
          <div className="card mb-12 anim-fadein">
            <div className="card-header">
              <div className="card-title">Prediction Details</div>
            </div>
            <div className="card-body">
              {[
                ['Baseline remaining', `${prediction?.baselineRemainingMinutes ?? '—'} min`],
                ['Total additional', `${totalAdditional > 0 ? '+' : ''}${totalAdditional} min`],
                ['Total remaining', `${prediction?.remainingMinutes ?? '—'} min`],
                ['Model confidence', `${prediction?.confidence ?? '—'}%`],
                ['Last recalculated', prediction?.lastRecalculated ?? '—'],
              ].map(([label, val], i) => (
                <div key={i} className="impact-row">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span className="text-mono text-sm font-semibold">{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7,
          }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
              About the Prediction Model
            </div>
            The prototype uses a transparent, rule-based prediction formula combining
            historical travel time, current conditions, and operational events.
            "Prototype Model Confidence" is a heuristic indicator, not a validated metric.
          </div>
        </div>
      </div>

      {/* Station ETAs */}
      {train && (
        <div className="card anim-fadein">
          <div className="card-header">
            <div className="card-title">Station-wise ETA Forecast</div>
            <div className="card-subtitle">
              {train.number} {train.name} · {train.origin} → {train.destination}
            </div>
          </div>
          <StationTable stations={train.stations} />
        </div>
      )}
    </div>
  );
}
