# ==============================================================================
# MÓDULO: Esquemas de Datos (Pydantic & Enums)
# ==============================================================================

from pydantic import BaseModel
from enum import Enum

# --- Enumeraciones ---
class JornadaEnum(str, Enum):
    manana = "Mañana"
    tarde = "Tarde"

# --- Esquemas de Votación ---
class VotoCreate(BaseModel):
    candidato_id: int

# --- Esquemas de Candidatos ---
class Candidato(BaseModel):
    id: int
    nombre: str
    color: str
    imagen_url: str
    numero_tarjeton: str
    jornada: JornadaEnum
