// ============================================================
// DATA – Toàn bộ dữ liệu trang phục, phụ kiện, sự kiện, văn hóa
// ============================================================

const COSTUMES = [
  {
    id: 'ao-dai',
    name: 'Áo Dài',
    region: 'south',
    regionLabel: 'Miền Nam',
    emoji: '👘',
    color: '#C0392B',
    bgGradient: 'linear-gradient(135deg, #C0392B, #8B1A1A)',
    shortDesc: 'Quốc phục Việt Nam, thanh lịch và quyến rũ.',
    desc: 'Áo dài là trang phục truyền thống nổi tiếng nhất của Việt Nam, xuất hiện từ thế kỷ 18 và trải qua nhiều lần cải biến. Thiết kế ôm sát thân với cổ cao, tay dài và tà xẻ hai bên tạo nên vẻ thanh thoát, duyên dáng đặc trưng.',
    origin: 'Khởi nguồn từ thời chúa Nguyễn Phúc Khoát (thế kỷ 18), áo dài phát triển qua nhiều thời kỳ và trở thành biểu tượng văn hóa quốc gia.',
    occasions: ['Lễ hội', 'Đám cưới', 'Lễ tốt nghiệp', 'Sự kiện trang trọng', 'Ảnh kỷ niệm'],
    colors: ['#C0392B', '#E8956D', '#F5D26E', '#1A7A4C', '#3D2B6E', '#FFFFFF', '#2C2C2C', '#DEB887'],
    warnings: [],
    culturalTips: ['Áo dài cần mặc cùng quần ống rộng, không mặc với quần bó.', 'Cổ áo cao tượng trưng cho sự kín đáo, thanh cao.', 'Hoa văn thêu trên áo thường mang ý nghĩa cầu phúc, cát tường.'],
    styleSuggestions: { traditional: 'Áo lụa tơ tằm + quần trắng + nón lá', fusion: 'Áo dài ngắn + quần jeans trắng + giày thể thao trắng', genz: 'Áo dài chất liệu denim + boots + túi đeo chéo' },
    tags: ['Quốc phục', 'Trang trọng', 'Phổ biến nhất'],
  },
  {
    id: 'ao-tu-than',
    name: 'Áo Tứ Thân',
    region: 'north',
    regionLabel: 'Miền Bắc',
    emoji: '🎋',
    color: '#3D2B6E',
    bgGradient: 'linear-gradient(135deg, #3D2B6E, #6B4226)',
    shortDesc: 'Nét duyên dáng của vùng đồng bằng Bắc Bộ.',
    desc: 'Áo tứ thân là trang phục truyền thống của phụ nữ miền Bắc, đặc biệt vùng Kinh Bắc. Gọi là "tứ thân" vì áo được ghép từ bốn mảnh vải – hai thân trước, hai thân sau, tạo nên dáng vẻ uyển chuyển, phóng khoáng.',
    origin: 'Ra đời từ thế kỷ 13-14, phổ biến rộng rãi ở vùng Kinh Bắc (Bắc Ninh, Bắc Giang). Thường gắn với các làn điệu quan họ trữ tình.',
    occasions: ['Lễ hội quan họ', 'Hội làng', 'Tết Nguyên Đán', 'Biểu diễn văn hóa'],
    colors: ['#6B4226', '#3D2B6E', '#1A7A4C', '#C0392B', '#2C2C2C', '#DEB887', '#8B6914'],
    warnings: ['Không mặc áo tứ thân thiếu thắt lưng nhiễu – đây là phần quan trọng của trang phục.', 'Tránh phối màu quá sặc sỡ trái với tông màu truyền thống đất Kinh Bắc.'],
    culturalTips: ['Thắt lưng bao xanh hoặc hoa lý là chi tiết không thể thiếu.', 'Nón quai thao là phụ kiện đặc trưng không thể thiếu khi mặc áo tứ thân.', 'Tóc vấn trơn hoặc có cài trâm bạc tăng thêm nét thanh lịch.'],
    styleSuggestions: { traditional: 'Áo màu nâu/tím + thắt lưng xanh + nón quai thao + khăn mỏ quạ', fusion: 'Áo tứ thân tím + quần ống suông + dép quai + túi cói', genz: 'Áo tứ thân rút gọn + quần culottes + sneakers trắng + tai nghe' },
    tags: ['Kinh Bắc', 'Quan họ', 'Cổ điển'],
  },
  {
    id: 'ao-ngu-than',
    name: 'Áo Ngũ Thân',
    region: 'central',
    regionLabel: 'Miền Trung',
    emoji: '👑',
    color: '#1A7A4C',
    bgGradient: 'linear-gradient(135deg, #1A7A4C, #0D4A2D)',
    shortDesc: 'Trang phục truyền thống uy nghi, bác học xứ Huế.',
    desc: 'Áo ngũ thân là trang phục truyền thống ghép từ năm mảnh vải, tượng trưng cho ngũ hành (Kim, Mộc, Thủy, Hỏa, Thổ) và tam tòng tứ đức. Đây là trang phục lễ nghi truyền thống quan trọng của người Việt thời phong kiến, phổ biến đặc biệt tại kinh đô Huế.',
    origin: 'Xuất hiện từ thời Nguyễn (thế kỷ 19), được mặc phổ biến ở tầng lớp quý tộc và quan lại tại Huế. Đang được phục dựng mạnh mẽ trong phong trào Việt phục hiện đại.',
    occasions: ['Tế lễ', 'Festival Huế', 'Chụp ảnh lịch sử', 'Các dịp trang trọng đặc biệt'],
    colors: ['#1A7A4C', '#C0392B', '#2C2C2C', '#8B6914', '#FFFFFF', '#3D2B6E'],
    warnings: ['Áo ngũ thân có quy tắc màu sắc theo thứ bậc – không nên dùng màu vàng/vàng kim nếu không đúng ngữ cảnh (màu vàng truyền thống dành cho hoàng tộc).', 'Cúc áo ngũ thân phải cài đúng kiểu – thường là 5 cúc chức năng.'],
    culturalTips: ['Ngũ thân tượng trưng cho triết lý ngũ luân: vua-tôi, cha-con, chồng-vợ, anh-em, bạn bè.', 'Màu sắc có ý nghĩa: đỏ (hỷ sự), xanh (trẻ trung, học hành), đen/nâu (trang nghiêm, đại sự).'],
    styleSuggestions: { traditional: 'Áo ngũ thân xanh lục + quần lụa trắng + khăn đóng + hài cong', fusion: 'Áo ngũ thân + quần ống thẳng + giày oxford + cà vạt lụa', genz: 'Áo ngũ thân phối cùng layer turtleneck + boots cổ cao + đồng hồ cổ điển' },
    tags: ['Cố đô Huế', 'Triều Nguyễn', 'Phục dựng'],
  },
  {
    id: 'ao-ba-ba',
    name: 'Áo Bà Ba',
    region: 'south',
    regionLabel: 'Miền Nam',
    emoji: '🌴',
    color: '#C4622D',
    bgGradient: 'linear-gradient(135deg, #C4622D, #E8956D)',
    shortDesc: 'Trang phục dân dã, mộc mạc của Nam Bộ.',
    desc: 'Áo bà ba là trang phục dân gian phổ biến ở vùng Nam Bộ, đặc biệt là đồng bằng sông Cửu Long. Kiểu áo cổ tròn, xẻ giữa, thân ôm vừa thoải mái lại tiện lợi trong lao động hàng ngày.',
    origin: 'Có nguồn gốc từ trang phục của người Hoa và người Mã Lai, du nhập vào Nam Bộ từ thế kỷ 19. Trở thành biểu tượng văn hóa của người dân miền Tây.',
    occasions: ['Lễ hội miền Tây', 'Tết Nguyên Đán', 'Chèo thuyền', 'Sinh hoạt hàng ngày', 'Ảnh du lịch'],
    colors: ['#C4622D', '#E8956D', '#1A7A4C', '#C0392B', '#FFFFFF', '#000000', '#F5D26E'],
    warnings: [],
    culturalTips: ['Thường mặc cùng quần đen hoặc quần lãnh Mỹ A đặc trưng miền Tây.', 'Áo bà ba của phụ nữ thường có túi ở hai vạt trước.'],
    styleSuggestions: { traditional: 'Áo bà ba trắng + quần đen lãnh + nón lá + dép guốc', fusion: 'Áo bà ba pastel + quần linen trắng + dép sandal + túi cói', genz: 'Áo bà ba crop + high waist jeans + sneakers + mũ bucket' },
    tags: ['Nam Bộ', 'Dân dã', 'Miền Tây'],
  },
  {
    id: 'ao-nhat-binh',
    name: 'Áo Nhật Bình',
    region: 'central',
    regionLabel: 'Miền Trung',
    emoji: '🏯',
    color: '#8B6914',
    bgGradient: 'linear-gradient(135deg, #8B6914, #C0392B)',
    shortDesc: 'Trang phục lễ nghi Huế của phi tần, mệnh phụ.',
    desc: 'Áo nhật bình là trang phục nghi lễ của phụ nữ cung đình thời Nguyễn, đặc trưng bởi cổ chữ U hình vuông độc đáo, trang trí phức tạp với hoa văn thêu vàng và các biểu tượng hoàng gia. Gắn liền với kinh đô Huế – trung tâm văn hóa miền Trung.',
    origin: 'Ra đời từ thế kỷ 19 dưới triều Nguyễn tại Huế, xuất phát từ ảnh hưởng của trang phục cung đình Trung Hoa nhưng đã được Việt hóa đặc sắc.',
    occasions: ['Tái hiện lịch sử', 'Festival Huế', 'Chụp ảnh nghệ thuật', 'Lễ hội miền Trung'],
    colors: ['#8B6914', '#C0392B', '#F5D26E', '#1A7A4C', '#2C2C2C'],
    warnings: ['Màu sắc có quy định cụ thể theo thứ bậc cung đình – tránh sử dụng màu vàng thuần túy nếu không đúng ngữ cảnh.', 'Cần nghiên cứu kỹ cách mặc để tôn trọng giá trị lịch sử.'],
    culturalTips: ['Hoa văn trên áo nhật bình thường là phượng hoàng (nữ), rồng (nam), mang ý nghĩa địa vị.', 'Khi mặc áo nhật bình, tóc thường vấn hoặc búi cao với trâm cài.'],
    styleSuggestions: { traditional: 'Áo nhật bình đỏ + váy lụa đỏ + hài thêu + vương miện', fusion: 'Áo nhật bình phối cùng váy hiện đại cùng tông + giày heels đơn giản', genz: 'Áo nhật bình làm top + chân váy dài xẻ tà + boots mạ vàng' },
    tags: ['Cố đô Huế', 'Triều Nguyễn', 'Sang trọng'],
  },
  {
    id: 'ao-yem',
    name: 'Áo Yếm',
    region: 'north',
    regionLabel: 'Truyền thống',
    emoji: '🌸',
    color: '#E8956D',
    bgGradient: 'linear-gradient(135deg, #E8956D, #C0392B)',
    shortDesc: 'Nét duyên dáng thuần Việt xưa.',
    desc: 'Áo yếm là loại áo lót mặc trong truyền thống của phụ nữ Việt, được làm từ một mảnh vải hình thoi hoặc vuông buộc ra sau gáy và sau lưng. Hiện nay được phối sáng tạo làm áo ngoài thời trang.',
    origin: 'Có lịch sử hàng ngàn năm, xuất hiện trong các tranh dân gian Đông Hồ và thơ ca Việt Nam cổ điển.',
    occasions: ['Lễ hội dân gian', 'Chụp ảnh nghệ thuật', 'Street fashion', 'Biểu diễn văn hóa'],
    colors: ['#E8956D', '#C0392B', '#F5D26E', '#1A7A4C', '#FFFFFF', '#FFB6C1'],
    warnings: ['Hiện đại hóa áo yếm cần khéo léo để không gây phản cảm – nên mặc lồng với áo phông hoặc áo sơ mi.'],
    culturalTips: ['Áo yếm truyền thống thường có màu trắng, hồng, đỏ – màu tươi tắn tượng trưng cho nét xuân thì.', 'Kiểu yếm cổ xây (thẳng), cổ xẻ (V), cổ nhọn – mỗi kiểu có dịp mặc khác nhau.'],
    styleSuggestions: { traditional: 'Yếm trắng + váy đen/tím + thắt lưng bao + khăn vấn', fusion: 'Yếm hồng lồng áo phông trắng mỏng + quần jeans ống rộng', genz: 'Yếm làm top + bike shorts + oversized blazer + chunky sneakers' },
    tags: ['Dân gian', 'Thuần Việt', 'Cổ điển'],
  },
  {
    id: 'ao-giao-linh',
    name: 'Áo Giao Lĩnh',
    region: 'north',
    regionLabel: 'Miền Bắc',
    emoji: '🎐',
    color: '#2E4A7A',
    bgGradient: 'linear-gradient(135deg, #2E4A7A, #1A2E4A)',
    shortDesc: 'Cổ phục thuần Việt lâu đời nhất của người Kinh.',
    desc: 'Áo giao lĩnh là một trong những loại cổ phục lâu đời nhất của người Việt, có đặc trưng cổ chéo (hai vạt cổ giao nhau tạo hình chữ V), thân áo rộng và dài. Đây là tiền thân của nhiều loại trang phục truyền thống Việt Nam sau này.',
    origin: 'Có lịch sử từ thời Lý – Trần (thế kỷ 10-14), phổ biến trong dân gian và cung đình. Áo giao lĩnh là nền tảng cho sự phát triển của áo tứ thân và áo ngũ thân về sau.',
    occasions: ['Tái hiện lịch sử', 'Lễ hội văn hóa', 'Chụp ảnh cổ phục', 'Hoạt động phục dựng Việt phục'],
    colors: ['#2E4A7A', '#3D2B6E', '#1A7A4C', '#C0392B', '#2C2C2C', '#DEB887', '#8B6914'],
    warnings: ['Áo giao lĩnh cần mặc đúng chiều vạt – vạt phải đè lên vạt trái (theo lối mặc truyền thống người Việt).', 'Tránh nhầm lẫn với áo giao lĩnh kiểu Hán – cần tìm hiểu kỹ đặc trưng cổ phục Việt.'],
    culturalTips: ['Cổ giao lĩnh chéo sang phải là đặc trưng của trang phục người Việt, phân biệt với cổ phục các nước láng giềng.', 'Thường mặc kèm thắt lưng vải hoặc dây lưng, tóc búi cao hoặc vấn khăn.', 'Áo giao lĩnh phản ánh thẩm mỹ giản dị, tự nhiên của người Việt thời cổ đại.'],
    styleSuggestions: { traditional: 'Áo giao lĩnh xanh lam + quần lụa trắng + thắt lưng vải + giày vải', fusion: 'Áo giao lĩnh cách tân + quần ống suông hiện đại + giày bệt', genz: 'Áo giao lĩnh phối layer áo phông bên trong + quần wide-leg + sneakers trắng' },
    tags: ['Cổ phục', 'Thời Lý-Trần', 'Thuần Việt'],
  },

];

