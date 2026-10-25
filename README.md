# CPU Scheduling Visualizer

🌍 **Live Demo:** [https://cpu-scheduling-visualizer-flame.vercel.app/](https://cpu-scheduling-visualizer-flame.vercel.app/)

An interactive, educational web application for exploring and understanding CPU scheduling algorithms. Built with React and TypeScript, this project features a clean, minimalist design (inspired by the [Seeing Theory](https://seeing-theory.brown.edu/) website) to break down complex operating system concepts into intuitive visual animations.

## 🚀 Live Visualizations

The visualizer provides a real-time, side-by-side view of theory and execution:
- **State Machine Animation**: Watch processes move dynamically from the **Ready Queue** into the **CPU Core**, and finally to the **Terminated** state.
- **Gantt Chart**: A minimalist, SVG-style timeline that accurately graphs the execution history, context switches, and CPU idle times.
- **Interactive Process Editor**: Add, remove, or modify processes on the fly. Change their Arrival Time, Burst Time, and Priority to immediately see how it impacts the simulation.
- **Live Metrics**: Automatically calculates and displays Average Waiting Time, Average Turnaround Time, and overall CPU Utilization.
- **Algorithm Comparison**: Open [`/compare`](http://localhost:3000/compare) to run all six algorithms against the same workload. Each complete Gantt chart is shown together, followed by metric comparisons and a plain-language summary of the results.

## 🧭 Using the App

- **Simulator (`/`)**: Choose an algorithm, edit the process workload, and step through execution with the playback controls.
- **Priority scheduling**: Select either priority algorithm to reveal the editable Priority column. Lower values are treated as higher priority by default.
- **Full comparison (`/compare`)**: Compare FCFS, SJF, SRTF, Round Robin, and both priority variants using the current process workload. Use **Simulate** on any row to return to the simulator with that algorithm selected.

## 🧠 Supported Algorithms

1. **First-Come, First-Served (FCFS)**: The simplest algorithm; processes are executed in the exact order they arrive.
2. **Shortest Job First (SJF - Non-Preemptive)**: Selects the waiting process with the smallest burst time.
3. **Shortest Remaining Time First (SJF - Preemptive)**: Similar to SJF, but if a new process arrives with a shorter burst time than what is currently running, the CPU preempts the current process.
4. **Round Robin (RR)**: Each process gets a fixed time quantum (q) to execute before being preempted and placed at the back of the queue.
5. **Priority (Non-Preemptive)**: Executes the highest priority process first.
6. **Priority (Preemptive)**: Preempts the running process if a higher priority process arrives in the queue.

## 🛠️ Tech Stack

- **Framework**: React 19 with Vite
- **Language**: TypeScript
- **Styling**: Vanilla CSS (Split-pane layout, CSS grid/flexbox)
- **Animations**: CSS transitions and keyframe animations
- **Icons**: Lucide React

## 💻 Running Locally

To run the visualization dashboard on your local machine:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Aryan107rn/CPU_Scheduling_Visualizer.git
   cd CPU_Scheduling_Visualizer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the localhost port provided in the terminal (usually `http://localhost:3000` or `http://localhost:5173`).

The comparison view is available at `/compare` on the same host. If port `3000` is already in use, Vite automatically selects another available port.

### Validation

```bash
npm run lint
npm run build
```

## 🎨 Design Philosophy
The UI relies heavily on a "digital textbook" aesthetic:
- **Left Pane**: Dedicated to theoretical explanations, mathematical context, and configuration (typography relies on the `Lora` serif font for readability).
- **Right Pane**: Dedicated exclusively to clean, high-contrast visual animations (using `Inter` for functional UI data).
