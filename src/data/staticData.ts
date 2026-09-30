// ============================================================
// SENRAIL — Static Data: Trains, Stations, Routes, Historical
// NOTE: All data is synthetic and for prototype demonstration only.
// ============================================================

import type {
  Train,
  Station,
  RouteSection,
  HistoricalRecord,
  StationETA,
} from '../types';

// ---- Karnataka Express Route Stations --------------------------------------

export const KARNATAKA_EXPRESS_STATIONS: Station[] = [
  {
    id: 'MAS',
    name: 'Chennai Central',
    code: 'MAS',
    distanceFromOrigin: 0,
    scheduledArrival: '06:30',
    scheduledDeparture: '06:30',
  },
  {
    id: 'KPD',
    name: 'Katpadi Junction',
    code: 'KPD',
    distanceFromOrigin: 132,
    scheduledArrival: '09:40',
    scheduledDeparture: '09:42',
  },
  {
    id: 'JTJ',
    name: 'Jolarpettai Junction',
    code: 'JTJ',
    distanceFromOrigin: 185,
    scheduledArrival: '10:50',
    scheduledDeparture: '10:52',
  },
  {
    id: 'BWT',
    name: 'Bangarapet',
    code: 'BWT',
    distanceFromOrigin: 257,
    scheduledArrival: '12:30',
    scheduledDeparture: '12:32',
  },
  {
    id: 'KJM',
    name: 'Krishnarajapuram',
    code: 'KJM',
    distanceFromOrigin: 335,
    scheduledArrival: '14:50',
    scheduledDeparture: '14:52',
  },
  {
    id: 'SBC',
    name: 'Bengaluru City',
    code: 'SBC',
    distanceFromOrigin: 362,
    scheduledArrival: '15:30',
    scheduledDeparture: '15:30',
  },
];

// ---- Karnataka Express Route Sections --------------------------------------

export const KARNATAKA_EXPRESS_SECTIONS: RouteSection[] = [
  {
    id: 'SEC-101',
    name: 'MAS – KPD',
    fromStation: 'MAS',
    toStation: 'KPD',
    distanceKm: 132,
    baselineMinutes: 190,
    condition: 'Normal',
    activeEvents: [],
  },
  {
    id: 'SEC-102',
    name: 'KPD – JTJ',
    fromStation: 'KPD',
    toStation: 'JTJ',
    distanceKm: 53,
    baselineMinutes: 68,
    condition: 'Normal',
    activeEvents: [],
  },
  {
    id: 'SEC-103',
    name: 'JTJ – BWT',
    fromStation: 'JTJ',
    toStation: 'BWT',
    distanceKm: 72,
    baselineMinutes: 98,
    condition: 'Normal',
    activeEvents: [],
  },
  {
    id: 'SEC-104',
    name: 'BWT – KJM',
    fromStation: 'BWT',
    toStation: 'KJM',
    distanceKm: 78,
    baselineMinutes: 98,
    condition: 'Normal',
    activeEvents: [],
  },
  {
    id: 'SEC-105',
    name: 'KJM – SBC',
    fromStation: 'KJM',
    toStation: 'SBC',
    distanceKm: 27,
    baselineMinutes: 38,
    condition: 'Normal',
    activeEvents: [],
  },
];

// ---- Initial station ETAs for 12627 ----------------------------------------

