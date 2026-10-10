// This module evaluates supplied data. It contains no garment pairing table.
// The JSON is a draft for review; integrating it into the catalog is a separate step.
const records = value => Array.isArray(value) ? value : [];
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const unique = values => Array.isArray(values) && new Set(values).size === values.length;
const provenance = value => object(value) && Array.isArray(value.sources)
  && (value.sources.length > 0 || value.needsVerification === true)
  && (value.status !== 'needsVerification' || value.needsVerification === true)
  && (value.sources.length > 0 || typeof value.verificationTodo === 'string' && value.verificationTodo.startsWith('TODO:'));

/** Return schema diagnostics without fetching, mutating data, or accessing the DOM. */
export function validateRulesDocument(document) {
  const errors = [];
  const add = (code, path, detail = '') => errors.push({ code, path, detail });
  if (!object(document)) return { valid: false, errors: [{ code: 'invalid-document', path: '$' }] };
  if (document.schemaVersion !== 1) add('unsupported-schema', '$.schemaVersion');
  if (!provenance(document)) add('missing-provenance', '$');
  for (const key of ['slotIds', 'genderIds', 'formalityIds']) {
    if (!records(document[key]).length || !unique(document[key] || []) || records(document[key]).some(id => typeof id !== 'string')) add('invalid-identifiers', `$.${key}`);
  }
  for (const key of ['outfitSets', 'itemRules', 'occasions']) {
    if (!records(document[key]).length) add('empty-collection', `$.${key}`);
    if (!unique(records(document[key]).map(row => row?.id))) add('duplicate-id', `$.${key}`);
  }
  const slots = new Set(records(document.slotIds));
  const genders = new Set(records(document.genderIds));
  const occasions = new Set(records(document.occasions).map(row => row?.id));
  const itemById = new Map(records(document.itemRules).map(row => [row?.id, row]));
  const checkEntry = (entry, path, named = false) => {
    if (!provenance(entry)) add('missing-provenance', path);
    if (named && (!entry?.id || !entry?.name?.vi || !entry?.name?.en)) add('missing-name', path);
  };
  const checkGender = (entry, path) => {
    if (!records(entry?.supportedGenders).length || records(entry?.supportedGenders).some(id => !genders.has(id)) || !unique(records(entry?.supportedGenders))) add('invalid-supported-genders', path);
    checkEntry(entry?.genderPolicy, `${path}.genderPolicy`);
  };
  records(document.itemRules).forEach((item, index) => {
    const path = `$.itemRules[${index}]`;
    checkEntry(item, path, true);
    checkGender(item, path);
    checkEntry(item?.culturalInfo, `${path}.culturalInfo`);
    if (!slots.has(item?.slot)) add('unknown-slot', `${path}.slot`);
  });
  records(document.assetGenderPolicy).forEach((entry,index)=>{
    const path=`$.assetGenderPolicy[${index}]`;
    checkEntry(entry,path);
    if(typeof entry?.sourceFile!=='string'||!entry.sourceFile.startsWith('assets/'))add('invalid-asset-source',path);
    if(!records(entry?.supportedGenders).length||records(entry?.supportedGenders).some(id=>!genders.has(id)))add('invalid-supported-genders',path);
  });
  records(document.occasions).forEach((occasion, index) => checkEntry(occasion, `$.occasions[${index}]`, true));
  records(document.exclusiveGroups).forEach((group, index) => {
    checkEntry(group, `$.exclusiveGroups[${index}]`);
    if (!records(group?.slots).length || records(group?.slots).some(slot => !slots.has(slot))) add('unknown-slot', `$.exclusiveGroups[${index}].slots`);
  });
  checkEntry(document.contextRules, '$.contextRules');
  records(document.outfitSets).forEach((set, index) => {
    const path = `$.outfitSets[${index}]`;
    checkEntry(set, path, true);
    checkGender(set, path);
    checkEntry(set?.culturalInfo, `${path}.culturalInfo`);
    checkEntry(set?.exclusionPolicy, `${path}.exclusionPolicy`);
    checkEntry(set?.contextPolicy, `${path}.contextPolicy`);
    if (!records(document.formalityIds).includes(set?.formality)) add('unknown-formality', `${path}.formality`);
    if (records(set?.occasions).some(id => !occasions.has(id))) add('unknown-occasion', `${path}.occasions`);
    if (!records(set?.requiredSlots).length) add('missing-required-slots', `${path}.requiredSlots`);
    const requirements = [...records(set?.requiredSlots), ...records(set?.optionalSlots)];
    if (!unique(requirements.map(row => row?.slot))) add('duplicate-rule-slot', path);
    if (!unique(records(set?.layerOrder)) || records(set?.layerOrder).some(slot => !slots.has(slot))) add('invalid-layer-order', `${path}.layerOrder`);
    requirements.forEach((requirement, rowIndex) => {
      const rowPath = `${path}.slots[${rowIndex}]`;
      checkEntry(requirement, rowPath);
      if (!slots.has(requirement?.slot)) add('unknown-slot', rowPath);
      if (!records(requirement?.allowedItemIds).length) add('missing-allowed-items', rowPath);
      if (!records(set?.layerOrder).includes(requirement?.slot)) add('layer-order-missing', rowPath);
      if (records(set?.forbiddenSlots).includes(requirement?.slot)) add('allowed-forbidden-conflict', rowPath);
      records(requirement?.allowedItemIds).forEach(id => {
        if (!itemById.has(id) || itemById.get(id)?.slot !== requirement?.slot) add('invalid-slot-item', rowPath, id);
        if (records(set?.forbiddenItemIds).includes(id)) add('allowed-forbidden-conflict', rowPath, id);
      });
    });
    if (records(set?.forbiddenSlots).some(slot => !slots.has(slot))) add('unknown-slot', `${path}.forbiddenSlots`);
    if (records(set?.forbiddenItemIds).some(id => !itemById.has(id))) add('unknown-item', `${path}.forbiddenItemIds`);
    const palette = set?.palette;
    checkEntry(palette, `${path}.palette`);
    if (!Number.isInteger(palette?.maxDistinctColors) || palette.maxDistinctColors < 1 || palette.maxDistinctColors > 4 || records(palette?.colors).length > 4) add('invalid-palette-limit', `${path}.palette`);
    if (records(palette?.colors).some(color => !/^#[0-9a-f]{6}$/i.test(color))) add('invalid-palette-color', `${path}.palette.colors`);
    records(palette?.forbiddenAdjacentPairs).forEach((pair, pairIndex) => {
      checkEntry(pair, `${path}.palette.forbiddenAdjacentPairs[${pairIndex}]`);
      if (records(pair?.colors).length !== 2 || records(pair?.slots).length !== 2 || records(pair?.slots).some(slot => !slots.has(slot))) add('invalid-color-pair', `${path}.palette.forbiddenAdjacentPairs[${pairIndex}]`);
    });
    if (!records(set?.combinations).length) add('missing-combinations', `${path}.combinations`);
    if (!unique(records(set?.combinations).map(row => row?.id))) add('duplicate-id', `${path}.combinations`);
    records(set?.combinations).forEach((combination, comboIndex) => {
      const comboPath = `${path}.combinations[${comboIndex}]`;
      checkEntry(combination, comboPath);
      const comboItems = records(combination?.items);
      if (!unique(comboItems.map(item => item?.slot))) add('duplicate-slot', comboPath);
      comboItems.forEach(item => {
        const rule = requirements.find(row => row?.slot === item?.slot);
        if (!itemById.has(item?.id) || itemById.get(item?.id)?.slot !== item?.slot || !records(rule?.allowedItemIds).includes(item?.id)) add('invalid-combination-item', comboPath, item?.id);
        if (!records(set?.layerOrder).includes(item?.slot)) add('layer-order-missing', comboPath, item?.slot);
      });
      records(set?.requiredSlots).forEach(required => {
        if (!comboItems.some(item => item?.slot === required?.slot && records(required?.allowedItemIds).includes(item?.id))) add('missing-required-slot', comboPath, required?.slot);
      });
    });
  });
  return { valid: errors.length === 0, errors };
}

/**
 * A look uses { outfitSetId, gender, occasionId?, items: [{id, slot?, color?, colorFamily?}], colors?: [] }.
 * Color/cultural notices are warnings. Availability errors can disable a candidate.
 * Actual z-index comes from the selected set's layerOrder, never the order clicked.
 */
export function validateLook(document, look = {}, language = 'vi') {
  const schema = validateRulesDocument(document);
  if (!schema.valid) return { valid: false, errors: [{ code: 'invalid-rules', schemaErrors: schema.errors }], warnings: [], layers: [] };
  const errors = [], warnings = [];
  const issue = (target, code, detail = {}) => target.push({ code, message: document.messages?.[code]?.[language] || document.messages?.[code]?.vi || code, ...detail });
  const set = document.outfitSets.find(row => row.id === (look.outfitSetId || look.costumeId));
  if (!set) {
    issue(errors, 'unknown-outfit');
    return { valid: false, errors, warnings, layers: [] };
  }
  const byId = new Map(document.itemRules.map(item => [item.id, item]));
  const layers = [];
  const selectedSlots = new Map();
  const requirements = [...set.requiredSlots, ...set.optionalSlots];
  if (!document.genderIds.includes(look.gender)) issue(errors, 'unknown-gender', { gender: look.gender });
  else if (!set.supportedGenders.includes(look.gender)) issue(errors, 'unsupported-gender', { outfitSetId: set.id, gender: look.gender });
  for (const selected of records(look.items)) {
    const item = byId.get(selected?.id);
    if (!item) { issue(errors, 'unknown-item', { itemId: selected?.id }); continue; }
    const slot = item.slot;
    if (selected.slot !== undefined && selected.slot !== slot) issue(errors, 'invalid-slot', { itemId: item.id, slot: selected.slot, expectedSlot: slot });
    if (selectedSlots.has(slot)) issue(errors, 'duplicate-slot', { slot, itemIds: [selectedSlots.get(slot).id, item.id] });
    else selectedSlots.set(slot, { ...selected, slot });
    if (document.genderIds.includes(look.gender) && !item.supportedGenders.includes(look.gender)) issue(errors, 'unsupported-gender', { itemId: item.id, gender: look.gender });
    if (set.forbiddenSlots.includes(slot)) issue(errors, 'forbidden-slot', { slot, itemId: item.id });
    if (set.forbiddenItemIds.includes(item.id)) issue(errors, 'forbidden-item', { itemId: item.id });
    const slotRule = requirements.find(rule => rule.slot === slot);
    if (!slotRule) issue(errors, 'slot-not-allowed', { slot, itemId: item.id });
    else if (!slotRule.allowedItemIds.includes(item.id)) issue(errors, 'required-item-mismatch', { slot, itemId: item.id });
    const order = set.layerOrder.indexOf(slot);
    if (order < 0) issue(errors, 'layer-order-missing', { slot, itemId: item.id });
    layers.push({ ...selected, slot, zIndex: order < 0 ? -1 : (order + 1) * 10 });
  }
  for (const required of set.requiredSlots) {
    const selected = selectedSlots.get(required.slot);
    if (!selected) issue(errors, 'missing-required-slot', { slot: required.slot });
    if (selected && records(required.requiredColorFamilies).length) {
      if (typeof selected.colorFamily !== 'string') issue(warnings, 'color-family-unknown', { slot: required.slot });
      else if (!required.requiredColorFamilies.includes(selected.colorFamily)) issue(errors, 'required-color-family', { slot: required.slot, colorFamily: selected.colorFamily });
    }
  }
  for (const group of document.exclusiveGroups) {
    const chosen = group.slots.filter(slot => selectedSlots.has(slot));
    if (chosen.length > 1) issue(errors, 'exclusive-group', { groupId: group.id, slots: chosen });
  }
  const occasion = document.occasions.find(row => row.id === look.occasionId);
  if (look.occasionId && !occasion) issue(warnings, 'unknown-occasion', { occasionId: look.occasionId });
  if (occasion) {
    if (!set.occasions.includes(occasion.id)) issue(warnings, 'occasion-not-listed', { occasionId: occasion.id });
    if (document.contextRules.blockCasualInCeremonial && set.formality === 'casual' && occasion.kind === 'ceremonial') issue(errors, 'casual-in-ceremony', { occasionId: occasion.id });
    if (document.contextRules.warnFormalInDaily && set.formality === 'formal' && occasion.kind === 'daily') issue(warnings, 'formal-in-daily', { occasionId: occasion.id });
  }
  const colors = new Set([...records(look.colors), ...layers.map(item => item.color)].filter(color => typeof color === 'string' && color.length).map(color => color.toLowerCase()));
  if (colors.size > set.palette.maxDistinctColors) issue(warnings, 'too-many-colors', { count: colors.size, maximum: set.palette.maxDistinctColors });
  if (set.palette.isProvisional) issue(warnings, 'palette-provisional');
  for (const pair of set.palette.forbiddenAdjacentPairs) {
    const selectedColors = pair.slots.map(slot => selectedSlots.get(slot)?.color?.toLowerCase());
    if (selectedColors.every((color, index) => color === pair.colors[index]?.toLowerCase()) || selectedColors.every((color, index) => color === pair.colors[1 - index]?.toLowerCase())) issue(warnings, 'adjacent-color-pair', { slots: pair.slots, colors: selectedColors });
  }
  if (set.genderPolicy.needsVerification) issue(warnings, 'gender-needs-verification');
  if (set.needsVerification) issue(warnings, 'cultural-needs-verification');
  layers.sort((left, right) => left.zIndex - right.zIndex || left.id.localeCompare(right.id));
  return { valid: errors.length === 0, errors, warnings, layers, outfitSetId: set.id };
}

/** Check a candidate, replacing any existing item in its canonical slot. */
export function getItemAvailability(document, itemId, look = {}, language = 'vi') {
  const item = records(document?.itemRules).find(row => row.id === itemId);
  const items = records(look.items).filter(selected => selected?.id !== itemId && (!item || records(document?.itemRules).find(row => row.id === selected?.id)?.slot !== item.slot));
  const result = validateLook(document, { ...look, items: [...items, { id: itemId }] }, language);
  const errors = result.errors.filter(error => error.code !== 'missing-required-slot');
  return { available: errors.length === 0, reasons: errors, warnings: result.warnings };
}
