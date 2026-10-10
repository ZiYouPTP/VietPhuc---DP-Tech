# Kiểm toán Việt phục Remix — trạng thái đến 10/10/2026

**App mapping đã chạy; chưa hoàn tất toàn bộ Mục 1–8.** Lượt hiện tại hoàn tất Mục 4 — VI/EN và dừng để người dùng duyệt. Bảng trạng thái chi tiết ở [PHASE_STATUS.md](PHASE_STATUS.md); báo cáo thay đổi/kiểm thử mới ở [PHASE4_I18N_REPORT.md](PHASE4_I18N_REPORT.md).

## Hiện trạng đang dùng

- Entry chính: `viet-phuc-remix/index.html`, HTML/CSS/JavaScript thuần và ES modules. Giữ thư mục/stack, không cần npm build. Root React cũ giữ nguyên, không phải entry của luồng demo hiện tại.
- Màn hình: hero có ảnh, khám phá 7 nhóm, phối theo bối cảnh/body, kết quả, so sánh ảnh, Lookbook ảnh, bốn tab văn hóa dùng placeholder nguồn, modal chi tiết. VI/EN dùng catalog khóa chung; không đổi cấu hình look khi chuyển.
- Theo yêu cầu mới: ảnh **2D hoàn chỉnh mapping theo bộ/body/phụ kiện**, không sinh thêm ảnh. 21 ảnh nguồn trong `assets/`; 10 WebP tối ưu trong `assets/web/`, tổng 401.838 byte. Tổ hợp thiếu ảnh dùng ảnh hoàn chỉnh gần nhất và báo rõ.
- Body PNG gốc: `assets/base_bodies/base_body_1.png` (nam), `base_body_2.png` (nữ), giữ nguyên. Renderer hiện ưu tiên ảnh mặc hoàn chỉnh; `js/bodyCompositor.js` và `js/fallback2d.js` dùng SVG 2D dự phòng. Không tải model/viewer 3D trong app mapping.
- Nam chỉ ngũ thân nam/giao lĩnh nam; nữ 7 nhóm và bản ngũ thân nữ. JSON `data/outfit-rules.json` cùng bundle sinh sẵn quản lý giới/phụ kiện; UI có nút tối màu và lý do.
- Lưu PNG+cấu hình, mở lại/reload, xuất PNG/HTML Lookbook và link cấu hình đang chạy. So sánh và chia sẻ còn thiếu chi tiết theo Mục 5–6. Màu/phong cách là ghi chú; tách mảnh/recolor hoãn để nâng cấp sau.
- Nhận định văn hóa chưa kiểm chứng không được công bố như kết luận. Dữ liệu có `sources`, `needsVerification` và TODO; điểm văn hóa là “Chưa kiểm chứng”. Điểm palette 90/70 chỉ là demo theo màu ghi chú.
- Kiểm thử cuối Mục 4: 8/8 file Node, 17/17 case Python, 12 nhóm regression Chrome và 6 nhóm locale. Không console/page error trong lượt cuối bình thường. Desktop và viewport mobile 390×844; tải local 321 ms. Chưa đo Lighthouse/hosting/điện thoại vật lý.

Các quyết định và phát hiện dưới đây là **lưu trữ kiểm toán ngày 08/10**, không phải mô tả hiện trạng cuối. Quyết định dùng body/ảnh đã được thay bằng chỉ dẫn mapping mới của người dùng.

---

# Phase 0 — Kiểm toán gốc, 08/10/2026

Ngày: 08/10/2026. Phạm vi: kiểm toán hiện trạng; chưa triển khai hoặc sửa tính năng.

## 1. Phạm vi đã đọc

Đã đọc toàn bộ 23 file văn bản có trong workspace trước kiểm toán: HTML, CSS, JavaScript/JSX, Python, JSON, README và log build. Kiểm tra sáu file ảnh về định dạng/kích thước, xem hai body PNG và hai mockup PNG. Không chạy generator ảnh hoặc API AI thật. Không có AGENTS.md, package.json, lockfile, thư mục node_modules, cấu hình build/test hay metadata .git trong checkout này.

