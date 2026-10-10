// Styling presets for this app's illustrations. These are not historical rules.
// Review and cite the presets before treating them as cultural guidance.
(function (scope) {
  'use strict';
  const t=(key,params)=>scope.VietPhucLocale.t(key,params);
  const costumeNames = Object.freeze(Object.fromEntries(['ao-dai','ao-tu-than','ao-ngu-than','ao-ba-ba','ao-nhat-binh','ao-yem','ao-giao-linh'].map(id=>[id,id])));
  const accessories = Object.freeze({
    'non-la': { group: 'headwear', type: 'headwear' },
    'non-quai-thao': { group: 'headwear', type: 'headwear' },
    'khan-dong': { group: 'headwear', type: 'headwear' },
    'tram-cai': { group: 'headwear', type: 'hair' },
    'vong-co': { type: 'jewellery' },
    'bong-tai': { type: 'jewellery' },
    'vong-tay': { type: 'jewellery' },
    'tui-tay': { type: 'handheld' },
    'quat-lua': { type: 'handheld' },
    'guoc-moc': { group: 'footwear', type: 'footwear' },
    'hai-cong': { group: 'footwear', type: 'footwear' },
    'day-lung': { type: 'belt' },
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

  function getCostumeAvailability(costumeId, gender = 'female') {
    if (!Object.hasOwn(costumeNames, costumeId)) return { available: false, reason: t('availability.costumeUnknown') };
    const supported = scope.VietPhucBodyAvailabilityData?.[costumeId]?.supportedGenders;
    // If the local policy bundle fails to load, keep the female preview usable
    // and refuse male choices until its restrictive policy is available.
    if (!supported) return { available: gender === 'female', reason: gender === 'female' ? '' : t('availability.malePolicyMissing') };
    const available = supported.includes(gender);
    return { available, reason: available ? '' : t('availability.maleOnly') };
  }

  function sanitizeCostume(costumeId, gender = 'female') {
    if (getCostumeAvailability(costumeId, gender).available) return costumeId;
    return Object.keys(costumeNames).find(id => getCostumeAvailability(id, gender).available) || null;
  }

  function getAvailability(accessoryId, context = {}) {
    if (typeof accessoryId !== 'string' || !Object.hasOwn(accessories, accessoryId)) return { available: false, reason: t('availability.accessoryUnknown') };
    const item = accessories[accessoryId];
    if (!Object.hasOwn(costumeNames, context.costumeId)) return { available: false, reason: t('availability.chooseCostume') };
    const declared = scope.VietPhucBodyAvailabilityData?.[context.costumeId];
    if ((declared?.forbiddenItemIds || excludedByCostume[context.costumeId]).includes(accessoryId) || (declared?.allowedAccessoryIds && !declared.allowedAccessoryIds.includes(accessoryId))) {
      return { available: false, reason: t('availability.notInPreset',{name:{key:'costume.'+context.costumeId}}) };
    }
    const conflict = idsFrom(context.accessories).find(id => id !== accessoryId && item.group && Object.hasOwn(accessories, id) && accessories[id].group === item.group);
    if (conflict) return { available: false, reason: t('availability.conflict',{name:{key:'accessory.'+conflict}}) };
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
    getAvailability, sanitizeAccessories, toStudioSlots, getCostumeAvailability, sanitizeCostume,
    getAccessoryType: id => t('type.'+(accessories[id]?.type||'other')),
    presets: Object.freeze({ excludedByCostume, get label(){return t('availability.presetLabel');}, ruleType:'styling-preset', needsVerification: true, sources: [] }),
  });
})(typeof window !== 'undefined' ? window : globalThis);
