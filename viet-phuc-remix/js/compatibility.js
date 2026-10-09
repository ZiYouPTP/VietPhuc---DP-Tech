// Styling presets for this app's illustrations. These are not historical rules.
// Review and cite the presets before treating them as cultural guidance.
(function (scope) {
  'use strict';
  const costumeNames = Object.freeze({
    'ao-dai': 'Áo dài', 'ao-tu-than': 'Áo tứ thân', 'ao-ngu-than': 'Áo ngũ thân',
    'ao-ba-ba': 'Áo bà ba', 'ao-nhat-binh': 'Áo Nhật Bình', 'ao-yem': 'Áo yếm', 'ao-giao-linh': 'Áo giao lĩnh',
  });
  const accessories = Object.freeze({
    'non-la': { name: 'Nón lá', group: 'headwear', type: 'Đội đầu' },
    'non-quai-thao': { name: 'Nón quai thao', group: 'headwear', type: 'Đội đầu' },
    'khan-dong': { name: 'Khăn đóng', group: 'headwear', type: 'Đội đầu' },
    'tram-cai': { name: 'Trâm cài', group: 'headwear', type: 'Cài tóc' },
    'vong-co': { name: 'Vòng cổ', type: 'Trang sức' },
    'bong-tai': { name: 'Bông tai', type: 'Trang sức' },
    'vong-tay': { name: 'Vòng tay', type: 'Trang sức' },
    'tui-tay': { name: 'Túi tay', type: 'Cầm tay' },
    'quat-lua': { name: 'Quạt lụa', type: 'Cầm tay' },
    'guoc-moc': { name: 'Guốc mộc', group: 'footwear', type: 'Giày dép' },
    'hai-cong': { name: 'Hài cong', group: 'footwear', type: 'Giày dép' },
    'day-lung': { name: 'Dây lưng', type: 'Thắt lưng' },
  });
  const excludedByCostume = Object.freeze({
    'ao-dai': ['non-quai-thao', 'day-lung'],
    'ao-tu-than': ['khan-dong', 'hai-cong'],
    'ao-ngu-than': ['non-quai-thao', 'day-lung'],
    'ao-ba-ba': ['non-quai-thao', 'khan-dong', 'hai-cong', 'day-lung'],
    'ao-nhat-binh': ['non-la', 'non-quai-thao', 'guoc-moc', 'day-lung'],
    'ao-yem': ['khan-dong', 'hai-cong'],
    'ao-giao-linh': ['non-quai-thao'],
  });
  const idsFrom = values => Array.isArray(values) ? values : values instanceof Set ? [...values] : [];

  function getAvailability(accessoryId, context = {}) {
    if (typeof accessoryId !== 'string' || !Object.hasOwn(accessories, accessoryId)) return { available: false, reason: 'Phụ kiện không có trong thư viện.' };
    const item = accessories[accessoryId];
    if (!Object.hasOwn(costumeNames, context.costumeId)) return { available: false, reason: 'Chọn trang phục trước khi thêm phụ kiện.' };
    if (excludedByCostume[context.costumeId].includes(accessoryId)) {
      return { available: false, reason: `Chưa dùng trong bộ phối mẫu ${costumeNames[context.costumeId]} của ứng dụng.` };
    }
    const conflict = idsFrom(context.accessories).find(id => id !== accessoryId && item.group && Object.hasOwn(accessories, id) && accessories[id].group === item.group);
    if (conflict) return { available: false, reason: `Bỏ ${accessories[conflict].name} trước khi chọn phụ kiện này.` };
    return { available: true, reason: '' };
  }

  // Keep the user's order: the first valid choice in each exclusive group wins.
  function sanitizeAccessories(ids, context = {}) {
    const result = [];
    for (const id of idsFrom(ids)) {
      if (typeof id === 'string' && !result.includes(id) && getAvailability(id, { ...context, accessories: result }).available) result.push(id);
    }
    return result;
  }

  function toStudioSlots(ids, context = {}) {
    if (typeof context === 'string') context = { costumeId: context };
    const selected = new Set(sanitizeAccessories(ids, context));
    return {
      headwear: selected.has('non-la') ? 'non-la' : selected.has('non-quai-thao') ? 'non-quai-thao' : selected.has('khan-dong') ? 'khan-van' : selected.has('tram-cai') ? 'tram-cai' : null,
      footwear: selected.has('guoc-moc') ? 'wooden-clogs' : selected.has('hai-cong') ? 'hai-cong' : null,
      belt: selected.has('day-lung') ? 'silk-belt' : null,
      accessory: [...selected].filter(id => !accessories[id].group && id !== 'day-lung').map(id => ({'bong-tai':'earrings', 'tui-tay':'woven-bag'}[id] || id)),
    };
  }

  scope.VietPhucCompatibility = Object.freeze({
    getAvailability, sanitizeAccessories, toStudioSlots,
    getAccessoryType: id => accessories[id]?.type || 'Phụ kiện',
    presets: Object.freeze({ excludedByCostume, label:'Quy tắc phối mẫu của ứng dụng', ruleType:'styling-preset', needsVerification: true, sources: [] }),
  });
})(typeof window !== 'undefined' ? window : globalThis);
