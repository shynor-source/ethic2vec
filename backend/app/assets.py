"""Load ML pipeline assets, local-first with GitHub raw fallback.

Local files in backend/data_pipeline/output/ are excluded from the Docker
image, so production fetches the same files from ASSETS_BASE_URL
(cloud-assets/ on GitHub raw). Results are cached in memory.
"""

from __future__ import annotations

import io
import json
from functools import lru_cache
from pathlib import Path

import joblib
import pandas as pd
import requests

from app.config import settings

BACKEND_ROOT = Path(__file__).resolve().parent.parent
LOCAL_OUTPUT_DIR = BACKEND_ROOT / "data_pipeline" / "output"

ASSET_FILES = {
    "country_vectors": "country_vectors.parquet",
    "demographic_vectors": "demographic_vectors.parquet",
    "scaler": "scaler.pkl",
    "pca": "pca.pkl",
    "feature_columns": "feature_columns.json",
    "question_bank": "question_bank.json",
}


def _download(filename: str) -> bytes:
    """Download one asset file from the public GitHub raw base URL."""
    url = f"{settings.assets_base_url.rstrip('/')}/{filename}"
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return response.content


def _read_bytes(filename: str) -> bytes:
    """Read an asset from local output dir, falling back to remote download."""
    local_path = LOCAL_OUTPUT_DIR / filename
    if local_path.exists():
        return local_path.read_bytes()
    return _download(filename)


@lru_cache(maxsize=1)
def get_country_vectors() -> pd.DataFrame:
    return pd.read_parquet(io.BytesIO(_read_bytes(ASSET_FILES["country_vectors"])))


@lru_cache(maxsize=1)
def get_demographic_vectors() -> pd.DataFrame:
    return pd.read_parquet(
        io.BytesIO(_read_bytes(ASSET_FILES["demographic_vectors"]))
    )


@lru_cache(maxsize=1)
def get_scaler():
    return joblib.load(io.BytesIO(_read_bytes(ASSET_FILES["scaler"])))


@lru_cache(maxsize=1)
def get_pca():
    return joblib.load(io.BytesIO(_read_bytes(ASSET_FILES["pca"])))


@lru_cache(maxsize=1)
def get_feature_columns() -> list[str]:
    return json.loads(_read_bytes(ASSET_FILES["feature_columns"]).decode("utf-8"))


@lru_cache(maxsize=1)
def get_question_bank() -> list[dict]:
    return json.loads(_read_bytes(ASSET_FILES["question_bank"]).decode("utf-8"))


def clear_cache() -> None:
    """Clear all cached assets. Useful in tests."""
    for loader in (
        get_country_vectors,
        get_demographic_vectors,
        get_scaler,
        get_pca,
        get_feature_columns,
        get_question_bank,
    ):
        loader.cache_clear()