```text
D:/VietPhuc-DP-main/
├── index.html                     # Bản React: Việt Phục AI Stylist
├── js/
│   ├── app.jsx                    # State và bố cục ba cột
│   ├── components.jsx             # Catalog, avatar, chatbot, drawer
│   ├── utils.js                   # Phân tích bộ đồ và format tin nhắn
│   ├── ai.js                      # Chat mock + Gemini text API
│   ├── data.js                    # DB sinh từ JSON + API tra cứu/kiểm tra
│   └── costume_mixer_engine.js    # Canvas 2D/PNG; chưa được nạp
├── css/check-panel.css
├── viet-phuc-remix/
│   ├── index.html                 # Bản Remix HTML/CSS/JS thuần
│   ├── app.js
│   ├── data.js
│   ├── style.css
│   ├── mockup_ao_dai.png          # Không được tham chiếu trong app
│   └── mockup_ao_tu_than.png      # Không được tham chiếu trong app
├── viet_phuc_items.json           # 18 món
├── viet_phuc_items_AI_GENERATED.json
├── viet_phuc_sources.json         # 39 nguồn chưa được kiểm chứng tại Phase 0
├── viet_phuc_schema.json
├── build_data.py                  # Sinh js/data.js
├── phase0_extract_bodies.py
├── phase1_generate_layers.py
├── phase2_composite_engine.py
├── assets/base_bodies/            # Hai PNG + manifest
├── male.avif / female.avif
├── README.md
└── build_result.txt
```

## 2. Hai ứng dụng và stack hiện tại

| Bản | Stack | Màn hình | Kết quả chạy thử |
| --- | --- | --- | --- |
| `/index.html` — AI Stylist | React 18 UMD, ReactDOM, Babel biên dịch JSX trong browser, Lucide, CSS thuần; tải qua CDN | Một màn hình ba cột: catalog, avatar/kết quả, chat; drawer chi tiết | Không dựng được giao diện, khung root trống |
| `/viet-phuc-remix/index.html` — Remix | HTML/CSS/JavaScript thuần, global data, DOM render, localStorage; Google Fonts | Trang cuộn gồm hero, khám phá, mixer, Lookbook, văn hóa bốn tab; modal chi tiết | Mở được, các luồng được thử chạy không có error/warn console |

Hai bản độc lập, dùng dữ liệu và state riêng. Remix chưa dùng DB/rules của bản React. Không có backend, routing framework hoặc service sinh ảnh đang kết nối trong Remix.

**Lỗi chặn bản gốc đã xác nhận bằng browser:** `js/data.js:1994` và `js/components.jsx:24` cùng khai báo `TIER_RANK`. Browser báo `SyntaxError: Identifier 'TIER_RANK' has already been declared`; components không được export nên `js/app.jsx:6` nhận component undefined và React báo invalid element type. Không sửa trong Phase 0.

## 3. Chức năng có và trạng thái

### Remix — đã kiểm tra chạy thực tế

- Danh mục bảy loại: áo dài, tứ thân, ngũ thân, bà ba, Nhật Bình, yếm, giao lĩnh; lọc Bắc/Trung/Nam và mở modal chi tiết.
- Chọn sáu sự kiện, 12 màu, 12 phụ kiện, ba phong cách; tạo preview, thẻ thông tin, cảnh báo và gợi ý khác.
- Thẻ so sánh đổi phong cách và nội dung gợi ý; chưa có hai ảnh/phương án độc lập.
- Lưu cấu hình vào localStorage; outfit thử vẫn tồn tại sau reload. Đã xóa outfit thử sau kiểm tra.
- Xuất Lookbook thành `viet-phuc-lookbook.txt`, đã kiểm tra file tải về và nội dung. Chưa xuất ảnh/PDF.
- Chọn thời tiết thủ công để hiển thị lời khuyên; không có API thời tiết.
- Có code chia sẻ văn bản bằng Web Share hoặc clipboard; chưa thực hiện chia sẻ ra bên ngoài.

### AI Stylist — có implementation, đang bị chặn khởi động

- Catalog 18 món: tìm kiếm tên/alias, lọc category/vùng, chọn/bỏ món, đánh dấu xung đột mềm.
- Drawer mô tả, nguồn, mâu thuẫn nguồn và lớp gợi ý AI; chatbot mock và Gemini text API.
- Điểm hiện tại trong `js/utils.js:30` là 100 trừ 20 mỗi warning và 5 mỗi info của luật AI; không phải điểm hài hòa màu hoặc chứng nhận đúng văn hóa.
- Có fallback API lỗi sang mock, nhưng request không có timeout/abort; không có fallback khi khởi động React thất bại.
- Các chức năng này chưa được xác nhận qua UI vì lỗi khởi động. DB chạy được trong smoke test riêng.

## 4. Body/nhân vật và trang phục

