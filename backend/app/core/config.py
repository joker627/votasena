# ==============================================================================
# MÓDULO: Configuración del Sistema y Variables de Entorno
# ==============================================================================

import os
from pathlib import Path
from dotenv import load_dotenv

# --- Carga de .env ---
load_dotenv(Path(__file__).resolve().parents[2] / ".env")

# --- Parámetros de Configuración ---
class Settings:
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", 3306))
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "votasena")

settings = Settings()
