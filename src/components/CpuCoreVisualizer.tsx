import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Process, ProcessPCB } from '../types';
import { Cpu, CheckCircle2, Clock, Zap, RefreshCw, ArrowRight, Info } from 'lucide-react';

interface CpuCoreVisualizerProps {
  currentTime: number;
  runningProcessId: string | null;
  readyQueueIds: string[];
  completedProcessIds: string[];
  futureProcessIds: string[];
  pcbs: Record<string, ProcessPCB>;
  processes: Process[];
  isContextSwitching: boolean;
  algorithmName: string;
  roundRobinQuantum?: number;
}

export const CpuCoreVisualizer: React.FC<CpuCoreVisualizerProps> = ({
  currentTime, runningProcessId, readyQueueIds, completedProcessIds,
  futureProcessIds, pcbs, processes, isContextSwitching, algorithmName, roundRobinQuantum,
}) => {
  const [inspectedId, setInspectedId] = useState<string | null>(null);

  const runningPcb = runningProcessId ? pcbs[runningProcessId] : null;
  const inspectedPcb = inspectedId ? pcbs[inspectedId] : runningPcb;
  const newProcesses = futureProcessIds.map(id => pcbs[id]).filter(Boolean);
  const readyProcesses = readyQueueIds.map(id => pcbs[id]).filter(Boolean);
  const terminatedProcesses = completedProcessIds.map(id => pcbs[id]).filter(Boolean);

  const burstProgress = runningPcb
    ? ((runningPcb.burstTime - runningPcb.remainingTime) / runningPcb.burstTime) * 100
    : 0;

  return (
    <div style={{
      background: 'linear-gradient(145deg, #0c1a2e, #071020)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 20,
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Grid Background */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        borderRadius: 20,
      }} />

      {/* Header Bar */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Cpu size={16} color="var(--accent-indigo-bright)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                CPU State Machine
              </span>
              <span className="badge badge-indigo mono" style={{ fontSize: 9 }}>t={currentTime}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Algorithm: <span style={{ color: 'var(--accent-indigo-bright)', fontWeight: 600 }}>{algorithmName}</span>
            </div>
          </div>
        </div>

        {/* Status badge */}
        {isContextSwitching ? (
          <div className="badge badge-amber" style={{ fontSize: 11, padding: '5px 12px', animation: 'pulse 1.5s ease-in-out infinite' }}>
            <RefreshCw size={11} style={{ marginRight: 5, animation: 'spin-slow 1s linear infinite' }} />
            Context Switching
          </div>
        ) : runningProcessId ? (
          <div className="badge badge-emerald" style={{ fontSize: 11, padding: '5px 12px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-emerald)', marginRight: 6, animation: 'ping-dot 1.5s ease-in-out infinite', display: 'inline-block' }} />
            CORE BUSY · {runningProcessId}
          </div>
        ) : (
          <div className="badge" style={{ fontSize: 11, padding: '5px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
            CORE IDLE
          </div>
        )}
      </div>

      {/* Main 3-column layout: Ready Queue → CPU Core → Terminated */}
      <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: 0, alignItems: 'center' }}>
        {/* === READY QUEUE === */}
        <div style={{ background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 14, padding: '14px 12px', minHeight: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Clock size={13} style={{ color: 'var(--accent-cyan)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Ready Queue
              </span>
            </div>
            <span className="badge badge-cyan mono" style={{ fontSize: 9 }}>{readyQueueIds.length}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 140 }}>
            {readyQueueIds.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', paddingTop: 30 }}>
                — Queue empty —
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {readyQueueIds.map((pId, idx) => {
                  const pcb = pcbs[pId];
                  if (!pcb) return null;
                  const isHead = idx === 0;
                  return (
                    <motion.div
                      key={pId}
                      layout
                      initial={{ opacity: 0, x: -16, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 20, scale: 0.85 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      onClick={() => setInspectedId(pId)}
                      className="process-card"
                      style={{
                        borderColor: isHead ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.06)',
                        boxShadow: isHead ? '0 0 14px rgba(6,182,212,0.12)' : 'none',
                      }}
                    >
                      {isHead && (
                        <div style={{
                          position: 'absolute', top: -8, left: 8,
                          fontSize: 9, fontWeight: 700, background: 'var(--accent-cyan)',
                          color: '#000', padding: '2px 6px', borderRadius: 99,
                        }}>NEXT</div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 800, padding: '2px 6px', borderRadius: 5,
                          background: pcb.color, color: 'white',
                          fontFamily: 'JetBrains Mono, monospace',
                        }}>
                          {pcb.id}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>
                          p={pcb.priority}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>
                        <span style={{ color: 'var(--accent-amber)' }}>rem: {pcb.remainingTime}</span>
                        <span style={{ color: 'var(--text-dim)' }}>wt: {pcb.waitingTime}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Arrow: Queue → CPU */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 12px' }}>
          <ArrowRight size={18} style={{ color: runningProcessId ? 'var(--accent-cyan)' : 'var(--text-dim)' }} />
          <span style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>dispatch</span>
        </div>

        {/* === CPU CORE === */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(99,102,241,0.1), rgba(99,102,241,0.04))',
          border: `1px solid ${runningProcessId ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 16, padding: '16px 14px', minHeight: 220,
          display: 'flex', flexDirection: 'column',
          boxShadow: runningProcessId ? '0 0 30px rgba(99,102,241,0.12)' : 'none',
          transition: 'box-shadow 0.4s ease',
          minWidth: 180,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
            <Zap size={13} style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              ALU Core
            </span>
            <span className="badge badge-indigo mono" style={{ fontSize: 9, marginLeft: 'auto' }}>Single</span>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AnimatePresence mode="wait">
              {isContextSwitching ? (
                <motion.div
                  key="cs"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  style={{
                    textAlign: 'center', padding: '14px',
                    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: 12, width: '100%',
                  }}
                >
                  <RefreshCw size={24} color="#f59e0b" style={{ margin: '0 auto 8px', animation: 'spin-slow 1s linear infinite' }} />
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace' }}>CONTEXT SWITCH</div>
                  <div style={{ fontSize: 9, color: 'rgba(245,158,11,0.6)', marginTop: 4 }}>Saving PCB state…</div>
                </motion.div>
              ) : runningPcb ? (
                <motion.div
                  key={runningPcb.id}
                  initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  onClick={() => setInspectedId(runningPcb.id)}
                  style={{
                    width: '100%', padding: '12px',
                    background: `linear-gradient(135deg, ${runningPcb.color}18, ${runningPcb.color}08)`,
                    border: `1px solid ${runningPcb.color}60`,
                    borderRadius: 12, cursor: 'pointer',
                    boxShadow: `0 0 24px ${runningPcb.color}30`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 800, padding: '2px 7px', borderRadius: 5,
                      background: runningPcb.color, color: 'white', fontFamily: 'JetBrains Mono, monospace',
                    }}>
                      {runningPcb.id}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>p={runningPcb.priority}</span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {runningPcb.name}
                  </div>
                  {/* Progress bar */}
                  <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 99, height: 5, overflow: 'hidden', marginBottom: 6 }}>
                    <motion.div
                      animate={{ width: `${burstProgress}%` }}
                      transition={{ duration: 0.3 }}
                      style={{ height: '100%', background: runningPcb.color, borderRadius: 99 }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>
                    <span style={{ color: 'var(--text-dim)' }}>
                      Progress: <b style={{ color: 'var(--text-secondary)' }}>{runningPcb.burstTime - runningPcb.remainingTime}/{runningPcb.burstTime}</b>
                    </span>
                    <span style={{ color: 'var(--text-dim)' }}>
                      Rem: <b style={{ color: 'var(--accent-amber)' }}>{runningPcb.remainingTime}</b>
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ textAlign: 'center', color: 'var(--text-dim)' }}
                >
                  <Cpu size={28} style={{ margin: '0 auto 8px', color: 'var(--text-dim)' }} />
                  <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>CPU Idle</div>
                  <div style={{ fontSize: 9, marginTop: 4 }}>Awaiting jobs…</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{ textAlign: 'center', fontSize: 9, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', marginTop: 10 }}>
            Fetch → Decode → Execute
          </div>
        </div>

        {/* Arrow: CPU → Done */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 12px' }}>
          <ArrowRight size={18} style={{ color: terminatedProcesses.length > 0 ? 'var(--accent-emerald)' : 'var(--text-dim)' }} />
          <span style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>retire</span>
        </div>

        {/* === TERMINATED === */}
        <div style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 14, padding: '14px 12px', minHeight: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <CheckCircle2 size={13} style={{ color: 'var(--accent-emerald)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Terminated
              </span>
            </div>
            <span className="badge badge-emerald mono" style={{ fontSize: 9 }}>
              {terminatedProcesses.length}/{processes.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 170, overflowY: 'auto' }}>
            {terminatedProcesses.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', paddingTop: 30 }}>
                — None finished yet —
              </div>
            ) : (
              terminatedProcesses.map(pcb => (
                <div
                  key={pcb.id}
                  onClick={() => setInspectedId(pcb.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
                    background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.12)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.06)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4,
                      background: pcb.color, color: 'white', fontFamily: 'JetBrains Mono, monospace',
                    }}>{pcb.id}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{pcb.name}</span>
                  </div>
                  <span className="badge badge-emerald mono" style={{ fontSize: 9 }}>
                    TAT:{pcb.turnaroundTime}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom: State flow + PCB Inspector */}
      <div style={{ position: 'relative', zIndex: 1, marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Process lifecycle states */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            5-State Process Lifecycle
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {[
              { label: 'New', count: newProcesses.length, color: 'var(--accent-indigo-bright)', desc: 'Not arrived' },
              { label: 'Ready', count: readyProcesses.length, color: 'var(--accent-cyan)', desc: 'In queue' },
              { label: 'Running', count: runningProcessId && !isContextSwitching ? 1 : 0, color: 'var(--accent-emerald)', desc: 'On CPU' },
              { label: 'Done', count: terminatedProcesses.length, color: '#10b981', desc: 'Exited' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 10, padding: '10px 8px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: s.color, textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{s.count}</div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 2 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PCB Inspector */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Info size={12} style={{ color: 'var(--accent-indigo-bright)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-indigo-bright)' }}>
              PCB Inspector: {inspectedPcb?.id || '—'}
            </span>
            {inspectedPcb && (
              <span className="badge badge-indigo mono" style={{ fontSize: 9, marginLeft: 'auto' }}>
                {inspectedPcb.state}
              </span>
            )}
          </div>
          {inspectedPcb ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              {[
                { label: 'Arrival', val: inspectedPcb.arrivalTime, color: 'var(--text-secondary)' },
                { label: 'Burst', val: inspectedPcb.burstTime, color: 'var(--text-secondary)' },
                { label: 'Priority', val: inspectedPcb.priority, color: 'var(--text-secondary)' },
                { label: 'Waiting', val: inspectedPcb.waitingTime, color: 'var(--accent-amber)' },
                { label: 'Response', val: inspectedPcb.responseTime !== null ? inspectedPcb.responseTime : '—', color: 'var(--accent-cyan)' },
                { label: 'TAT', val: inspectedPcb.turnaroundTime !== null ? inspectedPcb.turnaroundTime : '—', color: 'var(--accent-emerald)' },
              ].map(f => (
                <div key={f.label} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 7, padding: '7px 8px' }}>
                  <div style={{ fontSize: 9, color: 'var(--text-dim)', marginBottom: 2, fontFamily: 'JetBrains Mono, monospace' }}>{f.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: f.color, fontFamily: 'JetBrains Mono, monospace' }}>{f.val}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>
              Click any process card to inspect its PCB registers and metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
