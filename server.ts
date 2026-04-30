import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // --- Real-Time Simulation Logic ---
  let acceleratorState = {
    beamIntensity: 1.0,
    frequency: 400.0,
    status: 'OPERATIONAL',
    nodes: Array.from({ length: 40 }).map((_, i) => ({
      id: `node-${i}`,
      type: i % 5 === 0 ? 'MAGNET' : i % 3 === 0 ? 'CRYO' : 'RF',
      status: 'OK',
      load: Math.random() * 100,
      temp: 1.9 + Math.random() * 0.1, // Kelvin
    }))
  };

  // Telemetry loop (every 200ms as per requirements)
  setInterval(() => {
    // Simulate beam drift
    acceleratorState.beamIntensity = Math.max(0, acceleratorState.beamIntensity + (Math.random() - 0.5) * 0.05);
    
    // Simulate node load fluctuation
    acceleratorState.nodes.forEach(node => {
      node.load = Math.max(0, Math.min(100, node.load + (Math.random() - 0.5) * 5));
      if (node.type === 'CRYO') {
        node.temp = Math.max(1.8, Math.min(2.2, node.temp + (Math.random() - 0.5) * 0.01));
      }
      
      // Random anomalies (0.5% chance per tick)
      if (Math.random() < 0.005) {
        node.status = Math.random() > 0.8 ? 'CRITICAL' : 'WARNING';
      } else if (Math.random() < 0.05 && node.status !== 'OK') {
        node.status = 'OK';
      }
    });

    io.emit('telemetry', {
      timestamp: Date.now(),
      ...acceleratorState
    });
  }, 200);

  io.on('connection', (socket) => {
    console.log('Control Room Operator Connected');
    socket.emit('init_state', acceleratorState);

    socket.on('control_cmd', (cmd) => {
      console.log('Received Control Command:', cmd);
      const { nodeId, action } = cmd;
      const targetNode = acceleratorState.nodes.find(n => n.id === nodeId);
      if (targetNode) {
        if (action === 'RESET') targetNode.status = 'OK';
        if (action === 'POWER_OFF') targetNode.status = 'OFFLINE';
        io.emit('node_update', targetNode);
      }
    });
  });

  // --- Vite / Asset Serving ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`NeuroBeam Core operational on http://localhost:${PORT}`);
  });
}

startServer();
