/**
 * @file data.js
 * @class VietPhucDatabase
 * AUTO-GENERATED bởi build_data.py (v2), đừng sửa tay.
 *
 * API cũ giữ nguyên: getById, getAll, getByCategory, getByRegion,
 * getByCategoryAndRegion, getCategories, getGlobalRules, count, search.
 *
 * API mới:
 *   getSources(id) / getSourceById(sid) / getBestTier(id)   nguồn của một món
 *   getAiLayer(id)                                           dữ liệu AI (luôn là gợi ý)
 *   getAdvisories(id)                                        lưu ý văn hóa CÓ NGUỒN
 *   getExternalTags()                                        món ngoài CSDL để thử phối
 *   getDevNotes()                                            ghi chú cho người làm dữ liệu
 *   checkOutfit(itemIds, opts)                               kiểm tra một bộ đồ
 *   getSoftConflictIds(itemIds)                              món có thể không hợp (chỉ để đánh dấu)
 */
const PAYLOAD = {
 "items": [
  {
   "item_id": "ao_tu_than_001",
   "name": "Áo tứ thân",
   "aliases": [
    "Áo dài tứ thân"
   ],
   "category": "Áo khoác ngoài",
   "filters": {
    "region": [
     "Bắc Bộ"
    ],
    "era": [],
    "events": [
     "Sinh hoạt đời thường",
     "Lễ hội",
     "Lễ nghi",
     "Tiếp khách",
     "Biểu diễn"
    ],
    "suitable_body_types": [],
    "color_tags": [
     "nâu già",
     "nâu non",
     "đen",
     "cánh gián"
    ]
   },
   "rules": {
    "required_matches": [
     "ao_yem_001",
     "khan_mo_qua_001",
     "non_quai_thao_001"
    ],
    "common_pairings": [
     "vay_dup_001",
     "quan_nai_den_001",
     "dai_lung_hoa_ly_001",
     "guoc_moc_001",
     "dep_cong_001",
     "toc_duoi_ga_001"
    ],
    "other_pairings_text": [
     "áo cánh mỏng màu trắng, vàng hoặc ngà mặc bên trong",
     "dây lưng xanh"
    ],
    "incompatible_items": [],
    "incompatible_colors": [],
    "red_flags": [
     "Áo có thêm tà kép vẫn không được gọi là áo năm thân (Võ Quang Yến): không gán nhãn ngũ thân cho tứ thân.",
     "Chi tiết tà áo: hai nguồn gán ngược nhau cho cha mẹ đẻ và cha mẹ chồng; xem conflicts."
    ]
   },
   "cultural_context": {
    "historical_meaning": "Bốn tà tượng trưng cho tứ thân phụ mẫu (cha mẹ đẻ và cha mẹ chồng), nhắc đạo hiếu. Danh từ tứ thân luôn đi cùng cụm tứ thân phụ mẫu dù áo được cải tiến. Nhiều nhà nghiên cứu cho là tiến hóa từ áo đối khâm; Trịnh Bách (Hội LHPN VN) cho rằng dạng áo tứ thân cổ của Trung Hoa rất giống bản Việt, bản Việt về sau có thêm cổ đứng.",
    "traditional_material": [
     "vải nâu",
     "vải mộc",
     "the",
     "tơ tằm",
     "lụa"
    ],
    "construction": "4 tà hợp thành 2 vạt; hai vạt trước tách rời, vắt chéo, thắt lưng giữ hoặc buộc thả trước bụng; hai vạt sau khâu liền thành sống áo; dài tới quá gối khoảng 20 cm (một nguồn nói buông tới gót); ban đầu không khuy, về sau có khuy nhỏ cài bên nách. Mặc đôi ba lớp thành mớ ba mớ bảy.",
    "notes": [
     "Vùng: Gắn với phụ nữ Kinh Bắc và nông thôn Bắc Bộ",
     "Niên đại: Nguồn tốt nhất (Võ Quang Yến, diendan.org): áo bắt đầu được thấy nhiều từ thập niên 20-30 thế kỷ XX, không rõ xuất hiện từ bao giờ. Các blog nêu Lý-Trần hoặc Văn Lang-Âu Lạc chưa có chứng cứ."
    ],
    "conflicts": [
     "Tà trước = cha mẹ chồng, tà sau = cha mẹ đẻ (sevenam.vn) đối lập với tà trước = cha mẹ đẻ, tà sau = cha mẹ chồng (veronicawedding.com).",
     "Nguồn gốc: đối khâm (nhiều nguồn) so với nhập từ dạng áo dài tứ thân Trung Hoa (Trịnh Bách)."
    ]
   },
   "source_ids": [
    "src_001",
    "src_002",
    "src_003",
    "src_004",
    "src_005",
    "src_006"
   ],
   "emoji": "👘"
  },
  {
   "item_id": "ao_yem_001",
   "name": "Áo yếm",
   "aliases": [
    "Yếm",
    "Yếm đào"
   ],
   "category": "Áo lót trong",
   "filters": {
    "region": [
     "Bắc Bộ"
    ],
    "era": [
     "Trần",
     "Nguyễn"
    ],
    "events": [
     "Sinh hoạt đời thường",
     "Lễ hội"
    ],
    "suitable_body_types": [],
    "color_tags": [
     "đỏ",
     "đào",
     "nâu",
     "vàng",
     "trắng",
     "ngà"
    ]
   },
   "rules": {
    "required_matches": [],
    "common_pairings": [
     "ao_tu_than_001"
    ],
    "other_pairings_text": [
     "áo dài",
     "áo mớ ba mớ bảy (dịp hội hè)"
    ],
    "incompatible_items": [],
    "incompatible_colors": [],
    "red_flags": [
     "Báo Pháp luật VN dẫn họa sĩ, nhà nghiên cứu Nguyễn Đức Bình: yếm cách tân bằng chất liệu mỏng tang, trong suốt, lộ cơ thể là biến tướng phản cảm.",
     "Theo blog thời trang (theciu.vn, độ tin cậy thấp): yếm vàng chỉ dành cho hoàng thất, cấm dân gian; màu hoa đào gắn với ca kỹ."
    ]
   },
   "cultural_context": {
    "historical_meaning": "Xuất xứ là mảnh vải vuông che ngực có dây buộc ở gáy và lưng, ban đầu cả nam và nữ dùng, sau dành riêng cho phụ nữ. Thiết kế khoe lưng ong, là một phần trong tổng thể trang phục phụ nữ Việt và là nguồn cảm hứng thi ca, hội họa.",
    "traditional_material": [
     "vải thô nhuộm nâu vỏ cây (lao động)",
     "lụa",
     "gấm",
     "lụa trắng hoặc ngà"
    ],
    "construction": "Thế kỷ 19: hình vuông vắt chéo trước ngực, góc trên khoét lỗ làm cổ, hai dây buộc sau gáy, hai dây bên buộc ngang lưng.",
    "notes": [
     "Vùng: Nguồn nêu đời sống thôn quê Bắc Bộ và trang phục Thăng Long xưa; bktt.vn nói phụ nữ Kinh nói chung",
     "Niên đại: bktt.vn: dùng phổ biến từ thời Trần đến hết thời Nguyễn (1945). Báo Pháp luật VN: ghi nhận lần đầu thế kỷ 12 triều Lý. Một số nguồn nêu thế kỷ 17-18 (chưa kiểm chứng)."
    ],
    "conflicts": [
     "Mốc xuất hiện: Trần (XII-XIV theo bktt.vn; Trần thực tế thuộc XIII-XIV), Lý thế kỷ 12, hoặc thế kỷ 17-18.",
     "Yếm đào vừa là hình ảnh tiêu biểu của thiếu nữ, vừa bị một blog gắn với ca kỹ."
    ]
   },
   "source_ids": [
    "src_007",
    "src_008",
    "src_009",
    "src_010",
    "src_011"
   ],
   "emoji": "🎗️"
  },
  {
   "item_id": "ao_giao_linh_001",
   "name": "Áo giao lĩnh",
   "aliases": [
    "Áo tràng vạt",
    "Áo cổ chéo"
   ],
   "category": "Áo khoác ngoài",
   "filters": {
    "region": [
     "Bắc Bộ"
    ],
    "era": [
     "Lý",
     "Trần",
     "Lê",
     "Nguyễn"
    ],
    "events": [
     "Lễ nghi"
    ],
    "suitable_body_types": [],
    "color_tags": [
     "xanh",
     "đen",
     "nâu",
     "trắng (thắt lưng)"
    ]
   },
   "rules": {
    "required_matches": [],
    "common_pairings": [],
    "other_pairings_text": [
     "thường (váy quây) bên dưới, với giao lĩnh vạt ngắn",
     "thắt lưng (nữ)"
    ],
    "incompatible_items": [],
    "incompatible_colors": [],
    "red_flags": [
     "Giao lĩnh thời Lê phân biệt với thời Minh và Triều Tiên ở cổ: thời Minh cổ thẳng và kéo kín hơn.",
     "Giao lĩnh vạt ngắn thời Lê: thường quây ngoài ngắn hơn váy trong, lộ hai lớp."
    ]
   },
   "cultural_context": {
    "historical_meaning": "Tác giả sách Ngàn năm áo mũ coi giao lĩnh-tràng vạt là quốc phục của triều Lê, tương tự vị thế áo dài cổ đứng của triều Nguyễn. Được xem là kiểu dáng sơ khai của áo dài. Thường dùng làm lễ phục, tế phục mặc phủ ngoài.",
    "traditional_material": [],
    "construction": "Cổ chéo: vạt trái buộc chéo sang nách phải; hai tà trước may rời và thường buộc vào nhau; có dạng vạt dài (cả nam nữ) và vạt ngắn (thường cho nữ).",
    "notes": [
     "Vùng: Đại Việt nói chung; ở Đàng Ngoài áo cổ chéo còn tiếp tục cho tới khi nhà Nguyễn thống nhất",
     "Niên đại: Phổ biến Lý-Trần-Lê; thời Nguyễn chỉ còn dùng trong dịp trang trọng (Wikipedia). Nguồn gốc: có lẽ từ thời Bắc thuộc lần thứ nhất (Đông Hán)."
    ],
    "conflicts": [
     "Mốc xuất hiện: Đông Hán (Wikipedia, cophong.vn), Lý thế kỷ XI (blog), thế kỷ 17-18 (blog, nhiều khả năng là giai đoạn phổ biến).",
     "cophong.vn nói nguồn gốc Trung Quốc; blog khác coi là Việt phục, chưa thống nhất."
    ]
   },
   "source_ids": [
    "src_012",
    "src_013",
    "src_014",
    "src_015"
   ],
   "emoji": "🎎"
  },
  {
   "item_id": "ao_ngu_than_tay_thung_001",
   "name": "Áo ngũ thân tay thụng (áo tấc, nam)",
   "aliases": [
    "Áo tấc",
    "Áo lễ",
    "Áo thụng",
    "Áo ngũ thân lập lĩnh tay thụng"
   ],
   "category": "Áo khoác ngoài",
   "filters": {
    "region": [
     "Trung Bộ"
    ],
    "era": [
     "Nguyễn"
    ],
    "events": [
     "Lễ nghi"
    ],
    "suitable_body_types": [],
    "color_tags": []
   },
   "rules": {
    "required_matches": [],
    "common_pairings": [
     "khan_dong_001",
     "quan_trang_ong_rong_001",
     "guoc_moc_001"
    ],
    "other_pairings_text": [
     "quần dài"
    ],
    "incompatible_items": [],
    "incompatible_colors": [],
    "red_flags": [
     "Lỗi thường gặp: may tay bó nách. Tay thụng đúng là hình chữ nhật, hai bề song song; chắp tay trước ngực tạo hình vuông (nguồn: bài phân tích của cộng đồng, thap)."
    ]
   },
   "cultural_context": {
    "historical_meaning": "Cổ cao, thẳng, vuông tượng trưng sự chính trực của người quân tử. Năm thân gồm 4 thân chính và 1 thân con nằm phía trước bên phải, bên trong vạt đầu. Có ý kiến 4 thân là tứ thân phụ mẫu (hoặc trời đất, phụ mẫu) và thân con là bản thân người mặc. Lê Quý Đôn ghi chép thay đổi ăn mặc ở Nam Hà trong Phủ biên tạp lục.",
    "traditional_material": [
     "sa",
     "tơ",
     "gấm trơn",
     "hoa văn long, phượng, chữ thọ (loại có hoa văn)"
    ],
    "construction": "Cổ lập lĩnh, 5 cúc bên phải; thân không chiết eo, vạt xòe cong; tay thụng rộng thêm khoảng 20-30 cm, dài bằng hoặc hơn tà áo; tay nối từ phần vải thân kéo dài đến nửa cánh tay; trải phẳng thì vai và tay thành một đường thẳng.",
    "notes": [
     "Vùng: Trung Bộ gốc; từ thời Minh Mạng phổ biến cả nước",
     "Niên đại: Ra đời 1744 (chúa Nguyễn Phúc Khoát). Wikipedia: Minh Mạng quy định năm 1830; namtuyen.com: phổ biến cả ba miền 1837-1945 như quốc phục."
    ],
    "conflicts": [
     "Nghĩa các thân: (a) 4 thân=tứ thân phụ mẫu + thân con=bản thân; (b) 2 thân trước=cha mẹ, 2 thân sau=ông bà, thân con=người mặc (mingstudio.com.vn); (c) cha mẹ đẻ, cha mẹ vợ/chồng + bản thân (webtretho).",
     "vietphuc.net ghi Nguyễn Phúc Khoát quy định 'từ năm 1837', lệch mốc 1744; có thể là mốc quốc phục thời Minh Mạng bị gán nhầm."
    ]
   },
   "source_ids": [
    "src_016",
    "src_017",
    "src_018",
    "src_019",
    "src_020",
    "src_021",
    "src_013",
    "src_022"
   ],
   "emoji": "🥻"
  },
  {
   "item_id": "ao_ngu_than_tay_chen_001",
   "name": "Áo ngũ thân tay chẽn (nam)",
   "aliases": [
    "Áo ngũ thân"
   ],
   "category": "Áo khoác ngoài",
   "filters": {
    "region": [
     "Trung Bộ"
    ],
    "era": [
     "Nguyễn"
    ],
    "events": [
     "Sinh hoạt đời thường"
    ],
    "suitable_body_types": [],
    "color_tags": []
   },
   "rules": {
    "required_matches": [],
    "common_pairings": [
     "khan_dong_001",
     "quan_trang_ong_rong_001",
     "guoc_moc_001"
    ],
    "other_pairings_text": [],
    "incompatible_items": [],
    "incompatible_colors": [],
    "red_flags": []
   },
   "cultural_context": {
    "historical_meaning": "Như áo tấc về cấu trúc năm thân và cổ lập lĩnh. VietnamPlus xếp tay chẽn vào loại thường phục.",
    "traditional_material": [
     "sa",
     "tơ",
     "gấm trơn",
     "hoa văn long, phượng (loại có hoa văn)"
    ],
    "construction": "Thân như áo tấc; từ khuỷu tay đến quá cổ tay khoảng 2 cm may ống hẹp bó chẽn; hai thân trước dài quá đầu gối khoảng 5-7 cm; tay áo gọn hơn áo tấc và áo giao lĩnh; trải phẳng vai và tay thành một đường thẳng.",
    "notes": [
     "Vùng: Như áo tấc",
     "Niên đại: Như áo tấc"
    ],
    "conflicts": []
   },
   "source_ids": [
    "src_016",
    "src_023",
    "src_024",
    "src_017",
    "src_019"
   ],
   "emoji": "🥻"
  },
  {
   "item_id": "ao_nhat_binh_001",
   "name": "Áo Nhật Bình",
   "aliases": [
    "Áo dài Nhật Bình"
   ],
   "category": "Áo khoác ngoài",
   "filters": {
    "region": [
     "Trung Bộ"
    ],
    "era": [
     "Nguyễn"
    ],
    "events": [
     "Lễ tết",
     "Cưới hỏi"
    ],
    "suitable_body_types": [],
    "color_tags": [
     "vàng",
     "cam",
     "đỏ",
     "xích đào",
     "tím nhạt"
    ]
   },
   "rules": {
    "required_matches": [],
    "common_pairings": [],
    "other_pairings_text": [
     "trâm hoa"
    ],
    "incompatible_items": [],
    "incompatible_colors": [],
    "red_flags": [
     "Hoa văn và màu sắc sắp xếp theo cấp bậc: nhìn vào biết địa vị người mặc; quy chế này không áp dụng cho hoàng hậu. Đầu triều Nguyễn phải tuân thủ đúng quy chế màu và thứ bậc (tulinhboutique.com)."
    ]
   },
   "cultural_context": {
    "historical_meaning": "Nguyên mẫu là áo Phi Phong đối khâm thời Minh, được triều Nguyễn tiếp thu. Tên gọi từ việc hoa văn ở cổ tạo thành hình chữ Nhật lớn trước ngực khi hai vạt được buộc lại. Đề tài trang trí phản ánh cấu trúc tầng lớp phong kiến và tư tưởng Nho giáo (nghiên cứu về áo Nhật Bình của Đoan Huy Hoàng thái hậu).",
    "traditional_material": [
     "sa sợi đỏ (công chúa)",
     "sợi sa (cung tần nhị giai)",
     "sa sợi vàng (hoàng hậu, nguồn thap)"
    ],
    "construction": "Đối khâm, dáng to bản; dải vải buộc hai vạt dưới ức; hoa văn chính hình tròn khép kín (phượng ổ, loan ổ); hoa văn phụ chữ thọ, chữ phúc, bát bửu, hoa dây, hoa lựu; chân áo có sóng nước (thủy ba).",
    "notes": [
     "Vùng: Trung Bộ; đối tượng là nữ",
     "Niên đại: 1802-1945"
    ],
    "conflicts": [
     "tulinhboutique.com dẫn 'Khâm định Đại Nam hội điển sự lệ' kèm mốc 1807; mốc này cần đối chiếu, xem file AI_GENERATED.",
     "Một số blog nói dải ngũ sắc ngũ hành ở tay/cổ, nơi khác chỉ nói hoàng hậu trở lên không dùng; chưa kiểm chứng độc lập."
    ]
   },
   "source_ids": [
    "src_025",
    "src_026",
    "src_027",
    "src_028",
    "src_029"
   ],
   "emoji": "🎏"
  },
  {
   "item_id": "ao_ba_ba_001",
   "name": "Áo bà ba",
   "aliases": [
    "Bộ bà ba"
   ],
   "category": "Áo khoác ngoài",
   "filters": {
    "region": [
     "Nam Bộ"
    ],
    "era": [],
    "events": [
     "Sinh hoạt đời thường",
     "Lễ hội"
    ],
    "suitable_body_types": [],
    "color_tags": [
     "đen"
    ]
   },
   "rules": {
    "required_matches": [],
    "common_pairings": [
     "khan_ran_001"
    ],
    "other_pairings_text": [
     "nón lá",
     "áo túi mặc trong (nữ, thế kỷ 20)",
     "áo lá (nam, thế kỷ 20)"
    ],
    "incompatible_items": [],
    "incompatible_colors": [],
    "red_flags": []
   },
   "cultural_context": {
    "historical_meaning": "Minh chứng giao thoa văn hóa Nam Bộ; du nhập rồi được Việt hóa cho hợp khí hậu, đời sống sông nước. Khăn rằn, áo bà ba, nón lá là bộ ba gần như luôn đi cùng của người Kinh Nam Bộ.",
    "traditional_material": [
     "vải thô",
     "gấm (loại sang trọng)"
    ],
    "construction": "Cổ tròn, tay dài hoặc ngắn, thân dài xẻ hai bên vạt (anhminhtextile.com). Xưa dạng vạt hò nút thắt, sau chuyển sang nút bấm ở giữa (nhà nghiên cứu Nhâm Hùng, Thanh Niên).",
    "notes": [
     "Vùng: Miền Tây Nam Bộ, vùng sông nước",
     "Niên đại: Nguồn chưa thống nhất: thế kỷ 19 (Thanh Niên, vanhoavaphattrien.vn); nửa cuối XIX (Huỳnh Ngọc Trảng); cuối XIX đầu XX (blog). Thế kỷ 20 xuất hiện áo túi (nữ) và áo lá (nam) mặc kèm."
    ],
    "conflicts": [
     "Nguồn gốc: (1) Trương Vĩnh Ký cách tân từ áo dân đảo Penang; (2) cộng đồng Mã Lai lai Hoa (Huỳnh Ngọc Trảng, Sơn Nam); (3) người di cư cách tân áo dài; (4) từ áo lá, áo xá xẩu của người Hoa; (5) blog nói từ người Chăm, độ tin cậy thấp."
    ]
   },
   "source_ids": [
    "src_030",
    "src_031",
    "src_032",
    "src_033",
    "src_034"
   ],
   "emoji": "👚"
  },
  {
   "item_id": "vay_dup_001",
   "name": "Váy đụp",
   "aliases": [],
   "category": "Quần/Váy",
   "filters": {
    "region": [
     "Bắc Bộ"
    ],
    "era": [],
    "events": [
     "Sinh hoạt đời thường"
    ],
    "suitable_body_types": [],
    "color_tags": []
   },
   "rules": {
    "required_matches": [],
    "common_pairings": [
     "ao_tu_than_001"
    ],
    "other_pairings_text": [],
    "incompatible_items": [],
    "incompatible_colors": [],
    "red_flags": []
   },
   "cultural_context": {
    "historical_meaning": "Cùng đôi guốc mộc, biểu tượng lao động cần cù, gắn bó đồng ruộng (nguồn thap).",
    "traditional_material": [],
    "construction": "",
    "notes": [
     "Vùng: Đi cùng áo tứ thân"
    ],
    "conflicts": [
     "Võ Quang Yến nêu quần nái đen trong bộ tứ thân, nguồn khác nêu váy đụp; chưa rõ là hai biến thể hay khác vùng/thời."
    ]
   },
   "source_ids": [
    "src_035",
    "src_005"
   ],
   "emoji": "👗"
  },
  {
   "item_id": "quan_nai_den_001",
   "name": "Quần nái đen",
   "aliases": [],
   "category": "Quần/Váy",
   "filters": {
    "region": [
     "Bắc Bộ"
    ],
    "era": [],
    "events": [
     "Sinh hoạt đời thường"
    ],
    "suitable_body_types": [],
    "color_tags": [
     "đen"
    ]
   },
   "rules": {
    "required_matches": [],
    "common_pairings": [
     "ao_tu_than_001"
    ],
    "other_pairings_text": [],
    "incompatible_items": [],
    "incompatible_colors": [],
    "red_flags": []
   },
   "cultural_context": {
    "historical_meaning": "",
    "traditional_material": [],
    "construction": "",
    "notes": [
     "Vùng: Đi cùng áo tứ thân (Võ Quang Yến)"
    ],
    "conflicts": []
   },
   "source_ids": [
    "src_001"
   ],
   "emoji": "👖"
  },
  {
   "item_id": "khan_mo_qua_001",
   "name": "Khăn mỏ quạ",
   "aliases": [],
   "category": "Phụ kiện đầu",
   "filters": {
    "region": [
     "Bắc Bộ"
    ],
    "era": [],
    "events": [
     "Sinh hoạt đời thường",
     "Lễ hội",
     "Biểu diễn"
    ],
    "suitable_body_types": [],
    "color_tags": [
     "đen"
    ]
   },
   "rules": {
    "required_matches": [],
    "common_pairings": [
     "ao_tu_than_001",
     "toc_duoi_ga_001"
    ],
    "other_pairings_text": [],
    "incompatible_items": [],
    "incompatible_colors": [],
    "red_flags": [
     "Chít vừa mặt, tạo dáng búp sen; chít mỏ quá cao hoặc quá thấp đều không hợp (báo Tây Ninh, vacne.org.vn)."
    ]
   },
   "cultural_context": {
    "historical_meaning": "Được xem là vật làm duyên của người con gái Kinh Bắc; một blog gán ý nghĩa tiết hạnh (thap).",
    "traditional_material": [],
    "construction": "Khăn vuông gấp chéo thành hình tam giác, bẻ mỏ quạ chính giữa đường ngôi, hai góc về hai phía tai và thắt múi ở gáy; bên trong tóc vấn tròn trong khăn vấn.",
    "notes": [
     "Vùng: Phụ nữ Kinh Bắc, liền chị quan họ"
    ],
    "conflicts": []
   },
   "source_ids": [
    "src_036",
    "src_004"
   ],
   "emoji": "🧣"
  },
  {
   "item_id": "non_quai_thao_001",
   "name": "Nón quai thao",
   "aliases": [
    "Nón thúng quai thao"
   ],
   "category": "Phụ kiện đầu",
   "filters": {
    "region": [
     "Bắc Bộ"
    ],
    "era": [],
    "events": [
     "Lễ hội",
     "Biểu diễn"
    ],
    "suitable_body_types": [],
    "color_tags": []
   },
   "rules": {
    "required_matches": [],
    "common_pairings": [
     "ao_tu_than_001"
    ],
    "other_pairings_text": [],
    "incompatible_items": [],
    "incompatible_colors": [],
    "red_flags": []
   },
   "cultural_context": {
    "historical_meaning": "Một blog gán ý nghĩa khéo léo (thap).",
    "traditional_material": [],
    "construction": "Nón vành rộng, đội nghiêng che nắng.",
    "notes": [
     "Vùng: Phụ nữ Kinh Bắc"
    ],
    "conflicts": []
   },
   "source_ids": [
    "src_003",
    "src_035"
   ],
   "emoji": "🎩"
  },
  {
   "item_id": "dai_lung_hoa_ly_001",
   "name": "Thắt lưng (hoa lý) đeo dây xà tích",
   "aliases": [
    "Dây lưng xanh"
   ],
   "category": "Phụ kiện thân",
   "filters": {
    "region": [
     "Bắc Bộ"
    ],
    "era": [],
    "events": [
     "Lễ hội"
    ],
    "suitable_body_types": [],
    "color_tags": [
     "xanh"
    ]
   },
   "rules": {
    "required_matches": [],
    "common_pairings": [
     "ao_tu_than_001"
    ],
    "other_pairings_text": [],
    "incompatible_items": [],
    "incompatible_colors": [],
    "red_flags": []
   },
   "cultural_context": {
    "historical_meaning": "",
    "traditional_material": [
     "lụa"
    ],
    "construction": "Thắt lưng lụa thắt hờ ở eo, có dây xà tích đeo kèm (liền chị).",
    "notes": [
     "Vùng: Trang phục liền chị quan họ"
    ],
    "conflicts": []
   },
   "source_ids": [
    "src_003",
    "src_035"
   ],
   "emoji": "🎀"
  },
  {
   "item_id": "toc_duoi_ga_001",
   "name": "Tóc đuôi gà",
   "aliases": [
    "Vấn tóc"
   ],
   "category": "Phụ kiện đầu",
   "filters": {
    "region": [
     "Bắc Bộ"
    ],
    "era": [],
    "events": [],
    "suitable_body_types": [],
    "color_tags": []
   },
   "rules": {
    "required_matches": [],
    "common_pairings": [
     "ao_tu_than_001",
     "khan_mo_qua_001"
    ],
    "other_pairings_text": [],
    "incompatible_items": [],
    "incompatible_colors": [],
    "red_flags": []
   },
   "cultural_context": {
    "historical_meaning": "",
    "traditional_material": [],
    "construction": "",
    "notes": [
     "Vùng: Đi cùng áo tứ thân, khăn mỏ quạ (Võ Quang Yến)"
    ],
    "conflicts": []
   },
   "source_ids": [
    "src_001"
   ],
   "emoji": "💇"
  },
  {
   "item_id": "guoc_moc_001",
   "name": "Guốc mộc",
   "aliases": [
    "Guốc gỗ"
   ],
   "category": "Giày dép",
   "filters": {
    "region": [
     "Bắc Bộ",
     "Trung Bộ"
    ],
    "era": [],
    "events": [
     "Sinh hoạt đời thường"
    ],
    "suitable_body_types": [],
    "color_tags": []
   },
   "rules": {
    "required_matches": [],
    "common_pairings": [
     "ao_tu_than_001",
     "ao_ngu_than_tay_thung_001",
     "ao_ngu_than_tay_chen_001"
    ],
    "other_pairings_text": [],
    "incompatible_items": [],
    "incompatible_colors": [],
    "red_flags": []
   },
   "cultural_context": {
    "historical_meaning": "Cùng váy đụp, biểu tượng lao động cần cù (nguồn thap).",
    "traditional_material": [
     "gỗ"
    ],
    "construction": "Gót thấp (theo hướng dẫn mặc tứ thân của trangphuchonghanh.com).",
    "notes": [
     "Vùng: Đi cùng áo tứ thân; nguồn blog cũng nêu đi cùng áo ngũ thân"
    ],
    "conflicts": [
     "Nguồn thap gọi 'hia mộc' là guốc gỗ; chưa kiểm chứng."
    ]
   },
   "source_ids": [
    "src_003",
    "src_037",
    "src_038"
   ],
   "emoji": "👡"
  },
  {
   "item_id": "dep_cong_001",
   "name": "Dép cong",
   "aliases": [],
   "category": "Giày dép",
   "filters": {
    "region": [
     "Bắc Bộ"
    ],
    "era": [],
    "events": [],
    "suitable_body_types": [],
    "color_tags": []
   },
   "rules": {
    "required_matches": [],
    "common_pairings": [
     "ao_tu_than_001"
    ],
    "other_pairings_text": [],
    "incompatible_items": [],
    "incompatible_colors": [],
    "red_flags": []
   },
   "cultural_context": {
    "historical_meaning": "",
    "traditional_material": [],
    "construction": "",
    "notes": [
     "Vùng: Trang phục nữ Kinh Bắc (một cửa hàng cho thuê trang phục)"
    ],
    "conflicts": []
   },
   "source_ids": [
    "src_011"
   ],
   "emoji": "👞"
  },
  {
   "item_id": "khan_dong_001",
   "name": "Khăn đóng",
   "aliases": [
    "Khăn quấn",
    "Khăn lươn"
   ],
   "category": "Phụ kiện đầu",
   "filters": {
    "region": [
     "Trung Bộ"
    ],
    "era": [
     "Nguyễn"
    ],
    "events": [
     "Lễ nghi",
     "Sinh hoạt đời thường"
    ],
    "suitable_body_types": [],
    "color_tags": [
     "đen"
    ]
   },
   "rules": {
    "required_matches": [],
    "common_pairings": [
     "ao_ngu_than_tay_thung_001",
     "ao_ngu_than_tay_chen_001"
    ],
    "other_pairings_text": [],
    "incompatible_items": [],
    "incompatible_colors": [],
    "red_flags": []
   },
   "cultural_context": {
    "historical_meaning": "Tượng trưng lòng trung hiếu, nhân nghĩa của đấng nam nhi (cardina.vn, thap).",
    "traditional_material": [],
    "construction": "Quấn thành hình chữ nhân hoặc chữ nhất ở mặt trước, mặt sau quấn chặt giữ búi tóc.",
    "notes": [
     "Vùng: Đi cùng áo ngũ thân"
    ],
    "conflicts": [
     "bbcosplay.com: khăn đóng cho nam, khăn lươn cho nữ; webtretho.vn và cardina.vn coi khăn lươn là khăn đóng của nam."
    ]
   },
   "source_ids": [
    "src_038",
    "src_019",
    "src_039"
   ],
   "emoji": "🧢"
  },
  {
   "item_id": "quan_trang_ong_rong_001",
   "name": "Quần ống rộng trắng",
   "aliases": [],
   "category": "Quần/Váy",
   "filters": {
    "region": [
     "Trung Bộ"
    ],
    "era": [
     "Nguyễn"
    ],
    "events": [],
    "suitable_body_types": [],
    "color_tags": [
     "trắng"
    ]
   },
   "rules": {
    "required_matches": [],
    "common_pairings": [
     "ao_ngu_than_tay_thung_001",
     "ao_ngu_than_tay_chen_001"
    ],
    "other_pairings_text": [],
    "incompatible_items": [],
    "incompatible_colors": [],
    "red_flags": []
   },
   "cultural_context": {
    "historical_meaning": "",
    "traditional_material": [],
    "construction": "Quần ống rộng; nam giới có thể mặc quần trùng màu áo (webtretho.vn).",
    "notes": [
     "Vùng: Mặc với áo ngũ thân"
    ],
    "conflicts": []
   },
   "source_ids": [
    "src_039",
    "src_021"
   ],
   "emoji": "👖"
  },
  {
   "item_id": "khan_ran_001",
   "name": "Khăn rằn",
   "aliases": [],
   "category": "Phụ kiện đầu",
   "filters": {
    "region": [
     "Nam Bộ"
    ],
    "era": [],
    "events": [
     "Sinh hoạt đời thường"
    ],
    "suitable_body_types": [],
    "color_tags": []
   },
   "rules": {
    "required_matches": [],
    "common_pairings": [
     "ao_ba_ba_001"
    ],
    "other_pairings_text": [
     "nón lá"
    ],
    "incompatible_items": [],
    "incompatible_colors": [],
    "red_flags": []
   },
   "cultural_context": {
    "historical_meaning": "Vật mang lại may mắn, bình an theo tín niệm dân gian (Thanh Niên).",
    "traditional_material": [],
    "construction": "",
    "notes": [
     "Vùng: Dùng chung bởi người Khmer, Kinh, Hoa và Chăm ở Nam Bộ"
    ],
    "conflicts": []
   },
   "source_ids": [
    "src_030"
   ],
   "emoji": "🧶"
  }
 ],
 "sources": [
  {
   "source_id": "src_001",
   "url": "https://www.diendan.org/phe-binh-nghien-cuu/ao-tu-than-khan-mo-qua",
   "publisher": "diendan.org",
   "tier": "trung_binh"
  },
  {
   "source_id": "src_002",
   "url": "https://hoilhpn.org.vn/CmsView-EcoIT-portlet/html/print_cms.jsp?articleId=34539",
   "publisher": "hoilhpn.org.vn",
   "tier": "trung_binh"
  },
  {
   "source_id": "src_003",
   "url": "https://diendandoanhnghiep.vn/cam-xuc-xuan-tan-man-ve-nep-ao-tu-than-xua-10086361.html",
   "publisher": "diendandoanhnghiep.vn",
   "tier": "trung_binh"
  },
  {
   "source_id": "src_004",
   "url": "https://baotayninh.vn/phu-nu-kinh-bac-voi-chiec-khan-mo-qua-a7878.html",
   "publisher": "baotayninh.vn",
   "tier": "trung_binh"
  },
  {
   "source_id": "src_005",
   "url": "https://sevenam.vn/ao-tu-than/",
   "publisher": "sevenam.vn",
   "tier": "thap"
  },
  {
   "source_id": "src_006",
   "url": "https://ruza.vn/ao-tu-than/",
   "publisher": "ruza.vn",
   "tier": "thap"
  },
  {
   "source_id": "src_007",
   "url": "https://baophapluat.vn/dung-nhan-danh-cach-tan-de-lam-bien-dang-trang-phuc-truyen-thong-post479239.html",
   "publisher": "baophapluat.vn",
   "tier": "trung_binh"
  },
  {
   "source_id": "src_008",
   "url": "https://bktt.vn/%C3%81o_y%E1%BA%BFm",
   "publisher": "bktt.vn",
   "tier": "trung_binh"
  },
  {
   "source_id": "src_009",
   "url": "https://sites.google.com/site/cauchuyenvanhocnghethuat/vhnt-124",
   "publisher": "sites.google.com",
   "tier": "thap"
  },
  {
   "source_id": "src_010",
   "url": "https://theciu.vn/blog/ao-yem",
   "publisher": "theciu.vn",
   "tier": "thap"
  },
  {
   "source_id": "src_011",
   "url": "https://shopchothuetrangphuc.com/tin-tuc/ao-tu-than-non-quai-thao-net-duyen-dang-cua-phu-nu-kinh-bac.html",
   "publisher": "shopchothuetrangphuc.com",
   "tier": "thap"
  },
  {
   "source_id": "src_012",
   "url": "https://vi.wikipedia.org/wiki/Trang_ph%E1%BB%A5c_Vi%E1%BB%87t_Nam",
   "publisher": "vi.wikipedia.org",
   "tier": "trung_binh"
  },
  {
   "source_id": "src_013",
   "url": "https://en.wikipedia.org/wiki/%C3%81o_giao_l%C4%A9nh",
   "publisher": "en.wikipedia.org",
   "tier": "trung_binh"
  },
  {
   "source_id": "src_014",
   "url": "https://cophong.vn/ao-giao-linh-trang-phuc-truyen-thong-cua-nguoi-viet/",
   "publisher": "cophong.vn",
   "tier": "thap"
  },
  {
   "source_id": "src_015",
   "url": "https://honguyetquan.com/giao-linh-trang-phuc-co-viet-nam",
   "publisher": "honguyetquan.com",
   "tier": "thap"
  },
  {
   "source_id": "src_016",
   "url": "https://mega.vietnamplus.vn/doc-dao-ao-ngu-than-ban-sac-van-hoa-viet-5419.html",
   "publisher": "mega.vietnamplus.vn",
   "tier": "trung_binh"
  },
  {
   "source_id": "src_017",
   "url": "https://vietphuc.net/tim-hieu-ve-cac-loai-viet-phuc-thong-dung-nhat-binh-ao-tac-ngu-than-tay-chen-giao-linh-vien-linh-doi-kham",
   "publisher": "vietphuc.net",
   "tier": "thap"
  },
  {
   "source_id": "src_018",
   "url": "https://www.aodaicosau.com/2021/01/phan-tich-cau-tao-ao-ngu-than-lap-linh.html",
   "publisher": "aodaicosau.com",
   "tier": "thap"
  },
  {
   "source_id": "src_019",
   "url": "https://bbcosplay.com/ao-ngu-than/",
   "publisher": "bbcosplay.com",
   "tier": "thap"
  },
  {
   "source_id": "src_020",
   "url": "https://ivymoda.com/tin-tuc/bai-viet/ao-ngu-than-548",
   "publisher": "ivymoda.com",
   "tier": "thap"
  },
  {
   "source_id": "src_021",
   "url": "https://namtuyen.com/ao-dai-ngu-than-viet-nam-nguon-goc-y-nghia-va-gia-tri-van-hoa-truyen-thong",
   "publisher": "namtuyen.com",
   "tier": "thap"
  },
  {
   "source_id": "src_022",
   "url": "https://mingstudio.com.vn/ao-dai-ngu-than-xua-va-ve-dep-cua-trang-phuc-truyen-thong-viet/",
   "publisher": "mingstudio.com.vn",
   "tier": "thap"
  },
  {
   "source_id": "src_023",
   "url": "https://cotranghoangcung.com/y-nghia-cua-ao-dai-ngu-than/",
   "publisher": "cotranghoangcung.com",
   "tier": "thap"
  },
  {
   "source_id": "src_024",
   "url": "https://routine.vn/tin-thoi-trang/ao-ngu-than-la-gi",
   "publisher": "routine.vn",
   "tier": "thap"
  },
  {
   "source_id": "src_025",
   "url": "http://vanhoanghethuat.vn/hoa-van-trang-tri-tren-ao-nhat-binh-cua-doan-huy-hoang-thai-hau-trieu-nguyen-1802-1945.htm",
   "publisher": "vanhoanghethuat.vn",
   "tier": "trung_binh"
  },
  {
   "source_id": "src_026",
   "url": "https://phunuvietnam.vn/ao-nhat-binh-ngay-cang-duoc-ua-chuong-20221210103051442.htm",
   "publisher": "phunuvietnam.vn",
   "tier": "trung_binh"
  },
  {
   "source_id": "src_027",
   "url": "https://tulinhboutique.com/blogs/news/ao-dai-nhat-binh-van-hoa-cung-dinh-trieu-nguyen",
   "publisher": "tulinhboutique.com",
   "tier": "thap"
  },
  {
   "source_id": "src_028",
   "url": "https://marcfashion.vn/blogs/mac-dep/ao-nhat-binh",
   "publisher": "marcfashion.vn",
   "tier": "thap"
  },
  {
   "source_id": "src_029",
   "url": "https://cardina.vn/blogs/kien-thuc-thoi-trang/ao-nhat-binh-la-gi",
   "publisher": "cardina.vn",
   "tier": "thap"
  },
  {
   "source_id": "src_030",
   "url": "https://thanhnien.vn/ba-ba-khan-ran-bieu-tuong-cua-dat-va-nguoi-phuong-nam-185230426180249809.htm",
   "publisher": "thanhnien.vn",
   "tier": "trung_binh"
  },
  {
   "source_id": "src_031",
   "url": "https://vanhoavaphattrien.vn/ao-ba-ba-vi-sao-khong-la-ao-ba-tu-a6961.html",
   "publisher": "vanhoavaphattrien.vn",
   "tier": "trung_binh"
  },
  {
   "source_id": "src_032",
   "url": "https://thoitrangnamphuong.com/tin-tuc/lich-su-nguon-goc-ao-ba-ba-viet-nam-cap-nhat-moi-nhat-205115.html",
   "publisher": "thoitrangnamphuong.com",
   "tier": "thap"
  },
  {
   "source_id": "src_033",
   "url": "https://huonglua.com.vn/blogs/news/ao-ba-ba-viet-nam",
   "publisher": "huonglua.com.vn",
   "tier": "thap"
  },
  {
   "source_id": "src_034",
   "url": "https://anhminhtextile.com/ao-ba-ba",
   "publisher": "anhminhtextile.com",
   "tier": "thap"
  },
  {
   "source_id": "src_035",
   "url": "https://insidevietnam.tempisite.com/ao-tu-than-net-duyen-cua-phu-nu-kinh-bac-xua",
   "publisher": "insidevietnam.tempisite.com",
   "tier": "thap"
  },
  {
   "source_id": "src_036",
   "url": "https://www.vacne.org.vn/ao-tu-than-khan-mo-qua-net-duyen-kinh-bac/27074.html",
   "publisher": "vacne.org.vn",
   "tier": "trung_binh"
  },
  {
   "source_id": "src_037",
   "url": "https://trangphuchonghanh.com/huong-dan-cach-mac-ao-tu-than-dung-va-dep-cho-ai-chua-biet-mac-bid101.html",
   "publisher": "trangphuchonghanh.com",
   "tier": "thap"
  },
  {
   "source_id": "src_038",
   "url": "https://cardina.vn/blogs/kien-thuc-thoi-trang/ao-ngu-than",
   "publisher": "cardina.vn",
   "tier": "thap"
  },
  {
   "source_id": "src_039",
   "url": "https://www.webtretho.vn/f/doc-bao-gium-ban/ao-dai-ngu-than-truyen-thong-cot-cach-thanh-tao-va-xu-huong-phuc-hung-co-phuc-duong-dai",
   "publisher": "webtretho.vn",
   "tier": "thap"
  }
 ],
 "enums": {
  "category": [
   "Áo khoác ngoài",
   "Áo lót trong",
   "Quần/Váy",
   "Phụ kiện đầu",
   "Giày dép",
   "Phụ kiện thân"
  ],
  "category_note": "'Phụ kiện thân' (thắt lưng, dây xà tích) là đề xuất bổ sung.",
  "region": [
   "Bắc Bộ",
   "Trung Bộ",
   "Nam Bộ"
  ],
  "era": [
   "Lý",
   "Trần",
   "Lê",
   "Nguyễn"
  ],
  "era_gap": "Chưa có 'Chúa Nguyễn' và 'Đầu thế kỷ XX'; era của tứ thân và bà ba đang để trống vì nguồn chỉ nêu thế kỷ XIX-XX.",
  "events": [
   "Sinh hoạt đời thường",
   "Lễ hội",
   "Cưới hỏi",
   "Lễ nghi",
   "Lễ tết",
   "Đại lễ",
   "Sắc phong",
   "Tiếp khách",
   "Biểu diễn"
  ],
  "source_tier": {
   "cao": "sách, nghiên cứu, bảo tàng (hiện chưa có nguồn nào)",
   "trung_binh": "báo chí, Wikipedia có dẫn nguồn",
   "thap": "blog thương mại, cửa hàng cho thuê"
  },
  "source_tier_note": "Tier gán theo tên miền, là đánh giá của AI, cần người duyệt."
 },
 "ai_by_item": {
  "ao_tu_than_001": {
   "provenance": "AI_INFERRED",
   "era_mapping": {
    "value": [
     "Nguyễn"
    ],
    "reasoning": "Nguồn tốt nhất nói áo phổ biến từ thập niên 1920-30 và dùng đến đầu thế kỷ XX, tức cuối triều Nguyễn/thời Pháp thuộc; enum era chưa có mục Pháp thuộc.",
    "confidence": "thap"
   },
   "suitable_body_types": {
    "value": [
     "Dáng quả lê",
     "Dáng chữ nhật"
    ],
    "reasoning": "Áo dài quá gối, vạt rộng che hông; thắt lưng hoặc thắt hai tà trước tạo cảm giác có eo.",
    "confidence": "thap"
   },
   "incompatible_items": {
    "value": [
     "Giày thể thao hiện đại",
     "Quần jean",
     "Khăn rằn (biểu tượng Nam Bộ)",
     "Áo Nhật Bình và phụ kiện cung đình"
    ],
    "reasoning": "Bộ tứ thân là trang phục dân gian Bắc Bộ có bộ đi kèm khá cố định; trộn phụ kiện Nam Bộ hoặc cung đình làm sai đặc trưng vùng và giai tầng.",
    "confidence": "trung_binh"
   },
   "incompatible_colors": {
    "value": [],
    "reasoning": "Không đủ cơ sở suy luận quy tắc kỵ màu cho tứ thân.",
    "confidence": "rat_thap"
   },
   "user_example_check": {
    "claim": "Áo tứ thân truyền thống bắt buộc phải có dải yếm và dây xà tích",
    "verdict": "Yếm được nhiều nguồn nói 'phải có'. Dây xà tích chỉ có nguồn cho trang phục liền chị quan họ (thắt lưng hoa lý), chưa có nguồn nói áo tứ thân dân gian nói chung bắt buộc."
   }
  },
  "ao_yem_001": {
   "provenance": "AI_INFERRED",
   "suitable_body_types": {
    "value": [],
    "reasoning": "Không đủ cơ sở để gán vóc dáng cho yếm.",
    "confidence": "rat_thap"
   },
   "incompatible_items": {
    "value": [
     "Bikini/áo hai dây hiện đại làm ngoại y"
    ],
    "reasoning": "Yếm truyền thống thường mặc trong áo tứ thân hoặc áo dài; dùng làm áo độc lập với chất liệu mỏng bị nhà nghiên cứu phê phán (đã có nguồn ở file chính).",
    "confidence": "thap"
   },
   "note": "Ý nghĩa 'đào = lẳng lơ' từ một blog mâu thuẫn với hình ảnh yếm đào tiêu biểu; chưa đủ cơ sở cấm màu đào."
  },
  "ao_giao_linh_001": {
   "provenance": "AI_INFERRED",
   "suitable_body_types": {
    "value": [],
    "reasoning": "Không có dữ liệu.",
    "confidence": "rat_thap"
   },
   "incompatible_items": {
    "value": [
     "Cổ thẳng kéo kín kiểu Minh/Triều Tiên",
     "Giày thể thao hiện đại"
    ],
    "reasoning": "Nguồn đã chỉ ra cổ giao lĩnh Lê khác Minh; việc coi đây là mục cảnh báo là suy luận.",
    "confidence": "thap"
   },
   "traditional_material": {
    "value": [
     "lụa",
     "gấm (tầng lớp cao)",
     "vải bông hoặc đay (dân thường)"
    ],
    "reasoning": "Không có nguồn về chất liệu; suy theo phân tầng xã hội thời Lê.",
    "confidence": "rat_thap"
   }
  },
  "ao_ngu_than_tay_thung_001": {
   "provenance": "AI_INFERRED",
   "suitable_body_types": {
    "value": [
     "Dáng cao",
     "Dáng chữ nhật"
    ],
    "reasoning": "Tay rộng dài chấm đất và thân dài tạo phong thái đường bệ; người thấp nhỏ dễ bị 'chìm' trong form rộng. Đây là suy luận thẩm mỹ, không phải quy chuẩn lịch sử.",
    "confidence": "thap"
   },
   "incompatible_items": {
    "value": [
     "Giày thể thao hiện đại",
     "Quần jean",
     "Áo Nhật Bình"
    ],
    "reasoning": "Áo tấc là lễ phục trang trọng; phối đồ thường ngày hiện đại làm lệch ngữ cảnh.",
    "confidence": "trung_binh"
   },
   "incompatible_colors": {
    "value": [
     "Vàng tươi/vàng cam (màu dành cho hoàng gia)"
    ],
    "reasoning": "Suy từ việc các nguồn gắn vàng với hoàng hậu và hoàng thất; chưa có nguồn quy định màu cho ngũ thân nam dân gian.",
    "confidence": "thap"
   }
  },
  "ao_ngu_than_tay_chen_001": {
   "provenance": "AI_INFERRED",
   "suitable_body_types": {
    "value": [
     "Dáng cao",
     "Dáng chữ nhật",
     "Dáng tam giác ngược"
    ],
    "reasoning": "Cổ đứng, thân dài quá gối 5-7 cm, tay hẹp gọn tạo đường dọc; khớp với ví dụ của bạn (nam 1.8 m, 75 kg) về mặt thẩm mỹ, nhưng không có nguồn nào quy định thông số cơ thể.",
    "confidence": "thap"
   },
   "incompatible_items": {
    "value": [
     "Giày thể thao hiện đại",
     "Quần jean",
     "Nón lá",
     "Khăn rằn"
    ],
    "reasoning": "Phụ kiện dân gian hoặc hiện đại không thuộc bộ ngũ thân triều Nguyễn.",
    "confidence": "thap"
   }
  },
  "ao_nhat_binh_001": {
   "provenance": "AI_INFERRED",
   "era_mapping_note": "Một blog dẫn mốc 1807 cho 'Khâm định Đại Nam hội điển sự lệ'. Theo hiểu biết của AI, bộ sách này được biên soạn muộn hơn nhiều (giữa thế kỷ XIX). Cần đối chiếu bản gốc trước khi dùng mốc 1807. Confidence: thap.",
   "suitable_body_types": {
    "value": [
     "Dáng cân đối"
    ],
    "reasoning": "Áo to bản, tạo hình chữ nhật trước ngực, dáng uy nghi; hợp người mặc có chiều cao vừa đủ để không bị lấn át.",
    "confidence": "rat_thap"
   },
   "incompatible_items": {
    "value": [
     "Giày sneaker hiện đại",
     "Quần jean",
     "Mũ/nón hiện đại",
     "Khăn rằn",
     "Nón lá"
    ],
    "reasoning": "Nhật Bình là lễ phục cung đình có bộ phụ kiện quy định (khăn vành, kim ước, trâm); phối đồ hiện đại hoặc dân gian là sai đặc trưng. Ví dụ 'Nhật Bình không đi cùng sneaker' của bạn phù hợp với logic này nhưng không có nguồn trực tiếp.",
    "confidence": "trung_binh"
   },
   "incompatible_colors": {
    "value": [
     "Người không phải hoàng hậu không mặc vàng/cam; đỏ dành cho công chúa"
    ],
    "reasoning": "Suy từ các nguồn nói màu theo cấp bậc (hoàng hậu vàng/cam, công chúa đỏ, nhị giai xích đào). Cần tra quy chế gốc để chốt.",
    "confidence": "thap"
   }
  },
  "ao_ba_ba_001": {
   "provenance": "AI_INFERRED",
   "suitable_body_types": {
    "value": [
     "Mọi dáng (form thoải mái)"
    ],
    "reasoning": "Áo dùng cho lao động sông nước nên thường thoải mái; không có nguồn về vóc dáng.",
    "confidence": "rat_thap"
   },
   "incompatible_items": {
    "value": [
     "Khăn mỏ quạ",
     "Nón quai thao",
     "Áo yếm kiểu Bắc Bộ"
    ],
    "reasoning": "Trộn bộ phụ kiện Bắc Bộ vào bà ba làm sai đặc trưng vùng miền.",
    "confidence": "thap"
   },
   "incompatible_colors": {
    "value": [],
    "reasoning": "Không có cơ sở.",
    "confidence": "rat_thap"
   }
  }
 },
 "rules": [
  {
   "rule_id": "ao_tu_than_001:incompatible_item:1",
   "item_id": "ao_tu_than_001",
   "kind": "incompatible_item",
   "provenance": "AI_INFERRED",
   "severity": "warn",
   "confidence": "trung_binh",
   "label": "Giày thể thao hiện đại",
   "reasoning": "Bộ tứ thân là trang phục dân gian Bắc Bộ có bộ đi kèm khá cố định; trộn phụ kiện Nam Bộ hoặc cung đình làm sai đặc trưng vùng và giai tầng.",
   "match": {
    "type": "external",
    "tags": [
     "sneaker"
    ]
   }
  },
  {
   "rule_id": "ao_tu_than_001:incompatible_item:2",
   "item_id": "ao_tu_than_001",
   "kind": "incompatible_item",
   "provenance": "AI_INFERRED",
   "severity": "warn",
   "confidence": "trung_binh",
   "label": "Quần jean",
   "reasoning": "Bộ tứ thân là trang phục dân gian Bắc Bộ có bộ đi kèm khá cố định; trộn phụ kiện Nam Bộ hoặc cung đình làm sai đặc trưng vùng và giai tầng.",
   "match": {
    "type": "external",
    "tags": [
     "jeans"
    ]
   }
  },
  {
   "rule_id": "ao_tu_than_001:incompatible_item:3",
   "item_id": "ao_tu_than_001",
   "kind": "incompatible_item",
   "provenance": "AI_INFERRED",
   "severity": "warn",
   "confidence": "trung_binh",
   "label": "Khăn rằn (biểu tượng Nam Bộ)",
   "reasoning": "Bộ tứ thân là trang phục dân gian Bắc Bộ có bộ đi kèm khá cố định; trộn phụ kiện Nam Bộ hoặc cung đình làm sai đặc trưng vùng và giai tầng.",
   "match": {
    "type": "item",
    "targets": [
     "khan_ran_001"
    ]
   }
  },
  {
   "rule_id": "ao_tu_than_001:incompatible_item:4",
   "item_id": "ao_tu_than_001",
   "kind": "incompatible_item",
   "provenance": "AI_INFERRED",
   "severity": "warn",
   "confidence": "trung_binh",
   "label": "Áo Nhật Bình và phụ kiện cung đình",
   "reasoning": "Bộ tứ thân là trang phục dân gian Bắc Bộ có bộ đi kèm khá cố định; trộn phụ kiện Nam Bộ hoặc cung đình làm sai đặc trưng vùng và giai tầng.",
   "match": {
    "type": "text"
   }
  },
  {
   "rule_id": "ao_yem_001:incompatible_item:1",
   "item_id": "ao_yem_001",
   "kind": "incompatible_item",
   "provenance": "AI_INFERRED",
   "severity": "info",
   "confidence": "thap",
   "label": "Bikini/áo hai dây hiện đại làm ngoại y",
   "reasoning": "Yếm truyền thống thường mặc trong áo tứ thân hoặc áo dài; dùng làm áo độc lập với chất liệu mỏng bị nhà nghiên cứu phê phán (đã có nguồn ở file chính).",
   "match": {
    "type": "external",
    "tags": [
     "modern_top"
    ]
   }
  },
  {
   "rule_id": "ao_giao_linh_001:incompatible_item:1",
   "item_id": "ao_giao_linh_001",
   "kind": "incompatible_item",
   "provenance": "AI_INFERRED",
   "severity": "info",
   "confidence": "thap",
   "label": "Cổ thẳng kéo kín kiểu Minh/Triều Tiên",
   "reasoning": "Nguồn đã chỉ ra cổ giao lĩnh Lê khác Minh; việc coi đây là mục cảnh báo là suy luận.",
   "match": {
    "type": "text"
   }
  },
  {
   "rule_id": "ao_giao_linh_001:incompatible_item:2",
   "item_id": "ao_giao_linh_001",
   "kind": "incompatible_item",
   "provenance": "AI_INFERRED",
   "severity": "info",
   "confidence": "thap",
   "label": "Giày thể thao hiện đại",
   "reasoning": "Nguồn đã chỉ ra cổ giao lĩnh Lê khác Minh; việc coi đây là mục cảnh báo là suy luận.",
   "match": {
    "type": "external",
    "tags": [
     "sneaker"
    ]
   }
  },
  {
   "rule_id": "ao_ngu_than_tay_thung_001:incompatible_item:1",
   "item_id": "ao_ngu_than_tay_thung_001",
   "kind": "incompatible_item",
   "provenance": "AI_INFERRED",
   "severity": "warn",
   "confidence": "trung_binh",
   "label": "Giày thể thao hiện đại",
   "reasoning": "Áo tấc là lễ phục trang trọng; phối đồ thường ngày hiện đại làm lệch ngữ cảnh.",
   "match": {
    "type": "external",
    "tags": [
     "sneaker"
    ]
   }
  },
  {
   "rule_id": "ao_ngu_than_tay_thung_001:incompatible_item:2",
   "item_id": "ao_ngu_than_tay_thung_001",
   "kind": "incompatible_item",
   "provenance": "AI_INFERRED",
   "severity": "warn",
   "confidence": "trung_binh",
   "label": "Quần jean",
   "reasoning": "Áo tấc là lễ phục trang trọng; phối đồ thường ngày hiện đại làm lệch ngữ cảnh.",
   "match": {
    "type": "external",
    "tags": [
     "jeans"
    ]
   }
  },
  {
   "rule_id": "ao_ngu_than_tay_thung_001:incompatible_item:3",
   "item_id": "ao_ngu_than_tay_thung_001",
   "kind": "incompatible_item",
   "provenance": "AI_INFERRED",
   "severity": "warn",
   "confidence": "trung_binh",
   "label": "Áo Nhật Bình",
   "reasoning": "Áo tấc là lễ phục trang trọng; phối đồ thường ngày hiện đại làm lệch ngữ cảnh.",
   "match": {
    "type": "item",
    "targets": [
     "ao_nhat_binh_001"
    ]
   }
  },
  {
   "rule_id": "ao_ngu_than_tay_thung_001:incompatible_color:1",
   "item_id": "ao_ngu_than_tay_thung_001",
   "kind": "incompatible_color",
   "provenance": "AI_INFERRED",
   "severity": "info",
   "confidence": "thap",
   "label": "Vàng tươi/vàng cam (màu dành cho hoàng gia)",
   "reasoning": "Suy từ việc các nguồn gắn vàng với hoàng hậu và hoàng thất; chưa có nguồn quy định màu cho ngũ thân nam dân gian.",
   "match": {
    "type": "color",
    "colors": [
     "vàng",
     "cam"
    ]
   }
  },
  {
   "rule_id": "ao_ngu_than_tay_chen_001:incompatible_item:1",
   "item_id": "ao_ngu_than_tay_chen_001",
   "kind": "incompatible_item",
   "provenance": "AI_INFERRED",
   "severity": "info",
   "confidence": "thap",
   "label": "Giày thể thao hiện đại",
   "reasoning": "Phụ kiện dân gian hoặc hiện đại không thuộc bộ ngũ thân triều Nguyễn.",
   "match": {
    "type": "external",
    "tags": [
     "sneaker"
    ]
   }
  },
  {
   "rule_id": "ao_ngu_than_tay_chen_001:incompatible_item:2",
   "item_id": "ao_ngu_than_tay_chen_001",
   "kind": "incompatible_item",
   "provenance": "AI_INFERRED",
   "severity": "info",
   "confidence": "thap",
   "label": "Quần jean",
   "reasoning": "Phụ kiện dân gian hoặc hiện đại không thuộc bộ ngũ thân triều Nguyễn.",
   "match": {
    "type": "external",
    "tags": [
     "jeans"
    ]
   }
  },
  {
   "rule_id": "ao_ngu_than_tay_chen_001:incompatible_item:3",
   "item_id": "ao_ngu_than_tay_chen_001",
   "kind": "incompatible_item",
   "provenance": "AI_INFERRED",
   "severity": "info",
   "confidence": "thap",
   "label": "Nón lá",
   "reasoning": "Phụ kiện dân gian hoặc hiện đại không thuộc bộ ngũ thân triều Nguyễn.",
   "match": {
    "type": "external",
    "tags": [
     "non_la"
    ]
   }
  },
  {
   "rule_id": "ao_ngu_than_tay_chen_001:incompatible_item:4",
   "item_id": "ao_ngu_than_tay_chen_001",
   "kind": "incompatible_item",
   "provenance": "AI_INFERRED",
   "severity": "info",
   "confidence": "thap",
   "label": "Khăn rằn",
   "reasoning": "Phụ kiện dân gian hoặc hiện đại không thuộc bộ ngũ thân triều Nguyễn.",
   "match": {
    "type": "item",
    "targets": [
     "khan_ran_001"
    ]
   }
  },
  {
   "rule_id": "ao_nhat_binh_001:incompatible_item:1",
   "item_id": "ao_nhat_binh_001",
   "kind": "incompatible_item",
   "provenance": "AI_INFERRED",
   "severity": "warn",
   "confidence": "trung_binh",
   "label": "Giày sneaker hiện đại",
   "reasoning": "Nhật Bình là lễ phục cung đình có bộ phụ kiện quy định (khăn vành, kim ước, trâm); phối đồ hiện đại hoặc dân gian là sai đặc trưng. Ví dụ 'Nhật Bình không đi cùng sneaker' của bạn phù hợp với logic này nhưng không có nguồn trực tiếp.",
   "match": {
    "type": "external",
    "tags": [
     "sneaker"
    ]
   }
  },
  {
   "rule_id": "ao_nhat_binh_001:incompatible_item:2",
   "item_id": "ao_nhat_binh_001",
   "kind": "incompatible_item",
   "provenance": "AI_INFERRED",
   "severity": "warn",
   "confidence": "trung_binh",
   "label": "Quần jean",
   "reasoning": "Nhật Bình là lễ phục cung đình có bộ phụ kiện quy định (khăn vành, kim ước, trâm); phối đồ hiện đại hoặc dân gian là sai đặc trưng. Ví dụ 'Nhật Bình không đi cùng sneaker' của bạn phù hợp với logic này nhưng không có nguồn trực tiếp.",
   "match": {
    "type": "external",
    "tags": [
     "jeans"
    ]
   }
  },
  {
   "rule_id": "ao_nhat_binh_001:incompatible_item:3",
   "item_id": "ao_nhat_binh_001",
   "kind": "incompatible_item",
   "provenance": "AI_INFERRED",
   "severity": "warn",
   "confidence": "trung_binh",
   "label": "Mũ/nón hiện đại",
   "reasoning": "Nhật Bình là lễ phục cung đình có bộ phụ kiện quy định (khăn vành, kim ước, trâm); phối đồ hiện đại hoặc dân gian là sai đặc trưng. Ví dụ 'Nhật Bình không đi cùng sneaker' của bạn phù hợp với logic này nhưng không có nguồn trực tiếp.",
   "match": {
    "type": "external",
    "tags": [
     "modern_hat"
    ]
   }
  },
  {
   "rule_id": "ao_nhat_binh_001:incompatible_item:4",
   "item_id": "ao_nhat_binh_001",
   "kind": "incompatible_item",
   "provenance": "AI_INFERRED",
   "severity": "warn",
   "confidence": "trung_binh",
   "label": "Khăn rằn",
   "reasoning": "Nhật Bình là lễ phục cung đình có bộ phụ kiện quy định (khăn vành, kim ước, trâm); phối đồ hiện đại hoặc dân gian là sai đặc trưng. Ví dụ 'Nhật Bình không đi cùng sneaker' của bạn phù hợp với logic này nhưng không có nguồn trực tiếp.",
   "match": {
    "type": "item",
    "targets": [
     "khan_ran_001"
    ]
   }
  },
  {
   "rule_id": "ao_nhat_binh_001:incompatible_item:5",
   "item_id": "ao_nhat_binh_001",
   "kind": "incompatible_item",
   "provenance": "AI_INFERRED",
   "severity": "warn",
   "confidence": "trung_binh",
   "label": "Nón lá",
   "reasoning": "Nhật Bình là lễ phục cung đình có bộ phụ kiện quy định (khăn vành, kim ước, trâm); phối đồ hiện đại hoặc dân gian là sai đặc trưng. Ví dụ 'Nhật Bình không đi cùng sneaker' của bạn phù hợp với logic này nhưng không có nguồn trực tiếp.",
   "match": {
    "type": "external",
    "tags": [
     "non_la"
    ]
   }
  },
  {
   "rule_id": "ao_nhat_binh_001:incompatible_color:1",
   "item_id": "ao_nhat_binh_001",
   "kind": "incompatible_color",
   "provenance": "AI_INFERRED",
   "severity": "info",
   "confidence": "thap",
   "label": "Người không phải hoàng hậu không mặc vàng/cam; đỏ dành cho công chúa",
   "reasoning": "Suy từ các nguồn nói màu theo cấp bậc (hoàng hậu vàng/cam, công chúa đỏ, nhị giai xích đào). Cần tra quy chế gốc để chốt.",
   "match": {
    "type": "text"
   }
  },
  {
   "rule_id": "ao_ba_ba_001:incompatible_item:1",
   "item_id": "ao_ba_ba_001",
   "kind": "incompatible_item",
   "provenance": "AI_INFERRED",
   "severity": "info",
   "confidence": "thap",
   "label": "Khăn mỏ quạ",
   "reasoning": "Trộn bộ phụ kiện Bắc Bộ vào bà ba làm sai đặc trưng vùng miền.",
   "match": {
    "type": "item",
    "targets": [
     "khan_mo_qua_001"
    ]
   }
  },
  {
   "rule_id": "ao_ba_ba_001:incompatible_item:2",
   "item_id": "ao_ba_ba_001",
   "kind": "incompatible_item",
   "provenance": "AI_INFERRED",
   "severity": "info",
   "confidence": "thap",
   "label": "Nón quai thao",
   "reasoning": "Trộn bộ phụ kiện Bắc Bộ vào bà ba làm sai đặc trưng vùng miền.",
   "match": {
    "type": "item",
    "targets": [
     "non_quai_thao_001"
    ]
   }
  },
  {
   "rule_id": "ao_ba_ba_001:incompatible_item:3",
   "item_id": "ao_ba_ba_001",
   "kind": "incompatible_item",
   "provenance": "AI_INFERRED",
   "severity": "info",
   "confidence": "thap",
   "label": "Áo yếm kiểu Bắc Bộ",
   "reasoning": "Trộn bộ phụ kiện Bắc Bộ vào bà ba làm sai đặc trưng vùng miền.",
   "match": {
    "type": "item",
    "targets": [
     "ao_yem_001"
    ]
   }
  }
 ],
 "advisories_by_item": {
  "ao_tu_than_001": [
   {
    "advisory_id": "ao_tu_than_001:red_flag:1",
    "provenance": "SOURCED",
    "text": "Áo có thêm tà kép vẫn không được gọi là áo năm thân (Võ Quang Yến): không gán nhãn ngũ thân cho tứ thân.",
    "source_ids": [
     "src_001",
     "src_002",
     "src_003",
     "src_004",
     "src_005",
     "src_006"
    ],
    "source_scope": "item"
   },
   {
    "advisory_id": "ao_tu_than_001:red_flag:2",
    "provenance": "SOURCED",
    "text": "Chi tiết tà áo: hai nguồn gán ngược nhau cho cha mẹ đẻ và cha mẹ chồng; xem conflicts.",
    "source_ids": [
     "src_001",
     "src_002",
     "src_003",
     "src_004",
     "src_005",
     "src_006"
    ],
    "source_scope": "item"
   }
  ],
  "ao_yem_001": [
   {
    "advisory_id": "ao_yem_001:red_flag:1",
    "provenance": "SOURCED",
    "text": "Báo Pháp luật VN dẫn họa sĩ, nhà nghiên cứu Nguyễn Đức Bình: yếm cách tân bằng chất liệu mỏng tang, trong suốt, lộ cơ thể là biến tướng phản cảm.",
    "source_ids": [
     "src_007",
     "src_008",
     "src_009",
     "src_010",
     "src_011"
    ],
    "source_scope": "item"
   },
   {
    "advisory_id": "ao_yem_001:red_flag:2",
    "provenance": "SOURCED",
    "text": "Theo blog thời trang (theciu.vn, độ tin cậy thấp): yếm vàng chỉ dành cho hoàng thất, cấm dân gian; màu hoa đào gắn với ca kỹ.",
    "source_ids": [
     "src_007",
     "src_008",
     "src_009",
     "src_010",
     "src_011"
    ],
    "source_scope": "item"
   }
  ],
  "ao_giao_linh_001": [
   {
    "advisory_id": "ao_giao_linh_001:red_flag:1",
    "provenance": "SOURCED",
    "text": "Giao lĩnh thời Lê phân biệt với thời Minh và Triều Tiên ở cổ: thời Minh cổ thẳng và kéo kín hơn.",
    "source_ids": [
     "src_012",
     "src_013",
     "src_014",
     "src_015"
    ],
    "source_scope": "item"
   },
   {
    "advisory_id": "ao_giao_linh_001:red_flag:2",
    "provenance": "SOURCED",
    "text": "Giao lĩnh vạt ngắn thời Lê: thường quây ngoài ngắn hơn váy trong, lộ hai lớp.",
    "source_ids": [
     "src_012",
     "src_013",
     "src_014",
     "src_015"
    ],
    "source_scope": "item"
   }
  ],
  "ao_ngu_than_tay_thung_001": [
   {
    "advisory_id": "ao_ngu_than_tay_thung_001:red_flag:1",
    "provenance": "SOURCED",
    "text": "Lỗi thường gặp: may tay bó nách. Tay thụng đúng là hình chữ nhật, hai bề song song; chắp tay trước ngực tạo hình vuông (nguồn: bài phân tích của cộng đồng, thap).",
    "source_ids": [
     "src_016",
     "src_017",
     "src_018",
     "src_019",
     "src_020",
     "src_021",
     "src_013",
     "src_022"
    ],
    "source_scope": "item"
   }
  ],
  "ao_nhat_binh_001": [
   {
    "advisory_id": "ao_nhat_binh_001:red_flag:1",
    "provenance": "SOURCED",
    "text": "Hoa văn và màu sắc sắp xếp theo cấp bậc: nhìn vào biết địa vị người mặc; quy chế này không áp dụng cho hoàng hậu. Đầu triều Nguyễn phải tuân thủ đúng quy chế màu và thứ bậc (tulinhboutique.com).",
    "source_ids": [
     "src_025",
     "src_026",
     "src_027",
     "src_028",
     "src_029"
    ],
    "source_scope": "item"
   }
  ],
  "khan_mo_qua_001": [
   {
    "advisory_id": "khan_mo_qua_001:red_flag:1",
    "provenance": "SOURCED",
    "text": "Chít vừa mặt, tạo dáng búp sen; chít mỏ quá cao hoặc quá thấp đều không hợp (báo Tây Ninh, vacne.org.vn).",
    "source_ids": [
     "src_036",
     "src_004"
    ],
    "source_scope": "item"
   }
  ]
 },
 "external_tags": [
  {
   "tag": "sneaker",
   "label": "Giày thể thao hiện đại"
  },
  {
   "tag": "jeans",
   "label": "Quần jean"
  },
  {
   "tag": "modern_top",
   "label": "Áo hai dây / bikini hiện đại"
  },
  {
   "tag": "modern_hat",
   "label": "Mũ / nón hiện đại"
  },
  {
   "tag": "non_la",
   "label": "Nón lá"
  }
 ],
 "global_rules": [
  {
   "rule_id": "region_mixing",
   "value": "Không trộn phụ kiện khác vùng (khăn rằn Nam Bộ, khăn mỏ quạ Bắc Bộ, phụ kiện cung đình Huế) trong một bộ.",
   "provenance": "AI_INFERRED",
   "confidence": "thap",
   "reasoning": "Suy từ việc các nguồn gắn mỗi phụ kiện với một vùng hoặc giai tầng."
  }
 ],
 "dev_notes": [
  {
   "rule_id": "era_enum_gap",
   "value": "Enum era (Lý, Trần, Lê, Nguyễn) chưa có mục cho thế kỷ XX/Pháp thuộc và thời chúa Nguyễn Đàng Trong; đề xuất thêm 'Chúa Nguyễn' và 'Đầu thế kỷ XX'.",
   "provenance": "AI_INFERRED",
   "confidence": "trung_binh",
   "reasoning": "Áo tứ thân và bà ba có cột mốc chính ở thế kỷ XIX-XX; ngũ thân ra đời 1744 thời chúa."
  }
 ],
 "meta": {
  "schema_version": "2.0",
  "ai_disclaimer": "Nhãn AI_INFERRED là suy luận của AI, chưa có nguồn xác thực; cần chuyên gia cổ phục duyệt."
 }
};

