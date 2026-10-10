# Việt phục Remix

Bản web hiện tại dùng **mapping ảnh 2D hoàn chỉnh** từ ảnh người dùng cung cấp. Không sinh ảnh, không gọi API ảnh và không dùng 3D trong luồng app.

## Chạy app

Từ `D:/VietPhuc-DP-main`, chạy:

```powershell
python -m http.server 8067 --bind 127.0.0.1
```

Mở **http://127.0.0.1:8067/viet-phuc-remix/**. Cần phục vụ toàn bộ thư mục dự án vì ảnh nằm trong `assets/`. Không mở HTML trực tiếp bằng `file://`.

`index.html` tại root là bản React cũ được giữ nguyên. Điểm vào bản Remix đang hoàn thiện là **`viet-phuc-remix/index.html`**, dùng HTML/CSS/JavaScript thuần và ES modules, không cần build hoặc cài npm.

## Đã có

- 21 ảnh nguồn trong `assets/`; 10 ảnh WebP tối ưu từ các ảnh mặc hoàn chỉnh, tổng khoảng 402 KB.
- Nữ: 7 nhóm trang phục. Nam: chỉ ngũ thân nam và giao lĩnh nam; các áo khác disabled và handler/restore/link cũng chặn.
- Áo dài với nón lá dùng `aodai2.png`; mẫu mặc định dùng `aodai1.png`. Các bộ khác dùng ảnh hoàn chỉnh tương ứng.
- Tổ hợp phụ kiện chưa có ảnh dùng mẫu hoàn chỉnh gần nhất và hiển thị thông báo. Quy tắc khóa phụ kiện lấy từ JSON, bao gồm xung đột cùng vị trí.
- Màu và phong cách là ghi chú cho lookbook, **không đổi màu/chất liệu ảnh**. Các công cụ tạo prompt, nhập mảnh và chỉnh chất liệu cũ đã ẩn khỏi luồng mapping.
- VI/EN, lưu/mở lại ảnh PNG, so sánh tối đa 3 mẫu, xuất PNG 960×1240, xuất lookbook HTML có ảnh và chia sẻ cấu hình bằng URL.
- Nếu ảnh bị thiếu/lỗi, dùng ảnh hoàn chỉnh khác; nếu toàn bộ ảnh không tải được, dùng minh họa SVG 2D.

Lookbook và ngôn ngữ lưu trong trình duyệt. Khi bộ nhớ không khả dụng, app giữ lookbook trong phiên và báo để người dùng xuất file. Link chia sẻ chứa lựa chọn, không chứa ảnh riêng đã nhập; link localhost chỉ mở được trên máy chạy server. Khi đưa app lên hosting tĩnh, link dùng địa chỉ hosting đó.

**Chưa hoàn tất toàn bộ Mục 1–8.** Đã hoàn tất Mục 4 về VI/EN; xem [PHASE_STATUS.md](PHASE_STATUS.md) để biết phần còn thiếu của so sánh, chia sẻ và bàn giao. Ghép mảnh/đổi màu ảnh được hoãn theo phạm vi mapping mới.

## Đổi ngôn ngữ

Nút EN/VI ở header đổi ngôn ngữ và giữ nguyên lựa chọn, ảnh đã lưu và ảnh so sánh. Lần đầu app dùng EN nếu trình duyệt dùng tiếng Anh, còn lại fallback VI; lựa chọn được lưu và ưu tiên ở lần mở tiếp theo. Nếu storage bị chặn, nút vẫn hoạt động trong phiên.

Thêm/sửa nhãn tại `viet-phuc-remix/js/locales.js`: mỗi khóa có `vi` và `en`, tham số `{name}` phải tương ứng. HTML tĩnh dùng `data-i18n`, JavaScript dùng `VietPhucLocale.t(key, params)` hoặc `label(kind, id)`; tên theo ID giúp đổi ngôn ngữ cả Lookbook cũ. Đọc [PHASE4_I18N_REPORT.md](PHASE4_I18N_REPORT.md) để biết file và kiểm thử của Mục 4.

## Cập nhật ảnh sau này

1. Thêm ảnh hoàn chỉnh vào `assets/`.
2. Khai báo mapping ở `LOOKS` trong `tools/build_photo_catalog.py`.
3. Chạy `python tools/build_photo_catalog.py` và kiểm tra `ASSET_REVIEW.html`.

Chỉ resize đồng đều và nén WebP, giữ nguyên ảnh nguồn, nền và hình dáng trang phục. Các ảnh từng mảnh/base body được giữ để nâng cấp sau. `assets/prepared`, `garment_fits.json`, `clothing_manifest.json` và các báo cáo fit 09/10 là thử nghiệm cũ, không được luồng mapping nạp.

Quy tắc chọn ở `viet-phuc-remix/data/outfit-rules.json`. Sau khi đổi giới/phụ kiện, chạy `python tools/build_body_availability.py` để tạo bundle cho classic script. Các tổ hợp mở rộng và checker đầy đủ được giữ trong dữ liệu cho giai đoạn nâng cấp, chưa dùng để khẳng định phục dựng.

## Văn hóa và điểm màu

Nội dung văn hóa có `sources: []`, `needsVerification: true` và chỗ chờ bổ sung nguồn. App không công bố các nhận định lịch sử chưa xác minh, không tự chấm phần trăm tôn trọng văn hóa. Các bản nháp biên tập cũ vẫn ở `data.js` để đối chiếu sau.

Điểm bảng màu là chỉ số demo: 90 nếu màu ghi chú nằm trong bảng sự kiện hiện có, 70 nếu phối tự do. Đây không phải đánh giá màu của ảnh hay tiêu chuẩn văn hóa.

## Kiểm tra

```powershell
python tools/build_body_availability.py --check
python -m unittest discover -s tests -p test_asset_preparation.py -v
python -m unittest discover -s tests -p test_photo_mapping_assets.py -v
```

Từ `viet-phuc-remix/`:

```powershell
node --test tests/*.test.mjs
```

Kiểm thử Chrome desktop/điện thoại nằm ở `tools/verify_web.mjs` và `tools/verify_locale.mjs`, cần Playwright và Chrome. Chạy tuần tự khi server đang mở; có thể truyền đường dẫn package Playwright làm tham số nếu dùng thư viện có sẵn trong môi trường. Kết quả và ảnh chụp nằm trong `assets/review/browser/`. Đây là kiểm thử headless với viewport mobile, chưa thay cho kiểm thử trên điện thoại vật lý.

Xem `IMPLEMENTATION_REPORT.md` và `ASSET_INVENTORY.md` để biết dữ liệu, file đổi và giới hạn hiện tại.
