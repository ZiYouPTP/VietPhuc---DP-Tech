"""Prepare the approved 2D garment assets without changing any original.

Run: python tools/prepare_remix_assets.py
Pillow, NumPy and SciPy are used offline; this command never calls an image API.
Fit coordinates live in assets/garment_fits.json, not in UI components.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
BODY = {"female": (105, 290, "base_body_2.png"), "male": (118, 308, "base_body_1.png")}


def remove_border_white(image: Image.Image, threshold: int = 245, background_seeds=()) -> tuple[Image.Image, dict]:
    """Only clear near-white pixels connected to the canvas boundary.

    Enclosed light fabric remains opaque. No hue threshold is used on PNGs.
    Connected background below a hat or within its straps is cleared as well.
    """
    rgba = np.array(image.convert("RGBA"), dtype=np.uint8)
    rgb = rgba[:, :, :3].astype(np.int16)
    white = (rgb.min(axis=2) >= threshold) & ((rgb.max(axis=2) - rgb.min(axis=2)) <= 16)
    seeds = np.zeros_like(white)
    seeds[0, :] = white[0, :]
    seeds[-1, :] = white[-1, :]
    seeds[:, 0] = white[:, 0]
    seeds[:, -1] = white[:, -1]
    # Reviewed background holes may be enclosed by a chin strap. An explicit
    # seed clears that connected region without erasing enclosed white fabric.
    for x, y in background_seeds:
        if not (0 <= x < rgba.shape[1] and 0 <= y < rgba.shape[0]) or not white[y,x]:
            raise ValueError("A background seed must point at a near-white background pixel")
        seeds[y,x] = True
    outside = ndimage.binary_propagation(seeds, mask=white)
    rgba[outside, 3] = 0
    # Only the immediately adjacent fringe is softened; interior straw highlights
    # and garment highlights are intentionally retained.
    fringe = ndimage.binary_dilation(outside) & ~outside
    fringe &= (rgb.min(axis=2) >= 230) & ((rgb.max(axis=2) - rgb.min(axis=2)) <= 22)
    rgba[fringe, 3] = np.minimum(rgba[fringe, 3], ((255 - rgb.min(axis=2)[fringe]) * 12).clip(30, 255)).astype(np.uint8)
    return Image.fromarray(rgba), {"method": "near-white border flood fill", "threshold": threshold,
                                   "backgroundPixelsRemoved": int(outside.sum()), "fringePixelsSoftened": int(fringe.sum()),
                                   "backgroundSeeds": list(background_seeds)}


def clean_alpha_noise(image: Image.Image, minimum_component_pixels: int = 16) -> tuple[Image.Image, dict]:
    """Drop detached tiny alpha specks; do not erase white fabric or opaque edges."""
    rgba = np.array(image.convert("RGBA"), dtype=np.uint8)
    labels, count = ndimage.label(rgba[:, :, 3] > 8)
    sizes = np.bincount(labels.ravel())
    small = sizes < minimum_component_pixels
    small[0] = False
    removed = small[labels]
    rgba[removed, 3] = 0
    rgba[rgba[:, :, 3] <= 4, 3] = 0
    return Image.fromarray(rgba), {"method": "detached alpha speck cleanup", "minimumComponentPixels": minimum_component_pixels,
                                   "componentsBefore": count, "speckPixelsRemoved": int(removed.sum())}


def visible_bbox(image: Image.Image, alpha_threshold: int = 16):
    mask = image.getchannel("A").point(lambda a: 255 if a > alpha_threshold else 0)
    return mask.getbbox()


def map_point(point, fit, source_size, body_size):
    """Map observed source anchors through the configured fit, for diagnostics."""
    x, y = point
    if fit["mode"] == "similarity":
        x = x * fit["scale"] + fit.get("offsetX",0)
        y = y * fit["scale"] + fit.get("offsetY",0)
        return [round(x, 3), round(y, 3)]
    box = fit["sourceBox"]
    target = fit["targetBox"]
    return [round(target[0] + (x-box[0])*(target[2]-target[0])/(box[2]-box[0]), 3),
            round(target[1] + (y-box[1])*(target[3]-target[1])/(box[3]-box[1]), 3)]


def fit_canvas(source: Image.Image, fit: dict, body_size, resolution: int = 1) -> Image.Image:
    """Uniform scaling and translation only; never reshape a source garment."""
    W, H = body_size
    output_size = (W * resolution, H * resolution)
    if fit.get("rotation", 0) != 0:
        raise ValueError("No rotation is permitted without a separately reviewed source pose")
    if "verticalMap" in fit or "scaleX" in fit or "scaleY" in fit:
        raise ValueError("Garment proportions must be preserved; panel or anisotropic warps are disabled")
    out = Image.new("RGBA", output_size)
    if fit["mode"] == "parts":
        for part in fit["parts"]:
            crop = source.crop(tuple(part["sourceBox"]))
            x0, y0, x1, y1 = part["targetBox"]
            if abs((x1-x0)/(part["sourceBox"][2]-part["sourceBox"][0])-(y1-y0)/(part["sourceBox"][3]-part["sourceBox"][1])) > .001:
                raise ValueError("A shoe fit must preserve the original aspect ratio")
            crop = crop.resize((max(1, round((x1-x0)*resolution)), max(1, round((y1-y0)*resolution))), Image.Resampling.LANCZOS)
            out.alpha_composite(crop, (round(x0*resolution), round(y0*resolution)))
        return out
    if fit["mode"] == "box":
        crop = source.crop(tuple(fit["sourceBox"]))
        x0, y0, x1, y1 = fit["targetBox"]
        if abs((x1-x0)/(fit["sourceBox"][2]-fit["sourceBox"][0])-(y1-y0)/(fit["sourceBox"][3]-fit["sourceBox"][1])) > .001:
            raise ValueError("A box fit must preserve the original aspect ratio")
        crop = crop.resize((max(1, round((x1-x0)*resolution)), max(1, round((y1-y0)*resolution))), Image.Resampling.LANCZOS)
        out.alpha_composite(crop, (round(x0*resolution), round(y0*resolution)))
        return out
    if fit["mode"] != "similarity" or fit.get("scale",0) <= 0:
        raise ValueError("A valid positive uniform scale is required")
    scale=fit["scale"]*resolution
    inverse=(1/scale,0,-fit.get("offsetX",0)/fit["scale"],0,1/scale,-fit.get("offsetY",0)/fit["scale"])
    return source.transform(output_size,Image.Transform.AFFINE,inverse,resample=Image.Resampling.BICUBIC)


def body_composite(layer: Image.Image, gender: str, scale: int = 4, occlusion=None) -> Image.Image:
    W, H, file = BODY[gender]
    backdrop = Image.new("RGBA", (W*scale, H*scale), "#eee9e2")
    body = Image.open(ROOT / "assets/base_bodies" / file).convert("RGBA").resize(backdrop.size, Image.Resampling.BICUBIC)
    backdrop.alpha_composite(body)
    backdrop.alpha_composite(layer.resize(backdrop.size, Image.Resampling.LANCZOS))
    if occlusion:
        mask=Image.new("L",backdrop.size,0)
        draw=ImageDraw.Draw(mask)
        for polygon in occlusion:
            draw.polygon([(round(x*scale),round(y*scale)) for x,y in polygon],fill=255)
        body.putalpha(Image.fromarray(np.minimum(np.array(body.getchannel("A")),np.array(mask)).astype(np.uint8)))
        backdrop.alpha_composite(body)
    return backdrop.convert("RGB")


def labeled_preview(before, after, male, female, item_name):
    sheet = Image.new("RGB", (960, 720), "#ece8e2")
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 20)
    except OSError:
        font = ImageFont.load_default()
    draw.text((16, 10), item_name, fill="#282420", font=font)
    for index, (label, image) in enumerate((("Original", before), ("Prepared alpha", after), ("Male fit", male), ("Female fit", female))):
        x = index*240
        draw.text((x+12, 44), label, fill="#282420", font=font)
        tile = Image.new("RGBA", (216, 620), "#f9f5ef")
        if index == 1:
            checker = ImageDraw.Draw(tile)
            for y in range(0, 620, 12):
                for xx in range(0, 216, 12):
                    if (y//12+xx//12)%2:
                        checker.rectangle((xx,y,xx+11,y+11),fill="#dcd9d3")
        image = image.convert("RGBA")
        image.thumbnail(tile.size, Image.Resampling.LANCZOS)
        tile.alpha_composite(image, ((216-image.width)//2, (620-image.height)//2))
        sheet.paste(tile.convert("RGB"), (x+12, 82))
    return sheet


def prepare(config_path: Path = ROOT / "assets/garment_fits.json") -> dict:
    config = json.loads(config_path.read_text(encoding="utf-8"))
    inventory = json.loads((ROOT / "ASSET_INVENTORY_DRAFT.json").read_text(encoding="utf-8"))
    rule_data = json.loads((ROOT / "viet-phuc-remix/data/outfit-rules.json").read_text(encoding="utf-8"))
    asset_genders = {row["sourceFile"]: row["supportedGenders"] for row in rule_data["assetGenderPolicy"]}
    items = []
    diagnostics = []
    for source_item in inventory["items"]:
        asset_id = Path(source_item["file"]).stem
        setting = config["assets"][asset_id]
        source_file = ROOT / source_item["file"]
        source = Image.open(source_file).convert("RGBA")
        if source_item["format"] == "JPEG":
            cleaned, background = remove_border_white(source, setting.get("whiteThreshold", 245), setting.get("backgroundSeeds",[]))
        else:
            cleaned, background = source.copy(), {"method": "existing alpha preserved", "backgroundPixelsRemoved": 0}
        cleaned, cleanup = clean_alpha_noise(cleaned)
        before_hash = hashlib.sha256(source_file.read_bytes()).hexdigest()
        directory = ROOT / "assets/prepared/cutouts"
        directory.mkdir(parents=True, exist_ok=True)
        cutout_path = directory / f"{asset_id}.png"
        cleaned.save(cutout_path, optimize=True)
        thumb = cleaned.crop(visible_bbox(cleaned)).copy()
        thumb.thumbnail((240, 320), Image.Resampling.LANCZOS)
        thumb_dir = ROOT / "assets/prepared/thumbnails"
        thumb_dir.mkdir(parents=True, exist_ok=True)
        thumb_file = thumb_dir / f"{asset_id}.png"
        thumb.save(thumb_file, optimize=True)
        record = {"assetId": asset_id, "id": source_item["proposedCatalogId"], "name": source_item["proposedName"],
                  "slot": source_item["proposedSlot"], "sourceFile": source_item["file"], "sourceSha256": before_hash,
                  "thumbnailFile": thumb_file.relative_to(ROOT).as_posix(), "cutoutFile": cutout_path.relative_to(ROOT).as_posix(),
                  "status": "draft", "supportedGenders": [], "layerFiles": {}, "fit": {},
                  "culturalInfo": {"sources": [], "needsVerification": True,
                                   "verificationNote": "TODO: bổ sung nguồn kiểm chứng tên, cấu tạo và bối cảnh sử dụng. Đây là ảnh phối mẫu."}}
        # Explicit user preview policy, separate from cultural claims and fit QA.
        record["allowedGenders"] = asset_genders[source_item["file"]]
        qa_images = {}
        for gender in ("male", "female"):
            W, H, _ = BODY[gender]
            fit = setting["fits"][gender]
            high_layer = fit_canvas(cleaned, fit, (W, H), resolution=4)
            layer = high_layer.resize((W, H), Image.Resampling.LANCZOS)
            layer_dir = ROOT / "assets/prepared" / gender
            layer_dir.mkdir(parents=True, exist_ok=True)
            layer_file = layer_dir / f"{asset_id}.png"
            layer.save(layer_file, optimize=True)
            relative = layer_file.relative_to(ROOT).as_posix()
            fitted = {**fit, "file": relative, "canvas": [W,H], "rotation": 0,
                      "landmarkResiduals": [], "certifiesFit": False}
            # Residual observations are input measured independently on source
            # pixels. Unmeasured waist/garment seams explicitly remain null.
            for anchor in setting.get("observedLandmarks", []):
                if anchor["gender"] != gender:
                    continue
                mapped = map_point(anchor["sourcePx"], fit, source.size, (W,H))
                target = anchor.get("target")
                residual = math.dist(mapped,target) if target is not None else None
                fitted["landmarkResiduals"].append({"name": anchor["name"], "sourcePx": anchor["sourcePx"],
                    "observedOutput": mapped, "reference": target,
                    "errorPx": round(residual,3) if residual is not None else None,
                    "errorHeightPercent": round(residual/H*100,3) if residual is not None else None,
                    "uncertaintyPx": anchor.get("uncertaintyPx",4), "note": anchor.get("note","")})
            record["layerFiles"][gender] = relative
            record["fit"][gender] = fitted
            if fit["status"] == "ready" and gender in record["allowedGenders"]:
                record["supportedGenders"].append(gender)
            qa = body_composite(high_layer, gender, occlusion=fit.get("bodyOcclusionPolygons"))
            qa_dir = ROOT / "assets/review" / gender
            qa_dir.mkdir(parents=True, exist_ok=True)
            qa.save(qa_dir / f"{asset_id}.png", optimize=True)
            qa_images[gender] = qa
            diagnostics.append({"assetId":asset_id,"id":record["id"],"gender":gender,"status":fit["status"],
                                "selectionAllowed":gender in record["allowedGenders"],
                                "canvas":[W,H],"visibleBBox":visible_bbox(layer),"fitTolerancePercent":2,
                                "certifiesFit":False,"landmarkResiduals":fitted["landmarkResiduals"],
                                "notes":fit.get("notes",[])})
        if record["supportedGenders"]:
            record["status"] = "ready"
        record["preparation"] = {"background":background,"alphaCleanup":cleanup,"originalPreserved":True}
        review_dir = ROOT / "assets/review"
        review_dir.mkdir(parents=True, exist_ok=True)
        labeled_preview(source,cleaned,qa_images["male"],qa_images["female"],record["name"]["vi"]).save(review_dir / f"{asset_id}-before-after.jpg",quality=88,optimize=True)
        items.append(record)
        if before_hash != hashlib.sha256(source_file.read_bytes()).hexdigest():
            raise RuntimeError("An original was changed during preparation")
    manifest = {"schemaVersion":1,"kind":"offline-2d-clothing-layers","configFile":"assets/garment_fits.json",
                "baseBodies":inventory["bodyCanvases"],"items":items,
                "notes":["Ready means reviewed for the indicated body only; it is not historical verification.",
                         "Other gender fits remain draft and must not be exposed to end users.",
                         "Originals are retained. aodai-fit-body2.png is the current canonical source; 15 unique sources.",
                         "Male selection is restricted to aonguthan_male and aogiaolinh by user instruction, not a historical gender rule."],
                "sources":[],"needsVerification":True}
    (ROOT / "assets/clothing_manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    (ROOT / "assets/review/fit-diagnostics.json").write_text(json.dumps(diagnostics,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    # An overview allows visual QA without downloading every layer individually.
    sheet = Image.new("RGB", (7*210, math.ceil(len(items)/7)*2*650), "#eee9e2")
    draw = ImageDraw.Draw(sheet)
    for index,item in enumerate(items):
        for gi,gender in enumerate(("male","female")):
            tile = Image.open(ROOT / "assets/review" / gender / f"{item['assetId']}.png")
            tile.thumbnail((200,590))
            x=(index%7)*210;y=(index//7*2+gi)*650
            sheet.paste(tile,(x+(210-tile.width)//2,y+44))
            draw.text((x+4,y+6),f"{index+1} {item['assetId']} {gender}",fill="#302820")
            draw.text((x+4,y+22),item["fit"][gender]["status"] if gender in item["allowedGenders"] else "QA only - disabled",fill="#302820")
    sheet.save(ROOT / "assets/review/all-body-fits.jpg",quality=90,optimize=True)
    return manifest


if __name__ == "__main__":
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config",type=Path,default=ROOT/"assets/garment_fits.json")
    args=parser.parse_args()
    manifest=prepare(args.config)
    print(json.dumps({"items":len(manifest["items"]),"ready":sum(i["status"]=="ready" for i in manifest["items"]),
                      "draft":sum(i["status"]=="draft" for i in manifest["items"]),
                      "readyFits":sum(len(i["supportedGenders"]) for i in manifest["items"]),
                      "manifest":"assets/clothing_manifest.json"},ensure_ascii=False))
