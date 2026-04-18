import { useEffect, useRef } from "react";

export default function Radar({ latestEvent }) {
    const canvasRef = useRef();

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const width = 300;
        const height = 300;
        canvas.width = width;
        canvas.height = height;

        const centerX = width / 2;
        const centerY = height / 2;

        let angle = 0;

        // Static node positions (radar coordinates)
        const nodes = {
            ALPHA: { x: 220, y: 120 },
            BETA: { x: 80, y: 200 },
            GAMMA: { x: 150, y: 60 }
        };

        function drawRadar() {
            ctx.clearRect(0, 0, width, height);

            // Background
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, width, height);

            // Radar circles
            ctx.strokeStyle = "#00ff88";
            ctx.lineWidth = 0.5;

            for (let i = 50; i <= 150; i += 50) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, i, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Sweep line
            const sweepX = centerX + Math.cos(angle) * 150;
            const sweepY = centerY + Math.sin(angle) * 150;

            const gradient = ctx.createLinearGradient(centerX, centerY, sweepX, sweepY);
            gradient.addColorStop(0, "rgba(0,255,136,0)");
            gradient.addColorStop(1, "rgba(0,255,136,0.8)");

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(sweepX, sweepY);
            ctx.stroke();

            // Draw nodes
            Object.entries(nodes).forEach(([name, pos]) => {
                const isAttacked = latestEvent?.node === name;

                ctx.beginPath();
                ctx.arc(pos.x, pos.y, isAttacked ? 6 : 3, 0, Math.PI * 2);
                ctx.fillStyle = isAttacked ? "red" : "#00ff88";
                ctx.fill();

                // Blink + coordinates
                if (isAttacked) {
                    ctx.fillStyle = "red";
                    ctx.font = "10px monospace";
                    ctx.fillText(
                        `${name} (${pos.x},${pos.y})`,
                        pos.x + 8,
                        pos.y - 8
                    );
                }
            });

            angle += 0.03;
            requestAnimationFrame(drawRadar);
        }

        drawRadar();
    }, [latestEvent]);

    return (
        <div>
            <div style={{ color: "cyan", marginBottom: "5px" }}>RADAR</div>
            <canvas ref={canvasRef} />
        </div>
    );
}