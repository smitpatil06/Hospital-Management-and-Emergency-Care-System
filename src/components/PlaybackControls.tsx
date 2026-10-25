import React from 'react';

interface PlaybackControlsProps {
  currentTime: number;
  maxTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onToggleSpeed: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  currentTime, maxTime, isPlaying, playbackSpeed,
  onTogglePlay, onStepForward, onStepBackward, onReset, onToggleSpeed
}) => {
  return (
    <div className="transport-bar">
      <button className="transport-btn" onClick={onReset} title="Reset">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
      </button>
      <button className="transport-btn" onClick={onStepBackward} disabled={currentTime <= 0}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>
      </button>
      <button className="transport-btn" onClick={onTogglePlay} style={{ border: '1px solid var(--text-main)', borderRadius: '50%', padding: '12px' }}>
        {isPlaying ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        )}
      </button>
      <button className="transport-btn" onClick={onStepForward} disabled={currentTime >= maxTime}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
      </button>
      <button className="transport-btn" onClick={onToggleSpeed} style={{ fontSize: '0.9rem', fontWeight: 600, fontFamily: 'var(--font-sans)', width: '40px' }}>
        {playbackSpeed}x
      </button>
    </div>
  );
};
