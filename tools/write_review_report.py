"""Write review artifacts for the staged rules and 2D garment fits."""
from pathlib import Path
import json
import html
from PIL import Image, ImageDraw, ImageFont
from prepare_remix_assets import fit_canvas, body_composite

ROOT = Path(__file__).resolve().parents[1]


def main():
    rules = json.loads((ROOT/'viet-phuc-remix/data/outfit-rules.json').read_text(encoding='utf-8'))
    manifest = json.loads((ROOT/'assets/clothing_manifest.json').read_text(encoding='utf-8'))
    combos = [row for s in rules['outfitSets'] for row in s['combinations']]
    rows = ['# Quy tắc phối đồ — bản để duyệt', '',
            '7 bộ, 22 item rules, 9 tổ hợp tối thiểu; cả 9 tổ hợp cần kiểm chứng văn hóa. sources: [], needsVerification: true và TODO đã ghi rõ.', '',
            'Giới hỗ trợ dưới đây là phạm vi phối ảnh người dùng chọn, không phải kết luận lịch sử. Nam chỉ được chọn ngũ thân và giao lĩnh. Nữ dùng aonguthan_female, không dùng aonguthan_male.', '',
            '| Bộ | Body xem/phối | Slot bắt buộc | Món tối thiểu ở slot bottom | Tổ hợp cần kiểm chứng |',
            '| --- | --- | --- | --- | --- |']
    for s in rules['outfitSets']:
        bottom = next((r for r in s['requiredSlots'] if r['slot']=='bottom'), None)
        rows.append('| '+s['name']['vi']+' | '+', '.join({'male':'Nam','female':'Nữ'}[g] for g in s['supportedGenders'])+' | '+', '.join(r['slot'] for r in s['requiredSlots'])+' | '+', '.join(bottom['allowedItemIds'] if bottom else [])+' | '+str(len(s['combinations']))+' |')
    rows += ['', 'Áo dài cho phép dây lưng và nón lá tùy chọn theo yêu cầu; tứ thân dùng quần hoặc váy; bà ba yêu cầu nhóm quần đen/nâu trong preset. Những lựa chọn này chưa có nguồn lịch sử.', '',
             'Thứ tự lớp cố định: inner → bottom → outer → panels → belt → headwear → hair → hairAdornment → earrings → necklace → bracelet → handAccessory → footwear.', '',
             'Palette C2 chưa được cung cấp: mỗi bộ có palette tạm tối đa 4 màu, không đặt cặp màu cấm do suy đoán. Checker cảnh báo màu; body/slot/bối cảnh có thể chặn lựa chọn.', '',
             'Nguồn dữ liệu: viet-phuc-remix/data/outfit-rules.json. js/outfitRules.js kiểm tra thuần dữ liệu. js/bodyAvailabilityData.js là bản tạo tự động chỉ chứa giới hỗ trợ; chạy python tools/build_body_availability.py sau khi sửa JSON.', '',
             'Phần khóa áo theo body đã đưa vào app theo yêu cầu mới. Toàn bộ quy tắc phối/catalog ảnh vẫn chờ duyệt theo Mục 1B.', '']
    (ROOT/'OUTFIT_RULES_REVIEW.md').write_text('\n'.join(rows),encoding='utf-8')

    review = ROOT/'assets/review'
    by_id = {row['assetId']:row for row in manifest['items']}
    ao, trousers, baba = (by_id[k] for k in ['aodai-fit-body2','quan-aodai-fit-body2','aobaba'])
    def fitted(item):
        return fit_canvas(Image.open(ROOT/item['cutoutFile']).convert('RGBA'),item['fit']['female'],(105,290),resolution=4)
    ao_layer, pants_layer = fitted(ao), fitted(trousers)
    outfit = pants_layer.copy()
    outfit.alpha_composite(ao_layer)
    combo = body_composite(outfit,'female',occlusion=ao['fit']['female'].get('bodyOcclusionPolygons'))
    combo.save(review/'ao-dai-with-new-trousers.png')
    panels = [('Áo dài tham chiếu',Image.open(review/'reference-aodai-original.png')),
              ('Áo dài căn vị trí',Image.open(review/'female/aodai-fit-body2.png')),
              ('Áo dài + quần mới',combo),
              ('Bà ba tham chiếu',Image.open(review/'reference-baba-original.png')),
              ('Bà ba căn vị trí',Image.open(review/'female/aobaba.png'))]
    sheet = Image.new('RGB',(1500,925),'#eee9e2')
    draw = ImageDraw.Draw(sheet)
    try: font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',18)
    except OSError: font=ImageFont.load_default()
    for index,(label,img) in enumerate(panels):
        tile = img.convert('RGBA')
        tile.thumbnail((282,850),Image.Resampling.LANCZOS)
        sheet.paste(tile,(300*index+(300-tile.width)//2,52),tile)
        draw.text((300*index+12,14),label,font=font,fill='#302820')
    draw.text((12,898),'Bản căn thử: giữ nguyên tỉ lệ mảnh đồ. Chưa chứng nhận sai số fit 1–2%.',font=font,fill='#302820')
    sheet.save(review/'reference-fit-comparison.jpg',quality=90,optimize=True)

    fit_rows = ['# Căn ảnh 2D — kết quả để duyệt', '',
                '15 ảnh nguồn → 15 cutout, 15 thumbnail và 30 lớp QA trên hai canvas body. 15 món vẫn draft, 0 fit đã chứng nhận 1–2%. Chưa đăng ký các lớp này vào catalog.', '',
                'Chỉ dùng scale đồng đều và tịnh tiến; xoay 0°. Không kéo riêng gấu/tay/vai. Ảnh và body nguồn giữ nguyên SHA-256.', '',
                'Hai ảnh tham chiếu gốc được giữ trong assets/review. Bảng so sánh: [reference-fit-comparison.jpg](D:/VietPhuc-DP-main/assets/review/reference-fit-comparison.jpg).', '',
                'Quần áo dài mới: cạp nguồn y579 → eo body y115, gấu y1895 → y263 bằng cùng một scale. Các mốc này là cấu hình đặt ảnh, không phải phép kiểm chứng độc lập.', '',
                '| Ảnh | Body được phép chọn | Fit nam | Fit nữ | Sai lệch lớn nhất ở mốc đã đo, % cao body |',
                '| --- | --- | --- | --- | --- |']
    cards=[]
    for item in manifest['items']:
        metrics=[]
        for gender,fit in item['fit'].items():
            vals=[m['errorHeightPercent'] for m in fit['landmarkResiduals'] if m['errorHeightPercent'] is not None]
            if vals: metrics.append(('Nam' if gender=='male' else 'Nữ')+': '+str(round(max(vals),2))+'%')
        fit_rows.append('| '+item['assetId']+' | '+', '.join({'male':'Nam','female':'Nữ'}[g] for g in item['allowedGenders'])+' | '+item['fit']['male']['status']+' | '+item['fit']['female']['status']+' | '+('; '.join(metrics) or 'Chưa đo độc lập')+' |')
        escaped=html.escape(item['name']['vi'])
        variants=''.join('<figure><img loading="lazy" src="assets/review/'+g+'/'+item['assetId']+'.png" alt="'+escaped+' trên body '+g+'"><figcaption>'+('Nam' if g=='male' else 'Nữ')+' — '+('draft' if g in item['allowedGenders'] else 'QA, bị khóa theo yêu cầu')+'</figcaption></figure>' for g in ['male','female'])
        cards.append('<article><h2>'+escaped+'</h2><div class="pair">'+variants+'</div></article>')
    fit_rows += ['', 'Sai số đọc mốc từ ảnh nguồn khoảng 2–4 pixel native; mốc chưa đo được ghi null. Một phép căn có residual thấp chưa chứng nhận toàn bộ silhouette, cổ tay hay bàn tay đã khớp.', '',
                 'Ảnh tham chiếu và mảnh PNG áo dài/bà ba có các chi tiết chỉ khớp ở một phần vùng ảnh; cách căn scale/offset đã được lưu nhưng vẫn có vùng vai/tay cần duyệt. Không ép ảnh bằng warp để tạo kết quả đạt giả.', '',
                 'JPG nón được tách nền bằng flood fill có seed cho lỗ quai kín, không xóa toàn bộ pixel trắng. PNG màu trắng ngà được giữ vùng vải sáng.', '',
                 'Mặt/tay/độ nét của body giữ từ PNG 105×290 hoặc 118×308 hiện có; zoom lớn không tăng chi tiết thật. Mask tay trước áo chỉ là bản thử để duyệt, chưa đưa vào app.', '',
                 'Lệnh tái tạo: python tools/prepare_remix_assets.py; python tools/write_review_report.py. Test: python -m unittest discover -s tests -p test_asset_preparation.py -v.', '']
    (ROOT/'ASSET_FIT_REVIEW.md').write_text('\n'.join(fit_rows),encoding='utf-8')
    page='<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Duyệt căn ảnh 2D</title><style>body{font:15px/1.6 system-ui;background:#eee9e2;color:#302820;margin:24px auto;padding:0 20px;max-width:1250px}img{max-width:100%;display:block;margin:auto}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:16px}article{background:white;padding:16px;border-radius:12px}h2{font-size:16px}.pair{display:flex;gap:12px}figure{margin:0;width:50%}figure img{height:350px;object-fit:contain}figcaption{font-size:12px}.comparison{width:100%;margin:24px 0}</style><h1>Căn ảnh trên body — bản để duyệt</h1><p>15 ảnh, 30 lớp QA. Chỉ scale và đổi vị trí. Body nam chỉ chọn ngũ thân nam hoặc giao lĩnh; nữ dùng bản ngũ thân nữ. Các ảnh vẫn draft, chưa đưa vào catalog.</p><img class="comparison" src="assets/review/reference-fit-comparison.jpg" alt="Đối chiếu hai ảnh tham chiếu với bản căn thử"><div class="grid">'+''.join(cards)+'</div><p>Chưa chứng nhận sai số 1–2%; sources: [], needsVerification: true. Ảnh gốc được giữ nguyên.</p></html>'
    (ROOT/'ASSET_FIT_REVIEW.html').write_text(page,encoding='utf-8')
    print('Wrote OUTFIT_RULES_REVIEW.md, ASSET_FIT_REVIEW.md/html and reference-fit-comparison.jpg')


if __name__=='__main__':main()
