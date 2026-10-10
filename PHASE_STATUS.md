# Trạng thái Mục 1–8 — Việt phục Remix

Cập nhật 10/10/2026, sau khi hoàn tất Mục 4. Đây là trạng thái theo danh sách **Mục 1–8** trong tài liệu bổ sung, có tính đến yêu cầu mới dùng mapping ảnh hoàn chỉnh. Các Phase trong kiểm toán 08/10 là kế hoạch cũ, không dùng để khẳng định bản hiện tại đã hoàn thành.

**Web đã có luồng demo chạy được; chưa hoàn tất toàn bộ các mục.**

| Mục | Trạng thái | Đã có / còn thiếu |
| --- | --- | --- |
| 0 — Kiểm toán | Đạt | Giữ kiểm toán gốc và bổ sung hiện trạng, phạm vi mapping ở PHASE0_AUDIT.md. |
| 1 — Sửa test Studio | Đạt | Đã bổ sung mergeLookLayers vào setup. Bộ test kết nối app/Studio và khôi phục đã qua. Không xóa test cũ. |
| 1B — Quy luật dữ liệu | Đạt một phần | Có 7 bộ, 22 item rules, 9 tổ hợp cần kiểm chứng, schema/checker/test. UI dùng quy tắc giới/phụ kiện qua bundle sinh từ JSON. Checker bối cảnh, slot và palette mở rộng chưa áp dụng đầy đủ vào luồng mapping. |
| 2 — Tích hợp ảnh | Đạt theo phạm vi mapping mới | Kiểm kê 21 ảnh nguồn; 10 ảnh hoàn chỉnh tối ưu và đăng ký mapping. Nữ 7 nhóm, nam 2 nhóm. Thiếu tổ hợp dùng ảnh hoàn chỉnh gần nhất, có thông báo. Yêu cầu tách nền/căn mảnh và dung sai 1–2% được thay bằng mapping; không tuyên bố thử nghiệm fit cũ đã đạt. |
| 3 — Đổi màu ảnh | Hoãn theo yêu cầu | Ảnh giữ màu và chất liệu gốc. Màu/phong cách là ghi chú Lookbook. Chưa làm recolor/mask/cache recolor; không cần để hoàn tất web mapping. |
| 4 — VI/EN | Đạt cho web mapping hiện tại | Bộ nhãn chung có khóa; dịch nút, tên món, placeholder mô tả, lý do khóa, trạng thái, lỗi, hộp thoại, nhãn đọc màn hình và Lookbook xuất. Lưu lựa chọn ngôn ngữ, giữ nguyên look khi chuyển. |
| 5 — So sánh | Đạt một phần | Tối đa 3 PNG độc lập và nút bỏ. Còn bảng màu, số món, điểm/ghi chú từng look, nút chọn lại/lưu từ bảng và bố cục dọc/vuốt trên mobile. |
| 6 — Chia sẻ | Đạt một phần | URL lưu bộ, giới, màu, phụ kiện, phong cách và bối cảnh; validate và khôi phục. Còn ngôn ngữ trong URL, xử lý từng món không tồn tại thay vì bỏ toàn cấu hình, nút sao chép link/tải ảnh ở mỗi thẻ Lookbook. |
| 7 — Kiểm thử cuối | Đạt một phần | Test hiện có đã qua, kiểm thử Chrome headless desktop/mobile 390×844, lỗi ảnh và storage. Chưa đo Lighthouse, chưa kiểm thử trên điện thoại vật lý/hosting và cần chạy lượt cuối sau Mục 5–6. |
| 8 — Dọn dẹp/bàn giao | Đạt một phần | README, inventory, báo cáo mapping và bảng này đã cập nhật. Bàn giao cuối chờ các Mục 5–7 và việc rà dọn toàn bộ dự án. |

## Lượt hiện tại: Mục 4

Chi tiết thay đổi, file và cách kiểm tra: **PHASE4_I18N_REPORT.md**. Kết quả mới nhất: 8/8 file test Node, 17/17 test Python, 12 nhóm browser regression và 6 nhóm VI/EN; không có lỗi console/page trong các lượt browser chạy tuần tự cuối cùng. Thời gian tải local của lượt regression cuối là 321 ms. Không dùng số local này để cam kết kết quả hosting hoặc Lighthouse.

Đã dừng ở cuối Mục 4 để người dùng duyệt theo nguyên tắc từng Phase. Mục tiếp theo là **Mục 5 — hoàn thiện so sánh**.

## Dữ liệu người dùng có thể bổ sung sau khi web xong

- Nguồn văn hóa cho từng mẫu/nhận định trước khi mở nội dung lịch sử hoặc chấm điểm văn hóa. Hiện `sources: []`, `needsVerification: true` và TODO được giữ rõ ràng.
- Ảnh hoàn chỉnh/mapping cho nhiều tổ hợp phụ kiện hơn. Chưa cần thêm ảnh để hoàn thiện Mục 5–8; những tổ hợp thiếu ảnh vẫn có fallback.
- Địa chỉ hosting khi chuẩn bị chia sẻ công khai. URL localhost hiện dùng trên máy chạy server.

Không yêu cầu sinh thêm ảnh, căn lại từng mảnh hay làm model 3D trong phạm vi hiện tại.
