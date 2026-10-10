> Cập nhật 10/10/2026: app đã chuyển sang mapping ảnh hoàn chỉnh theo yêu cầu mới. Quy tắc giới và phụ kiện được dùng; ghép mảnh, palette và tổ hợp mở rộng để nâng cấp sau. Nội dung bên dưới là bản duyệt/thử nghiệm 09/10; xem ASSET_INVENTORY.md và IMPLEMENTATION_REPORT.md cho trạng thái hiện tại.

# Quy tắc phối đồ — bản để duyệt

7 bộ, 22 item rules, 9 tổ hợp tối thiểu; cả 9 tổ hợp cần kiểm chứng văn hóa. sources: [], needsVerification: true và TODO đã ghi rõ.

Giới hỗ trợ dưới đây là phạm vi phối ảnh người dùng chọn, không phải kết luận lịch sử. Nam chỉ được chọn ngũ thân và giao lĩnh. Nữ dùng aonguthan_female, không dùng aonguthan_male.

| Bộ | Body xem/phối | Slot bắt buộc | Món tối thiểu ở slot bottom | Tổ hợp cần kiểm chứng |
| --- | --- | --- | --- | --- |
| Áo dài | Nữ | outer, bottom | trousers | 1 |
| Áo tứ thân | Nữ | outer, bottom | trousers, skirt | 2 |
| Áo ngũ thân | Nam, Nữ | outer, bottom | trousers | 1 |
| Áo bà ba | Nữ | outer, bottom | trousers | 1 |
| Áo Nhật Bình | Nữ | outer, bottom | skirt | 1 |
| Áo yếm | Nữ | outer, bottom | trousers, skirt | 2 |
| Áo giao lĩnh | Nam, Nữ | outer, bottom | skirt | 1 |

Áo dài cho phép dây lưng và nón lá tùy chọn theo yêu cầu; tứ thân dùng quần hoặc váy; bà ba yêu cầu nhóm quần đen/nâu trong preset. Những lựa chọn này chưa có nguồn lịch sử.

Thứ tự lớp cố định: inner → bottom → outer → panels → belt → headwear → hair → hairAdornment → earrings → necklace → bracelet → handAccessory → footwear.

Palette C2 chưa được cung cấp: mỗi bộ có palette tạm tối đa 4 màu, không đặt cặp màu cấm do suy đoán. Checker cảnh báo màu; body/slot/bối cảnh có thể chặn lựa chọn.

Nguồn dữ liệu: viet-phuc-remix/data/outfit-rules.json. js/outfitRules.js kiểm tra thuần dữ liệu. js/bodyAvailabilityData.js là bản tạo tự động chỉ chứa giới hỗ trợ; chạy python tools/build_body_availability.py sau khi sửa JSON.

Phần khóa áo theo body đã đưa vào app theo yêu cầu mới. Toàn bộ quy tắc phối/catalog ảnh vẫn chờ duyệt theo Mục 1B.
