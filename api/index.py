import sys
import os

# Add the project root AND backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from backend.app.main import app

# Vercel needs "app" to be available at module level
# This file is the entry point defined in vercel.json rewrites
