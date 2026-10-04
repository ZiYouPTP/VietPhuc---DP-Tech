/**
 * @file components.jsx
 * @description Các React component cho Việt Phục AI Stylist
 */
const { useState, useEffect, useRef, useCallback } = React;
const { Search, Filter, ShieldAlert, Sparkles, Send, X, Info, BookOpen, Star, Zap, ChevronDown, Heart } = lucide;

// ─── Sidebar Trái: Danh sách Trang Phục ───────────────────────────
const Catalog = ({ items, categories, wearing, onToggleItem, getIncompatibleIds }) => {
  const [activeCat, setActiveCat] = useState(categories[0]);
  const [filterRegion, setFilterRegion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter(i => {
    if (i.category !== activeCat) return false;
    if (filterRegion !== 'all' && !i.filters.region.includes(filterRegion)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        i.name.toLowerCase().includes(q) ||
        (i.aliases || []).some(a => a.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const incompIds = getIncompatibleIds(wearing);

  return (
    <div className="col-l">
      <div className="sec-hdr">
        <div className="sec-title"><Search size={13}/> KHO TRANG PHỤC</div>
        <div className="search-wrap">
          <Search size={12} className="search-ico"/>
          <input
            type="text"
            className="search-inp"
            placeholder="Tìm trang phục..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clr" onClick={() => setSearchQuery('')}><X size={12}/></button>
          )}
        </div>
      </div>
      <div className="sec-body">
        <div className="cat-list">
          {categories.map(c => {
            const catObj = window.StyleUtils.CATEGORIES.find(x => x.key === c) || { icon: '👕', label: c };
            const count = items.filter(i => i.category === c).length;
            return (
              <button key={c} className={`cat-btn ${activeCat === c ? 'active' : ''}`} onClick={() => { setActiveCat(c); setSearchQuery(''); }}>
                <span className="cat-ico">{catObj.icon}</span>
                <span>{catObj.label}</span>
                <span className="cat-n">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="filter-row">
          <button className={`fc ${filterRegion==='all'?'fc-all':''}`} onClick={()=>setFilterRegion('all')}>Tất cả</button>
          <button className={`fc ${filterRegion==='Bắc Bộ'?'fc-bac':''}`} onClick={()=>setFilterRegion('Bắc Bộ')}>Bắc Bộ</button>
          <button className={`fc ${filterRegion==='Trung Bộ'?'fc-trung':''}`} onClick={()=>setFilterRegion('Trung Bộ')}>Trung Bộ</button>
          <button className={`fc ${filterRegion==='Nam Bộ'?'fc-nam':''}`} onClick={()=>setFilterRegion('Nam Bộ')}>Nam Bộ</button>
        </div>
        {filteredItems.length === 0 ? (
          <div className="empty-txt" style={{marginTop:'30px'}}>
            {searchQuery ? `Không tìm thấy "${searchQuery}"` : 'Không có trang phục trong mục này'}
          </div>
        ) : (
          <div className="item-grid">
            {filteredItems.map(item => {
              const isSel = wearing.includes(item.item_id);
              const isIncomp = !isSel && incompIds.has(item.item_id);
              const rgnClass = window.StyleUtils.regionClass(item.filters?.region);
              const rgnLabel = window.StyleUtils.regionLabel(item.filters?.region);

              return (
                <div
                  key={item.item_id}
                  className={`item-card ${isSel ? 'sel' : ''} ${isIncomp ? 'incomp' : ''}`}
                  onClick={() => !isIncomp && onToggleItem(item.item_id)}
                  title={isIncomp ? 'Không tương thích với đồ đang mặc' : item.name}
                >
                  {isSel && <div className="sel-badge">✓</div>}
                  {isIncomp && <div className="incomp-badge"><ShieldAlert size={10}/></div>}
                  <div className="item-thumb">
                    <span className="item-emoji">{item.emoji}</span>
                    {isSel && <div className="item-thumb-glow"/>}
                  </div>
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    <div className={`item-rgn ${rgnClass}`}>{rgnLabel || 'Chung'}</div>
                    {item.filters?.events?.length > 0 && (
                      <div className="item-event">{item.filters.events[0]}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Khung Giữa: Avatar & Outfit ────────────────────────────────
const AvatarArea = ({ wearing, onRemoveItem, analysis, onViewItemDetails, onClearAll }) => {
  const primaryItem = wearing.length > 0 ? window.DB.getById(wearing[0]) : null;
  const scoreObj = analysis ? window.OutfitAnalyzer.scoreToLabel(analysis.score) : null;

  return (
    <div className="col-c">
      <div className="avatar-area">
        <div className="grid-bg"/>

        {/* Khung avatar */}
        <div className="avatar-frame">
          <div className="avatar-glow"/>
          <div className="avatar-layers">
            {wearing.length === 0 ? (
              <div className="avatar-placeholder">
                <span className="avatar-icon-empty">👤</span>
                <div className="avatar-hint">Chọn trang phục<br/>từ danh sách trái</div>
              </div>
            ) : (
              <div className="avatar-emoji-stack">
                {wearing.slice(0, 4).map((id, i) => {
                  const item = window.DB.getById(id);
                  if (!item) return null;
                  return (
                    <span
                      key={id}
                      className="avatar-emoji-layer"
                      style={{ fontSize: i === 0 ? '4.5rem' : '2rem', opacity: i === 0 ? 1 : 0.6 - i * 0.1, zIndex: 4 - i }}
                    >
                      {item.emoji}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          {/* Điểm tương thích */}
          {scoreObj && (
            <div className="score-badge">
              <div className={`score-val ${scoreObj.cssClass}`}>{analysis.score}</div>
              <div className="score-max">/100</div>
            </div>
          )}
        </div>

        {/* Tags trang phục đang mặc */}
        {wearing.length > 0 && (
          <div className="outfit-tags">
            {wearing.map(id => {
              const item = window.DB.getById(id);
              if (!item) return null;
              return (
                <div key={id} className="otag" onClick={() => onViewItemDetails(item)}>
                  <span>{item.emoji} {item.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); onRemoveItem(id); }}><X size={11}/></button>
                </div>
              );
            })}
          </div>
        )}

        {/* Cảnh báo */}
        {analysis && analysis.warnings.length > 0 && (
          <div className="warn-panel">
            <div className="warn-title"><ShieldAlert size={12}/> Cảnh báo phối đồ</div>
            {analysis.warnings.map((w, i) => <div key={i} className="warn-item">• {w}</div>)}
          </div>
        )}
      </div>

      {/* Thanh điều khiển */}
      <div className="ctrl-bar">
        <button className="cbtn cbtn-p" onClick={onClearAll} disabled={wearing.length === 0}>
          <X size={14}/> Xóa bộ đồ
        </button>
        {scoreObj && (
          <div className="score-box-inline">
            <div className="score-lbl">Độ chuẩn xác</div>
            <div className={`score-val-sm ${scoreObj.cssClass}`}>{analysis.score}/100 — {scoreObj.label}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Sidebar Phải: Chatbot ──────────────────────────────────────
const Chatbot = ({ messages, isTyping, onSendMessage, onAskSuggestion, aiEngine }) => {
  const [inp, setInp] = useState('');
  const [showKeyBar, setShowKeyBar] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const msgsEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (msgsEndRef.current) msgsEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inp.trim() || isTyping) return;
    onSendMessage(inp);
    setInp('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSetKey = () => {
    if (!apiKeyInput.trim()) return;
    if (aiEngine) aiEngine.setApiKey(apiKeyInput);
    setIsLiveMode(true);
    setShowKeyBar(false);
    setApiKeyInput('');
  };

  const handleTextareaInput = (e) => {
    setInp(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 110) + 'px';
  };

  const SUGGESTIONS = [
    { icon: '👗', text: 'Phối đồ Bắc Bộ chuẩn truyền thống?' },
    { icon: '🎏', text: 'Trang phục cung đình Huế?' },
    { icon: '🌿', text: 'Áo bà ba mặc với gì?' },
    { icon: '📚', text: 'Ý nghĩa áo ngũ thân?' },
  ];

  return (
    <div className="col-r">
      {/* Header AI */}
      <div className="ai-hdr">
        <div className="ai-av"><Sparkles size={17} color="#fff"/></div>
        <div className="ai-info">
          <div className="ai-name">Việt Phục AI Stylist</div>
          <div className="ai-model">
            {isLiveMode ? (
              <span className="ai-live-badge"><span className="dot dot-live"/> Gemini Live</span>
            ) : (
              <span>Mock AI · <button className="link-btn" onClick={() => setShowKeyBar(!showKeyBar)}>Kết nối Gemini API</button></span>
            )}
          </div>
        </div>
        <button
          className="key-toggle-btn"
          onClick={() => setShowKeyBar(!showKeyBar)}
          title="Cài đặt Gemini API Key"
        >
          <Zap size={14}/>
        </button>
      </div>

      {/* API Key bar */}
      {showKeyBar && (
        <div className="key-bar">
          <input
            type="password"
            className="key-inp"
            placeholder="Nhập Gemini API Key (AIza...)..."
            value={apiKeyInput}
            onChange={e => setApiKeyInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSetKey()}
          />
          <button className="key-btn" onClick={handleSetKey} disabled={!apiKeyInput.trim()}>
            Kết nối
          </button>
          {isLiveMode && (
            <button className="key-btn key-btn-off" onClick={() => { setIsLiveMode(false); if(aiEngine) aiEngine.setApiKey(''); }}>
              Tắt
            </button>
          )}
        </div>
      )}

      {/* Danh sách tin nhắn */}
      <div className="msgs">
        {messages.map((m, idx) => (
          <div key={idx} className={`msg ${m.role === 'user' ? 'usr' : ''}`}>
            <div className={`mav ${m.role === 'user' ? 'mav-u' : 'mav-ai'}`}>
              {m.role === 'user' ? '👤' : <Sparkles size={13} color="#fff"/>}
            </div>
            <div className={`mbody ${m.role === 'user' ? 'usr' : 'ai'}`}>
              <div dangerouslySetInnerHTML={{__html: window.StyleUtils.formatMessage(m.text)}}/>

              {/* Gợi ý trang phục */}
              {m.suggestedItems && m.suggestedItems.length > 0 && (
                <div className="mout">
                  <div className="mout-t"><Star size={10}/> Gợi ý trang phục:</div>
                  <div className="mout-pills">
                    {m.suggestedItems.map(id => {
                      const it = window.DB.getById(id);
                      if (!it) return null;
                      return (
                        <span key={id} className="mpill" onClick={() => onAskSuggestion(id)} title="Click để mặc thử">
                          {it.emoji} {it.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cảnh báo */}
              {m.warning && (
                <div className="mwarn">
                  <div className="mwarn-t"><ShieldAlert size={10}/> Lưu ý quan trọng</div>
                  <div className="mwarn-b">{m.warning}</div>
                </div>
              )}

              {/* Ghi chú văn hóa */}
              {m.cultural_note && (
                <div className="mcult">
                  <div className="mcult-t"><BookOpen size={10}/> Góc lịch sử & văn hóa</div>
                  <div className="mcult-b">{m.cultural_note}</div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="msg">
            <div className="mav mav-ai"><Sparkles size={13} color="#fff"/></div>
            <div className="mbody ai">
              <div className="typing">
                <span className="tdot"/><span className="tdot"/><span className="tdot"/>
              </div>
            </div>
          </div>
        )}

        {/* Gợi ý câu hỏi nhanh (chỉ hiển thị khi chỉ có 1 message) */}
        {messages.length <= 1 && !isTyping && (
          <div className="suggs">
            {SUGGESTIONS.map((s, i) => (
              <button key={i} className="sugg" onClick={() => onSendMessage(s.text)}>
                <span>{s.icon}</span> {s.text}
              </button>
            ))}
          </div>
        )}

        <div ref={msgsEndRef}/>
      </div>

      {/* Input */}
      <div className="inp-bar">
        <textarea
          ref={textareaRef}
          className="inp-ta"
          placeholder="Hỏi về cách phối đồ Việt Phục..."
          value={inp}
          onChange={handleTextareaInput}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button className="inp-btn" onClick={handleSend} disabled={!inp.trim() || isTyping}>
          <Send size={15}/>
        </button>
      </div>
    </div>
  );
};

// ─── Ngăn kéo Chi tiết (Item Drawer) ────────────────────────────
const ItemDrawer = ({ item, isOpen, onClose }) => {
  if (!item) return null;
  const hasRedFlags = item.rules?.red_flags?.length > 0;
  const hasConstruction = item.cultural_context?.construction;
  const hasMaterials = item.cultural_context?.traditional_material?.length > 0;

  return (
    <div className={`drawer ${isOpen ? 'open' : ''}`}>
      <button className="dr-close" onClick={onClose}><X size={15}/></button>

      <div className="dr-header">
        <span className="dr-emoji">{item.emoji}</span>
        <div>
          <div className="dr-name">{item.name}</div>
          {item.aliases?.length > 0 && (
            <div className="dr-alias">Còn gọi: {item.aliases.join(' • ')}</div>
          )}
        </div>
      </div>

      <div className="dr-grid">
        <div>
          <div className="dr-st">Vùng miền</div>
          <div className="dr-pills">
            {item.filters?.region?.map(r => <span key={r} className="dr-pill dr-pill-r">{r}</span>)}
          </div>
        </div>
        <div>
          <div className="dr-st">Triều đại</div>
          <div className="dr-pills">
            {item.filters?.era?.length > 0
              ? item.filters.era.map(e => <span key={e} className="dr-pill">{e}</span>)
              : <span className="dr-txt">Không xác định</span>
            }
          </div>
        </div>
        <div>
          <div className="dr-st">Dịp sử dụng</div>
          <div className="dr-pills">
            {item.filters?.events?.map(e => <span key={e} className="dr-pill dr-pill-e">{e}</span>)}
          </div>
        </div>
      </div>

      {item.cultural_context?.historical_meaning && (
        <div className="dr-section">
          <div className="dr-st">📜 Ý nghĩa lịch sử</div>
          <div className="dr-txt">{item.cultural_context.historical_meaning}</div>
        </div>
      )}

      {hasConstruction && (
        <div className="dr-section">
          <div className="dr-st">🧵 Cấu trúc & Thiết kế</div>
          <div className="dr-txt">{item.cultural_context.construction}</div>
        </div>
      )}

      {hasMaterials && (
        <div className="dr-section">
          <div className="dr-st">🌿 Chất liệu truyền thống</div>
          <div className="dr-pills">
            {item.cultural_context.traditional_material.map(m => <span key={m} className="dr-pill">{m}</span>)}
          </div>
        </div>
      )}

      {hasRedFlags && (
        <div className="dr-section">
          <div className="dr-st" style={{color:'var(--sonL)'}}>⚠️ Lưu ý đặc biệt</div>
          {item.rules.red_flags.map((rf, i) => <div key={i} className="dr-rf">{rf}</div>)}
        </div>
      )}

      {item.rules?.common_pairings?.length > 0 && (
        <div className="dr-section">
          <div className="dr-st">✨ Thường phối cùng</div>
          <div className="dr-pills">
            {item.rules.common_pairings.map(id => {
              const paired = window.DB.getById(id);
              if (!paired) return null;
              return <span key={id} className="dr-pill dr-pill-g">{paired.emoji} {paired.name}</span>;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

window.Catalog = Catalog;
window.AvatarArea = AvatarArea;
window.Chatbot = Chatbot;
window.ItemDrawer = ItemDrawer;