export const INITIAL_STATION_ETAS_12627: StationETA[] = [
  {
    stationId: 'MAS',
    stationName: 'Chennai Central',
    stationCode: 'MAS',
    scheduledArrival: '06:30',
    predictedArrival: '06:30',
    delayMinutes: 0,
    status: 'Passed',
    distanceFromCurrent: 0,
  },
  {
    stationId: 'KPD',
    stationName: 'Katpadi Junction',
    stationCode: 'KPD',
    scheduledArrival: '09:40',
    predictedArrival: '09:48',
    delayMinutes: 8,
    status: 'Passed',
    distanceFromCurrent: 0,
  },
  {
    stationId: 'JTJ',
    stationName: 'Jolarpettai Junction',
    stationCode: 'JTJ',
    scheduledArrival: '10:50',
    predictedArrival: '11:08',
    delayMinutes: 18,
    status: 'Passed',
    distanceFromCurrent: 0,
  },
  {
    stationId: 'BWT',
    stationName: 'Bangarapet',
    stationCode: 'BWT',
    scheduledArrival: '12:30',
    predictedArrival: '13:10',
    delayMinutes: 40,
    status: 'Approaching',
    distanceFromCurrent: 32,
  },
  {
    stationId: 'KJM',
    stationName: 'Krishnarajapuram',
    stationCode: 'KJM',
    scheduledArrival: '14:50',
    predictedArrival: '15:22',
    delayMinutes: 32,
    status: 'Upcoming',
    distanceFromCurrent: 110,
  },
  {
    stationId: 'SBC',
    stationName: 'Bengaluru City',
    stationCode: 'SBC',
    scheduledArrival: '15:30',
    predictedArrival: '15:54',
    delayMinutes: 24,
    status: 'Destination',
    distanceFromCurrent: 137,
  },
];

// ---- Multi-Train Fleet (Simulated) -----------------------------------------

export const INITIAL_TRAINS: Train[] = [
  {
    id: '12627',
    number: '12627',
    name: 'Karnataka Express',
    origin: 'Chennai Central',
    destination: 'Bengaluru City',
    status: 'Running',
    currentSpeed: 68,
    currentDelay: 14,
    currentSection: 'SEC-103',
    distanceRemaining: 137,
    stations: INITIAL_STATION_ETAS_12627,
    route: ['MAS', 'KPD', 'JTJ', 'BWT', 'KJM', 'SBC'],
  },
  {
    id: '12628',
    number: '12628',
    name: 'Karnataka Express (Return)',
    origin: 'Bengaluru City',
    destination: 'Chennai Central',
    status: 'Running',
    currentSpeed: 74,
    currentDelay: 6,
    currentSection: 'SEC-202',
    distanceRemaining: 210,
    stations: [
      {
        stationId: 'SBC', stationName: 'Bengaluru City', stationCode: 'SBC',
        scheduledArrival: '07:00', predictedArrival: '07:00', delayMinutes: 0,
        status: 'Passed', distanceFromCurrent: 0,
      },
      {
        stationId: 'KJM', stationName: 'Krishnarajapuram', stationCode: 'KJM',
        scheduledArrival: '07:38', predictedArrival: '07:44', delayMinutes: 6,
        status: 'Passed', distanceFromCurrent: 0,
      },
      {
        stationId: 'BWT', stationName: 'Bangarapet', stationCode: 'BWT',
        scheduledArrival: '09:00', predictedArrival: '09:09', delayMinutes: 9,
        status: 'Upcoming', distanceFromCurrent: 80,
      },
      {
        stationId: 'MAS', stationName: 'Chennai Central', stationCode: 'MAS',
        scheduledArrival: '19:00', predictedArrival: '19:06', delayMinutes: 6,
        status: 'Destination', distanceFromCurrent: 210,
      },
    ],
    route: ['SBC', 'KJM', 'BWT', 'JTJ', 'KPD', 'MAS'],
  },
  {
    id: '12951',
    number: '12951',
    name: 'Rajdhani Express',
    origin: 'Mumbai Central',
    destination: 'New Delhi',
    status: 'Delayed',
    currentSpeed: 51,
    currentDelay: 28,
    currentSection: 'SEC-301',
    distanceRemaining: 487,
    stations: [
      {
        stationId: 'BCT', stationName: 'Mumbai Central', stationCode: 'BCT',
        scheduledArrival: '17:00', predictedArrival: '17:00', delayMinutes: 0,
        status: 'Passed', distanceFromCurrent: 0,
      },
      {
        stationId: 'ST', stationName: 'Surat', stationCode: 'ST',
        scheduledArrival: '19:45', predictedArrival: '20:08', delayMinutes: 23,
        status: 'Passed', distanceFromCurrent: 0,
      },
      {
        stationId: 'ADI', stationName: 'Ahmedabad Jn', stationCode: 'ADI',
        scheduledArrival: '22:05', predictedArrival: '22:36', delayMinutes: 31,
        status: 'Upcoming', distanceFromCurrent: 280,
      },
      {
        stationId: 'NDLS', stationName: 'New Delhi', stationCode: 'NDLS',
        scheduledArrival: '08:35', predictedArrival: '09:03', delayMinutes: 28,
        status: 'Destination', distanceFromCurrent: 487,
      },
    ],
    route: ['BCT', 'ST', 'ADI', 'NDLS'],
  },
  {
    id: '12860',
    number: '12860',
    name: 'Gitanjali Express',
    origin: 'Kolkata (Howrah)',
    destination: 'Mumbai CSMT',
    status: 'Running',
    currentSpeed: 79,
    currentDelay: 3,
    currentSection: 'SEC-401',
    distanceRemaining: 612,
    stations: [
      {
        stationId: 'HWH', stationName: 'Howrah Jn', stationCode: 'HWH',
        scheduledArrival: '14:05', predictedArrival: '14:05', delayMinutes: 0,
        status: 'Passed', distanceFromCurrent: 0,
      },
      {
        stationId: 'NGP', stationName: 'Nagpur Jn', stationCode: 'NGP',
        scheduledArrival: '03:00', predictedArrival: '03:04', delayMinutes: 4,
        status: 'Upcoming', distanceFromCurrent: 400,
      },
      {
        stationId: 'CSMT', stationName: 'Mumbai CSMT', stationCode: 'CSMT',
        scheduledArrival: '14:10', predictedArrival: '14:13', delayMinutes: 3,
        status: 'Destination', distanceFromCurrent: 612,
      },
    ],
    route: ['HWH', 'NGP', 'CSMT'],
  },
];

