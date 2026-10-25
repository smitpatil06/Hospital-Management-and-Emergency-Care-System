import React, { useState } from 'react';
import { AlgorithmType } from '../types';
import { ALGORITHM_SHORT_NAMES, ALGORITHM_NAMES, ALGORITHM_DESCRIPTIONS } from '../utils/scheduler';
import {
  Cpu, BarChart3, BookOpen, Sparkles, Download, SlidersHorizontal,
  ChevronDown, ChevronRight, Zap, GitBranch, Clock, ArrowUpDown, RefreshCw
} from 'lucide-react';

interface SidebarProps {
  currentTab: 'visualizer' | 'comparison' | 'theory';
  setCurrentTab: (tab: 'visualizer' | 'comparison' | 'theory') => void;
  selectedAlgorithm: AlgorithmType;
  setSelectedAlgorithm: (alg: AlgorithmType) => void;
  roundRobinQuantum: number;
  setRoundRobinQuantum: (q: number) => void;
  contextSwitchOverhead: number;
  setContextSwitchOverhead: (cs: number) => void;
  priorityOrder: 'lower_is_higher' | 'higher_is_higher';
  setPriorityOrder: (order: 'lower_is_higher' | 'higher_is_higher') => void;
  onOpenPresets: () => void;
  onExportData: () => void;
}

const ALG_COLORS: Record<AlgorithmType, string> = {
  fcfs: '#6366f1',
  sjf_non_preemptive: '#06b6d4',
  sjf_preemptive: '#0ea5e9',
  round_robin: '#f59e0b',
  priority_non_preemptive: '#10b981',
  priority_preemptive: '#34d399',
};

const ALG_ICONS: Record<AlgorithmType, React.ReactNode> = {
  fcfs: <Clock size={13} />,
  sjf_non_preemptive: <Zap size={13} />,
  sjf_preemptive: <Zap size={13} />,
  round_robin: <RefreshCw size={13} />,
  priority_non_preemptive: <ArrowUpDown size={13} />,
  priority_preemptive: <ArrowUpDown size={13} />,
};

