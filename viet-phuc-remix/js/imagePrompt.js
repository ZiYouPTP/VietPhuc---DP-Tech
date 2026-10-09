// Visual descriptions, not verified historical reconstructions.
export const COSTUME_DETAILS = {
  'ao-dai': {name:'Áo dài',detail:'áo có cổ đứng, tay dài, hai tà dài',material:'silk'},
  'ao-tu-than': {name:'Áo tứ thân',detail:'áo ngoài mở phía trước, các vạt dài; không vẽ kèm yếm hoặc thắt lưng',material:'linen'},
  'ao-ngu-than': {name:'Áo ngũ thân',detail:'áo thân rộng, cổ đứng, hàng khuy lệch, tà dài',material:'brocade'},
  'ao-ba-ba': {name:'Áo bà ba',detail:'áo ngắn, cổ tròn, hàng khuy giữa, hai túi trước',material:'linen'},
  'ao-nhat-binh': {name:'Áo Nhật Bình',detail:'áo khoác rộng, nẹp cổ chữ nhật lớn, tay rộng, tà dài',material:'brocade'},
  'ao-yem': {name:'Áo yếm',detail:'yếm che thân trước, dây buộc cổ, không có tay áo',material:'silk'},
  'ao-giao-linh': {name:'Áo giao lĩnh',detail:'áo cổ chéo, vạt giao nhau, tay rộng và tà dài',material:'linen'},
};
export const MATERIAL_NAMES = {silk:'Lụa',linen:'Đũi / lanh',brocade:'Gấm',velvet:'Nhung'};
for (const record of Object.values(COSTUME_DETAILS)) {record.sources=[];record.needsVerification=true;}
export const PATTERN_NAMES = {plain:'Trơn',lotus:'Hoa sen minh họa',crane:'Hạc minh họa',cloud:'Mây minh họa',brocade:'Hình học dệt minh họa',dots:'Chấm',stripes:'Sọc'};
export const LAYER_ITEMS = {
  ...Object.fromEntries(Object.entries(COSTUME_DETAILS).map(([id,item])=>[id,{...item,zIndex:30}])),
  trousers:{name:'Quần suông',detail:'chỉ quần suông hai ống, vừa với đôi chân body',zIndex:10},
  'inner-yem':{name:'Yếm mặc trong',detail:'chỉ lớp yếm che thân trước để mặc trong áo tứ thân',zIndex:20},
  'non-la':{name:'Nón lá',detail:'chỉ nón lá tại vị trí đầu body',zIndex:60},
  'non-quai-thao':{name:'Nón quai thao',detail:'chỉ nón vành rộng, quai thao, tại vị trí đầu body',zIndex:60},
  'khan-dong':{name:'Khăn đóng',detail:'chỉ khăn đóng tại vị trí đầu body',zIndex:60},
  'vong-co':{name:'Vòng cổ',detail:'chỉ vòng cổ tại vị trí cổ body',zIndex:50},
  'bong-tai':{name:'Bông tai',detail:'chỉ đôi bông tai tại vị trí hai tai body',zIndex:50},
  'vong-tay':{name:'Vòng tay',detail:'chỉ vòng tay tại vị trí cổ tay body',zIndex:50},
  'tui-tay':{name:'Túi tay',detail:'chỉ một túi cầm tay cạnh bàn tay thả xuống của body',zIndex:50},
  'guoc-moc':{name:'Guốc mộc',detail:'chỉ đôi guốc mộc tại vị trí hai bàn chân body',zIndex:40},
  'hai-cong':{name:'Hài cong',detail:'chỉ đôi hài cong tại vị trí hai bàn chân body',zIndex:40},
  'quat-lua':{name:'Quạt lụa',detail:'chỉ quạt lụa cầm tại bàn tay body',zIndex:50},
  'tram-cai':{name:'Trâm cài',detail:'chỉ trâm cài tại vị trí đầu body',zIndex:60},
  'day-lung':{name:'Dây lưng',detail:'chỉ dải lụa thắt lưng tại vị trí eo body',zIndex:40},
};
const clamp=(value,fallback,min,max)=>Number.isFinite(Number(value))?Math.min(max,Math.max(min,Number(value))):fallback;
export function buildLayerPrompt(config={},itemId=config.costumeId) {
  const item=LAYER_ITEMS[itemId]||LAYER_ITEMS['ao-dai'];
  const male=config.body?.gender==='male';
  const w=male?118:105,h=male?308:290,filename=male?'base_body_1.png':'base_body_2.png';
  const color=/^#[0-9a-f]{6}$/i.test(config.color||'')?config.color:'#C0392B';
  return [
    `Tạo một lớp ảnh PNG RIÊNG cho món ${item.name}, để ghép lên ảnh body ${male?'nam':'nữ'} đính kèm (${filename}).`,
    'Ảnh body chỉ dùng làm khuôn tham chiếu vị trí và tư thế. Kết quả chỉ chứa MỘT món đồ, không chứa mannequin, người, da, tóc, nền, chữ hoặc bất kỳ món đồ khác.',
    `Đặc điểm minh họa: ${item.detail}.`,
    `Màu chính ${color}; chất liệu ${MATERIAL_NAMES[config.material]||'Lụa'}; họa tiết ${PATTERN_NAMES[config.pattern]||'Trơn'}.`,
    config.pattern!=='plain'?`Cỡ họa tiết ${clamp(config.patternScale,1,.5,3).toFixed(1)} lần; độ đậm ${Math.round(clamp(config.patternStrength,.45,0,1)*100)}%. Họa tiết nằm trong vùng vải và theo nếp vải.`:'Vải trơn, không tự thêm hoa văn.',
    `Canvas dọc cùng tỉ lệ ${w}:${h} với ảnh tham chiếu; ưu tiên ${w*10} × ${h*10} px. Giữ nguyên toàn bộ khoảng trống của canvas, không cắt sát món đồ, không căn lại món đồ vào giữa.`,
    'Món đồ phải nằm đúng vị trí nó sẽ được mặc trên body, khớp vai, eo, tay và chân theo ảnh tham chiếu. Giữ nguyên hướng cơ thể và góc máy; không chuyển sang tư thế dang tay hoặc chính diện đối xứng.',
    'Nền trong suốt thật (kênh alpha), không dùng nền trắng hay hình ô caro giả. Mọi vùng ngoài món đồ phải trong suốt. Giữ chi tiết đường may, bóng và nếp vải bên trong món đồ.',
    'Không tự thêm rồng, phượng, vương miện hoặc biểu trưng cấp bậc. Không thay bằng kimono/hanbok hay trang phục khác. Đây là ảnh minh họa thiết kế; cấu tạo lịch sử và chiều vạt cần đối chiếu tài liệu riêng, không khẳng định phục dựng chính xác.',
    '',
    'Xuất một file PNG duy nhất, giữ đúng khung hình để chồng trực tiếp lên body gốc. Nếu công cụ không xuất đúng kích thước, đặt kết quả lên canvas đúng tỉ lệ và căn khớp body trước khi nhập vào ứng dụng.',
  ].join('\n');
}
