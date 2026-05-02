from fastapi import APIRouter
from services.data_loader import store

router = APIRouter()

@router.get("/groups")
def get_groups():
    groups = store.get('groups', {})
    return {"data": list(groups.values()), "meta": {"total": len(groups)}}

@router.get("/groups/{group_id}")
def get_group(group_id: str):
    groups = store.get('groups', {})
    group = groups.get(group_id.upper())
    if not group:
        return {"error": "Grupo não encontrado"}
    return {"data": group}
