"""Random scenario sampling for the quiz."""

from __future__ import annotations

import random
from collections import defaultdict

from fastapi import APIRouter, Query

from app.assets import get_question_bank

router = APIRouter(prefix="/api/scenarios", tags=["scenarios"])

MAX_DIMENSIONS = 12


@router.get("/random")
def random_scenarios(
    n: int = Query(default=6, ge=1, le=MAX_DIMENSIONS),
) -> dict:
    """Return n scenarios, each from a distinct dimension for wide coverage."""
    bank = get_question_bank()
    by_dimension: dict[str, list[dict]] = defaultdict(list)
    for entry in bank:
        by_dimension[entry["dimension"]].append(entry)
    dimensions = random.sample(
        sorted(by_dimension), k=min(n, len(by_dimension))
    )
    scenarios = [random.choice(by_dimension[dim]) for dim in dimensions]
    return {"scenarios": scenarios}
