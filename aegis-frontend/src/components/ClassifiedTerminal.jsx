import { useState } from "react";
import { motion } from "framer-motion";

export default function ClassifiedTerminal() {

    const [status, setStatus] = useState("IDLE");
    const [logs, setLogs] = useState([]);

    const sendReport = async () => {
        setStatus("TRANSMITTING");
        setLogs([]);

        const steps = [
            "Initializing secure channel...",
            "Encrypting report...",
            "Connecting to Defence HQ...",
            "Uploading payload...",
            "Verifying integrity...",
            "Transmission complete"
        ];

        for (let i = 0; i < steps.length; i++) {
            await new Promise(res => setTimeout(res, 700));
            setLogs(prev => [...prev, steps[i]]);
        }

        await fetch("http://127.0.0.1:8000/send-report");

        setStatus("SENT");
    };

    return (
        <div style={{
            border: "1px solid orange",
            padding: "10px",
            marginTop: "10px",
            fontSize: "12px",
            background: "black",
            color: "orange"
        }}>

            <div style={{ marginBottom: "5px", fontWeight: "bold" }}>
                SECURE TRANSMISSION TERMINAL
            </div>

            <div>TO: DEFENCE HQ</div>
            <div>CLASSIFICATION: TOP SECRET</div>
            <div>PROTOCOL: AES-256 ENCRYPTION</div>

            <div style={{ marginTop: "8px" }}>
                STATUS: {status}
            </div>

            {/* LOGS */}
            <div style={{ marginTop: "8px", height: "100px", overflow: "auto" }}>
                {logs.map((log, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        ▸ {log}
                    </motion.div>
                ))}
            </div>

            {/* BUTTON */}
            <button
                onClick={sendReport}
                style={{
                    marginTop: "10px",
                    padding: "6px",
                    border: "1px solid orange",
                    background: "black",
                    color: "orange",
                    cursor: "pointer"
                }}
            >
                INITIATE TRANSMISSION
            </button>

            {/* FINAL STATE */}
            {status === "SENT" && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ color: "lime", marginTop: "8px" }}
                >
                    ✔ REPORT SENT SUCCESSFULLY
                </motion.div>
            )}

        </div>
    );
}