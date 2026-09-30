// ============================================================
// SENRAIL — Root Application
// ============================================================

import React, { useState } from 'react';
import './index.css';
import { AppProvider, useAppState } from './store/AppContext';
import Sidebar, { type PageId } from './components/Sidebar';
import TopHeader from './components/TopHeader';
import OverviewPage from './pages/OverviewPage';
import LiveMonitorPage from './pages/LiveMonitorPage';
import RouteConditionsPage from './pages/RouteConditionsPage';
import ETAAnalysisPage from './pages/ETAAnalysisPage';
import SimLabPage from './pages/SimLabPage';
import TrainSearchPage from './pages/TrainSearchPage';

function AppInner() {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const { state, dispatch } = useAppState();

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':    return <OverviewPage />;
      case 'monitor':     return <LiveMonitorPage />;
      case 'conditions':  return <RouteConditionsPage />;
      case 'analysis':    return <ETAAnalysisPage />;
      case 'lab':         return <SimLabPage />;
      case 'search':      return <TrainSearchPage />;
      default:            return <OverviewPage />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        currentPage={currentPage}
        onNavigate={page => { setCurrentPage(page); }}
        isSimRunning={state.simState.isRunning}
      />
      <div className="main-area">
        <TopHeader
          isRunning={state.simState.isRunning}
          simTimeDisplay={state.simTimeDisplay}
          onStart={() => dispatch({ type: 'START_SIM' })}
          onPause={() => dispatch({ type: 'PAUSE_SIM' })}
          onReset={() => dispatch({ type: 'RESET_SIM' })}
        />
        <div className="page-transition-wrapper">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
