import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api"

def test_connectivity():
    print("--- 🧪 Testing TitanBot Connectivity ---")
    
    # 1. Test Root
    try:
        r = requests.get("http://127.0.0.1:8000/")
        if r.status_code == 200:
            print("✅ Backend Reachable:", r.json())
        else:
            print("❌ Backend Error:", r.status_code)
            return
    except Exception as e:
        print("❌ Backend Unreachable:", e)
        return

    # 2. Register
    email = f"test_{int(time.time())}@example.com"
    password = "password123"
    print(f"\nExample User: {email}")
    
    try:
        r = requests.post(f"{BASE_URL}/auth/register", json={
            "email": email,
            "password": password,
            "full_name": "Test User"
        })
        if r.status_code == 200:
            print("✅ Registration Successful")
            token = r.json()["access_token"]
        else:
            print("❌ Registration Failed:", r.text)
            return
    except Exception as e:
        print("❌ Registration Exception:", e)
        return

    # 3. Chat
    print("\nSending Message: 'Hello'...")
    try:
        with requests.post(f"{BASE_URL}/chat/send", json={
            "message": "Hello",
            "model": "gpt-3.5-turbo"
        }, headers={"Authorization": f"Bearer {token}"}, stream=True) as r:
            if r.status_code == 200:
                print("✅ Chat Request Successful. Response:")
                print("   ", end="")
                for chunk in r.iter_content(chunk_size=None):
                    if chunk:
                        print(chunk.decode(), end="")
                print("\n✅ Stream Completed")
            else:
                print("❌ Chat Failed:", r.status_code, r.text)
    except Exception as e:
        print("❌ Chat Exception:", e)

if __name__ == "__main__":
    test_connectivity()