// ---- Synthetic Historical Data (clearly labeled) ----------------------------

export const HISTORICAL_DATA: HistoricalRecord[] = [
  // SEC-101 MAS–KPD
  { trainId: '12627', route: 'MAS-SBC', sectionId: 'SEC-101', dayOfWeek: 1, timeOfDay: '06:30', historicalTravelMinutes: 188, averageDelayMinutes: 5, weatherCondition: 'Clear', congestionLevel: 'Low' },
  { trainId: '12627', route: 'MAS-SBC', sectionId: 'SEC-101', dayOfWeek: 1, timeOfDay: '06:30', historicalTravelMinutes: 195, averageDelayMinutes: 12, weatherCondition: 'Light Rain', congestionLevel: 'Low' },
  { trainId: '12627', route: 'MAS-SBC', sectionId: 'SEC-101', dayOfWeek: 1, timeOfDay: '06:30', historicalTravelMinutes: 205, averageDelayMinutes: 18, weatherCondition: 'Heavy Rain', congestionLevel: 'Moderate' },
  // SEC-102 KPD–JTJ
  { trainId: '12627', route: 'MAS-SBC', sectionId: 'SEC-102', dayOfWeek: 1, timeOfDay: '09:40', historicalTravelMinutes: 67, averageDelayMinutes: 3, weatherCondition: 'Clear', congestionLevel: 'Low' },
  { trainId: '12627', route: 'MAS-SBC', sectionId: 'SEC-102', dayOfWeek: 1, timeOfDay: '09:40', historicalTravelMinutes: 72, averageDelayMinutes: 8, weatherCondition: 'Light Rain', congestionLevel: 'Moderate' },
  { trainId: '12627', route: 'MAS-SBC', sectionId: 'SEC-102', dayOfWeek: 1, timeOfDay: '09:40', historicalTravelMinutes: 80, averageDelayMinutes: 15, weatherCondition: 'Heavy Rain', congestionLevel: 'High' },
  // SEC-103 JTJ–BWT
  { trainId: '12627', route: 'MAS-SBC', sectionId: 'SEC-103', dayOfWeek: 1, timeOfDay: '10:50', historicalTravelMinutes: 96, averageDelayMinutes: 4, weatherCondition: 'Clear', congestionLevel: 'Low' },
  { trainId: '12627', route: 'MAS-SBC', sectionId: 'SEC-103', dayOfWeek: 1, timeOfDay: '10:50', historicalTravelMinutes: 104, averageDelayMinutes: 10, weatherCondition: 'Light Rain', congestionLevel: 'Moderate' },
  { trainId: '12627', route: 'MAS-SBC', sectionId: 'SEC-103', dayOfWeek: 1, timeOfDay: '10:50', historicalTravelMinutes: 118, averageDelayMinutes: 22, weatherCondition: 'Heavy Rain', congestionLevel: 'High' },
  // SEC-104 BWT–KJM
  { trainId: '12627', route: 'MAS-SBC', sectionId: 'SEC-104', dayOfWeek: 1, timeOfDay: '12:30', historicalTravelMinutes: 97, averageDelayMinutes: 3, weatherCondition: 'Clear', congestionLevel: 'Low' },
  { trainId: '12627', route: 'MAS-SBC', sectionId: 'SEC-104', dayOfWeek: 1, timeOfDay: '12:30', historicalTravelMinutes: 105, averageDelayMinutes: 11, weatherCondition: 'Light Rain', congestionLevel: 'Moderate' },
  { trainId: '12627', route: 'MAS-SBC', sectionId: 'SEC-104', dayOfWeek: 1, timeOfDay: '12:30', historicalTravelMinutes: 116, averageDelayMinutes: 19, weatherCondition: 'Heavy Rain', congestionLevel: 'High' },
  // SEC-105 KJM–SBC
  { trainId: '12627', route: 'MAS-SBC', sectionId: 'SEC-105', dayOfWeek: 1, timeOfDay: '14:50', historicalTravelMinutes: 37, averageDelayMinutes: 2, weatherCondition: 'Clear', congestionLevel: 'Low' },
  { trainId: '12627', route: 'MAS-SBC', sectionId: 'SEC-105', dayOfWeek: 1, timeOfDay: '14:50', historicalTravelMinutes: 42, averageDelayMinutes: 7, weatherCondition: 'Light Rain', congestionLevel: 'Low' },
  { trainId: '12627', route: 'MAS-SBC', sectionId: 'SEC-105', dayOfWeek: 1, timeOfDay: '14:50', historicalTravelMinutes: 50, averageDelayMinutes: 14, weatherCondition: 'Heavy Rain', congestionLevel: 'High' },
];

