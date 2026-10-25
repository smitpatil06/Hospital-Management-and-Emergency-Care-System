import React from 'react';
import { AlgorithmMetrics, Process } from '../types';
import { motion } from 'motion/react';

interface ResultsTableProps {
  metrics: AlgorithmMetrics;
  processes: Process[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ metrics, processes }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ marginTop: '2rem', width: '100%', maxWidth: 700, margin: '2rem auto 0' }}
    >
      <div style={{ textAlign: 'center', marginBottom: 15, fontFamily: 'var(--font-sans)', fontSize: '1.2rem', color: 'var(--text-main)' }}>
        Final Execution Results
      </div>
      
      <table className="minimal-table" style={{ width: '100%', textAlign: 'center', border: '1px solid var(--text-muted)' }}>
        <thead style={{ background: '#f5f5f5' }}>
          <tr>
            <th style={{ padding: '10px', borderBottom: '2px solid var(--text-main)', textAlign: 'center' }}>Process</th>
            <th style={{ padding: '10px', borderBottom: '2px solid var(--text-main)', textAlign: 'center' }}>AT (Arrival)</th>
            <th style={{ padding: '10px', borderBottom: '2px solid var(--text-main)', textAlign: 'center' }}>BT (Burst)</th>
            <th style={{ padding: '10px', borderBottom: '2px solid var(--text-main)', textAlign: 'center' }}>CT (Completion)</th>
            <th style={{ padding: '10px', borderBottom: '2px solid var(--text-main)', textAlign: 'center' }}>TAT (Turnaround)</th>
            <th style={{ padding: '10px', borderBottom: '2px solid var(--text-main)', textAlign: 'center' }}>WT (Waiting)</th>
          </tr>
        </thead>
        <tbody>
          {processes.map(proc => {
            const pMetrics = metrics.processMetrics[proc.id];
            if (!pMetrics) return null;
            return (
              <tr key={proc.id}>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd', fontWeight: 600 }}>{proc.id}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{pMetrics.arrivalTime}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{pMetrics.burstTime}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{pMetrics.completionTime}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{pMetrics.turnaroundTime}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{pMetrics.waitingTime}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot style={{ background: '#fafafa', fontWeight: 600 }}>
          <tr>
            <td colSpan={4} style={{ padding: '10px', textAlign: 'right', borderTop: '2px solid var(--text-main)' }}>Averages:</td>
            <td style={{ padding: '10px', borderTop: '2px solid var(--text-main)' }}>{metrics.avgTurnaroundTime.toFixed(2)}</td>
            <td style={{ padding: '10px', borderTop: '2px solid var(--text-main)' }}>{metrics.avgWaitingTime.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </motion.div>
  );
};
