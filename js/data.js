/**
 * @file data.js
 * @class VietPhucDatabase
 * @description Lớp quản lý toàn bộ dữ liệu trang phục Việt cổ.
 * AUTO-GENERATED từ viet_phuc_items.json - đảm bảo UTF-8
 */
class VietPhucDatabase {
  constructor() {
    this._items = [
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
    ]
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
    ]
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
    ]
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
        "Vùng: Đàng Trong, kinh thành Huế; từ thời Minh Mạng phổ biến cả nước",
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
    ]
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
    ]
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
        "Cưới hỏi",
        "Đại lễ",
        "Sắc phong"
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
      "common_pairings": [
        "khan_vanh_001",
        "kim_uoc_phat_001"
      ],
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
        "Vùng: Cung đình Huế; đối tượng là nữ",
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  },
  {
    "item_id": "khan_vanh_001",
    "name": "Khăn vành",
    "aliases": [],
    "category": "Phụ kiện đầu",
    "filters": {
      "region": [
        "Trung Bộ"
      ],
      "era": [
        "Nguyễn"
      ],
      "events": [
        "Đại lễ"
      ],
      "suitable_body_types": [],
      "color_tags": []
    },
    "rules": {
      "required_matches": [],
      "common_pairings": [
        "ao_nhat_binh_001"
      ],
      "other_pairings_text": [],
      "incompatible_items": [],
      "incompatible_colors": [],
      "red_flags": []
    },
    "cultural_context": {
      "historical_meaning": "Hoàng hậu, phi tần, công chúa đội khăn vành khi mặc áo Nhật Bình (báo Phụ nữ VN).",
      "traditional_material": [],
      "construction": "",
      "notes": [
        "Vùng: Cung đình Huế"
      ],
      "conflicts": []
    },
    "source_ids": [
      "src_026"
    ]
  },
  {
    "item_id": "kim_uoc_phat_001",
    "name": "Mão kim ước phát và trâm hoa",
    "aliases": [
      "Kim ước",
      "Kim phượng"
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
        "Đại lễ"
      ],
      "suitable_body_types": [],
      "color_tags": []
    },
    "rules": {
      "required_matches": [],
      "common_pairings": [
        "ao_nhat_binh_001"
      ],
      "other_pairings_text": [],
      "incompatible_items": [],
      "incompatible_colors": [],
      "red_flags": [
        "Số lượng theo cấp bậc: công chúa 1 thất phượng kim ước phát và 12 trâm hoa; cung tần nhị giai mũ ngũ phượng kim ước phát và 10 trâm hoa (tulinhboutique.com dẫn quy chế)."
      ]
    },
    "cultural_context": {
      "historical_meaning": "",
      "traditional_material": [],
      "construction": "",
      "notes": [
        "Vùng: Cung đình Huế"
      ],
      "conflicts": []
    },
    "source_ids": [
      "src_027",
      "src_026"
    ]
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
    ]
  }
];

    const emojiMap = {
      "ao_tu_than_001": "👘",
      "ao_yem_001": "🎗️",
      "ao_giao_linh_001": "🎎",
      "ao_ngu_than_tay_thung_001": "🥻",
      "ao_ngu_than_tay_chen_001": "🥻",
      "ao_nhat_binh_001": "🎏",
      "ao_ba_ba_001": "👚",
      "vay_dup_001": "👗",
      "quan_nai_den_001": "👖",
      "quan_trang_ong_rong_001": "👖",
      "khan_mo_qua_001": "🧣",
      "non_quai_thao_001": "🎩",
      "khan_dong_001": "🧢",
      "khan_vanh_001": "👑",
      "kim_uoc_phat_001": "💎",
      "dai_lung_hoa_ly_001": "🎀",
      "toc_duoi_ga_001": "💇",
      "guoc_moc_001": "👡",
      "dep_cong_001": "👞",
      "khan_ran_001": "🧶"
    };
    this._items.forEach(i => i.emoji = emojiMap[i.item_id] || "👕");

    this._globalRules = [
      {
        rule_id: "region_mixing",
        value: "Không trộn phụ kiện khác vùng trong một bộ (khăn rằn Nam Bộ + khăn mỏ quạ Bắc Bộ + phụ kiện cung đình Huế)."
      },
      {
        rule_id: "era_enum_gap",
        value: "Enum era hiện chưa có mục cho thế kỷ XX/Pháp thuộc và thời chúa Nguyễn Đàng Trong."
      }
    ];

    this._indexMap = new Map(this._items.map(item => [item.item_id, item]));
  }

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
}
window.DB = new VietPhucDatabase();