// ---- Helper: historical avg for section + weather + congestion --------------

export function getHistoricalBaseline(
  sectionId: string,
  weatherCondition: string,
  congestionLevel: string
): number {
  const matches = HISTORICAL_DATA.filter(
    (r) =>
      r.sectionId === sectionId &&
      r.weatherCondition === weatherCondition &&
      r.congestionLevel === congestionLevel
  );
  if (matches.length > 0) {
    return Math.round(
      matches.reduce((sum, r) => sum + r.historicalTravelMinutes, 0) / matches.length
    );
  }
  const weatherOnly = HISTORICAL_DATA.filter(
    (r) => r.sectionId === sectionId && r.weatherCondition === weatherCondition
  );
  if (weatherOnly.length > 0) {
    return Math.round(
      weatherOnly.reduce((sum, r) => sum + r.historicalTravelMinutes, 0) / weatherOnly.length
    );
  }
  const sectionOnly = HISTORICAL_DATA.filter((r) => r.sectionId === sectionId);
  if (sectionOnly.length > 0) {
    return Math.round(
      sectionOnly.reduce((sum, r) => sum + r.historicalTravelMinutes, 0) / sectionOnly.length
    );
  }
  return 90;
}

// ============================================================
// MULTI-TRAIN CATALOG — 5 Additional Synthetic Trains
// NOTE: All data is synthetic and for demonstration only.
// ============================================================

