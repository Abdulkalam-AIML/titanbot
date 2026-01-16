import sys
import os
import traceback
from fastapi import FastAPI, Response

# Add paths
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

# Create a safe app that definitely starts
app = FastAPI()

@app.get("/api")
def root():
    return {"status": "Vercel Python is Running", "next_step": "Go to /api/debug to load backend"}

@app.get("/api/debug")
def debug_backend():
    try:
        # Attempt to import the real backend here (lazy loading)
        from backend.app.main import app as real_app
        return {"status": "Backend Import Successful!", "routes": [r.path for r in real_app.routes]}
    except Exception:
        return Response(content=f"IMPORT ERROR:\n{traceback.format_exc()}", media_type="text/plain", status_code=500)

# Try to mount the real app if possible, but don't crash if it fails
try:
    from backend.app.main import app as real_app
    # If successful, we mount it? 
    # Vercel ENTRYPOINT needs 'app' to be the one taking traffic.
    # If we overwrite 'app' here, we risk crash on startup.
    # STRATEGY: We keep 'app' as the safe one, but we mount the real one under /api if it works?
    # No, Vercel standard requires `app` to be THE app.
    
    # New Strategy: If import works, we overwrite 'app'. If not, we keep 'app' as the error reporter.
    app = real_app
except Exception:
    pass # We already defined 'app' as the safe error reporter above.
    # We will just let the safe app run. The user will see 404s for normal routes but /api/debug will work.


# Vercel needs "app" to be available at module level
# This file is the entry point defined in vercel.json rewrites
