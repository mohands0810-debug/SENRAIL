// ============================================================
// SENRAIL — Fixed ETA History Chart (shows real movement)
// ============================================================

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, Area, AreaChart,
} from 'recharts';
import type { ETAHistoryPoint } from '../types';
import { minutesToTime, timeToMinutes } from '../prediction/etaPredictor';

interface ETAChartProps {
  history: ETAHistoryPoint[];
  scheduledETA: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: ETAHistoryPoint }>;
  label?: string;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const pt = payload[0].payload;
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '8px 12px',
      boxShadow: 'var(--shadow-sm)', fontSize: 12,
    }}>
      <div style={{ fontWeight: 600, marginBottom: 3, color: 'var(--text-primary)' }}>
        Recorded at {pt.time}
      </div>
      <div style={{ color: 'var(--text-secondary)' }}>
        Predicted ETA:{' '}
        <strong style={{ color: 'var(--navy)', fontFamily: 'var(--font-mono)' }}>
          {pt.predictedETA}
        </strong>
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>
        {pt.scenario}
      </div>
    </div>
  );
}

export default function ETAChart({ history, scheduledETA }: ETAChartProps) {
  if (history.length < 2) {
    return (
      <div style={{
        height: 200, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)', fontSize: 13, gap: 8,
      }}>
        <div style={{ fontSize: 24 }}>📈</div>
        Start simulation to see ETA history…
      </div>
    );
  }

  const scheduledMinutes = timeToMinutes(scheduledETA);
  const values = history.map(h => h.predictedMinutes);
  const minVal = Math.min(...values, scheduledMinutes) - 8;
  const maxVal = Math.max(...values, scheduledMinutes) + 8;

  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={history} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="etaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--blue-accent)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--blue-accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
            interval={Math.max(1, Math.floor(history.length / 8))}
          />
          <YAxis
            domain={[minVal, maxVal]}
            tickFormatter={v => minutesToTime(Math.round(v))}
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={scheduledMinutes}
            stroke="var(--green)"
            strokeDasharray="6 3"
            strokeWidth={1.5}
            label={{ value: `Sched ${scheduledETA}`, fill: 'var(--green)', fontSize: 10, position: 'insideTopRight' }}
          />
          <Area
            type="monotone"
            dataKey="predictedMinutes"
            stroke="var(--blue-accent)"
            strokeWidth={2.5}
            fill="url(#etaGrad)"
            dot={false}
            activeDot={{ r: 5, fill: 'var(--blue-accent)', strokeWidth: 0 }}
            isAnimationActive={true}
            animationDuration={400}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
        Predicted destination ETA over simulation time · Dashed = Scheduled
      </div>
    </div>
  );
}
