# Việt Phục Remix

**Khám phá Việt phục, phối theo bối cảnh và lưu lại phong cách của bạn.**

Việt Phục Remix là ứng dụng web dành cho người trẻ quan tâm đến trang phục và văn hóa Việt Nam. Dự án kết hợp trải nghiệm phối đồ với kiến thức về lịch sử, cấu tạo và cách sử dụng Việt phục, theo định hướng **Vietnamese Heritage × Modern Gen Z Fashion**.

Ứng dụng chọn ảnh bộ trang phục và tổ hợp phụ kiện đã có trong dataset. Mỗi lựa chọn được kiểm tra trước khi tìm ảnh và xếp hạng; những tổ hợp chưa có ảnh không được trình bày như bản phối chính xác.

> **Trạng thái:** bản demo đã hoàn thành nền dữ liệu, matching và phối màu (giai đoạn 1–4, gồm 2.5). Outfit Studio đang được hoàn thiện ở giai đoạn 5. Lộ trình, kết quả kiểm chứng và danh sách thay đổi nằm trong [CODEX_PROGRESS.md](CODEX_PROGRESS.md).

## Tính năng

- **Khám phá 7 loại Việt phục:** áo dài, áo tứ thân, áo ngũ thân, áo bà ba, áo Nhật Bình, áo yếm và áo giao lĩnh.
- **Phối theo sự kiện:** lựa chọn trang phục, phụ kiện và màu được cập nhật theo bối cảnh và ảnh thực tế.
- **Matching theo toàn bộ tổ hợp:** ưu tiên ảnh khớp chính xác; kết quả gần nhất có nhãn tham khảo và giải thích khác biệt.
- **Màu sắc có ảnh hỗ trợ:** dùng ảnh gốc hoặc biến thể chỉnh màu đã kiểm duyệt; mỗi tổ hợp tối đa 3 màu chính.
- **Gợi ý phối màu:** đánh giá màu ước tính và cho phép xem đề xuất trước khi áp dụng.
- **Lookbook cá nhân:** lưu trên trình duyệt, mở lại, xóa, so sánh, xuất PNG và chia sẻ lựa chọn qua liên kết.
- **Kiến thức văn hóa có nguồn:** hồ sơ trang phục, lịch sử, cấu tạo, bối cảnh sử dụng và những điểm còn cần đối chiếu.
- **Giao diện tiếng Việt và tiếng Anh.**

## Trải nghiệm phối đồ

**Sự kiện → Bộ trang phục → Phụ kiện → Màu sắc → Kết quả**

1. Chọn bối cảnh sử dụng và nhân vật nam hoặc nữ.
2. Chọn một bộ trang phục hoàn chỉnh.
3. Chọn phụ kiện có ảnh tương ứng, hoặc **Không phụ kiện** nếu dataset hỗ trợ.
4. Chọn màu đang khả dụng hoặc dùng **Gợi ý màu**.
5. Xem ảnh, điểm matching, giải thích và thông tin văn hóa; lưu hoặc xuất bản phối.

Tùy chọn bị làm tối không thể chọn và có lý do. Khi thay đổi sự kiện hoặc trang phục, ứng dụng điều chỉnh những lựa chọn phụ thuộc không còn hợp lệ.

**Demo đổi màu:** chọn **Tốt nghiệp → Áo ngũ thân nữ → Guốc Mộc + Khăn Đóng → Fusion → Gợi ý màu → Áp dụng navy**. Chuyển sang **Đám cưới** để kiểm tra màu trở về ảnh gốc và các biến thể chưa hỗ trợ sự kiện này bị khóa.

## Chạy tại máy cá nhân

Ứng dụng là website tĩnh, không cần backend, npm hoặc bước build. Cần Python để mở HTTP server; Node.js chỉ dùng khi chạy kiểm thử JavaScript.

Mở PowerShell tại thư mục dự án:

```powershell
Set-Location -LiteralPath 'D:\VietPhuc-DP-main'
python -m http.server 8080 --bind 127.0.0.1
```

