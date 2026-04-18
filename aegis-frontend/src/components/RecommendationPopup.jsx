import { motion, AnimatePresence } from "framer-motion";

export default function RecommendationPopup({ latestEvent, onShown }) {

    if (!latestEvent) return null;

    let message = "";
    let color = "cyan";

    if (latestEvent.defcon === 3) {
        message = "AI RESOLVED THREAT AUTOMATICALLY";
        color = "#00ff88";
    } else if (latestEvent.defcon === 2) {
        message = "MANUAL OVERRIDE REQUIRED • TRY SECURE CHANNEL 435GHz";
        color = "#ffaa00";
    } else if (latestEvent.defcon === 1) {
        message = "SYSTEM OFFLINE • CONTROL TRANSFERRED TO DEFENCE AUTHORITY";
        color = "#ff2244";
    }

    return (
        <AnimatePresence>
            <motion.div
                key={latestEvent.timestamp || Math.random()}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.4 }}
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    background: "black",
                    border: `1px solid ${color}`,
                    color: color,
                    padding: "12px 16px",
                    fontSize: "12px",
                    letterSpacing: "1px",
                    maxWidth: "300px",
                    zIndex: 9999
                }}
            >
                <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                    AEGIS RECOMMENDATION
                </div>

                <div>
                    NODE: {latestEvent.node}
                </div>

                <div style={{ marginTop: "5px" }}>
                    {message}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}