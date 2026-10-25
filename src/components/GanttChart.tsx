import React from 'react';
import { TimeSlice, Process } from '../types';

interface GanttChartProps {
  timeSlices: TimeSlice[];
  currentTime: number;
  onSeek: (time: number) => void;
  processes: Process[];
}

export const GanttChart: React.FC<GanttChartProps> = ({ timeSlices, currentTime, onSeek, processes }) => {
  const totalDuration = timeSlices.length;

  if (totalDuration === 0) return null;

  // Compress adjacent time slices into continuous blocks
  const blocks = [];
  let cur = null;
  timeSlices.forEach((slice, idx) => {
    if (!cur) {
      cur = { ...slice, startTime: slice.time, endTime: slice.time + 1, duration: 1 };
    } else if (cur.processId === slice.processId && cur.isContextSwitch === slice.isContextSwitch && cur.isIdle === slice.isIdle) {
      cur.endTime += 1;
      cur.duration += 1;
    } else {
      blocks.push(cur);
      cur = { ...slice, startTime: slice.time, endTime: slice.time + 1, duration: 1 };
    }
    if (idx === timeSlices.length - 1 && cur) blocks.push(cur);
  });

  return (
    <div style={{ width: '100%', maxWidth: 700, margin: '40px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 20, fontFamily: 'var(--font-sans)', fontSize: '1.2rem', color: 'var(--text-main)' }}>
        Execution Timeline
      </div>

      <div style={{ position: 'relative', height: 100 }}>
        {/* Main Axis Line */}
        <div className="axis-line" style={{ position: 'absolute', bottom: 30 }} />

        {/* Axis Ticks */}
        <div style={{ position: 'absolute', bottom: 30, left: 0, right: 0, height: 10 }}>
          {blocks.map((b, i) => (
            <div key={i} className="axis-tick" style={{ left: `${(b.startTime / totalDuration) * 100}%` }}>
              <span className="axis-label">{b.startTime}</span>
            </div>
          ))}
          <div className="axis-tick" style={{ left: '100%' }}>
             <span className="axis-label">{totalDuration}</span>
          </div>
        </div>

        {/* Gantt Blocks */}
        <div style={{ position: 'absolute', bottom: 32, left: 0, right: 0, height: 60, display: 'flex' }}>
          {blocks.map((block, idx) => {
            const widthPct = (block.duration / totalDuration) * 100;
            const isPast = block.endTime <= currentTime;
            
            // Assign specific colors
            let bg = block.isIdle ? 'transparent' : block.isContextSwitch ? '#eee' : block.color || 'var(--color-blue)';
            if (!block.isIdle && !block.isContextSwitch && idx % 2 === 0) bg = 'var(--color-blue)';
            if (!block.isIdle && !block.isContextSwitch && idx % 2 === 1) bg = 'var(--color-red)';

            return (
              <div
                key={idx}
                onClick={() => onSeek(block.startTime)}
                style={{
                  width: `${widthPct}%`,
                  height: '100%',
                  backgroundColor: bg,
                  border: block.isIdle ? 'none' : '1px solid var(--text-main)',
                  borderBottom: 'none',
                  opacity: isPast ? 1 : 0.3,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'opacity 0.2s',
                  position: 'relative'
                }}
              >
                {!block.isIdle && !block.isContextSwitch && (
                  <span>{block.processId}</span>
                )}
                {block.isContextSwitch && (
                  <span style={{ fontSize: '0.7rem', color: '#999' }}>CS</span>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Current Time Needle */}
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: `${(currentTime / totalDuration) * 100}%`,
          width: 2,
          height: 90,
          backgroundColor: 'var(--text-main)',
          zIndex: 10,
          transition: 'left 0.3s ease-out'
        }}>
          <div style={{ 
            position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--text-main)', color: 'white', padding: '2px 6px', borderRadius: 4,
            fontSize: '0.7rem', fontFamily: 'var(--font-sans)'
          }}>
            t={currentTime}
          </div>
        </div>
      </div>
    </div>
  );
};
