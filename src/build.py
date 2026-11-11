"""Build index.html for the IELTS Writing workbench.

Content lives in content_t1_*.py (Task 1 reports) and content_t2_*.py (Task 2 essays). Before anything is written the build checks:
  * ids are unique and every field the workbench needs is present;
  * every number in a Task 1 model answer exists in that task's own data (or is listed in `derived`);
  * cloze words, band 7 faults and decode spans really occur in the text they refer to;
  * the exercises have the right shape (3 key features, 2 good overview sentences, 1 correct thesis ...).
"""
import importlib, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
OUT = os.path.join(os.path.dirname(HERE), "index.html")
import content_global as G

T1_MODULES = ["content_t1_a", "content_t1_b", "content_t1_c", "content_t1_d", "content_t1_e"]
T2_MODULES = ["content_t2_a", "content_t2_b", "content_t2_c", "content_t2_d", "content_t2_e"]
problems = []


def load(mods, attr):
    out = []
    for m in mods:
        try:
            out += importlib.import_module(m).__dict__[attr]
        except ModuleNotFoundError as e:
            if e.name != m:
                raise
    return out


T1 = load(T1_MODULES, "TASKS")
T2 = load(T2_MODULES, "TASKS")
NUM = re.compile(r"(?<![\w.])\d[\d,]*(?:\.\d+)?")


def nums_in(text):
    out = set()
    for m in NUM.findall(str(text)):
        try:
            out.add(float(m.replace(",", "")))
        except ValueError:
            pass
    return out


def leaves(o):
    if isinstance(o, dict):
        for v in o.values():
            yield from leaves(v)
    elif isinstance(o, (list, tuple)):
        for v in o:
            yield from leaves(v)
    else:
        yield o


def words(s):
    return len(re.findall(r"[A-Za-z0-9'’%-]+", s))


def need(t, cond, msg):
    if not cond:
        problems.append(f"{t['id']}: {msg}")


def check_common(t):
    miss = [k for k in ("id", "task", "label", "short", "title", "prompt", "minutes", "vocab", "model", "band7", "notes") if k not in t]
    if miss:
        need(t, False, "missing " + ", ".join(miss))
        return False
    need(t, len(t["vocab"]) >= 8, "needs at least 8 vocabulary items")
    need(t, set(t["notes"]) == {"TA", "CC", "LR", "GRA"} or set(t["notes"]) == {"TR", "CC", "LR", "GRA"}, "notes need 4 criteria")
    b7 = t["band7"]
    need(t, 0 <= b7["para"] < len(t["model"]), "band7 para out of range")
    need(t, len(b7["faults"]) >= 4, "band7 needs at least 4 faults")
    for f in b7["faults"]:
        need(t, b7["text"].count(f[0]) == 1, f"band7 fault not found exactly once: {f[0]!r}")
    return True


def sentences(p):
    return re.split(r"(?<=[.!?])\s+(?=[A-Z])", p.strip())


# ---------------------------------------------------------------- Task 1
ids = set()
for t in T1:
    t["task"] = 1
    need(t, t["id"] not in ids, "duplicate id"); ids.add(t["id"])
    if not check_common(t):
        continue
    miss = [k for k in ("plan", "read", "overview", "group", "cloze") if k not in t]
    if miss or not any(k in t for k in ("visual", "visuals")):
        need(t, False, "missing " + ", ".join(miss + ([] if any(k in t for k in ("visual", "visuals")) else ["visual"])))
        continue
    need(t, 150 <= sum(words(p) for p in t["model"]) <= 225, f"model is {sum(words(p) for p in t['model'])} words (want 150-225)")
    need(t, len(t["model"]) in (3, 4), "model should have 3 or 4 paragraphs")
    need(t, len(t["read"]) == 7 and sum(1 for r in t["read"] if r[1] == "key") == 3, "read: 7 statements, exactly 3 key")
    need(t, all(r[1] in ("key", "detail", "false") for r in t["read"]), "read kinds")
    need(t, len(t["overview"]) == 6 and sum(1 for r in t["overview"] if r[1]) == 2, "overview: 6 sentences, exactly 2 good")
    g = t["group"]
    need(t, len(g["items"]) == 6 and all(0 <= i[1] < len(g["names"]) for i in g["items"]), "group: 6 items with valid group index")
    # numbers in the model must exist in the data
    allowed = set()
    for leaf in leaves([t.get("visual"), t.get("visuals")]):
        allowed |= nums_in(leaf)
    allowed |= {float(x) for x in t.get("derived", [])}
    vts = {v["type"] for v in (t.get("visuals") or [t["visual"]])}
    if vts <= {"map", "process"}:
        allowed |= {1.0, 2.0, 3.0, 4.0, 5.0}
    for n in sorted(nums_in(" ".join(t["model"]))):
        if n not in allowed:
            need(t, False, f"model mentions {n:g}, which is not in the data (add it to derived if it is a correct calculation)")
    # cloze
    c = t["cloze"]
    para = t["model"][c["para"]] if 0 <= c["para"] < len(t["model"]) else ""
    need(t, 0 <= c["para"] < len(t["model"]), "cloze para out of range")
    segs, pos = [], 0
    for w in c["words"]:
        m = re.compile(r"(?<![A-Za-z])" + re.escape(w) + r"(?![A-Za-z])").search(para, pos)
        if not m:
            need(t, False, f"cloze word {w!r} not found in order in paragraph {c['para']}")
            break
        segs.append(para[pos:m.start()]); pos = m.end()
    else:
        segs.append(para[pos:])
        c["segs"] = segs
    need(t, 8 <= len(c["words"]) <= 12, "cloze needs 8-12 gaps")
    need(t, 2 <= len(c.get("extra", [])) <= 5, "cloze needs 2-5 distractors")

