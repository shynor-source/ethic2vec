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


def get_db():
    """Return the shared Firestore client, initializing the app once."""
    if not firebase_admin._apps:
        cred = credentials.Certificate(str(_resolve_credentials_path()))
        firebase_admin.initialize_app(cred)
    return firestore.client()


db = get_db()
