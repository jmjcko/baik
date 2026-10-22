#!/usr/bin/env python3
"""
Writes the vector images of the three current-setup guides (no dependencies):
  public/assets/guides/crank_cad.svg   crank arm, inside face with the stamped length
  public/assets/guides/saddle_cad.svg  frame side view, bottom bracket and saddle
  public/assets/guides/bar_cad.svg     drop handlebar from above

Style: 1024 x 1024, white background, black 4 px outlines, light grey metal, dark grey kit tone,
no text except the stamped crank length. Dimension graphics are SVG overlays (see
src/components/baikfit/guides/ and docs/design/measurement-guide-diagrams.md).
Usage: python3 scripts/guides/build_vector_guides.py
"""
from pathlib import Path

OUT = Path(__file__).resolve().parents[2] / 'public/assets/guides'
INK, METAL, KIT = '#0f172a', '#d6dbe2', '#4a4d52'
HEAD = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">\n<rect width="1024" height="1024" fill="#ffffff"/>\n'
STROKE = f'stroke="{INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"'


def crank() -> str:
    arm = ('M 440 260 A 72 72 0 0 1 584 260 L 556 740 A 46 46 0 0 1 468 740 Z')
    return HEAD + f'''<path d="{arm}" fill="{METAL}" {STROKE}/>
<path d="M 478 300 L 492 720 M 546 300 L 532 720" fill="none" stroke="#9aa3ae" stroke-width="3"/>
<circle cx="512" cy="260" r="48" fill="{KIT}" {STROKE}/>
<rect x="488" y="236" width="48" height="48" fill="#aab2bd" {STROKE}/>
<circle cx="512" cy="260" r="10" fill="{INK}"/>
<circle cx="512" cy="780" r="26" fill="#aab2bd" {STROKE}/>
<circle cx="512" cy="780" r="12" fill="{INK}"/>
<rect x="452" y="600" width="120" height="56" rx="8" fill="#eef1f4" stroke="#7b8594" stroke-width="3"/>
<text x="512" y="642" text-anchor="middle" font-family="monospace" font-size="38" font-weight="bold" fill="{INK}">172.5</text>
</svg>
'''


def saddle() -> str:
    return HEAD + f'''<g {STROKE} fill="none">
<path d="M 450 860 L 300 300" stroke-width="18"/>
<path d="M 310 340 L 950 460" stroke-width="14"/>
<path d="M 450 860 L 890 760" stroke-width="16"/>
<path d="M 890 760 L 950 460" stroke-width="14"/>
<path d="M 450 860 L 280 900" stroke-width="12"/>
<path d="M 300 340 L 280 900" stroke-width="10"/>
<path d="M 300 300 L 300 256" stroke-width="12"/>
</g>
<path d="M 190 262 C 230 232 340 232 420 262 C 396 292 250 298 190 262 Z" fill="{KIT}" {STROKE}/>
<circle cx="450" cy="860" r="44" fill="{KIT}" {STROKE}/>
<circle cx="450" cy="860" r="10" fill="#ffffff"/>
<circle cx="280" cy="900" r="18" fill="#aab2bd" {STROKE}/>
<circle cx="890" cy="760" r="18" fill="#aab2bd" {STROKE}/>
<circle cx="950" cy="460" r="22" fill="#aab2bd" {STROKE}/>
</svg>
'''


def bars() -> str:
    return HEAD + f'''<g {STROKE} fill="none">
<path d="M 240 500 L 784 500" stroke-width="30"/>
<path d="M 240 500 C 200 500 180 440 200 380 C 215 330 250 300 290 300" stroke-width="30"/>
<path d="M 784 500 C 824 500 844 440 824 380 C 809 330 774 300 734 300" stroke-width="30"/>
</g>
<rect x="472" y="462" width="80" height="76" rx="10" fill="{KIT}" {STROKE}/>
<path d="M 512 538 L 512 700" stroke="{INK}" stroke-width="40" stroke-linecap="round"/>
<ellipse cx="258" cy="318" rx="46" ry="34" fill="{METAL}" {STROKE}/>
<ellipse cx="766" cy="318" rx="46" ry="34" fill="{METAL}" {STROKE}/>
</svg>
'''


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, svg in (('crank_cad.svg', crank()), ('saddle_cad.svg', saddle()), ('bar_cad.svg', bars())):
        (OUT / name).write_text(svg)
    print('written: crank_cad.svg, saddle_cad.svg, bar_cad.svg')


if __name__ == '__main__':
    main()