const ACCESSORIES = [
  { id: 'non-la', name: 'Nón Lá', emoji: '🎩', desc: 'Nón lá truyền thống, tượng trưng cho phụ nữ Việt.' },
  { id: 'non-quai-thao', name: 'Nón Quai Thao', emoji: '🎀', desc: 'Nón rộng vành của miền Bắc, đặc trưng quan họ.' },
  { id: 'khan-dong', name: 'Khăn Đóng', emoji: '🧣', desc: 'Khăn vấn truyền thống, trang trọng, lịch sự.' },
  { id: 'vong-co', name: 'Vòng Cổ', emoji: '📿', desc: 'Trang sức cổ truyền, vàng hoặc bạc.' },
  { id: 'bong-tai', name: 'Bông Tai', emoji: '💎', desc: 'Hoa tai đặc trưng phong cách Việt cổ.' },
  { id: 'vong-tay', name: 'Vòng Tay', emoji: '💍', desc: 'Vòng bạc/vàng hoặc ngọc, tượng trưng may mắn.' },
  { id: 'tui-tay', name: 'Túi Tay', emoji: '👜', desc: 'Túi cầm tay phong cách cổ điển.' },
  { id: 'guoc-moc', name: 'Guốc Mộc', emoji: '👡', desc: 'Guốc gỗ truyền thống, vừa đẹp vừa bền.' },
  { id: 'hai-cong', name: 'Hài Cong', emoji: '👟', desc: 'Hài mũi cong cung đình, tinh xảo.' },
  { id: 'quat-lua', name: 'Quạt Lụa', emoji: '🪭', desc: 'Quạt lụa thêu hoa, nét duyên dáng phụ nữ Việt.' },
  { id: 'tram-cai', name: 'Trâm Cài', emoji: '🪷', desc: 'Trâm cài tóc bạc/vàng, cổ điển thanh lịch.' },
  { id: 'day-lung', name: 'Dây Lưng', emoji: '🎗️', desc: 'Thắt lưng bao/thắt lưng bạc, điểm nhấn trang phục.' },
];