const TIER_RANK = { cao: 0, trung_binh: 1, thap: 2 };
const SEVERITY_RANK = { warn: 0, info: 1 };

class VietPhucDatabase {
  constructor(payload) {
    this._items = payload.items;
    this._sources = payload.sources;
    this._enums = payload.enums;
    this._aiByItem = payload.ai_by_item;
    this._advisories = payload.advisories_by_item;
    this._externalTags = payload.external_tags;
    this._globalRules = payload.global_rules;
    this._devNotes = payload.dev_notes;
    this._meta = payload.meta;

    this._indexMap = new Map(this._items.map(i => [i.item_id, i]));
    this._sourceMap = new Map(this._sources.map(s => [s.source_id, s]));
    this._rulesByItem = new Map();
    payload.rules.forEach(r => {
      if (!this._rulesByItem.has(r.item_id)) this._rulesByItem.set(r.item_id, []);
      this._rulesByItem.get(r.item_id).push(r);
    });
  }

  // ---- API cũ -----------------------------------------------------------
  getById(id) { return this._indexMap.get(id); }
  getAll() { return this._items; }
  getByCategory(category) { return this._items.filter(i => i.category === category); }
  getByRegion(region) {
    if (region === 'all') return this._items;
    return this._items.filter(i => i.filters && i.filters.region && i.filters.region.includes(region));
  }
  getByCategoryAndRegion(category, region) {
    return this._items.filter(i => {
      const catMatch = i.category === category;
      const regionMatch = region === 'all' || (i.filters && i.filters.region && i.filters.region.includes(region));
      return catMatch && regionMatch;
    });
  }
  getCategories() { return [...new Set(this._items.map(i => i.category))]; }
  getGlobalRules() { return this._globalRules; }
  get count() { return this._items.length; }
  search(query) {
    const q = query.toLowerCase();
    return this._items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.aliases || []).some(a => a.toLowerCase().includes(q)) ||
      i.category.toLowerCase().includes(q) ||
      (i.filters?.region || []).some(r => r.toLowerCase().includes(q)) ||
      (i.filters?.events || []).some(e => e.toLowerCase().includes(q))
    );
  }

  // ---- Nguồn ------------------------------------------------------------
  getSourceById(sid) { return this._sourceMap.get(sid); }
  getSources(id) {
    const it = this._indexMap.get(id);
    if (!it) return [];
    return it.source_ids
      .map(sid => this._sourceMap.get(sid))
      .filter(Boolean)
      .sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier]);
  }
  getBestTier(id) {
    const s = this.getSources(id);
    return s.length ? s[0].tier : null;
  }

  // ---- Lớp AI / lưu ý có nguồn --------------------------------------------
  getAiLayer(id) { return this._aiByItem[id] || null; }
  getAdvisories(id) { return this._advisories[id] || []; }
  getExternalTags() { return this._externalTags; }
  getDevNotes() { return this._devNotes; }
  getEnums() { return this._enums; }
  getAiDisclaimer() { return this._meta.ai_disclaimer; }

  // ---- Gợi ý mềm cho danh sách trang phục ---------------------------------
  /**
   * Trả về Set item_id mà luật (AI_INFERRED) cho là có thể không hợp với bộ đang mặc,
   * theo cả hai chiều. Chỉ dùng để ĐÁNH DẤU, không dùng để chặn người dùng chọn.
   */
  getSoftConflictIds(itemIds) {
    const worn = new Set(itemIds);
    const out = new Set();
    for (const id of worn) {
      for (const r of (this._rulesByItem.get(id) || [])) {
        if (r.match.type === 'item') r.match.targets.forEach(t => { if (!worn.has(t)) out.add(t); });
      }
    }
    for (const item of this._items) {
      if (worn.has(item.item_id)) continue;
      for (const r of (this._rulesByItem.get(item.item_id) || [])) {
        if (r.match.type === 'item' && r.match.targets.some(t => worn.has(t))) out.add(item.item_id);
      }
    }
    return out;
  }

  // ---- Kiểm tra bộ đồ -----------------------------------------------------
  /**
   * @param {string[]} itemIds       các item_id trong bộ đồ
   * @param {object}   opts
   *        opts.externalTags  string[]               thẻ ngoài CSDL người dùng bật (vd 'sneaker')
   *        opts.colors        {item_id: 'vàng', ...} màu người dùng chọn cho từng món
   * @returns {{warnings, advisories, counts, disclaimer}}
   *   warnings    : cảnh báo kích hoạt bởi bộ đồ, hiện tại ĐỀU là AI_INFERRED
   *   advisories  : lưu ý văn hóa CÓ NGUỒN của các món trong bộ (luôn hiện)
   */
  checkOutfit(itemIds, opts = {}) {
    const ids = [...new Set(itemIds)].filter(id => this._indexMap.has(id));
    const idSet = new Set(ids);
    const ext = new Set(opts.externalTags || []);
    const colors = opts.colors || {};
    const nameOf = id => this._indexMap.get(id).name;
    const extLabel = t => (this._externalTags.find(e => e.tag === t) || {}).label || t;

    const warnings = [];
    const seen = new Set();
    const push = (key, w) => { if (!seen.has(key)) { seen.add(key); warnings.push(w); } };

    for (const id of ids) {
      for (const rule of (this._rulesByItem.get(id) || [])) {
        const m = rule.match;
        const base = {
          rule_id: rule.rule_id, kind: rule.kind, provenance: rule.provenance,
          severity: rule.severity, confidence: rule.confidence,
          reasoning: rule.reasoning, item_id: id,
        };
        if (m.type === 'item') {
          const hit = m.targets.filter(t => t !== id && idSet.has(t));
          if (hit.length) {
            push('item:' + [id, ...hit].sort().join('|'), {
              ...base, with_items: hit,
              message: `${nameOf(id)} không nên phối cùng ${hit.map(nameOf).join(', ')}.`,
            });
          }
        } else if (m.type === 'external') {
          const hit = m.tags.filter(t => ext.has(t));
          if (hit.length) {
            push('ext:' + id + '|' + hit.join(','), {
              ...base, with_external: hit,
              message: `${nameOf(id)} không nên phối cùng ${hit.map(extLabel).join(', ')}.`,
            });
          }
        } else if (m.type === 'color') {
          const c = colors[id];
          if (c && m.colors.includes(c)) {
            push('color:' + id + '|' + c, {
              ...base, color: c,
              message: `Màu "${c}" cho ${nameOf(id)} cần cân nhắc: ${rule.label}.`,
            });
          }
        }
        // m.type === 'text' không tự kiểm tra, chỉ hiện qua getAiLayer()
      }
    }

    // Luật toàn cục: trộn phụ kiện khác vùng
    const regionRule = this._globalRules.find(r => r.rule_id === 'region_mixing');
    if (regionRule) {
      const pairs = [];
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const a = this._indexMap.get(ids[i]).filters.region || [];
          const b = this._indexMap.get(ids[j]).filters.region || [];
          if (a.length && b.length && !a.some(r => b.includes(r))) pairs.push([ids[i], ids[j]]);
        }
      }
      if (pairs.length) {
        const involved = [...new Set(pairs.flat())];
        push('region_mixing:' + involved.sort().join('|'), {
          rule_id: 'region_mixing', kind: 'region_mixing', provenance: regionRule.provenance,
          severity: 'info', confidence: regionRule.confidence, reasoning: regionRule.reasoning,
          items: involved,
          message: `Bộ đồ gồm món thuộc các vùng khác nhau (${pairs.map(p => p.map(nameOf).join(' + ')).join('; ')}). ${regionRule.value}`,
        });
      }
    }

    warnings.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);

    const advisories = ids.flatMap(id =>
      this.getAdvisories(id).map(a => ({ ...a, item_id: id, item_name: nameOf(id) })));

    return {
      warnings,
      advisories,
      counts: { warn: warnings.filter(w => w.severity === 'warn').length,
                info: warnings.filter(w => w.severity === 'info').length,
                sourced_advisories: advisories.length },
      disclaimer: this._meta.ai_disclaimer,
    };
  }
}
window.DB = new VietPhucDatabase(PAYLOAD);
