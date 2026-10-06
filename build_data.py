"""
build_data.py  (v2)
Sinh js/data.js từ 4 file dữ liệu:
  - viet_phuc_items.json               dữ liệu CÓ NGUỒN
  - viet_phuc_sources.json             bảng nguồn (items[].source_ids trỏ vào đây)
  - viet_phuc_items_AI_GENERATED.json  dữ liệu AI TỰ SINH (luôn gắn provenance)
  - viet_phuc_schema.json              enum + thang tier

Nguyên tắc: dữ liệu có nguồn và dữ liệu AI KHÔNG bị trộn. Item giữ nguyên như file
nguồn; lớp AI nằm ở mục riêng (ai_by_item, rules) và mọi cảnh báo đều mang nhãn
provenance = SOURCED | AI_INFERRED để giao diện hiển thị khác nhau.
"""
import json
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE = Path(__file__).resolve().parent
F_ITEMS = BASE / "viet_phuc_items.json"
F_SOURCES = BASE / "viet_phuc_sources.json"
F_AI = BASE / "viet_phuc_items_AI_GENERATED.json"
F_SCHEMA = BASE / "viet_phuc_schema.json"
OUT_JS = BASE / "js" / "data.js"
OUT_REPORT = BASE / "build_result.txt"

# Loại bỏ cơ chế sinh ảnh AI (Pollinations.ai không dùng)


