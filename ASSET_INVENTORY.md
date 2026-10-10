# Kiểm kê ảnh hiện tại — 10/10/2026

Thư mục thực tế là `assets` (không có thư mục `asset`). 21 ảnh trang phục/phụ kiện nguồn tại root assets; không tính body, body-fit hoặc các ảnh QA.

App dùng **10 ảnh hoàn chỉnh**, mapping cho **7 nhóm nữ + 2 nhóm nam**, có thêm biến thể áo dài/nón lá. Những mảnh riêng và mẫu còn lại được giữ cho lần nâng cấp sau. Không gọi API hoặc sinh trang phục mới.

Chỉ giảm kích thước đồng đều và nén WebP: tổng 401.838 byte cho 10 ảnh. Không tách nền, kéo méo, ghép thêm body hoặc làm lại tay. Ảnh gốc và nền gốc được giữ nguyên. Hash nguồn lưu tại `assets/web/source-inventory.json`.

## Mapping đang dùng

| Bộ | Body | Phụ kiện có trong mapping | Ảnh nguồn |
| --- | --- | --- | --- |
| Áo dài | female | Mẫu mặc định | [aodai1.png](D:/VietPhuc-DP-main/assets/aodai1.png) |
| Áo dài + nón lá | female | non-la | [aodai2.png](D:/VietPhuc-DP-main/assets/aodai2.png) |
| Áo bà ba | female | Mẫu mặc định | [aobaba.png](D:/VietPhuc-DP-main/assets/aobaba.png) |
| Áo ngũ thân nữ | female | Mẫu mặc định | [aonguthan_female.png](D:/VietPhuc-DP-main/assets/aonguthan_female.png) |
| Áo ngũ thân nam | male | Mẫu mặc định | [aonguthan_male.png](D:/VietPhuc-DP-main/assets/aonguthan_male.png) |
| Áo giao lĩnh nữ | female | Mẫu mặc định | [aogiaolinh_female.png](D:/VietPhuc-DP-main/assets/aogiaolinh_female.png) |
| Áo giao lĩnh nam | male | Mẫu mặc định | [aogiaolinh_male.png](D:/VietPhuc-DP-main/assets/aogiaolinh_male.png) |
| Áo Nhật Bình | female | Mẫu mặc định | [aonhatbinh.png](D:/VietPhuc-DP-main/assets/aonhatbinh.png) |
| Áo tứ thân | female | Mẫu mặc định | [aotuthan.png](D:/VietPhuc-DP-main/assets/aotuthan.png) |
| Áo yếm + váy | female | Mẫu mặc định | [vaydup_aoyiem.png](D:/VietPhuc-DP-main/assets/vaydup_aoyiem.png) |

## Tất cả nguồn hiện tại

| File | Kích thước | Chế độ ảnh | Trạng thái |
| --- | --- | --- | --- |
| [aobaba.png](D:/VietPhuc-DP-main/assets/aobaba.png) | 755×2084 | RGB | mapped-photo |
| [aobaba_only.png](D:/VietPhuc-DP-main/assets/aobaba_only.png) | 755×2084 | RGB | available-for-later-upgrade |
| [aodai-fit-body2.png](D:/VietPhuc-DP-main/assets/aodai-fit-body2.png) | 756×2080 | RGBA | available-for-later-upgrade |
| [aodai1.png](D:/VietPhuc-DP-main/assets/aodai1.png) | 756×2079 | RGB | mapped-photo |
| [aodai2.png](D:/VietPhuc-DP-main/assets/aodai2.png) | 1024×1536 | RGB | mapped-photo |
| [aodainone.png](D:/VietPhuc-DP-main/assets/aodainone.png) | 755×2084 | RGB | available-for-later-upgrade |
| [aogiaolinh_female.png](D:/VietPhuc-DP-main/assets/aogiaolinh_female.png) | 754×2084 | RGB | mapped-photo |
| [aogiaolinh_male.png](D:/VietPhuc-DP-main/assets/aogiaolinh_male.png) | 776×2025 | RGB | mapped-photo |
| [aonguthan_female.png](D:/VietPhuc-DP-main/assets/aonguthan_female.png) | 754×2084 | RGB | mapped-photo |
| [aonguthan_male.png](D:/VietPhuc-DP-main/assets/aonguthan_male.png) | 776×2027 | RGB | mapped-photo |
| [aonhatbinh.png](D:/VietPhuc-DP-main/assets/aonhatbinh.png) | 755×2084 | RGB | mapped-photo |
| [aotuthan.png](D:/VietPhuc-DP-main/assets/aotuthan.png) | 1024×1536 | RGB | mapped-photo |
| [aoyiem.png](D:/VietPhuc-DP-main/assets/aoyiem.png) | 755×2084 | RGBA | available-for-later-upgrade |
| [guocmoc.png](D:/VietPhuc-DP-main/assets/guocmoc.png) | 754×2084 | RGBA | available-for-later-upgrade |
| [khandong.jpg](D:/VietPhuc-DP-main/assets/khandong.jpg) | 1024×1536 | RGB | available-for-later-upgrade |
| [nonla.jpg](D:/VietPhuc-DP-main/assets/nonla.jpg) | 1024×1536 | RGB | available-for-later-upgrade |
| [nonquaithao.jpg](D:/VietPhuc-DP-main/assets/nonquaithao.jpg) | 1024×1536 | RGB | available-for-later-upgrade |
| [quan-aodai-fit-body2.png](D:/VietPhuc-DP-main/assets/quan-aodai-fit-body2.png) | 755×2084 | RGBA | available-for-later-upgrade |
| [quanbaba.png](D:/VietPhuc-DP-main/assets/quanbaba.png) | 755×2084 | RGB | available-for-later-upgrade |
| [vaydup.png](D:/VietPhuc-DP-main/assets/vaydup.png) | 1254×1254 | RGBA | available-for-later-upgrade |
| [vaydup_aoyiem.png](D:/VietPhuc-DP-main/assets/vaydup_aoyiem.png) | 1024×1536 | RGB | mapped-photo |

Các tên/bối cảnh văn hóa có `sources: []`, `needsVerification: true` và TODO. Ảnh đẹp và chính sách giới không xác lập tính chính xác lịch sử.

Các tài liệu/lớp fit 09/10 và ASSET_INVENTORY_DRAFT.json là snapshot thử nghiệm cũ, không được app mapping nạp. Dùng `python tools/build_photo_catalog.py` để cập nhật mapping; không chạy lại pipeline fit cũ với các ảnh đã được người dùng thay thế.
