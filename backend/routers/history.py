from fastapi import APIRouter
from services.data_loader import store

router = APIRouter()

@router.get("/history/cups")
def get_cups():
    data = store.get('history', [])
    return {"data": data, "meta": {"total": len(data)}}

@router.get("/history/cups/{year}")
def get_cup(year: int):
    cups = store.get('history', [])
    cup = next((c for c in cups if c['year'] == year), None)
    if not cup:
        return {"error": "Não encontrado"}
    return {"data": cup}

@router.get("/history/records")
def get_records():
    cups = store.get('history', [])
    if not cups:
        return {"data": {}}

    most_titles = {}
    for c in cups:
        w = c['winner']
        most_titles[w] = most_titles.get(w, 0) + 1
    titles_sorted = sorted(most_titles.items(), key=lambda x: -x[1])

    max_goals = max(cups, key=lambda x: x['total_goals'])
    max_goals_match = max(cups, key=lambda x: x.get('total_goals', 0) / max(x.get('total_matches', 1), 1))

    return {
        "data": {
            "most_titles": [{"country": k, "titles": v} for k, v in titles_sorted[:5]],
            "most_goals_edition": {"year": max_goals['year'], "goals": max_goals['total_goals'], "host": max_goals['host']},
            "top_scorer_all_time": {"name": "Miroslav Klose", "country": "Alemanha", "goals": 16},
            "most_participations": {"country": "Brasil / Alemanha / Itália", "count": 22}
        }
    }
