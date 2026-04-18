def detect_threat(event):

    if event.get("command_injection", False):
        return {
            "type": "C2_attack",
            "score": 0.97,
            "reasons": ["Command injection detected", "Unauthorized control signal"]
        }

    if event.get("data_transfer_mb", 0) > 500:
        return {
            "type": "data_exfiltration",
            "score": 0.78,
            "reasons": ["High outbound data transfer", "Unusual traffic spike"]
        }

    if event.get("lateral_movement", False):
        return {
            "type": "lateral_movement",
            "score": 0.74,
            "reasons": ["Unexpected node-to-node communication"]
        }

    if event.get("failed_logins", 0) > 20:
        return {
            "type": "brute_force",
            "score": 0.52,
            "reasons": ["High failed login attempts"]
        }

    return {
        "type": "normal",
        "score": 0.1,
        "reasons": ["Normal activity"]
    }