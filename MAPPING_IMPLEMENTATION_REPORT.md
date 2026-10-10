# Hoàn thiện bản mapping — 10/10/2026

## Kết quả

Đã hoàn thành luồng demo trên dữ liệu hiện có: bối cảnh → body/trang phục → màu ghi chú → phụ kiện → phong cách ghi chú → xem, lưu, so sánh, xuất và chia sẻ. Giữ stack HTML/CSS/JS và cấu trúc app `viet-phuc-remix`. Root React cũ được giữ nguyên.

Theo yêu cầu mới, app **mapping ảnh hoàn chỉnh**, không ghép các lớp draft, không sinh ảnh/API, không 3D. Tất cả 21 ảnh nguồn được giữ nguyên, kiểm tra bằng SHA-256. 10 bản WebP chỉ resize đồng đều/nén, không crop/warp/tách nền hoặc thêm body. Tổng ảnh production 401.838 byte.

Nữ có 7 nhóm; nam chỉ ngũ thân nam/giao lĩnh nam. Mapping áo dài/nón lá dùng ảnh đã có. Tổ hợp chưa có ảnh trả mẫu hoàn chỉnh gần nhất kèm thông báo; nếu tải lỗi toàn bộ ảnh, SVG 2D giữ màn hình hoạt động. Màu/chất liệu của ảnh được giữ nguyên; palette và phong cách là ghi chú.

Quy tắc phụ kiện và giới lấy từ `outfit-rules.json` qua bundle sinh sẵn: áo dài cho dây lưng theo quy tắc bổ sung; các phụ kiện bị cấm hoặc xung đột cùng vị trí không chọn được. Các quy tắc lịch sử/nhóm màu quần/tổ hợp mở rộng vẫn là dữ liệu nháp cho nâng cấp, không tự đổi ảnh mẫu đã cung cấp.

## Chức năng web

- Ảnh thực trong hero, catalog, pill và kết quả; không dùng icon trang phục.
- Hai selector body đồng bộ; chặn cả UI, handler, Lookbook restore và link sai giới.
- VI/EN cho luồng chính, thông báo, ảnh và tooltip; ghi nhớ ngôn ngữ.
- Lưu ảnh PNG kèm cấu hình; reload và mở lại giữ body/bộ/phụ kiện/ghi chú.
- So sánh tối đa 3 ảnh chụp độc lập; đổi lựa chọn không làm đổi ảnh đã thêm.
- Xuất PNG 960×1240 và Lookbook HTML nhúng ảnh, có thể in thành PDF. Ảnh gốc có nền, không quảng cáo xuất nền trong suốt.
- URL chia sẻ chỉ chứa lựa chọn đã xác thực, không ảnh riêng. Không cần server API.
- Không phụ thuộc font/CDN bên ngoài trong luồng này.
- Không xuất bản nhận định lịch sử thiếu nguồn. Mọi bản ghi văn hóa vẫn `sources: []`, `needsVerification: true`; UI có chỗ chờ nguồn. Điểm văn hóa hiển thị “Chưa kiểm chứng”; điểm palette demo có giải thích rõ.

## File đổi chính

| File | Vai trò |
| --- | --- |
| viet-phuc-remix/index.html, style.css, studio.css | Luồng mapping, ảnh, body selector, thông báo và responsive |
| viet-phuc-remix/app.js | Catalog an toàn nguồn, bỏ so sánh text cũ, phụ kiện/metadata phù hợp mapping |
| viet-phuc-remix/js/studio.js | Render và xuất ảnh mapping, SVG fallback, giữ renderer cũ cho nâng cấp |
| viet-phuc-remix/js/photoMapping.js, photoMappingData.js | Chọn ảnh theo bộ/body/phụ kiện và phục hồi khi ảnh lỗi |
| viet-phuc-remix/js/webFeatures.js | So sánh, export Lookbook ảnh, URL chia sẻ và chỗ chờ nguồn |
| viet-phuc-remix/js/locale.js | VI/EN cho nội dung tĩnh và các phần render lại |
| viet-phuc-remix/js/compatibility.js, bodyAvailabilityData.js | Dùng quy tắc giới/phụ kiện từ bundle JSON |
| viet-phuc-remix/data/outfit-rules.json | Chính sách nguồn ảnh mới; giữ provenance và trạng thái chưa xác minh |
| tools/build_photo_catalog.py, build_body_availability.py | Chuẩn bị ảnh WebP và compile quy tắc, không API |
| assets/web/ | Catalog mapping + inventory hash + 10 ảnh WebP |
| tools/verify_web.mjs, tests/test_photo_mapping_assets.py | Kiểm thử Chrome và kiểm tra ảnh nguồn/ảnh tối ưu |
| README.md, ASSET_INVENTORY.md, ASSET_REVIEW.html | Chạy app, nâng cấp và duyệt dữ liệu hiện tại |

Các báo cáo/lớp fit cũ được gắn nhãn lưu trữ; không được app mapping nạp. Không khẳng định các lớp đó đã khớp body. Không xóa ảnh nguồn hoặc thay đổi base body.

## Kiểm chứng

Chrome headless desktop 1440px và điện thoại 390px: 12 nhóm kiểm tra. Mapping 7 nữ/2 nam, guards, nón lá, phụ kiện tối màu, fallback tổ hợp, lưu/reload, 3 ảnh so sánh, PNG, HTML Lookbook, VI/EN, URL round trip/reject sai giới, mobile không tràn ngang, ảnh thiếu và toàn bộ ảnh lỗi. Không có console/page error trong luồng bình thường, không request API/CDN ngoài dự án.

Thời gian load local đã đo khoảng **0,3–0,6 giây**, dưới 3 giây trên máy kiểm thử. Đây là số local, chưa phải kết quả hosting/Lighthouse hoặc thiết bị vật lý.

7 file Node regression và 17 test Python đã qua. Các test 3D cũ được giữ để kiểm tra module cũ; app hiện tại không import chúng. Báo cáo Chrome chính xác ở `assets/review/browser/verification.json`, ảnh ở cùng thư mục.

## Nâng cấp sau

Thêm mapping đẹp theo tổ hợp trước; chỉ cân nhắc ghép từng mảnh khi có ảnh/lớp tương ứng đã căn. Bổ sung nguồn văn hóa trước khi mở nội dung lịch sử và điểm văn hóa. Cấu trúc dữ liệu/rules/renderer cũ được giữ để thuận tiện mở rộng.
