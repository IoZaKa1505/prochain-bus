#!/usr/bin/env python3
"""Construit data.json (horaires TEC Hainaut compactés) à partir du GTFS TEC décompressé.

Usage : python3 build_data.py <dossier_gtfs> <fichier_sortie.json> [prefixe=H]
"""
import sys, json, re, datetime as dt
from collections import Counter, defaultdict
import pandas as pd

src, out = sys.argv[1], sys.argv[2]
PREFIX = sys.argv[3] if len(sys.argv) > 3 else "H"

rd = lambda f, cols=None: pd.read_csv(f"{src}/{f}", dtype=str, usecols=cols, keep_default_na=False)

# ---------- lignes ----------
routes = rd("routes.txt")
routes = routes[routes.route_id.str.startswith(f"gr:tec:{PREFIX}")].copy()

# ---------- courses ----------
trips = rd("trips.txt", ["route_id", "service_id", "trip_id", "trip_headsign", "direction_id"])
trips = trips[trips.route_id.isin(set(routes.route_id))].copy()
trip_ids = set(trips.trip_id)

# ---------- horaires de passage ----------
parts = []
for ch in pd.read_csv(f"{src}/stop_times.txt", dtype=str, keep_default_na=False,
                      usecols=["trip_id", "stop_id", "departure_time", "arrival_time", "stop_sequence", "pickup_type", "drop_off_type"],
                      chunksize=1_000_000):
    parts.append(ch[ch.trip_id.isin(trip_ids)])
st = pd.concat(parts)
st["seq"] = st.stop_sequence.astype(int)
t = st.departure_time.where(st.departure_time != "", st.arrival_time)
st["m"] = t.str.split(":").str[0].astype(int) * 60 + t.str.split(":").str[1].astype(int)
st["pick"] = (st.pickup_type != "1").astype(int)
st = st.sort_values(["trip_id", "seq"])

# ---------- calendrier ----------
cal = rd("calendar.txt")
cd = rd("calendar_dates.txt")
svc_ids = sorted(set(trips.service_id))
cal = cal[cal.service_id.isin(svc_ids)]
cd = cd[cd.service_id.isin(svc_ids)]
pdate = lambda s: dt.date(int(s[:4]), int(s[4:6]), int(s[6:8]))
dates = [pdate(x) for x in list(cal.start_date) + list(cal.end_date) + list(cd.date)]
d0, d1 = min(dates), max(dates)
ndays = (d1 - d0).days + 1
WD = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
active = {s: [0] * ndays for s in svc_ids}
for _, c in cal.iterrows():
    a, b = pdate(c.start_date), pdate(c.end_date)
    for i in range((a - d0).days, (b - d0).days + 1):
        if c[WD[(d0 + dt.timedelta(i)).weekday()]] == "1":
            active[c.service_id][i] = 1
for _, c in cd.iterrows():
    active[c.service_id][(pdate(c.date) - d0).days] = 1 if c.exception_type == "1" else 0
# services identiques fusionnés
svc_str, svc_index = [], {}
svc_of = {}
for s in svc_ids:
    k = "".join(map(str, active[s]))
    if k not in svc_index:
        svc_index[k] = len(svc_str); svc_str.append(k)
    svc_of[s] = svc_index[k]

# ---------- arrêts (regroupés par station parente) ----------
stops = rd("stops.txt")
used = set(st.stop_id)
stops = stops[stops.stop_id.isin(used)].copy()
quai_re = re.compile(r"\s+-\s+Quai\s+(\S+)\s*$", re.I)
def base_name(n):
    n = quai_re.sub("", n).strip()
    return re.sub(r"\s+[–-]\s*$", "", n).strip()
stops["base"] = stops.stop_name.map(base_name)
stops["quai"] = [ (m.group(1) if (m := quai_re.search(n)) else (p or "")) for n, p in zip(stops.stop_name, stops.platform_code)]
stops["grp"] = [p if p else s for p, s in zip(stops.parent_station, stops.stop_id)]
stops["lat"] = stops.stop_lat.astype(float); stops["lon"] = stops.stop_lon.astype(float)

groups = []
for g, df in stops.groupby("grp"):
    name = Counter(df.base).most_common(1)[0][0]
    descs = [d for d in Counter(df.stop_desc).most_common() if d[0]]
    groups.append((name, descs[0][0] if descs else "", df.lat.mean(), df.lon.mean(), g))
groups.sort(key=lambda x: (x[0], x[1]))
gidx = {g[4]: i for i, g in enumerate(groups)}
stops = stops.sort_values(["grp", "quai", "stop_id"])
stop_list = list(stops.stop_id)
sidx = {s: i for i, s in enumerate(stop_list)}

