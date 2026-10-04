/**
 * @file utils.js
 * @description Các lớp tiện ích cho Việt Phục AI Stylist
 */

// ─────────────────────────────────────────────
/**
 * @class OutfitAnalyzer
 * @description Phân tích tính tương thích của bộ đồ.
 *   - Kiểm tra cặp không hợp
 *   - Kiểm tra trộn vùng miền
 *   - Tính điểm tương thích 0-100
 */
class OutfitAnalyzer {
  /**
   * @param {string[]} wearing - Mảng item_id đang mặc
   * @returns {{ score: number, warnings: string[] } | null}
   */
  static analyze(wearing) {
    if (!wearing || wearing.length === 0) return null;

    let score = 100;
    const warningSet = new Set();

    // 1. Kiểm tra cặp không tương thích
    for (const wId of wearing) {
      const item = window.DB.getById(wId);
      if (!item) continue;

      for (const otherId of wearing) {
        if (otherId === wId) continue;
        if (item.rules.incompatible_items.includes(otherId)) {
          const other = window.DB.getById(otherId);
          warningSet.add(`"${item.name}" không hợp với "${other ? other.name : otherId}"`);
          score -= 25;
        }
      }
    }

    // 2. Kiểm tra trộn vùng miền
    const regions = [...new Set(
      wearing.flatMap(id => window.DB.getById(id)?.filters?.region || [])
    )];
    if (regions.length > 1) {
      warningSet.add(`Đang trộn trang phục từ ${regions.join(' + ')} — có thể không phù hợp về mặt lịch sử`);
      score -= 20;
    }

    // 3. Kiểm tra trộn triều đại
    const eras = [...new Set(
      wearing.flatMap(id => window.DB.getById(id)?.filters?.era || []).filter(Boolean)
    )];
    if (eras.length > 2) {
      warningSet.add(`Bộ đồ trộn ${eras.length} triều đại khác nhau (${eras.join(', ')})`);
      score -= 10;
    }

    score = Math.max(0, Math.min(100, score));
    return { score, warnings: [...warningSet] };
  }

  /**
   * @param {number} score
   * @returns {{ label: string, cssClass: string }}
   */
  static scoreToLabel(score) {
    if (score >= 85) return { label: 'Xuất sắc', cssClass: 'score-g' };
    if (score >= 60) return { label: 'Khá tốt',  cssClass: 'score-o' };
    return                { label: 'Cần xem lại', cssClass: 'score-r' };
  }

  /**
   * Lấy danh sách item_id không tương thích với bộ đồ hiện tại
   * @param {string[]} wearing
   * @returns {Set<string>}
   */
  static getIncompatibleIds(wearing) {
    const set = new Set();
    for (const id of wearing) {
      const item = window.DB.getById(id);
      if (!item) continue;
      item.rules.incompatible_items.forEach(iid => set.add(iid));
    }
    return set;
  }
}

// ─────────────────────────────────────────────
/**
 * @class StyleUtils
 * @description Các hàm hỗ trợ hiển thị và định dạng
 */
class StyleUtils {
  static REGION_CLASS_MAP = {
    'Bắc Bộ':   'rgn-b',
    'Trung Bộ': 'rgn-t',
    'Nam Bộ':   'rgn-n'
  };

  static CATEGORIES = [
    { key: 'Áo khoác ngoài', icon: '🥻', label: 'Áo khoác ngoài' },
    { key: 'Áo lót trong',   icon: '🎗️', label: 'Áo lót trong' },
    { key: 'Quần/Váy',       icon: '👗', label: 'Quần / Váy' },
    { key: 'Phụ kiện đầu',   icon: '🎩', label: 'Phụ kiện đầu' },
    { key: 'Phụ kiện thân',  icon: '🎀', label: 'Phụ kiện thân' },
    { key: 'Giày dép',       icon: '👡', label: 'Giày dép' },
  ];

  /** @returns {string} CSS class cho region badge */
  static regionClass(regions) {
    if (!regions || regions.length === 0) return 'rgn-a';
    if (regions.length > 1) return 'rgn-a';
    return StyleUtils.REGION_CLASS_MAP[regions[0]] || 'rgn-a';
  }

  /** @returns {string} Nhãn hiển thị của region */
  static regionLabel(regions) {
    if (!regions || regions.length === 0) return '';
    if (regions.length > 1) return 'Cả nước';
    return regions[0];
  }

  /** Bold **text** trong chuỗi */
  static parseBold(text) {
    if (!text) return '';
    return text.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--goldL)">$1</strong>');
  }

  /** Xuống dòng \n -> <br/> */
  static parseNewlines(text) {
    return (text || '').replace(/\n/g, '<br/>');
  }

  /** Kết hợp bold + newline */
  static formatMessage(text) {
    return StyleUtils.parseNewlines(StyleUtils.parseBold(text || ''));
  }

  /** Viết hoa chữ cái đầu của string */
  static capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Gán vào window để các module khác sử dụng
window.OutfitAnalyzer = OutfitAnalyzer;
window.StyleUtils = StyleUtils;
