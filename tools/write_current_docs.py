"""Document the current mapping build; retain prior fit experiments as archives."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
inventory=json.loads((ROOT/'assets/web/source-inventory.json').read_text(encoding='utf-8'))['items']
photos=json.loads((ROOT/'assets/web/photo-catalog.json').read_text(encoding='utf-8'))['items']
rulesFile=ROOT/'viet-phuc-remix/data/outfit-rules.json'
rules=json.loads(rulesFile.read_text(encoding='utf-8'))
template=rules['assetGenderPolicy'][0]
rules['assetGenderPolicy']=[{**template,'sourceFile':item['file'],
 'supportedGenders':['male'] if Path(item['file']).stem.endswith('_male') else ['female'],
 'origin':'user-mapping-scope-2026-10-10'} for item in inventory]
rules['verificationTodo']='TODO: bổ sung nguồn văn hóa. App hiện mapping ảnh hoàn chỉnh theo yêu cầu người dùng 10/10/2026; mở rộng tổ hợp sau.'
rulesFile.write_text(json.dumps(rules,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

lines=['# Kiểm kê ảnh hiện tại — 10/10/2026','',
 'Thư mục thực tế là `assets` (không có thư mục `asset`). 21 ảnh trang phục/phụ kiện nguồn tại root assets; không tính body, body-fit hoặc các ảnh QA.', '',
 'App dùng **10 ảnh hoàn chỉnh**, mapping cho **7 nhóm nữ + 2 nhóm nam**, có thêm biến thể áo dài/nón lá. Những mảnh riêng và mẫu còn lại được giữ cho lần nâng cấp sau. Không gọi API hoặc sinh trang phục mới.', '',
 'Chỉ giảm kích thước đồng đều và nén WebP: tổng 401.838 byte cho 10 ảnh. Không tách nền, kéo méo, ghép thêm body hoặc làm lại tay. Ảnh gốc và nền gốc được giữ nguyên. Hash nguồn lưu tại `assets/web/source-inventory.json`.', '',
 '## Mapping đang dùng', '', '| Bộ | Body | Phụ kiện có trong mapping | Ảnh nguồn |', '| --- | --- | --- | --- |']
for p in photos:lines.append(f'| {p["name"]} | {p["gender"]} | {", ".join(p["accessories"]) or "Mẫu mặc định"} | [{Path(p["sourceFile"]).name}](D:/VietPhuc-DP-main/{p["sourceFile"]}) |')
lines+=['','## Tất cả nguồn hiện tại','','| File | Kích thước | Chế độ ảnh | Trạng thái |','| --- | --- | --- | --- |']
for i in inventory:lines.append(f'| [{Path(i["file"]).name}](D:/VietPhuc-DP-main/{i["file"]}) | {i["width"]}×{i["height"]} | {i["mode"]} | {i["status"]} |')
lines+=['','Các tên/bối cảnh văn hóa có `sources: []`, `needsVerification: true` và TODO. Ảnh đẹp và chính sách giới không xác lập tính chính xác lịch sử.', '',
 'Các tài liệu/lớp fit 09/10 và ASSET_INVENTORY_DRAFT.json là snapshot thử nghiệm cũ, không được app mapping nạp. Dùng `python tools/build_photo_catalog.py` để cập nhật mapping; không chạy lại pipeline fit cũ với các ảnh đã được người dùng thay thế.','']
(ROOT/'ASSET_INVENTORY.md').write_text('\n'.join(lines),encoding='utf-8')
cards=''.join('<article><img src="'+p['file']+'" alt="'+p['name']+'"><h2>'+p['name']+'</h2><p>'+p['gender']+' · '+p['sourceFile']+'</p></article>' for p in photos)
(ROOT/'ASSET_REVIEW.html').write_text('<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mapping ảnh hiện tại</title><style>body{font:16px system-ui;background:#f2ebe0;padding:24px;color:#302826}main{max-width:1300px;margin:auto}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:16px}article{background:white;padding:14px;border-radius:14px}img{width:100%;height:450px;object-fit:contain}h2{font-size:18px}p{line-height:1.6;overflow-wrap:anywhere}</style><main><h1>10 ảnh mapping · 21 nguồn hiện tại</h1><p>Giữ nguyên ảnh mặc sẵn. Không API, không 3D, không sinh ảnh. Nam chỉ có ngũ thân nam và giao lĩnh nam; nữ dùng bản ngũ thân nữ.</p><div class="grid">'+cards+'</div><p>Tổ hợp chưa có ảnh dùng mẫu hoàn chỉnh gần nhất. Nội dung văn hóa: nguồn chờ bổ sung, cần xác minh.</p></main></html>',encoding='utf-8')

for name in ('ASSET_INVENTORY_DRAFT.json','assets/clothing_manifest.json'):
 path=ROOT/name;data=json.loads(path.read_text(encoding='utf-8'))
 data['archiveStatus']='superseded-by-complete-photo-mapping-2026-10-10'
 data['supersededBy']='assets/web/photo-catalog.json'
 path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

for name in ('ASSET_FIT_REVIEW.md','OUTFIT_RULES_REVIEW.md'):
 path=ROOT/name;old=path.read_text(encoding='utf-8')
 marker='> Cập nhật 10/10/2026:'
 if marker not in old:
  path.write_text(marker+' app đã chuyển sang mapping ảnh hoàn chỉnh theo yêu cầu mới. Quy tắc giới và phụ kiện được dùng; ghép mảnh, palette và tổ hợp mở rộng để nâng cấp sau. Nội dung bên dưới là bản duyệt/thử nghiệm 09/10; xem ASSET_INVENTORY.md và IMPLEMENTATION_REPORT.md cho trạng thái hiện tại.\n\n'+old,encoding='utf-8')
path=ROOT/'ASSET_FIT_REVIEW.html';old=path.read_text(encoding='utf-8')
note='<p style="padding:20px;background:#ffedc0;color:#302826">Bản thử nghiệm fit 09/10 đã lưu trữ. App hiện mapping ảnh hoàn chỉnh, không dùng các lớp fit này. <a href="ASSET_REVIEW.html">Xem mapping hiện tại</a>.</p>'
if 'Bản thử nghiệm fit 09/10 đã lưu trữ.' not in old:path.write_text(old.replace('<main>','<main>'+note,1),encoding='utf-8')

# Remove only derivatives created earlier in this same turn, before the user
# clarified complete-photo mapping. Never remove supplied source images.
web=(ROOT/'assets/web').resolve()
for gender,id in [(p['gender'],p['costumeId']) for p in photos if not p['accessories']]:
 for suffix in ('.png','-color-mask.png'):
  path=(web/(gender+'-'+id+suffix)).resolve()
  if path.parent!=web:raise ValueError('Cleanup target escaped assets/web')
  if path.exists():path.unlink()
unused=ROOT/'viet-phuc-remix/js/photoCatalog.js'
if unused.exists():unused.unlink()
print('Current inventory, source gender policy, review page and archive labels updated. Supplied originals unchanged.')
