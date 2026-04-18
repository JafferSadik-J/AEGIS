def decide_response(threat):
    score = threat["score"]

    if score <= 0.60:
        return {
            "defcon": 3,
            "action": "AUTO_RESOLVE",
            "response": "Blocked source IP"
        }

    elif score <= 0.85:
        return {
            "defcon": 2,
            "action": "AWAIT_HUMAN",
            "response": "Recommend node isolation"
        }

    else:
        return {
            "defcon": 1,
            "action": "AIR_GAP",
            "response": "Severing external network"
        }