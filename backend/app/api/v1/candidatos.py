from fastapi import APIRouter, HTTPException
from typing import List
from app.core.database import get_db_connection
from app.models import schemas
import pymysql

router = APIRouter(
    prefix="/candidatos",
    tags=["candidatos"]
)

@router.get("/", response_model=List[schemas.Candidato])
def obtener_candidatos(jornada: str = None):
    try:
        conn = get_db_connection()
        if not conn:
            raise HTTPException(status_code=500, detail="Error de conexión a la base de datos")
        
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            if jornada:
                cursor.execute("SELECT * FROM candidatos WHERE jornada = %s", (jornada,))
            else:
                cursor.execute("SELECT * FROM candidatos")
            candidatos = cursor.fetchall()
            return candidatos
    finally:
        if conn:
            conn.close()