# ---------- noms lisibles : "SAINT-GHISLAIN Place" -> ("Saint-Ghislain", "Place") ----------
ACC = {"LOUVIERE": "Louvière", "QUIEVRAIN": "Quiévrain", "QUIEVRECHAIN": "Quiévrechain", "CHIEVRES": "Chièvres",
       "PERUWELZ": "Péruwelz", "WASMUEL": "Wasmuël", "ECAUSSINNES": "Écaussinnes", "STREPY": "Strépy",
       "PATURAGES": "Pâturages", "FLENU": "Flénu", "ROEULX": "Rœulx", "CHATEAU": "Château", "WIHERIES": "Wihéries",
       "MAISIERES": "Maisières", "BELOEIL": "Belœil", "GOEGNIES": "Gœgnies", "ERBISOEUL": "Erbisœul",
       "PERONNES": "Péronnes", "EPINOIS": "Épinois", "CARNIERES": "Carnières", "EVEQUE": "Évêque",
       "POMMEROEUL": "Pommerœul", "BASECLES": "Basècles", "MEVERGNIES": "Mévergnies", "MONTROEUL": "Montrœul",
       "NECHIN": "Néchin", "ANSEROEUL": "Anserœul", "BLEHARIES": "Bléharies", "HENNUYERES": "Hennuyères",
       "RONQUIERES": "Ronquières", "TRIVIERES": "Trivières", "PIETON": "Piéton", "QUEVY": "Quévy",
       "BRUYERE": "Bruyère", "REMY": "Rémy", "CHAUSSEE": "Chaussée"}
PARTICLES = {"LEZ", "SUR", "SOUS", "LE", "LA", "LES", "DE", "DU", "DES", "AU", "AUX", "EN", "ET", "A"}
ACC["ARMENTIERES"] = "Armentières"
UPTOK = re.compile(r"^[A-ZÀ-ÖØ-Þ0-9'’/.()\-]*[A-ZÀ-ÖØ-Þ][A-ZÀ-ÖØ-Þ0-9'’/.()\-]*$")

def tc_piece(w, first):
    m = re.match(r"^([DL])['’](.+)$", w)
    if m:
        return (m.group(1) if first else m.group(1).lower()) + "'" + tc_piece(m.group(2), True)
    if not first and w in PARTICLES:
        return "à" if w == "A" else w.lower()
    return ACC.get(w, w.capitalize())

def title_town(town):
    words = []
    for wi, word in enumerate(town.split()):
        slash = []
        for chain in word.split("/"):
            pieces = chain.split("-")
            slash.append("-".join(tc_piece(p, i == 0 and (wi == 0 or p not in PARTICLES)) for i, p in enumerate(pieces)))
        words.append("/".join(slash))
    return " ".join(words)

STOPTOK = re.compile(r"^(SNCB|STATION|TEC|GARE)\b")

def up_run(name):
    toks = name.split()
    run = []
    for tk in toks:
        if UPTOK.match(tk) and not STOPTOK.match(tk): run.append(tk)
        else: break
    return toks, run

def clean(n):
    n = re.sub(r"\s+[–-]\s*$", "", n).strip()
    n = re.sub(r"(?<=[A-ZÀ-Þ]{3})(?=[A-ZÀ-Þ][a-zà-ÿ])", " ", n)      # "MARIECafé" -> "MARIE Café"
    n = re.sub(r"(?<=\S)\(-?", " (", n)                                # "CELLES(LEZ" -> "CELLES (LEZ"
    return re.sub(r"\s+", " ", n)

all_names = set(clean(x) for x in stops.base) | set(clean(h) for h in trips.trip_headsign)
pref_freq = Counter()
for n in all_names:
    _, run = up_run(n)
    for k in range(1, len(run) + 1):
        pref_freq[" ".join(run[:k])] += 1

def split_name(n):
    n = clean(n)
    toks, run = up_run(n)
    if not run:
        return "", n
    k = len(run)
    while k > 1 and pref_freq[" ".join(run[:k])] < 3:
        k -= 1
    if pref_freq[" ".join(run[:k])] < 3:
        k = len(run)
    town = " ".join(toks[:k]); place = " ".join(toks[k:])
    return title_town(town), place

# ---------- lignes : ordre naturel ----------
def rkey(n):
    m = re.match(r"(\d+)(.*)", n)
    return (0, int(m.group(1)), m.group(2)) if m else (1, 0, n)
routes = routes.sort_values("route_short_name", key=lambda s: s.map(rkey))
route_list = list(routes.route_id)
ridx = {r: i for i, r in enumerate(route_list)}

# ---------- motifs (suite d'arrêts + montée autorisée) et profils de temps ----------
fmt_heads = sorted(set(split_name(h) for h in set(trips.trip_headsign)))
fidx = {h: i for i, h in enumerate(fmt_heads)}
hidx = {h: fidx[split_name(h)] for h in set(trips.trip_headsign)}
tinfo = trips.set_index("trip_id")
pat_index, pats = {}, []
prof_index, profs = {}, []
rows = []
for tid, df in st.groupby("trip_id", sort=False):
    s = tuple(sidx[x] for x in df.stop_id)
    pk = tuple(df.pick)
    key = (s, pk)
    if key not in pat_index:
        pat_index[key] = len(pats); pats.append(key)
    m = list(df.m)
    deltas = tuple(b - a for a, b in zip(m, m[1:]))
    if deltas not in prof_index:
        prof_index[deltas] = len(profs); profs.append(deltas)
    ti = tinfo.loc[tid]
    rows.append((ridx[ti.route_id], int(ti.direction_id or 0), hidx[ti.trip_headsign], svc_of[ti.service_id],
                 pat_index[key], prof_index[deltas], m[0]))
