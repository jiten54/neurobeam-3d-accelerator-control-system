import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TelemetryData } from '../hooks/useTelemetry';

interface Props {
  data: TelemetryData | null;
  onSelectNode: (nodeId: string) => void;
}

export default function ThreeVisualizer({ data, onSelectNode }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const nodesRef = useRef<THREE.Group | null>(null);
  const beamRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0c0e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(20, 20, 20);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- Accelerator Ring ---
    const ringGeom = new THREE.TorusGeometry(15, 0.2, 32, 100);
    const ringMat = new THREE.MeshPhongMaterial({ 
      color: 0x111111, 
      emissive: 0x00f0ff, 
      emissiveIntensity: 0.1,
      transparent: true,
      opacity: 0.5
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // --- Beam Simulation ---
    const beamGeom = new THREE.TorusGeometry(15, 0.05, 16, 100);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const beam = new THREE.Mesh(beamGeom, beamMat);
    beam.rotation.x = Math.PI / 2;
    scene.add(beam);
    beamRef.current = beam;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00f0ff, 1, 100);
    pointLight.position.set(0, 20, 0);
    scene.add(pointLight);

    // --- Animation Loop ---
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      
      if (beam) {
        beam.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.02);
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, []);

  // Update Nodes
  useEffect(() => {
    if (!sceneRef.current || !data) return;

    if (!nodesRef.current) {
      nodesRef.current = new THREE.Group();
      sceneRef.current.add(nodesRef.current);
    }

    const group = nodesRef.current;
    
    // Clear old markers if length Mismatch (or every time for simplicity in demo)
    if (group.children.length !== data.nodes.length) {
      group.clear();
      data.nodes.forEach((node, i) => {
        const angle = (i / data.nodes.length) * Math.PI * 2;
        const radius = 15;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const geom = new THREE.SphereGeometry(0.5, 16, 16);
        const mat = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(x, 0, z);
        mesh.name = node.id;
        mesh.userData = { id: node.id };
        group.add(mesh);
      });
    }

    // Update markers based on status
    group.children.forEach((mesh, i) => {
      const node = data.nodes[i];
      if (!node) return;
      const m = mesh as THREE.Mesh;
      const mat = m.material as THREE.MeshPhongMaterial;
      
      switch(node.status) {
        case 'CRITICAL': mat.color.setHex(0xff3333); mat.emissive.setHex(0xff0000); mat.emissiveIntensity = 0.8; break;
        case 'WARNING': mat.color.setHex(0xffaa00); mat.emissive.setHex(0xffaa00); mat.emissiveIntensity = 0.5; break;
        case 'OFFLINE': mat.color.setHex(0x222222); mat.emissive.setHex(0x000000); break;
        default: mat.color.setHex(0x00f0ff); mat.emissive.setHex(0x00f0ff); mat.emissiveIntensity = 0.2;
      }
    });

  }, [data]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative cursor-crosshair scanline"
      id="three-visualizer-container"
    >
      <div className="absolute top-4 left-4 z-10 glass-panel p-2 text-[10px] uppercase font-mono pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-cyan-400 animate-pulse rounded-full"></span>
          3D Accelerator View: LH-Ring Alpha
        </div>
      </div>
    </div>
  );
}
