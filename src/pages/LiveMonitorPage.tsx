// ============================================================
// SENRAIL — Live Train Monitor Page
// Full 100-train fleet view with searchable table + detail panel.
// ============================================================

import React, { useState, useMemo } from 'react';
import { Train, Search, Activity, Zap, Clock } from 'lucide-react';
import { useAppState } from '../store/AppContext';
import StationTable from '../components/StationTable';
import { ALL_TRAINS, computeSimpleETA, type TrainCatalogEntry } from '../data/staticData';
import NetworkMap from '../components/NetworkMap';

// ---- Badge helpers ---------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  if (status === 'Running') return <span className="badge badge-green">Running</span>;
  if (status === 'Delayed') return <span className="badge badge-amber">Delayed</span>;
  if (status === 'Halted')  return <span className="badge badge-red">Halted</span>;
  return <span className="badge badge-gray">{status}</span>;
}

const TYPE_CLS: Record<string, string> = {
  Rajdhani: 'badge-red', Shatabdi: 'badge-blue', Duronto: 'badge-red',
  Express: 'badge-gray', Mail: 'badge-gray', Superfast: 'badge-amber', Passenger: 'badge-gray',
};

// ---- Mini stat strip -------------------------------------------------------

function FleetStrip() {
  const running = ALL_TRAINS.filter(t => t.status === 'Running').length;
  const delayed = ALL_TRAINS.filter(t => t.status === 'Delayed').length;
  const halted  = ALL_TRAINS.filter(t => t.status === 'Halted').length;
  const avgSpeed = Math.round(ALL_TRAINS.reduce((s, t) => s + t.currentSpeed, 0) / ALL_TRAINS.length);
  const avgDelay = Math.round(ALL_TRAINS.reduce((s, t) => s + t.currentDelay, 0) / ALL_TRAINS.length);

  const items = [
    { icon: <Train size={14} />,    label: 'Total Fleet',  value: ALL_TRAINS.length, color: 'var(--blue-accent)', mono: false },
    { icon: <Activity size={14} />, label: 'Running',      value: running,            color: 'var(--green)',       mono: false },
    { icon: <Clock size={14} />,    label: 'Delayed',      value: `${delayed} trains`,color: 'var(--red)',         mono: false },
    { icon: <Zap size={14} />,      label: 'Halted / Held',value: `${halted} trains`, color: 'var(--amber)',       mono: false },
    { icon: <Zap size={14} />,      label: 'Avg Speed',    value: `${avgSpeed} km/h`, color: 'var(--text-primary)',mono: true  },
    { icon: <Clock size={14} />,    label: 'Avg Delay',    value: `+${avgDelay} min`, color: avgDelay > 15 ? 'var(--red)' : 'var(--green)', mono: true },
  ];

  return (
    <div className="stat-grid mb-16">
      {items.map(item => (
        <div key={item.label} className="stat-tile anim-fadein">
          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {item.icon} {item.label}
          </div>
          <div className={`stat-value ${item.mono ? 'mono' : ''}`} style={{ color: item.color }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Catalog train detail panel -------------------------------------------

function CatalogTrainDetail({ train, onClose }: { train: TrainCatalogEntry; onClose: () => void }) {
  const eta = computeSimpleETA(train);
  const delayColor = eta.delayMin > 30 ? 'var(--red)' : eta.delayMin > 10 ? 'var(--amber)' : 'var(--green)';
  const currentStopIdx = Math.floor(train.stationStops.length / 2);
  const currentStop = train.stationStops[currentStopIdx];

  return (
    <div className="card mb-16 anim-fadein" style={{ borderTop: '3px solid var(--blue-accent)' }}>
      <div className="card-header" style={{ background: 'var(--navy)', color: 'white', margin: '-1px -1px 0', borderRadius: '6px 6px 0 0' }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
            <span className="text-mono" style={{ fontSize: 18, fontWeight: 700 }}>{train.number}</span>
            <span className={`badge ${TYPE_CLS[train.trainType] ?? 'badge-gray'}`}>{train.trainType}</span>
            <StatusBadge status={train.status} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{train.name}</div>
          <div style={{ fontSize: 11, opacity: 0.65, marginTop: 2 }}>
            {train.origin} → {train.destination} · {train.distanceKm} km · {train.daysLabel}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, opacity: 0.6 }}>Predicted ETA</div>
            <div className="text-mono" style={{ fontSize: 22, fontWeight: 700, color: delayColor }}>{eta.predictedArrival}</div>
            <div style={{ fontSize: 11, color: delayColor, fontWeight: 600 }}>
              {eta.delayMin > 0 ? `+${eta.delayMin} min delay` : 'On Time'}
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose} style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
            ✕ Close
          </button>
        </div>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'flex', gap: 0, background: 'var(--bg)', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        {[
          ['Dep.', train.scheduledDeparture],
          ['Arr.', train.scheduledArrival],
          ['ETA', eta.predictedArrival, delayColor],
          ['Speed', `${train.currentSpeed} km/h`],
          ['Dist. Left', `${train.distanceRemaining} km`],
          ['Delay', `${eta.delayMin > 0 ? '+' : ''}${eta.delayMin} min`, delayColor],
        ].map(([l, v, c]) => (
          <div key={l} style={{ padding: '8px 16px', textAlign: 'center', borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{l}</div>
            <div className="text-mono" style={{ fontSize: 13, fontWeight: 700, color: c ?? 'var(--text-primary)' }}>{v}</div>
          </div>
        ))}
      </div>

      <div className="card-body">
        <div className="two-col">
          {/* Network map */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Network Map</div>
            <NetworkMap highlightTrainId={train.id} currentStationCode={currentStop?.code} compact />
          </div>

          {/* Station stops */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Station Schedule</div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>#</th><th>Station</th><th>Code</th><th>Arr.</th><th>Dep.</th><th>ETA (pred.)</th></tr>
                </thead>
                <tbody>
                  {train.stationStops.map((stop, i) => {
                    const isCurr = stop.code === currentStop?.code;
                    const isDest = i === train.stationStops.length - 1;
                    const delayFrac = isDest ? eta.delayMin : Math.round(eta.delayMin * stop.distanceFromOrigin / train.distanceKm);
                    const [h, m] = stop.scheduledArrival.split(':').map(Number);
                    const predMin = (h * 60 + m + delayFrac + 1440) % 1440;
                    const ph = Math.floor(predMin / 60), pm2 = predMin % 60;
                    const pred = `${String(ph).padStart(2,'0')}:${String(pm2).padStart(2,'0')}`;
                    const dc = delayFrac > 20 ? 'var(--red)' : delayFrac > 5 ? 'var(--amber)' : 'var(--green)';
                    return (
                      <tr key={stop.code} className={isCurr ? 'selected' : ''}>
                        <td style={{ fontSize: 10, color: 'var(--text-muted)' }}>{i + 1}</td>
                        <td>
                          <div style={{ fontSize: 12, fontWeight: isCurr || isDest ? 600 : 400 }}>{stop.name}</div>
                          {isCurr && <span className="badge badge-amber" style={{ fontSize: 9 }}>Current</span>}
                          {isDest && <span className="badge badge-blue" style={{ fontSize: 9 }}>Dest.</span>}
                        </td>
                        <td><code className="text-mono" style={{ fontSize: 11, color: 'var(--blue-accent)' }}>{stop.code}</code></td>
                        <td className="text-mono" style={{ fontSize: 11 }}>{stop.scheduledArrival}</td>
                        <td className="text-mono" style={{ fontSize: 11 }}>{stop.scheduledDeparture}</td>
                        <td className="text-mono" style={{ fontSize: 12, fontWeight: 600, color: i === 0 ? 'inherit' : dc }}>
                          {i === 0 ? '—' : pred}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main page
// ============================================================

export default function LiveMonitorPage() {
  const { state, dispatch } = useAppState();
  const { trains, simState, prediction } = state;

  const [query, setQuery]           = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null);
  const [page, setPage]             = useState(1);
  const PER_PAGE = 20;

  const TYPES    = ['All', 'Rajdhani', 'Duronto', 'Shatabdi', 'Superfast', 'Express', 'Mail', 'Passenger'];
  const STATUSES = ['All', 'Running', 'Delayed', 'Halted'];

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ALL_TRAINS.filter(t => {
      if (q && !t.number.includes(q) && !t.name.toLowerCase().includes(q) &&
          !t.origin.toLowerCase().includes(q) && !t.destination.toLowerCase().includes(q) &&
          !t.originCode.toLowerCase().includes(q) && !t.destinationCode.toLowerCase().includes(q)) return false;
      if (typeFilter !== 'All' && t.trainType !== typeFilter) return false;
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      return true;
    });
  }, [query, typeFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const selectedCatalogTrain = selectedCatalogId
    ? ALL_TRAINS.find(t => t.id === selectedCatalogId) ?? null
    : null;

  // The active simulated train from AppContext
  const simTrain = trains.find(t => t.id === simState.selectedTrainId);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Live Train Monitor</h1>
        <p className="page-subtitle">
          Full fleet of {ALL_TRAINS.length} trains — real-time status, ETA predictions, and station schedules.
          Click any row to inspect a train.
        </p>
      </div>

      {/* Fleet strip */}
      <FleetStrip />

      {/* Live-sim train panel */}
      {simTrain && (
        <div className="card mb-16 anim-fadein" style={{ borderLeft: '3px solid var(--blue-accent)' }}>
          <div className="card-header">
            <div>
              <div className="card-title">
                <span style={{ background: 'var(--red)', color: 'white', padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 700, marginRight: 8 }}>
                  LIVE SIM
                </span>
                {simTrain.number} {simTrain.name}
              </div>
              <div className="card-subtitle">{simTrain.origin} → {simTrain.destination} · Simulated — ticking every 3s</div>
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              {[
                { l: 'Speed',     v: `${simTrain.currentSpeed} km/h`                                                          },
                { l: 'Delay',     v: `${simTrain.currentDelay > 0 ? '+' : ''}${simTrain.currentDelay} min`,
                  c: simTrain.currentDelay > 10 ? 'var(--red)' : 'var(--green)'                                               },
                { l: 'ETA',       v: prediction?.destinationETA ?? '—',     c: 'var(--blue-accent)'                           },
                { l: 'Confidence',v: prediction ? `${prediction.confidence}%` : '—'                                           },
              ].map(({ l, v, c }) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{l}</div>
                  <div className="text-mono" style={{ fontSize: 14, fontWeight: 700, color: c ?? 'var(--text-primary)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Station table for simulated train */}
          <StationTable stations={simTrain.stations} />
        </div>
      )}

      {/* Selected catalog train detail */}
      {selectedCatalogTrain && (
        <CatalogTrainDetail
          train={selectedCatalogTrain}
          onClose={() => setSelectedCatalogId(null)}
        />
      )}

      {/* Full fleet table */}
      <div className="card anim-fadein">
        <div className="card-header">
          <div>
            <div className="card-title">Fleet Status — All Trains</div>
            <div className="card-subtitle">{filtered.length} of {ALL_TRAINS.length} trains · Click any row to inspect</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, padding: '10px 16px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 2, minWidth: 180 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="search-input" style={{ paddingLeft: 30, height: 34 }}
              placeholder="Train no., name, station code…"
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(1); }}
            />
          </div>
          <select className="search-input" style={{ flex: 1, minWidth: 130, height: 34 }} value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="search-input" style={{ flex: 1, minWidth: 120, height: 34 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" aria-label="Fleet status table">
            <thead>
              <tr>
                <th>Train No.</th>
                <th>Name</th>
                <th>From</th>
                <th>To</th>
                <th>Type</th>
                <th>Dep.</th>
                <th>Sched. Arr.</th>
                <th>Pred. ETA</th>
                <th style={{ textAlign: 'right' }}>Speed</th>
                <th style={{ textAlign: 'right' }}>Dist. Left</th>
                <th>Delay</th>
                <th>Status</th>
                <th>Days</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map(train => {
                const eta = computeSimpleETA(train);
                const delayColor = eta.delayMin > 30 ? 'var(--red)' : eta.delayMin > 10 ? 'var(--amber)' : 'var(--green)';
                const isSelected = selectedCatalogId === train.id;
                const isSimTrain = simTrain && train.number === simTrain.number;

                return (
                  <tr
                    key={train.id}
                    className={isSelected ? 'selected' : ''}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedCatalogId(isSelected ? null : train.id)}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        {isSimTrain && (
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', display: 'inline-block', animation: 'pulse 1.5s infinite' }} title="Live simulated" />
                        )}
                        <code className="text-mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue-accent)' }}>
                          {train.number}
                        </code>
                      </div>
                    </td>
                    <td style={{ maxWidth: 180 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                        {train.name}
                      </div>
                    </td>
                    <td style={{ fontSize: 11 }} title={train.origin}>{train.originCode}</td>
                    <td style={{ fontSize: 11 }} title={train.destination}>{train.destinationCode}</td>
                    <td><span className={`badge ${TYPE_CLS[train.trainType] ?? 'badge-gray'}`} style={{ fontSize: 9 }}>{train.trainType}</span></td>
                    <td className="text-mono" style={{ fontSize: 11 }}>{train.scheduledDeparture}</td>
                    <td className="text-mono" style={{ fontSize: 11 }}>{train.scheduledArrival}</td>
                    <td className="text-mono" style={{ fontSize: 12, fontWeight: 700, color: delayColor }}>{eta.predictedArrival}</td>
                    <td className="text-mono" style={{ fontSize: 11, textAlign: 'right' }}>{train.currentSpeed} km/h</td>
                    <td className="text-mono" style={{ fontSize: 11, textAlign: 'right' }}>{train.distanceRemaining} km</td>
                    <td>
                      <span className="text-mono" style={{ fontSize: 11, fontWeight: 700, color: delayColor }}>
                        {eta.delayMin > 0 ? '+' : ''}{eta.delayMin} min
                      </span>
                    </td>
                    <td><StatusBadge status={train.status} /></td>
                    <td style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{train.daysLabel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '10px 16px', borderTop: '1px solid var(--border-light)' }}>
            <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Page {page} of {totalPages} &nbsp;·&nbsp; {filtered.length} trains
            </span>
            <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next ›</button>
          </div>
        )}
      </div>
    </div>
  );
}