| Thành phần | Dạng hiện tại và vị trí | Có dùng trực tiếp trong app? |
| --- | --- | --- |
| Avatar bản React | Chồng tối đa bốn emoji, `js/components.jsx:255–274` | Có trong code UI; hiện không render vì lỗi khởi động |
| Nhân vật Remix | Đầu emoji, thân khối CSS bo góc/gradient, emoji trang phục, chân CSS; `viet-phuc-remix/app.js:253–277`, `style.css:823–849` | Có; mọi loại áo cùng hình thân, phụ kiện là chip |
| Body raster | `assets/base_bodies/base_body_1.png` 118×308 và `base_body_2.png` 105×290, RGBA; ảnh mannequin | Chưa nối vào hai giao diện |
| Nguồn body | Manifest ghi `male.avif`; `phase0_extract_bodies.py` cắt/segment ảnh | Không ghi nguồn/giấy phép; `female.avif` chưa được pipeline này sử dụng |
| Hai mockup | PNG RGB 1024×1024 trong `viet-phuc-remix/`, ảnh toàn thân dạng photorealistic | Không có tham chiếu; chưa có provenance để dùng |
| Mixer cũ | `js/costume_mixer_engine.js`: Canvas 2D ghép PNG, luật/layer/export | Không được import/nạp; thiếu `assets/clothing_manifest.json` và clothing layers |
| Pipeline sinh ảnh | `phase1_generate_layers.py`: Pollinations/Flux → xóa nền → resize PNG; Python composite ở phase2 | Tooling chưa hoàn chỉnh, không phải tính năng runtime |

Không tìm thấy Three.js, WebGL, file model 3D hay renderer 3D. SVG trong components là icon Lucide, không phải body/trang phục.

**Quyết định đề xuất:** tạo nhân vật SVG 2D tham số hóa mới. Placeholder hiện tại không có hình học áo/layer để tái sử dụng cho mặc đồ. Giữ state, lựa chọn, dữ liệu và Lookbook đang chạy; thay riêng renderer. Body PNG nhỏ, khác pose và thiếu provenance nên chưa phù hợp làm nền bản thi. SVG mặc định không phụ thuộc asset hay API; API ảnh chỉ là tùy chọn về sau, luôn fallback về SVG.

## 5. Dữ liệu văn hóa: hiện trạng, không phải xác minh lịch sử

- DB gốc có 18 món và 39 nguồn; 14 nguồn tier trung_binh, 25 thap, không có cao. Tier do AI tự đánh giá theo tên miền và schema ghi cần người duyệt (`viet_phuc_schema.json:47`). Phase 0 chưa kiểm tra URL hoặc tính đúng đắn của nội dung.
- Món dùng `source_ids`, registry dùng `sources`; chưa có `sources` và `needsVerification` ở mọi bản ghi nội dung theo yêu cầu. Không có key `needsVerification` trong dữ liệu hiện tại.
- Bảy bản ghi món AI và hai luật toàn cục gắn AI_INFERRED. Có 24 rule output; chín advisory của sáu món gắn SOURCED, nhưng nguồn đang ở cấp món, chưa gắn từng nhận định (`build_data.py:176`). SOURCED chưa đồng nghĩa với đã được kiểm chứng.
- Chín món có conflicts, tổng 14 nội dung mâu thuẫn. Không tự chọn một cách giải thích là đúng trong Phase 0.
- Remix không có nguồn hoặc trạng thái xác minh cho lịch sử, quy tắc, ý nghĩa màu, phụ kiện, vùng, lời khuyên và cảnh báo hardcode. Các câu hiện tại cần duyệt; không coi chúng là tri thức đã xác thực.
- Dữ liệu gốc chưa có mục áo dài hiện đại riêng hoặc trang phục dân tộc. Các trường suitable_body_types đều trống; chất liệu/cấu tạo/ý nghĩa có nhiều trường trống.

Phase dữ liệu cần thêm nguồn ở từng nhận định, `needsVerification: true` cho nội dung chưa duyệt, và placeholder như “Chưa có nguồn — cần bổ sung” với `sources: []`. Giữ nguồn cũ để người dùng review; không tự đổi suy luận AI thành quy tắc văn hóa. Trang phục dân tộc cần tên cộng đồng/trang phục và nguồn cụ thể trước khi dựng hình; không tạo một trang phục chung giả định cho mọi dân tộc.

## 6. So sánh với trải nghiệm yêu cầu

