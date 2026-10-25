import React from 'react';
import { AlgorithmType } from '../types';
import { ALGORITHM_SHORT_NAMES, ALGORITHM_NAMES } from '../utils/scheduler';
import { Cpu, BarChart3, BookOpen, Sparkles, SlidersHorizontal, Settings2, Download } from 'lucide-react';

interface HeaderProps {
  currentTab: 'visualizer' | 'comparison' | 'theory';
  setCurrentTab: (tab: 'visualizer' | 'comparison' | 'theory') => void;
  selectedAlgorithm: AlgorithmType;
  setSelectedAlgorithm: (alg: AlgorithmType) => void;
  roundRobinQuantum: number;
  setRoundRobinQuantum: (q: number) => void;
  contextSwitchOverhead: number;
  setContextSwitchOverhead: (cs: number) => void;
  priorityOrder: 'lower_is_higher' | 'higher_is_higher';
  setPriorityOrder: (order: 'lower_is_higher' | 'higher_is_higher') => void;
  onOpenPresets: () => void;
  onExportData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  selectedAlgorithm,
  setSelectedAlgorithm,
  roundRobinQuantum,
  setRoundRobinQuantum,
  contextSwitchOverhead,
  setContextSwitchOverhead,
  priorityOrder,
  setPriorityOrder,
  onOpenPresets,
  onExportData,
}) => {
  const [showSettings, setShowSettings] = React.useState(false);

  const algorithms: AlgorithmType[] = [
    'fcfs',
    'sjf_non_preemptive',
    'sjf_preemptive',
    'round_robin',
    'priority_non_preemptive',
    'priority_preemptive',
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  CPU Scheduling Visualizer
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Interactive Lab
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Seeing Theory & Data-Driven Process Simulation
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 text-xs font-semibold">
            <button
              id="nav-tab-visualizer"
              onClick={() => setCurrentTab('visualizer')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentTab === 'visualizer'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Simulator</span>
            </button>
            <button
              id="nav-tab-comparison"
              onClick={() => setCurrentTab('comparison')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentTab === 'comparison'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Multi-Compare</span>
            </button>
            <button
              id="nav-tab-theory"
              onClick={() => setCurrentTab('theory')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentTab === 'theory'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Theory & Insights</span>
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              id="btn-presets-header"
              onClick={onOpenPresets}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/70 text-xs font-semibold transition-colors"
              title="Load Educational Presets"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Presets</span>
            </button>

            <div className="relative">
              <button
                id="btn-settings-toggle"
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                  showSettings
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title="Simulation Configuration"
              >
                <Settings2 className="w-4 h-4" />
              </button>

              {/* Settings Dropdown Popover */}
              {showSettings && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                      Scheduler Parameters
                    </span>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4 pt-3 text-xs">
                    {/* Time Quantum */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-medium text-slate-700">
                          Round Robin Quantum (q)
                        </label>
                        <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {roundRobinQuantum} ticks
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={roundRobinQuantum}
                        onChange={(e) => setRoundRobinQuantum(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
                        <span>1 (Fine)</span>
                        <span>5</span>
                        <span>10 (Coarse)</span>
                      </div>
                    </div>

                    {/* Context Switch Overhead */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-medium text-slate-700">
                          Context Switch Overhead (c)
                        </label>
                        <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {contextSwitchOverhead} tick{contextSwitchOverhead !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[0, 1, 2].map((cs) => (
                          <button
                            key={cs}
                            onClick={() => setContextSwitchOverhead(cs)}
                            className={`py-1 rounded text-center font-mono font-medium transition-all ${
                              contextSwitchOverhead === cs
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {cs === 0 ? '0 (Ideal)' : `${cs} tick`}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Simulates register state saving & PCB loading cost.
                      </p>
                    </div>

                    {/* Priority Convention */}
                    <div>
                      <label className="font-medium text-slate-700 block mb-1.5">
                        Priority Value Rule
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => setPriorityOrder('lower_is_higher')}
                          className={`py-1.5 px-2 rounded text-center font-medium text-[11px] transition-all ${
                            priorityOrder === 'lower_is_higher'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          1 = Highest (UNIX)
                        </button>
                        <button
                          onClick={() => setPriorityOrder('higher_is_higher')}
                          className={`py-1.5 px-2 rounded text-center font-medium text-[11px] transition-all ${
                            priorityOrder === 'higher_is_higher'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          10 = Highest (Win)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              id="btn-export-csv"
              onClick={onExportData}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
              title="Export Simulation Metrics"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Algorithm Pills Bar (shown in visualizer mode) */}
        {currentTab === 'visualizer' && (
          <div className="py-2.5 flex items-center space-x-1.5 overflow-x-auto border-t border-slate-100 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Algorithm:
            </span>
            {algorithms.map((alg) => {
              const isSelected = selectedAlgorithm === alg;
              return (
                <button
                  key={alg}
                  id={`btn-alg-${alg}`}
                  onClick={() => setSelectedAlgorithm(alg)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-300 ring-2 ring-indigo-600/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                  title={ALGORITHM_NAMES[alg]}
                >
                  <span>{ALGORITHM_SHORT_NAMES[alg]}</span>
                  {alg.includes('preemptive') && (
                    <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${isSelected ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 text-slate-600'}`}>
                      Preempt
                    </span>
                  )}
                  {alg === 'round_robin' && (
                    <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${isSelected ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 text-slate-600'}`}>
                      q={roundRobinQuantum}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
