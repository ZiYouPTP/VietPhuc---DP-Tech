# Kiểm kê 15 ảnh nguồn hiện tại

Ngày: 09/10/2026. Cập nhật sau khi người dùng bổ sung quần áo dài và hai ảnh tham chiếu ghép body.

15 ảnh khác nhau: 12 PNG có alpha và 3 JPG nền trắng. aodai.png đã được bỏ; nguồn áo dài hiện tại là aodai-fit-body2.png. Không còn bản trùng trong danh sách này.

Danh sách chỉ tính ảnh trang phục/phụ kiện đã được cung cấp trực tiếp. Không tính body, ảnh liên hệ, ảnh kiểm tra hoặc các biến thể trong assets/body-fit.

| # | File nguồn | Kích thước | Tỉ lệ | Nền | Tên đề xuất | Slot | Canvas gần body |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | [aobaba.png](D:/VietPhuc-DP-main/assets/aobaba.png) | 755×2084 | 755:2084 | Trong suốt | Áo bà ba | `outer` | Nữ |
| 2 | [aodai-fit-body2.png](D:/VietPhuc-DP-main/assets/aodai-fit-body2.png) | 756×2080 | 189:520 | Trong suốt | Áo dài trắng | `outer` | Nữ |
| 3 | [aogiaolinh.png](D:/VietPhuc-DP-main/assets/aogiaolinh.png) | 776×2025 | 776:2025 | Trong suốt | Áo giao lĩnh | `outer` | Nam |
| 4 | [aonguthan_female.png](D:/VietPhuc-DP-main/assets/aonguthan_female.png) | 755×2084 | 755:2084 | Trong suốt | Áo ngũ thân — bản nữ | `outer` | Nữ |
| 5 | [aonguthan_male.png](D:/VietPhuc-DP-main/assets/aonguthan_male.png) | 777×2025 | 259:675 | Trong suốt | Áo ngũ thân — bản nam | `outer` | Nam |
| 6 | [aonhatbinh.png](D:/VietPhuc-DP-main/assets/aonhatbinh.png) | 755×2084 | 755:2084 | Trong suốt | Áo Nhật Bình | `outer` | Nữ |
| 7 | [aotuthan.png](D:/VietPhuc-DP-main/assets/aotuthan.png) | 755×2084 | 755:2084 | Trong suốt | Áo tứ thân | `outer` | Nữ |
| 8 | [aoyiem.png](D:/VietPhuc-DP-main/assets/aoyiem.png) | 755×2084 | 755:2084 | Trong suốt | Áo yếm | `outer` | Nữ |
| 9 | [guocmoc.png](D:/VietPhuc-DP-main/assets/guocmoc.png) | 754×2084 | 377:1042 | Trong suốt | Guốc mộc | `footwear` | Nữ |
| 10 | [khandong.jpg](D:/VietPhuc-DP-main/assets/khandong.jpg) | 1024×1536 | 2:3 | Trắng | Khăn đóng (theo tên file) | `headwear` | Cần đặt lên canvas |
| 11 | [nonla.jpg](D:/VietPhuc-DP-main/assets/nonla.jpg) | 1024×1536 | 2:3 | Trắng | Nón lá | `headwear` | Cần đặt lên canvas |
| 12 | [nonquaithao.jpg](D:/VietPhuc-DP-main/assets/nonquaithao.jpg) | 1024×1536 | 2:3 | Trắng | Nón quai thao | `headwear` | Cần đặt lên canvas |
| 13 | [quanbaba.png](D:/VietPhuc-DP-main/assets/quanbaba.png) | 755×2084 | 755:2084 | Trong suốt | Quần bà ba (theo tên file) | `bottom` | Nữ |
| 14 | [vaydup.png](D:/VietPhuc-DP-main/assets/vaydup.png) | 1254×1254 | 1:1 | Trong suốt | Váy đụp (theo tên file) | `bottom` | Cần đặt lên canvas |
| 15 | [quan-aodai-fit-body2.png](D:/VietPhuc-DP-main/assets/quan-aodai-fit-body2.png) | 755×2084 | 755:2084 | Trong suốt | Quần áo dài trắng ngà | `bottom` | Nữ |

Đúng tỉ lệ canvas không chứng nhận fit và không xác lập quy tắc giới tính văn hóa. Body nam 118×308, body nữ 105×290.

## Nhận xét nguồn

