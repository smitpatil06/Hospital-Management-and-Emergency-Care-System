import React, { useState } from 'react';
import { BookOpen, RefreshCw, AlertTriangle, Play, Pause } from 'lucide-react';

export const InteractiveTheoryGuide: React.FC = () => {
  const [convoyOrder, setConvoyOrder] = useState<'heavy_first' | 'light_first'>('heavy_first');
  const convoyWaitTimes = convoyOrder === 'heavy_first'
      ? { avg: ((0 + 12 + 14 + 15) / 4).toFixed(1) }
      : { avg: ((0 + 2 + 3 + 6) / 4).toFixed(1) };

  const [toyQuantum, setToyQuantum] = useState<number>(2);
  const toyProcesses = [6, 4, 8];
  const estimatedSwitches = toyProcesses.reduce((acc, b) => acc + Math.ceil(b / toyQuantum) - 1, 0);
  const estimatedResponseAvg = ((0 + toyQuantum + 2 * toyQuantum) / 3).toFixed(1);

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 60 }}>
      {/* Intro Header */}
      <div style={{ textAlign: 'center', paddingBottom: 24, borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: 'rgba(99,102,241,0.1)', color: 'var(--accent-indigo-bright)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
          <BookOpen size={12} /> Interactive Visual Textbook
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
          Visualizing CPU Scheduling & State Dynamics
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
          Explore the mathematical mechanics, preemption boundaries, and trade-offs below with interactive models.
        </p>
      </div>

      {/* Chapter 1: Convoy Effect */}
      <section className="glass-card" style={{ padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>1</div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>The Convoy Effect (FCFS Bottleneck)</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>Why short jobs suffer behind heavy workloads</p>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
          If a long CPU-bound process arrives first, all subsequent short I/O-bound processes get trapped behind it in the ready queue. Toggle the arrival order below to see how putting short jobs first (SJF) slashes average wait time.
        </p>

        <div style={{ padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sequence Order</span>
            <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.3)', padding: 4, borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
              <button
                onClick={() => setConvoyOrder('heavy_first')}
                style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.15s', background: convoyOrder === 'heavy_first' ? 'rgba(244,63,94,0.2)' : 'transparent', color: convoyOrder === 'heavy_first' ? 'var(--accent-rose)' : 'var(--text-muted)' }}
              >
                Heavy First (Convoy)
              </button>
              <button
                onClick={() => setConvoyOrder('light_first')}
                style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.15s', background: convoyOrder === 'light_first' ? 'rgba(16,185,129,0.2)' : 'transparent', color: convoyOrder === 'light_first' ? 'var(--accent-emerald)' : 'var(--text-muted)' }}
              >
                Short First (SJF)
              </button>
            </div>
          </div>

          <div style={{ height: 40, display: 'flex', borderRadius: 8, overflow: 'hidden', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', fontSize: 11, fontWeight: 700, color: 'white', fontFamily: 'JetBrains Mono, monospace', marginBottom: 16 }}>
            {convoyOrder === 'heavy_first' ? (
              <>
                <div style={{ width: '66.6%', background: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(0,0,0,0.2)' }}>P1 (12u)</div>
                <div style={{ width: '11.1%', background: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(0,0,0,0.2)' }}>P2</div>
                <div style={{ width: '5.5%', background: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(0,0,0,0.2)' }}>P3</div>
                <div style={{ width: '16.8%', background: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>P4</div>
              </>
            ) : (
              <>
                <div style={{ width: '11.1%', background: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(0,0,0,0.2)' }}>P2</div>
                <div style={{ width: '5.5%', background: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(0,0,0,0.2)' }}>P3</div>
                <div style={{ width: '16.8%', background: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(0,0,0,0.2)' }}>P4</div>
                <div style={{ width: '66.6%', background: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>P1 (12u)</div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
            <span style={{ color: 'var(--text-dim)' }}>Avg Wait: <b style={{ color: 'var(--text-primary)', fontSize: 14 }}>{convoyWaitTimes.avg}t</b></span>
            <span style={{ fontWeight: 700, color: convoyOrder === 'heavy_first' ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
              {convoyOrder === 'heavy_first' ? '⚠️ High Bottleneck (+275%)' : '✓ Optimal Minimum'}
            </span>
          </div>
        </div>
      </section>

      {/* Chapter 2: Round Robin */}
      <section className="glass-card" style={{ padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(6,182,212,0.15)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>2</div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>The Round Robin Quantum Dilemma</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>Balancing latency against context switch thrashing</p>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
          If <i>q</i> is very large, Round Robin degenerates into FCFS. If <i>q</i> is extremely small, the CPU spends most of its cycles performing context switches instead of useful work.
        </p>

        <div style={{ padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Adjust Time Quantum (q)</span>
            <span className="badge badge-cyan mono" style={{ fontSize: 10 }}>q = {toyQuantum}t</span>
          </div>

          <input
            type="range" min="1" max="8" step="1"
            value={toyQuantum} onChange={e => setToyQuantum(Number(e.target.value))}
            style={{ width: '100%', marginBottom: 20 }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 6 }}>Context Switches</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'JetBrains Mono, monospace' }}>{estimatedSwitches}</div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>
                {toyQuantum === 1 ? '⚠️ CPU Thrashing' : toyQuantum >= 6 ? 'Low overhead' : 'Balanced'}
              </div>
            </div>
            <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 6 }}>Avg First Response</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono, monospace' }}>{estimatedResponseAvg}t</div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>
                {toyQuantum === 1 ? 'Instant interactivity' : toyQuantum >= 6 ? '⚠️ Sluggish UI' : 'Fair responsiveness'}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
