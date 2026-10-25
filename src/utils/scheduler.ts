import { AlgorithmType, Process, ProcessPCB, SimulationResult, StepExplanation, TimeSlice, AlgorithmMetrics } from '../types';

export interface SchedulerOptions {
  roundRobinQuantum?: number;
  contextSwitchOverhead?: number; // 0 or 1 time units
  priorityOrder?: 'lower_is_higher' | 'higher_is_higher';
}

export const ALGORITHM_NAMES: Record<AlgorithmType, string> = {
  fcfs: 'First-Come, First-Served (FCFS)',
  sjf_non_preemptive: 'Shortest Job First (Non-Preemptive)',
  sjf_preemptive: 'Shortest Remaining Time First (SRTF)',
  round_robin: 'Round Robin (RR)',
  priority_non_preemptive: 'Priority (Non-Preemptive)',
  priority_preemptive: 'Priority (Preemptive)',
};

export const ALGORITHM_SHORT_NAMES: Record<AlgorithmType, string> = {
  fcfs: 'FCFS',
  sjf_non_preemptive: 'SJF',
  sjf_preemptive: 'SRTF',
  round_robin: 'Round Robin',
  priority_non_preemptive: 'Priority (NP)',
  priority_preemptive: 'Priority (P)',
};

export const ALGORITHM_DESCRIPTIONS: Record<AlgorithmType, string> = {
  fcfs: 'Non-preemptive algorithm that allocates the CPU in the order processes arrive. Simple and fair, but vulnerable to the "convoy effect" where short jobs wait behind long ones.',
  sjf_non_preemptive: 'Non-preemptive algorithm selecting the process with the shortest initial burst time. Minimizes average waiting time for batch jobs but requires knowing burst time in advance.',
  sjf_preemptive: 'Preemptive variant of SJF. If a newly arrived job has a remaining burst time shorter than the current job, the CPU is preempted to achieve optimal average waiting time.',
  round_robin: 'Preemptive algorithm designed for time-sharing systems. Each process receives a fixed time slice (quantum). Excellent response time, but performance heavily depends on quantum size.',
  priority_non_preemptive: 'Non-preemptive scheduler that executes the highest priority available process to completion. Ideal for mission-critical jobs, but low-priority jobs may face starvation.',
  priority_preemptive: 'Preemptive scheduler where arriving higher-priority processes immediately preempt lower-priority processes currently executing on the CPU.',
};

