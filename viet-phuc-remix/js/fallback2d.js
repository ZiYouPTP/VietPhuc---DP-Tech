// Original code-drawn fallback: no remote images or assumed garment assets.
const safeHex = (value, fallback) => /^#[\da-f]{6}$/i.test(value || '') ? value : fallback;
export function drawFallback(config = {}, { back = false } = {}) {
  const color = safeHex(config.color, '#b83942');
  const skin = safeHex(config.body?.skin, '#c99372');
  const shape = Math.max(-.35, Math.min(.35, Number(config.body?.shape) || 0));
  const width = 1 + shape * .3;
  const id = config.costumeId || 'ao-dai';
  const accessories = config.slots || {};
  const neckline = id === 'ao-tu-than' ? 'M211 157L240 230L269 157' : 'M222 153L222 136Q240 130 258 136L258 153';
  const topEnd = id === 'ao-ba-ba' ? 315 : 285;
  const panel = id === 'ao-tu-than'
    ? `<path d="M197 260L224 265L224 447L164 457Z"/><path d="M256 265L283 260L316 457L256 447Z"/><path d="M195 259L285 259L301 456L179 456Z" opacity=".4"/>`
    : id === 'ao-ba-ba' ? '' : `<path d="M196 268L238 270L233 481L171 472Z"/><path d="M242 270L284 268L309 472L247 481Z"/>`;
  const texture = config.pattern === 'stripes' ? '<path d="M0 0V32M12 0V32" stroke="#fff" opacity=".2"/>' : config.pattern === 'dots' ? '<circle cx="8" cy="8" r="2" fill="#f5d487"/>' : config.pattern !== 'plain' ? '<path d="M8 16Q0 8 8 2Q16 8 8 16Q0 22 8 30Q16 22 8 16" fill="none" stroke="#ebcf90" stroke-width="1"/>' : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 580" role="img" aria-label="Minh họa trang phục hai chiều">
    <defs><linearGradient id="fabric" x1="0" x2="1"><stop stop-color="${color}"/><stop offset=".45" stop-color="${color}"/><stop offset="1" stop-color="#171622"/></linearGradient><pattern id="motif" width="${24 * (config.patternScale || 1)}" height="${32 * (config.patternScale || 1)}" patternUnits="userSpaceOnUse">${texture}</pattern></defs>
    <ellipse data-studio-shadow="true" cx="240" cy="539" rx="100" ry="10" fill="#171522" opacity=".14"/>
    <g transform="translate(240 0) scale(${width} 1) translate(-240 0)">
      <g fill="${skin}"><path d="M220 122H260V167H220Z"/><ellipse cx="240" cy="94" rx="35" ry="44"/><path d="M180 177L150 322Q146 342 158 346Q170 345 170 329L202 187Z"/><path d="M278 187L310 329Q310 345 322 346Q334 342 330 322L300 177Z"/></g>
      <path d="M207 88Q205 46 241 45Q279 49 274 91L263 70Q243 88 214 79Z" fill="#272026"/>
      ${config.body?.hair !== 'short' && config.body?.hair !== 'buzz' ? '<path d="M209 85Q196 143 219 167L221 115M272 85Q290 143 263 167L259 115" fill="#272026"/>' : ''}
      ${!back ? '<g fill="#2a2020"><ellipse cx="227" cy="96" rx="2" ry="2.5"/><ellipse cx="253" cy="96" rx="2" ry="2.5"/></g><path d="M233 118Q240 122 247 118" stroke="#875643" fill="none"/>' : ''}
      <g fill="${accessories.bottom ? '#ede3d0' : skin}" stroke="${accessories.bottom ? '#c4b6a2' : skin}"><path d="M197 279L238 284L232 518H183Z"/><path d="M242 284L283 279L297 518H248Z"/></g>
      <g fill="url(#fabric)" stroke="${color}" stroke-width="2"><path d="M220 151L192 157L161 279L180 286L205 200L196 ${topEnd}Q240 ${topEnd + 12} 284 ${topEnd}L275 200L300 286L319 279L288 157L260 151Z"/>${panel}</g>
      <path d="M220 151L192 157L161 279L180 286L205 200L196 ${topEnd}Q240 ${topEnd + 12} 284 ${topEnd}L275 200L300 286L319 279L288 157L260 151Z" fill="url(#motif)" opacity="${config.patternStrength ?? .45}"/>
      ${id === 'ao-tu-than' && !back ? `<path d="M220 151L240 202L260 151L266 282H214Z" fill="${accessories.inner ? '#e8ae65' : skin}"/><path d="M217 151L236 196M263 151L244 196" stroke="#ecd08d" stroke-width="3"/>` : ''}
      ${!back ? `<path d="${neckline}" fill="${color}" stroke="#e7bf7c" stroke-width="2"/><path d="M257 155L274 176V279" fill="none" stroke="#e7bf7c" stroke-width="1.5"/><g fill="#e7bf7c">${[180,200,220,240,260].map(y=>`<circle cx="${id === 'ao-ba-ba' ? 240 : 273}" cy="${y}" r="2"/>`).join('')}</g>` : ''}
      ${accessories.belt ? '<path d="M199 263Q240 277 281 263V279Q240 289 199 279Z" fill="#6f9148"/><path d="M251 275L249 399L266 391L262 275Z" fill="#7c9a54"/>' : ''}
      <g fill="${accessories.footwear ? '#46332b' : skin}"><path d="M183 514H232V531H174Q172 520 183 514Z"/><path d="M248 514H297L306 531H248Z"/></g>
      ${accessories.headwear === 'non-la' ? '<path d="M162 78L240 20L318 78Q240 98 162 78Z" fill="#d6bd86" stroke="#a78b53"/><path d="M178 76Q240 48 302 76" fill="none" stroke="#ae9560"/>' : accessories.headwear ? '<path d="M206 70Q240 48 274 70V80Q240 63 206 80Z" fill="#423c69" stroke="#dfbb80"/>' : ''}
      ${(accessories.accessory || []).includes('earrings') ? '<g fill="#d7ac58"><circle cx="207" cy="114" r="4"/><circle cx="273" cy="114" r="4"/></g>' : ''}
      ${(accessories.accessory || []).includes('woven-bag') ? '<rect x="316" y="326" width="36" height="43" rx="6" fill="#8a6340"/><path d="M323 329V317Q335 304 345 317V329" fill="none" stroke="#8a6340" stroke-width="4"/>' : ''}
    </g></svg>`;
}
export async function fallbackPNG(config, transparent = false, { back = false } = {}) {
  const svg = drawFallback(config, { back }).replace(transparent ? /<ellipse data-studio-shadow="true"[^>]*\/>/ : /$^/, '');
  const image = new Image();
  image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  await image.decode();
  const canvas = document.createElement('canvas'); canvas.width = 480; canvas.height = 580;
  const context = canvas.getContext('2d');
  if (!transparent) { const g = context.createLinearGradient(0,0,480,580);g.addColorStop(0,'#f6eee1');g.addColorStop(1,'#ddd6e5');context.fillStyle=g;context.fillRect(0,0,480,580); }
  context.drawImage(image,0,0);
  return canvas.toDataURL('image/png');
}
