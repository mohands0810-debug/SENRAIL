// ============================================================
// SENRAIL — Route Conditions Grid Component
// ============================================================

import React from 'react';
import type { RouteSection, OperationalEvent } from '../types';
import { AlertTriangle, CheckCircle, CloudRain, Wrench, Radio, ZapOff } from 'lucide-react';

interface RouteConditionsTileProps {
  congestionLevel: string;
  maintenanceActive: boolean;
  weatherCondition: string;
  signalDelayMinutes: number;
}

function tileVariant(value: string, type: string): string {
  if (type === 'congestion') {
    if (value === 'High') return 'red';
    if (value === 'Moderate') return 'amber';
    return 'green';
  }
  if (type === 'maintenance') {
    return value === 'true' ? 'amber' : 'green';
  }
  if (type === 'weather') {
    if (value === 'Heavy Rain') return 'red';
    if (value === 'Light Rain' || value === 'Fog') return 'amber';
    return 'green';
  }
  if (type === 'signal') {
    return Number(value) > 0 ? 'amber' : 'green';
  }
  return 'green';
}

export default function RouteConditionsTiles({
  congestionLevel,
  maintenanceActive,
  weatherCondition,
  signalDelayMinutes,
}: RouteConditionsTileProps) {
  const tiles = [
    {
      name: 'Congestion',
      value: congestionLevel,
      displayValue: congestionLevel.toUpperCase(),
      icon: <ZapOff size={14} />,
      variant: tileVariant(congestionLevel, 'congestion'),
    },
    {
      name: 'Track Maintenance',
      value: String(maintenanceActive),
      displayValue: maintenanceActive ? 'ACTIVE' : 'INACTIVE',
      icon: <Wrench size={14} />,
      variant: tileVariant(String(maintenanceActive), 'maintenance'),
    },
    {
      name: 'Weather',
      value: weatherCondition,
      displayValue: weatherCondition.toUpperCase(),
      icon: <CloudRain size={14} />,
      variant: tileVariant(weatherCondition, 'weather'),
    },
    {
      name: 'Signal',
      value: String(signalDelayMinutes),
      displayValue: signalDelayMinutes > 0 ? `HOLD ${signalDelayMinutes} MIN` : 'NORMAL',
      icon: <Radio size={14} />,
      variant: tileVariant(String(signalDelayMinutes), 'signal'),
    },
  ];

  return (
    <div className="conditions-grid">
      {tiles.map((tile) => (
        <div className="condition-tile" key={tile.name}>
          <div className={`condition-icon-wrap ${tile.variant}`}>
            {tile.icon}
          </div>
          <div className="condition-info">
            <div className="condition-name">{tile.name}</div>
            <div className={`condition-value ${tile.variant}`}>{tile.displayValue}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