const COLORS = [
  { hex: '#C0392B', name: 'Đỏ son', meaning: 'Hỷ sự, may mắn, cát tường', good: ['wedding', 'festival', 'tet'] },
  { hex: '#E8956D', name: 'Cam đất', meaning: 'Năng động, ấm áp, hiếu khách', good: ['festival', 'street'] },
  { hex: '#F5D26E', name: 'Vàng lụa', meaning: 'Phồn thịnh, quý phái, trường thọ', good: ['wedding', 'ceremony'] },
  { hex: '#1A7A4C', name: 'Lục ngọc', meaning: 'Thiên nhiên, thanh tịnh, hy vọng', good: ['ceremony', 'school'] },
  { hex: '#3D2B6E', name: 'Tím huyền', meaning: 'Trí tuệ, cao quý, huyền bí', good: ['ceremony', 'school'] },
  { hex: '#6B4226', name: 'Nâu đất', meaning: 'Bình dị, gần gũi, kiên định', good: ['festival', 'street'] },
  { hex: '#DEB887', name: 'Vàng cát', meaning: 'Thuần khiết, thanh tao, tinh tế', good: ['street', 'school'] },
  { hex: '#FFFFFF', name: 'Trắng ngà', meaning: 'Tinh khiết, trong sáng (lưu ý: không mặc tang lễ)', good: ['wedding', 'school'] },
  { hex: '#2C2C2C', name: 'Đen huyền', meaning: 'Sang trọng, bí ẩn, hiện đại', good: ['street', 'ceremony'] },
  { hex: '#FFB6C1', name: 'Hồng phấn', meaning: 'Dịu dàng, nữ tính, tươi trẻ', good: ['festival', 'street', 'school'] },
  { hex: '#87CEEB', name: 'Xanh trời', meaning: 'Tự do, trong sáng, phóng khoáng', good: ['street', 'school'] },
  { hex: '#9B59B6', name: 'Tím lavender', meaning: 'Sáng tạo, cá tính, độc đáo', good: ['street'] },
];

