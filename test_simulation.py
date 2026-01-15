import requests
import time
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def test_simulation():
    print("--- 🧪 Testing TitanBot Simulation Mode ---")
    
    # 1. Register/Login to get token
    email = f"sim_test_{int(time.time())}@example.com"
    password = "password123"
    print(f"\nCreating User: {email}")
    
    try:
        r = requests.post(f"{BASE_URL}/auth/register", json={
            "email": email,
            "password": password,
            "full_name": "Sim User"
        })
        if r.status_code == 200:
            token = r.json()["access_token"]
            print("✅ Registration Successful")
        else:
            print("❌ Registration Failed:", r.text)
            return
    except Exception as e:
        print("❌ Backend Unreachable:", e)
        return

    # 2. Test Chat Simulation Patterns
    test_messages = [
        "help",
        "weather",
        "news",
        "advice",
        "tell me a fact"
    ]

    for msg in test_messages:
        print(f"\nSending Message: '{msg}'...")
        try:
            with requests.post(f"{BASE_URL}/chat/send", json={
                "message": msg,
                "model": "gemini-2.0-flash" 
            }, headers={"Authorization": f"Bearer {token}"}, stream=True) as r:
                if r.status_code == 200:
                    print("   Response: ", end="")
                    full_response = ""
                    for chunk in r.iter_content(chunk_size=None):
                        if chunk:
                            text = chunk.decode()
                            print(text, end="")
                            full_response += text
                    print("\n✅ Stream Completed")
                    
                    # Verify Simulation Mode checks
                    if "**Simulation Mode**" in full_response or "**NOTICE: API Quota Exceeded" in full_response or "Sim User" in full_response:
                        print("   > 🎯 Simulation Mode Active (Confirmed)")
                    else:
                        print("   > ❓ API might be working (or standard fallback)")

                else:
                    print("❌ Chat Failed:", r.status_code, r.text)
        except Exception as e:
            print("❌ Chat Exception:", e)

if __name__ == "__main__":
    test_simulation()
