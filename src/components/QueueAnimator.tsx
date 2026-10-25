import React from 'react';
import { Process, SimulationResult } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface QueueAnimatorProps {
  currentTime: number;
  simResult: SimulationResult;
  processes: Process[];
}

export const QueueAnimator: React.FC<QueueAnimatorProps> = ({ currentTime, simResult, processes }) => {
  const currentSnapshot = simResult.historyStates[currentTime] || simResult.historyStates[0] || {
    time: 0, runningProcessId: null, readyQueue: [], completedProcesses: [],
    futureProcesses: [], pcbs: {}, isContextSwitching: false,
  };

  const { runningProcessId, readyQueue, isContextSwitching, pcbs, completedProcesses } = currentSnapshot;

  return (
    <div style={{ width: '100%', maxWidth: 700, margin: '0 auto 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 20, fontFamily: 'var(--font-sans)', fontSize: '1.2rem', color: 'var(--text-main)' }}>
        State Machine & Queue
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 20 }}>
        
        {/* Ready Queue Section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', marginBottom: 10, color: 'var(--text-muted)' }}>Ready Queue</div>
          <div style={{ 
            width: '100%', height: 80, border: '2px dashed var(--text-main)', borderRadius: 8,
            display: 'flex', alignItems: 'center', padding: '0 10px', gap: 10, overflowX: 'auto',
            background: 'var(--bg-right)'
          }}>
            <AnimatePresence mode="popLayout">
              {readyQueue.map((pId) => {
                const pcb = pcbs[pId];
                const proc = processes.find(p => p.id === pId);
                if (!pcb || !proc) return null;
                return (
                  <motion.div
                    layout
                    key={pId}
                    initial={{ opacity: 0, scale: 0.8, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    style={{
                      width: 50, height: 50, borderRadius: '50%', backgroundColor: proc.color || 'var(--color-blue)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      border: '2px solid var(--text-main)', color: 'var(--text-main)', fontWeight: 600,
                      fontFamily: 'var(--font-sans)', fontSize: '0.9rem', boxShadow: '2px 2px 0px rgba(0,0,0,0.1)'
                    }}
                  >
                    {pId}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {readyQueue.length === 0 && (
              <div style={{ margin: '0 auto', fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>Empty</div>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div style={{ color: 'var(--text-main)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </div>

        {/* CPU Core Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', marginBottom: 10, color: 'var(--text-muted)' }}>CPU Core</div>
          <div style={{ 
            width: 120, height: 120, border: '3px solid var(--text-main)', borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
            background: isContextSwitching ? '#f5f5f5' : 'var(--bg-right)',
            boxShadow: '4px 4px 0px rgba(0,0,0,0.1)', overflow: 'hidden'
          }}>
            <AnimatePresence mode="wait">
              {isContextSwitching ? (
                <motion.div
                  key="cs"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 2s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
                  </svg>
                  <span style={{ fontSize: '0.7rem', marginTop: 8, fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Switching</span>
                  <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                </motion.div>
              ) : runningProcessId ? (
                <motion.div
                  key={runningProcessId}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  style={{
                    width: 80, height: 80, borderRadius: '50%', 
                    backgroundColor: processes.find(p => p.id === runningProcessId)?.color || 'var(--color-red)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid var(--text-main)', color: 'var(--text-main)',
                    boxShadow: '2px 2px 0px rgba(0,0,0,0.1)'
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '1.2rem', fontFamily: 'var(--font-sans)' }}>{runningProcessId}</span>
                  {pcbs[runningProcessId] && (
                    <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                      rem: {pcbs[runningProcessId].remainingTime}
                    </span>
                  )}
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 600 }}>
                  Idle
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Arrow */}
        <div style={{ color: 'var(--text-main)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </div>

        {/* Completed Section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', marginBottom: 10, color: 'var(--text-muted)' }}>Terminated</div>
          <div style={{ 
            width: '100%', height: 80, border: '2px solid var(--text-main)', borderRadius: 8,
            display: 'flex', alignItems: 'center', padding: '10px', gap: 6, flexWrap: 'wrap',
            overflowY: 'auto', alignContent: 'flex-start',
            background: '#fafafa'
          }}>
            {completedProcesses.length === 0 && (
              <div style={{ width: '100%', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>None</div>
            )}
            {completedProcesses.map((pId) => {
              const proc = processes.find(p => p.id === pId);
              if (!proc) return null;
              return (
                <motion.div
                  key={pId}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    width: 24, height: 24, borderRadius: '50%', backgroundColor: proc.color || 'var(--color-green)',
                    border: '1px solid var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', fontWeight: 700, fontFamily: 'var(--font-sans)', color: 'var(--text-main)'
                  }}
                  title={`Process ${pId} Completed`}
                >
                  {pId}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
