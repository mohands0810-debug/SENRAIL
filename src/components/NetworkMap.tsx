// ============================================================
// SENRAIL — Network Map (SVG Schematic)
// Shows all train routes on a schematic railway diagram.
// NOTE: Schematic layout — not geographically accurate.
// ============================================================

import React from 'react';

// ---- Station coordinate definitions ----------------------------------------

interface MapStation {
  code: string;
  label: string;
  x: number;
  y: number;
  isJunction: boolean;
  zone: string;
}

const STATIONS: MapStation[] = [
  // North
  { code: 'NZM',  label: 'H. Nizamuddin\n(Delhi)',   x: 270, y: 55,  isJunction: true,  zone: 'NR' },
  // Central belt
  { code: 'BPL',  label: 'Bhopal',           x: 215, y: 175, isJunction: true,  zone: 'WCR' },
  { code: 'NGP',  label: 'Nagpur',            x: 340, y: 255, isJunction: true,  zone: 'CR' },
  { code: 'SUR',  label: 'Solapur',           x: 175, y: 310, isJunction: false, zone: 'CR' },
  // Mumbai
  { code: 'CSMT', label: 'Mumbai CSMT',       x: 90,  y: 385, isJunction: true,  zone: 'CR' },
  { code: 'BCT',  label: 'Mumbai Central',    x: 78,  y: 370, isJunction: false, zone: 'WR' },
  // Deccan plateau
  { code: 'SC',   label: 'Secunderabad',      x: 345, y: 390, isJunction: true,  zone: 'SCR' },
  // South
  { code: 'MAS',  label: 'Chennai Central',   x: 465, y: 495, isJunction: true,  zone: 'SR' },
  { code: 'KPD',  label: 'Katpadi',           x: 418, y: 458, isJunction: true,  zone: 'SR' },
  { code: 'JTJ',  label: 'Jolarpettai',       x: 390, y: 432, isJunction: true,  zone: 'SR' },
  { code: 'BWT',  label: 'Bangarapet',        x: 372, y: 460, isJunction: false, zone: 'SWR' },
  { code: 'KJM',  label: 'Krishnarajapuram',  x: 356, y: 474, isJunction: false, zone: 'SWR' },
  { code: 'SBC',  label: 'Bengaluru City',    x: 340, y: 492, isJunction: true,  zone: 'SWR' },
  { code: 'MYS',  label: 'Mysuru',            x: 296, y: 540, isJunction: false, zone: 'SWR' },
  { code: 'ASK',  label: 'Arsikere',          x: 296, y: 500, isJunction: true,  zone: 'SWR' },
  { code: 'DVG',  label: 'Davangere',         x: 262, y: 472, isJunction: false, zone: 'SWR' },
  { code: 'UBL',  label: 'Hubballi',          x: 205, y: 443, isJunction: true,  zone: 'SWR' },
  { code: 'CBE',  label: 'Coimbatore',        x: 338, y: 572, isJunction: true,  zone: 'SR' },
  { code: 'ERS',  label: 'Ernakulam',         x: 302, y: 630, isJunction: false, zone: 'SR' },
  { code: 'TVC',  label: 'Trivandrum',        x: 320, y: 688, isJunction: false, zone: 'SR' },
];

// ---- Background railway corridors ------------------------------------------

type Corridor = string[]; // station codes

const CORRIDORS: Corridor[] = [
  // Western main line
  ['NZM', 'BPL', 'SUR', 'CSMT'],
  // Mumbai Central branch
  ['BCT', 'SUR'],
  // Central main line (Delhi-Chennai)
  ['NZM', 'BPL', 'NGP', 'SC', 'MAS'],
  // Deccan plateau to Bengaluru
  ['CSMT', 'SUR', 'SC'],
  ['SC', 'SBC'],
  // Chennai-Bengaluru corridor
  ['MAS', 'KPD', 'JTJ', 'BWT', 'KJM', 'SBC'],
  // Mysuru branch
  ['SBC', 'ASK', 'MYS'],
  // Bengaluru-Hubli
  ['SBC', 'ASK', 'DVG', 'UBL'],
  // South coast
  ['MAS', 'CBE', 'ERS', 'TVC'],
  // Bengaluru-CBE
  ['SBC', 'CBE'],
  // SC-CBE
  ['SC', 'CBE'],
];

