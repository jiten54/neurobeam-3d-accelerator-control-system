import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TelemetryData, NodeState } from '../hooks/useTelemetry';

interface Props {
  data: TelemetryData | null;
}

export default function NetworkGraph({ data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const nodes = data.nodes.map(n => ({ ...n }));
    const links: any[] = [];
    
    // Create logical dependencies
    for (let i = 0; i < nodes.length; i++) {
      if (i > 0) links.push({ source: nodes[i-1].id, target: nodes[i].id });
      // Cross-cluster links
      if (i % 8 === 0 && i > 0) links.push({ source: nodes[0].id, target: nodes[i].id });
    }

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(50))
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "#333")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1);

    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 4)
      .attr("fill", d => {
        const n = d as unknown as NodeState;
        if (n.status === 'CRITICAL') return '#ff3333';
        if (n.status === 'WARNING') return '#ffaa00';
        return '#00f0ff';
      });

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
    });

    return () => simulation.stop();
  }, [data]);

  return (
    <div className="w-full h-full relative bg-[#151619] border border-[#2d2d30] overflow-hidden flex flex-col">
      <div className="p-3 border-b border-[#333] flex justify-between items-center">
        <div className="text-[11px] font-bold uppercase tracking-wider">Topology Layer</div>
        <div className="text-[9px] mono opacity-40">NB-MAP_V4</div>
      </div>
      <div className="flex-1 relative">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </div>
  );
}