| Yêu cầu | Hiện có | Cần bổ sung |
| --- | --- | --- |
| Bối cảnh trước, tối đa năm bước | Remix chọn trang phục trước sự kiện, chung một panel | Bối cảnh → nhóm áo → cá nhân hóa → kết quả → so sánh/lưu |
| Sự kiện/vùng miền | Tết, cưới, tốt nghiệp, lễ hội, street style, lễ tế; vùng để lọc catalog | Kỷ yếu, cà phê/đi chơi, lễ hội địa phương; vùng làm đầu vào phối; Tây Nguyên/cộng đồng cụ thể |
| Nhóm trang phục | Remix có đủ năm nhóm áo chính được yêu cầu | Nội dung/renderer có kiểm chứng; trang phục dân tộc theo nguồn cụ thể |
| Nhân vật và cá nhân hóa | Màu, phụ kiện, phong cách | Giới, dáng, da, tóc, họa tiết, chất liệu; mặc phụ kiện đúng layer |
| Hình kết quả 2D | CSS/emoji | SVG tham số hóa, silhouette khác theo áo, preview nhất quán với cấu hình |
| Điểm màu và văn hóa | Remix chỉ kiểm tra màu trong danh sách sự kiện; React có điểm luật AI | Thuật toán màu giải thích được; checklist văn hóa có nguồn và độ phủ dữ liệu, không cho 100 khi chưa đủ dữ liệu |
| Thẻ thông tin | Có modal/card/drawer | Nguồn từng nhận định, placeholder và trạng thái xác minh rõ |
| So sánh | Hai thẻ mô tả phong cách | Hai cấu hình/ảnh độc lập, so sánh trực quan |
| Lookbook, xuất, chia sẻ | LocalStorage; cover emoji; xuất/chia sẻ text | Lưu snapshot hình+cấu hình; PNG/SVG và bản in Lookbook; link khôi phục cấu hình khi phù hợp |
| VI/EN | Chỉ tiếng Việt | Nút EN, dictionary cho UI và dữ liệu, fallback về VI |
| Mobile, fallback, tải <3s | Remix có breakpoint; React chưa responsive | Sửa header/khả năng thao tác, fallback lỗi dữ liệu/storage/API/script, đo tải theo điều kiện rõ |

## 7. Lỗi/rủi ro cụ thể cần sửa theo phase

1. Bản gốc không khởi động: duplicate TIER_RANK nêu trên.
2. Chat gốc đưa user/AI text vào dangerouslySetInnerHTML (`js/components.jsx:431`); formatter (`js/utils.js:103–115`) không escape HTML. Kiểm tra tĩnh/Node xác nhận markup giữ nguyên; chưa khai thác qua UI.
3. Remix parse localStorage không try/catch/validation (`app.js:12`); dữ liệu hỏng có thể chặn init. Ghi storage cũng thiếu xử lý quota/permission. Đây là phát hiện code, chưa chủ động làm hỏng storage để test.
4. Remix lưu từ state đang chọn, chưa lưu snapshot kết quả (`app.js:349`). Có thể lưu trước generate hoặc thay lựa chọn sau generate khiến preview và dữ liệu lưu lệch.
5. Chia sẻ thiếu catch khi user hủy/API lỗi và thiếu fallback khi clipboard không có (`app.js:424`).
6. Root grid cố định 268px + trung tâm + 332px, body overflow hidden, không media query (`index.html:30`, `:40`, `:360`). Remix có layout một cột mobile; ở 320px logo cao 96px trong header cao khoảng 71px, cần chỉnh. Chưa chứng minh mọi màn hình không tràn.
7. Cards/phụ kiện/compare click bằng div/span; modal thiếu quản lý focus/Escape/dialog semantics, toast thiếu live region. Radio phong cách display:none.
8. React dùng CDN và Babel trong browser, root không có UI lỗi khởi động. Remix tải Google Fonts qua cả HTML và CSS import. Chưa có đo đạc để cam kết <3s.
9. Pipeline Python: record sinh ảnh lỗi không có layer (`phase1_generate_layers.py:144`); composite tạo Path("") thành thư mục hiện tại rồi Image.open sẽ lỗi (`phase2_composite_engine.py:61`, `:71`). Engine thiếu layer có thể báo done dù ảnh thiếu trang phục.
10. Hero Remix nói “hơn 10” loại trong khi dữ liệu có 7; số “50+ gợi ý” chưa có dữ liệu cấu trúc chứng minh. Cần chỉnh nội dung theo số thực.

## 8. Kế hoạch tuần tự đề xuất

