# ==============================================================================
# MÓDULO: Registro y Procesamiento de Votos
# ==============================================================================

from fastapi import APIRouter, HTTPException, status, Depends
from app.core.database import get_db_connection
from app.models.schemas import VotoCreate
from app.api.v1.auth import get_current_voter

router = APIRouter(
    prefix="/votar",
    tags=["votos"]
)

# --- Endpoints ---
@router.post("/", status_code=status.HTTP_201_CREATED)
def registrar_voto(voto: VotoCreate, voter: dict = Depends(get_current_voter)):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Error de conexión a la base de datos")
    
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, jornada FROM candidatos WHERE id = %s", (voto.candidato_id,))
            candidato = cursor.fetchone()
            if not candidato:
                raise HTTPException(status_code=404, detail="Candidato no encontrado")
            
            cursor.execute(
                "INSERT INTO votos (candidato_id, jornada) VALUES (%s, %s)",
                (voto.candidato_id, candidato['jornada'])
            )
            conn.commit()
            return {"mensaje": "Voto registrado correctamente"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
