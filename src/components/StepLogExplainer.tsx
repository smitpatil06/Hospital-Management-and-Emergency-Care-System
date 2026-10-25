import React, { useRef, useEffect } from 'react';
import { StepExplanation, Process } from '../types';
import { Activity, ChevronRight } from 'lucide-react';

interface StepLogExplainerProps {
  stepExplanations: StepExplanation[];
  currentTime: number;
  onSeek: (time: number) => void;
  processes: Process[];
}

const ACTION_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  COMPLETE: { color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
  PREEMPT: { color: '#f43f5e', bg: 'rgba(244,63,94,0.15)', border: 'rgba(244,63,94,0.3)' },
  CONTEXT_SWITCH: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
  IDLE: { color: '#64748b', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.25)' },
  DISPATCH: { color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.3)' },
  ARRIVE: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)' },
  EXECUTE: { color: '#6366f1', bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)' },
};

export const StepLogExplainer: React.FC<StepLogExplainerProps> = ({
  stepExplanations, currentTime, onSeek, processes,
}) => {
  const activeStep = stepExplanations.find(s => s.time === currentTime) || stepExplanations[currentTime] || stepExplanations[0];
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = document.getElementById(`step-log-item-${currentTime}`);
    if (el && listRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentTime]);

  const getStyle = (action: StepExplanation['action']) =>
    ACTION_STYLES[action] || ACTION_STYLES.EXECUTE;

  return (
    <div className="glass-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#f59e0b', fontStyle: 'italic' }}>?</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Decision Reasoner</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Scheduler logic explained at each tick</div>
          </div>
        </div>
        <span className="badge badge-indigo mono" style={{ fontSize: 10 }}>t={currentTime}</span>
      </div>

      {/* Active step spotlight */}
      {activeStep ? (() => {
        const s = getStyle(activeStep.action);
        return (
          <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: s.color, background: s.bg, border: `1px solid ${s.border}`, padding: '2px 8px', borderRadius: 99, fontFamily: 'JetBrains Mono, monospace' }}>
                {activeStep.action}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{activeStep.title}</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>t={activeStep.time}</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {activeStep.rationale}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: `1px solid ${s.border}`, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                Queue: <b style={{ color: 'var(--text-primary)' }}>
                  {activeStep.readyQueueIds.length > 0 ? `[${activeStep.readyQueueIds.join(', ')}]` : 'Empty'}
                </b>
              </span>
              {activeStep.activeProcessId && (
                <span style={{ color: s.color, fontWeight: 700 }}>CPU: {activeStep.activeProcessId}</span>
              )}
            </div>
          </div>
        );
      })() : (
        <div style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: 12, textAlign: 'center', marginBottom: 16 }}>
          No step at tick {currentTime}
        </div>
      )}

      {/* History feed */}
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Activity size={11} /> History
      </div>
      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 220 }}>
        {stepExplanations.map(step => {
          const isCurrent = step.time === currentTime;
          const s = getStyle(step.action);
          return (
            <div
              id={`step-log-item-${step.time}`}
              key={step.time}
              onClick={() => onSeek(step.time)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
                background: isCurrent ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isCurrent ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.04)'}`,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="mono" style={{ fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4, background: isCurrent ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)', color: isCurrent ? 'var(--accent-indigo-bright)' : 'var(--text-dim)' }}>
                  t={step.time}
                </span>
                <span style={{ fontSize: 11, color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isCurrent ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 170 }}>
                  {step.title}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 9, color: s.color, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{step.action}</span>
                <ChevronRight size={11} style={{ color: isCurrent ? 'var(--accent-indigo-bright)' : 'var(--text-dim)' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