Mở **[http://127.0.0.1:8080/viet-phuc-remix/](http://127.0.0.1:8080/viet-phuc-remix/)**. Giữ PowerShell chạy trong khi sử dụng; nhấn `Ctrl+C` để dừng. Nếu cổng đã được dùng, đổi cổng trong cả lệnh và URL.

Phục vụ **toàn bộ thư mục dự án** để các đường dẫn ảnh hoạt động. Entrypoint hiện hành là `viet-phuc-remix/index.html`; `index.html` ở root thuộc phiên bản React cũ. Không mở ứng dụng bằng đường dẫn `file://`.

## Kiến trúc và cấu trúc thư mục

Ứng dụng hiện hành dùng **HTML, CSS và JavaScript thuần**, với dữ liệu JSON và bundle cho website tĩnh. Pipeline kiểm tra ảnh sử dụng Python, Pillow và NumPy. Không cần dịch vụ AI hoặc mô hình computer vision để chạy matching.

```text
VietPhuc-DP-main/
├── viet-phuc-remix/
│   ├── index.html              # Entrypoint hiện hành
│   ├── app.js                  # Lựa chọn, giao diện và Lookbook
│   ├── style.css, studio.css   # Giao diện và responsive
│   ├── js/                     # Retrieval, phối màu, Studio và VI/EN
│   ├── data/                   # Metadata được duyệt và kế hoạch màu
│   └── tests/                  # Kiểm thử JavaScript
├── assets/
│   ├── web/                    # Ảnh outfit nguồn và catalog
│   ├── derived/outfits/        # Ảnh tối ưu dùng trên web
│   ├── generated/color-variants/ # Biến thể, mask và trang kiểm duyệt
│   ├── base_bodies/            # Body tham chiếu
│   └── data/                   # Manifest và báo cáo dữ liệu
├── tools/                      # Công cụ chuẩn hóa và kiểm tra ảnh
├── tests/                      # Kiểm thử Python
└── CODEX_PROGRESS.md           # Tiến độ và báo cáo triển khai
```

Các module chính:

| Module | Vai trò |
| --- | --- |
| `js/outfitMatching.js` | Lọc ràng buộc, truy xuất tổ hợp và xếp hạng |
| `js/compatibility.js` | Trang phục và tập phụ kiện khả dụng |
| `js/photoMapping.js` | Chọn, hiển thị và xuất ảnh |
| `js/colorHarmony.js` | Đánh giá màu và đề xuất từ ảnh hợp lệ |
| `js/studio.js` | Đồng bộ bản phối và preview |
| `js/cultureData.js`, `js/culture.js` | Kiến thức biên tập và liên kết nguồn |
| `js/locales.js`, `js/locale.js` | Nội dung và chuyển đổi VI/EN |

Các đường dẫn module trong bảng thuộc `viet-phuc-remix/`.

## Dữ liệu và nguyên tắc matching

| Thành phần | Quy mô hiện tại |
| --- | --- |
| Ảnh outfit gốc | 47: 36 nữ, 11 nam |
| Loại trang phục | 7 |
| Nhóm trang phục × nhân vật | 9 |
| Phụ kiện trong catalog tương tác | 8 |
| Biến thể màu được duyệt | 4, từ 2 tổ hợp ngũ thân |
| Hồ sơ kiến thức trang phục | 7, đối chiếu 8 nguồn chọn lọc |

Phụ kiện gồm nón lá, nón quai thao, khăn đóng, khăn vành, trâm cài, guốc mộc, hài thêu và giày cao gót. Sự có mặt của một món trong catalog không đồng nghĩa món đó được chọn với mọi trang phục.

Matching thực hiện hai bước: **lọc điều kiện bắt buộc**, sau đó **xếp hạng ảnh hợp lệ**. Điều kiện gồm bộ trang phục, nhân vật, toàn bộ tập phụ kiện, màu, phạm vi sự kiện demo và trạng thái kiểm duyệt. Điểm tương đồng dựa trên thuộc tính đã biết; không phải chứng nhận lịch sử hoặc độ hài hòa màu.

Ảnh gốc đúng màu được ưu tiên. Navy và tím mận hiện chỉ có cho ngũ thân nam/nữ với **khăn đóng + guốc mộc** ở các bối cảnh demo đã duyệt. Không recolor toàn ảnh bằng CSS và không ghép thành phần rời thành outfit mới. Ảnh nguồn được giữ nguyên; web sử dụng derivative đúng định dạng.

### Cập nhật dataset

Xem [hướng dẫn duyệt metadata](viet-phuc-remix/data/METADATA_REVIEW.md) trước khi thêm ảnh. Chỉnh sidecar metadata đã duyệt, không chỉnh tay catalog hoặc bundle sinh tự động.

```powershell
python tools/build_photo_catalog.py
python tools/build_photo_catalog.py --check
```

Biến thể màu có mask và kiểm duyệt riêng. Xem [trang so sánh ảnh](assets/generated/color-variants/review.html) và kiểm tra tính nhất quán bằng:

```powershell
python tools/generate_color_variants.py --check
```

Ảnh thiếu provenance hoặc chưa được duyệt không trở thành lựa chọn khả dụng.

## Kiểm thử

Môi trường đã dùng để kiểm chứng: **Node.js 24, Python 3.12, Pillow và NumPy**. Từ root dự án:

```powershell
node --test viet-phuc-remix/tests/*.test.mjs
python -m unittest discover -s tests -p 'test_*.py' -v
python tools/build_photo_catalog.py --check
python tools/generate_color_variants.py --check
```

JavaScript kiểm retrieval, sự kiện, màu, phụ kiện, VI/EN và khôi phục bản phối. Python kiểm nguồn ảnh, metadata, derivative, provenance, mask và biến thể. Có một nhóm kiểm manifest ghép lớp cũ được bỏ qua vì manifest đó không còn trong dự án. Dự án hiện chưa có lệnh lint, TypeScript hoặc build ứng dụng.

Kết quả từng lần chạy và phạm vi kiểm thử trình duyệt được ghi trong [báo cáo tiến độ](CODEX_PROGRESS.md).

## Đưa lên GitHub và chạy online

Giữ nguyên cấu trúc thư mục. Phần runtime cần:

- Toàn bộ `viet-phuc-remix/`.
- `assets/derived/outfits/`.
- `assets/generated/color-variants/`.
- `assets/base_bodies/`.

Để lưu đầy đủ dự án và tái tạo dataset, đưa thêm toàn bộ `assets/`, `tools/`, `tests/`, các JSON văn hóa tại root và tài liệu. Không đưa cache `__pycache__/`, `.pyc` hoặc log chạy tạm; `.gitignore` đã khai báo các loại này.

Bật GitHub Pages từ nhánh chứa dự án và thư mục `/ (root)`, sau đó mở URL site với hậu tố **`/viet-phuc-remix/`**. Xem [hướng dẫn GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site). Danh sách file thay đổi theo từng giai đoạn nằm trong `CODEX_PROGRESS.md`.

## Giới hạn và hướng phát triển

- Danh sách sự kiện là phạm vi biên tập cho demo hiện đại. Metadata từng ảnh chưa xác minh đầy đủ sự kiện, chất liệu hoặc độ chính xác phục dựng.
- Điểm phối màu là ước tính từ nhóm màu được ghi nhận; chưa đo diện tích và phân bố màu theo pixel. Một ảnh chỉ có một màu được ghi nhận không được gán điểm hài hòa.
- Kiến thức văn hóa là bản tổng hợp có dẫn nguồn; một số niên đại và chi tiết còn cần nghiên cứu chuyên ngành. Nội dung AI tự suy luận không được dùng làm quy tắc văn hóa bắt buộc.
- Lookbook lưu trên trình duyệt hiện tại, chưa có tài khoản hoặc đồng bộ giữa thiết bị.

Các bước tiếp theo tập trung vào Outfit Studio và UI/UX, kiến thức văn hóa chuyên sâu, Lookbook nâng cao và kiểm thử tổng thể. Dự án ưu tiên **chất lượng ảnh, tính nhất quán dữ liệu và khả năng giải thích lựa chọn**.
