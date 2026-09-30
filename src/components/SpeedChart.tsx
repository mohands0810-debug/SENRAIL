// ============================================================
// SENRAIL — Speed History Chart
// ============================================================

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { SpeedHistoryPoint } from '../store/AppContext';

interface SpeedChartProps {
  history: SpeedHistoryPoint[];
  speedRestriction: number | null;
}

interface TipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: SpeedHistoryPoint }>;
}

function SpeedTip({ active, payload }: TipProps) {
  if (!active || !payload?.length) return null;
  const pt = payload[0].payload;
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '8px 12px',
      boxShadow: 'var(--shadow-sm)', fontSize: 12,
    }}>
      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pt.time}</div>
      <div style={{ color: 'var(--text-secondary)' }}>
        Speed: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--navy)' }}>{pt.speed} km/h</strong>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{pt.scenario}</div>
    </div>
  );
}

export default function SpeedChart({ history, speedRestriction }: SpeedChartProps) {
  if (history.length < 2) {
    return (
      <div style={{
        height: 180, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)', fontSize: 13, gap: 6,
      }}>
        <div style={{ fontSize: 20 }}>🚆</div>
        Speed data will appear as simulation runs…
      </div>
    );
  }

  const speeds = history.map(h => h.speed);
  const minSpd = Math.max(0, Math.min(...speeds) - 10);
  const maxSpd = Math.min(140, Math.max(...speeds) + 15);

  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={history} margin={{ top: 8, right: 16, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--navy)" stopOpacity={0.18} />
              <stop offset="95%" stopColor="var(--navy)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
            interval={Math.max(1, Math.floor(history.length / 6))}
          />
          <YAxis
            domain={[minSpd, maxSpd]}
            tickFormatter={v => `${v}`}
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={false}
            width={36}
            unit=" km/h"
          />
          <Tooltip content={<SpeedTip />} />
          {speedRestriction !== null && (
            <ReferenceLine
              y={speedRestriction}
              stroke="var(--amber)"
              strokeDasharray="5 3"
              strokeWidth={1.5}
              label={{ value: `Limit ${speedRestriction}`, fill: 'var(--amber)', fontSize: 10, position: 'insideTopRight' }}
            />
          )}
          <Area
            type="monotone"
            dataKey="speed"
            stroke="var(--navy)"
            strokeWidth={2}
            fill="url(#speedGrad)"
            dot={false}
            activeDot={{ r: 4, fill: 'var(--navy)', strokeWidth: 0 }}
            isAnimationActive={true}
            animationDuration={400}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
        Train speed (km/h) over simulation time
        {speedRestriction ? ` · Dashed = Speed restriction (${speedRestriction} km/h)` : ''}
      </div>
    </div>
  );
}