const WEATHER_TIPS = {
  sunny: {
    tip: 'Thời tiết nắng nóng: Chọn vải lụa tơ tằm, voan mỏng hoặc lanh tự nhiên. Màu sáng giúp phản xạ ánh nắng. Nón lá là phụ kiện không thể thiếu!',
    recommended: ['ao-dai', 'ao-ba-ba', 'ao-yem'],
    avoid: ['ao-ngu-than'],
  },
  cool: {
    tip: 'Thời tiết mát mẻ: Vải gấm, lụa dày hoặc nhung nhẹ rất phù hợp. Đây là thời tiết lý tưởng để mặc áo ngũ thân, áo giao lĩnh hoặc áo tứ thân.',
    recommended: ['ao-ngu-than', 'ao-tu-than', 'ao-nhat-binh', 'ao-giao-linh'],
    avoid: [],
  },
  rain: {
    tip: 'Mùa mưa: Chọn vải có khả năng chống thấm nhẹ hoặc che thêm áo mưa trong suốt. Tránh vải lụa mỏng dễ bị ướt. Phối cùng ủng cao su phong cách retro rất đẹp!',
    recommended: ['ao-ba-ba', 'ao-dai'],
    avoid: ['ao-nhat-binh'],
  },
  winter: {
    tip: 'Thời tiết lạnh: Mặc thêm áo khoác dạ hoặc áo choàng lụa bên ngoài. Khăn quàng tơ tằm vừa ấm vừa hợp với Việt phục. Màu trầm như đỏ đô, xanh tím, nâu rất phù hợp.',
    recommended: ['ao-ngu-than', 'ao-tu-than', 'ao-nhat-binh', 'ao-giao-linh'],
    avoid: ['ao-yem'],
  },
};

