from pathlib import Path
from PIL import Image, ImageDraw
import json, hashlib

root = Path(__file__).resolve().parents[1]
paths = [p for p in (root/'assets').glob('*.png') if p.name not in ('inventory-contact.png','review-natural-fit.png')]
paths += list((root/'assets/base_bodies').glob('*.png'))
out = Image.new('RGB', (1000, 420*((len(paths)+4)//5)), '#dedede')
draw = ImageDraw.Draw(out)
for i,p in enumerate(paths):
    im = Image.open(p)
    print(p.name, im.size, im.mode, hashlib.sha256(p.read_bytes()).hexdigest()[:12])
    im = im.convert('RGBA'); im.thumbnail((190,370))
    out.paste(im, (i%5*200+(200-im.width)//2,i//5*420+35),im)
    draw.text((i%5*200+3,i//5*420+5),p.name, fill='black')
out.save(root/'assets/review/current-sources.jpg')
