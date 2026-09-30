// ============================================================
// SENRAIL — Overview Page (Fleet Dashboard)
// Shows all 100 trains + live simulation summary.
// ============================================================

import React, { useState, useMemo } from 'react';
import { useAppState } from '../store/AppContext';
import { ALL_TRAINS, computeSimpleETA, type TrainCatalogEntry } from '../data/staticData';
import RouteVisualization from '../components/RouteVisualization';
import ETAPanel from '../components/ETAPanel';
import SpeedChart from '../components/SpeedChart';
import DelayChart from '../components/DelayChart';
import { Search, Train, Filter } from 'lucide-react';

// ---- Fleet stats -----------------------------------------------------------

function FleetStats() {
  const running = ALL_TRAINS.filter(t => t.status === 'Running').length;
  const delayed = ALL_TRAINS.filter(t => t.status === 'Delayed').length;
  const halted  = ALL_TRAINS.filter(t => t.status === 'Halted').length;
  const onTime  = ALL_TRAINS.filter(t => t.currentDelay === 0).length;

  const tiles = [
    { label: 'Total Fleet',    value: ALL_TRAINS.length, color: 'var(--blue-accent)', sub: 'coaches tracked' },
    { label: 'Running',        value: running,            color: 'var(--green)',       sub: 'en route'        },
    { label: 'Delayed',        value: delayed,            color: 'var(--red)',         sub: 'behind schedule' },
    { label: 'Halted / Held',  value: halted,             color: 'var(--amber)',       sub: 'awaiting clearance'},
    { label: 'On Time',        value: onTime,             color: 'var(--green)',       sub: '0-min delay'     },
  ];

  return (
    <div className="stat-grid mb-16">
      {tiles.map(t => (
        <div key={t.label} className="stat-tile anim-fadein" style={{ borderTop: `3px solid ${t.color}` }}>
          <div className="stat-label">{t.label}</div>
          <div className="stat-value mono" style={{ color: t.color }}>{t.value}</div>
          <div className="stat-sub">{t.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ---- Delay color -----------------------------------------------------------

function delayBadge(delay: number, status: string) {
  if (status === 'Halted') return { cls: 'badge badge-amber', text: 'Halted' };
  if (delay <= 0)          return { cls: 'badge badge-green', text: 'On Time' };
  if (delay <= 15)         return { cls: 'badge badge-amber', text: `+${delay} min` };
  return                          { cls: 'badge badge-red',   text: `+${delay} min` };
}

const TYPE_CLS: Record<string, string> = {
  Rajdhani: 'badge-red', Shatabdi: 'badge-blue', Duronto: 'badge-red',
  Express: 'badge-gray', Mail: 'badge-gray', Superfast: 'badge-amber', Passenger: 'badge-gray',
};

// ---- Fleet table -----------------------------------------------------------

interface FleetTableProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

function FleetTable({ selectedId, onSelect }: FleetTableProps) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [zoneFilter, setZoneFilter] = useState('All');
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const types   = ['All', 'Rajdhani', 'Duronto', 'Shatabdi', 'Superfast', 'Express', 'Mail', 'Passenger'];
  const statuses = ['All', 'Running', 'Delayed', 'Halted'];

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ALL_TRAINS.filter(t => {
      if (q && !t.number.includes(q) && !t.name.toLowerCase().includes(q) &&
          !t.origin.toLowerCase().includes(q) && !t.destination.toLowerCase().includes(q) &&
          !t.originCode.toLowerCase().includes(q) && !t.destinationCode.toLowerCase().includes(q)) {
        return false;
      }
      if (typeFilter !== 'All' && t.trainType !== typeFilter) return false;
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      return true;
    });
  }, [query, typeFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleQuery = (v: string) => { setQuery(v); setPage(1); };

  return (
    <div className="card anim-fadein">
      <div className="card-header">
        <div>
          <div className="card-title">Active Fleet — All Trains</div>
          <div className="card-subtitle">{filtered.length} trains · Click any row for details</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, padding: '10px 16px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '2', minWidth: 180 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="search-input"
            style={{ paddingLeft: 30, height: 34 }}
            placeholder="Search train no., name, station…"
            value={query}
            onChange={e => handleQuery(e.target.value)}
          />
        </div>
        <select className="search-input" style={{ flex: 1, minWidth: 130, height: 34 }} value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
          {types.map(t => <option key={t}>{t}</option>)}
        </select>
        <select className="search-input" style={{ flex: 1, minWidth: 120, height: 34 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Train No.</th>
              <th>Name</th>
              <th>From</th>
              <th>To</th>
              <th>Type</th>
              <th>Dep.</th>
              <th>Arr.</th>
              <th style={{ textAlign: 'right' }}>Speed</th>
              <th style={{ textAlign: 'right' }}>Dist Left</th>
              <th>Status / Delay</th>
              <th>Days</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map(train => {
              const badge = delayBadge(train.currentDelay, train.status);
              const isSelected = selectedId === train.id;
              return (
                <tr
                  key={train.id}
                  className={isSelected ? 'selected' : ''}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelect(isSelected ? null : train.id)}
                >
                  <td>
                    <code className="text-mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue-accent)' }}>
                      {train.number}
                    </code>
                  </td>
                  <td style={{ maxWidth: 200 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
                      {train.name}
                    </div>
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    <span title={train.origin}>{train.originCode}</span>
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    <span title={train.destination}>{train.destinationCode}</span>
                  </td>
                  <td>
                    <span className={`badge ${TYPE_CLS[train.trainType] ?? 'badge-gray'}`} style={{ fontSize: 9 }}>
                      {train.trainType}
                    </span>
                  </td>
                  <td className="text-mono" style={{ fontSize: 11 }}>{train.scheduledDeparture}</td>
                  <td className="text-mono" style={{ fontSize: 11 }}>{train.scheduledArrival}</td>
                  <td className="text-mono" style={{ fontSize: 11, textAlign: 'right' }}>{train.currentSpeed} km/h</td>
                  <td className="text-mono" style={{ fontSize: 11, textAlign: 'right' }}>{train.distanceRemaining} km</td>
                  <td><span className={badge.cls} style={{ fontSize: 10 }}>{badge.text}</span></td>
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
            Page {page} of {totalPages} ({filtered.length} trains)
          </span>
          <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next ›</button>
        </div>
      )}
    </div>
  );
}

// ---- Quick detail panel for selected catalog train -------------------------

function QuickDetail({ train }: { train: TrainCatalogEntry }) {
  const eta = computeSimpleETA(train);
  const delayColor = eta.delayMin > 30 ? 'var(--red)' : eta.delayMin > 10 ? 'var(--amber)' : 'var(--green)';

  return (
    <div className="card mb-16 anim-fadein" style={{ borderLeft: '3px solid var(--blue-accent)' }}>
      <div className="card-header" style={{ background: 'var(--navy)', color: 'white', margin: -1, borderRadius: '6px 6px 0 0' }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="text-mono" style={{ fontSize: 16, fontWeight: 700 }}>{train.number}</span>
            <span className={`badge ${TYPE_CLS[train.trainType] ?? 'badge-gray'}`}>{train.trainType}</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{train.name}</div>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 1 }}>{train.origin} → {train.destination} · {train.distanceKm} km</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, opacity: 0.6 }}>Predicted ETA</div>
          <div className="text-mono" style={{ fontSize: 22, fontWeight: 700, color: delayColor }}>{eta.predictedArrival}</div>
          <div style={{ fontSize: 11, color: delayColor, fontWeight: 600 }}>
            {eta.delayMin > 0 ? `+${eta.delayMin} min delay` : 'On Time'}
          </div>
        </div>
      </div>
      <div className="card-body">
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            ['Scheduled Dep.',  train.scheduledDeparture],
            ['Scheduled Arr.',  train.scheduledArrival],
            ['Current Speed',   `${train.currentSpeed} km/h`],
            ['Distance Left',   `${train.distanceRemaining} km`],
            ['Days',            train.daysLabel],
          ].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{l}</div>
              <div className="text-mono" style={{ fontSize: 13, fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Station Stops</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
            {train.stationStops.map((stop, i) => (
              <React.Fragment key={stop.code}>
                <div style={{ textAlign: 'center', minWidth: 68 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%', margin: '0 auto 4px',
                    background: i === 0 || i === train.stationStops.length - 1 ? 'var(--navy)' : 'var(--blue-accent)',
                    border: '2px solid white', boxShadow: 'var(--shadow-xs)',
                  }} />
                  <div style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--navy)' }}>{stop.code}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{stop.scheduledArrival}</div>
                </div>
                {i < train.stationStops.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: 'var(--border)', minWidth: 20 }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Overview Page
// ============================================================

export default function OverviewPage() {
  const { state } = useAppState();
  const { trains, simState, prediction, sections, events, speedHistory, delayHistory } = state;
  const simTrain = trains.find(t => t.id === simState.selectedTrainId);

  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null);
  const selectedCatalogTrain = selectedCatalogId ? ALL_TRAINS.find(t => t.id === selectedCatalogId) ?? null : null;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Fleet Overview</h1>
        <p className="page-subtitle">
          Real-time fleet monitoring across {ALL_TRAINS.length} coaching trains.
          Click any train row for quick details. Simulation data is synthetic.
        </p>
      </div>

      {/* Fleet stats */}
      <FleetStats />

      {/* Live simulation strip */}
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
              <div className="card-subtitle">
                {simTrain.origin} → {simTrain.destination} · Active simulation ticking every 3s
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              {[
                { l: 'Speed',    v: `${simTrain.currentSpeed} km/h` },
                { l: 'Delay',    v: `${simTrain.currentDelay > 0 ? '+' : ''}${simTrain.currentDelay} min`,
                  c: simTrain.currentDelay > 10 ? 'var(--red)' : 'var(--green)' },
                { l: 'Pred. ETA', v: prediction?.destinationETA ?? '—', c: 'var(--blue-accent)' },
                { l: 'Dist Left', v: `${Math.round(simTrain.distanceRemaining)} km` },
              ].map(({ l, v, c }) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{l}</div>
                  <div className="text-mono" style={{ fontSize: 14, fontWeight: 700, color: c ?? 'var(--text-primary)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: '0 16px 12px' }}>
            <RouteVisualization train={simTrain} sections={sections} events={events} />
          </div>
        </div>
      )}

      {/* Live speed + delay charts for simulated train */}
      {simState.isRunning && (speedHistory.length > 1 || delayHistory.length > 1) && (
        <div className="two-col mb-16">
          <div className="card anim-fadein">
            <div className="card-header"><div className="card-title">Live Speed</div><div className="card-subtitle">km/h · simulated train</div></div>
            <div className="card-body">
              <SpeedChart history={speedHistory} speedRestriction={simState.speedRestriction} />
            </div>
          </div>
          <div className="card anim-fadein">
            <div className="card-header"><div className="card-title">Live Delay</div><div className="card-subtitle">minutes · simulated train</div></div>
            <div className="card-body">
              <DelayChart history={delayHistory} />
            </div>
          </div>
        </div>
      )}

      {/* Selected train quick detail */}
      {selectedCatalogTrain && (
        <QuickDetail train={selectedCatalogTrain} />
      )}

      {/* Fleet table */}
      <FleetTable selectedId={selectedCatalogId} onSelect={setSelectedCatalogId} />

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', padding: '12px 0 8px', marginTop: 8, borderTop: '1px solid var(--border-light)' }}>
        SENRAIL · RUNTIME REBELS · Smart India Hackathon 2026 · PS SIH26028<br />
        All fleet data is <strong>synthetic</strong> and for prototype demonstration only.
      </div>
    </div>
  );
}
