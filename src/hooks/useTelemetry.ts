import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface NodeState {
  id: string;
  type: 'MAGNET' | 'CRYO' | 'RF';
  status: 'OK' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  load: number;
  temp: number;
}

export interface TelemetryData {
  timestamp: number;
  beamIntensity: number;
  frequency: number;
  status: string;
  nodes: NodeState[];
}

export function useTelemetry() {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    socket.on('init_state', (state: TelemetryData) => {
      setData(state);
    });

    socket.on('telemetry', (telemetry: TelemetryData) => {
      setData(telemetry);
    });

    socket.on('node_update', (node: NodeState) => {
      setData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          nodes: prev.nodes.map(n => n.id === node.id ? node : n)
        };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendControl = (nodeId: string, action: 'RESET' | 'POWER_OFF') => {
    socketRef.current?.emit('control_cmd', { nodeId, action });
  };

  return { data, isConnected, sendControl };
}
