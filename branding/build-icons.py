from pathlib import Path
from PIL import Image

ROOT = Path(r"C:\Projects\Braille-Hub")

source = ROOT / "branding" / "braille-hub-logo.png"
branding = ROOT / "branding"
office_branding = branding / "office"
office_assets = ROOT / "integrations" / "microsoft365" / "public" / "assets"

office_branding.mkdir(parents=True, exist_ok=True)

image = Image.open(source).convert("RGBA")

# The master artwork contains:
#   symbol
#   Braille Hub
#   Text & Music Accessibility
#
# Only the upper symbol is appropriate for small Office icons.
w, h = image.size
symbol_region = image.crop((
    int(w * 0.30),
    int(h * 0.17),
    int(w * 0.70),
    int(h * 0.59),
))

# Convert the near-white generated background to transparency.
pixels = symbol_region.load()

for y in range(symbol_region.height):
    for x in range(symbol_region.width):
        r, g, b, a = pixels[x, y]

        distance = max(
            255 - r,
            255 - g,
            255 - b,
        )

        if distance < 8:
            pixels[x, y] = (255, 255, 255, 0)
        else:
            alpha = min(255, int(distance * 1.45))
            pixels[x, y] = (r, g, b, alpha)

# Find the actual non-transparent artwork bounds.
alpha = symbol_region.getchannel("A")
bbox = alpha.getbbox()

if bbox is None:
    raise RuntimeError("Could not detect the Braille Hub symbol.")

symbol = symbol_region.crop(bbox)

# Put the symbol on a square transparent canvas with breathing room.
padding_ratio = 0.14

max_side = max(symbol.width, symbol.height)
padding = int(max_side * padding_ratio)
canvas_side = max_side + (padding * 2)

canvas = Image.new(
    "RGBA",
    (canvas_side, canvas_side),
    (255, 255, 255, 0),
)

x = (canvas_side - symbol.width) // 2
y = (canvas_side - symbol.height) // 2

canvas.alpha_composite(symbol, (x, y))

# Keep a high-resolution master symbol.
master = canvas.resize(
    (1024, 1024),
    Image.Resampling.LANCZOS,
)

master_path = branding / "braille-hub-symbol.png"
master.save(master_path, optimize=True)

sizes = [16, 32, 64, 80]

for size in sizes:
    icon = master.resize(
        (size, size),
        Image.Resampling.LANCZOS,
    )

    branded_path = office_branding / f"icon-{size}.png"
    production_path = office_assets / f"icon-{size}.png"

    icon.save(branded_path, optimize=True)
    icon.save(production_path, optimize=True)

    print(f"[OK] {branded_path}")
    print(f"[OK] {production_path}")

print()
print(f"[OK] Master symbol: {master_path}")
print("Braille Hub Office icon generation: PASS")