def load(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# 1. Cấu hình thủ công
# ---------------------------------------------------------------------------
EMOJI = {
    "ao_tu_than_001": "👘", "ao_yem_001": "🎗️", "ao_giao_linh_001": "🎎",
    "ao_ngu_than_tay_thung_001": "🥻", "ao_ngu_than_tay_chen_001": "🥻",
    "ao_nhat_binh_001": "🎏", "ao_ba_ba_001": "👚", "vay_dup_001": "👗",
    "quan_nai_den_001": "👖", "quan_trang_ong_rong_001": "👖",
    "khan_mo_qua_001": "🧣", "non_quai_thao_001": "🎩", "khan_dong_001": "🧢",
    "dai_lung_hoa_ly_001": "🎀",
    "toc_duoi_ga_001": "💇", "guoc_moc_001": "👡", "dep_cong_001": "👞",
    "khan_ran_001": "🧶",
}

# Món "ngoài CSDL" mà luật AI nhắc tới. Giao diện có thể cho người dùng bật các thẻ
# này để thử phối (ví dụ chọn "Giày thể thao hiện đại") và checkOutfit sẽ cảnh báo.
EXTERNAL_TAGS = {
    "sneaker":    "Giày thể thao hiện đại",
    "jeans":      "Quần jean",
    "modern_top": "Áo hai dây / bikini hiện đại",
    "modern_hat": "Mũ / nón hiện đại",
    "non_la":     "Nón lá",
}

# File AI ghi luật dưới dạng văn bản tự do. Bảng này chuyển từng câu thành luật
# máy kiểm tra được. Câu nào KHÔNG có trong bảng sẽ bị báo "unmapped" trong
# build_result.txt (và vẫn được giữ lại dưới dạng text để hiển thị, không tự kiểm tra).
#   item     : cảnh báo khi trong bộ có món thuộc targets
#   external : cảnh báo khi người dùng bật thẻ ngoài CSDL
#   color    : cảnh báo khi màu người dùng chọn cho món này nằm trong colors
#   text     : lưu ý để đọc, không tự kiểm tra (phụ thuộc người mặc / chi tiết may)
SNEAKER = {"type": "external", "tags": ["sneaker"]}
RULE_MAP = {
    "Giày thể thao hiện đại": SNEAKER,
    "Giày sneaker hiện đại": SNEAKER,
    "Quần jean": {"type": "external", "tags": ["jeans"]},
    "Bikini/áo hai dây hiện đại làm ngoại y": {"type": "external", "tags": ["modern_top"]},
    "Mũ/nón hiện đại": {"type": "external", "tags": ["modern_hat"]},
    "Nón lá": {"type": "external", "tags": ["non_la"]},
    "Khăn rằn": {"type": "item", "targets": ["khan_ran_001"]},
    "Khăn rằn (biểu tượng Nam Bộ)": {"type": "item", "targets": ["khan_ran_001"]},
    "Khăn mỏ quạ": {"type": "item", "targets": ["khan_mo_qua_001"]},
    "Nón quai thao": {"type": "item", "targets": ["non_quai_thao_001"]},
    "Áo yếm kiểu Bắc Bộ": {"type": "item", "targets": ["ao_yem_001"]},
    "Áo Nhật Bình": {"type": "item", "targets": ["ao_nhat_binh_001"]},
    "Vàng tươi/vàng cam (màu dành cho hoàng gia)": {"type": "color", "colors": ["vàng", "cam"]},
    # Chủ ý để text: không thể kiểm bằng dữ liệu bộ đồ
    "Cổ thẳng kéo kín kiểu Minh/Triều Tiên": {"type": "text"},
    "Người không phải hoàng hậu không mặc vàng/cam; đỏ dành cho công chúa": {"type": "text"},
}

# Luật toàn cục: rule_id -> audience. 'dev' = ghi chú cho người làm dữ liệu, không hiện cho người dùng.
GLOBAL_AUDIENCE = {"region_mixing": "user", "era_enum_gap": "dev"}

SEVERITY_BY_CONFIDENCE = {"trung_binh": "warn", "thap": "info", "rat_thap": "info"}


# ---------------------------------------------------------------------------
# 2. Nạp + kiểm tra
# ---------------------------------------------------------------------------
def main():
    errors, notes = [], []

    items = load(F_ITEMS)["items"]
    sources = load(F_SOURCES)["sources"]
    ai = load(F_AI)
    schema = load(F_SCHEMA)

    item_ids = {i["item_id"] for i in items}
    source_ids = {s["source_id"] for s in sources}
    items_by_id = {i["item_id"]: i for i in items}

    if len(item_ids) != len(items):
        errors.append("item_id bị trùng trong viet_phuc_items.json")

    for it in items:
        for sid in it.get("source_ids", []):
            if sid not in source_ids:
                errors.append(f"{it['item_id']}: source_id không tồn tại: {sid}")
        if not it.get("source_ids"):
            errors.append(f"{it['item_id']}: không có nguồn nào (vi phạm nguyên tắc 'chỉ dữ liệu có nguồn')")
        for ref in it["rules"]["required_matches"] + it["rules"]["common_pairings"]:
            if ref not in item_ids:
                errors.append(f"{it['item_id']}: tham chiếu tới item không tồn tại: {ref}")
        it["emoji"] = EMOJI.get(it["item_id"], "👕")

    # -- Lớp AI --------------------------------------------------------------
    ai_by_item = {}
    for rec in ai["items"]:
        iid = rec["item_id"]
        if iid not in item_ids:
            errors.append(f"AI_GENERATED: item_id không có trong file nguồn: {iid}")
            continue
        if rec.get("provenance") != "AI_INFERRED":
            errors.append(f"AI_GENERATED/{iid}: thiếu provenance=AI_INFERRED")
        ai_by_item[iid] = {k: v for k, v in rec.items() if k != "item_id"}

    # -- Luật cảnh báo kiểm tra được -------------------------------------------
    rules, unmapped = [], []
    for iid, rec in ai_by_item.items():
        for field, kind in (("incompatible_items", "incompatible_item"),
                            ("incompatible_colors", "incompatible_color")):
            block = rec.get(field)
            if not block:
                continue
            conf = block.get("confidence", "rat_thap")
            for n, text in enumerate(block.get("value", []), start=1):
                spec = RULE_MAP.get(text)
                if spec is None:
                    unmapped.append(f"{iid}.{field}: {text}")
                    spec = {"type": "text"}
                if spec["type"] == "item":
                    for t in spec["targets"]:
                        if t not in item_ids:
                            errors.append(f"RULE_MAP: target không tồn tại: {t} (từ '{text}')")
                if spec["type"] == "external":
                    for t in spec["tags"]:
                        if t not in EXTERNAL_TAGS:
                            errors.append(f"RULE_MAP: external tag chưa khai báo: {t}")
                rules.append({
                    "rule_id": f"{iid}:{kind}:{n}",
                    "item_id": iid,
                    "kind": kind,
                    "provenance": "AI_INFERRED",
                    "severity": SEVERITY_BY_CONFIDENCE.get(conf, "info"),
                    "confidence": conf,
                    "label": text,
                    "reasoning": block.get("reasoning", ""),
                    "match": spec,
                })

    # -- Lưu ý văn hóa CÓ NGUỒN (red_flags), luôn hiện kèm món, không cần kích hoạt --
    advisories_by_item = {}
    for it in items:
        flags = it["rules"]["red_flags"]
        if flags:
            advisories_by_item[it["item_id"]] = [{
                "advisory_id": f"{it['item_id']}:red_flag:{n}",
                "provenance": "SOURCED",
                "text": text,
                # Nguồn đang gắn ở cấp món, chưa gắn riêng từng red_flag
                "source_ids": it["source_ids"],
                "source_scope": "item",
            } for n, text in enumerate(flags, start=1)]

    # -- Luật toàn cục ---------------------------------------------------------
    global_rules, dev_notes = [], []
    for g in ai.get("global_rules", []):
        rid = g["rule_id"]
        entry = {"rule_id": rid, "value": g["value"], "provenance": g.get("provenance", "AI_INFERRED"),
                 "confidence": g.get("confidence", ""), "reasoning": g.get("reasoning", "")}
        audience = GLOBAL_AUDIENCE.get(rid)
        if audience is None:
            notes.append(f"global rule '{rid}' chưa khai báo audience, mặc định 'dev' (không hiện cho người dùng)")
            audience = "dev"
        (global_rules if audience == "user" else dev_notes).append(entry)

    if errors:
        write_report(items, sources, ai_by_item, rules, advisories_by_item, global_rules,
                     dev_notes, unmapped, notes, errors)
        print("BUILD FAILED. Xem build_result.txt")
        sys.exit(1)

    payload = {
        "items": items,
        "sources": sources,
        "enums": schema["enums"],
        "ai_by_item": ai_by_item,
        "rules": rules,
        "advisories_by_item": advisories_by_item,
        "external_tags": [{"tag": k, "label": v} for k, v in EXTERNAL_TAGS.items()],
        "global_rules": global_rules,
        "dev_notes": dev_notes,
        "meta": {
            "schema_version": schema.get("version", ""),
            "ai_disclaimer": "Nhãn AI_INFERRED là suy luận của AI, chưa có nguồn xác thực; cần chuyên gia cổ phục duyệt.",
        },
    }

    OUT_JS.parent.mkdir(parents=True, exist_ok=True)
    js = JS_TEMPLATE.replace("/*__PAYLOAD__*/null", json.dumps(payload, ensure_ascii=False, indent=1))
    with open(OUT_JS, "w", encoding="utf-8") as f:
        f.write(js)

    write_report(items, sources, ai_by_item, rules, advisories_by_item, global_rules,
                 dev_notes, unmapped, notes, errors, js_len=len(js))
    print("Done! Xem build_result.txt")


def write_report(items, sources, ai_by_item, rules, advisories, global_rules,
                 dev_notes, unmapped, notes, errors, js_len=None):
    from collections import Counter
    lines = []
    lines.append("FAILED" if errors else f"SUCCESS: wrote {js_len} bytes to {OUT_JS.relative_to(BASE)}")
    lines.append(f"Items: {len(items)} | Sources: {len(sources)} | AI records: {len(ai_by_item)}")
    lines.append("Categories: " + ", ".join(dict.fromkeys(i["category"] for i in items)))
    lines.append(f"Luật kiểm tra được (AI_INFERRED): {len(rules)}")
    lines.append("  theo loại match: " + ", ".join(f"{k}={v}" for k, v in sorted(Counter(r['match']['type'] for r in rules).items())))
    lines.append("  theo mức: " + ", ".join(f"{k}={v}" for k, v in sorted(Counter(r['severity'] for r in rules).items())))
    lines.append(f"Lưu ý văn hóa CÓ NGUỒN (red_flags): {sum(len(v) for v in advisories.values())} ở {len(advisories)} món")
    lines.append(f"Luật toàn cục hiện cho người dùng: {[g['rule_id'] for g in global_rules]}")
    lines.append(f"Ghi chú dev (ẩn khỏi giao diện): {[g['rule_id'] for g in dev_notes]}")
    lines.append(f"Món chưa có bất kỳ dữ liệu AI: {sorted({i['item_id'] for i in items} - set(ai_by_item))}")
    if unmapped:
        lines.append("UNMAPPED (cần thêm vào RULE_MAP, hiện tạm là text, không tự kiểm tra):")
        lines += [f"  - {u}" for u in unmapped]
    for n in notes:
        lines.append(f"NOTE: {n}")
    for e in errors:
        lines.append(f"ERROR: {e}")
    with open(OUT_REPORT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


# ---------------------------------------------------------------------------
# 3. Mẫu data.js
# ---------------------------------------------------------------------------
JS_TEMPLATE = r'''/**
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
const PAYLOAD = /*__PAYLOAD__*/null;

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
'''

if __name__ == "__main__":
    main()