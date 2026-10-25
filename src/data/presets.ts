import { PresetScenario } from '../types';

export const PRESET_PALETTES = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
];

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'hospital-emergency',
    title: 'Hospital Emergency Care Workload',
    subtitle: 'Problem 1: emergency admissions must preempt routine hospital tasks',
    category: 'Educational',
    description: 'Emergency admission, patient registration, lab report, pharmacy request and medical imaging compete for the CPU, memory and shared equipment. Priority 1 is the most urgent.',
    keyTakeaway: 'Preemptive priority scheduling serves emergencies immediately, at the cost of longer waits for low-priority pharmacy and registration tasks.',
    recommendedAlgorithm: 'priority_preemptive',
    roundRobinQuantum: 2,
    contextSwitchTime: 0,
    priorityOrder: 'lower_is_higher',
    processes: [
      { id: 'P1', name: 'Emergency Admission', arrivalTime: 0, burstTime: 5, priority: 1, color: '#ef4444', memoryKB: 212 },
      { id: 'P2', name: 'Patient Registration', arrivalTime: 1, burstTime: 3, priority: 3, color: '#3b82f6', memoryKB: 112 },
      { id: 'P3', name: 'Lab Report', arrivalTime: 2, burstTime: 4, priority: 2, color: '#10b981', memoryKB: 417 },
      { id: 'P4', name: 'Pharmacy Request', arrivalTime: 3, burstTime: 2, priority: 4, color: '#f59e0b', memoryKB: 95 },
      { id: 'P5', name: 'Medical Imaging', arrivalTime: 4, burstTime: 6, priority: 2, color: '#8b5cf6', memoryKB: 426 },
    ],
  },
  {
    id: 'convoy-effect',
    title: 'The Convoy Effect (FCFS Bottleneck)',
    subtitle: 'Demonstrates why FCFS suffers when a CPU-heavy process arrives first',
    category: 'Educational',
    description: 'A heavy compute job (P1, burst 16) arrives first at t=0, followed shortly by three interactive light jobs (P2, P3, P4 with bursts 2, 1, 3). Compare FCFS against SJF or SRTF to see average waiting time plunge.',
    keyTakeaway: 'FCFS creates huge queue bottlenecks ("convoys") behind long jobs. SJF/SRTF drastically reduces average waiting time by serving short jobs first.',
    recommendedAlgorithm: 'fcfs',
    roundRobinQuantum: 3,
    contextSwitchTime: 0,
    priorityOrder: 'lower_is_higher',
    processes: [
      { id: 'P1', name: 'Video Render', arrivalTime: 0, burstTime: 16, priority: 3, color: '#3b82f6' },
      { id: 'P2', name: 'Mouse Event', arrivalTime: 1, burstTime: 2, priority: 1, color: '#10b981' },
      { id: 'P3', name: 'Keystroke', arrivalTime: 2, burstTime: 1, priority: 1, color: '#ec4899' },
      { id: 'P4', name: 'Audio Buffer', arrivalTime: 3, burstTime: 3, priority: 2, color: '#8b5cf6' },
    ],
  },
  {
    id: 'srtf-preemption',
    title: 'SRTF Live Preemption Showcase',
    subtitle: 'Watch the CPU preempt executing jobs as shorter tasks arrive',
    category: 'Educational',
    description: 'P1 starts running at t=0, but when P2 arrives at t=1 with a shorter burst, the CPU preempts P1 immediately. Observe the exact remaining-time comparison at each clock tick.',
    keyTakeaway: 'SRTF (Preemptive SJF) is mathematically provable to yield the minimum possible average waiting time for any set of fixed processes.',
    recommendedAlgorithm: 'sjf_preemptive',
    roundRobinQuantum: 2,
    contextSwitchTime: 0,
    priorityOrder: 'lower_is_higher',
    processes: [
      { id: 'P1', name: 'Database Query', arrivalTime: 0, burstTime: 8, priority: 3, color: '#3b82f6' },
      { id: 'P2', name: 'Cache Hit', arrivalTime: 1, burstTime: 4, priority: 2, color: '#10b981' },
      { id: 'P3', name: 'File Sync', arrivalTime: 2, burstTime: 9, priority: 4, color: '#f59e0b' },
      { id: 'P4', name: 'HTTP Ping', arrivalTime: 3, burstTime: 2, priority: 1, color: '#ec4899' },
      { id: 'P5', name: 'DNS Lookup', arrivalTime: 5, burstTime: 3, priority: 2, color: '#8b5cf6' },
    ],
  },
  {
    id: 'rr-quantum-tradeoff',
    title: 'Round Robin Quantum Dilemma',
    subtitle: 'Exploring the trade-off between Response Time and Context Switch overhead',
    category: 'Benchmark',
    description: 'Four interactive processes with medium bursts. Try varying the Quantum q from 1 to 8, or toggle Context Switch Overhead to see how frequent preemption impacts throughput.',
    keyTakeaway: 'Small quantum gives near-instant response time for user interactivity, but increases context switches. Large quantum approaches FCFS performance.',
    recommendedAlgorithm: 'round_robin',
    roundRobinQuantum: 2,
    contextSwitchTime: 1,
    priorityOrder: 'lower_is_higher',
    processes: [
      { id: 'P1', name: 'Web Browser', arrivalTime: 0, burstTime: 6, priority: 2, color: '#3b82f6' },
      { id: 'P2', name: 'Code Editor', arrivalTime: 1, burstTime: 4, priority: 1, color: '#10b981' },
      { id: 'P3', name: 'Terminal Shell', arrivalTime: 2, burstTime: 8, priority: 3, color: '#f59e0b' },
      { id: 'P4', name: 'Music Player', arrivalTime: 3, burstTime: 5, priority: 2, color: '#ec4899' },
    ],
  },
  {
    id: 'priority-starvation',
    title: 'Priority Scheduling & Starvation',
    subtitle: 'How low-priority background jobs can be perpetually starved',
    category: 'Edge Cases',
    description: 'P1 is a low-priority background process (Priority 5, lower priority). As time progresses, higher-priority jobs (Priority 1 & 2) keep arriving, causing P1 to wait indefinitely.',
    keyTakeaway: 'Unbounded priority scheduling leads to starvation (indefinite blocking). Real OS kernels use "Aging" (gradually boosting priority over wait time) to solve this.',
    recommendedAlgorithm: 'priority_preemptive',
    roundRobinQuantum: 3,
    contextSwitchTime: 0,
    priorityOrder: 'lower_is_higher',
    processes: [
      { id: 'P1', name: 'Disk Defrag (Low)', arrivalTime: 0, burstTime: 10, priority: 5, color: '#3b82f6' },
      { id: 'P2', name: 'UI Render (High)', arrivalTime: 1, burstTime: 3, priority: 1, color: '#10b981' },
      { id: 'P3', name: 'Network Packet', arrivalTime: 3, burstTime: 4, priority: 2, color: '#f59e0b' },
      { id: 'P4', name: 'User Tap (Urgent)', arrivalTime: 6, burstTime: 2, priority: 1, color: '#ec4899' },
      { id: 'P5', name: 'Audio Output', arrivalTime: 9, burstTime: 3, priority: 1, color: '#8b5cf6' },
    ],
  },
  {
    id: 'os-textbook-standard',
    title: 'Classic Operating Systems Benchmark',
    subtitle: 'Standard 5-process workload from Operating System Concepts (Silberschatz)',
    category: 'Benchmark',
    description: 'The standard multi-process benchmark evaluated across all fundamental CPU scheduling algorithms to contrast average turnaround and waiting times side-by-side.',
    keyTakeaway: 'Different algorithms excel under different criteria: FCFS has zero overhead, SJF minimizes average wait, RR guarantees fair sharing.',
    recommendedAlgorithm: 'fcfs',
    roundRobinQuantum: 3,
    contextSwitchTime: 0,
    priorityOrder: 'lower_is_higher',
    processes: [
      { id: 'P1', name: 'Process 1', arrivalTime: 0, burstTime: 10, priority: 3, color: '#3b82f6' },
      { id: 'P2', name: 'Process 2', arrivalTime: 1, burstTime: 1, priority: 1, color: '#10b981' },
      { id: 'P3', name: 'Process 3', arrivalTime: 2, burstTime: 2, priority: 3, color: '#f59e0b' },
      { id: 'P4', name: 'Process 4', arrivalTime: 3, burstTime: 1, priority: 4, color: '#ec4899' },
      { id: 'P5', name: 'Process 5', arrivalTime: 4, burstTime: 5, priority: 2, color: '#8b5cf6' },
    ],
  },
];