const TIMELINE_DATA = [
  { year: 'Thế kỷ 10-13', title: 'Thời Lý – Trần: Nền tảng trang phục Việt', desc: 'Trang phục Việt Nam bắt đầu hình thành bản sắc riêng với áo giao lĩnh, áo đối khâm. Triều đình quy định màu sắc, kiểu dáng theo thứ bậc xã hội.' },
  { year: 'Thế kỷ 14-17', title: 'Thời Lê: Định hình hệ thống trang phục', desc: 'Triều Lê ban hành nhiều quy định về trang phục. Áo đoạn tứ thân, áo bộ phổ biến trong dân gian. Vải lụa Hà Đông và tơ tằm trở thành đặc sản.' },
  { year: 'Thế kỷ 18', title: 'Thời Nguyễn: Áo dài ra đời', desc: 'Chúa Nguyễn Phúc Khoát ban lệnh mặc quần hai ống tại Đàng Trong – tiền thân của áo dài hiện đại. Bắt đầu phân hóa trang phục Bắc-Nam.' },
  { year: 'Thế kỷ 19', title: 'Cung đình Huế: Đỉnh cao Việt phục', desc: 'Triều Nguyễn hoàn thiện hệ thống trang phục cung đình với áo ngũ thân, áo nhật bình. Nghề thêu Huế đạt đỉnh cao với những bộ long phục lộng lẫy.' },
  { year: '1930-1954', title: 'Áo dài cách tân – Lemur', desc: 'Nhà thiết kế Nguyễn Cát Tường tạo ra "áo Lemur" – áo dài hiện đại đầu tiên với cổ tay phương Tây, thân ôm. Áo dài trở thành biểu tượng phụ nữ mới.' },
  { year: '2015-nay', title: 'Phong trào Việt phục hiện đại', desc: 'Thế hệ trẻ phục dựng áo ngũ thân, áo nhật bình, áo tứ thân. Kết hợp truyền thống với phong cách hiện đại, tạo nên xu hướng "Việt phục Gen Z" sôi nổi.' },
];

