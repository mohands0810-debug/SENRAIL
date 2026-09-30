// ============================================================
// SENRAIL — Delay History Chart
// ============================================================

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { DelayHistoryPoint } from '../store/AppContext';

interface DelayChartProps {
  history: DelayHistoryPoint[];
}

interface TipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: DelayHistoryPoint }>;
}

function DelayTip({ active, payload }: TipProps) {
  if (!active || !payload?.length) return null;
  const pt = payload[0].payload;
  const isPos = pt.delay > 0;
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '8px 12px',
      boxShadow: 'var(--shadow-sm)', fontSize: 12,
    }}>
      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pt.time}</div>
      <div style={{ color: 'var(--text-secondary)' }}>
        Delay:{' '}
        <strong style={{
          fontFamily: 'var(--font-mono)',
          color: isPos ? 'var(--red)' : 'var(--green)',
        }}>
          {isPos ? '+' : ''}{pt.delay} min
        </strong>
      </div>
    </div>
  );
}

export default function DelayChart({ history }: DelayChartProps) {
  if (history.length < 2) {
    return (
      <div style={{
        height: 180, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)', fontSize: 13, gap: 6,
      }}>
        <div style={{ fontSize: 20 }}>⏱</div>
        Delay data will appear as simulation runs…
      </div>
    );
  }

  const delays = history.map(h => h.delay);
  const minD = Math.min(...delays, -2) - 3;
  const maxD = Math.max(...delays, 2) + 5;

  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={history} margin={{ top: 8, right: 16, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="delayGradPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9b1c1c" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#9b1c1c" stopOpacity={0.02} />
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
            domain={[minD, maxD]}
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={v => `${v > 0 ? '+' : ''}${v}`}
            unit=" min"
          />
          <Tooltip content={<DelayTip />} />
          <ReferenceLine y={0} stroke="var(--green)" strokeWidth={1.5} />
          <Area
            type="monotone"
            dataKey="delay"
            stroke="var(--red)"
            strokeWidth={2}
            fill="url(#delayGradPos)"
            dot={false}
            activeDot={{ r: 4, fill: 'var(--red)', strokeWidth: 0 }}
            isAnimationActive={true}
            animationDuration={400}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
        Running delay (minutes) over simulation time · Green line = On schedule
      </div>
    </div>
  );
}