// ---- Route definitions per train -------------------------------------------

export const TRAIN_ROUTES: Record<string, string[]> = {
  '12627': ['MAS', 'KPD', 'JTJ', 'BWT', 'KJM', 'SBC'],
  '12431': ['NZM', 'BPL', 'NGP', 'SC', 'MAS', 'CBE', 'ERS', 'TVC'],
  '12007': ['MYS', 'ASK', 'SBC', 'BWT', 'JTJ', 'KPD', 'MAS'],
  '11013': ['CSMT', 'SUR', 'SC', 'CBE'],
  '12245': ['BCT', 'SUR', 'SC', 'SBC'],
  '16591': ['SBC', 'ASK', 'DVG', 'UBL'],
};

// ---- Helper: get station by code -------------------------------------------

function getStation(code: string): MapStation | undefined {
  return STATIONS.find(s => s.code === code);
}

// ---- Route segment highlight -----------------------------------------------

function routeToSegments(route: string[]): Array<[MapStation, MapStation]> {
  const segs: Array<[MapStation, MapStation]> = [];
  for (let i = 0; i < route.length - 1; i++) {
    const a = getStation(route[i]);
    const b = getStation(route[i + 1]);
    if (a && b) segs.push([a, b]);
  }
  return segs;
}

// ---- Component props -------------------------------------------------------

interface NetworkMapProps {
  highlightTrainId?: string;       // e.g. '12627'
  currentSection?: string;         // current section code for position indicator
  currentStationCode?: string;     // e.g. 'BWT'
  compact?: boolean;               // if true, render smaller
}

