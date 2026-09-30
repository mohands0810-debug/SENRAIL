// ============================================================
// SENRAIL — Route Conditions Page
// Synthetic track/section conditions for all 100 train routes.
// ============================================================

import React, { useState, useMemo } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Search, MapPin } from 'lucide-react';
import { useAppState } from '../store/AppContext';
import { ALL_TRAINS } from '../data/staticData';
import type { SectionCondition, EventStatus, OperationalEvent } from '../types';

// ---- Deterministic "current condition" per route/train ---------------------
// We use a seeded hash of the train ID to assign realistic conditions.

type ConditionEntry = {
  trainId: string;
  trainNumber: string;
  trainName: string;
  routeLabel: string;
  sectionCode: string;
  condition: SectionCondition;
  weather: string;
  congestion: string;
  activeEvent: string | null;
  etaImpact: number;
  speedRestriction: number | null;
};

function hashStr(s: string): number {
  let h = 0xdeadbeef;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 2654435761);
  }
  return h >>> 0;
}

const CONDITIONS: SectionCondition[] = ['Normal', 'Normal', 'Normal', 'Normal', 'Congested', 'Restricted', 'Weather Affected', 'Signal Hold'];
const WEATHERS = ['Clear', 'Clear', 'Clear', 'Light Rain', 'Light Rain', 'Heavy Rain', 'Fog'];
const CONGESTIONS = ['Low', 'Low', 'Moderate', 'Moderate', 'Moderate', 'High'];
const EVENTS: Array<string | null> = [null, null, null, 'Track Maintenance', 'Congestion', 'Speed Restriction', 'Signal Hold', 'Weather'];

function buildConditions(): ConditionEntry[] {
  return ALL_TRAINS.map(train => {
    const h = hashStr(train.id + train.currentSection);
    const condition   = CONDITIONS[h % CONDITIONS.length];
    const weather     = WEATHERS[h % WEATHERS.length];
    const congestion  = CONGESTIONS[h % CONGESTIONS.length];
    const eventRaw    = EVENTS[h % EVENTS.length];
    const etaImpact   = condition === 'Normal' ? 0 : (h % 25) + 3;
    const speedRes    = eventRaw === 'Speed Restriction' ? [30, 45, 60, 75][(h >> 4) % 4] : null;

    return {
      trainId:     train.id,
      trainNumber: train.number,
      trainName:   train.name,
      routeLabel:  `${train.originCode} → ${train.destinationCode}`,
      sectionCode: train.currentSection,
      condition,
      weather,
      congestion,
      activeEvent: eventRaw,
      etaImpact,
      speedRestriction: speedRes,
    };
  });
}

const ALL_CONDITIONS = buildConditions();

// ---- Badge components ------------------------------------------------------

function CondBadge({ c }: { c: SectionCondition }) {
  const MAP: Record<SectionCondition, string> = {
    Normal: 'badge-green', Congested: 'badge-red', Restricted: 'badge-amber',
    'Weather Affected': 'badge-blue', 'Signal Hold': 'badge-amber',
  };
  return <span className={`badge ${MAP[c]}`}>{c}</span>;
}

function WeatherBadge({ w }: { w: string }) {
  const c = w === 'Heavy Rain' ? 'badge-red' : w === 'Light Rain' ? 'badge-amber' : w === 'Fog' ? 'badge-amber' : 'badge-green';
  return <span className={`badge ${c}`}>{w}</span>;
}

function CongBadge({ c }: { c: string }) {
  const cls = c === 'High' ? 'badge-red' : c === 'Moderate' ? 'badge-amber' : 'badge-green';
  return <span className={`badge ${cls}`}>{c}</span>;
}

// ---- Summary stats ---------------------------------------------------------

