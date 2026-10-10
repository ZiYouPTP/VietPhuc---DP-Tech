> Cập nhật 10/10/2026: app đã chuyển sang mapping ảnh hoàn chỉnh theo yêu cầu mới. Quy tắc giới và phụ kiện được dùng; ghép mảnh, palette và tổ hợp mở rộng để nâng cấp sau. Nội dung bên dưới là bản duyệt/thử nghiệm 09/10; xem ASSET_INVENTORY.md và IMPLEMENTATION_REPORT.md cho trạng thái hiện tại.

# Căn ảnh 2D — kết quả để duyệt

15 ảnh nguồn → 15 cutout, 15 thumbnail và 30 lớp QA trên hai canvas body. 15 món vẫn draft, 0 fit đã chứng nhận 1–2%. Chưa đăng ký các lớp này vào catalog.

Chỉ dùng scale đồng đều và tịnh tiến; xoay 0°. Không kéo riêng gấu/tay/vai. Ảnh và body nguồn giữ nguyên SHA-256.

Hai ảnh tham chiếu gốc được giữ trong assets/review. Bảng so sánh: [reference-fit-comparison.jpg](D:/VietPhuc-DP-main/assets/review/reference-fit-comparison.jpg).

Quần áo dài mới: cạp nguồn y579 → eo body y115, gấu y1895 → y263 bằng cùng một scale. Các mốc này là cấu hình đặt ảnh, không phải phép kiểm chứng độc lập.

| Ảnh | Body được phép chọn | Fit nam | Fit nữ | Sai lệch lớn nhất ở mốc đã đo, % cao body |
| --- | --- | --- | --- | --- |
| aobaba | Nữ | draft | draft | Nữ: 7.6% |
| aodai-fit-body2 | Nữ | draft | draft | Nữ: 3.36% |
| aogiaolinh | Nam, Nữ | draft | draft | Nam: 12.12% |
| aonguthan_female | Nữ | draft | draft | Nữ: 9.32% |
| aonguthan_male | Nam | draft | draft | Nam: 7.47% |
| aonhatbinh | Nữ | draft | draft | Nữ: 7.37% |
| aotuthan | Nữ | draft | draft | Nữ: 3.94% |
| aoyiem | Nữ | draft | draft | Chưa đo độc lập |
| guocmoc | Nữ | draft | draft | Chưa đo độc lập |
| khandong | Nữ | draft | draft | Chưa đo độc lập |
| nonla | Nữ | draft | draft | Chưa đo độc lập |
| nonquaithao | Nữ | draft | draft | Chưa đo độc lập |
| quanbaba | Nữ | draft | draft | Chưa đo độc lập |
| vaydup | Nữ | draft | draft | Chưa đo độc lập |
| quan-aodai-fit-body2 | Nữ | draft | draft | Chưa đo độc lập |

Sai số đọc mốc từ ảnh nguồn khoảng 2–4 pixel native; mốc chưa đo được ghi null. Một phép căn có residual thấp chưa chứng nhận toàn bộ silhouette, cổ tay hay bàn tay đã khớp.

Ảnh tham chiếu và mảnh PNG áo dài/bà ba có các chi tiết chỉ khớp ở một phần vùng ảnh; cách căn scale/offset đã được lưu nhưng vẫn có vùng vai/tay cần duyệt. Không ép ảnh bằng warp để tạo kết quả đạt giả.

JPG nón được tách nền bằng flood fill có seed cho lỗ quai kín, không xóa toàn bộ pixel trắng. PNG màu trắng ngà được giữ vùng vải sáng.

Mặt/tay/độ nét của body giữ từ PNG 105×290 hoặc 118×308 hiện có; zoom lớn không tăng chi tiết thật. Mask tay trước áo chỉ là bản thử để duyệt, chưa đưa vào app.

Lệnh tái tạo: python tools/prepare_remix_assets.py; python tools/write_review_report.py. Test: python -m unittest discover -s tests -p test_asset_preparation.py -v.
