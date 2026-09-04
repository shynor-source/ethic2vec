"""Firestore client singleton. Storage is intentionally not used."""

from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore

from app.config import settings


def _resolve_credentials_path() -> Path:
    """Resolve the service account path relative to the backend root."""
    candidate = Path(settings.firebase_credentials_path)
    if candidate.is_absolute():
        return candidate
    # app/firebase_client.py -> app/ -> backend/
    backend_root = Path(__file__).resolve().parent.parent
    return backend_root / candidate


_db = None


def get_db():
    """Return the shared Firestore client, initializing the app once.

    Initialization is lazy so importing this module never crashes when the
    service account file is absent (e.g. health checks in an image built
    without secrets). The first real Firestore call raises a clear error.
    """
    global _db
    if _db is not None:
        return _db
    if not firebase_admin._apps:
        cred = credentials.Certificate(str(_resolve_credentials_path()))
        firebase_admin.initialize_app(cred)
    _db = firestore.client()
    return _db
