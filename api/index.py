import sys
import os

# Adiciona a raiz do projeto ao path para importar backend.*
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app
