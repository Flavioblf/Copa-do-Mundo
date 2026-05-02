from fastapi import APIRouter
from services.data_loader import store

router = APIRouter()

@router.get("/bracket")
def get_bracket():
    return {"data": store.get('bracket_2026', {})}
