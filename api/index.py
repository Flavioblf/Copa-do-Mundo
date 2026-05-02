import sys
import os

# Adiciona backend/ ao path para que "from routers import ..." funcione dentro de main.py
backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend')
sys.path.insert(0, backend_dir)

from main import app
