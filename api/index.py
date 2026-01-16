import sys
import os

# Add the project root AND backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

try:
    from backend.app.main import app
except Exception as e:
    import traceback
    from fastapi import FastAPI
    from fastapi.responses import PlainTextResponse
    
    app = FastAPI()
    
    error_msg = f"TitanBot Backend Crash Report:\n\n{str(e)}\n\n{traceback.format_exc()}"
    
    @app.get("/{catchall:path}")
    def fallback(catchall: str):
        return PlainTextResponse(error_msg, status_code=500)

# Vercel needs "app" to be available at module level
# This file is the entry point defined in vercel.json rewrites
