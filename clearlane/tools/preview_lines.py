"""Phone mock of thin lines leaving a picture. Not shipped art."""
import json
import sys
from PIL import Image, ImageDraw

levels = json.load(open(sys.argv[1]))
out_dir = sys.argv[2]
ids = [int(x) for x in sys.argv[3].split(",")]

DIRS = {
    "U": (0, -1),
    "D": (0, 1),
    "L": (-1, 0),
    "R": (1, 0),
}
INK = (27, 36, 64)
HEART = (238, 94, 104)


def draw_level(level, path):
    W, H = 420, 760
    im = Image.new("RGB", (W, H), (255, 255, 255))
    d = ImageDraw.Draw(im)
    # three small hearts
    for i, cx in enumerate((186, 210, 234)):
        d.ellipse((cx - 7, 36, cx + 7, 48), fill=HEART)
        d.polygon([(cx - 8, 42), (cx, 28), (cx + 8, 42)], fill=HEART)
    d.line((36, 68, 384, 68), fill=(230, 232, 238), width=2)

    w, h = level["w"], level["h"]
    margin = 28
    top, bot = 88, 700
    cell = min((W - margin * 2) / (w + 1.2), (bot - top) / (h + 1.2))
    board_w = (w - 1) * cell
    board_h = (h - 1) * cell
    ox = (W - board_w) / 2
    oy = top + ((bot - top) - board_h) / 2
    stroke = max(1.75, cell * 0.27)

    def pt(c, off=0, direc=(0, 0)):
        return (
            ox + c[0] * cell + direc[0] * off,
            oy + c[1] * cell + direc[1] * off,
        )

    for arrow in level["arrows"]:
        direc = DIRS[arrow["dir"]]
        pts = [pt(c) for c in arrow["cells"]]
        if len(pts) == 1:
            pts = [
                (pts[0][0] - direc[0] * cell * 0.42, pts[0][1] - direc[1] * cell * 0.42),
                pts[0],
            ]
        d.line(pts, fill=INK, width=int(round(stroke)), joint="curve")
        head = pts[-1]
        tip_len = max(stroke * 1.7, cell * 0.2)
        hw = stroke * 0.72
        tip = (head[0] + direc[0] * tip_len, head[1] + direc[1] * tip_len)
        bx = head[0] - direc[0] * stroke * 0.15
        by = head[1] - direc[1] * stroke * 0.15
        px, py = -direc[1], direc[0]
        d.polygon(
            [
                tip,
                (bx + px * hw, by + py * hw),
                (bx - px * hw, by - py * hw),
            ],
            fill=INK,
        )
    im.save(path, quality=92)
    print(path, level.get("shape"), level["w"], level["h"], len(level["arrows"]))


for lv in ids:
    level = levels[lv - 1]
    draw_level(level, f"{out_dir}/shape-{lv}-{level.get('shape','x')}.jpg")
