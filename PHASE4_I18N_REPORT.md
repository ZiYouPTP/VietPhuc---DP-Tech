# Mục 4 — VI/EN cho web mapping

Ngày 10/10/2026. Kết quả: hoàn tất chuyển ngôn ngữ cho luồng mapping hiện tại, giữ stack và ảnh hiện có. Dừng tại Mục 4, chưa triển khai phần còn thiếu của Mục 5–6.

## Thay đổi và lý do

- Thay bộ dịch dò/thay văn bản DOM bằng catalog 310 khóa VI/EN và hàm dịch theo khóa/tham số. UI tĩnh có thuộc tính `data-i18n`; phần động lấy nhãn từ cùng catalog theo ID. Tránh bỏ sót lý do khóa và lỗi khi render lại.
- Ngôn ngữ mặc định theo ngôn ngữ được hỗ trợ của trình duyệt: `en` dùng EN, `vi` dùng VI; ngôn ngữ khác fallback VI. Lựa chọn người dùng được lưu và ưu tiên sau reload. Storage bị chặn vẫn đổi ngôn ngữ được trong phiên.
- Đổi ngôn ngữ chỉ cập nhật phần trình bày. Giữ bộ, giới, phụ kiện, màu/phong cách ghi chú, cấu hình Studio, PNG đã lưu và ảnh so sánh. Các nhãn Lookbook lấy lại từ ID đáng tin cậy, không dùng tên lưu từ ngôn ngữ cũ.
- Dịch cả tiêu đề trang, mô tả ảnh/tooltip/nhãn select, lý do phụ kiện tối màu, thông báo fallback, lỗi đọc/lưu bộ nhớ, xác nhận xóa và nội dung file Lookbook xuất.
- Hộp chi tiết dùng chỗ chờ nguồn đã có; bỏ đoạn gợi ý phong cách cũ chưa có nguồn thay vì dịch và công bố nó. Không thêm nhận định lịch sử. Bản nháp và provenance vẫn giữ trong dữ liệu.
- Thông báo dài xuống dòng trong khung gọn trên mobile; trạng thái ảnh đặt thành dòng riêng để tránh dính vào phần giải thích. Hiệu ứng thông báo chỉ đổi độ mờ/vị trí, tránh chiều rộng chậm cập nhật khi đổi viewport.

## File đổi

| File | Mục đích |
| --- | --- |
| viet-phuc-remix/js/locales.js | Catalog nhãn VI/EN, tên theo ID, tham số thông báo. |
| viet-phuc-remix/js/locale.js | Chọn/lưu ngôn ngữ, áp nhãn tĩnh, cập nhật thông báo đang hiển thị và phát sự kiện đổi ngôn ngữ. |
| viet-phuc-remix/index.html | Gắn khóa cho nhãn, tùy chọn và thuộc tính hỗ trợ đọc màn hình; nạp locale trước các component. Giữ chữ VI fallback trong HTML. |
| viet-phuc-remix/app.js | Dùng khóa cho UI/Lookbook/modal/toast và render lại phần trình bày khi đổi ngôn ngữ. Bỏ renderer văn hóa nháp và hàm export/share cũ đã bị webFeatures thay thế. |
| viet-phuc-remix/js/compatibility.js | Lý do khóa và loại phụ kiện theo khóa, giữ nguyên luật chọn. |
| viet-phuc-remix/js/photoMapping.js | Dịch mô tả ảnh và lỗi xuất; giữ nguyên cách chọn ảnh. |
| viet-phuc-remix/js/studio.js | Trạng thái, lỗi, nhãn option và render khi đổi ngôn ngữ; không thay cấu hình look. Các công cụ mảnh cũ vẫn ẩn. |
| viet-phuc-remix/js/webFeatures.js | Dịch so sánh, thông tin chưa kiểm chứng, chia sẻ và HTML Lookbook xuất. So sánh lưu ID để dịch nhãn mà giữ ảnh chụp. |
| viet-phuc-remix/js/bodyCompositor.js, js/fallback2d.js | Mô tả SVG dự phòng dùng ngôn ngữ hiện tại; giữ bản mô tả VI khi các module được dùng độc lập. |
| viet-phuc-remix/studio.css | Khung thông báo dài và khoảng cách trạng thái ảnh. |
| viet-phuc-remix/tests/locale.test.mjs | Mặc định/lưu ngôn ngữ, storage lỗi, tham số, coverage tên món/màu, tham chiếu khóa và quét chữ VI trong component. |
| viet-phuc-remix/tests/compatibility.test.mjs, studio-binding.test.mjs, gender-selection.test.mjs | Nạp locale trong setup theo thứ tự app thật. Giữ toàn bộ assertion kiểm tra hành vi. |
| tools/verify_locale.mjs, verify_web.mjs | Browser QA VI/EN mới và locale VI rõ ràng cho lượt regression. |
| README.md, PHASE_STATUS.md, PHASE0_AUDIT.md | Cách chạy/kiểm thử ngôn ngữ và trạng thái từng mục. |
| assets/review/browser/ | JSON kết quả và ảnh chụp QA. Đây là ảnh màn hình kiểm thử, không phải ảnh trang phục mới. |

