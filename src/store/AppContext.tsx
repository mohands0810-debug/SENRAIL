// ============================================================
// SENRAIL — Application State Context (v2)
// Fixes: simulated time, ETA history recording, speed/delay history
// ============================================================

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import type {
  SimulationState,
  Train,
  RouteSection,
  OperationalEvent,
  ETAHistoryPoint,
  SimulationScenario,
} from '../types';
import type { ETAPrediction } from '../prediction/etaPredictor';
import { predictETA, timeToMinutes, minutesToTime } from '../prediction/etaPredictor';

import { INITIAL_TRAINS } from '../data/staticData';
import {
  createInitialSimState,
  SCENARIO_PRESETS,
  updateTrains,
  buildOperationalEvents,
  buildSections,
} from '../simulation/engine';

// ---- Simulated clock -------------------------------------------------------
// We advance a simulated clock instead of using wall time.
// This keeps ETA values in a meaningful range relative to the schedule.

const SIM_START_HOUR = 13;   // 13:00 – train is mid-journey
const SIM_START_MIN  = 5;    // 13:05
const TICK_SIM_SECONDS = 20; // Each 3-second real tick = 20 simulated seconds

function makeSimClock(tickCount: number): Date {
  const d = new Date();
  d.setHours(SIM_START_HOUR, SIM_START_MIN, 0, 0);
  d.setSeconds(d.getSeconds() + tickCount * TICK_SIM_SECONDS);
  return d;
}

function simTimeHMS(tickCount: number): string {
  const d = makeSimClock(tickCount);
  return d.toLocaleTimeString('en-IN', { hour12: false });
}

