from pathlib import Path

from PIL import Image


root = Path(__file__).resolve().parents[1]
assets = root / 'apps' / 'desktop' / 'assets'
logo = Image.open(assets / 'icon.png').convert('RGBA')
for name in ('icon.ico', 'icon-dark.ico'):
    logo.save(assets / name, sizes=[(n, n) for n in (16, 24, 32, 48, 64, 128, 256)])
for destination in (assets / 'appx').glob('*.png'):
    with Image.open(destination) as original:
        width, height = original.size
    side = min(width, height)
    resized = logo.resize((side, side), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (width, height))
    canvas.alpha_composite(resized, ((width - side) // 2, (height - side) // 2))
    canvas.save(destination)
