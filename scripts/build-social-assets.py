"""Generate small, local brand assets; requires Pillow. No network calls."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
font_file = ROOT / 'public/fonts/bricolage-grotesque.ttf'
font = lambda size: ImageFont.truetype(str(font_file), size)
paper, ink, sage, muted = '#fffdf9', '#20372f', '#9ddbb8', '#52665c'
image = Image.new('RGB', (1200, 630), paper)
draw = ImageDraw.Draw(image)
draw.rounded_rectangle((810, 75, 1130, 555), radius=60, fill=ink)
draw.text((970, 280), 'ä', font=font(270), fill=sage, anchor='mm')
draw.text((75, 80), 'LeseLaut', font=font(45), fill=ink)
draw.text((75, 195), 'Learn German,', font=font(70), fill=ink)
draw.text((75, 280), 'one story at a time.', font=font(63), fill=ink)
draw.text((78, 395), 'Stories · Audio · English translations', font=font(30), fill=muted)
draw.text((78, 465), 'A1 to B2  /  leselaut.com', font=font(30), fill=ink)
image.save(ROOT / 'public/social-card.png', optimize=True)
for size, name in [(192, 'icon-192.png'), (180, 'apple-touch-icon.png')]:
    icon = Image.new('RGB', (size, size), ink)
    d = ImageDraw.Draw(icon)
    d.text((size / 2, size / 2 - size * .025), 'ä', font=font(round(size * .85)), fill=sage, anchor='mm')
    icon.save(ROOT / 'public' / name, optimize=True)
