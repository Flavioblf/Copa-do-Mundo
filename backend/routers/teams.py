from fastapi import APIRouter
from services.data_loader import store

router = APIRouter()

@router.get("/teams")
def get_teams():
    teams = store.get('teams_2026', [])
    return {"data": teams, "meta": {"total": len(teams)}}

@router.get("/teams/{team_id}")
def get_team(team_id: str):
    teams = store.get('teams_2026', [])
    team = next((t for t in teams if t['id'] == team_id), None)
    if not team:
        return {"error": "Seleção não encontrada"}

    matches = [m for m in store.get('calendar_2026', [])
               if m['home'] == team_id or m['away'] == team_id]

    history = [c for c in store.get('history', [])
               if c['winner'] == team.get('name')
               or c['runner_up'] == team.get('name')
               or c['third'] == team.get('name')]

    return {"data": {**team, "matches_2026": matches, "history_highlights": history}}
