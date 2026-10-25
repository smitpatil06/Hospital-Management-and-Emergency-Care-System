# Hospital Emergency Care – OS Algorithm Visualizer

OS Assignment No. 3 / Practical No. 9 mini-project. **Problem 1: Hospital Management and Emergency Care System.**

A dependency-free web app (HTML/CSS/JS). Open `index.html` in a browser, or host it on GitHub Pages.

## Modules (one shared hospital workload)
| OS concept | File | What it shows |
|---|---|---|
| CPU Scheduling | `js/cpu.js` | FCFS, Priority (non-preemptive / preemptive); Gantt chart, waiting and turnaround times |
| Producer–Consumer | `js/sync.js` | Bounded buffer with `empty`, `full` semaphores and a `mutex`; blocking shown step by step |
| Deadlock Avoidance | `js/banker.js` | Need matrix, safety algorithm, safe sequence, resource-request check |
| Memory Management | `js/memory.js` | First / Best / Worst Fit, memory map, internal and external fragmentation |

`js/app.js` holds the shared workload (`name, arrival, burst, priority, memory KB`) that all four modules read.

## How they work together
Admitted tasks get a memory partition, are fed through the bounded buffer, have resource requests validated by Banker's Algorithm, and are then scheduled by priority so emergencies run first.

## Run
Open `index.html`. Use **Run all four modules** on the Scenario tab for a full demo.