- **aobaba.png:** PNG áo riêng, tay phải đã gập. Khung gần tỉ lệ body nữ; còn viền trắng/đỏ cần xem khi fit.
- **aodai-fit-body2.png:** Áo riêng trên canvas body nữ. File aodai.png đã bỏ; dùng aodai-fit-body2.png. Căn bằng kích thước và vị trí theo ảnh tham chiếu người dùng, giữ hình dáng áo.
- **aogiaolinh.png:** PNG áo riêng, tay phải đã gập; khung gần body nam. Chưa xác nhận cổ, vai, eo và gấu đạt sai số fit 1–2%.
- **aonguthan_female.png:** PNG áo riêng, khung nữ, tay phải gập. Cần kiểm tra mốc cổ và gấu khi ghép; không coi đúng canvas là fit đạt.
- **aonguthan_male.png:** PNG áo riêng, khung nam, tay phải gập. Giữ riêng biến thể nam; cần QA mốc cổ/tay/gấu.
- **aonhatbinh.png:** PNG áo riêng, vùng hở cổ đã trong suốt, tay phải gập và tay áo rộng. Khung gần body nữ; cần kiểm tra cổ, vai và cổ tay.
- **aotuthan.png:** PNG áo riêng, thân trước mở, có dây buộc eo; tay phải gập. Khung gần body nữ; cần lớp trong và kiểm tra mốc eo.
- **aoyiem.png:** PNG món riêng, khung nữ. Điểm ảnh rõ trên cùng ở y≈575/2084, tương đương y≈80 trên body cao290; khác mốc cổ y≈48 của renderer, cần căn lại.
- **guocmoc.png:** PNG đôi guốc riêng, khung gần nữ. Vùng rõ trải rộng khoảng 96 px khi quy về body rộng 105 px; cần thu và căn từng bàn chân, chưa fit đạt.
- **khandong.jpg:** JPG nền trắng, không alpha. Cần duyệt tên khăn đóng/khăn vấn, tách nền và đặt theo đầu body ở bước tiếp theo.
- **nonla.jpg:** JPG nền trắng, không alpha, có quai nón. Chưa phải lớp toàn body; cần tách nền và kiểm tra quai quanh mặt/cổ.
- **nonquaithao.jpg:** JPG nền trắng, không alpha, có hai dải quai. Chưa phải lớp toàn body; cần xem góc và fit trên đầu.
- **quanbaba.png:** PNG quần riêng, khung gần nữ nhưng cạp bắt đầu khoảngy432/2084 → y60 trên body 290; vùng eo renderer khoảngy115. Cần dịch/căn lại trước khi dùng.
- **vaydup.png:** PNG váy riêng, canvas vuông1254×1254, chưa phải lớp toàn body. Cần đặt lên khung body, căn eo và gấu. Id long-skirt chỉ là đề xuất: chưa có entry trong LAYER_ITEMS.
- **quan-aodai-fit-body2.png:** Ảnh mới người dùng bổ sung, canvas body nữ. Căn cạp quần và ống quần bằng scale/offset; giữ nguyên tỉ lệ món, không kéo riêng từng đoạn.

## Alpha nguồn

| PNG | Alpha <16 | Bbox alpha >128 [x0,y0,x1,y1] |
| --- | --- | --- |
| aobaba.png | 77.43% | [22, 376, 736, 1105] |
| aodai-fit-body2.png | 61.01% | [71, 289, 710, 1812] |
| aogiaolinh.png | 47.97% | [44, 327, 747, 1953] |
| aonguthan_female.png | 48.14% | [18, 275, 729, 1968] |
| aonguthan_male.png | 48.77% | [33, 284, 739, 1868] |
| aonhatbinh.png | 49.77% | [13, 382, 733, 1919] |
| aotuthan.png | 57.07% | [20, 302, 738, 1825] |
| aoyiem.png | 90.81% | [153, 575, 603, 1189] |
| guocmoc.png | 90.96% | [37, 1694, 724, 2040] |
| quanbaba.png | 57.71% | [63, 432, 708, 1891] |
| vaydup.png | 51.69% | [154, 26, 1101, 1216] |
| quan-aodai-fit-body2.png | 69.17% | [133, 579, 638, 1895] |

Đo bằng Pillow và NumPy, SHA-256 lưu trong ASSET_INVENTORY_DRAFT.json. Không chỉnh sửa ảnh nguồn. Mọi nội dung văn hóa có sources: [] và needsVerification: true, chưa có nhận định lịch sử đã kiểm chứng.

Cách chạy lại: `python tools/refresh_asset_inventory.py`. Kết quả căn ảnh và trạng thái từng body xem assets/clothing_manifest.json và assets/review sau khi chạy pipeline; inventory nguồn không phải catalog.
