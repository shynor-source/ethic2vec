"""Application entrypoint for the Ethic2Vec backend service."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import analyze, scenarios

app = FastAPI(
    title="Ethic2Vec Backend",
    version="0.1.0",
    description="Backend service for Ethic2Vec.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",") if o.strip()],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scenarios.router)
app.include_router(analyze.router)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    """Return service health status."""
    return {"status": "ok"}


@app.get("/api/health", tags=["health"])
def api_health_check() -> dict[str, str]:
    """Render health check path. Same status as /health."""
    return {"status": "ok"}
