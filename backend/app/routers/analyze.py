"""Answer analysis endpoint with Firestore session persistence."""

from __future__ import annotations

import logging
from typing import Literal

from fastapi import APIRouter
from firebase_admin.firestore import SERVER_TIMESTAMP
from pydantic import BaseModel, Field

from app.analysis import analyze
from app.firebase_client import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["analyze"])


class AnswerItem(BaseModel):
    outcome_id: str
    dimension: str
    choice: Literal["A", "B"]


class AnalyzeRequest(BaseModel):
    answers: list[AnswerItem] = Field(min_length=1, max_length=50)


def save_session(answers: list[dict], result: dict) -> str | None:
    """Persist one quiz session. Returns the document id, or None on failure."""
    try:
        _, ref = (
            get_db()
            .collection("sessions")
            .add(
                {
                    "answers": answers,
                    "user_pc": result["user_pc"],
                    "top_countries": result["top_countries"],
                    "top_demographics": result["top_demographics"],
                    "match_name": result["match_name"],
                    "created_at": SERVER_TIMESTAMP,
                }
            )
        )
        return ref.id
    except Exception as exc:  # noqa: BLE001 - analysis must survive DB outages
        logger.warning("Failed to save session: %s", exc)
        return None


@router.post("/analyze")
def analyze_answers(request: AnalyzeRequest) -> dict:
    """Score answers and return matches, charts data, and blind spots."""
    answers = [item.model_dump() for item in request.answers]
    result = analyze(answers)
    session_id = save_session(answers, result)
    return {**result, "session_id": session_id}
