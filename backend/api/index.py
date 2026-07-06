import os
import sys

# Make the sibling server.py importable when this function is bundled by Vercel
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server import app  # noqa: E402,F401

# Vercel's Python runtime serves the ASGI `app` object exported here.