function ConditionSummary() {
  const conds = ALL_CONDITIONS;
  const normal   = conds.filter(c => c.condition === 'Normal').length;
  const cong     = conds.filter(c => c.condition === 'Congested').length;
  const restr    = conds.filter(c => c.condition === 'Restricted').length;
  const weather  = conds.filter(c => c.condition === 'Weather Affected').length;
  const signal   = conds.filter(c => c.condition === 'Signal Hold').length;
  const events   = conds.filter(c => c.activeEvent !== null).length;
  const heavyRain= conds.filter(c => c.weather === 'Heavy Rain').length;
  const fogRoutes= conds.filter(c => c.weather === 'Fog').length;

  const tiles = [
    { label: 'Total Sections',    value: conds.length,  color: 'var(--blue-accent)' },
    { label: 'Normal',            value: normal,         color: 'var(--green)'       },
    { label: 'Congested',         value: cong,           color: 'var(--red)'         },
    { label: 'Restricted',        value: restr,          color: 'var(--amber)'       },
    { label: 'Weather Affected',  value: weather,        color: 'var(--amber)'       },
    { label: 'Signal Hold',       value: signal,         color: 'var(--amber)'       },
    { label: 'Active Events',     value: events,         color: events > 0 ? 'var(--red)' : 'var(--green)' },
    { label: 'Heavy Rain Routes', value: heavyRain,      color: 'var(--red)'         },
  ];

  return (
    <div className="stat-grid mb-16">
      {tiles.map(t => (
        <div key={t.label} className="stat-tile anim-fadein">
          <div className="stat-label">{t.label}</div>
          <div className="stat-value mono" style={{ color: t.color }}>{t.value}</div>
        </div>
      ))}
    </div>
  );
}

// ---- Live sim section data -------------------------------------------------

