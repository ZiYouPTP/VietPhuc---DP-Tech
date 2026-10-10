> Trạng thái mới nhất 10/10/2026: đã hoàn thiện bản mapping ảnh theo yêu cầu mới. Xem [báo cáo hiện tại](D:/VietPhuc-DP-main/MAPPING_IMPLEMENTATION_REPORT.md). Nội dung bên dưới là lịch sử thử nghiệm 09/10, không phải trạng thái runtime mới.

# Báo cáo hoàn thiện Việt phục Remix

## Cập nhật hiện tại — 09/10/2026

**Đã đưa khóa trang phục theo body vào app:** chọn nam chỉ mở áo ngũ thân và áo giao lĩnh; năm áo còn lại tối màu và disabled. Đổi từ áo nữ sang nam tự chọn ngũ thân. Nữ dùng biến thể `aonguthan_female`, không dùng `aonguthan_male`. Đây là phạm vi phối ảnh người dùng chọn, không phải kết luận lịch sử.

Khóa được kiểm tra ở pill, nút Phối đồ trong catalog/modal, gợi ý sự kiện, handler gọi trực tiếp, selector lớp PNG, Studio restore và khôi phục Lookbook. Snapshot nam cũ có áo không hợp lệ không mở lại được. App và Studio đồng bộ giới, id áo và metadata khi xuất. Phạm vi hai trang phục là áo chính; phụ kiện tiếp tục dùng quy tắc đang chạy.

**Mục 1B đã có bản dữ liệu để duyệt:** 7 bộ, 22 item rules, 9 tổ hợp tối thiểu. Cả 9 tổ hợp có `sources: []`, `needsVerification: true`, `status: needsVerification` và TODO. Áo dài cho dây lưng/nón lá tùy chọn theo brief; tứ thân có váy/quần; bà ba có nhóm quần đen/nâu. Palette C2 chưa được cung cấp, nên palette tối đa 4 màu chỉ là nháp; không tự thêm cặp màu cấm lịch sử. Xem [bảng duyệt](D:/VietPhuc-DP-main/OUTFIT_RULES_REVIEW.md).

Quy tắc nguồn ở `viet-phuc-remix/data/outfit-rules.json`. Bundle giới `js/bodyAvailabilityData.js` được tạo từ JSON để classic-script đọc trực tiếp, không cần fetch/API. Chỉ phần giới đã được áp dụng theo yêu cầu mới; chưa thay toàn bộ quy tắc phụ kiện đang chạy bằng checker mới.

**Mục 2 đã chuẩn bị ảnh, chưa hoàn thành tích hợp:** hiện 15 ảnh nguồn khác nhau, 12 PNG và 3 JPG. `aodai.png` đã bỏ; canonical là `aodai-fit-body2.png`. Đã thêm `quan-aodai-fit-body2.png`, không còn bản trùng trong inventory. Không tính body, ảnh kiểm tra hoặc biến thể cũ trong `assets/body-fit` vào số 15.

Pipeline tạo 15 cutout, 15 thumbnail, 30 lớp trên canvas nam 118×308/nữ 105×290 và bảng QA. JPG tách nền bằng flood fill; lỗ trắng kín trong quai nón có seed riêng, không xóa vùng vải trắng. Chỉ dùng scale đồng đều và tịnh tiến, xoay 0°, không kéo riêng vai/tay/gấu. Cạp quần mới y579 nguồn → y115 body, gấu y1895 → y263. Giữ nguyên SHA-256 toàn bộ ảnh và body nguồn.

**15 món vẫn draft, 0 fit được chứng nhận đạt 1–2%.** Đã xuất [bảng đối chiếu ảnh mẫu](D:/VietPhuc-DP-main/assets/review/reference-fit-comparison.jpg) và [trang duyệt căn ảnh](D:/VietPhuc-DP-main/ASSET_FIT_REVIEW.html). Có vùng vai/cổ tay/mask bàn tay còn cần duyệt; mốc đọc có độ bất định khoảng 2–4 pixel native. Test cấu hình đặt ảnh không thay thế kiểm chứng silhouette. Các lớp draft chưa được app/catalog nạp; app tiếp tục có SVG dự phòng.

### Test đã chạy

Từ `D:/VietPhuc-DP-main/viet-phuc-remix`:

