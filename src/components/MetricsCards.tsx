import React from 'react';
import { AlgorithmMetrics, Process } from '../types';

interface MetricsCardsProps {
  metrics: AlgorithmMetrics;
  processes: Process[];
  algorithmName: string;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  return (
    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: 'var(--font-sans)' }}>
        Performance Metrics
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: '1px dashed rgba(0,0,0,0.1)', paddingBottom: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Average Waiting Time
          </span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', fontWeight: 600 }}>
            {metrics.avgWaitingTime.toFixed(1)} ticks
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: '1px dashed rgba(0,0,0,0.1)', paddingBottom: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Average Turnaround Time
          </span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', fontWeight: 600 }}>
            {metrics.avgTurnaroundTime.toFixed(1)} ticks
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: '1px dashed rgba(0,0,0,0.1)', paddingBottom: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            CPU Utilization
          </span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', fontWeight: 600 }}>
            {metrics.cpuUtilization.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};
