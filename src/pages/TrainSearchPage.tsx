// ============================================================
// SENRAIL — Train Search Page
// Search by train number/name, date, time. Shows ETA details,
// corridor visualization, and network map.
// ============================================================

import React, { useState, useMemo } from 'react';
import { Search, Train, MapPin, Clock, Calendar, ChevronDown, ChevronUp, X } from 'lucide-react';
import { ALL_TRAINS, computeSimpleETA, type TrainCatalogEntry } from '../data/staticData';
import NetworkMap, { TRAIN_ROUTES } from '../components/NetworkMap';

// ---- Day of week helpers ---------------------------------------------------

const DAY_NAMES = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getJsDayOfWeek(dateStr: string): number {
  // Returns 1-7 (Mon-Sun) from a YYYY-MM-DD string
  const d = new Date(dateStr);
  return d.getDay() === 0 ? 7 : d.getDay();
}

// ---- Train type badge colors -----------------------------------------------

const TYPE_COLORS: Record<string, string> = {
  Rajdhani: 'badge-red',
  Shatabdi: 'badge-blue',
  Duronto: 'badge-red',
  Express: 'badge-gray',
  Superfast: 'badge-amber',
  Passenger: 'badge-gray',
};

// ---- Status color -----------------------------------------------------------

function statusColor(status: string): string {
  if (status === 'Running') return 'badge-green';
  if (status === 'Delayed') return 'badge-red';
  if (status === 'Halted') return 'badge-amber';
  return 'badge-gray';
}

// ---- Corridor visualization ------------------------------------------------

interface CorridorProps {
  stops: TrainCatalogEntry['stationStops'];
  currentStationCode?: string;
  delayMinutes: number;
}