function simTimeHM(tickCount: number): string {
  const d = makeSimClock(tickCount);
  const h = d.getHours();
  const m = d.getMinutes();
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ---- History point types ---------------------------------------------------

export interface SpeedHistoryPoint {
  time: string;
  speed: number;
  scenario: string;
}

export interface DelayHistoryPoint {
  time: string;
  delay: number;
  scenario: string;
}

// ---- State Shape -----------------------------------------------------------

export interface AppState {
  simState: SimulationState;
  trains: Train[];
  sections: RouteSection[];
  events: OperationalEvent[];
  prediction: ETAPrediction | null;
  etaHistory: ETAHistoryPoint[];
  speedHistory: SpeedHistoryPoint[];
  delayHistory: DelayHistoryPoint[];
  lastUpdated: string;
  simTimeDisplay: string; // simulated HH:MM:SS for header
}

// ---- Actions ---------------------------------------------------------------

type Action =
  | { type: 'START_SIM' }
  | { type: 'PAUSE_SIM' }
  | { type: 'RESET_SIM' }
  | { type: 'SET_SCENARIO'; scenario: SimulationScenario }
  | { type: 'SELECT_TRAIN'; trainId: string }
  | { type: 'TICK' };

// ---- Reducer ---------------------------------------------------------------

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'START_SIM':
      return { ...state, simState: { ...state.simState, isRunning: true } };

    case 'PAUSE_SIM':
      return { ...state, simState: { ...state.simState, isRunning: false } };

    case 'RESET_SIM': {
      const freshSim = createInitialSimState();
      const preset = SCENARIO_PRESETS.normal;
      const simClock = makeSimClock(0);
      const events = buildOperationalEvents(preset, simClock);
      const sections = buildSections(preset, events);
      return {
        simState: freshSim,
        trains: INITIAL_TRAINS,
        sections,
        events,
        prediction: null,
        etaHistory: [],
        speedHistory: [],
        delayHistory: [],
        lastUpdated: simTimeHMS(0),
        simTimeDisplay: simTimeHMS(0),
      };
    }

    case 'SET_SCENARIO': {
      const preset = SCENARIO_PRESETS[action.scenario];
      const newSimState: SimulationState = {
        ...state.simState,
        scenario: action.scenario,
        congestionLevel: preset.congestionLevel,
        maintenanceActive: preset.maintenanceActive,
        speedRestriction: preset.speedRestriction,
        weatherCondition: preset.weatherCondition,
        signalDelayMinutes: preset.signalDelayMinutes,
        isRunning: true,
      };
      const simClock = makeSimClock(state.simState.tickCount);
      const events = buildOperationalEvents(preset, simClock);
      const sections = buildSections(preset, events);
      return { ...state, simState: newSimState, events, sections };
    }

    case 'SELECT_TRAIN':
      return { ...state, simState: { ...state.simState, selectedTrainId: action.trainId } };

    case 'TICK': {
      if (!state.simState.isRunning) return state;

      const newTick = state.simState.tickCount + 1;
      const simClock = makeSimClock(newTick);
      const preset = SCENARIO_PRESETS[state.simState.scenario];

      const newSimState: SimulationState = {
        ...state.simState,
        currentTime: simClock,
        tickCount: newTick,
      };

      const updatedTrains = updateTrains(state.trains, newSimState, preset);
      const selectedTrain = updatedTrains.find(t => t.id === newSimState.selectedTrainId);

      let newPrediction = state.prediction;

      if (selectedTrain) {
        newPrediction = predictETA({
          trainId: selectedTrain.id,
          currentSpeed: selectedTrain.currentSpeed,
          currentDelayMinutes: selectedTrain.currentDelay,
          distanceRemainingKm: selectedTrain.distanceRemaining,
          currentSectionId: selectedTrain.currentSection,
          congestionLevel: newSimState.congestionLevel,
          maintenanceActive: newSimState.maintenanceActive,
          speedRestriction: newSimState.speedRestriction,
          weatherCondition: newSimState.weatherCondition,
          signalDelayMinutes: newSimState.signalDelayMinutes,
          scheduledDestinationETA: '15:30',
          currentTime: simClock,
        });
      }

      const events = buildOperationalEvents(preset, simClock);
      const sections = buildSections(preset, events);
      const currentHM = simTimeHM(newTick);
      const scenarioLabel = state.simState.scenario.replace(/([A-Z])/g, ' $1').trim();

      // Record ETA history every tick (each tick = 20 sim-seconds, plenty of resolution)
      const newEtaHistory = newPrediction
        ? [
            ...(state.etaHistory ?? []).slice(-59),
            {
              time: currentHM,
              predictedETA: newPrediction.destinationETA,
              predictedMinutes: timeToMinutes(newPrediction.destinationETA),
              scenario: scenarioLabel,
            } satisfies ETAHistoryPoint,
          ]
        : (state.etaHistory ?? []);

      // Speed history — every tick
      const newSpeedHistory: SpeedHistoryPoint[] = selectedTrain
        ? [
            ...(state.speedHistory ?? []).slice(-59),
            { time: currentHM, speed: selectedTrain.currentSpeed, scenario: scenarioLabel },
          ]
        : (state.speedHistory ?? []);

      // Delay history — every tick
      const newDelayHistory: DelayHistoryPoint[] = selectedTrain
        ? [
            ...(state.delayHistory ?? []).slice(-59),
            { time: currentHM, delay: selectedTrain.currentDelay, scenario: scenarioLabel },
          ]
        : (state.delayHistory ?? []);

      return {
        simState: newSimState,
        trains: updatedTrains,
        sections,
        events,
        prediction: newPrediction,
        etaHistory: newEtaHistory,
        speedHistory: newSpeedHistory,
        delayHistory: newDelayHistory,
        lastUpdated: simTimeHMS(newTick),
        simTimeDisplay: simTimeHMS(newTick),
      };
    }

    default:
      return state;
  }
}

// ---- Initial State ---------------------------------------------------------

function createInitialAppState(): AppState {
  const simState = createInitialSimState();
  const preset = SCENARIO_PRESETS.normal;
  const simClock = makeSimClock(0);
  const events = buildOperationalEvents(preset, simClock);
  const sections = buildSections(preset, events);
  return {
    simState,
    trains: INITIAL_TRAINS,
    sections,
    events,
    prediction: null,
    etaHistory: [],
    speedHistory: [],
    delayHistory: [],
    lastUpdated: simTimeHMS(0),
    simTimeDisplay: simTimeHMS(0),
  };
}

// ---- Context ---------------------------------------------------------------

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, createInitialAppState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => { dispatch({ type: 'TICK' }); }, []);

  useEffect(() => {
    if (state.simState.isRunning) {
      intervalRef.current = setInterval(tick, 3000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.simState.isRunning, tick]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