export default function NetworkMap({
  highlightTrainId,
  currentStationCode,
  compact = false,
}: NetworkMapProps) {
  const W = compact ? 420 : 560;
  const H = compact ? 530 : 710;
  const scale = compact ? 0.75 : 1;

  const highlightRoute = highlightTrainId ? (TRAIN_ROUTES[highlightTrainId] ?? []) : [];
  const highlightSegments = routeToSegments(highlightRoute);
  const highlightSet = new Set<string>();
  highlightRoute.forEach(c => highlightSet.add(c));

  // Is a corridor segment part of the highlight route?
  function isHighlightedSegment(a: string, b: string): boolean {
    for (const [sa, sb] of highlightSegments) {
      if ((sa.code === a && sb.code === b) || (sa.code === b && sb.code === a)) return true;
    }
    return false;
  }

  return (
    <div style={{ width: '100%', overflow: 'hidden', borderRadius: 'var(--radius)' }}>
      <svg
        viewBox={`0 0 560 710`}
        style={{ width: '100%', maxWidth: W, display: 'block', margin: '0 auto' }}
        role="img"
        aria-label="SENRAIL Railway Network Schematic Diagram"
      >
        {/* Background */}
        <rect width={560} height={710} fill="#f0f4f8" rx={8} />

        {/* Title */}
        <text x={12} y={22} fontSize={11} fontWeight={600} fill="#5a6478" fontFamily="Inter,sans-serif">
          Railway Network — Schematic Diagram (Synthetic Prototype Data)
        </text>

        {/* ---- Background corridors ---- */}
        {CORRIDORS.map((corridor, ci) => {
          const pts: string[] = [];
          for (let i = 0; i < corridor.length - 1; i++) {
            const a = corridor[i];
            const b = corridor[i + 1];
            const sa = getStation(a);
            const sb = getStation(b);
            if (!sa || !sb) continue;
            const highlighted = isHighlightedSegment(a, b);
            pts.push(`${sa.x},${sa.y} ${sb.x},${sb.y}`);
          }
          return null; // render individually below for proper highlighting
        })}

        {/* Draw each corridor segment individually */}
        {CORRIDORS.map((corridor) =>
          corridor.slice(0, -1).map((code, i) => {
            const a = code;
            const b = corridor[i + 1];
            const sa = getStation(a);
            const sb = getStation(b);
            if (!sa || !sb) return null;
            const hl = isHighlightedSegment(a, b);
            return (
              <line
                key={`seg-${a}-${b}`}
                x1={sa.x} y1={sa.y} x2={sb.x} y2={sb.y}
                stroke={hl ? '#1d6fa5' : '#c8d0dc'}
                strokeWidth={hl ? 3.5 : 1.5}
                strokeLinecap="round"
                opacity={hl ? 1 : 0.6}
              />
            );
          })
        )}

        {/* Highlighted route overlay (drawn on top, dashed animation) */}
        {highlightSegments.map(([sa, sb], i) => (
          <line
            key={`hl-${i}`}
            x1={sa.x} y1={sa.y} x2={sb.x} y2={sb.y}
            stroke="rgba(29,111,165,0.18)"
            strokeWidth={10}
            strokeLinecap="round"
          />
        ))}

        {/* ---- Station nodes ---- */}
        {STATIONS.map(st => {
          const inRoute = highlightSet.has(st.code);
          const isCurrent = st.code === currentStationCode;
          return (
            <g key={st.code}>
              {/* Outer glow for highlighted stations */}
              {inRoute && (
                <circle cx={st.x} cy={st.y} r={st.isJunction ? 12 : 9}
                  fill="rgba(29,111,165,0.12)" />
              )}
              {/* Station circle */}
              <circle
                cx={st.x} cy={st.y}
                r={isCurrent ? 8 : st.isJunction ? 6 : 4}
                fill={
                  isCurrent ? '#e35d00'
                  : inRoute ? '#1d6fa5'
                  : st.isJunction ? '#8d97a8'
                  : '#b0bbc9'
                }
                stroke={inRoute ? '#fff' : 'none'}
                strokeWidth={2}
              />
              {/* Pulsing animation for current station */}
              {isCurrent && (
                <>
                  <circle cx={st.x} cy={st.y} r={14} fill="none"
                    stroke="#e35d00" strokeWidth={1.5} opacity={0.4}>
                    <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                  </circle>
                </>
              )}
            </g>
          );
        })}

        {/* ---- Station Labels ---- */}
        {STATIONS.map(st => {
          const inRoute = highlightSet.has(st.code);
          // Determine label offset based on position
          const labelX = st.x > 300 ? st.x + 10 : st.x - 10;
          const anchor = st.x > 300 ? 'start' : 'end';
          const lines = st.label.split('\n');
          return (
            <g key={`lbl-${st.code}`}>
              {lines.map((line, li) => (
                <text
                  key={li}
                  x={labelX}
                  y={st.y - 2 + li * 11}
                  fontSize={inRoute ? 10 : 9}
                  fontWeight={inRoute ? 600 : 400}
                  fill={inRoute ? '#0f2044' : '#8d97a8'}
                  textAnchor={anchor}
                  fontFamily="Inter,sans-serif"
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}

        {/* ---- Legend ---- */}
        <rect x={12} y={670} width={180} height={32} fill="white" rx={4} opacity={0.85} />
        <circle cx={24} cy={682} r={4} fill="#1d6fa5" />
        <text x={32} y={686} fontSize={9} fill="#5a6478" fontFamily="Inter,sans-serif">Selected route</text>
        <circle cx={24} cy={696} r={4} fill="#e35d00" />
        <text x={32} y={700} fontSize={9} fill="#5a6478" fontFamily="Inter,sans-serif">Current position</text>
        <circle cx={105} cy={682} r={4} fill="#8d97a8" />
        <text x={113} y={686} fontSize={9} fill="#5a6478" fontFamily="Inter,sans-serif">Junction</text>
        <line x1={105} y1={696} x2={125} y2={696} stroke="#c8d0dc" strokeWidth={1.5} />
        <text x={129} y={700} fontSize={9} fill="#5a6478" fontFamily="Inter,sans-serif">Corridor</text>
      </svg>
    </div>
  );
}
