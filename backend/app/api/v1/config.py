# ==============================================================================
# MÓDULO: Configuración Dinámica del Sistema (Live Update)
# ==============================================================================

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.core.database import get_db_connection
from app.api.v1.auth import get_current_admin

router = APIRouter(
    prefix="/config",
    tags=["configuracion"]
)

# --- Modelos de Solicitud ---
class ConfigUpdateRequest(BaseModel):
    valor: str

# --- Endpoints ---
@router.get("/live-update")
def get_live_update():
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Error de base de datos")
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT valor FROM configuracion WHERE clave = 'live_update'")
            result = cursor.fetchone()
            return {"live_update": (result['valor'] == 'true' if result else True)}
    finally:
        conn.close()

@router.put("/live-update")
def set_live_update(req: ConfigUpdateRequest, admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Error de base de datos")
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "UPDATE configuracion SET valor = %s WHERE clave = 'live_update'", 
                (req.valor,)
            )
        conn.commit()
        return {"mensaje": "Estado actualizado"}
    finally:
        conn.close()
