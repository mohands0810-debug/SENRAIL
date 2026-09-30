// ============================================================
// SENRAIL — Impact Factors Bar Chart
// ============================================================

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import type { ContributingFactor } from '../types';

interface ImpactBarChartProps {
  factors: ContributingFactor[];
}

const TYPE_COLORS: Record<string, string> = {
  congestion: '#9b1c1c',
  maintenance: '#a05c00',
  weather: '#1d6fa5',
  signal: '#a05c00',
  historical: '#5a6478',
  recovery: '#1a7a3c',
};

interface TipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: ContributingFactor & { name: string } }>;
}

function BarTip({ active, payload }: TipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const isNeg = d.impactMinutes < 0;
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '8px 12px',
      boxShadow: 'var(--shadow-sm)', fontSize: 12,
    }}>
      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{d.label}</div>
      <div style={{ color: isNeg ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
        {isNeg ? '' : '+'}{d.impactMinutes} min
      </div>
    </div>
  );
}

export default function ImpactBarChart({ factors }: ImpactBarChartProps) {
  if (!factors.length) {
    return (
      <div style={{
        height: 160, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)', fontSize: 13, gap: 6,
      }}>
        <div style={{ fontSize: 20 }}>✅</div>
        No active disruptions
      </div>
    );
  }

  const data = factors.map(f => ({
    ...f,
    name: f.label.length > 22 ? f.label.slice(0, 20) + '…' : f.label,
    absImpact: Math.abs(f.impactMinutes),
  }));

  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={Math.max(160, data.length * 42 + 40)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 60, left: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v > 0 ? '+' : ''}${v}m`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: 'var(--text-primary)' }}
            tickLine={false}
            axisLine={false}
            width={160}
          />
          <Tooltip content={<BarTip />} />
          <Bar dataKey="impactMinutes" radius={[0, 4, 4, 0]} isAnimationActive={true} animationDuration={600}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={TYPE_COLORS[entry.type] ?? 'var(--text-muted)'}
                fillOpacity={0.85}
              />
            ))}
            <LabelList
              dataKey="impactMinutes"
              position="right"
              formatter={(v: unknown) => {
                const n = Number(v);
                return `${n > 0 ? '+' : ''}${n} min`;
              }}
              style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, fill: 'var(--text-secondary)' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
