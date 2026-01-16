import sys
import os

# Add the project root to sys.path so 'backend' module is found
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.app.main import app

# Vercel needs "app" to be available at module level
# This file is the entry point defined in vercel.json rewrites
