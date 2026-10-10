// Curated general garment knowledge. This does not certify individual outfit photos.
(function(scope){
 'use strict';
 const text=(vi,en,sourceIds=[])=>({vi,en,sourceIds});
 const sources=[
  {id:'src_001',publisher:'Diễn Đàn',title:'Áo tứ thân, khăn mỏ quạ',url:'https://www.diendan.org/phe-binh-nghien-cuu/ao-tu-than-khan-mo-qua',kind:'essay'},
  {id:'src_007',publisher:'Báo Pháp luật Việt Nam',title:'Đừng nhân danh cách tân để làm biến dạng trang phục truyền thống',url:'https://baophapluat.vn/dung-nhan-danh-cach-tan-de-lam-bien-dang-trang-phuc-truyen-thong-post479239.html',kind:'press'},
  {id:'src_013',publisher:'Wikipedia',title:'Áo giao lĩnh',url:'https://en.wikipedia.org/wiki/%C3%81o_giao_l%C4%A9nh',kind:'secondary-reference'},
  {id:'src_016',publisher:'VietnamPlus · TTXVN',title:'Độc đáo áo ngũ thân – Bản sắc văn hoá Việt',url:'https://mega.vietnamplus.vn/doc-dao-ao-ngu-than-ban-sac-van-hoa-viet-5419.html',kind:'press'},
  {id:'src_025',publisher:'Tạp chí Văn hóa Nghệ thuật',title:'Hoa văn trang trí trên áo Nhật Bình của Đoan Huy Hoàng thái hậu triều Nguyễn (1802–1945)',url:'https://vanhoanghethuat.vn/hoa-van-trang-tri-tren-ao-nhat-binh-cua-doan-huy-hoang-thai-hau-trieu-nguyen-1802-1945-77758106.html',kind:'artifact-study'},
  {id:'src_026',publisher:'Báo Phụ nữ Việt Nam',title:'Áo Nhật Bình: Từ trang phục chỉ dành cho hậu cung triều Nguyễn tới xu hướng được ưa chuộng',url:'https://phunuvietnam.vn/ao-nhat-binh-ngay-cang-duoc-ua-chuong-20221210103051442.htm',kind:'press'},
  {id:'src_030',publisher:'Báo Thanh Niên',title:'Bà ba, khăn rằn biểu tượng của đất và người phương Nam',url:'https://thanhnien.vn/ba-ba-khan-ran-bieu-tuong-cua-dat-va-nguoi-phuong-nam-185230426180249809.htm',kind:'press'},
  {id:'extra_ao_dai_01',publisher:'Cục Du lịch Quốc gia Việt Nam · Vietnam.travel',title:"All about ao dai: Vietnam's national dress",url:'https://vietnam.travel/things-to-do/ao-dai-vietnam',kind:'official-tourism'}
 ].map(source=>({...source,reviewStatus:'read-and-compared',accessedAt:'2026-10-10'}));
 const profiles=[
  {id:'ao-dai',recordIds:[],status:'source-compared',regionIds:['north','central','south'],regionLabel:text('Phổ biến tại Việt Nam','Across Vietnam',['extra_ao_dai_01']),
   summary:text('Áo dài là biểu tượng trang phục Việt, với thân áo dài mặc cùng quần.','Ao dai is an emblem of Vietnamese dress: a long tunic worn with trousers.',['extra_ao_dai_01']),
   history:text('Dạng áo dài hiện đại gắn với các cải tiến của Nguyễn Cát Tường (Le Mur) trong thập niên 1930.','The modern form is associated with Nguyen Cat Tuong (Le Mur) and his changes in the 1930s.',['extra_ao_dai_01']),
   construction:text('Hai tà trước và sau; các phiên bản hiện đại thay đổi cổ, tay và độ dài.','Front and back panels; contemporary versions vary in neckline, sleeves and length.',['extra_ao_dai_01']),
   materials:text('Lụa là một chất liệu được giới thiệu trong hướng dẫn may áo dài.','Silk is among the fabrics described in the tailoring guide.',['extra_ao_dai_01']),
   usage:text('Ngày Tết, lễ cưới và dịp trang trọng; cần phân biệt bản cách tân với phục dựng lịch sử.','Worn at Tet, weddings and formal occasions; distinguish adaptations from historical reconstruction.',['extra_ao_dai_01']),
   uncertainty:text('Không xác định chất liệu hoặc niên đại ảnh mẫu chỉ từ hình dáng áo.','Appearance alone cannot establish a sample photo’s fabric or period.')},
  {id:'ao-tu-than',recordIds:['ao_tu_than_001'],status:'source-compared',regionIds:['north'],regionLabel:text('Gắn với Bắc Bộ','Associated with northern Vietnam',['src_001']),
   summary:text('Áo tứ thân gắn với hình ảnh phụ nữ Bắc Bộ và sinh hoạt lễ hội.','Ao tu than is associated with northern women and festive traditions.',['src_001']),
   history:text('Võ Quang Yến ghi nhận nguồn gốc chưa rõ; hình ảnh áo phổ biến trong tư liệu đầu thế kỷ XX.','Vo Quang Yen notes an uncertain origin and its presence in early twentieth-century records.',['src_001']),
   construction:text('Bốn thân: hai thân sau nối giữa lưng, hai thân trước để rời và có thể buộc.','Four panels: two joined at the back and two separate front panels that may be tied.',['src_001']),
   materials:text('Tư liệu mô tả cách mặc nhiều lớp.','The essay describes layered dress.',['src_001']),
   usage:text('Yếm, khăn mỏ quạ và nón quai thao thường xuất hiện trong mô tả phối truyền thống.','Yem, mo qua headscarves and quai thao hats appear in descriptions of traditional ensembles.',['src_001']),
   uncertainty:text('Không dùng một năm xuất hiện cụ thể hoặc cách giải nghĩa bốn thân như kết luận thống nhất.','An exact origin year or one symbolic interpretation of the four panels is not established.')},
  {id:'ao-ngu-than',recordIds:['ao_ngu_than_tay_thung_001','ao_ngu_than_tay_chen_001'],status:'source-compared',regionIds:['north','central','south'],regionLabel:text('Thời Nguyễn · dấu ấn Huế','Nguyen period · Hue heritage',['src_016']),
   summary:text('Áo ngũ thân được nam và nữ sử dụng rộng rãi trong thời Nguyễn.','Ngu than was widely worn by both men and women during the Nguyen period.',['src_016']),
   history:text('Nguồn VietnamPlus nêu nhiều giả thuyết về sự ra đời; chưa chốt một mốc duy nhất.','VietnamPlus presents competing origin accounts rather than one settled date.',['src_016']),
   construction:text('Năm thân gồm một thân nhỏ bên trong; cổ đứng, năm khuy. Có dạng tay thụng/tấc và tay chẽn.','Five panels include a smaller inner panel; a standing collar and five fasteners. Sleeve types include thung/tac and chen.',['src_016']),
   materials:text('Nguồn mô tả lụa, gấm, sa và đũi trong các cách may.','The article describes silk, brocade, gauze and dui among the fabrics used.',['src_016']),
   usage:text('Huế đang khuyến khích sử dụng lại áo ngũ thân trong đời sống văn hóa.','Hue has encouraged renewed use of ngu than in cultural life.',['src_016']),
   uncertainty:text('Không suy ra ảnh hiện tại là áo tấc hay tay chẽn nếu chưa duyệt cấu tạo.','Current photos are not classified as tac or chen without a construction review.')},
  {id:'ao-nhat-binh',recordIds:['ao_nhat_binh_001'],status:'source-compared',regionIds:['central'],regionLabel:text('Cung đình Nguyễn · Huế','Nguyen court · Hue',['src_025']),
   summary:text('Nhật Bình có nguồn gốc là trang phục nữ trong cung đình Nguyễn.','Nhat Binh originated as women’s dress at the Nguyen court.',['src_025','src_026']),
   history:text('Nghiên cứu của Tạp chí Văn hóa Nghệ thuật phân tích hiện vật áo Đoan Huy Hoàng thái hậu tại Huế.','A Van hoa Nghe thuat study examines a surviving robe of Empress Dowager Doan Huy in Hue.',['src_025']),
   construction:text('Áo đối khâm, cổ mở tạo khung chữ nhật; hoa văn cần đọc theo từng hiện vật.','An open-front robe with a rectangular neckline; motifs must be interpreted for each artifact.',['src_025']),
   materials:text('Nghiên cứu mô tả dệt và thêu trên hiện vật; không suy ra mọi áo mẫu có cùng chất liệu.','The study describes weaving and embroidery on its artifact, not the fabric of every sample.',['src_025']),
   usage:text('Hiện được mặc trong lễ cưới, dịp Tết và chụp ảnh; đó là bối cảnh sử dụng hiện đại.','It is now worn for weddings, Tet and photography; these are contemporary uses.',['src_026']),
   uncertainty:text('Quy chế màu và phụ kiện cung đình phụ thuộc phẩm cấp, thời kỳ; không áp thành lệnh cấm chung.','Court colour and accessory conventions depended on rank and period, not a universal present-day ban.',['src_026'])},
  {id:'ao-ba-ba',recordIds:['ao_ba_ba_001'],status:'source-compared',regionIds:['south'],regionLabel:text('Gắn với Nam Bộ','Associated with southern Vietnam',['src_030']),
   summary:text('Áo bà ba là hình ảnh quen thuộc trong đời sống Nam Bộ.','Ba ba is closely associated with everyday life in southern Vietnam.',['src_030']),
   history:text('Nguồn gốc còn nhiều giả thuyết, gồm ảnh hưởng giao lưu và sự thích nghi của cư dân phương Nam.','Its origins have competing accounts involving cultural exchange and adaptation by southern communities.',['src_030']),
   construction:text('Nguồn mô tả áo cài giữa, cổ tròn truyền thống và các biến đổi kiểu cổ.','The article describes front fastening, a traditional round neckline and later neckline variations.',['src_030']),
   materials:text('Từ vải thô đến lụa và gấm trong các cách may khác nhau.','Different versions use fabrics ranging from coarse cloth to silk and brocade.',['src_030']),
   usage:text('Khăn rằn và nón lá thường gắn với hình ảnh áo bà ba, nhưng không bắt buộc mọi tổ hợp.','Ran scarves and conical hats often accompany ba ba imagery; they are not mandatory in every ensemble.',['src_030']),
   uncertainty:text('Không xác nhận một người sáng tạo hoặc một xuất xứ duy nhất.','Neither a single inventor nor one definitive place of origin is established.')},
  {id:'ao-yem',recordIds:['ao_yem_001'],status:'source-compared',regionIds:['north'],regionLabel:text('Tư liệu Bắc Bộ','Northern dress references',['src_007']),
   summary:text('Yếm truyền thống được mô tả là lớp mặc trong, gắn với trang phục phụ nữ Bắc Bộ.','Traditional yem is described as an underlayer associated with northern women’s dress.',['src_007']),
   history:text('Bài báo dẫn hình ảnh yếm trong văn học và các cách mặc cùng áo ngoài.','The article discusses yem in literature and in layered ensembles.',['src_007']),
   construction:text('Lớp áo che phần ngực, được mặc bên trong áo ngoài trong mô tả truyền thống.','A chest-covering layer worn beneath an outer garment in traditional descriptions.',['src_007']),
   materials:text('Chất liệu từng ảnh chưa xác minh; nguồn bách khoa trong dữ liệu gốc chưa truy cập được.','Photo fabrics remain unverified; the encyclopedia reference in the original data could not be accessed.') ,
   usage:text('Phân biệt yếm trong bộ nhiều lớp với cách dùng yếm làm áo ngoài trong phối hiện đại.','Distinguish yem in a layered ensemble from its use as an outer top in contemporary styling.',['src_007']),
   uncertainty:text('Tư liệu gốc có mốc xuất hiện chưa thống nhất; chưa công bố một niên đại đầu tiên.','The supplied references disagree on its earliest date; no first appearance is asserted.')},
  {id:'ao-giao-linh',recordIds:['ao_giao_linh_001'],status:'reference',regionIds:['north','central','south'],regionLabel:text('Tư liệu Việt trước thế kỷ XIX','Vietnamese references before the 19th century',['src_013']),
   summary:text('Giao lĩnh còn được gọi là tràng vạt, nổi bật với cổ áo giao chéo.','Giao linh, also called trang vat, is distinguished by a crossed collar.',['src_013']),
   history:text('Tư liệu tổng hợp mô tả áo được dùng tại Việt Nam trước thế kỷ XIX.','The secondary reference describes its use in Vietnam before the nineteenth century.',['src_013']),
   construction:text('Thân áo rộng, cổ chéo; có các biến thể chiều dài và tay áo.','A loose robe with a crossed collar and variations in length and sleeves.',['src_013']),
   materials:text('Chưa có nguồn đủ cụ thể để xác định chất liệu các ảnh trong dự án.','No sufficiently specific source identifies the fabric in the project photos.'),
   usage:text('Phục dựng cần đối chiếu hiện vật hoặc hình ảnh cùng thời, thay vì chỉ dựa vào tên áo.','Reconstruction needs period artifacts or imagery, rather than the garment name alone.'),
   uncertainty:text('Mục này dựa trên nguồn tổng hợp; cần đối chiếu thêm nghiên cứu chuyên ngành trước khi dùng học thuật.','This entry uses a secondary reference and needs specialist corroboration before academic use.')}
 ];
 const accessories=[
  {id:'non-quai-thao',recordIds:['non_quai_thao_001'],note:text('Nón quai thao xuất hiện cùng áo tứ thân trong tư liệu sinh hoạt lễ hội.','Quai thao hats appear with tu than in festive dress accounts.',['src_001'])},
  {id:'khan-dong',recordIds:['khan_dong_001'],note:text('Khăn vấn/khăn đóng được mô tả cùng áo ngũ thân.','Wrapped or preformed headwear is described with ngu than.',['src_016'])},
  {id:'guoc-moc',recordIds:['guoc_moc_001'],note:text('Nguồn nhắc guốc trong các cách phối ngũ thân.','The source mentions clogs in ngu than ensembles.',['src_016'])},
  {id:'khan-vanh',recordIds:[],note:text('Khăn vành được mô tả trong cách mặc Nhật Bình; kiểu dùng thay đổi theo thời kỳ.','Vanh headwraps are described with Nhat Binh; conventions changed across periods.',['src_026'])},
  {id:'tram-cai',recordIds:[],note:text('Trâm được nhắc trong phụ kiện của người mặc Nhật Bình.','Hairpins are mentioned among accessories worn with Nhat Binh.',['src_026'])},
  {id:'non-la',recordIds:[],note:text('Nón lá gắn với hình ảnh áo bà ba trong nguồn về Nam Bộ.','Conical hats accompany ba ba imagery in the southern dress source.',['src_030'])},
  {id:'hai-theu',recordIds:[],note:text('Chưa có tư liệu chuyên biệt đã đối chiếu cho hài thêu trong tập nguồn này.','This source set has no reviewed specialist reference for embroidered shoes.')},
  {id:'giay-cao-got',recordIds:[],note:text('Trong demo, giày cao gót là lựa chọn phối hiện đại, không chứng nhận phục dựng.','In this demo, high heels are a contemporary styling choice, not reconstruction evidence.')}
 ];
 const guidance=[
  {id:'context',title:text('Bối cảnh trước, kiểu phối sau','Consider the context'),body:text('Đối chiếu yêu cầu của sự kiện và nơi sử dụng. Những mô tả sử dụng phổ biến không phải lệnh cấm cho mọi trường hợp.','Check the event and setting. Descriptions of common uses are not universal prohibitions.')},
  {id:'reconstruction',title:text('Phục dựng và cách tân','Reconstruction and adaptation'),body:text('Ghi rõ cách tân khi thay kiểu dáng hoặc dùng phụ kiện hiện đại. Muốn phục dựng cần thêm nguồn cùng thời cho từng bộ.','Identify contemporary changes to shape or accessories. Reconstruction needs period evidence for each ensemble.')},
  {id:'colour',title:text('Màu và phẩm cấp','Colour and historical rank'),body:text('Quy chế Nhật Bình tùy phẩm cấp và thời kỳ; không phải quy tắc màu chung cho demo.','Nhat Binh conventions depend on rank and period, not universal demo colour rules.',['src_026'])},
  {id:'evidence',title:text('Đọc nguồn cùng ghi chú','Read the references'),body:text('Ảnh mẫu, nguồn tổng hợp và nghiên cứu hiện vật có giá trị chứng cứ khác nhau. Xem mục chưa xác minh trước khi trích dẫn.','Sample photos, secondary accounts and artifact studies provide different evidence. Check unresolved points before citing.')}
 ];
 // AI_GENERATED rules and the old required_matches are deliberately not imported.
 const audit={reviewedAt:'2026-10-10',sourceFolder:'D:\\AI Arena',localItemCount:18,localSourceCount:39,readSourceCount:8,
  rawFiles:[
   {path:'viet_phuc_items.json',sha256:'2c66e0e2f7c9a27f3e9b897c121618d542866aba33f75355a1942e13d6723859'},
   {path:'viet_phuc_sources.json',sha256:'3513b27fadfc466853252c75c2c1c55ee37dc88c7df0421fb02e08b37ab62157'},
   {path:'viet_phuc_items_AI_GENERATED.json',sha256:'f81169d52081659bcb4a374e2f78f66fbece3c585c334a3c09d4e8ec457697ad'},
   {path:'viet_phuc_schema.json',sha256:'43a4b2258e77d4b6b5c7fa69e8e6f560de8c5f9c3907d184d980e36e4018417c'}
  ],unreadAttempts:[{id:'src_002',reason:'timeout'},{id:'src_008',reason:'HTTP 502'}],
  excludedFiles:['viet_phuc_items_AI_GENERATED.json'],photoCultureVerified:false,scope:'general-garment-knowledge'};
 scope.VietPhucCultureData=Object.freeze({version:1,sources,profiles,accessories,guidance,audit});
})(typeof window!=='undefined'?window:globalThis);
