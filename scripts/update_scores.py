#!/usr/bin/env python3
"""
Busca resultados da Copa 2026 na API football-data.org e atualiza calendar_2026.json.
Executado diariamente às 08h BRT via GitHub Actions.

Requer a variável de ambiente: FOOTBALL_API_KEY
Cadastro gratuito em: https://www.football-data.org/client/register
"""

import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path

API_KEY = os.environ.get("FOOTBALL_API_KEY", "")
BASE_URL = "https://api.football-data.org/v4"
DATA_DIR = Path(__file__).parent.parent / "backend" / "data"

# Nomes de times na API football-data.org → IDs do projeto
TEAM_MAP = {
    "Mexico": "mexico",
    "México": "mexico",
    "South Africa": "africa-do-sul",
    "Korea Republic": "coreia-do-sul",
    "Czech Republic": "republica-tcheca",
    "Czechia": "republica-tcheca",
    "Canada": "canada",
    "Bosnia and Herzegovina": "bosnia-herzegovina",
    "Qatar": "qatar",
    "Switzerland": "suica",
    "Brazil": "brasil",
    "Morocco": "marrocos",
    "Haiti": "haiti",
    "Scotland": "escocia",
    "USA": "eua",
    "United States": "eua",
    "Paraguay": "paraguai",
    "Australia": "australia",
    "Turkey": "turquia",
    "Türkiye": "turquia",
    "Germany": "alemanha",
    "Curaçao": "curacao",
    "Curacao": "curacao",
    "Côte d'Ivoire": "costa-do-marfim",
    "Ivory Coast": "costa-do-marfim",
    "Ecuador": "equador",
    "Netherlands": "paises-baixos",
    "Japan": "japao",
    "Sweden": "suecia",
    "Tunisia": "tunisia",
    "Belgium": "belgica",
    "Egypt": "egito",
    "Iran": "ira",
    "New Zealand": "nova-zelandia",
    "Spain": "espanha",
    "Cape Verde": "cabo-verde",
    "Saudi Arabia": "arabia-saudita",
    "Uruguay": "uruguai",
    "France": "franca",
    "Senegal": "senegal",
    "Iraq": "iraque",
    "Norway": "noruega",
    "Argentina": "argentina",
    "Algeria": "argelia",
    "Austria": "austria",
    "Jordan": "jordania",
    "Portugal": "portugal",
    "DR Congo": "rd-congo",
    "Congo DR": "rd-congo",
    "Democratic Republic of Congo": "rd-congo",
    "Uzbekistan": "uzbequistao",
    "Colombia": "colombia",
    "England": "england",
    "Croatia": "croacia",
    "Ghana": "gana",
    "Panama": "panama",
}

FINISHED_STATUSES = {"FINISHED", "IN_PLAY", "PAUSED"}


def fetch_matches() -> list:
    url = f"{BASE_URL}/competitions/WC/matches"
    req = urllib.request.Request(url, headers={"X-Auth-Token": API_KEY})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
            return data.get("matches", [])
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")
        print(f"Erro HTTP {e.code}: {e.reason} — {body}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Erro na requisição: {e}", file=sys.stderr)
        sys.exit(1)


def update_calendar(api_matches: list) -> int:
    path = DATA_DIR / "calendar_2026.json"
    with open(path, encoding="utf-8") as f:
        calendar = json.load(f)

    cal_index = {(m["home"], m["away"]): m for m in calendar}
    unmapped = set()
    updated = 0

    for am in api_matches:
        if am.get("status") not in FINISHED_STATUSES:
            continue

        home_name = am.get("homeTeam", {}).get("name", "")
        away_name = am.get("awayTeam", {}).get("name", "")
        home_id = TEAM_MAP.get(home_name)
        away_id = TEAM_MAP.get(away_name)

        if not home_id:
            unmapped.add(home_name)
        if not away_id:
            unmapped.add(away_name)
        if not home_id or not away_id:
            continue

        match = cal_index.get((home_id, away_id))
        if not match:
            continue

        score = am.get("score", {}).get("fullTime", {})
        hs = score.get("home")
        as_ = score.get("away")
        if hs is None or as_ is None:
            continue

        if match["home_score"] != hs or match["away_score"] != as_:
            match["home_score"] = hs
            match["away_score"] = as_
            updated += 1
            print(f"  {home_id} {hs}x{as_} {away_id}")

    if unmapped:
        print(f"  Times sem mapeamento: {', '.join(sorted(unmapped))}", file=sys.stderr)

    with open(path, "w", encoding="utf-8") as f:
        json.dump(calendar, f, ensure_ascii=False, indent=2)

    return updated


def main():
    if not API_KEY:
        print("Erro: variável FOOTBALL_API_KEY não definida.", file=sys.stderr)
        sys.exit(1)

    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    print(f"[{ts}] Buscando resultados Copa 2026...")

    matches = fetch_matches()
    print(f"  {len(matches)} partidas recebidas da API")

    updated = update_calendar(matches)
    print(f"  {updated} placar(es) atualizado(s) em calendar_2026.json")

    if updated == 0:
        print("  Nenhuma alteração — arquivo não modificado.")


if __name__ == "__main__":
    main()