function CorridorVisualization({ stops, currentStationCode, delayMinutes }: CorridorProps) {
  return (
    <div style={{ overflowX: 'auto', padding: '8px 0 12px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: stops.length * 120, gap: 0 }}>
        {stops.map((stop, i) => {
          const isPassed = i < stops.indexOf(stops.find(s => s.code === currentStationCode) ?? stops[0]);
          const isCurrent = stop.code === currentStationCode;
          const isLast = i === stops.length - 1;
          const isFirst = i === 0;

          return (
            <div key={stop.code} style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
              {/* Station + time */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 80 }}>
                {/* Circle node */}
                <div style={{
                  width: isCurrent ? 16 : 12, height: isCurrent ? 16 : 12,
                  borderRadius: '50%',
                  background: isCurrent ? 'var(--blue-accent)' : isPassed ? 'var(--green)' : 'var(--border)',
                  border: isCurrent ? '3px solid var(--navy)' : '2px solid white',
                  boxShadow: isCurrent ? '0 0 0 3px rgba(29,111,165,0.25)' : 'var(--shadow-xs)',
                  transition: 'all 0.3s ease',
                  marginTop: 4,
                }} />
                {/* Station code */}
                <div style={{
                  fontSize: 11, fontWeight: 700,
                  color: isCurrent ? 'var(--blue-accent)' : isPassed ? 'var(--green)' : 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {stop.code}
                </div>
                {/* Station name */}
                <div style={{
                  fontSize: 10, color: 'var(--text-secondary)', textAlign: 'center',
                  lineHeight: 1.2, maxWidth: 76,
                }}>
                  {stop.name}
                </div>
                {/* Scheduled time */}
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {stop.scheduledArrival}
                </div>
                {/* Predicted time for destination */}
                {isLast && delayMinutes !== 0 && (
                  <div style={{
                    fontSize: 10, fontWeight: 600,
                    color: delayMinutes > 0 ? 'var(--red)' : 'var(--green)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {computeSimpleETA({ scheduledArrival: stop.scheduledArrival } as TrainCatalogEntry, delayMinutes).predictedArrival}
                  </div>
                )}
              </div>

              {/* Connector line (not after last) */}
              {!isLast && (
                <div style={{
                  flex: 1, height: 3,
                  background: isPassed ? 'var(--green)' : 'var(--border)',
                  marginTop: 10, borderRadius: 2,
                  position: 'relative', minWidth: 40,
                }}>
                  {/* Train icon on current segment */}
                  {isCurrent && (
                    <div style={{
                      position: 'absolute', right: '30%', top: -8,
                      fontSize: 14, animation: 'trainMove 1.5s ease-in-out infinite',
                    }}>🚆</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Train Result Card -----------------------------------------------------

interface TrainCardProps {
  train: TrainCatalogEntry;
  isSelected: boolean;
  onSelect: () => void;
  eta: { predictedArrival: string; delayMin: number };
}

function TrainResultCard({ train, isSelected, onSelect, eta }: TrainCardProps) {
  const delayColor = eta.delayMin > 30 ? 'var(--red)' : eta.delayMin > 10 ? 'var(--amber)' : 'var(--green)';

  return (
    <div
      className={`train-result-card${isSelected ? ' selected' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      onKeyDown={e => e.key === 'Enter' && onSelect()}
    >
      <div className="flex-between mb-6">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="text-mono" style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>
            {train.number}
          </span>
          <span className={`badge ${TYPE_COLORS[train.trainType] ?? 'badge-gray'}`}>
            {train.trainType}
          </span>
          <span className={`badge ${statusColor(train.status)}`}>
            {train.status}
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{train.daysLabel}</div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{train.name}</div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', fontSize: 12, color: 'var(--text-secondary)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={11} /> {train.origin}
        </span>
        <span>→</span>
        <span>{train.destination}</span>
        <span style={{ marginLeft: 4 }}>·</span>
        <span>{train.distanceKm} km</span>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Departure</div>
          <div className="text-mono" style={{ fontSize: 12, fontWeight: 600 }}>{train.scheduledDeparture}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Scheduled Arrival</div>
          <div className="text-mono" style={{ fontSize: 12, fontWeight: 600 }}>{train.scheduledArrival}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Predicted ETA</div>
          <div className="text-mono" style={{ fontSize: 13, fontWeight: 700, color: delayColor }}>{eta.predictedArrival}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Delay</div>
          <div className="text-mono" style={{ fontSize: 12, fontWeight: 700, color: delayColor }}>
            {eta.delayMin > 0 ? '+' : ''}{eta.delayMin} min
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Speed</div>
          <div className="text-mono" style={{ fontSize: 12 }}>{train.currentSpeed} km/h</div>
        </div>
      </div>
    </div>
  );
}

// ---- Train Detail Panel ----------------------------------------------------

interface DetailPanelProps {
  train: TrainCatalogEntry;
  eta: { predictedArrival: string; delayMin: number };
  onClose: () => void;
}

function TrainDetailPanel({ train, eta, onClose }: DetailPanelProps) {
  const routeStationCodes = (TRAIN_ROUTES[train.id] ?? []);
  const currentStationCode = train.stationStops[Math.floor(train.stationStops.length / 2)]?.code;
  const delayColor = eta.delayMin > 30 ? 'var(--red)' : eta.delayMin > 10 ? 'var(--amber)' : 'var(--green)';

  return (
    <div className="train-detail-panel anim-fadein">
      {/* Header */}
      <div className="detail-header">
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
            <span className="text-mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)' }}>
              {train.number}
            </span>
            <span className={`badge ${TYPE_COLORS[train.trainType] ?? 'badge-gray'}`}>{train.trainType}</span>
            <span className={`badge ${statusColor(train.status)}`}>{train.status}</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{train.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            {train.origin} → {train.destination} · {train.distanceKm} km · {train.daysLabel}
          </div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={onClose} aria-label="Close detail">
          <X size={13} /> Close
        </button>
      </div>

      {/* ETA Summary row */}
      <div className="detail-eta-row">
        {[
          { label: 'Scheduled Dep.', value: train.scheduledDeparture, mono: true },
          { label: 'Scheduled Arr.', value: train.scheduledArrival, mono: true },
          { label: 'Predicted ETA', value: eta.predictedArrival, mono: true, color: delayColor, large: true },
          { label: 'Current Delay', value: `${eta.delayMin > 0 ? '+' : ''}${eta.delayMin} min`, mono: true, color: delayColor },
          { label: 'Current Speed', value: `${train.currentSpeed} km/h`, mono: true },
          { label: 'Distance Left', value: `${train.distanceRemaining} km`, mono: true },
        ].map(({ label, value, mono, color, large }) => (
          <div key={label} style={{ textAlign: 'center', padding: '0 12px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2, whiteSpace: 'nowrap' }}>{label}</div>
            <div style={{
              fontSize: large ? 20 : 14, fontWeight: 700,
              fontFamily: mono ? 'var(--font-mono)' : 'inherit',
              color: color ?? 'var(--text-primary)',
            }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Corridor visualization */}
      <div className="card mb-12">
        <div className="card-header">
          <div className="card-title">Route Corridor</div>
          <div className="card-subtitle">{train.stationStops.length} stops · Simulated data</div>
        </div>
        <div className="card-body">
          <CorridorVisualization
            stops={train.stationStops}
            currentStationCode={currentStationCode}
            delayMinutes={eta.delayMin}
          />
        </div>
      </div>

      {/* Map + Station table */}
      <div className="two-col mb-12">
        {/* Network Map */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Network Map</div>
            <div className="card-subtitle">Schematic · Not geographically accurate</div>
          </div>
          <div className="card-body" style={{ padding: '8px' }}>
            <NetworkMap
              highlightTrainId={train.id}
              currentStationCode={currentStationCode}
              compact
            />
          </div>
        </div>

        {/* Station-by-station ETA table */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Station-wise Schedule</div>
            <div className="card-subtitle">Predicted vs scheduled</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Station</th>
                  <th>Code</th>
                  <th>Scheduled</th>
                  <th>Predicted</th>
                  <th>Delay</th>
                </tr>
              </thead>
              <tbody>
                {train.stationStops.map((stop, i) => {
                  const isOrigin = i === 0;
                  const isDestination = i === train.stationStops.length - 1;
                  const isCurr = stop.code === currentStationCode;
                  const delayForStop = isOrigin ? 0 : Math.round(eta.delayMin * (stop.distanceFromOrigin / train.distanceKm));
                  const [h, m] = stop.scheduledArrival.split(':').map(Number);
                  const predMin = h * 60 + m + delayForStop;
                  const ph = Math.floor(predMin / 60) % 24;
                  const pm = predMin % 60;
                  const pred = `${String(ph).padStart(2,'0')}:${String(pm).padStart(2,'0')}`;
                  const dc = delayForStop > 20 ? 'var(--red)' : delayForStop > 5 ? 'var(--amber)' : 'var(--green)';
                  return (
                    <tr key={stop.code} className={isCurr ? 'selected' : ''}>
                      <td>
                        <div style={{ fontSize: 12, fontWeight: isCurr || isDestination ? 600 : 400 }}>
                          {stop.name}
                          {isOrigin && <span className="badge badge-gray" style={{ marginLeft: 4, fontSize: 9 }}>Origin</span>}
                          {isDestination && <span className="badge badge-blue" style={{ marginLeft: 4, fontSize: 9 }}>Destination</span>}
                          {isCurr && !isOrigin && !isDestination && <span className="badge badge-amber" style={{ marginLeft: 4, fontSize: 9 }}>Current</span>}
                        </div>
                      </td>
                      <td><code className="text-mono" style={{ fontSize: 11, color: 'var(--blue-accent)' }}>{stop.code}</code></td>
                      <td className="text-mono" style={{ fontSize: 12 }}>{stop.scheduledArrival}</td>
                      <td className="text-mono" style={{ fontSize: 12, fontWeight: 600, color: isOrigin ? 'inherit' : dc }}>{isOrigin ? '—' : pred}</td>
                      <td style={{ fontSize: 12, fontWeight: 600, color: dc }}>
                        {isOrigin ? '—' : `+${delayForStop} min`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Simulated data note */}
      <div style={{
        padding: '8px 12px', background: 'var(--bg)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', fontSize: 11, color: 'var(--text-muted)',
        textAlign: 'center',
      }}>
        ⚠ All data shown is <strong>synthetic and simulated</strong> — for demonstration only.
        Delays, speeds, and ETAs are not real operational data.
      </div>
    </div>
  );
}

// ============================================================
// Main Search Page
// ============================================================

export default function TrainSearchPage() {
  const [query, setQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterTimeFrom, setFilterTimeFrom] = useState('');
  const [filterTimeTo, setFilterTimeTo] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // ---- Filter logic --------------------------------------------------------

  const results = useMemo(() => {
    if (!hasSearched && !query && !filterDate) return [];

    return ALL_TRAINS.filter(train => {
      // Text match
      const q = query.toLowerCase().trim();
      if (q) {
        const match =
          train.number.includes(q) ||
          train.name.toLowerCase().includes(q) ||
          train.origin.toLowerCase().includes(q) ||
          train.destination.toLowerCase().includes(q) ||
          train.originCode.toLowerCase().includes(q) ||
          train.destinationCode.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Date filter (day of week)
      if (filterDate) {
        const dow = getJsDayOfWeek(filterDate);
        if (!train.daysOfWeek.includes(dow)) return false;
      }

      // Departure time filter
      if (filterTimeFrom) {
        if (train.scheduledDeparture < filterTimeFrom) return false;
      }
      if (filterTimeTo) {
        if (train.scheduledDeparture > filterTimeTo) return false;
      }

      return true;
    });
  }, [query, filterDate, filterTimeFrom, filterTimeTo, hasSearched]);

  const selected = selectedId ? ALL_TRAINS.find(t => t.id === selectedId) ?? null : null;
  const selectedEta = selected ? computeSimpleETA(selected) : null;

  function handleSearch() {
    setHasSearched(true);
    setSelectedId(null);
  }

  function handleClear() {
    setQuery(''); setFilterDate(''); setFilterTimeFrom(''); setFilterTimeTo('');
    setHasSearched(false); setSelectedId(null);
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Train Search</h1>
        <p className="page-subtitle">
          Search by train number, name, route, or date. Select a train to see full ETA details, network map, and corridor.
        </p>
      </div>

      {/* Search form */}
      <div className="card mb-16 anim-fadein">
        <div className="card-header">
          <div className="card-title">Search Trains</div>
          <div className="card-subtitle">{ALL_TRAINS.length} trains in synthetic dataset</div>
        </div>
        <div className="card-body">
          <div className="search-form-grid">
            {/* Text search */}
            <div className="search-field" style={{ flex: 2 }}>
              <label className="search-label" htmlFor="search-query">
                <Search size={12} /> Train Number / Name / Station
              </label>
              <input
                id="search-query"
                className="search-input"
                type="text"
                placeholder="e.g. 12627, Rajdhani, Bengaluru, MAS…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                autoComplete="off"
              />
            </div>

            {/* Date */}
            <div className="search-field">
              <label className="search-label" htmlFor="search-date">
                <Calendar size={12} /> Travel Date
              </label>
              <input
                id="search-date"
                className="search-input"
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
              />
            </div>

            {/* Time from */}
            <div className="search-field">
              <label className="search-label" htmlFor="search-time-from">
                <Clock size={12} /> Departure From
              </label>
              <input
                id="search-time-from"
                className="search-input"
                type="time"
                value={filterTimeFrom}
                onChange={e => setFilterTimeFrom(e.target.value)}
              />
            </div>

            {/* Time to */}
            <div className="search-field">
              <label className="search-label" htmlFor="search-time-to">
                <Clock size={12} /> Departure To
              </label>
              <input
                id="search-time-to"
                className="search-input"
                type="time"
                value={filterTimeTo}
                onChange={e => setFilterTimeTo(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-primary" onClick={handleSearch} id="btn-search">
              <Search size={13} /> Search Trains
            </button>
            {(query || filterDate || filterTimeFrom || filterTimeTo) && (
              <button className="btn btn-outline" onClick={handleClear}>
                <X size={13} /> Clear
              </button>
            )}
          </div>

          {filterDate && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
              Filtering for:{' '}
              <strong style={{ color: 'var(--text-secondary)' }}>
                {new Date(filterDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </strong>
              {' '}(trains running on {DAY_NAMES[getJsDayOfWeek(filterDate)]})
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="anim-fadein">
          <div style={{ marginBottom: 10, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
            {results.length > 0 ? (
              <>{results.length} train{results.length !== 1 ? 's' : ''} found — click a card to see full details</>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>No trains match your search criteria.</span>
            )}
          </div>

          <div className="train-results-grid">
            {results.map(train => {
              const eta = computeSimpleETA(train);
              return (
                <TrainResultCard
                  key={train.id}
                  train={train}
                  isSelected={selectedId === train.id}
                  onSelect={() => setSelectedId(selectedId === train.id ? null : train.id)}
                  eta={eta}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* All trains browse (before search) */}
      {!hasSearched && (
        <div className="anim-fadein">
          <div style={{ marginBottom: 10, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
            All trains in dataset — click to see details
          </div>
          <div className="train-results-grid">
            {ALL_TRAINS.slice(0, 20).map(train => {
              const eta = computeSimpleETA(train);
              return (
                <TrainResultCard
                  key={train.id}
                  train={train}
                  isSelected={selectedId === train.id}
                  onSelect={() => setSelectedId(selectedId === train.id ? null : train.id)}
                  eta={eta}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Detail panel */}
      {selected && selectedEta && (
        <div style={{ marginTop: 24 }}>
          <TrainDetailPanel
            train={selected}
            eta={selectedEta}
            onClose={() => setSelectedId(null)}
          />
        </div>
      )}
    </div>
  );
}
