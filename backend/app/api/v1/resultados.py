# ==============================================================================
# MÓDULO: Consolidación y Cálculo de Resultados Electorales
# ==============================================================================

from fastapi import APIRouter, HTTPException, Depends
from app.core.database import get_db_connection
from app.api.v1.auth import get_current_admin

router = APIRouter(
    prefix="/resultados",
    tags=["resultados"]
)

# --- Endpoints ---
@router.get("/")
def get_resultados(jornada: str = None, admin: dict = Depends(get_current_admin)):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Error de conexión a la base de datos")
    
    try:
        with conn.cursor() as cursor:
            if jornada and jornada != 'Todas':
                query = """
                    SELECT 
                        c.id, c.nombre, c.color, c.imagen_url, c.numero_tarjeton, c.jornada,
                        COUNT(v.id) as votos
                    FROM candidatos c
                    LEFT JOIN votos v ON c.id = v.candidato_id
                    WHERE c.jornada = %s
                    GROUP BY c.id
                    ORDER BY votos DESC
                """
                cursor.execute(query, (jornada,))
            else:
                query = """
                    SELECT 
                        c.id, c.nombre, c.color, c.imagen_url, c.numero_tarjeton, c.jornada,
                        COUNT(v.id) as votos
                    FROM candidatos c
                    LEFT JOIN votos v ON c.id = v.candidato_id
                    GROUP BY c.id
                    ORDER BY votos DESC
                """
                cursor.execute(query)
            resultados = cursor.fetchall()
                
            total_votos = sum(r['votos'] for r in resultados)
            
            # Cálculo de porcentajes y formato de tarjetón
            for r in resultados:
                r['porcentaje'] = round((r['votos'] / total_votos) * 100, 1) if total_votos > 0 else 0.0
                r['tarjeton_formateado'] = f"{str(r['numero_tarjeton']).zfill(2)}"
            
            return {
                "total_votos": total_votos,
                "resultados": resultados
            }
    finally:
        conn.close()
