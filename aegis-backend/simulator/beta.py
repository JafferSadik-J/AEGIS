import requests
import time

URL = "http://127.0.0.1:8000/ingest"

def attack():
    print("Launching PHANTOM INJECTION (Lateral Movement)...")

    for i in range(10):
        data = {
            "node": "BETA",
            "lateral_movement": True
        }

        response = requests.post(URL, json=data)
        print(response.json())

        time.sleep(1)

if __name__ == "__main__":
    input("Press ENTER to launch attack...")
    attack()