# ---------------------------------------------------------------- Task 2
for t in T2:
    t["task"] = 2
    need(t, t["id"] not in ids, "duplicate id"); ids.add(t["id"])
    if not check_common(t):
        continue
    miss = [k for k in ("etype", "ideas", "decode", "plan", "upgrade", "order") if k not in t]
    if miss:
        need(t, False, "missing " + ", ".join(miss))
        continue
    need(t, t["etype"] in dict(G.ETYPES), "unknown essay type")
    need(t, 255 <= sum(words(p) for p in t["model"]) <= 345, f"model is {sum(words(p) for p in t['model'])} words (want 255-345)")
    need(t, len(t["model"]) == 4, "model needs 4 paragraphs")
    need(t, len(t["ideas"]) >= 6 and len(t["vocab"]) >= 10, "needs 6+ ideas and 10+ vocabulary items")
    # decode: tokens with span numbers
    d = t["decode"]
    spans = re.findall(r"\[\[(.+?)\]\]", d["q"])
    need(t, 3 <= len(spans) <= 5, "decode needs 3-5 [[spans]]")
    toks, k = [], -1
    pos = 0
    for m in re.finditer(r"\[\[(.+?)\]\]|(\S+)", d["q"]):
        if m.group(1):
            k += 1
            for w in m.group(1).split():
                toks.append([w, k])
        else:
            w = m.group(2)
            if w.startswith("[[") or w.endswith("]]"):
                continue
            toks.append([w, -1])
    d["toks"], d["n"] = toks, len(spans)
    p = t["plan"]
    need(t, len(p["thesis"]) == 3 and 0 <= p["ans"] < 3, "plan: 3 thesis options")
    need(t, len(p["pairs"]) == 3, "plan: 3 idea/example pairs")
    need(t, len(t["upgrade"]) == 3 and all(len(u[1]) == 3 and 0 <= u[2] < 3 for u in t["upgrade"]), "upgrade: 3 items with 3 options")
    o = t["order"]
    need(t, 0 <= o["para"] < 4, "order para")
    if 0 <= o["para"] < 4:
        o["sents"] = sentences(t["model"][o["para"]])
        need(t, 4 <= len(o["sents"]) <= 8, f"order paragraph has {len(o['sents'])} sentences (want 4-8)")
        need(t, not re.search(r"\b(e\.g|i\.e)\.", t["model"][o["para"]]), "order paragraph must not contain e.g./i.e.")

# ---------------------------------------------------------------- Brainstorm trainer
import content_bs_bank as BB
BS = load(["content_bs_a", "content_bs_b", "content_bs_c", "content_bs_d"], "QS")
lens_keys, topic_keys = [l[0] for l in BB.LENSES], [t[0] for t in BB.TOPICS]
t2_prompts = {re.sub(r"\W+", " ", re.sub(r"<[^>]+>", "", t["prompt"])).strip().lower() for t in T2}
need({"id": "brainstorm"}, len(BS) == 60, f"expected 60 brainstorm questions, found {len(BS)}")
need({"id": "brainstorm"}, [q["id"] for q in BS] == [f"b{i:02d}" for i in range(1, len(BS) + 1)], "brainstorm ids must run b01, b02, ... in order")
for k in topic_keys:
    need({"id": "brainstorm"}, sum(1 for q in BS if q["topic"] == k) == 5, f"topic {k} needs 5 questions")
