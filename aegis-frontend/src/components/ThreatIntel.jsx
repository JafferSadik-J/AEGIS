export default function ThreatIntel({ latestEvent }) {

    if (!latestEvent) {
        return <div style={{ color: "gray" }}>No threat data</div>;
    }

    const {
        node = "UNKNOWN",
        ip = "192.168.0.1",
        country = "Shivamogga, India",
        lat = "13.9299 N",
        lon = "75.5681 E",
        threat_type = "Unknown",
        threat_score = 0
    } = latestEvent;

    const getColor = () => {
        if (threat_score >= 0.86) return "red";
        if (threat_score >= 0.6) return "orange";
        return "cyan";
    };

    return (
        <div style={{
            border: "1px solid cyan",
            padding: "10px",
            marginTop: "10px",
            fontSize: "12px"
        }}>

            <div style={{ color: "cyan", marginBottom: "5px" }}>
                THREAT INTELLIGENCE
            </div>

            <div>NODE: {node}</div>

            <div>IP: {ip}</div>

            <div>COUNTRY: {country}</div>

            <div>
                COORDINATES: {lat}, {lon}
            </div>

            <div>
                TYPE: {threat_type}
            </div>

            <div style={{ color: getColor() }}>
                SCORE: {threat_score}
            </div>

        </div>
    );
}