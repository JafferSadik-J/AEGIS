import requests
import time

URL = "http://127.0.0.1:8000/ingest"

def attack():
    print("Launching BLACKOUT (Full Compromise)...")

    data = {
        "node": "GAMMA",
        "command_injection": True,
        "data_transfer_mb": 1000,
        "failed_logins": 80
    }

    response = requests.post(URL, json=data)
    print(response.json())

if __name__ == "__main__":
    input("Press ENTER to launch attack...")
    attack()