from pydantic import BaseModel
from typing import Optional
from enum import Enum

class JornadaEnum(str, Enum):
    manana = "Mañana"
    tarde = "Tarde"

class VotoCreate(BaseModel):
    candidato_id: int
    jornada: JornadaEnum

class Candidato(BaseModel):
    id: int
    nombre: str
    color: str
    imagen_url: str
    numero_tarjeton: str
    jornada: JornadaEnum
