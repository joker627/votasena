# ==============================================================================
# MÓDULO: Autenticación y Seguridad (JWT & Bcrypt)
# ==============================================================================

import datetime
import bcrypt
import jwt
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from app.core.database import get_db_connection

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

# --- Constantes Criptográficas ---
SECRET_KEY = "votasena_secreto_super_seguro_2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 12

security = HTTPBearer()

# --- Funciones de Acceso a Credenciales ---
def get_hash(rol: str):
    conn = get_db_connection()
    if conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT codigo_hash FROM credenciales WHERE rol = %s", (rol,))
            row = cursor.fetchone()
            if row:
                return row["codigo_hash"]
    return None

def set_voto_code(new_code: str):
    new_hash = bcrypt.hashpw(new_code.encode(), bcrypt.gensalt()).decode()
    conn = get_db_connection()
    if conn:
        with conn.cursor() as cursor:
            cursor.execute("INSERT INTO credenciales (rol, codigo_hash) VALUES ('voto', %s) ON DUPLICATE KEY UPDATE codigo_hash = %s", (new_hash, new_hash))
            conn.commit()

def verify_code(plain_code: str, rol: str) -> bool:
    stored_hash = get_hash(rol)
    if not stored_hash:
        return False
    return bcrypt.checkpw(plain_code.encode(), stored_hash.encode())

# --- Generación y Verificación de Tokens JWT ---
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

# --- Dependencias de Control de Acceso ---
def get_current_admin(payload: dict = Depends(verify_token)):
    if payload.get("rol") != "admin":
        raise HTTPException(status_code=403, detail="No tienes permisos de administrador")
    return payload

def get_current_voter(payload: dict = Depends(verify_token)):
    if payload.get("rol") not in ["admin", "voto"]:
        raise HTTPException(status_code=403, detail="No tienes permisos para esta acción")
    return payload

# --- Modelos de Solicitud ---
class AuthRequest(BaseModel):
    tipo: str
    codigo: str

class UpdateCodeRequest(BaseModel):
    nuevo_codigo: str

# --- Endpoints ---
@router.post("/verificar")
def verificar_codigo(req: AuthRequest):
    if req.tipo in ["voto", "admin"]:
        if verify_code(req.codigo, req.tipo):
            token = create_access_token(data={"rol": req.tipo})
            return {"valido": True, "token": token}
            
    raise HTTPException(status_code=401, detail="Código inválido")

@router.get("/codigo-voto")
def obtener_codigo_voto(admin: dict = Depends(get_current_admin)):
    return {"codigo": "******** (Oculto)"}

@router.put("/codigo-voto")
def actualizar_codigo_voto(req: UpdateCodeRequest, admin: dict = Depends(get_current_admin)):
    set_voto_code(req.nuevo_codigo)
    return {"mensaje": "Código actualizado"}
