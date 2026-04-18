import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function NetworkGraph({ latestEvent }) {
    const svgRef = useRef();

    useEffect(() => {
        const width = 400;
        const height = 300;

        const nodesData = [
            { id: "ALPHA" },
            { id: "BETA" },
            { id: "GAMMA" },
        ];

        const linksData = [
            { source: "ALPHA", target: "BETA" },
            { source: "BETA", target: "GAMMA" },
        ];

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const simulation = d3.forceSimulation(nodesData)
            .force("link", d3.forceLink(linksData).id(d => d.id).distance(120))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2));

        // LINKS
        const link = svg.append("g")
            .selectAll("line")
            .data(linksData)
            .enter()
            .append("line")
            .attr("stroke", "#444")
            .attr("stroke-width", 2);

        // NODES
        const node = svg.append("g")
            .selectAll("circle")
            .data(nodesData)
            .enter()
            .append("circle")
            .attr("r", 15)
            .attr("fill", "#00ff88");

        // LABELS
        const label = svg.append("g")
            .selectAll("text")
            .data(nodesData)
            .enter()
            .append("text")
            .text(d => d.id)
            .attr("fill", "#00d4ff")
            .attr("font-size", "12px")
            .attr("dx", -15)
            .attr("dy", -20);

        // SIMULATION
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            label
                .attr("x", d => d.x)
                .attr("y", d => d.y);
        });

        // 🔥 ATTACK VISUAL
        if (latestEvent) {
            const attackedNode = latestEvent.node;

            // Highlight + pulse
            node
                .attr("fill", d => d.id === attackedNode ? "red" : "#00ff88")
                .attr("stroke", d => d.id === attackedNode ? "red" : "cyan")
                .attr("stroke-width", d => d.id === attackedNode ? 4 : 2);

            node.filter(d => d.id === attackedNode)
                .transition()
                .duration(200)
                .attr("r", 22)
                .transition()
                .duration(200)
                .attr("r", 15);

            // Attack animation (AFTER positions exist)
            setTimeout(() => {
                linksData.forEach(l => {
                    if (l.source.id === attackedNode || l.target.id === attackedNode) {

                        const attackLine = svg.append("line")
                            .attr("x1", l.source.x)
                            .attr("y1", l.source.y)
                            .attr("x2", l.source.x)
                            .attr("y2", l.source.y)
                            .attr("stroke", "red")
                            .attr("stroke-width", 3);

                        attackLine
                            .transition()
                            .duration(800)
                            .attr("x2", l.target.x)
                            .attr("y2", l.target.y)
                            .remove();
                    }
                });
            }, 300);
        }

    }, [latestEvent]);

    return <svg ref={svgRef} width={400} height={300}></svg>;
}