# tri : par motif puis heure de départ (accélère les recherches côté app)
rows.sort(key=lambda r: (r[4], r[6]))

def pick_mask(pk):
    # indices des arrêts SANS montée (rare) -> liste courte
    return [i for i, v in enumerate(pk) if v == 0]

# ---------- couleurs automatiques des lignes (pas les couleurs officielles TEC) ----------
# [fond, texte] — contrastes vérifiés pour des chiffres en gras
PALETTE = [["#FFCD00", "#000000"], ["#0067C6", "#FFFFFF"], ["#E2001A", "#FFFFFF"], ["#00964B", "#FFFFFF"],
           ["#F07D00", "#000000"], ["#7B2C8F", "#FFFFFF"], ["#00A0C6", "#000000"], ["#E6007E", "#FFFFFF"],
           ["#8DC63F", "#000000"], ["#8B5A2B", "#FFFFFF"], ["#1D3A8A", "#FFFFFF"], ["#F4A6C6", "#000000"],
           ["#007C73", "#FFFFFF"], ["#A3D8F4", "#000000"], ["#6D6E71", "#FFFFFF"]]
route_groups = defaultdict(set)
for r in rows:
    for s in pats[r[4]][0]:
        route_groups[r[0]].add(gidx[stops.grp.iloc[s]])
short = [rr.route_short_name for rr in routes.itertuples()]
base = [re.match(r"\d*", n).group(0) or n for n in short]
# familles : même numéro de base (11, 11/, 14B…) et au moins un arrêt en commun
fam = list(range(len(short)))
def find(x):
    while fam[x] != x:
        fam[x] = fam[fam[x]]; x = fam[x]
    return x
for a in range(len(short)):
    for b in range(a + 1, len(short)):
        if base[a] == base[b] and route_groups[a] & route_groups[b]:
            fam[find(a)] = find(b)
fam_groups = defaultdict(set)
for r in range(len(short)): fam_groups[find(r)] |= route_groups[r]
fams = sorted(fam_groups, key=lambda f: -len(fam_groups[f]))
# coloration : les familles qui partagent des arrêts évitent la même couleur
weight = {f: Counter() for f in fams}
for i, a in enumerate(fams):
    for b in fams[i + 1:]:
        w = len(fam_groups[a] & fam_groups[b])
        if w: weight[a][b] = w; weight[b][a] = w
fam_col = {}
order = sorted(fams, key=lambda f: -sum(weight[f].values()))
for n, f in enumerate(order):
    cost = [0] * len(PALETTE)
    for g, w in weight[f].items():
        if g in fam_col: cost[fam_col[g]] += w
    # couleur préférée : suit le numéro (1 jaune, 2 bleu, 3 rouge…) quand ça ne crée pas de confusion
    start = (int(base[f]) - 1) % len(PALETTE) if base[f].isdigit() and int(base[f]) > 0 else n % len(PALETTE)
    fam_col[f] = min(range(len(PALETTE)), key=lambda c: (cost[c], (c - start) % len(PALETTE)))
route_col = [fam_col[find(r)] for r in range(len(short))]

data = {
    "v": 1,
    "feed": {"start": d0.isoformat(), "days": ndays, "end": d1.isoformat(),
             "version": rd("feed_info.txt").feed_version.iloc[0].strip(), "built": dt.date.today().isoformat()},
    "svc": svc_str,
    "routes": [[r.route_short_name, r.route_long_name] for r in routes.itertuples()],
    "pal": PALETTE,
    "rcol": route_col,
    "heads": [list(h) for h in fmt_heads],
    # groupe d'arrêts : [commune, lieu, rue, lat, lon]
    "groups": [[*split_name(g[0]), g[1], round(g[2], 5), round(g[3], 5)] for g in groups],
    # identifiants GTFS stables des groupes (pour garder les favoris après une mise à jour)
    "gid": [g[4] for g in groups],
    # arrêt physique : [groupe, quai, lat, lon]
    "stops": [[gidx[r.grp], r.quai, round(r.lat, 5), round(r.lon, 5)] for r in stops.itertuples()],
    "pats": [[list(s), pick_mask(pk)] for s, pk in pats],
    "profs": [list(p) for p in profs],
    # colonnes des courses
    "trips": {k: [r[i] for r in rows] for i, k in enumerate(["r", "d", "h", "s", "p", "f", "t"])},
}
with open(out, "w", encoding="utf-8") as fh:
    json.dump(data, fh, ensure_ascii=False, separators=(",", ":"))
print(f"lignes={len(route_list)} arrets={len(stop_list)} groupes={len(groups)} courses={len(rows)} "
      f"motifs={len(pats)} profils={len(profs)} services={len(svc_str)} jours={ndays} ({d0}→{d1})")
