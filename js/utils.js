/**
 * @file utils.js
 * @description Các lớp tiện ích cho Việt Phục AI Stylist
 */

// ─────────────────────────────────────────────
/**
 * @class OutfitAnalyzer
 * @description Phân tích bộ đồ dựa trên DB.checkOutfit().
 *   - Cảnh báo CÓ NGUỒN (advisories) chỉ để thông tin, không trừ điểm.
 *   - Cảnh báo AI_INFERRED (warnings) mới trừ điểm: 'warn' -20, 'info' -5.
 *   - Điểm chỉ là ước lượng từ các luật gợi ý của AI, không phải kết luận lịch sử.
 */
class OutfitAnalyzer {
  static PENALTY = { warn: 20, info: 5 };

  /**
   * @param {string[]} wearing - Mảng item_id đang mặc
   * @param {{externalTags?: string[], colors?: Object}} [opts]
   * @returns {{ score: number, check: object, warnings: string[], uncovered: string[] } | null}
   */
  static analyze(wearing, opts = {}) {
    if (!wearing || wearing.length === 0) return null;

    const check = window.DB.checkOutfit(wearing, {
      externalTags: opts.externalTags || [],
      colors: opts.colors || {},
    });

    let score = 100;
    check.warnings.forEach(w => { score -= OutfitAnalyzer.PENALTY[w.severity] || 0; });
    score = Math.max(0, Math.min(100, score));

    // Món chưa có dữ liệu AI nào: điểm số chưa nói được gì về các món này
    const uncovered = wearing
      .filter(id => window.DB.getById(id) && !window.DB.getAiLayer(id))
      .map(id => window.DB.getById(id).name);

    return {
      score,
      check,
      uncovered,
      warnings: check.warnings.map(w => w.message), // giữ cho code cũ cần chuỗi thuần
    };
  }

  /**
   * @param {number} score
   * @returns {{ label: string, cssClass: string }}
   */
  static scoreToLabel(score) {
    if (score >= 85) return { label: 'Khá ổn', cssClass: 'score-g' };
    if (score >= 60) return { label: 'Cần cân nhắc', cssClass: 'score-o' };
    return                { label: 'Cần xem lại', cssClass: 'score-r' };
  }

  /**
   * Món có thể không hợp với bộ đồ hiện tại (gợi ý của AI, chỉ để đánh dấu).
   * @param {string[]} wearing
   * @returns {Set<string>}
   */
  static getIncompatibleIds(wearing) {
    return window.DB.getSoftConflictIds(wearing || []);
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
    const safeText = String(text || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
    return StyleUtils.parseNewlines(StyleUtils.parseBold(safeText));
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
