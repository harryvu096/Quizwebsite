import math
from PIL import Image, ImageDraw, ImageFont

W, H = 471, 1021
BG_TOP = (44, 49, 96)
BG_BOT = (34, 38, 73)
CYAN = (92, 210, 230)
DOT = (78, 86, 158)
HEART = (238, 94, 104)
WHITE = (255, 255, 255)

font_big = ImageFont.truetype("/tmp/nunito-800.ttf", 46)
font_md = ImageFont.truetype("/tmp/nunito-800.ttf", 22)
font_sm = ImageFont.truetype("/tmp/nunito-700.ttf", 16)
font_num = ImageFont.truetype("/tmp/nunito-800.ttf", 18)


def bg():
    img = Image.new("RGB", (W, H), BG_BOT)
    px = img.load()
    for y in range(H):
        t = y / (H - 1)
        c = tuple(int(BG_TOP[i] * (1 - t) + BG_BOT[i] * t) for i in range(3))
        for x in range(W):
            px[x, y] = c
    return img


def draw_arrow(d, cells, ox, oy, cell, stroke, color, direction):
    dx, dy = direction
    pts = [(ox + c[0] * cell, oy + c[1] * cell) for c in cells]
    if len(pts) == 1:
        pts = [(pts[0][0] - dx * cell * 0.38, pts[0][1] - dy * cell * 0.38), pts[0]]
    r = stroke / 2.0

    def unit(a, b):
        L = math.hypot(b[0] - a[0], b[1] - a[1]) or 1
        return (b[0] - a[0]) / L, (b[1] - a[1]) / L

    def seg_poly(a, b):
        ux, uy = unit(a, b)
        nx, ny = -uy * r, ux * r
        return [(a[0] + nx, a[1] + ny), (b[0] + nx, b[1] + ny), (b[0] - nx, b[1] - ny), (a[0] - nx, a[1] - ny)]

    for i in range(len(pts) - 1):
        d.polygon(seg_poly(pts[i], pts[i + 1]), fill=color)
    for i in range(1, len(pts) - 1):
        ux, uy = unit(pts[i - 1], pts[i])
        vx, vy = unit(pts[i], pts[i + 1])
        n1 = (-uy, ux)
        n2 = (-vy, vx)
        cross = ux * vy - uy * vx
        if abs(cross) < 0.01:
            continue
        if cross > 0:
            a0 = math.atan2(n1[1], n1[0])
            a1 = math.atan2(n2[1], n2[0])
        else:
            a0 = math.atan2(-n1[1], -n1[0])
            a1 = math.atan2(-n2[1], -n2[0])
        sweep = a1 - a0
        while sweep <= -math.pi:
            sweep += 2 * math.pi
        while sweep > math.pi:
            sweep -= 2 * math.pi
        arc = []
        for s in range(9):
            a = a0 + sweep * s / 8
            arc.append((pts[i][0] + math.cos(a) * r, pts[i][1] + math.sin(a) * r))
        d.polygon([pts[i]] + arc, fill=color)
    tail = pts[0]
    d.ellipse((tail[0] - r, tail[1] - r, tail[0] + r, tail[1] + r), fill=color)
    head = pts[-1]
    tip_len = stroke * 1.42
    hw = stroke * 0.78
    tip = (head[0] + dx * tip_len, head[1] + dy * tip_len)
    bx = head[0] - dx * 1.8
    by = head[1] - dy * 1.8
    px, py = -dy, dx
    d.polygon([tip, (bx + px * hw, by + py * hw), (bx - px * hw, by - py * hw)], fill=color)


def heart(d, cx, cy, s):
    r = s * 0.28
    d.ellipse((cx - s * 0.46, cy - s * 0.22, cx - s * 0.46 + r * 2.1, cy - s * 0.22 + r * 2.1), fill=HEART)
    d.ellipse((cx - s * 0.02, cy - s * 0.22, cx - s * 0.02 + r * 2.1, cy - s * 0.22 + r * 2.1), fill=HEART)
    d.polygon([
        (cx - s * 0.42, cy + s * 0.02),
        (cx + s * 0.42, cy + s * 0.02),
        (cx, cy + s * 0.52),
    ], fill=HEART)


