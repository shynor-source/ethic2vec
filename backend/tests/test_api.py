"""API tests. Firestore writes are stubbed out; no network calls."""

from fastapi.testclient import TestClient

import app.routers.analyze as analyze_router
from app.main import app


def _client(monkeypatch) -> TestClient:
    monkeypatch.setattr(analyze_router, "save_session", lambda a, r: "test-id")
    return TestClient(app)


def test_random_scenarios_distinct_dimensions(monkeypatch):
    client = _client(monkeypatch)
    response = client.get("/api/scenarios/random", params={"n": 6})
    assert response.status_code == 200
    scenarios = response.json()["scenarios"]
    assert len(scenarios) == 6
    assert len({s["dimension"] for s in scenarios}) == 6
    assert all(s["choice_a"] and s["choice_b"] for s in scenarios)
    assert all(s["choice_a_vi"] and s["choice_b_vi"] for s in scenarios)
    assert all(s["context_en"] and s["context_vi"] for s in scenarios)


def test_random_scenarios_full_coverage(monkeypatch):
    client = _client(monkeypatch)
    response = client.get("/api/scenarios/random", params={"n": 12})
    assert response.status_code == 200
    scenarios = response.json()["scenarios"]
    assert len(scenarios) == 12
    assert len({s["dimension"] for s in scenarios}) == 12
    assert len({s["outcome_id"] for s in scenarios}) == 12


def test_random_scenarios_rejects_invalid_n(monkeypatch):
    client = _client(monkeypatch)
    assert client.get("/api/scenarios/random", params={"n": 0}).status_code == 422
    assert client.get("/api/scenarios/random", params={"n": 99}).status_code == 422


def test_analyze_returns_full_payload(monkeypatch):
    client = _client(monkeypatch)
    scenarios = client.get("/api/scenarios/random", params={"n": 6}).json()[
        "scenarios"
    ]
    payload = {
        "answers": [
            {
                "outcome_id": s["outcome_id"],
                "dimension": s["dimension"],
                "choice": "A" if i % 2 == 0 else "B",
            }
            for i, s in enumerate(scenarios)
        ]
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == "test-id"
    assert len(data["top_countries"]) == 5
    assert len(data["top_demographics"]) == 5
    assert data["match_pool_size"] >= 100
    tiny_noisy = {"IOT", "ATA", "YEM", "TON", "CAF", "NIU"}
    assert not (tiny_noisy & {c["country"] for c in data["top_countries"]})
    assert len(data["radar"]) == 6
    assert len(data["user_pc"]) == 3
    assert all(
        {"dimension", "user_pct", "match_pct", "global_pct", "gap"} <= set(s)
        for s in data["blind_spots"]
    )
    assert len(data["blind_spots"]) == 6
    gaps = [s["gap"] for s in data["blind_spots"]]
    assert gaps == sorted(gaps, reverse=True)
    assert any(p["kind"] == "user" for p in data["scatter_pc12"])
    assert any(p["kind"] == "user" for p in data["scatter_pc13"])


def test_analyze_single_answer(monkeypatch):
    client = _client(monkeypatch)
    payload = {
        "answers": [
            {"outcome_id": "probe-1", "dimension": "Species_Pets", "choice": "A"},
        ]
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["top_countries"]) == 5
    assert data["match_pool_size"] >= 100


def test_analyze_deterministic(monkeypatch):
    client = _client(monkeypatch)
    scenarios = client.get("/api/scenarios/random", params={"n": 6}).json()[
        "scenarios"
    ]
    payload = {
        "answers": [
            {
                "outcome_id": s["outcome_id"],
                "dimension": s["dimension"],
                "choice": "A",
            }
            for s in scenarios
        ]
    }
    first = client.post("/api/analyze", json=payload).json()
    second = client.post("/api/analyze", json=payload).json()
    assert first["top_countries"] == second["top_countries"]
    assert first["user_pc"] == second["user_pc"]


def test_analyze_graded_strength(monkeypatch):
    client = _client(monkeypatch)
    scenarios = client.get("/api/scenarios/random", params={"n": 6}).json()[
        "scenarios"
    ]
    payload = {
        "answers": [
            {
                "outcome_id": s["outcome_id"],
                "dimension": s["dimension"],
                "choice": "A" if i % 2 == 0 else "B",
                "strength": "lean" if i % 2 == 0 else "strong",
            }
            for i, s in enumerate(scenarios)
        ]
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    assert len(response.json()["top_countries"]) == 5


def test_analyze_rejects_bad_strength(monkeypatch):
    client = _client(monkeypatch)
    payload = {
        "answers": [
            {
                "outcome_id": "x",
                "dimension": "Age_Old",
                "choice": "A",
                "strength": "maybe",
            },
        ]
    }
    assert client.post("/api/analyze", json=payload).status_code == 422


def test_analyze_rejects_bad_choice(monkeypatch):
    client = _client(monkeypatch)
    payload = {
        "answers": [
            {"outcome_id": "x", "dimension": "Age_Old", "choice": "C"},
        ]
    }
    assert client.post("/api/analyze", json=payload).status_code == 422


def test_analyze_rejects_empty_answers(monkeypatch):
    client = _client(monkeypatch)
    assert client.post("/api/analyze", json={"answers": []}).status_code == 422


def test_cors_allows_vercel_origin(monkeypatch):
    client = _client(monkeypatch)
    response = client.get(
        "/api/scenarios/random",
        params={"n": 1},
        headers={"Origin": "https://ethic2vec.vercel.app"},
    )
    assert response.status_code == 200
    assert (
        response.headers["access-control-allow-origin"]
        == "https://ethic2vec.vercel.app"
    )


def test_cors_preflight(monkeypatch):
    client = _client(monkeypatch)
    response = client.options(
        "/api/analyze",
        headers={
            "Origin": "https://ethic2vec.vercel.app",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 200
    assert "POST" in response.headers["access-control-allow-methods"]
