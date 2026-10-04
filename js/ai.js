/**
 * @file ai.js
 * @class AIStyleEngine
 * @description Logic AI chat để tư vấn phối đồ Việt Phục.
 * Hỗ trợ cả Mock AI và Gemini API thực tế.
 */
class AIStyleEngine {
  constructor(db, analyzer, onResponse, onStartTyping) {
    this.db = db;
    this.analyzer = analyzer;
    this.onResponse = onResponse;
    this.onStartTyping = onStartTyping;
    this.apiKey = '';
    this.useRealAI = false;
    this.conversationHistory = [];
  }

  setApiKey(key) {
    this.apiKey = key.trim();
    this.useRealAI = this.apiKey.length > 0;
  }

  async processMessage(msg, currentOutfit) {
    this.onStartTyping();
    this.conversationHistory.push({ role: 'user', text: msg });

    if (this.useRealAI && this.apiKey) {
      try {
        const response = await this._callGeminiAPI(msg, currentOutfit);
        this.conversationHistory.push({ role: 'ai', text: response.text });
        this.onResponse(response);
        return;
      } catch (err) {
        console.warn('Gemini API error, falling back to mock:', err);
      }
    }

    // Simulate network delay for mock
    await new Promise(r => setTimeout(r, 900 + Math.random() * 700));
    const response = this._generateMockResponse(msg.toLowerCase(), currentOutfit);
    this.conversationHistory.push({ role: 'ai', text: response.text });
    this.onResponse(response);
  }

