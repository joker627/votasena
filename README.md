# VotaSena - Sistema Institucional de Elecciones

Sistema integral para votaciones y conteo analítico de resultados diseñado para la comunidad SENA.

---

## 📋 Requisitos Previos

Asegúrate de tener instalado en tu computadora:
1. **Python 3.8 o superior** (Se usará para el servidor backend y frontend).
2. **MySQL Server** (Base de datos en ejecución).
3. **Git** (Opcional, para clonar el repositorio).

4 **Crear archivo .ENV en la raíz del backend ya que ahí se tomarán las credenciales **

---

## 🛠️ Manual de Instalación Paso a Paso

Sigue estos pasos en orden para levantar el proyecto desde cero en tu máquina local.

### Paso 1: Configurar la Base de Datos (MySQL)

1. Abre tu gestor de base de datos preferido (phpMyAdmin, DBeaver, MySQL Workbench, etc.).
2. Crea una base de datos vacía. Por defecto, el sistema intentará conectarse a una base de datos llamada `votasena`.
3. Importa el archivo `database.sql` (ubicado en `backend/database.sql`) para crear las tablas necesarias (`candidatos`, `votos`, `credenciales`).
4. Revisa el archivo de configuración `backend/app/core/database.py` o tu archivo `.env` para asegurarte de que las credenciales coincidan con las de tu equipo local (usuario por defecto: `root`, sin contraseña).

> **IMPORTANTE:** El archivo `database.sql` ya incluye dos contraseñas por defecto (encriptadas en Bcrypt) en la tabla `credenciales`:
> - Para votar (Urna): `votar2026`
> - Para el Dashboard (Admin): `admin2026`

### Paso 2: Preparar y Levantar el Backend (API)

El backend procesa la lógica de los votos, la conexión a MySQL y la generación de reportes (Excel/PDF).

1. Abre una **Terminal** (o Símbolo del Sistema) y navega a la carpeta del backend:
   ```bash
   cd C:\votasena\backend
   ```

2. **(Opcional pero muy recomendado)** Crea y activa un entorno virtual de Python para no mezclar librerías:
   - **En Windows:**
     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```
   - **En Mac/Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

4. Instala todas las dependencias exactas desde el archivo de requerimientos:
   ```bash
   pip install -r requirements.txt
   ```
   *(Esto instalará `fastapi`, `uvicorn`, `pymysql`, `bcrypt`, `openpyxl`, `fpdf2`, entre otras).*

4. Inicia el servidor de desarrollo del backend:
   ```bash
   fastapi dev
   ```
   *(Deberías ver en la consola que el servidor se está ejecutando en `http://127.0.0.1:8000`)*

### Paso 3: Levantar el Frontend (Interfaz Web)

El frontend contiene la Urna Virtual donde se vota y el Dashboard Analítico de resultados.

1. Abre una **NUEVA Terminal** (deja la terminal del backend abierta y corriendo) y navega a la carpeta del frontend:
   ```bash
   cd C:\votasena\frontend
   ```

2. Inicia un servidor web estático sencillo usando Python:
   ```bash
   python -m http.server 7000 --bind 127.0.0.1
   ```
   *(El frontend estará corriendo en el puerto 7000).*

---

## 🚀 Uso de la Aplicación

¡Felicidades! Ya tienes todo el sistema funcionando. Abre tu navegador web y entra a las siguientes rutas:

- **Urna de Votación:** [http://127.0.0.1:7000/urna.html](http://127.0.0.1:7000/urna.html)
  *Interfaz donde los votantes elegirán a su candidato.*

- **Dashboard Analítico (Administrador):** [http://127.0.0.1:7000/index.html](http://127.0.0.1:7000/index.html)
  *Panel de control en vivo para ver resultados filtrados y exportar reportes.*

> **Nota de Seguridad:** Asegúrate de que las pantallas donde se muestra el Dashboard no sean accesibles para los votantes, ya que muestran los resultados en tiempo real.

---

## 🔐 Seguridad y Hashes (Bcrypt)

Este sistema utiliza **Bcrypt** para encriptar unidireccionalmente todas las contraseñas.
Si olvidas las contraseñas o necesitas insertar una directamente en la base de datos (PHPMyAdmin/MySQL Workbench), **NUNCA** debes escribirla en texto plano porque el sistema la rechazará.

Para generar un código compatible, utiliza la herramienta externa incluida:
1. Abre una terminal en la carpeta principal `C:\votasena`
2. Ejecuta:
   ```bash
   python generar_hash.py
   ```
3. Escribe la contraseña que desees y pega la cadena gigante (ejemplo `$2b$12$...`) en la columna `codigo_hash` de la tabla `credenciales`.
