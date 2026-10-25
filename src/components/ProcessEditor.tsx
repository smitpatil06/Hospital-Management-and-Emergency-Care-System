import React from 'react';
import { AlgorithmType, Process } from '../types';

interface ProcessEditorProps {
  processes: Process[];
  setProcesses: (procs: Process[]) => void;
  selectedAlgorithm: AlgorithmType;
}

export const ProcessEditor: React.FC<ProcessEditorProps> = ({ processes, setProcesses, selectedAlgorithm }) => {
  const isPriorityAlgorithm = selectedAlgorithm === 'priority_non_preemptive' || selectedAlgorithm === 'priority_preemptive';

  const handleUpdate = (index: number, field: keyof Process, value: any) => {
    const updated = [...processes];
    updated[index] = { ...updated[index], [field]: value };
    setProcesses(updated);
  };

  const handleAdd = () => {
    if (processes.length >= 6) return;
    const nextNum = processes.length + 1;
    const colors = ['var(--color-blue)', 'var(--color-red)', 'var(--color-yellow)', 'var(--color-green)', 'var(--color-purple)'];
    setProcesses([...processes, {
      id: `P${nextNum}`, name: `Process ${nextNum}`,
      arrivalTime: Math.floor(Math.random() * 5),
      burstTime: Math.floor(Math.random() * 5) + 2,
      priority: Math.floor(Math.random() * 4) + 1,
      color: colors[processes.length % colors.length],
    }]);
  };

  const handleRemove = (id: string) => {
    if (processes.length <= 1) return;
    setProcesses(processes.filter(p => p.id !== id));
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <table className="minimal-table">
        <thead>
          <tr>
            <th>Process</th>
            <th>Arrival Time</th>
            <th>Burst Time</th>
            {isPriorityAlgorithm && <th>Priority</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((proc, idx) => (
            <tr key={proc.id}>
              <td style={{ fontWeight: 600 }}>{proc.id}</td>
              <td>
                <input 
                  type="number" className="clean-input" style={{ width: 60 }} 
                  min={0} max={20} value={proc.arrivalTime} 
                  onChange={e => handleUpdate(idx, 'arrivalTime', Number(e.target.value))} 
                />
              </td>
              {isPriorityAlgorithm && (
                <td>
                  <input
                    type="number" className="clean-input" style={{ width: 60 }}
                    min={1} max={10} step={1} value={proc.priority}
                    onChange={e => handleUpdate(idx, 'priority', Number(e.target.value))}
                  />
                </td>
              )}
              <td>
                <input 
                  type="number" className="clean-input" style={{ width: 60 }} 
                  min={1} max={20} value={proc.burstTime} 
                  onChange={e => handleUpdate(idx, 'burstTime', Number(e.target.value))} 
                />
              </td>
              <td>
                <button onClick={() => handleRemove(proc.id)} className="clean-button" style={{ border: 'none', padding: 4 }}>
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleAdd} className="clean-button" disabled={processes.length >= 6}>
        + Add Process
      </button>
    </div>
  );
};