  async _callGeminiAPI(userMsg, currentOutfit) {
    const outfitContext = currentOutfit.length > 0
      ? currentOutfit.map(id => {
          const item = this.db.getById(id);
          return item ? `${item.name} (${item.category}, ${item.filters?.region?.join('/')})` : id;
        }).join(', ')
      : 'Chưa chọn trang phục nào';

    const analysis = this.analyzer.analyze(currentOutfit);
    const analysisText = analysis
      ? `Điểm tương thích: ${analysis.score}/100. Cảnh báo: ${analysis.warnings.join('; ') || 'Không có'}`
      : 'Chưa có bộ đồ để phân tích';

    const systemPrompt = `Bạn là AI Stylist chuyên về trang phục truyền thống Việt Nam (Việt Phục).
Bộ đồ người dùng đang mặc: ${outfitContext}
Đánh giá bộ đồ: ${analysisText}
Hãy trả lời ngắn gọn, chuyên nghiệp bằng tiếng Việt. Nếu gợi ý trang phục cụ thể, hãy đề cập tên đúng.
Không bịa thông tin lịch sử. Nếu không chắc, hãy nói rõ.`;

    const body = {
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + '\n\nNgười dùng hỏi: ' + userMsg }] }
      ],
      generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi, tôi không có câu trả lời.';
    return { text, suggestedItems: [], warning: null, cultural_note: null };
  }

  _generateMockResponse(text, currentOutfit) {
    const res = { text: '', suggestedItems: [], warning: null, cultural_note: null };

    // Chào hỏi
    if (text.includes('chào') || text.includes('hello') || text.includes('xin chào')) {
      res.text = 'Chào bạn! 👋 Mình là **Việt Phục AI Stylist**.\n\nMình có thể giúp bạn:\n• Phối đồ truyền thống theo vùng miền\n• Tìm hiểu ý nghĩa lịch sử trang phục\n• Kiểm tra tính tương thích của bộ đồ\n\nBạn muốn phối đồ cho dịp nào hoặc vùng miền nào?';
      res.suggestedItems = ['ao_tu_than_001', 'ao_ngu_than_tay_chen_001', 'ao_nhat_binh_001'];
      return res;
    }

    // Bắc Bộ / Áo tứ thân
    if (text.includes('bắc bộ') || text.includes('bắc') || text.includes('tứ thân') || text.includes('kinh bắc')) {
      res.text = 'Với trang phục **Bắc Bộ**, **Áo tứ thân** là lựa chọn kinh điển.\n\nCách phối chuẩn truyền thống:\n• Áo tứ thân (khoác ngoài)\n• Yếm đào (mặc trong)\n• Váy đụp hoặc quần nái đen\n• Khăn mỏ quạ chít đầu\n• Nón quai thao và dây lưng hoa lý';
      res.suggestedItems = ['ao_tu_than_001', 'ao_yem_001', 'khan_mo_qua_001', 'non_quai_thao_001'];
      const item = this.db.getById('ao_tu_than_001');
      res.cultural_note = item?.cultural_context?.historical_meaning || null;
      return res;
    }

    // Cung đình / Huế / Nhật Bình / Ngũ thân
    if (text.includes('cung đình') || text.includes('huế') || text.includes('nhật bình') || text.includes('nguyễn')) {
      res.text = 'Trang phục **cung đình triều Nguyễn** mang vẻ đẹp uy nghi, trang trọng.\n\n• **Áo Nhật Bình**: dành cho phi tần, công chúa; màu sắc theo phẩm cấp\n• **Áo ngũ thân tay thụng**: lễ phục nam quan lại\n• **Khăn vành** + **Mão kim ước phát** khi mặc Nhật Bình\n\n⚠️ Hoa văn và màu sắc phân biệt địa vị — cần tuân đúng quy chế.';
      res.suggestedItems = ['ao_nhat_binh_001', 'khan_vanh_001', 'kim_uoc_phat_001'];
      const item = this.db.getById('ao_nhat_binh_001');
      res.cultural_note = item?.cultural_context?.historical_meaning || null;
      return res;
    }

    // Nam Bộ / Áo bà ba / Khăn rằn
    if (text.includes('nam bộ') || text.includes('nam') || text.includes('bà ba') || text.includes('khăn rằn') || text.includes('miền tây')) {
      res.text = 'Trang phục **Nam Bộ** gắn liền với sông nước miền Tây.\n\n• **Áo bà ba** + **Khăn rằn** là bộ đôi kinh điển\n• Nón lá tạo nét duyên dáng\n• Màu đen, nâu, kẻ ô phổ biến nhất\n\nKhăn rằn được dùng chung bởi người Kinh, Khmer, Hoa và Chăm ở Nam Bộ — biểu tượng giao thoa văn hóa.';
      res.suggestedItems = ['ao_ba_ba_001', 'khan_ran_001'];
      return res;
    }

    // Ngũ thân / Áo tấc / Trung Bộ
    if (text.includes('ngũ thân') || text.includes('áo tấc') || text.includes('trung bộ') || text.includes('trung')) {
      res.text = '**Áo ngũ thân** là quốc phục triều Nguyễn, mang ý nghĩa triết học sâu sắc:\n\n• 5 thân tượng trưng cho tứ thân phụ mẫu + bản thân người mặc\n• Cổ lập lĩnh cao vuông, biểu trưng đức chính trực\n• **Tay thụng** → lễ phục (áo tấc)\n• **Tay chẽn** → thường phục\n\nPhối cùng: khăn đóng, quần ống rộng trắng, guốc mộc.';
      res.suggestedItems = ['ao_ngu_than_tay_chen_001', 'ao_ngu_than_tay_thung_001', 'khan_dong_001', 'quan_trang_ong_rong_001'];
      return res;
    }

    // Phối đồ / Mặc với gì
    if (text.includes('phối') || text.includes('hợp') || text.includes('mặc với') || text.includes('kết hợp') || text.includes('đi cùng')) {
      if (currentOutfit.length === 0) {
        res.text = 'Bạn hãy chọn một trang phục chính từ danh sách bên trái trước nhé!\n\nVí dụ:\n• Áo tứ thân → Bắc Bộ\n• Áo ngũ thân → Trung Bộ\n• Áo bà ba → Nam Bộ\n\nSau khi chọn, mình sẽ gợi ý phụ kiện phù hợp.';
      } else {
        const primary = this.db.getById(currentOutfit[0]);
        if (primary) {
          const pairings = primary.rules.common_pairings.slice(0, 4);
          res.text = `Bạn đang mặc **${primary.name}**. Theo truyền thống, nên phối cùng:`;
          res.suggestedItems = pairings;
          if (primary.rules.red_flags && primary.rules.red_flags.length > 0) {
            res.warning = primary.rules.red_flags[0];
          }
          if (primary.cultural_context?.historical_meaning) {
            res.cultural_note = primary.cultural_context.historical_meaning.substring(0, 200) + '...';
          }
        }
      }
      return res;
    }

    // Lịch sử / Ý nghĩa
    if (text.includes('lịch sử') || text.includes('ý nghĩa') || text.includes('nguồn gốc') || text.includes('truyền thống')) {
      if (currentOutfit.length > 0) {
        const item = this.db.getById(currentOutfit[0]);
        if (item && item.cultural_context?.historical_meaning) {
          res.text = `📚 Về **${item.name}**:`;
          res.cultural_note = item.cultural_context.historical_meaning;
          if (item.rules.red_flags?.length > 0) {
            res.warning = item.rules.red_flags[0];
          }
          return res;
        }
      }
      res.text = 'Bạn muốn tìm hiểu lịch sử trang phục nào? Hãy chọn một món đồ bên trái, rồi hỏi mình về nguồn gốc và ý nghĩa của nó nhé!';
      return res;
    }

    // Lễ hội / Sự kiện
    if (text.includes('lễ hội') || text.includes('tết') || text.includes('cưới') || text.includes('đám cưới') || text.includes('hội')) {
      res.text = 'Gợi ý trang phục theo dịp:\n\n🎉 **Lễ hội truyền thống**: Áo tứ thân + khăn mỏ quạ + nón quai thao\n💒 **Cưới hỏi cung đình**: Áo Nhật Bình + khăn vành + Mão kim ước phát\n🎭 **Lễ nghi trang trọng**: Áo ngũ thân tay thụng + khăn đóng\n🌾 **Sinh hoạt hàng ngày**: Áo bà ba + khăn rằn (Nam Bộ)';
      res.suggestedItems = ['ao_tu_than_001', 'ao_nhat_binh_001', 'ao_ngu_than_tay_thung_001', 'ao_ba_ba_001'];
      return res;
    }

    // Giao linh / Áo cổ chéo
    if (text.includes('giao lĩnh') || text.includes('cổ chéo')) {
      res.text = '**Áo giao lĩnh** (áo trảng vạt, cổ chéo) là một trong những kiểu áo cổ truyền lâu đời nhất của Đại Việt.\n\nVạt trái buộc chéo sang nách phải, phổ biến thời Lý-Trần-Lê. Được coi là kiểu dáng sơ khai của áo dài ngày nay.';
      res.suggestedItems = ['ao_giao_linh_001'];
      const item = this.db.getById('ao_giao_linh_001');
      res.cultural_note = item?.cultural_context?.historical_meaning || null;
      return res;
    }

    // Câu trả lời mặc định thông minh
    const currentNames = currentOutfit
      .map(id => this.db.getById(id)?.name)
      .filter(Boolean);

    if (currentNames.length > 0) {
      res.text = `Bộ đồ của bạn hiện có: **${currentNames.join('**, **')}**.\n\nBạn có thể hỏi mình về:\n• Cách phối thêm phụ kiện\n• Ý nghĩa lịch sử của trang phục\n• Kiểm tra tính tương thích\n• Trang phục phù hợp cho từng dịp`;
    } else {
      res.text = 'Mình chưa hiểu rõ câu hỏi của bạn. Bạn có thể hỏi về:\n• **Phối đồ** theo vùng miền (Bắc/Trung/Nam Bộ)\n• **Trang phục cụ thể** như "Áo tứ thân", "Áo ngũ thân"\n• **Dịp mặc**: lễ hội, cưới hỏi, đại lễ\n• **Lịch sử** và ý nghĩa trang phục';
      res.suggestedItems = ['ao_tu_than_001', 'ao_ngu_than_tay_chen_001', 'ao_ba_ba_001'];
    }
    return res;
  }
}
window.AIStyleEngine = AIStyleEngine;
