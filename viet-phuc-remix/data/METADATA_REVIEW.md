# Duyệt metadata outfit combination

Ngày duyệt: 10/10/2026. Phạm vi: 47 ảnh gốc mang đuôi `.webp` trong `assets/web` (định dạng thực gồm WebP, PNG và JPEG), đã xem đủ trên 5 contact sheet và mở ảnh gốc cho các chi tiết cần đối chiếu. Việc xem và ghi chú do Codex thực hiện; đây chưa phải thẩm định của chuyên gia Việt phục.

`combination-metadata.json` là sidecar metadata, không sửa ảnh. Mỗi khóa trong `entries` là đường dẫn tương đối từ root repository, dùng dấu `/`. `sourceSha256` gắn lần duyệt với đúng byte của ảnh. Khi ảnh bị thay thế, metadata cũ phải được đưa vào trạng thái cần duyệt, không tự áp dụng cho ảnh mới.

## Ý nghĩa các trường

- `costumeId` và `gender`: nhãn bộ hoàn chỉnh và phạm vi mẫu ảnh theo dataset. Nhãn này không khẳng định nguồn gốc, tính chính xác lịch sử hoặc quy tắc sử dụng theo giới.
- `accessoryIds`: tập phụ kiện tương tác thực sự nhìn thấy trong ảnh; thứ tự không có ý nghĩa. Chỉ dùng 8 ID chuẩn: `non-la`, `non-quai-thao`, `khan-dong`, `khan-vanh`, `tram-cai`, `guoc-moc`, `hai-theu`, `giay-cao-got`.
- `accessoryIds: []`: đã xem ảnh và không thấy phụ kiện thuộc catalog tương tác. Không có nghĩa ảnh không chứa bất kỳ chi tiết trang trí nào. `accessoryIds: null` được dành cho trường hợp chưa đủ chắc chắn.
- `colors.primaryId`: nhóm màu thị giác của áo chính/áo ngoài. Với bộ yếm, màu chính là hồng của yếm, váy đỏ đô nằm trong màu phụ.
- `colors.secondaryIds`: nhóm màu của các phần trang phục khác nhìn thấy, như quần, váy, áo trong, hoa thêu và dải tay. Đây là palette của toàn bộ ảnh outfit; không tạo lựa chọn riêng áo/quần/váy.
- `colors.status` và `appearanceStatus`: `visually-reviewed` chỉ xác nhận đã đối chiếu ngoại hình. Nếu không đủ rõ, đặt màu không biết thành `null`, `colors.status: "unknown"` hoặc `appearanceStatus: "needs-review"` tùy trường cần duyệt.
- `provenance.method: "visual-review"` và `reviewedAt`: cách và ngày duyệt ngoại hình; không thay thế nguồn văn hóa.
- `eventIds`, `styleIds`, `material`: hiện đều `null`. Không suy ra dịp mặc, phong cách hoặc chất liệu từ tên file, độ bóng hoặc họa tiết.
- `culturalSources: []`, `needsCulturalVerification: true`: toàn bộ ảnh còn cần nguồn/thẩm định văn hóa. Duyệt ngoại hình không đổi hai trường này.

## Nhóm màu đang được dùng

| ID | Mô tả thị giác | Vai trò trong dataset |
| --- | --- | --- |
| ivory | Trắng ngà | Chính của 6 ảnh áo dài; phụ của quần/áo trong các nhóm khác |
| pink | Hồng | Chính của 8 ảnh bà ba và 2 ảnh yếm; phụ của lớp trong tứ thân |
| burgundy | Đỏ đô | Chính của 31 ảnh còn lại; phụ của váy trong 2 bộ yếm |
| gold | Vàng trên hoa/viền | Phụ của 4 ảnh Nhật Bình |
| blue | Xanh lam trên dải tay | Phụ của 4 ảnh Nhật Bình |
| green | Xanh lục trên dải tay | Phụ của 4 ảnh Nhật Bình |

Màu nền, mannequin, tóc và phụ kiện không được gộp vào palette trang phục. Khăn vành xanh lam được ghi ở `notes`; màu xanh trong palette Nhật Bình được xác nhận riêng từ dải tay. Các nhóm màu là mô tả thô, không phải màu RGB lấy từ pixel, không cam kết các ảnh có màu hoàn toàn đồng nhất và không có ý nghĩa lịch sử đã kiểm chứng. Nếu catalog hiển thị swatch, swatch chỉ minh họa nhóm màu và phải gắn `swatchIsApproximate: true`.

## Ngoại lệ đã đối chiếu

`assets/web/female-ao-giao-linh/female-ao-giao-linh-non-la-guoc-moc.webp` có trâm cài nhìn rõ bên dưới nón, cùng kiểu với ảnh `tram-cai-hai-theu`. Tập thực tế là `["guoc-moc", "non-la", "tram-cai"]`; tên file bỏ sót trâm. Giữ tên/byte ảnh gốc và ghi mismatch trong `notes`. Không được quảng bá ảnh này là tổ hợp chính xác chỉ nón lá + guốc mộc.

Hai ảnh người mẫu giao lĩnh có bông tai đính sẵn. Bông tai bị loại khỏi catalog tương tác theo yêu cầu; ghi chú rõ chi tiết vẫn hiện trên ảnh, không nhận rằng hệ thống có thể xóa hoặc thêm riêng bông tai. Dải buộc eo của tứ thân và dây buộc gắn trên giao lĩnh cũng là chi tiết sẵn có trong bộ ảnh, không trở thành tùy chọn dây lưng.

## Cách bổ sung hoặc duyệt lại

1. Mở đúng ảnh gốc ở đường dẫn cần duyệt; đối chiếu cả đầu/tóc, giày và toàn bộ trang phục, không chỉ đọc tên file.
2. Chỉ điền điều nhìn thấy. Không chắc một phụ kiện hoặc màu thì để trường tương ứng `null`, thêm lý do vào `notes` và đánh dấu cần duyệt.
3. Lấy lại SHA-256 của đúng ảnh, cập nhật `sourceSha256` và ngày duyệt. Không đổi ảnh để ép khớp metadata.
4. Dùng ID chuẩn; kiểm tra toàn bộ tập phụ kiện thay vì từng món riêng. Chi tiết tên file bỏ sót phải được ghi rõ và ngoại hình đã duyệt được ưu tiên.
5. Chạy công cụ dựng catalog và kiểm tra dữ liệu của giai đoạn 2 sau khi thay sidecar. Ảnh thiếu, hash không khớp hoặc metadata chưa duyệt không được trở thành lựa chọn khả dụng.
6. Chỉ thêm event, style, material hoặc nhận định lịch sử sau khi có căn cứ riêng và provenance phù hợp; không tự biến `visually-reviewed` thành chứng nhận văn hóa.