// ---- Train Catalog Interface -----------------------------------------------

export interface TrainCatalogEntry {
  id: string;
  number: string;
  name: string;
  origin: string;
  destination: string;
  originCode: string;
  destinationCode: string;
  scheduledDeparture: string;   // HH:MM from origin
  scheduledArrival: string;     // HH:MM at destination
  distanceKm: number;
  daysOfWeek: number[];         // 1=Mon … 7=Sun
  daysLabel: string;
  trainType: 'Rajdhani' | 'Shatabdi' | 'Express' | 'Duronto' | 'Superfast' | 'Passenger';
  status: 'Running' | 'Delayed' | 'Halted' | 'Arrived';
  currentDelay: number;
  currentSpeed: number;
  currentSection: string;
  distanceRemaining: number;
  stationStops: Array<{
    code: string; name: string;
    scheduledArrival: string; scheduledDeparture: string;
    distanceFromOrigin: number;
  }>;
}

export const TRAIN_CATALOG: TrainCatalogEntry[] = [
  // ── 1. Karnataka Express (existing) ──────────────────────────────────────
  {
    id: '12627', number: '12627', name: 'Karnataka Express',
    origin: 'Chennai Central', destination: 'Bengaluru City',
    originCode: 'MAS', destinationCode: 'SBC',
    scheduledDeparture: '06:30', scheduledArrival: '15:30',
    distanceKm: 362, daysOfWeek: [1,2,3,4,5,6,7], daysLabel: 'Daily',
    trainType: 'Express', status: 'Delayed', currentDelay: 14,
    currentSpeed: 68, currentSection: 'SEC-103', distanceRemaining: 137,
    stationStops: [
      { code: 'MAS', name: 'Chennai Central',    scheduledArrival: '06:30', scheduledDeparture: '06:30', distanceFromOrigin: 0   },
      { code: 'KPD', name: 'Katpadi Junction',   scheduledArrival: '09:40', scheduledDeparture: '09:42', distanceFromOrigin: 132 },
      { code: 'JTJ', name: 'Jolarpettai',        scheduledArrival: '10:50', scheduledDeparture: '10:52', distanceFromOrigin: 185 },
      { code: 'BWT', name: 'Bangarapet',         scheduledArrival: '12:30', scheduledDeparture: '12:32', distanceFromOrigin: 257 },
      { code: 'KJM', name: 'Krishnarajapuram',   scheduledArrival: '14:50', scheduledDeparture: '14:52', distanceFromOrigin: 335 },
      { code: 'SBC', name: 'Bengaluru City',     scheduledArrival: '15:30', scheduledDeparture: '15:30', distanceFromOrigin: 362 },
    ],
  },

  // ── 2. Rajdhani Express ─────────────────────────────────────────────────
  {
    id: '12431', number: '12431', name: 'Thiruvananthapuram Rajdhani',
    origin: 'Hazrat Nizamuddin', destination: 'Thiruvananthapuram',
    originCode: 'NZM', destinationCode: 'TVC',
    scheduledDeparture: '10:55', scheduledArrival: '05:30',  // next day
    distanceKm: 3145, daysOfWeek: [1,3,5,7], daysLabel: 'Mon / Wed / Fri / Sun',
    trainType: 'Rajdhani', status: 'Delayed', currentDelay: 22,
    currentSpeed: 88, currentSection: 'SEC-R202', distanceRemaining: 820,
    stationStops: [
      { code: 'NZM',  name: 'Hazrat Nizamuddin',    scheduledArrival: '10:55', scheduledDeparture: '10:55', distanceFromOrigin: 0    },
      { code: 'BPL',  name: 'Bhopal Junction',       scheduledArrival: '19:30', scheduledDeparture: '19:35', distanceFromOrigin: 704  },
      { code: 'NGP',  name: 'Nagpur Junction',        scheduledArrival: '00:15', scheduledDeparture: '00:20', distanceFromOrigin: 1084 },
      { code: 'SC',   name: 'Secunderabad Junction',  scheduledArrival: '08:15', scheduledDeparture: '08:20', distanceFromOrigin: 1642 },
      { code: 'MAS',  name: 'Chennai Central',        scheduledArrival: '21:30', scheduledDeparture: '21:35', distanceFromOrigin: 2323 },
      { code: 'CBE',  name: 'Coimbatore',             scheduledArrival: '01:15', scheduledDeparture: '01:20', distanceFromOrigin: 2763 },
      { code: 'ERS',  name: 'Ernakulam Junction',     scheduledArrival: '03:40', scheduledDeparture: '03:45', distanceFromOrigin: 2980 },
      { code: 'TVC',  name: 'Thiruvananthapuram',     scheduledArrival: '05:30', scheduledDeparture: '05:30', distanceFromOrigin: 3145 },
    ],
  },

  // ── 3. Chennai Shatabdi ────────────────────────────────────────────────
  {
    id: '12007', number: '12007', name: 'Mysuru – Chennai Shatabdi',
    origin: 'Mysuru Junction', destination: 'Chennai Central',
    originCode: 'MYS', destinationCode: 'MAS',
    scheduledDeparture: '06:10', scheduledArrival: '14:00',
    distanceKm: 495, daysOfWeek: [1,2,3,5,6,7], daysLabel: 'Daily except Thursday',
    trainType: 'Shatabdi', status: 'Running', currentDelay: 5,
    currentSpeed: 98, currentSection: 'SEC-S302', distanceRemaining: 143,
    stationStops: [
      { code: 'MYS', name: 'Mysuru Junction',       scheduledArrival: '06:10', scheduledDeparture: '06:10', distanceFromOrigin: 0   },
      { code: 'ASK', name: 'Arsikere Junction',      scheduledArrival: '07:50', scheduledDeparture: '07:52', distanceFromOrigin: 122 },
      { code: 'SBC', name: 'Bengaluru City',         scheduledArrival: '08:55', scheduledDeparture: '09:00', distanceFromOrigin: 139 },
      { code: 'JTJ', name: 'Jolarpettai',            scheduledArrival: '10:55', scheduledDeparture: '10:57', distanceFromOrigin: 325 },
      { code: 'KPD', name: 'Katpadi Junction',       scheduledArrival: '11:50', scheduledDeparture: '11:52', distanceFromOrigin: 352 },
      { code: 'MAS', name: 'Chennai Central',        scheduledArrival: '14:00', scheduledDeparture: '14:00', distanceFromOrigin: 495 },
    ],
  },

  // ── 4. Coimbatore Express ──────────────────────────────────────────────
  {
    id: '11013', number: '11013', name: 'Coimbatore Express',
    origin: 'Mumbai CSMT', destination: 'Coimbatore',
    originCode: 'CSMT', destinationCode: 'CBE',
    scheduledDeparture: '23:05', scheduledArrival: '05:40',  // 2-day journey
    distanceKm: 1152, daysOfWeek: [3,7], daysLabel: 'Wednesday / Sunday',
    trainType: 'Express', status: 'Delayed', currentDelay: 47,
    currentSpeed: 74, currentSection: 'SEC-C401', distanceRemaining: 380,
    stationStops: [
      { code: 'CSMT', name: 'Mumbai CSMT',          scheduledArrival: '23:05', scheduledDeparture: '23:05', distanceFromOrigin: 0    },
      { code: 'SUR',  name: 'Solapur Junction',     scheduledArrival: '06:10', scheduledDeparture: '06:15', distanceFromOrigin: 454  },
      { code: 'SC',   name: 'Secunderabad Jn',      scheduledArrival: '12:45', scheduledDeparture: '12:50', distanceFromOrigin: 772  },
      { code: 'CBE',  name: 'Coimbatore',            scheduledArrival: '05:40', scheduledDeparture: '05:40', distanceFromOrigin: 1152 },
    ],
  },

  // ── 5. Yeshwantpur Duronto ────────────────────────────────────────────
  {
    id: '12245', number: '12245', name: 'Yeshwantpur Duronto',
    origin: 'Mumbai Central', destination: 'Bengaluru City',
    originCode: 'BCT', destinationCode: 'SBC',
    scheduledDeparture: '23:55', scheduledArrival: '15:30',
    distanceKm: 1215, daysOfWeek: [1,4,6], daysLabel: 'Mon / Thu / Sat',
    trainType: 'Duronto', status: 'Running', currentDelay: 8,
    currentSpeed: 118, currentSection: 'SEC-D501', distanceRemaining: 490,
    stationStops: [
      { code: 'BCT',  name: 'Mumbai Central',        scheduledArrival: '23:55', scheduledDeparture: '23:55', distanceFromOrigin: 0    },
      { code: 'SUR',  name: 'Solapur Junction',      scheduledArrival: '05:45', scheduledDeparture: '05:50', distanceFromOrigin: 454  },
      { code: 'SC',   name: 'Secunderabad Junction', scheduledArrival: '12:30', scheduledDeparture: '12:35', distanceFromOrigin: 725  },
      { code: 'SBC',  name: 'Bengaluru City',        scheduledArrival: '15:30', scheduledDeparture: '15:30', distanceFromOrigin: 1215 },
    ],
  },

  // ── 6. Hampi Express ──────────────────────────────────────────────────
  {
    id: '16591', number: '16591', name: 'Hampi Express',
    origin: 'Bengaluru City', destination: 'Hubballi (Hubli)',
    originCode: 'SBC', destinationCode: 'UBL',
    scheduledDeparture: '21:20', scheduledArrival: '06:00',
    distanceKm: 432, daysOfWeek: [1,2,3,4,5,6,7], daysLabel: 'Daily',
    trainType: 'Express', status: 'Running', currentDelay: 0,
    currentSpeed: 68, currentSection: 'SEC-H601', distanceRemaining: 248,
    stationStops: [
      { code: 'SBC', name: 'Bengaluru City',    scheduledArrival: '21:20', scheduledDeparture: '21:20', distanceFromOrigin: 0   },
      { code: 'ASK', name: 'Arsikere Junction', scheduledArrival: '00:20', scheduledDeparture: '00:25', distanceFromOrigin: 134 },
      { code: 'DVG', name: 'Davangere',         scheduledArrival: '02:15', scheduledDeparture: '02:17', distanceFromOrigin: 184 },
      { code: 'UBL', name: 'Hubballi (Hubli)',  scheduledArrival: '06:00', scheduledDeparture: '06:00', distanceFromOrigin: 432 },
    ],
  },
];

// ---- Helper: compute simple predicted arrival for a searched train ----------

export function computeSimpleETA(
  train: TrainCatalogEntry,
  currentDelayOverride?: number
): { predictedArrival: string; delayMin: number } {
  const delay = currentDelayOverride ?? train.currentDelay;
  const [h, m] = train.scheduledArrival.split(':').map(Number);
  const totalMin = h * 60 + m + delay;
  const ph = Math.floor(totalMin / 60) % 24;
  const pm = totalMin % 60;
  return {
    predictedArrival: `${String(ph).padStart(2,'0')}:${String(pm).padStart(2,'0')}`,
    delayMin: delay,
  };
}

// ---- Full fleet: 6 manual + 94 generated = 100 trains ----------------------

import { generateTrains } from './trainGenerator';
export const ALL_TRAINS: TrainCatalogEntry[] = [
  ...TRAIN_CATALOG,
  ...generateTrains(7, 94),
];