```powershell
node --test tests/body-compositor.test.mjs tests/studio-binding.test.mjs tests/compatibility.test.mjs tests/body-material.test.mjs tests/garment-generator.test.mjs tests/outfit-rules.test.mjs tests/gender-selection.test.mjs
```

**PASS 7/7 file, fail 0, skipped 0**, khoảng 1,81 giây lượt cuối. Năm test thuộc 2D/rules; hai test module 3D cũ được giữ để regression, không được runtime 2D import.

Test mới `gender-selection.test.mjs` chạy app và Studio thật cùng một VM: đổi giới, chặn năm áo qua các handler, chọn từng áo nam hợp lệ, restore sai/hợp lệ và đối chiếu body/id của PNG xuất với metadata. Test cũ đổi fixture nam áo dài/Nhật Bình sang áo hợp lệ hoặc case bị chặn vì chính sách giới đã thay đổi; không xóa test để làm qua.

Từ root:

```powershell
python -m unittest discover -s tests -p test_asset_preparation.py -v
python tools/build_body_availability.py --check
```

**PASS 13/13 test ảnh:** giữ vải trắng/lỗ quai có seed, alpha speck, scale đồng đều/offset, từ chối warp/xoay, 15 hash nguồn, 30 canvas/alpha, draft không thành supported, chính xác hai nguồn nam, cạp/gấu quần mới và residual không bị coi là chứng nhận fit. Bundle giới **khớp JSON: PASS**.

Chưa kiểm tra trực tiếp Chrome/console/mobile trong lượt này: browser automation không khởi tạo được kernel. Không tuyên bố đã đo load <3s, Lighthouse hoặc console sạch. Khi trình duyệt khả dụng, cần thử nữ→nam từ áo dài; kiểm tra đúng hai áo mở; chọn giao lĩnh; mở Lookbook nam cũ; nam→nữ; xuất PNG và kiểm tra tên/body.

### File đổi, lý do và kiểm chứng

| File / nhóm | Thay đổi / lý do | Kiểm chứng |
| --- | --- | --- |
| viet-phuc-remix/data/outfit-rules.json | Nguồn bộ phối, provenance, slot/layer/màu/bối cảnh và giới | Schema/checker tests |
| viet-phuc-remix/js/outfitRules.js | Checker thuần dữ liệu, chưa nối toàn bộ vào catalog | Slot/order/provenance/body/context/màu |
| viet-phuc-remix/js/bodyAvailabilityData.js | Bundle giới tạo từ JSON | Build --check |
| viet-phuc-remix/js/compatibility.js | Availability/sanitize áo theo body; fallback khi bundle mất | Selection/restore/unknown id |
| viet-phuc-remix/app.js | Khóa lựa chọn, đồng bộ giới, lọc gợi ý, chặn Lookbook sai | App + Studio integration |
| viet-phuc-remix/js/studio.js | Sanitize áo/body, khóa lớp PNG sai giới, đồng bộ restore | Binding + integration |
| viet-phuc-remix/index.html, style.css | Nạp bundle, nhãn giải thích, nút tối màu | Markup assertions; browser còn chờ |
| viet-phuc-remix/tests/gender-selection.test.mjs, outfit-rules.test.mjs, studio-binding.test.mjs, compatibility.test.mjs | Regression hành vi mới và fixture hợp lệ | PASS |
| assets/garment_fits.json | Scale/offset ngoài component, không warp | Uniform-fit tests + xem QA |
| tools/prepare_remix_assets.py | Tách nền/căn lớp/manifest/QA offline | 13 test + nguồn giữ nguyên |
| assets/clothing_manifest.json, assets/prepared, assets/review | Manifest/lớp draft và ảnh đối chiếu | Canvas/alpha/hash/provenance |
| tests/test_asset_preparation.py | Regression xử lý ảnh, geometry, draft và giới | PASS 13/13 |
| tools/refresh_asset_inventory.py | Kiểm kê sau đổi tên/thêm quần | 15 nguồn, hash khớp |
| tools/build_body_availability.py, apply_preview_gender_policy.py | Tạo bundle từ JSON, lưu chính sách người dùng | Bundle check + schema |
| tools/write_review_report.py | Bảng duyệt và ảnh đối chiếu | Đã xem ảnh, đường dẫn tồn tại |
| ASSET_INVENTORY_DRAFT.json, ASSET_INVENTORY.md, ASSET_REVIEW.html | 15 nguồn hiện tại | File/size/alpha/hash |
| OUTFIT_RULES_REVIEW.md, ASSET_FIT_REVIEW.md/html, IMPLEMENTATION_REPORT.md | Báo cáo trạng thái và giới hạn | Đối chiếu runner/manifest |