for k, _ in G.ETYPES:
    need({"id": "brainstorm"}, sum(1 for q in BS if q["etype"] == k) == 10, f"essay type {k} needs 10 questions")
for q in BS:
    need(q, q["id"] not in ids, "duplicate id"); ids.add(q["id"])
    need(q, q["topic"] in topic_keys, "unknown topic")
    need(q, q["etype"] in dict(G.ETYPES), "unknown essay type")
    need(q, re.sub(r"\W+", " ", q["q"]).strip().lower() not in t2_prompts, "repeats a Task 2 essay question")
    need(q, len(q["wrong"]) == 2 and q["focus"] not in q["wrong"], "decode needs 1 focus and 2 different traps")
    need(q, len(q["ideas"]) >= 6, "needs at least 6 model ideas")
    need(q, all(i[0] in lens_keys and i[1] in ("a", "b") and len(i) == 3 for i in q["ideas"]), "idea needs a known lens and side a/b")
    need(q, {i[1] for i in q["ideas"]} == {"a", "b"}, "ideas must cover both sides")
    need(q, len({i[0] for i in q["ideas"]}) >= 4, "ideas must use at least 4 lenses")
    need(q, all(re.search(r"[.!?]$", x.strip()) and x.strip()[0].isupper() for c in q["chains"] for x in c), "chain parts must be full sentences (capital letter, final full stop)")
    need(q, len(q["chains"]) == 2 and all(len(c) == 4 and all(len(x.split()) >= (3 if j == 0 else 4) for j, x in enumerate(c)) for c in q["chains"]), "needs 2 chains of idea, why, so what, example")
for k in topic_keys:
    need({"id": "bank"}, len(BB.BANK.get(k, [])) >= 6 and all(r[2] in lens_keys for r in BB.BANK[k]), f"idea bank for {k} needs 6 rows with known lenses")

if problems:
    print("PROBLEMS:")
    for q in problems:
        print("  -", q)
    sys.exit(1)

for t in T1 + T2:
    t.pop("derived", None)
    if t["task"] == 1:
        t["cloze"].setdefault("extra", [])

DATA = dict(T1=T1, T2=T2, BS=BS, BB=dict(lenses=BB.LENSES, topics=BB.TOPICS, sides=BB.SIDES, bank=BB.BANK, example=BB.EXAMPLE), G=dict(
    etypes=G.ETYPES, crit1=[[a, b, {str(k): v for k, v in c.items()}] for a, b, c in G.CRIT_T1],
    crit2=[[a, b, {str(k): v for k, v in c.items()}] for a, b, c in G.CRIT_T2],
    charts=G.CHARTS_TOOLKIT, plan=G.T1_PLAN, skeleton=G.T2_SKELETON, linkers=G.LINKERS, hedging=G.HEDGING, mistakes=G.MISTAKES))
data = json.dumps(DATA, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
css = open(os.path.join(HERE, "style.css"), encoding="utf-8").read()
js = open(os.path.join(HERE, "app.js"), encoding="utf-8").read()
page = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        f'<meta name="description" content="IELTS Writing workbench: {len(T1)} Task 1 reports and {len(T2)} Task 2 essays, each with its own data, step-by-step exercises and a band 9 model answer.">\n'
        '<title>IELTS Writing Workbench</title>\n<style>\n' + css + '</style>\n</head>\n<body>\n'
        '<div class="topbar"><button type="button" class="menu" id="menubtn" aria-label="Tasks">☰ Tasks</button><a class="brand" href="#home">IELTS Writing Workbench</a><span class="sp"></span>'
        '<span class="prog"><span id="progtxt"></span><span class="pbar"><i id="progfill" style="width:0"></i></span></span></div>\n'
        '<div class="layout"><nav class="rail" id="rail" aria-label="Tasks"></nav><main id="work" tabindex="-1"></main></div>\n'
        '<script>window.W=' + data + ';</script>\n<script>\n' + js + '\n</script>\n</body>\n</html>\n')
open(OUT, "w", encoding="utf-8").write(page)
print(f"OK  {len(T1)} Task 1 reports, {len(T2)} Task 2 essays, {len(BS)} brainstorm questions · page written: {len(page) // 1024} KB")
