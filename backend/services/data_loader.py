import json
import os

store = {}

def load_all():
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    files = ['history', 'teams_2026', 'stadiums_2026', 'calendar_2026', 'bracket_2026']
    for name in files:
        path = os.path.join(data_dir, f'{name}.json')
        with open(path, 'r', encoding='utf-8') as f:
            store[name] = json.load(f)

    _enrich_matches()
    _build_groups()

def _enrich_matches():
    stadiums = {s['id']: s for s in store.get('stadiums_2026', [])}
    for m in store['calendar_2026']:
        s = stadiums.get(m['stadium'], {})
        m['stadium_name'] = s.get('name', m['stadium'])
        m['stadium_city'] = s.get('city', '')
        m['stadium_country'] = s.get('country', '')

def _build_groups():
    teams = {t['id']: t for t in store['teams_2026']}
    matches = store['calendar_2026']
    group_ids = sorted(set(m['group'] for m in matches))

    groups = {}
    for gid in group_ids:
        group_teams = [t for t in store['teams_2026'] if t['group'] == gid]
        group_matches = [m for m in matches if m['group'] == gid]
        standings = _compute_standings(group_teams, group_matches)
        groups[gid] = {
            'id': gid,
            'teams': group_teams,
            'matches': group_matches,
            'standings': standings
        }
    store['groups'] = groups

def _compute_standings(teams, matches):
    stats = {t['id']: {'id': t['id'], 'name': t['name'], 'flag_code': t['flag_code'],
                        'flag_emoji': t['flag_emoji'], 'j': 0, 'v': 0, 'e': 0, 'd': 0,
                        'gp': 0, 'gc': 0, 'pts': 0} for t in teams}
    for m in matches:
        if m['home_score'] is None:
            continue
        h, a = m['home'], m['away']
        hs, as_ = m['home_score'], m['away_score']
        if h not in stats or a not in stats:
            continue
        stats[h]['j'] += 1; stats[a]['j'] += 1
        stats[h]['gp'] += hs; stats[h]['gc'] += as_
        stats[a]['gp'] += as_; stats[a]['gc'] += hs
        if hs > as_:
            stats[h]['v'] += 1; stats[h]['pts'] += 3; stats[a]['d'] += 1
        elif hs < as_:
            stats[a]['v'] += 1; stats[a]['pts'] += 3; stats[h]['d'] += 1
        else:
            stats[h]['e'] += 1; stats[h]['pts'] += 1
            stats[a]['e'] += 1; stats[a]['pts'] += 1

    result = list(stats.values())
    for r in result:
        r['sg'] = r['gp'] - r['gc']
    result.sort(key=lambda x: (-x['pts'], -x['sg'], -x['gp']))
    for i, r in enumerate(result):
        r['position'] = i + 1
        r['status'] = 'classificado' if i < 2 else ('repescagem' if i == 2 else 'eliminado')
    return result
