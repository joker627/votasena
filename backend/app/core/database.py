import pymysql
from pymysql.cursors import DictCursor
from app.core.config import settings

def get_db_connection():
    try:
        connection = pymysql.connect(
            host=settings.DB_HOST,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            database=settings.DB_NAME,
            cursorclass=DictCursor
        )
        return connection
    except pymysql.MySQLError as e:
        print(f"Error conectando a MySQL: {e}")
        return None
