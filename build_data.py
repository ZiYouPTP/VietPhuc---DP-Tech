"""
Rebuild data.js from the original JSON with correct UTF-8 encoding.
Output is written directly to file to avoid console encoding issues.
"""
import json, os

# Load the original JSON - đọc đúng UTF-8
with open('viet_phuc_items.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

items = data['items']

# Serialize the items as proper JSON with ensure_ascii=False to keep Vietnamese chars
items_json = json.dumps(items, ensure_ascii=False, indent=2)

# Build the data.js content
js_content = '''/**
 * @file data.js
 * @class VietPhucDatabase
 * @description Lớp quản lý toàn bộ dữ liệu trang phục Việt cổ.
 * AUTO-GENERATED từ viet_phuc_items.json - đảm bảo UTF-8
 */
class VietPhucDatabase {
  constructor() {
    this._items = ''' + items_json + ''';

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
'''

output_path = os.path.join('js', 'data.js')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

with open('build_result.txt', 'w', encoding='utf-8') as f:
    f.write(f"SUCCESS: Wrote {len(js_content)} bytes to {output_path}\n")
    f.write(f"Items count: {len(items)}\n")
    f.write(f"First item: {items[0]['name']}\n")
    cats = list(dict.fromkeys(i['category'] for i in items))
    f.write(f"Categories: {', '.join(cats)}\n")

print("Done! Check build_result.txt for details.")
