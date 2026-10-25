export type AlgorithmType =
  | 'fcfs'
  | 'sjf_non_preemptive'
  | 'sjf_preemptive' // SRTF
  | 'round_robin'
  | 'priority_non_preemptive'
  | 'priority_preemptive';

export interface Process {
  id: string;          // e.g. "P1"
  name: string;        // e.g. "Process 1"
  arrivalTime: number; // >= 0
  burstTime: number;   // >= 1
  priority: number;    // integer (1-10)
  color: string;       // hex or tailwind class identifier
  memoryKB?: number;   // memory requirement, used by the Memory Management module
}

export type ProcessState = 'NEW' | 'READY' | 'RUNNING' | 'WAITING' | 'TERMINATED';

export interface ProcessPCB {
  id: string;
  name: string;
  color: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  remainingTime: number;
  state: ProcessState;
  startTime: number | null;
  completionTime: number | null;
  turnaroundTime: number | null;
  waitingTime: number;
  responseTime: number | null;
  contextSwitches: number;
}

export interface TimeSlice {
  time: number;                  // starting unit of time, e.g. t=0, t=1...
  processId: string | null;      // null = idle, '__CS__' = context switch overhead
  processName?: string;
  color?: string;
  isContextSwitch?: boolean;
  isIdle?: boolean;
}

export interface StepExplanation {
  time: number;
  title: string;
  action: 'DISPATCH' | 'EXECUTE' | 'PREEMPT' | 'COMPLETE' | 'IDLE' | 'CONTEXT_SWITCH' | 'ARRIVE';
  activeProcessId: string | null;
  readyQueueIds: string[];
  rationale: string;
  formulaHighlight?: string;
}

export interface AlgorithmMetrics {
  totalTime: number;
  cpuBusyTime: number;
  cpuIdleTime: number;
  contextSwitchCount: number;
  contextSwitchOverheadTime: number;
  cpuUtilization: number;        // percentage e.g. 92.5%
  throughput: number;            // processes per unit time
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  avgResponseTime: number;
  processMetrics: {
    [processId: string]: {
      arrivalTime: number;
      burstTime: number;
      startTime: number;
      completionTime: number;
      turnaroundTime: number;
      waitingTime: number;
      responseTime: number;
      contextSwitches: number;
    };
  };
}

export interface SimulationResult {
  algorithm: AlgorithmType;
  timeSlices: TimeSlice[];
  stepExplanations: StepExplanation[];
  metrics: AlgorithmMetrics;
  historyStates: {
    time: number;
    runningProcessId: string | null;
    readyQueue: string[];
    completedProcesses: string[];
    futureProcesses: string[];
    pcbs: Record<string, ProcessPCB>;
    isContextSwitching: boolean;
  }[];
}

export interface PresetScenario {
  id: string;
  title: string;
  subtitle: string;
  category: 'Educational' | 'Edge Cases' | 'Benchmark';
  description: string;
  keyTakeaway: string;
  processes: Process[];
  recommendedAlgorithm: AlgorithmType;
  roundRobinQuantum?: number;
  contextSwitchTime?: number;
  priorityOrder?: 'lower_is_higher' | 'higher_is_higher';
}
