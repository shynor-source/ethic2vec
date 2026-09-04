"""Application entrypoint for the Ethic2Vec backend service."""

from fastapi import FastAPI

from app.routers import analyze, scenarios

app = FastAPI(
    title="Ethic2Vec Backend",
    version="0.1.0",
    description="Backend service for Ethic2Vec.",
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
