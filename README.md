# VotaSena - Sistema Institucional de Elecciones

Sistema integral para votaciones y conteo analítico de resultados diseñado para la comunidad SENA.

## Requisitos Previos

Asegúrate de tener instalado en tu computadora:
- **Python 3.8+** (Para el Backend y servir el Frontend)
- **MySQL** (Base de datos en ejecución)
- (Opcional) Un entorno virtual de Python.

---

## ⚙️ 1. Iniciar el Backend (API FastAPI)

El backend maneja la conexión con la base de datos MySQL, el registro de votos y la generación de reportes en Excel y PDF.

1. Abre una terminal y navega a la carpeta del backend:
   ```bash
   cd C:\votasena\backend
   ```
2. Instala las dependencias necesarias (si no lo has hecho):
   ```bash
   pip install fastapi uvicorn pymysql openpyxl fpdf2
   ```
3. Inicia el servidor de desarrollo en el puerto 8000:
   ```bash
   fastapi dev
   ```
   *(El servidor estará disponible en `http://127.0.0.1:8000`)*

---

## 🎨 2. Iniciar el Frontend (Interfaz Web)

El frontend contiene la Urna Virtual (`urna.html`) y el Dashboard Analítico (`index.html`).

1. Abre una **nueva terminal** (dejando la del backend corriendo) y navega a la carpeta del frontend:
   ```bash
   cd C:\votasena\frontend
   ```
2. Inicia un servidor web estático en el puerto 7000:
   ```bash
   python -m http.server 7000 --bind 127.0.0.1
   ```
3. **¡Listo!** Ahora puedes acceder a la aplicación en tu navegador:
   - **Dashboard (Panel de Control):** [http://127.0.0.1:7000/index.html](http://127.0.0.1:7000/index.html)
   - **Urna (Votación):** [http://127.0.0.1:7000/urna.html](http://127.0.0.1:7000/urna.html)

---

## 🛠️ Notas Adicionales
- Asegúrate de que las credenciales de tu base de datos local coincidan con las configuradas en `C:\votasena\backend\app\core\database.py`.
- Si necesitas exportar a PDF o Excel, asegúrate de tener las librerías instaladas tal como se detalla en el paso del Backend.
