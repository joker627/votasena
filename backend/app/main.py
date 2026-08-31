from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import candidatos, votos, resultados, exportar

app = FastAPI(title="VotaSena API", version="1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir Routers con prefijo /api/v1
app.include_router(candidatos.router, prefix="/api/v1")
app.include_router(votos.router, prefix="/api/v1")
app.include_router(resultados.router, prefix="/api/v1")
app.include_router(exportar.router, prefix="/api/v1")


@app.get("/", tags=["Home"])
def home():
    return {"mensaje": "API de VotaSena funcionando correctamente"}
