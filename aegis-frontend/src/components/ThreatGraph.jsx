import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function ThreatGraph({ events }) {
    const svgRef = useRef();

    useEffect(() => {
        if (!events || events.length === 0) return;

        const width = 400;
        const height = 200;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // Get latest per node
        const latestByNode = {};
        events.forEach(e => {
            if (!latestByNode[e.node]) {
                latestByNode[e.node] = e;
            }
        });

        const data = Object.values(latestByNode);

        const x = d3.scaleBand()
            .domain(data.map(d => d.node))
            .range([40, width - 20])
            .padding(0.3);

        const y = d3.scaleLinear()
            .domain([0, 1])
            .range([height - 30, 20]);

        // X Axis
        svg.append("g")
            .attr("transform", `translate(0,${height - 30})`)
            .call(d3.axisBottom(x))
            .attr("color", "cyan");

        // Y Axis
        svg.append("g")
            .attr("transform", `translate(40,0)`)
            .call(d3.axisLeft(y))
            .attr("color", "cyan");

        // Bars
        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => x(d.node))
            .attr("y", d => y(d.threat_score))
            .attr("width", x.bandwidth())
            .attr("height", d => height - 30 - y(d.threat_score))
            .attr("fill", d => {
                if (d.threat_score >= 0.86) return "red";
                if (d.threat_score >= 0.6) return "orange";
                return "cyan";
            });

        // Labels on bars
        svg.selectAll("text.bar")
            .data(data)
            .enter()
            .append("text")
            .attr("x", d => x(d.node) + x.bandwidth() / 2)
            .attr("y", d => y(d.threat_score) - 5)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", "10px")
            .text(d => d.threat_score);

    }, [events]);

    return <svg ref={svgRef} width={400} height={200}></svg>;
}