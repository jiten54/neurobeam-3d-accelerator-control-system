import { useState, useEffect } from 'react';
import ThreeVisualizer from './components/ThreeVisualizer';
import NetworkGraph from './components/NetworkGraph';
import ControlCenter from './components/ControlCenter';
import AnomalyFeed from './components/AnomalyFeed';
import { useTelemetry, NodeState } from './hooks/useTelemetry';
import { Activity, Shield, Terminal, Zap, RefreshCcw } from 'lucide-react';
import { predictFailures } from './services/geminiService';
import { cn } from './lib/utils';

export default function App() {
  const { data, isConnected, sendControl } = useTelemetry();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [aiPrediction, setAiPrediction] = useState<string>("Standby for diagnostics...");
  const [isPredicting, setIsPredicting] = useState(false);

  const selectedNode = data?.nodes.find(n => n.id === selectedNodeId) || null;

  const runAiDiagnostic = async () => {
    if (!data) return;
    setIsPredicting(true);
    setAiPrediction("Analyzing telemetry flow...");
    const result = await predictFailures(data);
    setAiPrediction(result);
    setIsPredicting(false);
  };

  return (
    <div className="h-screen w-screen bg-[#0c0c0e] text-[#e0e0e0] font-sans overflow-hidden flex flex-col p-4 border-8 border-[#1a1a1c]">
      {/* Top Navigation Bar */}
      <header className="flex justify-between items-start mb-4 h-16 border-b border-[#333]">
        <div className="flex flex-col">
          <div className="text-[10px] text-cyan-500 uppercase tracking-widest mono mb-1">System Designation: NB-A1024</div>
          <h1 className="text-2xl font-bold tracking-tighter text-white uppercase flex items-center gap-2">
            NeuroBeam <span className="text-cyan-500 font-light">Real-Time Core</span>
            {isConnected && <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse ml-4"></span>}
          </h1>
        </div>

        <div className="flex gap-8 items-center">
          <div className="text-right">
            <div className="text-[10px] opacity-40 uppercase tracking-widest mb-1">Uptime / MTBF</div>
            <div className="mono text-sm">428:14:02:88 / 0.99998</div>
          </div>
          <div className="bg-[#1a1a1c] p-3 border-l-2 border-cyan-500 min-w-[140px]">
            <div className="text-[10px] opacity-40 uppercase mb-1 font-bold">Global Sync</div>
            <div className="mono text-cyan-400 text-lg">09:44:21.004</div>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="flex-1 grid grid-cols-12 grid-rows-12 gap-4 overflow-hidden mb-4">
        
        {/* Left Column: Analytics & Control */}
        <div className="col-span-3 row-span-12 flex flex-col gap-2">
          <ControlCenter 
            selectedNode={selectedNode} 
            sendControl={sendControl} 
            telemetry={data}
          />
          <div className="flex-1">
            <AnomalyFeed data={data} />
          </div>
        </div>

        {/* Center Canvas: 3D Visualization */}
        <div className="col-span-6 row-span-8 relative">
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <button className="bg-[#151619] border border-[#2d2d30] p-2 hover:bg-cyan-500/10 text-cyan-400 transition-colors">
              <Zap size={18} title="AI Prediction Overlay" />
            </button>
            <button className="bg-[#151619] border border-[#2d2d30] p-2 hover:bg-cyan-500/10 text-cyan-400 transition-colors">
              <Shield size={18} title="Show Protective Shell" />
            </button>
          </div>
          <div className="w-full h-full bg-[#050505] border border-cyan-900/30 relative grid-bg overflow-hidden rounded-sm">
            <div className="absolute inset-0 scanline opacity-20 pointer-events-none"></div>
            <ThreeVisualizer data={data} onSelectNode={setSelectedNodeId} />
          </div>
          
          {/* Diagnostic Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-500">
                <Terminal size={12} /> SCAN_ITERATION: {(Math.random() * 1000).toFixed(0)}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono opacity-40">
                COORD: [ 15.000, 0.000, {(data?.beamIntensity || 0).toFixed(4)} ]
              </div>
            </div>
            <div className="h-12 w-48 bg-black/60 border-l border-cyan-500 flex items-center px-4">
              <div className="w-full h-1 bg-[#333]">
                <div 
                  className="h-full bg-cyan-500 animate-pulse transition-all duration-300"
                  style={{ width: `${(data?.beamIntensity || 0) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Alerts & Mini-Maps */}
        <div className="col-span-3 row-span-8 flex flex-col gap-2">
          <div className="h-1/2 glass-panel p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-[10px] text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} /> Topological Overview
              </h3>
              <span className="text-[9px] font-mono text-zinc-500 italic">LAYER_01: LOGICAL</span>
            </div>
            <div className="flex-1">
              <NetworkGraph data={data} />
            </div>
          </div>
          
          <div className="h-1/2 glass-panel p-4 bg-red-950/5 border-red-500/20">
             <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-[10px] text-red-500 uppercase tracking-widest flex items-center gap-2 font-bold">
                <Zap size={14} className={isPredicting ? "animate-spin" : "animate-pulse"} /> AI PREDICTION WING
              </h3>
            </div>
            <div className="flex-1 flex flex-col justify-center text-center gap-4 px-4 bg-black/40 rounded border border-red-500/10">
              <div className="text-[10px] text-zinc-500 uppercase font-mono">Prediction Confidence</div>
              <div className="text-3xl font-display text-red-500">
                {isPredicting ? "--.-" : "84.2"}<span className="text-sm">%</span>
              </div>
              <div className="text-[9px] text-zinc-400 italic min-h-[40px] flex items-center justify-center">
                {aiPrediction}
              </div>
              <button 
                onClick={runAiDiagnostic}
                disabled={isPredicting}
                className="bg-red-500/10 border border-red-500/40 text-red-400 text-[10px] py-2 uppercase font-bold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPredicting ? <RefreshCcw size={12} className="animate-spin" /> : <Zap size={12} />}
                {isPredicting ? "RUNNING HEURISTICS..." : "INIT NEURAL ANALYSIS"}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Banner: Global Metrics */}
        <div className="col-span-9 row-span-4 glass-panel p-4 flex gap-8 items-center bg-cyan-950/5">
           <div className="flex-1 grid grid-cols-4 gap-8">
              <MetricBox label="HELIUM_STORAGE" value="98.2" unit="%" trend="STABLE" />
              <MetricBox label="MAGNET_QUENCH_PROB" value="0.002" unit="%" trend="NOMINAL" />
              <MetricBox label="VACUUM_LEVEL" value="1.2e-10" unit="mbar" trend="INCREASING" />
              <MetricBox label="POWER_GRID_DRAW" value="44.8" unit="MW" trend="FLUCTUATING" />
           </div>
           <div className="w-px h-12 bg-zinc-800" />
           <div className="flex flex-col gap-2">
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Global Status</div>
              <div className="bg-cyan-500/20 border border-cyan-500/40 px-6 py-2 rounded text-cyan-400 font-display text-xl animate-glow">
                BEAM OPERATIONAL
              </div>
           </div>
        </div>

      </main>

      {/* Footer Status Bar */}
      <footer className="h-8 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between px-6 text-[9px] font-mono text-zinc-500 uppercase tracking-tighter">
        <div className="flex gap-4">
          <span>UPTIME: 442D 12H 04M 22S</span>
          <span className="text-cyan-800">|</span>
          <span>SYSTEM_VERSION: 4.8.2-GA</span>
        </div>
        <div className="flex gap-4">
           <span>DB_LATENCY: 12ms</span>
           <span className="text-cyan-800">|</span>
           <div className="flex gap-2">
              <span>CRYOGENICS: <span className="text-cyan-400">ACTIVE</span></span>
              <span>RF_AMPS: <span className="text-cyan-400">ACTIVE</span></span>
              <span>MAG_FOCUS: <span className="text-cyan-400">ACTIVE</span></span>
           </div>
        </div>
      </footer>
    </div>
  );
}

function MetricBox({ label, value, unit, trend }: { label: string, value: string, unit: string, trend: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[9px] opacity-40 uppercase tracking-widest mono">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold text-white mono">{value}</div>
        <div className="text-[10px] opacity-40 mono">{unit}</div>
      </div>
      <div className={cn(
        "text-[8px] font-bold mono",
        trend === 'NOMINAL' || trend === 'STABLE' ? 'text-cyan-500' : 'text-amber-500'
      )}>
        {trend}
      </div>
    </div>
  )
}

