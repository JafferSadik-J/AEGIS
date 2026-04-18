from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import List
import pandas as pd
import io
import time

from core.detector import detect_threat
from core.decision_engine import decide_response
from pydantic import BaseModel
from typing import List, Optional

class ThreatInput(BaseModel):
    node: str
    threat_type: Optional[str] = None
    threat_score: Optional[float] = None
    defcon: Optional[int] = None
    action: Optional[str] = None
    message: Optional[str] = None
    reasons: Optional[List[str]] = None

app = FastAPI()

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ STORE EVENTS
event_log = []

# ✅ WEBSOCKET MANAGER
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, data: dict):
        for connection in self.active_connections:
            await connection.send_json(data)

manager = ConnectionManager()

# ✅ INGEST ENDPOINT (ONLY ONE)
@app.post("/ingest")
async def ingest_event(event: ThreatInput):

    event = event.model_dump()   # ✅ FIX

    if event.get("threat_type") and event.get("threat_score"):
        threat = {
            "type": event["threat_type"],
            "score": event["threat_score"],
            "reasons": event.get("reasons", ["Manual injection"])
        }
    else:
        threat = detect_threat(event)

    decision = decide_response(threat)

    response = {
        "node": event.get("node"),
        "threat_type": threat["type"],
        "threat_score": threat["score"],
        "defcon": event.get("defcon", decision["defcon"]),
        "action": event.get("action", decision["action"]),
        "message": decision["response"],
        "reasons": threat["reasons"]
    }

    event_log.append(response)
    await manager.broadcast(response)

    return response

# ✅ WEBSOCKET
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except:
        manager.disconnect(websocket)

# ✅ DOWNLOAD REPORT
@app.get("/download-report")
def download_report():
    if not event_log:
        return {"error": "No data available"}

    df = pd.DataFrame(event_log)

    output = io.BytesIO()
    df.to_excel(output, index=False, engine="openpyxl")
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=AEGIS_Report.xlsx"
        }
    )

# ✅ EMAIL SIMULATION
@app.get("/send-report")
def send_report():
    if not event_log:
        return {"status": "no_data"}

    time.sleep(2)

    print("📡 Sending report to defence authority...")
    print("📎 Attachment: AEGIS_Report.xlsx")
    print("📬 Status: SENT SUCCESSFULLY")

    return {
        "status": "sent",
        "message": "Report sent to Defence Authority"
    }