import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import NetworkGraph from "./components/NetworkGraph";
import ExplainPanel from "./components/ExplainPanel";
import RecommendationPopup from "./components/RecommendationPopup";
import ThreatGraph from "./components/ThreatGraph";
import Radar from "./components/Radar";
import ThreatIntel from "./components/ThreatIntel";
import ClassifiedTerminal from "./components/ClassifiedTerminal";

function App() {
  const [played, setPlayed] = useState(false);
  const [events, setEvents] = useState([]);
  const [defcon, setDefcon] = useState(3);
  const [time, setTime] = useState("00:00:00");
  const [popupShown, setPopupShown] = useState(false);

  const latestEvent = events[0];

  // 🔌 WebSocket + Time
  useEffect(() => {
    const socket = new WebSocket("ws://10.28.133.246:8000/ws");

    socket.onopen = () => console.log("WS CONNECTED");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      console.log("RECEIVED:", data);

      setEvents((prev) => [data, ...prev.slice(0, 9)]);
      setDefcon(data.defcon);
    };

    socket.onerror = (e) => console.log("WS ERROR", e);

    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => {
      socket.close();
      clearInterval(interval);
    };
  }, []);

  // 🔊 Sound
  useEffect(() => {
    if (defcon === 1 && !played) {
      const audio = new Audio("/alert.mp3");
      audio.volume = 1.0;
      audio.play();
      setPlayed(true);
    }
  }, [defcon]);

  // 🚨 DEFCON 1 SCREEN
  if (defcon === 1) {
    return (
      <div style={{
        backgroundColor: "black",
        color: "#ff1a1a",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        fontSize: "40px"
      }}>
        <motion.div
          animate={{ opacity: [0, 1, 0.8, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          SYSTEM OFFLINE<br />
          PHYSICAL AUTHORITY NOTIFIED
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ background: "black", color: "cyan", height: "100vh", padding: "10px" }}>

      {/* TOP BAR */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>AEGIS v1.4.9</div>
        <div style={{ color: defcon === 1 ? "red" : defcon === 2 ? "yellow" : "lime" }}>
          DEFCON {defcon}
        </div>
        <div>{time}</div>
      </div>

      <hr />

      {/* MAIN GRID */}
      <div style={{ display: "flex", height: "80%" }}>

        {/* THREAT FEED */}
        <div style={{ width: "25%", borderRight: "1px solid cyan", padding: "10px", overflowY: "auto" }}>
          <h3>THREAT FEED</h3>

          {events.map((e, i) => (
            <div key={i} style={{
              marginBottom: "10px",
              borderLeft: `3px solid ${e.defcon === 1 ? "red" : e.defcon === 2 ? "yellow" : "cyan"}`
            }}>
              <div>{e.node}</div>
              <div>{e.threat_type}</div>
              <div>{e.threat_score}</div>
            </div>
          ))}
        </div>

        {/* NETWORK */}
        <div style={{ width: "50%", borderRight: "1px solid cyan", padding: "10px" }}>
          <h3>NETWORK MAP</h3>
          {latestEvent && <NetworkGraph latestEvent={latestEvent} />}
        </div>

        {/* AGENT */}
        <div style={{ width: "25%", padding: "10px" }}>
          <h3>AEGIS AGENT</h3>

          <div>
            {latestEvent
              ? `Threat on ${latestEvent.node}`
              : "Monitoring..."}
          </div>

          <h3>EXPLAINABILITY</h3>
          {latestEvent && <ExplainPanel latestEvent={latestEvent} />}
        </div>
      </div>

      {/* BOTTOM */}
      <div style={{ marginTop: "10px", borderTop: "1px solid cyan" }}>
        DEFCON: {defcon} |
        THREAT SCORE: {latestEvent?.threat_score || 0}
      </div>

      {/* POPUP */}
      {latestEvent && !popupShown && (
        <RecommendationPopup
          latestEvent={latestEvent}
          onShown={() => setPopupShown(true)}
        />
      )}

      {/* EXTRA COMPONENTS */}
      <ThreatGraph events={events} />
      <Radar latestEvent={latestEvent} />
      <ThreatIntel latestEvent={latestEvent} />
      <ClassifiedTerminal />

      {/* BUTTONS */}
      <button onClick={() =>
        window.open("http://10.28.133.246:8000/download-report", "_blank")
      }>
        DOWNLOAD REPORT
      </button>

      <button
        onClick={async () => {
          const res = await fetch("http://10.28.133.246:8000/send-report");
          const data = await res.json();
          alert(data.message);
        }}
      >
        SEND TO AUTHORITY
      </button>

    </div>
  );
}

export default App;