### Trạng thái hiện tại

| Mục | Trạng thái | Phần còn lại |
| --- | --- | --- |
| 1 | Đạt | Regression PASS |
| 1B | Dữ liệu/checker đạt, chờ duyệt tích hợp đầy đủ | 7 bộ/9 tổ hợp, palette C2/nguồn còn TODO |
| 2 | Đạt một phần | 30 lớp draft; cần duyệt/căn fit trước khi đưa ảnh vào catalog |
| 3 | Chưa làm | Đổi màu ảnh/cache |
| 4 | Chưa làm | VI/EN toàn bộ |
| 5 | Chưa làm | So sánh 3 look |
| 6 | Chưa làm | Chia sẻ URL hash |
| 7 | Đạt một phần | Test PASS; browser/console/mobile/Lighthouse chưa đo |
| 8 | Chưa làm | README/dọn dẹp/audit cuối |

Điểm dừng trong Mục 1B của tài liệu người dùng: “DỪNG chờ tôi xác nhận trước khi tích hợp vào catalog.” Bản dữ liệu và ảnh đối chiếu đã có để duyệt. Phần khóa giới vừa được yêu cầu rõ đã hoàn thành riêng. Chưa đưa ảnh draft vào app hoặc chuyển sang Mục 3–8.

---

## Lịch sử lượt kiểm kê trước — số liệu bên dưới đã được thay bằng cập nhật 15 ảnh ở trên

Ngày: 09/10/2026. **Lượt kiểm tra lại sau khi người dùng chuyển và sửa ảnh trong assets.**

Phạm vi người dùng đã chọn rõ: **chạy lại Mục 1 và Mục 2 bước 1 (test + kiểm kê), rồi dừng để duyệt**. Không tách nền, căn fit hoặc tích hợp ảnh trong lượt này.

## Mục 1 — Kiểm tra lại bộ test: ĐẠT

Bản sửa harness trước đó vẫn đúng: `viet-phuc-remix/tests/studio-binding.test.mjs` import `mergeLookLayers` thực từ `js/lookLayers.js` và đưa dependency vào context VM. Giữ assertion cũ và regression kiểm tra ưu tiên PNG snapshot, lọc lớp sai body/không còn chọn, giữ lớp sau đổi màu/phụ kiện/body. Không cần sửa thêm code hoặc mock để làm test qua trong lượt này.

Chạy từ `D:/VietPhuc-DP-main/viet-phuc-remix`:

```powershell
node --test tests/body-compositor.test.mjs tests/studio-binding.test.mjs tests/compatibility.test.mjs tests/body-material.test.mjs tests/garment-generator.test.mjs
```

Kết quả lần cuối sau khi cập nhật còn14 ảnh: **exit code 0, pass 5, fail 0, skipped 0**, khoảng 1,34 giây theo test runner.

| Test | Kết quả | Phạm vi |
| --- | --- | --- |
| body-compositor | PASS | Bảy áo, hai body PNG, prompt riêng, khung nhập ảnh, PNG thay SVG, fallback lưu trong phiên |
| studio-binding | PASS | Chọn body, snapshot, giữ/loại lớp ảnh phù hợp, prompt và restore; không nạp viewer Three |
| compatibility | PASS | Phụ kiện bị khóa, handler không bypass, chuyển áo, Lookbook được chuẩn hóa |
| body-material | PASS | Test module 3D cũ, không thuộc runtime 2D |
| garment-generator | PASS | Test module 3D cũ, không thuộc runtime 2D |

**3/3 bộ test 2D đạt; tổng5/5 file test hiện có đạt.** Không xóa test, không phát triển3D. Đây là test Node, chưa thay thế kiểm thử browser/console/PNG thực tế ở Mục 7.

## Mục 2 bước 1 — Kiểm kê lại: ĐẠT, CHỜ DUYỆT

