import json
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
levels = json.loads((ROOT / "data" / "levels.json").read_text())
out = ROOT / "tools" / "previews"
out.mkdir(parents=True, exist_ok=True)

DIRS = {"U": (0, -1), "D": (0, 1), "L": (-1, 0), "R": (1, 0)}

def render(level, path, size=900):
    w, h = level["w"], level["h"]
    img = Image.new("RGB", (size, size), (26, 23, 72))
    d = ImageDraw.Draw(img)
    margin = 70
    cell = min((size - margin * 2) / (w + 1.4), (size - margin * 2) / (h + 1.4))
    ox = (size - (w - 1) * cell) / 2
    oy = (size - (h - 1) * cell) / 2
    for y in range(h):
        for x in range(w):
            cx, cy = ox + x * cell, oy + y * cell
            r = max(2, cell * 0.055)
            d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(150, 146, 196))
    stroke = max(6, cell * 0.30)
    for a in level["arrows"]:
        pts = [(ox + c[0] * cell, oy + c[1] * cell) for c in a["cells"]]
        dx, dy = DIRS[a["dir"]]
        head = pts[-1]
        base = (head[0] + dx * cell * 0.06, head[1] + dy * cell * 0.06)
        tip = (base[0] + dx * cell * 0.50, base[1] + dy * cell * 0.50)
        body = pts[:-1] + [base] if len(pts) > 1 else [(head[0] - dx * cell * 0.36, head[1] - dy * cell * 0.36), base]
        d.line(body, fill=(62, 214, 236), width=int(stroke), joint="curve")
        hw = stroke * 0.72
        px, py = -dy, dx
        d.polygon([tip, (base[0] + px * hw, base[1] + py * hw), (base[0] - px * hw, base[1] - py * hw)], fill=(62, 214, 236))
    img.save(path, quality=90)

want = [1, 2, 3, 8, 24, 50, 90, 160]
for n in want:
    render(levels[n - 1], out / f"L{n}.jpg")
    print("wrote", n, levels[n - 1]["w"], levels[n - 1]["h"], "arrows", len(levels[n - 1]["arrows"]))
