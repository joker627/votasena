# ==============================================================================
# MÓDULO: Conexión a Base de Datos MySQL
# ==============================================================================

import pymysql
from pymysql.cursors import DictCursor
from app.core.config import settings

# --- Pool / Conexión de Base de Datos ---
def get_db_connection():
    try:
        connection = pymysql.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            database=settings.DB_NAME,
            cursorclass=DictCursor
        )
        return connection
    except pymysql.MySQLError as e:
        print(f"Error conectando a MySQL: {e}")
        return None