const CULTURE_RULES = [
  { type: 'do', icon: '✅', title: 'Tìm hiểu ý nghĩa trước khi mặc', desc: 'Mỗi loại trang phục có dịp mặc phù hợp riêng. Áo đại tang (màu trắng trơn) chỉ mặc đám tang, không mặc ngày vui.' },
  { type: 'do', icon: '✅', title: 'Chọn vải và màu sắc phù hợp dịp', desc: 'Áo cưới nên chọn màu đỏ, hồng, vàng. Áo lễ hội nên tươi sáng. Áo tế lễ nên trang nghiêm, không quá sặc sỡ.' },
  { type: 'do', icon: '✅', title: 'Kết hợp phụ kiện truyền thống', desc: 'Nón lá, khăn đóng, quạt lụa, vòng bạc... là những phụ kiện giúp trang phục hoàn chỉnh và tôn lên vẻ đẹp văn hóa.' },
  { type: 'do', icon: '✅', title: 'Tôn trọng trang phục dân tộc thiểu số', desc: 'Khi diện trang phục dân tộc, tìm hiểu kỹ về ý nghĩa, mặc đúng cách và với thái độ trân trọng.' },
  { type: 'dont', icon: '❌', title: 'Không mix loạn kiểu dáng trái biệt', desc: 'Không mặc áo dài với quần jeans bó, không mặc nón quai thao với áo bà ba miền Nam – mỗi phụ kiện thuộc về vùng văn hóa cụ thể.' },
  { type: 'dont', icon: '❌', title: 'Không dùng màu vàng tùy tiện với áo cung đình', desc: 'Màu vàng (hoàng bào) trong truyền thống chỉ dành cho hoàng tộc. Trong ngữ cảnh lễ hội có thể linh động, nhưng cần nhận thức.' },
  { type: 'dont', icon: '❌', title: 'Không biến trang phục thành phục trang hóa trang', desc: 'Việt phục không phải costume Halloween. Khi phối đồ sáng tạo, vẫn phải giữ đúng bản sắc cốt lõi của trang phục.' },
  { type: 'dont', icon: '❌', title: 'Không bỏ qua phụ kiện quan trọng', desc: 'Áo tứ thân thiếu thắt lưng, yếm thiếu lớp phủ phù hợp là không hoàn chỉnh về mặt văn hóa.' },
];