Ảnh nguồn, base body, catalog mapping và JSON quy tắc không thay đổi trong Mục 4.

## Kiểm chứng

Chạy từ root dự án, với server local đang mở:

```powershell
node --test viet-phuc-remix/tests/*.test.mjs
python -m unittest discover -s tests -p test_asset_preparation.py -v
python -m unittest discover -s tests -p test_photo_mapping_assets.py -v
python tools/build_body_availability.py --check
```

Kết quả: **8/8 file Node**, **17/17 test Python**, bundle khớp JSON. Test locale xác nhận 310 khóa đủ VI/EN và tham số tương ứng; các component app/Studio/compatibility/photoMapping/webFeatures không còn nhãn tiếng Việt có dấu ngoài catalog. Tên sản phẩm được giữ nguyên; HTML giữ chữ VI có khóa làm fallback. Hai test module 3D cũ vẫn được giữ trong regression, không được app mapping import.

Browser: chạy `tools/verify_web.mjs` rồi `tools/verify_locale.mjs` **tuần tự**, truyền đường dẫn Playwright nếu không cài package cục bộ. Không chạy hai lượt Chrome đồng thời trên server preview nhỏ: lượt chạy đồng thời đã gặp lỗi kết nối tài nguyên; các lượt cuối chạy riêng đều qua.

- 12 nhóm regression: 7 bộ nữ/2 bộ nam, guard, phụ kiện, fallback, PNG, lưu/reload/restore, so sánh 3 ảnh, HTML Lookbook, URL, mobile và lỗi ảnh.
- 6 nhóm locale: browser mặc định, label/alt/title; state và pixel ảnh không đổi; lưu ngôn ngữ sau reload; modal/xác nhận xóa/export theo EN; 390×844 không tràn ngang và thông báo dài nằm trong lề màn hình; lỗi storage đang hiển thị dịch được, storage bị chặn vẫn dùng app.
- Console/page errors: **0** trong các lượt cuối bình thường. Tải local regression: **321 ms**; chưa đo hosting/Lighthouse hoặc điện thoại vật lý.
- 21 ảnh nguồn còn khớp SHA-256; ảnh WebP vẫn đúng nội dung nguồn và tổng khoảng 402 KB.

Kết quả máy đọc: `assets/review/browser/verification.json` và `assets/review/browser/locale-verification.json`. Ảnh EN mobile: `assets/review/browser/mobile-english.png`.

## Việc còn lại

Mục 5–6 cần bổ sung nội dung/nút thao tác ở so sánh và Lookbook, ngôn ngữ trong link chia sẻ và xử lý từng món lỗi. Mục 7–8 cần kiểm thử/bàn giao cuối sau đó. Ghép mảnh, đổi màu ảnh và bổ sung mapping để giai đoạn nâng cấp theo yêu cầu mới. Nội dung văn hóa dài chưa có nguồn vẫn chưa xuất bản; prompt chuẩn bị ảnh cũ là nội dung VI của công cụ ẩn, nằm ngoài luồng mapping.
