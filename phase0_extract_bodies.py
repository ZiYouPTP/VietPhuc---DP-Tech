"""
Phase 0 – Body Extraction
Đọc male.avif, bóc tách 7 dáng người, xuất 2 file base_body tốt nhất.
"""
import sys, json, math
from pathlib import Path

try:
    import cv2
    import numpy as np
    from PIL import Image
    HAS_CV2 = True
except ImportError:
    HAS_CV2 = False
    from PIL import Image
    import numpy as np

SRC = Path("male.avif")
OUT_DIR = Path("assets/base_bodies")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Convert avif → PIL Image ──────────────────────────────────────
def load_avif(path: Path) -> Image.Image:
    """Load avif via PIL (needs pillow-avif-plugin) or via ffmpeg fallback."""
    try:
        import pillow_avif          # noqa: F401 – registers codec
    except ImportError:
        pass
    try:
        img = Image.open(path).convert("RGBA")
        return img
    except Exception:
        # Fallback: convert with ffmpeg to tmp PNG
        import subprocess, tempfile, os
        tmp = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
        tmp.close()
        subprocess.run(["ffmpeg", "-y", "-i", str(path), tmp.name],
                       check=True, capture_output=True)
        img = Image.open(tmp.name).convert("RGBA")
        os.unlink(tmp.name)
        return img

# ── Segment individual figures via contours ───────────────────────
def find_figures_cv2(pil_img: Image.Image):
    """Return list of (x, y, w, h) bounding boxes for each person."""
    arr = np.array(pil_img.convert("RGB"))
    gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)

    # Background is typically white/light – threshold to separate figures
    _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)

    # Morphological close to merge nearby parts of same body
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (20, 20))
    closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    boxes = []
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        area = w * h
        # filter noise: must be at least 3% of image area
        if area > 0.03 * pil_img.width * pil_img.height:
            boxes.append((x, y, w, h))

    # Sort left→right
    boxes.sort(key=lambda b: b[0])
    return boxes

def find_figures_pil_grid(pil_img: Image.Image, n_cols=7, n_rows=1):
    """Fallback: divide image into equal grid cells."""
    W, H = pil_img.size
    cw = W // n_cols
    boxes = []
    for col in range(n_cols):
        x = col * cw
        boxes.append((x, 0, cw, H))
    return boxes

# ── Score a box for "best standing figure" ────────────────────────
def score_box(pil_img: Image.Image, box):
    """Higher = more likely a clean standing figure."""
    x, y, w, h = box
    crop = pil_img.crop((x, y, x+w, y+h)).convert("RGB")
    arr = np.array(crop)

    # 1. Aspect ratio: standing human ~0.25–0.45 wide/tall
    ratio = w / max(h, 1)
    ratio_score = 1.0 - abs(ratio - 0.33) * 3   # peak at ~1:3

    # 2. Height: prefer taller crops
    height_score = h / pil_img.height

    # 3. Non-white pixel density
    mask = np.all(arr < 230, axis=2)
    density = mask.sum() / max(w * h, 1)
    density_score = min(density * 4, 1.0)

    return ratio_score * 0.4 + height_score * 0.3 + density_score * 0.3

# ── Remove white/near-white background → transparent PNG ──────────
def remove_bg_simple(pil_img: Image.Image, threshold=230) -> Image.Image:
    """Simple white-bg removal; replace with alpha channel."""
    rgba = pil_img.convert("RGBA")
    data = np.array(rgba)
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    white_mask = (r > threshold) & (g > threshold) & (b > threshold)
    data[white_mask, 3] = 0           # transparent
    return Image.fromarray(data, "RGBA")

# ── Main ─────────────────────────────────────────────────────────
def main():
    print(f"[Phase0] Loading {SRC}…")
    img = load_avif(SRC)
    print(f"  Image size: {img.size}")

    # Try CV2 contour detection first
    if HAS_CV2:
        boxes = find_figures_cv2(img)
        print(f"  CV2 detected {len(boxes)} figure(s)")
    else:
        boxes = []

    if len(boxes) < 2:
        print("  Falling back to grid split (7 cols)…")
        boxes = find_figures_pil_grid(img, n_cols=7)

    # Score and rank
    scored = [(score_box(img, b), b) for b in boxes]
    scored.sort(reverse=True)

    print(f"  Ranked boxes (top):")
    for i, (sc, b) in enumerate(scored[:5]):
        print(f"    #{i+1}: score={sc:.3f}  box={b}")

    results = []
    for rank, (sc, box) in enumerate(scored[:2]):
        x, y, w, h = box
        # Add padding
        pad = 10
        x1 = max(x - pad, 0)
        y1 = max(y - pad, 0)
        x2 = min(x + w + pad, img.width)
        y2 = min(y + h + pad, img.height)

        crop = img.crop((x1, y1, x2, y2))
        clean = remove_bg_simple(crop)

        out_path = OUT_DIR / f"base_body_{rank+1}.png"
        clean.save(out_path, "PNG")
        print(f"  Saved: {out_path}  ({clean.size})")
        results.append({"file": str(out_path), "size": list(clean.size), "score": round(sc, 4)})

    # Write manifest
    manifest = {"base_bodies": results, "source": str(SRC)}
    manifest_path = OUT_DIR / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
    print(f"  Manifest: {manifest_path}")
    print("[Phase0] Done.")

if __name__ == "__main__":
    main()
