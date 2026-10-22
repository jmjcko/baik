#!/usr/bin/env python3
"""
Builds the three frontal-figure measurement guide images (torso, arm, shoulder width)
from one line-art source so they share the visual style of the inseam guide
(dark grey cycling bib kit, white skin, black outline, no baked-in dimension marks).

Usage (from the repo root):
    python3 -m venv .venv-guides && .venv-guides/bin/pip install pillow numpy scipy
    .venv-guides/bin/python scripts/guides/build_guide_images.py

Input : docs/design/guide-sources/figure_front_lineart.jpg   (1024x1024 line art)
Output: public/assets/guides/{torso,arm,acromion}_cad.jpg
inseam_cad.jpg is the style reference and is not generated here.
See docs/design/measurement-guide-diagrams.md.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'docs/design/guide-sources/figure_front_lineart.jpg'
OUT = ROOT / 'public/assets/guides'

KIT = (74, 77, 82)      # bib / shorts fill, matches inseam_cad.jpg
INK = (15, 15, 15)
SS = 4                  # supersampling factor for hand-drawn parts


def erase_ink(a, x0, x1, y0, y1, threshold=252):
    """Paint dark/grey pixels in a box white (removes baked-in arrows and ticks)."""
    lum = a.mean(axis=2)
    box = a[y0:y1, x0:x1]
    box[lum[y0:y1, x0:x1] < threshold] = 255


def build_base():
    a = np.array(Image.open(SOURCE).convert('RGB'))

    # 1. remove the baked-in dimension arrow / sternal tick (the overlay SVG draws its own)
    erase_ink(a, 498, 528, 150, 484)
    erase_ink(a, 503, 522, 503, 668)
    erase_ink(a, 506, 518, 484, 491)
    erase_ink(a, 506, 518, 498, 503)
    erase_ink(a, 480, 545, 150, 166)

    # 2. fill the kit (bib straps, bib, shorts) by flood-filling regions enclosed by the outline
    lum = a.mean(axis=2)
    free = ~ndi.binary_dilation(lum < 150, iterations=1)
    labels, _ = ndi.label(free)
    seeds = [(512, 560), (380, 600), (645, 600), (375, 800), (650, 800), (430, 250),
             (594, 250), (420, 870), (600, 870), (440, 470), (590, 470)]
    kit = np.zeros(lum.shape, bool)
    for x, y in seeds:
        if labels[y, x]:
            kit |= labels == labels[y, x]
    kit = ndi.binary_dilation(kit, iterations=2) & (lum > 150)
    a[kit] = KIT

    # 3. remove the original horizontal book and its crotch gusset
    a[656:712, 414:612] = KIT
    gusset = a[700:728, 484:546]
    gusset[gusset.mean(axis=2) > 200] = KIT
    return Image.fromarray(a)


def draw_region(img, box, painter):
    """Run painter(ImageDraw, scale) on a supersampled crop of img and paste it back."""
    x0, y0, x1, y1 = box
    crop = img.crop(box).resize(((x1 - x0) * SS, (y1 - y0) * SS), Image.LANCZOS)
    painter(ImageDraw.Draw(crop), lambda x, y: ((x - x0) * SS, (y - y0) * SS))
    img.paste(crop.resize((x1 - x0, y1 - y0), Image.LANCZOS), (x0, y0))


def add_vertical_book(img):
    def paint(d, p):
        x0, x1, y0, y1 = 488, 538, 650, 862
        d.rectangle([*p(x0, y0), *p(x1, y1)], fill=(255, 255, 255), outline=INK, width=3 * SS)
        d.rectangle([*p(x0 + 3, y0 + 3), *p(x0 + 13, y1 - 3)], fill=(206, 208, 212))
        d.line([*p(x0 + 13, y0 + 3), *p(x0 + 13, y1 - 3)], fill=INK, width=2 * SS)
        for dx in (6, 11, 16):
            d.line([*p(x1 - dx, y0 + 6), *p(x1 - dx, y1 - 6)], fill=(120, 120, 120), width=SS)
    draw_region(img, (480, 640, 548, 872), paint)


FIST_OUTLINE = [(268, 654), (263, 690), (265, 722), (277, 744), (300, 752), (322, 743),
                (332, 716), (333, 688), (327, 666), (322, 654)]
FIST_THUMB = [(304, 672), (316, 682), (322, 700), (319, 716), (306, 724)]


def add_fists(img):
    """Replace the relaxed open hands with clenched fists (arm length = acromion to fist centre)."""
    for mirror in (False, True):
        x0, x1 = (682, 770) if mirror else (254, 342)
        y0, y1 = 654, 800
        w, h = x1 - x0, y1 - y0

        def sc(pt, mirror=mirror, x0=x0, y0=y0):
            x, y = pt
            return (((1024 - x if mirror else x) - x0) * SS, (y - y0) * SS)

        mask = Image.new('L', (w * SS, h * SS), 0)
        ImageDraw.Draw(mask).polygon([sc(p) for p in FIST_OUTLINE], fill=255)
        m = ndi.gaussian_filter((np.array(mask) > 0).astype(float), sigma=7 * SS) > 0.5  # round the facets
        ring = ndi.binary_dilation(m, iterations=round(1.6 * SS)) & ~m
        ring[: 6 * SS, :] = False  # open towards the forearm, which keeps its own outline

        crop = np.full((h * SS, w * SS, 3), 255, np.uint8)
        crop[ring] = INK
        layer = Image.fromarray(crop)
        d = ImageDraw.Draw(layer)
        for y in (698, 712, 726):                          # curled fingers
            d.line([sc((271, y)), sc((299, y))], fill=INK, width=2 * SS)
        d.line([sc(p) for p in FIST_THUMB], fill=INK, width=2 * SS, joint='curve')  # thumb
        img.paste(layer.resize((w, h), Image.LANCZOS), (x0, y0))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    base = build_base()

    acromion = base.copy()
    acromion.save(OUT / 'acromion_cad.jpg', quality=93)

    torso = base.copy()
    add_vertical_book(torso)
    torso.save(OUT / 'torso_cad.jpg', quality=93)

    arm = base.copy()
    add_fists(arm)
    arm.save(OUT / 'arm_cad.jpg', quality=93)
    print('written:', ', '.join(f'{n}_cad.jpg' for n in ('acromion', 'torso', 'arm')))


if __name__ == '__main__':
    main()
