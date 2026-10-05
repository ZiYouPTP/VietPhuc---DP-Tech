"""
Phase 1 – Asset Generation & Layer Masking
- Đọc viet_phuc_items.json → sinh prompt Pollinations.ai cho mỗi item
- Tải ảnh AI về, dùng mask để bóc lớp trang phục sạch khỏi nền
- Xuất Transparent PNG chuẩn canvas (W×H cố định)
"""
import json, time, hashlib, re
from pathlib import Path
from urllib.request import urlretrieve
from urllib.parse import quote

try:
    import cv2
    import numpy as np
    from PIL import Image
    HAS_CV2 = True
except ImportError:
    from PIL import Image
    import numpy as np
    HAS_CV2 = False

# ── Config ────────────────────────────────────────────────────────
ITEMS_FILE   = Path("viet_phuc_items.json")
AI_FILE      = Path("viet_phuc_items_AI_GENERATED.json")
BODIES_DIR   = Path("assets/base_bodies")
CLOTHES_DIR  = Path("assets/clothing_layers")
CANVAS_W, CANVAS_H = 512, 768         # chuẩn canvas = base_body size
POLL_BASE    = "https://image.pollinations.ai/prompt"

CLOTHES_DIR.mkdir(parents=True, exist_ok=True)

# ── Z-index map từ category ───────────────────────────────────────
Z_MAP = {
    "Áo lót trong":    2,
    "Quần/Váy":        3,
    "Áo khoác ngoài":  4,
    "Phụ kiện thân":   5,
    "Giày dép":        5,
    "Phụ kiện đầu":    6,
}

# ── Build Pollinations prompt ─────────────────────────────────────
def build_prompt(item: dict) -> str:
    name   = item["name"]
    colors = item.get("filters", {}).get("color_tags", [])
    cat    = item.get("category", "")
    color_str = ", ".join(colors[:3]) if colors else "traditional"

    style_map = {
        "Áo khoác ngoài": "traditional Vietnamese outer robe garment",
        "Áo lót trong":   "traditional Vietnamese inner undergarment",
        "Quần/Váy":       "traditional Vietnamese trousers or skirt",
        "Phụ kiện đầu":   "traditional Vietnamese headwear accessory",
        "Giày dép":       "traditional Vietnamese footwear",
        "Phụ kiện thân":  "traditional Vietnamese body accessory belt or ornament",
    }
    garment_desc = style_map.get(cat, "traditional Vietnamese garment")

    prompt = (
        f"Product photo of {name} Vietnamese traditional {garment_desc}, "
        f"color: {color_str}, "
        f"worn by a mannequin or flat lay on pure white background, "
        f"no person visible, front view, full garment visible, "
        f"high detail fabric texture, professional fashion product photo, "
        f"4K ultra sharp, isolated on white"
    )
    return prompt

# ── Download AI clothing image ────────────────────────────────────
def download_clothing_image(item: dict, seed: int = 42) -> Path | None:
    item_id = item["item_id"]
    out_path = CLOTHES_DIR / f"{item_id}_raw.png"

    if out_path.exists():
        print(f"  [skip] {item_id} already downloaded")
        return out_path

    prompt  = build_prompt(item)
    enc     = quote(prompt)
    url     = f"{POLL_BASE}/{enc}?width={CANVAS_W}&height={CANVAS_H}&seed={seed}&nologo=true&enhance=true&model=flux"

    print(f"  Downloading {item_id}… ", end="", flush=True)
    try:
        urlretrieve(url, out_path)
        print("✓")
        return out_path
    except Exception as e:
        print(f"✗ ({e})")
        return None

# ── Mask out non-garment areas (white bg removal) ─────────────────
def extract_garment_layer(raw_path: Path, item_id: str) -> Path:
    """Remove white background, keep garment with transparency."""
    out_path = CLOTHES_DIR / f"{item_id}_layer.png"

    img = Image.open(raw_path).convert("RGBA")

    # Resize to canvas
    img = img.resize((CANVAS_W, CANVAS_H), Image.LANCZOS)

    arr = np.array(img)
    r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]

    # White / near-white background
    white_bg = (r > 235) & (g > 235) & (b > 235)

    # If CV2 available, use GrabCut-style approach for cleaner mask
    if HAS_CV2:
        rgb = cv2.cvtColor(arr[:,:,:3], cv2.COLOR_RGB2BGR)
        mask_gc = np.where(white_bg, cv2.GC_BGD, cv2.GC_PR_FGD).astype(np.uint8)
        bgd_model = np.zeros((1, 65), np.float64)
        fgd_model = np.zeros((1, 65), np.float64)
        try:
            rect = (5, 5, CANVAS_W-10, CANVAS_H-10)
            cv2.grabCut(rgb, mask_gc, rect, bgd_model, fgd_model, 3, cv2.GC_INIT_WITH_RECT)
            final_mask = np.where((mask_gc == cv2.GC_FGD) | (mask_gc == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
            arr[:,:,3] = final_mask
        except Exception:
            # Fallback: simple threshold
            arr[white_bg, 3] = 0
    else:
        arr[white_bg, 3] = 0

    result = Image.fromarray(arr, "RGBA")
    result.save(out_path, "PNG")
    return out_path

# ── Process all items ─────────────────────────────────────────────
def process_all(limit=None, delay=2.5):
    data = json.loads(ITEMS_FILE.read_text(encoding="utf-8"))
    items = data["items"]
    if limit:
        items = items[:limit]

    manifest = []
    for i, item in enumerate(items):
        item_id = item["item_id"]
        category = item.get("category", "")
        z = Z_MAP.get(category, 4)
        print(f"\n[{i+1}/{len(items)}] {item_id} (z={z})")

        raw = download_clothing_image(item, seed=i * 7 + 42)
        if raw is None:
            manifest.append({"item_id": item_id, "z": z, "status": "failed"})
            continue

        time.sleep(delay)   # be polite to free API

        layer_path = extract_garment_layer(raw, item_id)
        manifest.append({
            "item_id":   item_id,
            "name":      item["name"],
            "category":  category,
            "z":         z,
            "layer":     str(layer_path),
            "raw":       str(raw),
            "prompt":    build_prompt(item),
        })

    out = Path("assets/clothing_manifest.json")
    out.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
    print(f"\n[Phase1] Done. Manifest → {out}")
    return manifest

if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=None, help="Max items to process")
    ap.add_argument("--delay", type=float, default=2.5)
    args = ap.parse_args()
    process_all(limit=args.limit, delay=args.delay)