def phone(level, path, title="Clear\nthe Board"):
    img = bg()
    d = ImageDraw.Draw(img)
    y = 72
    for line in title.split("\n"):
        box = d.textbbox((0, 0), line, font=font_big)
        tw = box[2] - box[0]
        d.text(((W - tw) / 2, y), line, font=font_big, fill=WHITE)
        y += 50
    ly = y + 16
    d.line((26, ly + 14, 16, ly + 6, 26, ly - 2), fill=WHITE, width=3)
    label = "Level %d" % level["lv"]
    box = d.textbbox((0, 0), label, font=font_md)
    d.text(((W - (box[2] - box[0])) / 2, ly), label, font=font_md, fill=WHITE)
    gx, gy = W - 36, ly + 8
    d.ellipse((gx - 5, gy - 5, gx + 5, gy + 5), outline=WHITE, width=2)
    for i in range(6):
        a = i * math.pi / 3
        d.line((gx + math.cos(a) * 7, gy + math.sin(a) * 7, gx + math.cos(a) * 11, gy + math.sin(a) * 11), fill=WHITE, width=2)
    hy = ly + 48
    d.rounded_rectangle((22, hy, 112, hy + 38), radius=13, fill=(24, 27, 58))
    d.polygon([(36, hy + 19), (48, hy + 13), (48, hy + 25)], fill=CYAN)
    d.text((56, hy + 7), str(len(level["arrows"])), font=font_num, fill=WHITE)
    for i in range(3):
        heart(d, W / 2 - 34 + i * 34, hy + 8, 28)
    d.rounded_rectangle((W - 118, hy, W - 22, hy + 38), radius=13, fill=(24, 27, 58))
    d.text((W - 106, hy + 7), "Normal", font=font_num, fill=WHITE)

    top = hy + 58
    bot = H - 148
    w, h = level["w"], level["h"]
    cell = min((W - 56) / (w + 1.1), (bot - top) / (h + 1.1))
    stroke = max(11, int(round(cell * 0.30)))
    board_w = (w - 1) * cell
    board_h = (h - 1) * cell
    ox = (W - board_w) / 2
    oy = top + ((bot - top) - board_h) / 2
    dot_r = max(2.4, cell * 0.05)
    for yy in range(h):
        for xx in range(w):
            cx, cy = ox + xx * cell, oy + yy * cell
            d.ellipse((cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r), fill=DOT)
    DIRS = {"U": (0, -1), "D": (0, 1), "L": (-1, 0), "R": (1, 0)}
    for a in level["arrows"]:
        draw_arrow(d, a["cells"], ox, oy, cell, stroke, CYAN, DIRS[a["dir"]])

    def button(cx, cy):
        rad = 36
        d.ellipse((cx - rad, cy - rad + 5, cx + rad, cy + rad + 7), fill=(26, 78, 160))
        d.ellipse((cx - rad, cy - rad, cx + rad, cy + rad), fill=(58, 140, 230))
        d.ellipse((cx - rad + 7, cy - rad + 5, cx + rad - 8, cy - 2), fill=(132, 196, 255))
        d.ellipse((cx - rad + 10, cy - rad + 8, cx + rad - 12, cy + 2), fill=(70, 150, 235))
    button(W / 2 - 64, H - 86)
    button(W / 2 + 64, H - 86)
    img.save(path, quality=92)
    # zoom an arrowhead region
    img.crop((40, 430, 220, 640)).resize((360, 420), Image.NEAREST).save(path.replace(".jpg", "-zoom.jpg"), quality=92)
    print("wrote", path, "cell", round(cell, 1), "stroke", stroke)


level = {
    "lv": 12,
    "w": 7,
    "h": 10,
    "arrows": [
        {"dir": "L", "cells": [[3, 1], [2, 1], [1, 1], [1, 2]]},
        {"dir": "U", "cells": [[4, 3], [4, 2], [4, 1]]},
        {"dir": "R", "cells": [[5, 2], [6, 2]]},
        {"dir": "D", "cells": [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5]]},
        {"dir": "D", "cells": [[2, 4], [2, 5], [2, 6], [2, 7], [2, 8]]},
        {"dir": "L", "cells": [[5, 4], [4, 4], [3, 4]]},
        {"dir": "D", "cells": [[6, 4], [6, 5], [6, 6], [6, 7]]},
        {"dir": "L", "cells": [[5, 8], [4, 8], [3, 8], [3, 9]]},
        {"dir": "R", "cells": [[1, 7], [1, 6], [2, 6]]},
    ],
}
phone(level, "/tmp/mock2.jpg")
