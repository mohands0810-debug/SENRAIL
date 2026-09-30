// ============================================================
// SENRAIL — ETA Impact Analysis Component
// ============================================================

import React from 'react';
import type { ContributingFactor } from '../types';
import { Zap, Wrench, CloudRain, Radio, Clock, TrendingDown } from 'lucide-react';

interface ImpactAnalysisProps {
  factors: ContributingFactor[];
  totalAdditionalDelay: number;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  congestion: <Zap size={12} />,
  maintenance: <Wrench size={12} />,
  weather: <CloudRain size={12} />,
  signal: <Radio size={12} />,
  historical: <Clock size={12} />,
  recovery: <TrendingDown size={12} />,
};

export default function ImpactAnalysis({ factors, totalAdditionalDelay }: ImpactAnalysisProps) {
  if (factors.length === 0) {
    return (
      <div className="card-body">
        <div className="text-sm text-muted" style={{ textAlign: 'center', padding: '12px 0' }}>
          No active disruptions contributing to delay.
        </div>
      </div>
    );
  }

  const delaySign = totalAdditionalDelay > 0 ? '+' : '';

  return (
    <div className="card-body">
      <div className="flex-between mb-12">
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Predicted additional delay
        </span>
        <span
          className="text-mono font-bold"
          style={{
            fontSize: 16,
            color: totalAdditionalDelay > 0 ? 'var(--red)' : 'var(--green)',
          }}
        >
          {delaySign}{totalAdditionalDelay} min
        </span>
      </div>

      {factors.map((f, i) => {
        const sign = f.impactMinutes > 0 ? '+' : '';
        const isNeg = f.impactMinutes < 0;
        return (
          <div className="impact-row" key={i}>
            <div className="impact-label">
              <div className={`impact-icon ${f.type}`}>
                {ICON_MAP[f.type]}
              </div>
              <span>{f.label}</span>
            </div>
            <span className={`impact-minutes ${isNeg ? 'negative' : 'positive'}`}>
              {sign}{f.impactMinutes} min
            </span>
          </div>
        );
      })}
    </div>
  );
}
