import React from 'react';
import { PresetScenario } from '../types';
import { PRESET_SCENARIOS } from '../data/presets';
import { Sparkles, X, ArrowRight } from 'lucide-react';

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetScenario) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Educational: '#6366f1',
  'Edge Cases': '#f59e0b',
  Benchmark: '#10b981',
};

export const PresetModal: React.FC<PresetModalProps> = ({ isOpen, onClose, onSelectPreset }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box animate-fade-up">
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--bg-panel)', borderRadius: '20px 20px 0 0', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} style={{ color: 'var(--accent-amber)' }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Educational Scenarios</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Curated workloads illustrating classical OS scheduling phenomena</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 24px 24px' }}>
          {PRESET_SCENARIOS.map((preset, idx) => {
            const catColor = CATEGORY_COLORS[preset.category] || '#6366f1';
            return (
              <div
                key={preset.id}
                onClick={() => { onSelectPreset(preset); onClose(); }}
                style={{
                  padding: '16px', borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.05)',
                  background: 'rgba(255,255,255,0.02)',
                  cursor: 'pointer', marginBottom: 10,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${catColor}10`;
                  e.currentTarget.style.borderColor = `${catColor}30`;
                  e.currentTarget.style.boxShadow = `0 0 20px ${catColor}10`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{preset.title}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: `${catColor}18`, border: `1px solid ${catColor}30`, color: catColor, fontFamily: 'JetBrains Mono, monospace' }}>
                      {preset.category}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: catColor, opacity: 0, transition: 'opacity 0.2s' }} className="preset-load-hint">
                    <span>Load</span><ArrowRight size={11} />
                  </div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 10px' }}>
                  {preset.description}
                </p>
                <div style={{ padding: '8px 12px', borderRadius: 9, background: `rgba(245,158,11,0.06)`, border: '1px solid rgba(245,158,11,0.15)', fontSize: 11, marginBottom: 10 }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>Key Insight: </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{preset.keyTakeaway}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>Tasks:</span>
                  {preset.processes.map(p => (
                    <span key={p.id} style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: p.color, color: 'white', flexShrink: 0 }}>
                      {p.id} (AT:{p.arrivalTime} BT:{p.burstTime})
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
