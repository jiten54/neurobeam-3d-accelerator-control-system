import { NodeState, TelemetryData } from '../hooks/useTelemetry';
import { Power, RotateCcw, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  selectedNode: NodeState | null;
  sendControl: (nodeId: string, action: 'RESET' | 'POWER_OFF') => void;
  telemetry: TelemetryData | null;
}

export default function ControlCenter({ selectedNode, sendControl, telemetry }: Props) {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* System Status */}
      <div className="bg-[#151619] border border-[#2d2d30] p-3 flex flex-col gap-2">
        <h3 className="text-[11px] font-bold uppercase tracking-wider border-b border-[#333] pb-1 flex items-center gap-2">
          <Activity size={14} className="text-cyan-500" /> SYSTEM OVERVIEW
        </h3>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <div className="text-[10px] opacity-40 uppercase tracking-widest mono mb-1">Beam Intensity</div>
            <div className="text-xl font-bold mono text-cyan-400">{(telemetry?.beamIntensity || 0).toFixed(3)} <span className="text-[10px] opacity-60">GeV</span></div>
          </div>
          <div>
            <div className="text-[10px] opacity-40 uppercase tracking-widest mono mb-1">RF Frequency</div>
            <div className="text-xl font-bold mono text-white">{(telemetry?.frequency || 0).toFixed(1)} <span className="text-[10px] opacity-60">MHz</span></div>
          </div>
        </div>
      </div>

      {/* Selected Node Control */}
      <div className="bg-[#151619] border border-[#2d2d30] p-3 flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-[#333] pb-1">
          <h3 className="text-[11px] font-bold uppercase tracking-wider">
            DEVICE CONTROL
          </h3>
          {selectedNode && <span className="w-2 h-2 rounded-full bg-cyan-500"></span>}
        </div>
        
        {selectedNode ? (
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-[10px] opacity-40 uppercase mono mb-1">Unit Identifier</div>
              <div className="text-lg font-bold mono text-white">{selectedNode.id}</div>
              <div className={cn(
                "text-[10px] px-2 py-0.5 rounded-sm inline-block mt-1 uppercase font-bold mono",
                selectedNode.status === 'OK' ? "bg-cyan-500/20 text-cyan-400" :
                selectedNode.status === 'CRITICAL' ? "bg-red-500/20 text-red-500 animate-pulse" :
                "bg-amber-500/20 text-amber-500"
              )}>
                STATUS: {selectedNode.status}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => sendControl(selectedNode.id, 'RESET')}
                className="flex items-center justify-center gap-2 bg-[#0c0c0e] hover:bg-cyan-900/20 border border-[#2d2d30] py-2 rounded-sm text-[10px] font-bold transition-colors uppercase tracking-widest"
              >
                <RotateCcw size={12} /> Reset
              </button>
              <button 
                onClick={() => sendControl(selectedNode.id, 'POWER_OFF')}
                className="flex items-center justify-center gap-2 bg-[#ff3333] border border-[#ff3333] py-2 rounded-sm text-[10px] font-bold transition-all uppercase tracking-widest text-white shadow-[0_0_15px_rgba(255,51,51,0.2)] hover:shadow-[0_0_20px_rgba(255,51,51,0.4)]"
              >
                <Power size={12} /> Emergency
              </button>
            </div>

            <div className="mt-4">
              <div className="text-[11px] font-bold uppercase mb-3">Core Telemetry</div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center text-[10px] mono mb-1">
                    <span className="opacity-40">Load Factor</span>
                    <span className="text-cyan-400">{selectedNode.load.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[#333] h-1">
                    <div 
                      className="bg-cyan-500 h-full transition-all duration-500" 
                      style={{ width: `${selectedNode.load}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-[10px] mono mb-1">
                    <span className="opacity-40">Cryo Temp</span>
                    <span className={selectedNode.temp > 2.0 ? "text-amber-500" : "text-cyan-400"}>
                      {selectedNode.temp.toFixed(4)} K
                    </span>
                  </div>
                  <div className="w-full bg-[#333] h-1">
                    <div 
                      className={cn(
                        "h-full transition-all duration-500",
                        selectedNode.temp > 2.0 ? "bg-amber-500" : "bg-cyan-500"
                      )} 
                      style={{ width: `${Math.min(100, (selectedNode.temp - 1.8) * 250)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#8e9299] text-[10px] text-center italic px-8 mono uppercase tracking-widest">
            Awaiting selection from topology layer...
          </div>
        )}
      </div>
    </div>
  );
}
