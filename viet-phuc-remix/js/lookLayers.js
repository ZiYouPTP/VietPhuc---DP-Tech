// Shared selection rules for saved PNGs and live library layers.
const aliases = { 'khan-van': 'khan-dong', earrings: 'bong-tai', 'woven-bag': 'tui-tay', 'wooden-clogs': 'guoc-moc', 'silk-belt': 'day-lung' };
export function activeLayerIds(config = {}) {
  const slots = config.slots || {}, ids = new Set([config.costumeId || 'ao-dai']);
  if (slots.bottom !== null) ids.add(slots.bottom || 'trousers');
  if (config.costumeId === 'ao-tu-than' && slots.inner !== null) ids.add('inner-yem');
  for (const id of [...(config.accessories || []), slots.headwear, slots.footwear, slots.belt, ...(Array.isArray(slots.accessory) ? slots.accessory : [])]) {
    if (typeof id === 'string') ids.add(aliases[id] || id);
  }
  return ids;
}
export function mergeLookLayers(config = {}, library = [], saved = config.imageLayers || []) {
  const gender = config.body?.gender === 'male' ? 'male' : 'female', ids = activeLayerIds(config), result = new Map();
  for (const layer of [...library, ...(Array.isArray(saved) ? saved : [])]) {
    if (layer && layer.gender === gender && ids.has(layer.id)) result.set(layer.id, layer);
  }
  return [...result.values()].sort((a, b) => a.zIndex - b.zIndex);
}
