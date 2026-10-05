"""
Phase 2 – Z-Index Composite Engine (Python)
Nhận danh sách item_id đã chọn, stack các PNG layer theo Z-index,
composite lên base_body, xuất file PNG tổng hợp + preview JPG.
"""
import json, sys
from pathlib import Path
from PIL import Image

BODIES_DIR  = Path("assets/base_bodies")
CLOTHES_DIR = Path("assets/clothing_layers")
OUTPUT_DIR  = Path("assets/composites")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

MANIFEST    = Path("assets/clothing_manifest.json")

CANVAS_W, CANVAS_H = 512, 768

Z_ORDER = {
    "Áo lót trong":   2,
    "Quần/Váy":       3,
    "Áo khoác ngoài": 4,
    "Phụ kiện thân":  5,
    "Giày dép":       5,
    "Phụ kiện đầu":   6,
}

def load_manifest() -> dict:
    if not MANIFEST.exists():
        return {}
    raw = json.loads(MANIFEST.read_text(encoding="utf-8"))
    return {item["item_id"]: item for item in raw if "item_id" in item}

def composite(
    selected_ids: list[str],
    body_num: int = 1,
    out_name: str = "outfit"
) -> Path:
    """Stack selected items over base body and save composite PNG."""
    manifest = load_manifest()

    # 1. Base body canvas (transparent)
    body_path = BODIES_DIR / f"base_body_{body_num}.png"
    if body_path.exists():
        base = Image.open(body_path).convert("RGBA")
        base = base.resize((CANVAS_W, CANVAS_H), Image.LANCZOS)
    else:
        base = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))

    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (255, 255, 255, 255))
    canvas.paste(base, (0, 0), base)

    # 2. Collect & sort layers by Z-index
    layers = []
    for item_id in selected_ids:
        item = manifest.get(item_id)
        if item is None:
            print(f"  [warn] {item_id} not in manifest, skip")
            continue
        z = item.get("z", Z_ORDER.get(item.get("category", ""), 4))
        layer_path = Path(item.get("layer", ""))
        if not layer_path.exists():
            print(f"  [warn] layer file not found: {layer_path}")
            continue
        layers.append((z, item_id, layer_path))

    layers.sort(key=lambda x: x[0])   # Z-order low → high

    # 3. Composite each layer
    for z, item_id, path in layers:
        layer = Image.open(path).convert("RGBA")
        layer = layer.resize((CANVAS_W, CANVAS_H), Image.LANCZOS)
        canvas.paste(layer, (0, 0), layer)
        print(f"  z={z} ← {item_id}")

    # 4. Save
    out_png = OUTPUT_DIR / f"{out_name}.png"
    out_jpg = OUTPUT_DIR / f"{out_name}_preview.jpg"
    canvas.save(out_png, "PNG")
    canvas.convert("RGB").save(out_jpg, "JPEG", quality=90)
    print(f"  → {out_png}")
    return out_png

if __name__ == "__main__":
    # Demo: combine áo tứ thân set
    demo_set = [
        "ao_yem_001",           # z=2  inner
        "quan_nai_den_001",     # z=3  trousers (if exists)
        "ao_tu_than_001",       # z=4  outer
        "khan_mo_qua_001",      # z=5  accessory
        "non_quai_thao_001",    # z=6  head
    ]
    out = composite(demo_set, body_num=1, out_name="demo_ao_tu_than")
    print(f"[Phase2] Output: {out}")