const algorithms: AlgorithmType[] = [
  'fcfs',
  'sjf_non_preemptive',
  'sjf_preemptive',
  'round_robin',
  'priority_non_preemptive',
  'priority_preemptive',
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab, setCurrentTab,
  selectedAlgorithm, setSelectedAlgorithm,
  roundRobinQuantum, setRoundRobinQuantum,
  contextSwitchOverhead, setContextSwitchOverhead,
  priorityOrder, setPriorityOrder,
  onOpenPresets, onExportData,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <aside className="app-sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Cpu size={20} color="white" />
        </div>
        <div className="sidebar-title">CPU Scheduler</div>
        <div className="sidebar-subtitle">Interactive Lab</div>
      </div>

      {/* Mode Navigation */}
      <div className="sidebar-section">
        <div className="sidebar-section-label">
          <GitBranch size={9} />
          View Mode
        </div>
        <button
          className={`tab-btn ${currentTab === 'visualizer' ? 'active' : ''}`}
          onClick={() => setCurrentTab('visualizer')}
        >
          <Cpu size={14} />
          <span>Simulator</span>
          {currentTab === 'visualizer' && (
            <span className="ml-auto badge badge-indigo" style={{ fontSize: 9 }}>Live</span>
          )}
        </button>
        <button
          className={`tab-btn ${currentTab === 'comparison' ? 'active' : ''}`}
          onClick={() => setCurrentTab('comparison')}
        >
          <BarChart3 size={14} />
          <span>Compare Algorithms</span>
        </button>
        <button
          className={`tab-btn ${currentTab === 'theory' ? 'active' : ''}`}
          onClick={() => setCurrentTab('theory')}
        >
          <BookOpen size={14} />
          <span>Theory Guide</span>
        </button>
      </div>

      {/* Algorithm Selection */}
      {currentTab === 'visualizer' && (
        <div className="sidebar-section" style={{ flex: 1 }}>
          <div className="sidebar-section-label">
            <Zap size={9} />
            Algorithm
          </div>
          {algorithms.map((alg) => {
            const isActive = selectedAlgorithm === alg;
            const color = ALG_COLORS[alg];
            return (
              <button
                key={alg}
                id={`sidebar-alg-${alg}`}
                className={`alg-btn ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedAlgorithm(alg)}
                title={ALGORITHM_NAMES[alg]}
              >
                <span
                  className="alg-dot"
                  style={{ background: isActive ? color : 'rgba(255,255,255,0.15)' }}
                />
                <span style={{ flex: 1, fontSize: 12 }}>{ALGORITHM_SHORT_NAMES[alg]}</span>
                {alg === 'round_robin' && isActive && (
                  <span className="badge badge-amber" style={{ fontSize: 9 }}>q={roundRobinQuantum}</span>
                )}
                {alg.includes('preemptive') && isActive && alg !== 'round_robin' && (
                  <span className="badge badge-cyan" style={{ fontSize: 9 }}>PREEMPT</span>
                )}
              </button>
            );
          })}

          {/* Description blurb */}
          <div style={{
            marginTop: 12,
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.025)',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{ fontSize: 10, color: ALG_COLORS[selectedAlgorithm], fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {ALGORITHM_SHORT_NAMES[selectedAlgorithm]}
            </div>
            <p style={{ fontSize: 10.5, color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
              {ALGORITHM_DESCRIPTIONS[selectedAlgorithm]}
            </p>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="sidebar-section">
        <div className="sidebar-section-label">
          <SlidersHorizontal size={9} />
          Configuration
        </div>

        {/* Collapsible settings toggle */}
        <button
          className="sidebar-action-btn"
          onClick={() => setSettingsOpen(!settingsOpen)}
          style={{ justifyContent: 'space-between' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SlidersHorizontal size={13} />
            Scheduler Params
          </span>
          {settingsOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>

        {settingsOpen && (
          <div className="sidebar-settings animate-fade-up">
            {/* Round Robin Quantum */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
                  RR Quantum (q)
                </span>
                <span className="badge badge-amber mono">{roundRobinQuantum} ticks</span>
              </div>
              <input
                type="range" min={1} max={10} step={1}
                value={roundRobinQuantum}
                onChange={e => setRoundRobinQuantum(Number(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-dim)', marginTop: 2 }}>
                <span>1 (Fine)</span><span>10 (Coarse)</span>
              </div>
            </div>

            {/* Context Switch Overhead */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Context Switch (c)
                </span>
                <span className="badge badge-indigo mono">{contextSwitchOverhead}t</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0, 1, 2].map(cs => (
                  <button
                    key={cs}
                    onClick={() => setContextSwitchOverhead(cs)}
                    style={{
                      flex: 1, padding: '5px 0', borderRadius: 6, fontSize: 10,
                      fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, cursor: 'pointer',
                      border: '1px solid',
                      background: contextSwitchOverhead === cs ? 'rgba(99,102,241,0.2)' : 'transparent',
                      borderColor: contextSwitchOverhead === cs ? 'rgba(99,102,241,0.4)' : 'var(--border-subtle)',
                      color: contextSwitchOverhead === cs ? 'var(--accent-indigo-bright)' : 'var(--text-muted)',
                    }}
                  >
                    {cs === 0 ? 'Ideal' : `${cs}t`}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Convention */}
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>
                Priority Convention
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['lower_is_higher', 'higher_is_higher'] as const).map(opt => (
                  <button
                    key={opt}
                    onClick={() => setPriorityOrder(opt)}
                    style={{
                      flex: 1, padding: '5px 4px', borderRadius: 6, fontSize: 9,
                      fontWeight: 600, cursor: 'pointer', border: '1px solid',
                      background: priorityOrder === opt ? 'rgba(99,102,241,0.2)' : 'transparent',
                      borderColor: priorityOrder === opt ? 'rgba(99,102,241,0.4)' : 'var(--border-subtle)',
                      color: priorityOrder === opt ? 'var(--accent-indigo-bright)' : 'var(--text-muted)',
                    }}
                  >
                    {opt === 'lower_is_higher' ? '1=High (UNIX)' : '10=High (Win)'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Presets & Export */}
        <div style={{ marginTop: 8 }}>
          <button className="sidebar-action-btn" onClick={onOpenPresets}>
            <Sparkles size={13} style={{ color: 'var(--accent-amber)' }} />
            <span>Load Preset Scenario</span>
          </button>
          <button className="sidebar-action-btn" onClick={onExportData}>
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: 10,
        color: 'var(--text-dim)',
        fontFamily: 'JetBrains Mono, monospace',
        lineHeight: 1.6,
      }}>
        <div>Space → Play/Pause</div>
        <div>← → → Step through</div>
        <div>R → Reset</div>
      </div>
    </aside>
  );
};
