# NeuroBeam: Real-Time Scientific Control Platform

NeuroBeam is a mission-critical visualization and control system designed for particle accelerator operations. It provides a multi-layer view of high-frequency telemetry, topological dependencies, and predictive AI diagnostics.

## 🚀 Core Features

### 1. NeuroVisual 3D Engine (Three.js)
- **Toroidal Ring Visualization**: Renders the physical accelerator structure in 3D.
- **Dynamic Node States**: Real-time color shifts and glow effects reflecting hardware health (Magnets, Cryogenics, RF).
- **Beam Dynamics**: Visual beam simulation driven by live intensity and frequency telemetry.

### 2. Topological Analysis (D3.js)
- **Dependency Map**: Visualizes the logical interconnects between system nodes.
- **Failure Propagation**: Displays how a critical failure in one unit impacts its dependencies via force-directed graph physics.

### 3. Instrumentation Server (Express + Socket.io)
- **Telemetry Loop**: Broadcasts system-wide state every 200ms.
- **Node Simulation**: Simulates realistic thermal drift (Kelvin scale), load factors, and stochastic anomalies.
- **Command Dispatch**: Bi-directional communication allowing for remote hardware resets and emergency power-offs.

### 4. AI Prediction Wing (Gemini 1.5)
- **Neural Diagnostics**: Leverages Gemini to analyze telemetry patterns.
- **Risk Assessment**: Predicts non-obvious failure modes (e.g., thermal drift leading to RF breakdown) before they appear in standard threshold alerts.

## 🛠 Tech Stack
- **Frontend**: React, Three.js, D3.js, Motion, Recharts.
- **Backend**: Node.js (Express), Socket.io.
- **AI**: Google Gemini API.
- **Styling**: Tailwind CSS (Scientific Dashboard Theme).

## 🚦 System Operation
1. **Initialize Link**: The dashboard connects to the CERN_NET_04 telemetry stream on startup.
2. **Monitor**: Watch the 3D ring for red "Critical" glows or check the Anomaly Feed for event logs.
3. **Analyze**: Click "Init Neural Analysis" in the AI wing to get a predictive risk report.
4. **Control**: Select any node to open its control link and issue corrective commands.

## 📦 Deployment
The system is designed for containerized environments.
- **Dev**: `npm run dev` (Runs backend + Vite middleware).
- **Prod**: `npm run build` && `npm run start`.

---
*Developed for Advanced Scientific Operations. (C) 2026 NeuroBeam Systems.*
