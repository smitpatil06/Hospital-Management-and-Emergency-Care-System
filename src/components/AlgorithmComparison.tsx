import React, { useState } from 'react';
import { AlgorithmType, Process, SimulationResult } from '../types';
import { simulateAlgorithm, ALGORITHM_NAMES, ALGORITHM_SHORT_NAMES, ALGORITHM_DESCRIPTIONS } from '../utils/scheduler';
import { BarChart3, Trophy, Check, ArrowRight, Zap, Clock, Cpu } from 'lucide-react';

interface AlgorithmComparisonProps {
  processes: Process[];
  roundRobinQuantum: number;
  contextSwitchOverhead: number;
  priorityOrder: 'lower_is_higher' | 'higher_is_higher';
  onSelectAlgorithmForSimulator: (alg: AlgorithmType) => void;
}

function groupTimeSlices(slices: SimulationResult['timeSlices']) {
  return slices.reduce<Array<{ slice: SimulationResult['timeSlices'][number]; duration: number }>>((groups, slice) => {
    const previous = groups[groups.length - 1];
    if (previous && previous.slice.processId === slice.processId && previous.slice.isIdle === slice.isIdle && previous.slice.isContextSwitch === slice.isContextSwitch) {
      previous.duration += 1;
    } else {
      groups.push({ slice, duration: 1 });
    }
    return groups;
  }, []);
}