function LiveSimSections() {
  const { state } = useAppState();
  const { sections, events, simState } = state;
  if (sections.length === 0) return null;

  return (
    <div className="card mb-16 anim-fadein" style={{ borderLeft: '3px solid var(--blue-accent)' }}>
      <div className="card-header">
        <div>
          <div className="card-title">
            <span style={{ background: 'var(--red)', color: 'white', padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 700, marginRight: 8 }}>
              LIVE SIM
            </span>
            Simulated Route Sections — Karnataka Express 12627
          </div>
          <div className="card-subtitle">
            Weather: {simState.weatherCondition} · Congestion: {simState.congestionLevel} ·
            Signal hold: {simState.signalDelayMinutes > 0 ? `${simState.signalDelayMinutes} min` : 'None'} ·
            Maintenance: {simState.maintenanceActive ? 'Active' : 'None'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className={`badge ${simState.congestionLevel === 'High' ? 'badge-red' : simState.congestionLevel === 'Moderate' ? 'badge-amber' : 'badge-green'}`}>
            {simState.congestionLevel} Congestion
          </span>
          <span className={`badge ${simState.weatherCondition === 'Heavy Rain' || simState.weatherCondition === 'Fog' ? 'badge-amber' : 'badge-green'}`}>
            {simState.weatherCondition}
          </span>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr><th>Section ID</th><th>Name</th><th>Condition</th><th>Event</th><th>ETA Impact</th><th>Status</th></tr>
          </thead>
          <tbody>
            {sections.map(sec => {
              const secEvents = events.filter(e => e.sectionId === sec.id);
              const evt = secEvents[0];
              return (
                <tr key={sec.id}>
                  <td><code className="text-mono" style={{ fontSize: 11, color: 'var(--blue-accent)' }}>{sec.id}</code></td>
                  <td style={{ fontSize: 12 }}>{sec.name}</td>
                  <td><CondBadge c={sec.condition as SectionCondition} /></td>
                  <td style={{ fontSize: 12 }}>{evt ? evt.type : '—'}</td>
                  <td style={{ fontSize: 12, fontWeight: evt ? 600 : 400, color: evt ? 'var(--red)' : 'var(--text-muted)' }}>
                    {evt ? `+${evt.etaImpactMinutes} min` : '—'}
                  </td>
                  <td>
                    {evt
                      ? <span className={`badge ${evt.status === 'Active' ? 'badge-red' : evt.status === 'Upcoming' ? 'badge-amber' : 'badge-green'}`}>{evt.status}</span>
                      : <span className="badge badge-green">Normal</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Active events */}
      {events.length > 0 && (
        <div className="card-body" style={{ borderTop: '1px solid var(--border)' }}>
          {events.map(evt => (
            <div key={evt.id} style={{ padding: '10px 12px', marginBottom: 8, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', borderLeft: '3px solid var(--amber)' }}>
              <div className="flex-between mb-4">
                <div style={{ fontWeight: 600, fontSize: 13 }}>{evt.type} — {evt.sectionId}</div>
                <span className="badge badge-amber">{evt.status}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{evt.description}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
                <span>Start: {evt.startTime}</span>
                <span>End: {evt.endTime}</span>
                <span style={{ fontWeight: 600, color: 'var(--red)' }}>ETA impact: +{evt.etaImpactMinutes} min</span>
                {evt.speedRestriction && <span>Speed limit: {evt.speedRestriction} km/h</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Main page
// ============================================================

export default function RouteConditionsPage() {
  const [query, setQuery]           = useState('');
  const [condFilter, setCondFilter] = useState('All');
  const [weatherFilter, setWeatherFilter] = useState('All');
  const [page, setPage]             = useState(1);
  const PER_PAGE = 20;

  const CONDITIONS_OPTS = ['All', 'Normal', 'Congested', 'Restricted', 'Weather Affected', 'Signal Hold'];
  const WEATHER_OPTS    = ['All', 'Clear', 'Light Rain', 'Heavy Rain', 'Fog'];

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ALL_CONDITIONS.filter(row => {
      if (q && !row.trainNumber.includes(q) && !row.trainName.toLowerCase().includes(q) &&
          !row.routeLabel.toLowerCase().includes(q) && !row.sectionCode.toLowerCase().includes(q)) return false;
      if (condFilter !== 'All' && row.condition !== condFilter) return false;
      if (weatherFilter !== 'All' && row.weather !== weatherFilter) return false;
      return true;
    });
  }, [query, condFilter, weatherFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Route Conditions</h1>
        <p className="page-subtitle">
          Track conditions, weather, congestion, and operational events across all {ALL_CONDITIONS.length} route sections.
          All section data is synthetic for prototype demonstration.
        </p>
      </div>

      {/* Condition summary stats */}
      <ConditionSummary />

      {/* Live sim sections */}
      <LiveSimSections />

      {/* All sections table */}
      <div className="card anim-fadein">
        <div className="card-header">
          <div>
            <div className="card-title">All Route Sections</div>
            <div className="card-subtitle">{filtered.length} of {ALL_CONDITIONS.length} sections · Synthetic operational data</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, padding: '10px 16px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 2, minWidth: 180 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="search-input" style={{ paddingLeft: 30, height: 34 }}
              placeholder="Train no., name, route, section…"
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(1); }}
            />
          </div>
          <select className="search-input" style={{ flex: 1, minWidth: 150, height: 34 }} value={condFilter} onChange={e => { setCondFilter(e.target.value); setPage(1); }}>
            {CONDITIONS_OPTS.map(o => <option key={o}>{o}</option>)}
          </select>
          <select className="search-input" style={{ flex: 1, minWidth: 130, height: 34 }} value={weatherFilter} onChange={e => { setWeatherFilter(e.target.value); setPage(1); }}>
            {WEATHER_OPTS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" aria-label="Route conditions table">
            <thead>
              <tr>
                <th>Train</th>
                <th>Name</th>
                <th>Route</th>
                <th>Section</th>
                <th>Condition</th>
                <th>Weather</th>
                <th>Congestion</th>
                <th>Active Event</th>
                <th>ETA Impact</th>
                <th>Speed Limit</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map(row => (
                <tr key={row.trainId}>
                  <td>
                    <code className="text-mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue-accent)' }}>
                      {row.trainNumber}
                    </code>
                  </td>
                  <td style={{ fontSize: 11, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.trainName}
                  </td>
                  <td style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={10} style={{ color: 'var(--text-muted)' }} />
                      {row.routeLabel}
                    </span>
                  </td>
                  <td>
                    <code style={{ fontSize: 10, color: 'var(--text-secondary)', background: 'var(--bg)', padding: '2px 5px', borderRadius: 3, border: '1px solid var(--border)' }}>
                      {row.sectionCode}
                    </code>
                  </td>
                  <td><CondBadge c={row.condition} /></td>
                  <td><WeatherBadge w={row.weather} /></td>
                  <td><CongBadge c={row.congestion} /></td>
                  <td style={{ fontSize: 11 }}>
                    {row.activeEvent
                      ? <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{row.activeEvent}</span>
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>
                    }
                  </td>
                  <td style={{ fontSize: 12, fontWeight: row.etaImpact > 0 ? 600 : 400, color: row.etaImpact > 0 ? 'var(--red)' : 'var(--text-muted)' }}>
                    {row.etaImpact > 0 ? `+${row.etaImpact} min` : '—'}
                  </td>
                  <td className="text-mono" style={{ fontSize: 11, color: row.speedRestriction ? 'var(--amber)' : 'var(--text-muted)' }}>
                    {row.speedRestriction ? `${row.speedRestriction} km/h` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '10px 16px', borderTop: '1px solid var(--border-light)' }}>
            <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Page {page} of {totalPages} &nbsp;·&nbsp; {filtered.length} sections
            </span>
            <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next ›</button>
          </div>
        )}
      </div>
    </div>
  );
}