Giữ cả hai thư mục và stack. Đề xuất `viet-phuc-remix/` làm giao diện chính bản thi vì đang chạy và gần brief; tái sử dụng registry/DB/rule mềm của bản gốc qua adapter nhỏ khi cần. Bản gốc vẫn giữ, sửa lỗi chặn và lỗi chat; không chuyển toàn bộ sang framework khác. Chỉ sửa phạm vi cần cho phase đang được xác nhận.

| Phase | Phạm vi | Kiểm tra hoàn thành trước khi dừng |
| --- | --- | --- |
| 1 — Ổn định nền và dữ liệu | Chốt lối vào Remix; sửa khởi động gốc và chat HTML; fallback storage/share/init; schema nguồn/xác minh và placeholder; sửa mismatch lưu kết quả | Hai entry mở được; không uncaught error; dữ liệu thiếu/hỏng không để trắng; nguồn/nhãn chưa xác minh hiển thị đúng |
| 2 — Renderer 2D bằng code | Nhân vật SVG mới; silhouette cho năm nhóm áo chính; layer phụ kiện, màu; xử lý dữ liệu thiếu bằng SVG mặc định có nhãn | Không cần ảnh có sẵn/API; các áo có hình khác nhau; desktop/mobile render rõ, preview khớp cấu hình |
| 3 — UX năm bước và cá nhân hóa | Bối cảnh trước; sự kiện/vùng; dáng/giới/da/tóc, pattern/material/style; VI/EN; thiết kế tối giản có màu/họa tiết Việt được duyệt | Đi trọn năm bước trên laptop/điện thoại; quay lại vẫn giữ lựa chọn; bàn phím và đổi ngôn ngữ dùng được |
| 4 — Đánh giá và so sánh | Điểm hài hòa màu có giải thích; điểm/checklist văn hóa dựa dữ liệu đã duyệt, hiện độ phủ và chưa đủ dữ liệu; thẻ nguồn; hai phương án độc lập | Không đổi suy luận thành chứng nhận; đối chiếu score với đầu vào; hai ảnh/cấu hình so sánh khớp |
| 5 — Lookbook trực quan | Lưu snapshot hình+cấu hình; mở lại/chỉnh; xuất PNG/SVG/bản in Lookbook; share có fallback | Lưu/reload/restore/export giữ đúng kết quả; hủy share hoặc lỗi storage không làm mất phiên |
| 6 — Hoàn thiện vòng chung kết | Typography/spacing, accessibility, responsive, giảm tải, chuẩn bị luồng demo; trang phục dân tộc chỉ thêm khi đủ nguồn | Smoke test desktop/mobile và fallback; console sạch; đo mục tiêu <3s với thiết bị/mạng/cache ghi rõ; không có 3D |

Sau mỗi phase: kiểm tra chạy, báo việc đã làm/file đổi/cách test/kết quả, rồi dừng chờ người dùng xác nhận. Không tự chuyển phase.

## 9. Kiểm tra đã thực hiện và giới hạn

- Server local: `python -m http.server 8765 --bind 127.0.0.1`; mở `/` và `/viet-phuc-remix/` trong trình duyệt.
- Root: đọc console và xác nhận giao diện trống do lỗi khai báo trùng + React invalid element.
- Remix: chọn áo/sự kiện/phụ kiện, generate, đổi style qua compare, lưu/reload, export TXT, lọc vùng, modal. Không error/warn console trong các luồng đã thử. Outfit thử đã dọn; file TXT là artifact thử trong Downloads.
- Responsive: kiểm tra viewport 390×844 và 320×740; đã reset viewport sau thử. Mixer chuyển một cột; header nhỏ có lỗi bố cục.
- JSON: parse/reference consistency pass; generated DB payload khớp JSON đầu vào trừ emoji được thêm. DB smoke test count/filter/source/checkOutfit pass.
- JavaScript data syntax pass; bốn Python script AST pass. PIL/numpy/cv2 có, pillow_avif chưa có; chưa chạy pipeline/API thật.
- Không có test suite hiện hữu; chưa thử network offline/CDN outage, storage hỏng, API credentials thật hoặc đo tải end-to-end. Không tuyên bố ứng dụng đạt <3s hoặc toàn bộ console sạch.
- Không sửa code tính năng. File mới duy nhất trong workspace là báo cáo `PHASE0_AUDIT.md`.

**Phase 0 hoàn tất. Dừng tại đây để người dùng xác nhận hướng và Phase 1.**
