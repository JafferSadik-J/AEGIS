import { motion } from "framer-motion";

export default function ExplainPanel({ latestEvent }) {

    if (!latestEvent) {
        return <div className="text-gray-400">No data</div>;
    }

    // ✅ Safe values
    const {
        node = "UNKNOWN",
        threat_type = "UNKNOWN",
        threat_score = 0,
        reasons = [],
        action = "No action"
    } = latestEvent;

    // 🎯 Severity color
    const getColor = () => {
        if (threat_score >= 0.86) return "text-red-500";
        if (threat_score >= 0.6) return "text-yellow-400";
        return "text-green-400";
    };

    return (
        <div className="border border-cyan-500 p-3 rounded h-full">

            <div className="mb-2 font-bold text-cyan-400">
                EXPLAINABILITY
            </div>

            {/* BASIC INFO */}
            <div className="mb-2">
                <span className="text-cyan-400">NODE:</span> {node}
            </div>

            <div className="mb-2">
                <span className="text-cyan-400">THREAT:</span> {threat_type}
            </div>

            <div className={`mb-2 ${getColor()}`}>
                <span className="text-cyan-400">SCORE:</span> {threat_score}
            </div>

            {/* REASONS */}
            <div className="mt-3">
                <div className="text-cyan-400 mb-1">REASONS:</div>

                {reasons.length > 0 ? (
                    reasons.map((r, i) => (
                        <motion.div
                            key={i}
                            className="text-sm text-red-400 mb-1"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            • {r}
                        </motion.div>
                    ))
                ) : (
                    <div className="text-gray-400 text-sm">
                        No detailed explanation available
                    </div>
                )}
            </div>

            {/* ACTION */}
            <div className="mt-3 text-green-400 text-sm">
                ACTION: {action}
            </div>

        </div>
    );
}