export const AlgorithmComparison: React.FC<AlgorithmComparisonProps> = ({
  processes, roundRobinQuantum, contextSwitchOverhead, priorityOrder, onSelectAlgorithmForSimulator,
}) => {
  const algorithms: AlgorithmType[] = [
    'fcfs', 'sjf_non_preemptive', 'sjf_preemptive',
    'round_robin', 'priority_non_preemptive', 'priority_preemptive',
  ];

  const [activeMetric, setActiveMetric] = useState<'avgWaitingTime' | 'avgTurnaroundTime' | 'avgResponseTime' | 'contextSwitchCount'>('avgWaitingTime');

  const results = algorithms.map(alg => {
    const sim = simulateAlgorithm(alg, processes, { roundRobinQuantum, contextSwitchOverhead, priorityOrder });
    return { algorithm: alg, name: ALGORITHM_NAMES[alg], shortName: ALGORITHM_SHORT_NAMES[alg], description: ALGORITHM_DESCRIPTIONS[alg], sim, metrics: sim.metrics };
  });

  const minWaitResult = [...results].sort((a, b) => a.metrics.avgWaitingTime - b.metrics.avgWaitingTime)[0];
  const minTATResult = [...results].sort((a, b) => a.metrics.avgTurnaroundTime - b.metrics.avgTurnaroundTime)[0];
  const minResponseResult = [...results].sort((a, b) => a.metrics.avgResponseTime - b.metrics.avgResponseTime)[0];
  const minCSResult = [...results].sort((a, b) => a.metrics.contextSwitchCount - b.metrics.contextSwitchCount)[0];

  const maxWait = Math.max(...results.map(r => r.metrics.avgWaitingTime), 1);
  const maxTAT = Math.max(...results.map(r => r.metrics.avgTurnaroundTime), 1);
  const maxResponse = Math.max(...results.map(r => r.metrics.avgResponseTime), 1);
  const maxCS = Math.max(...results.map(r => r.metrics.contextSwitchCount), 1);
  const maxHorizon = Math.max(...results.map(r => r.metrics.totalTime), 1);

  return (
    <div className="algorithm-comparison" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Banner */}
      <div className="comparison-hero" style={{
        background: 'linear-gradient(135deg, rgba(30,27,75,0.4), rgba(15,23,42,0.6))',
        borderRadius: 24, padding: 24, border: '1px solid rgba(99,102,241,0.2)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Trophy size={20} style={{ color: 'var(--accent-amber)' }} />
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Performance Benchmark</h2>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Evaluating 6 algorithms simultaneously on {processes.length} identical processes
            </p>
          </div>
          <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', background: 'rgba(0,0,0,0.4)', padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
            Workload: <b style={{ color: 'var(--accent-indigo-bright)' }}>{processes.map(p => `${p.id}(${p.burstTime})`).join(', ')}</b>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 16 }}>
          {[
            { label: 'Lowest Avg Wait', winner: minWaitResult, val: `${minWaitResult.metrics.avgWaitingTime}t`, icon: <Clock size={14} />, color: '#f59e0b' },
            { label: 'Lowest Avg TAT', winner: minTATResult, val: `${minTATResult.metrics.avgTurnaroundTime}t`, icon: <Zap size={14} />, color: '#10b981' },
            { label: 'Best Response Time', winner: minResponseResult, val: `${minResponseResult.metrics.avgResponseTime}t`, icon: <Check size={14} />, color: '#06b6d4' },
            { label: 'Minimum Switches', winner: minCSResult, val: `${minCSResult.metrics.contextSwitchCount} switches`, icon: <Cpu size={14} />, color: '#8b5cf6' },
          ].map((w, i) => (
            <div key={i} style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: `1px solid ${w.color}30` }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: w.color, display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span>{w.label}</span>{w.icon}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{w.winner.shortName}</div>
              <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: w.color, opacity: 0.8 }}>{w.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Side-by-side Gantt */}
      <div className="comparison-panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)', marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              <BarChart3 size={16} style={{ color: 'var(--accent-indigo-bright)' }} /> Side-by-Side Gantt Comparison
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Visual alignment of execution orders</div>
          </div>
          <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-dim)' }}>
            Horizon: 0 → {maxHorizon}t
          </div>
        </div>

        <div className="comparison-axis" aria-hidden="true">
          <span>0</span>
          <span>{Math.round(maxHorizon / 2)}t</span>
          <span>{maxHorizon}t</span>
        </div>

        <div className="comparison-legend">
          {processes.map(proc => (
            <span key={proc.id}>
              <i style={{ background: proc.color }} /> {proc.id}
            </span>
          ))}
          <span><i className="legend-idle" /> Idle</span>
        </div>

        <div className="comparison-rows">
          {results.map((r, index) => {
            const isWinner = minWaitResult.algorithm === r.algorithm;
            const groupedSlices = groupTimeSlices(r.sim.timeSlices);
            return (
              <div key={r.algorithm} className={`comparison-row ${isWinner ? 'comparison-row-winner' : ''}`} style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                <div className="comparison-row-top">
                  <div className="comparison-row-title">
                    <span className="comparison-row-number">0{index + 1}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{r.shortName}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.name}</span>
                    {isWinner && <span className="badge badge-amber mono" style={{ fontSize: 9 }}>★ MIN WAIT</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
                    <span style={{ color: 'var(--text-dim)' }}>WT: <b style={{ color: 'var(--accent-amber)' }}>{r.metrics.avgWaitingTime}</b></span>
                    <span style={{ color: 'var(--text-dim)' }}>TAT: <b style={{ color: 'var(--accent-emerald)' }}>{r.metrics.avgTurnaroundTime}</b></span>
                    <span style={{ color: 'var(--text-dim)' }}>RT: <b style={{ color: 'var(--accent-cyan)' }}>{r.metrics.avgResponseTime}</b></span>
                    <button
                      onClick={() => onSelectAlgorithmForSimulator(r.algorithm)}
                      style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: 'rgba(99,102,241,0.15)', color: 'var(--accent-indigo-bright)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      SIMULATE <ArrowRight size={10} />
                    </button>
                  </div>
                </div>

                <div className="comparison-lane" style={{ height: 28, display: 'flex', borderRadius: 8, overflow: 'hidden', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  {groupedSlices.map(({ slice, duration }, i) => {
                    const proc = processes.find(p => p.id === slice.processId);
                    const label = slice.isContextSwitch ? 'CS' : slice.isIdle ? 'Idle' : proc?.id;
                    return (
                      <div
                        key={i}
                        title={`t=${slice.time}-${slice.time + duration} ${proc?.id || (slice.isContextSwitch ? 'Context switch' : 'Idle')}`}
                        style={{
                          width: `${(duration / maxHorizon) * 100}%`, height: '100%',
                          background: slice.isIdle ? 'transparent' : slice.isContextSwitch ? 'rgba(245,158,11,0.3)' : (proc?.color || '#6366f1'),
                          opacity: slice.isContextSwitch ? 1 : 0.7,
                          borderRight: '1px solid rgba(0,0,0,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-sans)',
                        }}
                      >
                        {duration / maxHorizon > 0.08 && <span>{label}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metrics Bar Charts */}
      <div className="comparison-panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'avgWaitingTime', label: 'Avg Wait', color: '#f59e0b' },
              { id: 'avgTurnaroundTime', label: 'Avg TAT', color: '#10b981' },
              { id: 'avgResponseTime', label: 'Avg RT', color: '#06b6d4' },
              { id: 'contextSwitchCount', label: 'Context Switches', color: '#8b5cf6' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setActiveMetric(m.id as any)}
                style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                  background: activeMetric === m.id ? `${m.color}20` : 'transparent',
                  border: `1px solid ${activeMetric === m.id ? `${m.color}50` : 'rgba(255,255,255,0.1)'}`,
                  color: activeMetric === m.id ? m.color : 'var(--text-muted)',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {results.map(r => {
            const val = r.metrics[activeMetric];
            const maxVal = activeMetric === 'avgWaitingTime' ? maxWait :
                           activeMetric === 'avgTurnaroundTime' ? maxTAT :
                           activeMetric === 'avgResponseTime' ? maxResponse : maxCS;
            const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
            const isWinner = minWaitResult.algorithm === r.algorithm && activeMetric === 'avgWaitingTime' ||
                             minTATResult.algorithm === r.algorithm && activeMetric === 'avgTurnaroundTime' ||
                             minResponseResult.algorithm === r.algorithm && activeMetric === 'avgResponseTime' ||
                             minCSResult.algorithm === r.algorithm && activeMetric === 'contextSwitchCount';

            let color = '#6366f1';
            if (activeMetric === 'avgWaitingTime') color = '#f59e0b';
            if (activeMetric === 'avgTurnaroundTime') color = '#10b981';
            if (activeMetric === 'avgResponseTime') color = '#06b6d4';
            if (activeMetric === 'contextSwitchCount') color = '#8b5cf6';

            return (
              <div key={r.algorithm} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 60, flexShrink: 0, textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {r.shortName}
                </div>
                <div style={{ flex: 1, height: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: color, opacity: isWinner ? 1 : 0.5, borderRadius: 99, transition: 'width 0.4s ease, opacity 0.2s' }} />
                </div>
                <div style={{ width: 40, flexShrink: 0, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: isWinner ? color : 'var(--text-dim)', fontWeight: isWinner ? 700 : 400 }}>
                  {val.toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Final comparison summary */}
      <div className="comparison-summary" style={{ padding: 24, borderLeft: '4px solid var(--accent-indigo-bright)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Trophy size={18} style={{ color: 'var(--accent-amber)' }} />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Comparison Summary</h3>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>
          For this workload, <strong style={{ color: 'var(--accent-amber)' }}>{minWaitResult.name}</strong> gives the lowest average waiting time at <strong>{minWaitResult.metrics.avgWaitingTime} ticks</strong>.{' '}
          <strong style={{ color: 'var(--accent-cyan)' }}>{minResponseResult.name}</strong> gives the fastest average response at <strong>{minResponseResult.metrics.avgResponseTime} ticks</strong>, while{' '}
          <strong style={{ color: 'var(--accent-emerald)' }}>{minTATResult.name}</strong> gives the lowest average turnaround time at <strong>{minTATResult.metrics.avgTurnaroundTime} ticks</strong>.{' '}
          The best choice depends on whether this system values short queues, quick interaction, or fast overall completion.
        </p>
      </div>
    </div>
  );
};
