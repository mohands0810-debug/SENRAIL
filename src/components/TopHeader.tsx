// ============================================================
// SENRAIL — Top Header with Simulated Time
// ============================================================

import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TopHeaderProps {
  isRunning: boolean;
  simTimeDisplay: string;   // simulated HH:MM:SS
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export default function TopHeader({
  isRunning,
  simTimeDisplay,
  onStart,
  onPause,
  onReset,
}: TopHeaderProps) {
  return (
    <header className="top-header" role="banner">
      {/* Logo + brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img
          src="/senrail-logo.jpg"
          alt="SENRAIL"
          style={{ height: 34, width: 'auto', objectFit: 'contain' }}
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="header-brand">
          <div className="header-brand-name">SENRAIL</div>
          <div className="header-brand-tag">Dynamic ETA Intelligence</div>
        </div>
      </div>

      <div className="header-spacer" />

      <div className="sim-mode-badge" aria-label="Simulation mode active">
        <span className="dot" aria-hidden="true" />
        Simulation Mode
      </div>

      <div className="header-time" title="Simulated railway time">
        🕐 {simTimeDisplay}
      </div>

      {isRunning ? (
        <button className="btn btn-outline btn-sm" onClick={onPause} aria-label="Pause simulation">
          <Pause size={13} />Pause
        </button>
      ) : (
        <button className="btn btn-primary btn-sm" onClick={onStart} aria-label="Start simulation">
          <Play size={13} />Start
        </button>
      )}

      <button className="btn btn-outline btn-sm" onClick={onReset} aria-label="Reset simulation">
        <RotateCcw size={13} />Reset
      </button>
    </header>
  );
}