const REGIONS = [
  { name: 'Miền Bắc', icon: '🏔️', desc: 'Vùng văn hóa Kinh kỳ với truyền thống trang phục tinh tế, kín đáo.', costumes: ['Áo tứ thân', 'Áo giao lĩnh', 'Áo cánh', 'Khăn mỏ quạ', 'Nón quai thao', 'Áo the'] },
  { name: 'Kinh Bắc (Bắc Ninh)', icon: '🎵', desc: 'Quê hương quan họ với áo tứ thân duyên dáng, nón quai thao đặc trưng.', costumes: ['Áo tứ thân', 'Nón quai thao', 'Thắt lưng nhiễu điều'] },
  { name: 'Miền Trung', icon: '🌊', desc: 'Kinh đô Huế – trung tâm văn hóa với trang phục cung đình lộng lẫy, uy nghi.', costumes: ['Áo ngũ thân', 'Áo nhật bình', 'Áo dài Huế', 'Nón bài thơ'] },
  { name: 'Miền Nam', icon: '🌴', desc: 'Vùng đất mới với trang phục phóng khoáng, đa dạng, tiện dụng.', costumes: ['Áo bà ba', 'Áo dài tân thời', 'Khăn rằn', 'Nón lá Nam Bộ'] },
];

const MODERN_TRENDS = [
  { icon: '✨', title: 'Áo dài cách tân', desc: 'Giữ nguyên cổ áo và đường may truyền thống nhưng đa dạng hóa chất liệu: denim, tweed, ren, vải in họa tiết hiện đại.' },
  { icon: '🔀', title: 'Fusion – Kết hợp đông tây', desc: 'Áo ngũ thân mặc cùng quần tây, áo tứ thân phối giày thể thao, áo bà ba đi cùng phụ kiện streetwear.' },
  { icon: '🎨', title: 'Họa tiết đương đại', desc: 'In hoa văn truyền thống (trống đồng, hoa sen, rồng phượng) lên chất liệu hiện đại, tạo ngôn ngữ thời trang mới.' },
  { icon: '♻️', title: 'Bền vững & thủ công', desc: 'Xu hướng chọn vải tự nhiên, vải dệt thủ công, hàng thêu tay từ làng nghề truyền thống để ủng hộ nghề thủ công Việt.' },
  { icon: '📱', title: 'Việt phục online & cộng đồng', desc: 'Cộng đồng Việt phục trên mạng xã hội phát triển mạnh, chia sẻ kiến thức, phối đồ và vận động tôn trọng văn hóa.' },
  { icon: '🌍', title: 'Xuất khẩu văn hóa', desc: 'Các NTK Việt Nam đưa Việt phục lên sàn diễn quốc tế, giới thiệu vẻ đẹp trang phục Việt đến bạn bè thế giới.' },
];

const EVENT_SUGGESTIONS = {
  festival: { colors: ['#C0392B', '#F5D26E', '#1A7A4C'], costumes: ['ao-dai', 'ao-tu-than', 'ao-ba-ba'], accessories: ['non-la', 'quat-lua', 'vong-co'] },
  tet: { colors: ['#C0392B', '#F5D26E', '#E8956D'], costumes: ['ao-dai', 'ao-ngu-than', 'ao-tu-than'], accessories: ['non-la', 'vong-co', 'bong-tai'] },
  wedding: { colors: ['#C0392B', '#F5D26E', '#FFB6C1'], costumes: ['ao-dai', 'ao-nhat-binh'], accessories: ['vong-co', 'bong-tai', 'vong-tay', 'tram-cai'] },
  school: { colors: ['#FFFFFF', '#F5D26E', '#87CEEB'], costumes: ['ao-dai'], accessories: ['non-la', 'tui-tay'] },
  street: { colors: ['#2C2C2C', '#9B59B6', '#87CEEB'], costumes: ['ao-dai', 'ao-ba-ba', 'ao-yem'], accessories: ['quat-lua', 'tui-tay', 'vong-tay'] },
  ceremony: { colors: ['#1A7A4C', '#2C2C2C', '#8B6914'], costumes: ['ao-ngu-than', 'ao-nhat-binh', 'ao-giao-linh'], accessories: ['khan-dong', 'vong-co', 'hai-cong'] },
};

// Editorial content remains unverified; empty sources are an explicit placeholder.
for (const records of [COSTUMES, ACCESSORIES, COLORS, TIMELINE_DATA, CULTURE_RULES, REGIONS, MODERN_TRENDS, Object.values(WEATHER_TIPS), Object.values(EVENT_SUGGESTIONS)]) {
  for (const record of records) { record.sources = []; record.needsVerification = true; }
}
