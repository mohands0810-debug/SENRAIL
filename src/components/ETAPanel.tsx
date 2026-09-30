// ============================================================
// SENRAIL — ETA Panel Component
// ============================================================

import React from 'react';
import type { ETAPrediction } from '../prediction/etaPredictor';

interface ETAPanelProps {
  prediction: ETAPrediction | null;
  trainDelay: number;
}

export default function ETAPanel({ prediction, trainDelay }: ETAPanelProps) {
  if (!prediction) {
    return (
      <div className="eta-panel">
        <div className="eta-label">Predicted Arrival</div>
        <div className="eta-time" style={{ fontSize: 24, color: 'var(--text-muted)' }}>
          —
        </div>
        <div className="text-muted text-sm mt-8">
          Start simulation to compute ETA
        </div>
      </div>
    );
  }

  const isDelayed = prediction.predictedDelayMinutes > 5;
  const delaySign = prediction.predictedDelayMinutes > 0 ? '+' : '';

  return (
    <div className="eta-panel">
      <div className="eta-label">Predicted Arrival — Destination</div>
      <div className={`eta-time${isDelayed ? ' delayed' : ''}`}>
        {prediction.destinationETA}
      </div>

      <div className="eta-meta">
        <div className="eta-meta-item">
          <div className="eta-meta-label">Scheduled</div>
          <div className="eta-meta-value">{prediction.scheduledETA}</div>
        </div>
        <div className="eta-meta-item">
          <div className="eta-meta-label">Predicted Delay</div>
          <div
            className="eta-meta-value"
            style={{
              color:
                prediction.predictedDelayMinutes > 15
                  ? 'var(--red)'
                  : prediction.predictedDelayMinutes > 5
                  ? 'var(--amber)'
                  : 'var(--green)',
            }}
          >
            {delaySign}{prediction.predictedDelayMinutes} min
          </div>
        </div>
        <div className="eta-meta-item">
          <div className="eta-meta-label">Remaining</div>
          <div className="eta-meta-value">{prediction.remainingMinutes} min</div>
        </div>
      </div>

      <div className="confidence-bar-container">
        <div className="confidence-label">
          Prototype Model Confidence — {prediction.confidence}%
        </div>
        <div className="confidence-bar" role="progressbar" aria-valuenow={prediction.confidence} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="confidence-fill"
            style={{ width: `${prediction.confidence}%` }}
          />
        </div>
      </div>

      <div className="text-sm text-muted mt-8">
        Recalculated: {prediction.lastRecalculated}
      </div>
    </div>
  );
}