- Đọc và xem 14 ảnh khác nhau hiện có: **11 PNG RGBA có alpha, 3 JPG RGB nền trắng**.
- Có thêm đường dẫn `aodai-fit-body2.png` trong lúc kiểm tra cuối; hash SHA-256 trùng `aodai.png`. Hiện là 15 file / 14 ảnh khác nhau; đã ghi riêng file trùng và giữ nguyên, không tạo thêm món catalog.
- Không tính hai body, mockup cũ hoặc fixture vào số14.
- `aodai.png` thay bản JPG trước: áo riêng, tay đã gập, không còn mannequin/quần. `aoyiem.jpg` đã bỏ, ưu tiênPNG.
- Có hai bản ngũ thân theo canvas nam/nữ, thêm quần bà ba, váy đụp và guốc mộc. Không tìm thấy file quạt riêng trong assets.
- Đo size/ratio/alpha/bbox rõ và hash SHA-256 bằng Pillow. Nhận xét trực quan ghi trong `ASSET_INVENTORY.md`; mọi item có `status: draft`, `sources: []`, `needsVerification: true`, chưa được runtime nạp.
- Canvas giao lĩnh/ngũ thân nam gần tỉ lệ nam; phần lớnPNG khác gần nữ; váy vẫncanvas vuông. Tỉ lệ gần không xác nhậnfit hoặc quy tắc giới tính văn hóa.
- Yếm/quần/guốc cần căn vị trí hoặc kích thước; nhiềuPNG còn viền trắng/đỏ. BaJPG cần tách nền. Chưa đo sai số vai/eo/gấu 1–2%, chưa tuyên bố lớp nàofit đạt.

Validation cuối: **PASS**. Danh sách 14 ảnh khác nhau và một bản trùng khớp tất cả đường dẫn hiện có; kích thước, alpha và hash khớp file gốc; mọi item draft/chưa xác minh. Trang duyệt có 14 ảnh và hai body với đường dẫn hợp lệ.

## File thay đổi, lý do và kiểm chứng

| File | Thay đổi / lý do | Kiểm chứng |
| --- | --- | --- |
| ASSET_INVENTORY_DRAFT.json | Thay10 đường dẫn cũ bằng14 file thực tế, thông số, tênVI/EN và slot dự kiến | JSON đọc được, danh sách/size/hash khớp file thực, alpha và số lượng khớp |
| ASSET_INVENTORY.md | Cập nhật bảng và nhận xét theo ảnh đã sửa, bỏ kết luận cũ về pose đối xứng | Xem ảnh gốc, đối chiếu đo pixel/bbox; không nhận xét fit như test đã qua |
| ASSET_REVIEW.html | Trang xem nguyên canvas14 ảnh để duyệt, không thuộc app | Đườngdẫnảnh/2body tồn tại; không chứa requestAPI hoặc nối vào runtime |
| IMPLEMENTATION_REPORT.md | Ghi phạm vi, test và trạng thái mới | Đối chiếu test runner và inventory validation |

Không chỉnh sửa ảnh người dùng, body hoặc runtime app trong lượt này. `PHASE0_AUDIT.md` giữ làm lịch sử kiểm toán; cập nhật cuối thuộc Mục 8 sau khi hoàn thành các bước sau.

## Trạng thái Mục 1–8

| Mục | Trạng thái | Lý do |
| --- | --- | --- |
| 1 | Đạt | 5/5 test hiện có PASS |
| 2 | Đạt một phần | Bước1 kiểm kê14 ảnh xong; dừng chờ duyệt theo phạm vi người dùng chọn |
| 3 | Chưa làm | Chưa đến bước đổi màu ảnh |
| 4 | Chưa làm | Chưa đến bước VI/EN toàn bộ |
| 5 | Chưa làm | Chưa đến bước so sánh |
| 6 | Chưa làm | Chưa đến bước link chia sẻ |
| 7 | Đạt một phần | Test Node hiện có PASS; chưa test tính năng2–6 mới/browser/mobile/Lighthouse |
| 8 | Chưa làm | Chưa đến bàn giao cuối |

Việc người dùng cần làm lúc này: duyệt/sửa tên và slot trong bảng14 ảnh. Nguồn văn hóa vẫnTODO. Chưa bắt người dùng chụp lại; sau kiểm tra fit mới xác định có cần sửa nguồn thêm không.
