import React, { useState, useMemo, useEffect } from 'react';
import { AlgorithmType, Process, SimulationResult } from './types';
import { PRESET_SCENARIOS } from './data/presets';
import { simulateAlgorithm, ALGORITHM_NAMES, ALGORITHM_DESCRIPTIONS } from './utils/scheduler';
import { PlaybackControls } from './components/PlaybackControls';
import { GanttChart } from './components/GanttChart';
import { QueueAnimator } from './components/QueueAnimator';
import { ProcessEditor } from './components/ProcessEditor';
import { MetricsCards } from './components/MetricsCards';
import { ResultsTable } from './components/ResultsTable';
import { AlgorithmComparison } from './components/AlgorithmComparison';
import { TabBar, ProducerConsumer, BankersAlgorithm, MemoryManager } from './components/HospitalModules';

export default function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('priority_preemptive');
  const [view, setView] = useState<'cpu' | 'sync' | 'bank' | 'mem'>('cpu');
  const [processes, setProcesses] = useState<Process[]>(PRESET_SCENARIOS[0].processes);
  const [roundRobinQuantum, setRoundRobinQuantum] = useState<number>(2);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isCompareRoute, setIsCompareRoute] = useState<boolean>(() => window.location.pathname === '/compare');

  const simResult: SimulationResult = useMemo(() => {
    return simulateAlgorithm(selectedAlgorithm, processes, {
      roundRobinQuantum, contextSwitchOverhead: 0, priorityOrder: 'lower_is_higher',
    });
  }, [selectedAlgorithm, processes, roundRobinQuantum]);

  const maxTime = simResult.timeSlices.length;

  useEffect(() => {
    if (currentTime > maxTime) setCurrentTime(maxTime);
  }, [maxTime, currentTime]);

  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= maxTime) {
            setIsPlaying(false);
            return maxTime;
          }
          return prev + 1;
        });
      }, 500 / playbackSpeed);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [isPlaying, maxTime, playbackSpeed]);

  const handleSeek = (t: number) => { setIsPlaying(false); setCurrentTime(Math.max(0, Math.min(maxTime, t))); };
  
  const toggleSpeed = () => setPlaybackSpeed(s => s === 1 ? 2 : s === 2 ? 4 : s === 4 ? 0.5 : 1);

  useEffect(() => {
    const handlePopState = () => setIsCompareRoute(window.location.pathname === '/compare');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: '/' | '/compare') => {
    window.history.pushState({}, '', path);
    setIsCompareRoute(path === '/compare');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const comparisonSection = (
    <section className="comparison-section">
      <div className="comparison-section-inner">
        <div className="comparison-heading">
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Algorithm Analysis
          </div>
          <h2 style={{ fontSize: '2rem', margin: 0 }}>Compare All Scheduling Algorithms</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: '0.75rem 0 0' }}>
            Every algorithm executes the same process workload so their complete Gantt charts and results can be compared fairly.
          </p>
        </div>
        <AlgorithmComparison
          processes={processes}
          roundRobinQuantum={roundRobinQuantum}
          contextSwitchOverhead={0}
          priorityOrder="lower_is_higher"
          onSelectAlgorithmForSimulator={(algorithm) => {
            setSelectedAlgorithm(algorithm);
            setCurrentTime(0);
            setIsPlaying(false);
            navigateTo('/');
          }}
        />
      </div>
    </section>
  );

  return (
    <>
      <TabBar view={view} setView={setView} />
      {view === 'sync' ? <ProducerConsumer />
        : view === 'bank' ? <BankersAlgorithm processes={processes} />
        : view === 'mem' ? <MemoryManager processes={processes} />
        : isCompareRoute ? (
        <div className="comparison-route-page">
          <button className="comparison-back-button" onClick={() => navigateTo('/')}>
            <span aria-hidden="true">←</span> Back to Simulator
          </button>
          {comparisonSection}
        </div>
      ) : (
        <>
          <div className="split-layout">
      {/* Left Pane - Theory & Controls */}
      <div className="pane-left">
        <div className="menu-icon">
          <span /><span /><span />
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', fontFamily: 'var(--font-sans)' }}>
          Simulation Configuration
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
            Algorithm Strategy
          </div>
          <select 
            className="clean-select" 
            value={selectedAlgorithm} 
            onChange={(e) => { setSelectedAlgorithm(e.target.value as AlgorithmType); setCurrentTime(0); setIsPlaying(false); }}
            style={{ width: '100%', padding: '10px', fontSize: '1rem', marginBottom: '1rem' }}
          >
            {Object.entries(ALGORITHM_NAMES).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
          
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', fontStyle: 'italic' }}>
            {ALGORITHM_DESCRIPTIONS[selectedAlgorithm]}
          </div>

          {selectedAlgorithm === 'round_robin' && (
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem' }}>Time Quantum (q) = {roundRobinQuantum}</span>
              <input 
                type="range" min="1" max="8" value={roundRobinQuantum} 
                onChange={e => setRoundRobinQuantum(Number(e.target.value))} 
                style={{ flex: 1 }}
              />
            </div>
          )}
        </div>

        <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
          Process Workload
        </div>

        <ProcessEditor 
          processes={processes} 
          selectedAlgorithm={selectedAlgorithm}
          setProcesses={procs => { setProcesses(procs); setCurrentTime(0); setIsPlaying(false); }} 
        />

        <MetricsCards 
          metrics={simResult.metrics} 
          processes={processes} 
          algorithmName={ALGORITHM_NAMES[selectedAlgorithm]} 
        />
      </div>

      {/* Right Pane - Visualization */}
      <div className="pane-right">
        <div className="viz-container">
          <QueueAnimator 
            currentTime={currentTime} 
            simResult={simResult} 
            processes={processes} 
          />
          <GanttChart 
            timeSlices={simResult.timeSlices} 
            currentTime={currentTime} 
            onSeek={handleSeek} 
            processes={processes} 
          />
        </div>

        <PlaybackControls 
          currentTime={currentTime} 
          maxTime={maxTime} 
          isPlaying={isPlaying} 
          playbackSpeed={playbackSpeed}
          onTogglePlay={() => {
            if (currentTime >= maxTime && maxTime > 0) { setCurrentTime(0); setIsPlaying(true); }
            else setIsPlaying(!isPlaying);
          }} 
          onStepBackward={() => { setIsPlaying(false); setCurrentTime(p => Math.max(0, p - 1)); }}
          onStepForward={() => { setIsPlaying(false); setCurrentTime(p => Math.min(maxTime, p + 1)); }}
          onReset={() => { setIsPlaying(false); setCurrentTime(0); }}
          onToggleSpeed={toggleSpeed}
        />

          {currentTime >= maxTime && maxTime > 0 && (
            <ResultsTable metrics={simResult.metrics} processes={processes} />
          )}
        </div>
      </div>

          <button className="compare-route-button" onClick={() => navigateTo('/compare')}>
            <span aria-hidden="true">↗</span> Open Full Algorithm Comparison
          </button>
        </>
      )}
    </>
  );
}
