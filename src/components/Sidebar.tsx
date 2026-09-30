// ============================================================
// SENRAIL — Sidebar with Logo
// ============================================================

import React from 'react';
import {
  LayoutDashboard,
  Train,
  MapPin,
  BarChart2,
  FlaskConical,
  Search,
} from 'lucide-react';

export type PageId = 'overview' | 'monitor' | 'conditions' | 'analysis' | 'lab' | 'search';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  isSimRunning: boolean;
}

const NAV_ITEMS: { id: PageId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',    label: 'Overview',          icon: <LayoutDashboard size={15} /> },
  { id: 'monitor',    label: 'Live Train Monitor', icon: <Train size={15} /> },
  { id: 'conditions', label: 'Route Conditions',   icon: <MapPin size={15} /> },
  { id: 'analysis',   label: 'ETA Analysis',       icon: <BarChart2 size={15} /> },
  { id: 'lab',        label: 'Simulation Lab',     icon: <FlaskConical size={15} /> },
  { id: 'search',     label: 'Train Search',       icon: <Search size={15} /> },
];

export default function Sidebar({ currentPage, onNavigate, isSimRunning }: SidebarProps) {
  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      {/* Brand + Logo */}
      <div className="sidebar-brand">
        <div className="sidebar-logo-row">
          <img
            src="/senrail-logo.jpg"
            alt="SENRAIL Logo"
            className="sidebar-logo-img"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <div>
            <div className="sidebar-brand-name">SENRAIL</div>
            <div className="sidebar-brand-tagline">Dynamic ETA Intelligence</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`sidebar-nav-item${currentPage === item.id ? ' active' : ''}`}
            onClick={() => onNavigate(item.id)}
            aria-current={currentPage === item.id ? 'page' : undefined}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-status-row">
          <span className={`status-dot${isSimRunning ? '' : ' amber'}`} />
          <span>{isSimRunning ? 'Simulation Active' : 'Simulation Paused'}</span>
        </div>
        <div className="sidebar-team-info">
          RUNTIME REBELS<br />
          SIH 2026 · PS SIH26028
        </div>
      </div>
    </aside>
  );
}
