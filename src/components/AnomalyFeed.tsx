import { useEffect, useState } from 'react';
import { TelemetryData } from '../hooks/useTelemetry';
import { AlertTriangle, Info, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Props {
  data: TelemetryData | null;
}

interface EventLog {
  id: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL';
  msg: string;
  time: string;
}

export default function AnomalyFeed({ data }: Props) {
  const [logs, setLogs] = useState<EventLog[]>([]);

  useEffect(() => {
    if (!data) return;

    const criticalNodes = data.nodes.filter(n => n.status === 'CRITICAL' || n.status === 'WARNING');
    
    criticalNodes.forEach(node => {
      const logId = `${node.id}-${node.status}-${Math.floor(Date.now() / 10000)}`;
      if (logs.some(l => l.id === logId)) return;

      const newLog: EventLog = {
        id: logId,
        type: node.status === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
        msg: `${node.type} unit ${node.id} reporting ${node.status.toLowerCase()} state.`,
        time: new Date().toLocaleTimeString([], { hour12: false }),
      };

      setLogs(prev => [newLog, ...prev].slice(0, 50));
    });
  }, [data]);

  return (
    <div className="bg-[#151619] border border-[#2d2d30] h-full flex flex-col p-3">
      <div className="flex justify-between items-center mb-3 border-b border-[#333] pb-1">
        <h3 className="text-[11px] font-bold uppercase tracking-wider">
          Event Stream
        </h3>
        <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-[#2d2d30]">
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mono text-[10px] p-2 border border-[#2d2d30] bg-[#0c0c0e] opacity-80"
            >
              <div className="flex justify-between items-center mb-1">
                  <span className={cn(
                    "font-bold uppercase",
                    log.type === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'
                  )}>
                    {">"} {log.type} // {log.time}
                  </span>
              </div>
              <p className="text-[#8e9299]">
                {log.msg}
              </p>
            </motion.div>
          ))}
          {logs.length === 0 && (
            <div className="text-[9px] text-zinc-700 font-mono uppercase italic p-4 text-center">
              SYNC_PENDING...
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
