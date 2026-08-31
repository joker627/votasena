from fastapi import APIRouter, HTTPException, status
from app.core.database import get_db_connection
from app.models.schemas import VotoCreate

router = APIRouter(
    prefix="/votar",
    tags=["votos"]
)

@router.post("/", status_code=status.HTTP_201_CREATED)
def registrar_voto(voto: VotoCreate):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Error de conexión a la base de datos")
    
    try:
        with conn.cursor() as cursor:
            # Verificar si el candidato existe
            cursor.execute("SELECT id FROM candidatos WHERE id = %s", (voto.candidato_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Candidato no encontrado")
            
            # Registrar el voto
            cursor.execute("INSERT INTO votos (candidato_id, jornada) VALUES (%s, %s)", (voto.candidato_id, voto.jornada.value))
            conn.commit()
            return {"mensaje": "Voto registrado correctamente"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
