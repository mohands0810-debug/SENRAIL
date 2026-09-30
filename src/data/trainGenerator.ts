// ============================================================
// SENRAIL — Synthetic Train Generator
// Produces 94 additional TrainCatalogEntry objects.
// NOTE: All data is SYNTHETIC. Not real operational data.
// ============================================================

import type { TrainCatalogEntry } from './staticData';

// ---- Seeded RNG (deterministic per train index) ----------------------------

function mkRng(seed: number) {
  let s = (seed * 1664525 + 1013904223) ^ 0xdeadbeef;
  return () => {
    s ^= s << 13; s ^= s >> 17; s ^= s << 5;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function intRange(min: number, max: number, rng: () => number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function timeAdd(hhmm: string, addMinutes: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = (h * 60 + m + addMinutes + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

// ---- Route templates -------------------------------------------------------

interface RouteTemplate {
  originName: string; originCode: string;
  destName: string;   destCode: string;
  distanceKm: number;
  zone: string;
  stops: Array<{ code: string; name: string; dist: number }>;
}

const ROUTES: RouteTemplate[] = [
  {
    originName: 'Hazrat Nizamuddin', originCode: 'NZM',
    destName: 'Chennai Central',    destCode: 'MAS',
    distanceKm: 2175, zone: 'NR/SR',
    stops: [
      { code: 'NZM', name: 'Hazrat Nizamuddin', dist: 0    },
      { code: 'BPL', name: 'Bhopal Junction',   dist: 704  },
      { code: 'NGP', name: 'Nagpur Junction',   dist: 1084 },
      { code: 'SC',  name: 'Secunderabad',      dist: 1642 },
      { code: 'MAS', name: 'Chennai Central',   dist: 2175 },
    ],
  },
  {
    originName: 'Hazrat Nizamuddin', originCode: 'NZM',
    destName: 'Bengaluru City',      destCode: 'SBC',
    distanceKm: 2444, zone: 'NR/SWR',
    stops: [
      { code: 'NZM', name: 'Hazrat Nizamuddin', dist: 0    },
      { code: 'BPL', name: 'Bhopal Junction',   dist: 704  },
      { code: 'NGP', name: 'Nagpur Junction',   dist: 1084 },
      { code: 'SC',  name: 'Secunderabad',      dist: 1642 },
      { code: 'SBC', name: 'Bengaluru City',    dist: 2444 },
    ],
  },
  {
    originName: 'Hazrat Nizamuddin', originCode: 'NZM',
    destName: 'Thiruvananthapuram',  destCode: 'TVC',
    distanceKm: 3145, zone: 'NR/SR',
    stops: [
      { code: 'NZM', name: 'Hazrat Nizamuddin', dist: 0    },
      { code: 'BPL', name: 'Bhopal Junction',   dist: 704  },
      { code: 'NGP', name: 'Nagpur Junction',   dist: 1084 },
      { code: 'SC',  name: 'Secunderabad',      dist: 1642 },
      { code: 'MAS', name: 'Chennai Central',   dist: 2323 },
      { code: 'ERS', name: 'Ernakulam Jn',      dist: 2980 },
      { code: 'TVC', name: 'Thiruvananthapuram',dist: 3145 },
    ],
  },
  {
    originName: 'Hazrat Nizamuddin', originCode: 'NZM',
    destName: 'Mumbai CSMT',         destCode: 'CSMT',
    distanceKm: 1388, zone: 'NR/CR',
    stops: [
      { code: 'NZM',  name: 'Hazrat Nizamuddin', dist: 0    },
      { code: 'BPL',  name: 'Bhopal Junction',   dist: 704  },
      { code: 'CSMT', name: 'Mumbai CSMT',        dist: 1388 },
    ],
  },
  {
    originName: 'Hazrat Nizamuddin', originCode: 'NZM',
    destName: 'Coimbatore',          destCode: 'CBE',
    distanceKm: 2600, zone: 'NR/SR',
    stops: [
      { code: 'NZM', name: 'Hazrat Nizamuddin', dist: 0    },
      { code: 'BPL', name: 'Bhopal Junction',   dist: 704  },
      { code: 'NGP', name: 'Nagpur Junction',   dist: 1084 },
      { code: 'SC',  name: 'Secunderabad',      dist: 1642 },
      { code: 'CBE', name: 'Coimbatore',         dist: 2600 },
    ],
  },
  {
    originName: 'Hazrat Nizamuddin', originCode: 'NZM',
    destName: 'Secunderabad',        destCode: 'SC',
    distanceKm: 1850, zone: 'NR/SCR',
    stops: [
      { code: 'NZM', name: 'Hazrat Nizamuddin', dist: 0    },
      { code: 'BPL', name: 'Bhopal Junction',   dist: 704  },
      { code: 'NGP', name: 'Nagpur Junction',   dist: 1084 },
      { code: 'SC',  name: 'Secunderabad',      dist: 1850 },
    ],
  },
  {
    originName: 'Hazrat Nizamuddin', originCode: 'NZM',
    destName: 'Ernakulam Junction',  destCode: 'ERS',
    distanceKm: 2975, zone: 'NR/SR',
    stops: [
      { code: 'NZM', name: 'Hazrat Nizamuddin', dist: 0    },
      { code: 'BPL', name: 'Bhopal Junction',   dist: 704  },
      { code: 'NGP', name: 'Nagpur Junction',   dist: 1084 },
      { code: 'SC',  name: 'Secunderabad',      dist: 1642 },
      { code: 'MAS', name: 'Chennai Central',   dist: 2430 },
      { code: 'ERS', name: 'Ernakulam Jn',      dist: 2975 },
    ],
  },
  {
    originName: 'Mumbai CSMT', originCode: 'CSMT',
    destName: 'Chennai Central', destCode: 'MAS',
    distanceKm: 1279, zone: 'CR/SR',
    stops: [
      { code: 'CSMT', name: 'Mumbai CSMT',     dist: 0    },
      { code: 'SC',   name: 'Secunderabad',    dist: 780  },
      { code: 'MAS',  name: 'Chennai Central', dist: 1279 },
    ],
  },
  {
    originName: 'Mumbai CSMT', originCode: 'CSMT',
    destName: 'Bengaluru City', destCode: 'SBC',
    distanceKm: 1210, zone: 'CR/SWR',
    stops: [
      { code: 'CSMT', name: 'Mumbai CSMT',     dist: 0    },
      { code: 'SC',   name: 'Secunderabad',    dist: 780  },
      { code: 'SBC',  name: 'Bengaluru City',  dist: 1210 },
    ],
  },
  {
    originName: 'Mumbai CSMT', originCode: 'CSMT',
    destName: 'Thiruvananthapuram', destCode: 'TVC',
    distanceKm: 1895, zone: 'CR/SR',
    stops: [
      { code: 'CSMT', name: 'Mumbai CSMT',      dist: 0    },
      { code: 'SC',   name: 'Secunderabad',     dist: 780  },
      { code: 'MAS',  name: 'Chennai Central',  dist: 1279 },
      { code: 'ERS',  name: 'Ernakulam Jn',     dist: 1680 },
      { code: 'TVC',  name: 'Thiruvananthapuram',dist: 1895},
    ],
  },
  {
    originName: 'Mumbai CSMT', originCode: 'CSMT',
    destName: 'Coimbatore', destCode: 'CBE',
    distanceKm: 1558, zone: 'CR/SR',
    stops: [
      { code: 'CSMT', name: 'Mumbai CSMT',  dist: 0    },
      { code: 'SC',   name: 'Secunderabad', dist: 780  },
      { code: 'CBE',  name: 'Coimbatore',   dist: 1558 },
    ],
  },
  {
    originName: 'Mumbai Central', originCode: 'BCT',
    destName: 'Bengaluru City',   destCode: 'SBC',
    distanceKm: 1215, zone: 'WR/SWR',
    stops: [
      { code: 'BCT', name: 'Mumbai Central',  dist: 0    },
      { code: 'SUR', name: 'Solapur',         dist: 454  },
      { code: 'SC',  name: 'Secunderabad',    dist: 725  },
      { code: 'SBC', name: 'Bengaluru City',  dist: 1215 },
    ],
  },
  {
    originName: 'Mumbai Central', originCode: 'BCT',
    destName: 'Ahmedabad',        destCode: 'ADI',
    distanceKm: 491, zone: 'WR',
    stops: [
      { code: 'BCT', name: 'Mumbai Central', dist: 0   },
      { code: 'ADI', name: 'Ahmedabad Jn',   dist: 491 },
    ],
  },
  {
    originName: 'Chennai Central', originCode: 'MAS',
    destName: 'Bengaluru City',    destCode: 'SBC',
    distanceKm: 362, zone: 'SR/SWR',
    stops: [
      { code: 'MAS', name: 'Chennai Central',  dist: 0   },
      { code: 'KPD', name: 'Katpadi Junction', dist: 132 },
      { code: 'JTJ', name: 'Jolarpettai',      dist: 185 },
      { code: 'SBC', name: 'Bengaluru City',   dist: 362 },
    ],
  },
  {
    originName: 'Chennai Central', originCode: 'MAS',
    destName: 'Coimbatore',        destCode: 'CBE',
    distanceKm: 498, zone: 'SR',
    stops: [
      { code: 'MAS', name: 'Chennai Central', dist: 0   },
      { code: 'JTJ', name: 'Jolarpettai',     dist: 255 },
      { code: 'CBE', name: 'Coimbatore',      dist: 498 },
    ],
  },
  {
    originName: 'Chennai Central', originCode: 'MAS',
    destName: 'Thiruvananthapuram', destCode: 'TVC',
    distanceKm: 706, zone: 'SR',
    stops: [
      { code: 'MAS', name: 'Chennai Central',    dist: 0   },
      { code: 'CBE', name: 'Coimbatore',         dist: 498 },
      { code: 'ERS', name: 'Ernakulam Jn',       dist: 624 },
      { code: 'TVC', name: 'Thiruvananthapuram', dist: 706 },
    ],
  },
  {
    originName: 'Mysuru Junction', originCode: 'MYS',
    destName: 'Chennai Central',   destCode: 'MAS',
    distanceKm: 495, zone: 'SWR/SR',
    stops: [
      { code: 'MYS', name: 'Mysuru Junction',  dist: 0   },
      { code: 'SBC', name: 'Bengaluru City',   dist: 139 },
      { code: 'KPD', name: 'Katpadi Junction', dist: 352 },
      { code: 'MAS', name: 'Chennai Central',  dist: 495 },
    ],
  },
  {
    originName: 'Bengaluru City', originCode: 'SBC',
    destName: 'Hubballi',          destCode: 'UBL',
    distanceKm: 432, zone: 'SWR',
    stops: [
      { code: 'SBC', name: 'Bengaluru City',   dist: 0   },
      { code: 'ASK', name: 'Arsikere',         dist: 134 },
      { code: 'DVG', name: 'Davangere',        dist: 184 },
      { code: 'UBL', name: 'Hubballi (Hubli)', dist: 432 },
    ],
  },
  {
    originName: 'Bengaluru City', originCode: 'SBC',
    destName: 'Coimbatore',        destCode: 'CBE',
    distanceKm: 365, zone: 'SWR/SR',
    stops: [
      { code: 'SBC', name: 'Bengaluru City', dist: 0   },
      { code: 'CBE', name: 'Coimbatore',     dist: 365 },
    ],
  },
  {
    originName: 'Bengaluru City', originCode: 'SBC',
    destName: 'Mysuru Junction',   destCode: 'MYS',
    distanceKm: 139, zone: 'SWR',
    stops: [
      { code: 'SBC', name: 'Bengaluru City',  dist: 0   },
      { code: 'MYS', name: 'Mysuru Junction', dist: 139 },
    ],
  },
  {
    originName: 'Secunderabad', originCode: 'SC',
    destName: 'Chennai Central', destCode: 'MAS',
    distanceKm: 843, zone: 'SCR/SR',
    stops: [
      { code: 'SC',  name: 'Secunderabad',    dist: 0   },
      { code: 'KPD', name: 'Katpadi Junction',dist: 693 },
      { code: 'MAS', name: 'Chennai Central', dist: 843 },
    ],
  },
  {
    originName: 'Secunderabad', originCode: 'SC',
    destName: 'Bengaluru City',  destCode: 'SBC',
    distanceKm: 685, zone: 'SCR/SWR',
    stops: [
      { code: 'SC',  name: 'Secunderabad',   dist: 0   },
      { code: 'SBC', name: 'Bengaluru City', dist: 685 },
    ],
  },
  {
    originName: 'Mumbai CSMT', originCode: 'CSMT',
    destName: 'Secunderabad',    destCode: 'SC',
    distanceKm: 780, zone: 'CR/SCR',
    stops: [
      { code: 'CSMT', name: 'Mumbai CSMT',  dist: 0   },
      { code: 'SUR',  name: 'Solapur',      dist: 454 },
      { code: 'SC',   name: 'Secunderabad', dist: 780 },
    ],
  },
  {
    originName: 'Bengaluru City', originCode: 'SBC',
    destName: 'Chennai Central',  destCode: 'MAS',
    distanceKm: 362, zone: 'SWR/SR',
    stops: [
      { code: 'SBC', name: 'Bengaluru City',   dist: 0   },
      { code: 'KJM', name: 'Krishnarajapuram', dist: 27  },
      { code: 'BWT', name: 'Bangarapet',        dist: 105 },
      { code: 'JTJ', name: 'Jolarpettai',       dist: 177 },
      { code: 'KPD', name: 'Katpadi Junction',  dist: 230 },
      { code: 'MAS', name: 'Chennai Central',   dist: 362 },
    ],
  },
  {
    originName: 'Mumbai CSMT', originCode: 'CSMT',
    destName: 'Ernakulam Junction', destCode: 'ERS',
    distanceKm: 1680, zone: 'CR/SR',
    stops: [
      { code: 'CSMT', name: 'Mumbai CSMT',     dist: 0    },
      { code: 'SC',   name: 'Secunderabad',    dist: 780  },
      { code: 'MAS',  name: 'Chennai Central', dist: 1279 },
      { code: 'ERS',  name: 'Ernakulam Jn',   dist: 1680 },
    ],
  },
];

// ---- Train name templates per type -----------------------------------------

const NAMES: Record<string, string[]> = {
  Rajdhani:  ['Rajdhani Express'],
  Duronto:   ['Duronto Express'],
  Shatabdi:  ['Shatabdi Express', 'Jan Shatabdi Express'],
  Superfast: ['Superfast Express', 'SF Express'],
  Express:   [
    'Express', 'Mail Express', 'Weekly Express', 'Bi-Weekly Express',
    'Coromandel Express', 'Mangala Express', 'Kaveri Express',
    'Udyan Express', 'Lalbagh Express', 'Brindavan Express',
    'Jayanti Janata Express', 'Krishna Express', 'Tungabhadra Express',
    'Sabari Express', 'Maveli Express', 'Parasuram Express',
    'Island Express', 'Nagercoil Express', 'Vaigai Express',
    'Pallavan Express', 'Cheran Express', 'Nilgiri Express',
    'Kanyakumari Express', 'Meenakshi Express',
  ],
  Mail: [
    'Mail', 'Night Mail', 'Weekly Mail', 'Fast Mail',
    'Grand Trunk Mail', 'Chennai Mail', 'Mumbai Mail',
    'West Coast Express', 'East Coast Express',
  ],
};

const DAYS_PATTERNS: Array<{ days: number[]; label: string }> = [
  { days: [1,2,3,4,5,6,7], label: 'Daily'                        },
  { days: [1,2,3,4,5,6,7], label: 'Daily'                        },
  { days: [1,3,5,7],       label: 'Mon / Wed / Fri / Sun'        },
  { days: [2,4,6],         label: 'Tue / Thu / Sat'              },
  { days: [1,4],           label: 'Mon / Thu'                    },
  { days: [2,6],           label: 'Tue / Sat'                    },
  { days: [3,7],           label: 'Wed / Sun'                    },
  { days: [5],             label: 'Friday only'                  },
  { days: [1,2,3,4,5,6,7], label: 'Daily'                        },
];

const TYPE_SPEED: Record<string, { base: number; min: number; max: number }> = {
  Rajdhani:  { base: 105, min: 85, max: 130 },
  Duronto:   { base: 110, min: 90, max: 130 },
  Shatabdi:  { base: 100, min: 80, max: 120 },
  Superfast: { base:  88, min: 72, max: 110 },
  Express:   { base:  72, min: 55, max: 100 },
  Mail:      { base:  65, min: 48, max:  88 },
};

// ---- Train number pools by type --------------------------------------------

let _numCounters: Record<string, number> = {
  Rajdhani: 12401, Duronto: 12213, Shatabdi: 12001,
  Superfast: 12400, Express: 11001, Mail: 13001,
};

function nextTrainNo(type: string, seed: number): string {
  // Generate a plausible-looking train number based on type
  const base: Record<string, number> = {
    Rajdhani: 12400, Duronto: 12210, Shatabdi: 12000,
    Superfast: 22100, Express: 11000, Mail: 13000,
  };
  const b = base[type] ?? 12000;
  const offset = (seed * 7 + 3) % 599;
  return String(b + offset + 1);
}

// ---- Main generator --------------------------------------------------------

export function generateTrains(startIndex: number = 7, count: number = 94): TrainCatalogEntry[] {
  const trains: TrainCatalogEntry[] = [];
  let idx = startIndex;

  const TYPES_BY_DIST = (dist: number): string[] => {
    if (dist > 2000) return ['Rajdhani', 'Duronto', 'Superfast', 'Express'];
    if (dist > 800)  return ['Duronto', 'Superfast', 'Express', 'Mail'];
    if (dist > 400)  return ['Shatabdi', 'Superfast', 'Express', 'Express'];
    return ['Shatabdi', 'Express', 'Mail', 'Express'];
  };

  let routeIdx = 0;
  let perRouteCount = 0;

  while (trains.length < count) {
    const route = ROUTES[routeIdx % ROUTES.length];
    const rng = mkRng(idx * 31337 + routeIdx * 997);

    const typeOptions = TYPES_BY_DIST(route.distanceKm);
    const type = typeOptions[perRouteCount % typeOptions.length] as TrainCatalogEntry['trainType'];
    const typeKey = type as string;

    const namePool = NAMES[typeKey] ?? NAMES['Express'];
    const baseName = pick(namePool, rng);
    // Full name: e.g. "Chennai–Bengaluru Express"
    const name = type === 'Rajdhani' || type === 'Duronto' || type === 'Shatabdi'
      ? `${route.destName.split(' ')[0]} ${type} Express`
      : `${route.originCode}–${route.destCode} ${baseName}`;

    const number = nextTrainNo(typeKey, idx * 13 + perRouteCount * 7);

    // Days of week
    const daysEntry = DAYS_PATTERNS[idx % DAYS_PATTERNS.length];

    // Speed & delay
    const spd = TYPE_SPEED[typeKey] ?? TYPE_SPEED['Express'];
    const currentSpeed = intRange(spd.min, spd.max, rng);

    const delayRoll = rng();
    const currentDelay = delayRoll < 0.4
      ? 0                            // 40% on time
      : delayRoll < 0.7
        ? intRange(1, 15, rng)       // 30% slightly late
        : delayRoll < 0.9
          ? intRange(16, 45, rng)    // 20% moderately late
          : intRange(46, 120, rng);  // 10% very late

    const status: TrainCatalogEntry['status'] = currentDelay === 0 ? 'Running'
      : currentDelay > 60 ? 'Halted'
      : 'Delayed';

    // Distance remaining (30-80% of total)
    const distFrac = 0.3 + rng() * 0.5;
    const distanceRemaining = Math.round(route.distanceKm * distFrac);

    // Scheduled departure time
    const depHour = intRange(0, 23, rng);
    const depMin  = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55], rng);
    const scheduledDeparture = `${String(depHour).padStart(2,'0')}:${String(depMin).padStart(2,'0')}`;

    // Travel time in minutes (distance / avg speed of type)
    const avgSpeed = spd.base;
    const travelMin = Math.round((route.distanceKm / avgSpeed) * 60);
    const scheduledArrival = timeAdd(scheduledDeparture, travelMin);

    // Current section
    const midStopIdx = Math.max(0, Math.floor(route.stops.length / 2) - 1);
    const curStop = route.stops[midStopIdx];
    const nextStop = route.stops[Math.min(midStopIdx + 1, route.stops.length - 1)];
    const currentSection = `SEC-GEN-${idx}`;

    // Build station stops with scheduled times
    const stationStops: TrainCatalogEntry['stationStops'] = route.stops.map((stop, i) => {
      const stopTravelMin = Math.round((stop.dist / route.distanceKm) * travelMin);
      const arr = timeAdd(scheduledDeparture, stopTravelMin);
      const dep = i < route.stops.length - 1 ? timeAdd(arr, 2) : arr;
      return {
        code: stop.code, name: stop.name,
        scheduledArrival: arr, scheduledDeparture: dep,
        distanceFromOrigin: stop.dist,
      };
    });

    trains.push({
      id: `GEN-${number}-${idx}`,
      number, name,
      origin: route.originName, destination: route.destName,
      originCode: route.originCode, destinationCode: route.destCode,
      scheduledDeparture, scheduledArrival,
      distanceKm: route.distanceKm,
      daysOfWeek: daysEntry.days, daysLabel: daysEntry.label,
      trainType: type,
      status, currentDelay, currentSpeed,
      currentSection, distanceRemaining,
      stationStops,
    });

    idx++;
    perRouteCount++;
    if (perRouteCount >= 4) {
      perRouteCount = 0;
      routeIdx++;
    }
  }

  return trains;
}

// generateTrains is the single named export
