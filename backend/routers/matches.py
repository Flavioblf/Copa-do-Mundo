from fastapi import APIRouter, Query
from typing import Optional
from services.data_loader import store

router = APIRouter()

@router.get("/matches")
def get_matches(group: Optional[str] = None, stage: Optional[str] = None, team: Optional[str] = None):
    matches = store.get('calendar_2026', [])
    if group:
        matches = [m for m in matches if m['group'] == group.upper()]
    if stage:
        matches = [m for m in matches if m['stage'] == stage]
    if team:
        matches = [m for m in matches if m['home'] == team or m['away'] == team]
    return {"data": matches, "meta": {"total": len(matches)}}

@router.get("/matches/{match_id}")
def get_match(match_id: int):
    matches = store.get('calendar_2026', [])
    match = next((m for m in matches if m['id'] == match_id), None)
    if not match:
        return {"error": "Partida não encontrada"}
    return {"data": match}
