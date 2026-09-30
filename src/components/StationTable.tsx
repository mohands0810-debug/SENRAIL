// ============================================================
// SENRAIL — Station ETA Table Component
// ============================================================

import React from 'react';
import type { StationETA } from '../types';

interface StationTableProps {
  stations: StationETA[];
}

function DelayBadge({ minutes }: { minutes: number }) {
  if (minutes === 0) return <span className="badge badge-green">On Time</span>;
  if (minutes > 0) {
    const cls = minutes > 20 ? 'badge-red' : 'badge-amber';
    return <span className={`badge ${cls}`}>+{minutes} min</span>;
  }
  return <span className="badge badge-green">{minutes} min</span>;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'Passed': return <span className="badge badge-gray">Passed</span>;
    case 'Approaching': return <span className="badge badge-blue">Approaching</span>;
    case 'Upcoming': return <span className="badge badge-gray">Upcoming</span>;
    case 'Destination': return <span className="badge badge-green">Destination</span>;
    default: return <span className="badge badge-gray">{status}</span>;
  }
}

export default function StationTable({ stations }: StationTableProps) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table" aria-label="Upcoming station ETAs">
        <thead>
          <tr>
            <th>Station</th>
            <th>Scheduled</th>
            <th>Predicted</th>
            <th>Delay</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {stations.map((s) => (
            <tr key={s.stationId}>
              <td>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{s.stationName}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.stationCode}</div>
              </td>
              <td className="mono">{s.scheduledArrival}</td>
              <td className="mono" style={{ fontWeight: s.status !== 'Passed' ? 600 : 400 }}>
                {s.predictedArrival}
              </td>
              <td>
                <DelayBadge minutes={s.delayMinutes} />
              </td>
              <td>
                <StatusBadge status={s.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