export function simulateAlgorithm(
  algorithm: AlgorithmType,
  processes: Process[],
  options: SchedulerOptions = {}
): SimulationResult {
  const quantum = Math.max(1, options.roundRobinQuantum || 2);
  const csOverhead = options.contextSwitchOverhead || 0;
  const lowerIsHigher = options.priorityOrder !== 'higher_is_higher';

  if (!processes || processes.length === 0) {
    return {
      algorithm,
      timeSlices: [],
      stepExplanations: [],
      metrics: {
        totalTime: 0,
        cpuBusyTime: 0,
        cpuIdleTime: 0,
        contextSwitchCount: 0,
        contextSwitchOverheadTime: 0,
        cpuUtilization: 0,
        throughput: 0,
        avgWaitingTime: 0,
        avgTurnaroundTime: 0,
        avgResponseTime: 0,
        processMetrics: {},
      },
      historyStates: [],
    };
  }

  // Clone processes and sort by arrival time initially
  const sortedProcs = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id));

  // Initialize PCBs
  const pcbs: Record<string, ProcessPCB> = {};
  sortedProcs.forEach((p) => {
    pcbs[p.id] = {
      id: p.id,
      name: p.name,
      color: p.color,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority,
      remainingTime: p.burstTime,
      state: 'NEW',
      startTime: null,
      completionTime: null,
      turnaroundTime: null,
      waitingTime: 0,
      responseTime: null,
      contextSwitches: 0,
    };
  });

  const timeSlices: TimeSlice[] = [];
  const stepExplanations: StepExplanation[] = [];
  const historyStates: SimulationResult['historyStates'] = [];

  let currentTime = 0;
  let runningProcessId: string | null = null;
  let readyQueue: string[] = [];
  let completedIds: string[] = [];
  let currentQuantumSpent = 0;
  let contextSwitchTicksRemaining = 0;
  let nextProcessToDispatch: string | null = null;
  let lastRanProcessId: string | null = null;
  let contextSwitchCount = 0;

  const totalBurst = processes.reduce((acc, p) => acc + p.burstTime, 0);
  const maxPossibleTime = Math.max(...processes.map((p) => p.arrivalTime)) + totalBurst * 3 + 50;

  function clonePcbs(source: Record<string, ProcessPCB>): Record<string, ProcessPCB> {
    const copy: Record<string, ProcessPCB> = {};
    for (const id in source) {
      copy[id] = { ...source[id] };
    }
    return copy;
  }

  function getPriorityVal(p: ProcessPCB): number {
    return lowerIsHigher ? p.priority : -p.priority;
  }

  while (completedIds.length < processes.length && currentTime < maxPossibleTime) {
    // 1. Check newly arriving processes at this tick
    const arrivingProcesses = sortedProcs.filter((p) => p.arrivalTime === currentTime);
    arrivingProcesses.forEach((p) => {
      if (pcbs[p.id].state === 'NEW') {
        pcbs[p.id].state = 'READY';
        if (!readyQueue.includes(p.id) && runningProcessId !== p.id) {
          readyQueue.push(p.id);
        }
      }
    });

    // Capture state before execution of this tick
    const futureProcesses = sortedProcs
      .filter((p) => p.arrivalTime > currentTime && pcbs[p.id].state === 'NEW')
      .map((p) => p.id);

    // Save snapshot
    historyStates.push({
      time: currentTime,
      runningProcessId,
      readyQueue: [...readyQueue],
      completedProcesses: [...completedIds],
      futureProcesses,
      pcbs: clonePcbs(pcbs),
      isContextSwitching: contextSwitchTicksRemaining > 0,
    });

    // 2. Handle Context Switch Overhead if active
    if (contextSwitchTicksRemaining > 0) {
      timeSlices.push({
        time: currentTime,
        processId: '__CS__',
        processName: 'Context Switch',
        isContextSwitch: true,
      });

      stepExplanations.push({
        time: currentTime,
        title: `Context Switch Overhead`,
        action: 'CONTEXT_SWITCH',
        activeProcessId: null,
        readyQueueIds: [...readyQueue],
        rationale: `CPU is saving state of previous process and restoring PCB of ${nextProcessToDispatch || 'next process'} (${csOverhead} unit overhead).`,
      });

      contextSwitchTicksRemaining--;
      if (contextSwitchTicksRemaining === 0) {
        runningProcessId = nextProcessToDispatch;
        nextProcessToDispatch = null;
        if (runningProcessId) {
          pcbs[runningProcessId].state = 'RUNNING';
          if (pcbs[runningProcessId].startTime === null) {
            pcbs[runningProcessId].startTime = currentTime + 1;
            pcbs[runningProcessId].responseTime = (currentTime + 1) - pcbs[runningProcessId].arrivalTime;
          }
        }
      }

      // Waiting time increases for ready queue processes
      readyQueue.forEach((qId) => {
        pcbs[qId].waitingTime += 1;
      });

      currentTime++;
      continue;
    }

    // 3. Scheduling Decision Logic
    switch (algorithm) {
      case 'fcfs': {
        if (!runningProcessId && readyQueue.length > 0) {
          const nextId = readyQueue.shift()!;
          if (csOverhead > 0 && lastRanProcessId && lastRanProcessId !== nextId) {
            contextSwitchTicksRemaining = csOverhead;
            nextProcessToDispatch = nextId;
            contextSwitchCount++;
            pcbs[nextId].contextSwitches++;
            continue;
          } else {
            runningProcessId = nextId;
            pcbs[runningProcessId].state = 'RUNNING';
            if (pcbs[runningProcessId].startTime === null) {
              pcbs[runningProcessId].startTime = currentTime;
              pcbs[runningProcessId].responseTime = currentTime - pcbs[runningProcessId].arrivalTime;
            }
          }
        }
        break;
      }

      case 'sjf_non_preemptive': {
        if (!runningProcessId && readyQueue.length > 0) {
          // Sort readyQueue by initial burstTime, then arrivalTime
          readyQueue.sort((a, b) => {
            const diff = pcbs[a].burstTime - pcbs[b].burstTime;
            if (diff !== 0) return diff;
            return pcbs[a].arrivalTime - pcbs[b].arrivalTime;
          });
          const nextId = readyQueue.shift()!;
          if (csOverhead > 0 && lastRanProcessId && lastRanProcessId !== nextId) {
            contextSwitchTicksRemaining = csOverhead;
            nextProcessToDispatch = nextId;
            contextSwitchCount++;
            pcbs[nextId].contextSwitches++;
            continue;
          } else {
            runningProcessId = nextId;
            pcbs[runningProcessId].state = 'RUNNING';
            if (pcbs[runningProcessId].startTime === null) {
              pcbs[runningProcessId].startTime = currentTime;
              pcbs[runningProcessId].responseTime = currentTime - pcbs[runningProcessId].arrivalTime;
            }
          }
        }
        break;
      }

      case 'sjf_preemptive': { // SRTF
        // Consider both ready queue and currently running process
        const candidatePool = [...readyQueue];
        if (runningProcessId) {
          candidatePool.push(runningProcessId);
        }

        if (candidatePool.length > 0) {
          // Sort by remaining time ascending
          candidatePool.sort((a, b) => {
            const diff = pcbs[a].remainingTime - pcbs[b].remainingTime;
            if (diff !== 0) return diff;
            return pcbs[a].arrivalTime - pcbs[b].arrivalTime;
          });

          const bestId = candidatePool[0];

          if (runningProcessId && bestId !== runningProcessId) {
            // Preemption occurs!
            const oldId = runningProcessId;
            pcbs[oldId].state = 'READY';
            readyQueue = candidatePool.filter((id) => id !== bestId);

            if (csOverhead > 0) {
              contextSwitchTicksRemaining = csOverhead;
              nextProcessToDispatch = bestId;
              runningProcessId = null;
              contextSwitchCount++;
              pcbs[bestId].contextSwitches++;
              lastRanProcessId = oldId;
              continue;
            } else {
              runningProcessId = bestId;
              pcbs[runningProcessId].state = 'RUNNING';
              contextSwitchCount++;
              pcbs[bestId].contextSwitches++;
              if (pcbs[runningProcessId].startTime === null) {
                pcbs[runningProcessId].startTime = currentTime;
                pcbs[runningProcessId].responseTime = currentTime - pcbs[runningProcessId].arrivalTime;
              }
            }
          } else if (!runningProcessId) {
            readyQueue = candidatePool.filter((id) => id !== bestId);
            if (csOverhead > 0 && lastRanProcessId && lastRanProcessId !== bestId) {
              contextSwitchTicksRemaining = csOverhead;
              nextProcessToDispatch = bestId;
              contextSwitchCount++;
              pcbs[bestId].contextSwitches++;
              continue;
            } else {
              runningProcessId = bestId;
              pcbs[runningProcessId].state = 'RUNNING';
              if (pcbs[runningProcessId].startTime === null) {
                pcbs[runningProcessId].startTime = currentTime;
                pcbs[runningProcessId].responseTime = currentTime - pcbs[runningProcessId].arrivalTime;
              }
            }
          } else {
            // Continue running current best
            readyQueue = candidatePool.filter((id) => id !== runningProcessId);
          }
        }
        break;
      }

      case 'round_robin': {
        if (!runningProcessId && readyQueue.length > 0) {
          const nextId = readyQueue.shift()!;
          currentQuantumSpent = 0;
          if (csOverhead > 0 && lastRanProcessId && lastRanProcessId !== nextId) {
            contextSwitchTicksRemaining = csOverhead;
            nextProcessToDispatch = nextId;
            contextSwitchCount++;
            pcbs[nextId].contextSwitches++;
            continue;
          } else {
            runningProcessId = nextId;
            pcbs[runningProcessId].state = 'RUNNING';
            if (pcbs[runningProcessId].startTime === null) {
              pcbs[runningProcessId].startTime = currentTime;
              pcbs[runningProcessId].responseTime = currentTime - pcbs[runningProcessId].arrivalTime;
            }
          }
        }
        break;
      }

      case 'priority_non_preemptive': {
        if (!runningProcessId && readyQueue.length > 0) {
          readyQueue.sort((a, b) => {
            const diff = getPriorityVal(pcbs[a]) - getPriorityVal(pcbs[b]);
            if (diff !== 0) return diff;
            return pcbs[a].arrivalTime - pcbs[b].arrivalTime;
          });
          const nextId = readyQueue.shift()!;
          if (csOverhead > 0 && lastRanProcessId && lastRanProcessId !== nextId) {
            contextSwitchTicksRemaining = csOverhead;
            nextProcessToDispatch = nextId;
            contextSwitchCount++;
            pcbs[nextId].contextSwitches++;
            continue;
          } else {
            runningProcessId = nextId;
            pcbs[runningProcessId].state = 'RUNNING';
            if (pcbs[runningProcessId].startTime === null) {
              pcbs[runningProcessId].startTime = currentTime;
              pcbs[runningProcessId].responseTime = currentTime - pcbs[runningProcessId].arrivalTime;
            }
          }
        }
        break;
      }

      case 'priority_preemptive': {
        const candidatePool = [...readyQueue];
        if (runningProcessId) {
          candidatePool.push(runningProcessId);
        }

        if (candidatePool.length > 0) {
          candidatePool.sort((a, b) => {
            const diff = getPriorityVal(pcbs[a]) - getPriorityVal(pcbs[b]);
            if (diff !== 0) return diff;
            return pcbs[a].arrivalTime - pcbs[b].arrivalTime;
          });

          const bestId = candidatePool[0];

          if (runningProcessId && bestId !== runningProcessId) {
            // Preemption
            const oldId = runningProcessId;
            pcbs[oldId].state = 'READY';
            readyQueue = candidatePool.filter((id) => id !== bestId);

            if (csOverhead > 0) {
              contextSwitchTicksRemaining = csOverhead;
              nextProcessToDispatch = bestId;
              runningProcessId = null;
              contextSwitchCount++;
              pcbs[bestId].contextSwitches++;
              lastRanProcessId = oldId;
              continue;
            } else {
              runningProcessId = bestId;
              pcbs[runningProcessId].state = 'RUNNING';
              contextSwitchCount++;
              pcbs[bestId].contextSwitches++;
              if (pcbs[runningProcessId].startTime === null) {
                pcbs[runningProcessId].startTime = currentTime;
                pcbs[runningProcessId].responseTime = currentTime - pcbs[runningProcessId].arrivalTime;
              }
            }
          } else if (!runningProcessId) {
            readyQueue = candidatePool.filter((id) => id !== bestId);
            if (csOverhead > 0 && lastRanProcessId && lastRanProcessId !== bestId) {
              contextSwitchTicksRemaining = csOverhead;
              nextProcessToDispatch = bestId;
              contextSwitchCount++;
              pcbs[bestId].contextSwitches++;
              continue;
            } else {
              runningProcessId = bestId;
              pcbs[runningProcessId].state = 'RUNNING';
              if (pcbs[runningProcessId].startTime === null) {
                pcbs[runningProcessId].startTime = currentTime;
                pcbs[runningProcessId].responseTime = currentTime - pcbs[runningProcessId].arrivalTime;
              }
            }
          } else {
            readyQueue = candidatePool.filter((id) => id !== runningProcessId);
          }
        }
        break;
      }
    }

    // 4. Execution step
    if (runningProcessId) {
      const p = pcbs[runningProcessId];
      lastRanProcessId = runningProcessId;

      timeSlices.push({
        time: currentTime,
        processId: p.id,
        processName: p.name,
        color: p.color,
        isIdle: false,
      });

      p.remainingTime -= 1;
      currentQuantumSpent += 1;

      // Explanation creation
      const readySummary = readyQueue.length > 0 ? readyQueue.join(', ') : 'Empty';
      let rationale = '';

      if (algorithm === 'round_robin') {
        rationale = `${p.id} executes for quantum tick ${currentQuantumSpent}/${quantum}. Remaining burst: ${p.remainingTime}. Ready Queue: [${readySummary}].`;
      } else if (algorithm === 'sjf_preemptive') {
        rationale = `${p.id} is executing because it has the shortest remaining time (${p.remainingTime} units). Ready Queue: [${readySummary}].`;
      } else if (algorithm === 'priority_preemptive' || algorithm === 'priority_non_preemptive') {
        rationale = `${p.id} (Priority: ${p.priority}) is running. Remaining burst: ${p.remainingTime}. Ready Queue: [${readySummary}].`;
      } else if (algorithm === 'sjf_non_preemptive') {
        rationale = `${p.id} (Initial burst: ${p.burstTime}) is running to completion. Remaining burst: ${p.remainingTime}.`;
      } else {
        rationale = `${p.id} is running (First-come order). Remaining burst: ${p.remainingTime}. Ready Queue: [${readySummary}].`;
      }

      stepExplanations.push({
        time: currentTime,
        title: `${p.id} Executing (${p.name})`,
        action: 'EXECUTE',
        activeProcessId: p.id,
        readyQueueIds: [...readyQueue],
        rationale,
      });

      // Increase waiting time for ready processes
      readyQueue.forEach((qId) => {
        pcbs[qId].waitingTime += 1;
      });

      // Check for completion
      if (p.remainingTime === 0) {
        p.state = 'TERMINATED';
        p.completionTime = currentTime + 1;
        p.turnaroundTime = p.completionTime - p.arrivalTime;
        completedIds.push(p.id);

        stepExplanations[stepExplanations.length - 1].action = 'COMPLETE';
        stepExplanations[stepExplanations.length - 1].title = `${p.id} Completed!`;
        stepExplanations[stepExplanations.length - 1].rationale += ` Process finished at t=${p.completionTime}. Turnaround: ${p.turnaroundTime} (CT-AT), Waiting: ${p.waitingTime}.`;

        runningProcessId = null;
        currentQuantumSpent = 0;
      } else if (algorithm === 'round_robin' && currentQuantumSpent >= quantum) {
        // Quantum expired
        p.state = 'READY';

        // Check if new arrivals at currentTime + 1 should be added first
        const nextArrivals = sortedProcs
          .filter((sp) => sp.arrivalTime === currentTime + 1 && pcbs[sp.id].state === 'NEW')
          .map((sp) => sp.id);

        nextArrivals.forEach((arrId) => {
          pcbs[arrId].state = 'READY';
          if (!readyQueue.includes(arrId)) {
            readyQueue.push(arrId);
          }
        });

        readyQueue.push(p.id);
        runningProcessId = null;
        currentQuantumSpent = 0;

        stepExplanations[stepExplanations.length - 1].action = 'PREEMPT';
        stepExplanations[stepExplanations.length - 1].title = `${p.id} Quantum Expired (${quantum} ticks)`;
        stepExplanations[stepExplanations.length - 1].rationale += ` Time quantum reached. ${p.id} preempted back to the tail of Ready Queue.`;
      }
    } else {
      // CPU Idle
      timeSlices.push({
        time: currentTime,
        processId: null,
        processName: 'CPU Idle',
        isIdle: true,
      });

      stepExplanations.push({
        time: currentTime,
        title: `CPU Idle`,
        action: 'IDLE',
        activeProcessId: null,
        readyQueueIds: [...readyQueue],
        rationale: `No processes in the Ready Queue. Waiting for next arrival at t=${
          sortedProcs.find((p) => p.arrivalTime > currentTime)?.arrivalTime ?? 'None'
        }.`,
      });

      readyQueue.forEach((qId) => {
        pcbs[qId].waitingTime += 1;
      });
    }

    currentTime++;
  }

  // Add final completed snapshot
  historyStates.push({
    time: currentTime,
    runningProcessId: null,
    readyQueue: [],
    completedProcesses: [...completedIds],
    futureProcesses: [],
    pcbs: clonePcbs(pcbs),
    isContextSwitching: false,
  });

  // Calculate Metrics
  const totalTime = timeSlices.length;
  const cpuBusyTime = timeSlices.filter((s) => s.processId && !s.isContextSwitch && !s.isIdle).length;
  const contextSwitchOverheadTime = timeSlices.filter((s) => s.isContextSwitch).length;
  const cpuIdleTime = timeSlices.filter((s) => s.isIdle).length;

  const processMetrics: AlgorithmMetrics['processMetrics'] = {};
  let sumWait = 0;
  let sumTAT = 0;
  let sumResponse = 0;

  processes.forEach((p) => {
    const pcb = pcbs[p.id];
    const ct = pcb.completionTime ?? totalTime;
    const tat = ct - p.arrivalTime;
    const wt = tat - p.burstTime;
    const rt = pcb.responseTime ?? (pcb.startTime !== null ? pcb.startTime - p.arrivalTime : 0);

    processMetrics[p.id] = {
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      startTime: pcb.startTime ?? 0,
      completionTime: ct,
      turnaroundTime: tat,
      waitingTime: Math.max(0, wt),
      responseTime: Math.max(0, rt),
      contextSwitches: pcb.contextSwitches,
    };

    sumWait += Math.max(0, wt);
    sumTAT += tat;
    sumResponse += Math.max(0, rt);
  });

  const count = processes.length || 1;
  const avgWaitingTime = +(sumWait / count).toFixed(2);
  const avgTurnaroundTime = +(sumTAT / count).toFixed(2);
  const avgResponseTime = +(sumResponse / count).toFixed(2);
  const cpuUtilization = totalTime > 0 ? +((cpuBusyTime / totalTime) * 100).toFixed(1) : 0;
  const throughput = totalTime > 0 ? +(processes.length / totalTime).toFixed(3) : 0;

  return {
    algorithm,
    timeSlices,
    stepExplanations,
    historyStates,
    metrics: {
      totalTime,
      cpuBusyTime,
      cpuIdleTime,
      contextSwitchCount,
      contextSwitchOverheadTime,
      cpuUtilization,
      throughput,
      avgWaitingTime,
      avgTurnaroundTime,
      avgResponseTime,
      processMetrics,
    },
  };
}
