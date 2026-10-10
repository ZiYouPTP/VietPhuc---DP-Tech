"""Refresh review inventory from the explicitly supplied garment files only."""
from pathlib import Path
from copy import deepcopy
from math import gcd
import hashlib
import html
import json
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
INVENTORY = ROOT / 'ASSET_INVENTORY_DRAFT.json'


def refresh():
    data = json.loads(INVENTORY.read_text(encoding='utf-8'))
    items = deepcopy(data['items'])
    # The user renamed/replaced the canonical áo dài file, retaining its bytes.
    for item in items:
        if item['file'] == 'assets/aodai.png' and not (ROOT / item['file']).exists():
            item['file'] = 'assets/aodai-fit-body2.png'
            item['preparationNotes'] = 'Áo riêng trên canvas body nữ. File aodai.png đã bỏ; dùng aodai-fit-body2.png. Căn bằng kích thước và vị trí theo ảnh tham chiếu người dùng, giữ hình dáng áo.'
    pants = 'assets/quan-aodai-fit-body2.png'
    if (ROOT / pants).exists() and not any(i['file'] == pants for i in items):
        item = deepcopy(next(i for i in items if i['file'] == 'assets/quanbaba.png'))
        item.update(file=pants, proposedName={'vi': 'Quần áo dài trắng ngà', 'en': 'Ivory áo dài trousers'},
                    proposedCatalogId='trousers', proposedSlot='bottom',
                    preparationNotes='Ảnh mới người dùng bổ sung, canvas body nữ. Căn cạp quần và ống quần bằng scale/offset; giữ nguyên tỉ lệ món, không kéo riêng từng đoạn.')
        items.append(item)
    unique, duplicates, hashes = [], [], {}
    for item in items:
        path = ROOT / item['file']
        if not path.exists():
            raise FileNotFoundError(f'Approved source missing: {path}')
        raw = path.read_bytes()
        sha = hashlib.sha256(raw).hexdigest()
        if sha in hashes:
            duplicates.append({'file': item['file'], 'duplicateOf': hashes[sha], 'sha256': sha})
            continue
        hashes[sha] = item['file']
        with Image.open(path) as im:
            rgba = np.asarray(im.convert('RGBA'))
            alpha = rgba[:, :, 3]
            w, h = im.size
            d = gcd(w, h)
            ys, xs = np.where(alpha > 128)
            ratios = {g: round(abs((w / h) / (b['width'] / b['height']) - 1) * 100, 3)
                      for g, b in data['bodyCanvases'].items()}
            item.update(format=im.format, mode=im.mode, width=w, height=h,
                        aspectRatio=f'{w//d}:{h//d}', bytes=len(raw), sha256=sha,
                        hasAlpha='A' in im.getbands(),
                        transparentPercent=round(float((alpha < 16).mean()) * 100, 2),
                        visibleBBoxAlpha128=[int(xs.min()), int(ys.min()), int(xs.max()+1), int(ys.max()+1)],
                        cornerRGB=[rgba[y, x, :3].tolist() for x, y in [(0, 0), (w-1, 0), (0, h-1), (w-1, h-1)]],
                        canvasRatioErrorPercent=ratios,
                        canvasMatches=[g for g, error in ratios.items() if error < 2],
                        reviewNumber=len(unique)+1)
        unique.append(item)
    data.update(items=unique, duplicateFiles=duplicates,
                purpose='Source inventory for offline preparation. Catalog integration awaits Mục 1B approval.',
                count={'uniqueImages': len(unique), 'uniquePng': sum(i['format']=='PNG' for i in unique),
                       'uniqueJpg': sum(i['format']=='JPEG' for i in unique),
                       'physicalFiles': len(unique)+len(duplicates), 'duplicates': len(duplicates)})
    INVENTORY.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    count = data['count']
    lines = [f'# Kiểm kê {count["uniqueImages"]} ảnh nguồn hiện tại', '',
             'Ngày: 09/10/2026. Cập nhật sau khi người dùng bổ sung quần áo dài và hai ảnh tham chiếu ghép body.', '',
             f'{count["uniqueImages"]} ảnh khác nhau: {count["uniquePng"]} PNG có alpha và {count["uniqueJpg"]} JPG nền trắng. '
             'aodai.png đã được bỏ; nguồn áo dài hiện tại là aodai-fit-body2.png. Không còn bản trùng trong danh sách này.', '',
             'Danh sách chỉ tính ảnh trang phục/phụ kiện đã được cung cấp trực tiếp. Không tính body, ảnh liên hệ, ảnh kiểm tra hoặc các biến thể trong assets/body-fit.', '',
             '| # | File nguồn | Kích thước | Tỉ lệ | Nền | Tên đề xuất | Slot | Canvas gần body |',
             '| --- | --- | --- | --- | --- | --- | --- | --- |']
    for i in unique:
        gender = ', '.join({'female':'Nữ','male':'Nam'}[g] for g in i['canvasMatches']) or 'Cần đặt lên canvas'
        lines.append(f'| {i["reviewNumber"]} | [{Path(i["file"]).name}](D:/VietPhuc-DP-main/{i["file"]}) | {i["width"]}×{i["height"]} | {i["aspectRatio"]} | {"Trong suốt" if i["hasAlpha"] else "Trắng"} | {i["proposedName"]["vi"]} | `{i["proposedSlot"]}` | {gender} |')
    lines += ['', 'Đúng tỉ lệ canvas không chứng nhận fit và không xác lập quy tắc giới tính văn hóa. Body nam 118×308, body nữ 105×290.', '',
              '## Nhận xét nguồn', '']
    lines += [f'- **{Path(i["file"]).name}:** {i["preparationNotes"]}' for i in unique]
    lines += ['', '## Alpha nguồn', '', '| PNG | Alpha <16 | Bbox alpha >128 [x0,y0,x1,y1] |', '| --- | --- | --- |']
    lines += [f'| {Path(i["file"]).name} | {i["transparentPercent"]}% | {i["visibleBBoxAlpha128"]} |' for i in unique if i['hasAlpha']]
    lines += ['', 'Đo bằng Pillow và NumPy, SHA-256 lưu trong ASSET_INVENTORY_DRAFT.json. Không chỉnh sửa ảnh nguồn. '
              'Mọi nội dung văn hóa có sources: [] và needsVerification: true, chưa có nhận định lịch sử đã kiểm chứng.', '',
              'Cách chạy lại: `python tools/refresh_asset_inventory.py`. Kết quả căn ảnh và trạng thái từng body xem assets/clothing_manifest.json và assets/review sau khi chạy pipeline; inventory nguồn không phải catalog.', '']
    (ROOT / 'ASSET_INVENTORY.md').write_text('\n'.join(lines), encoding='utf-8')
    review = ROOT / 'ASSET_REVIEW.html'
    old = review.read_text(encoding='utf-8')
    style = old[old.index('<style>'):old.index('</style>')+len('</style>')]
    cards = []
    for i in unique:
        src, name = html.escape(i['file'], quote=True), html.escape(i['proposedName']['vi'])
        cards.append(f'<article><figure><a href="{src}"><img src="{src}" loading="lazy" alt="{name}"></a></figure><section><h2>{i["reviewNumber"]}. {name}</h2><code>{src}</code><p>{i["width"]}×{i["height"]} · slot {i["proposedSlot"]}</p><p class="note">{html.escape(i["preparationNotes"])}</p></section></article>')
    review.write_text('<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kiểm kê ảnh nguồn</title>'+style+
                     f'<main><h1>{len(unique)} ảnh nguồn trong assets</h1><p>Trang kiểm kê ảnh gốc, chưa tích hợp catalog. {count["uniquePng"]} PNG có alpha và {count["uniqueJpg"]} JPG nền trắng.</p><p>Áo dài hiện là aodai-fit-body2.png; đã thêm quan-aodai-fit-body2.png. Bấm ảnh để xem nguồn nguyên canvas. Cấu hình fit được lưu riêng, chỉ đổi kích thước và vị trí.</p>'+
                     '<div class="bodies"><figure><img src="assets/base_bodies/base_body_1.png" alt="Body nam"></figure><figure><img src="assets/base_bodies/base_body_2.png" alt="Body nữ"></figure></div><div class="grid">'+
                     '\n'.join(cards)+'</div><p>sources: [], needsVerification: true cho nội dung chưa có nguồn. Không gọi API.</p></main></html>\n', encoding='utf-8')
    print(json.dumps(count))


if __name__ == '__main__':
    refresh()
