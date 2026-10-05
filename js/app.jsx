/**
 * @file app.jsx
 * @description Main App - Việt Phục AI Stylist
 */
const { useState, useEffect, useRef } = React;
const { Catalog, AvatarArea, Chatbot, ItemDrawer } = window;

const App = () => {
  const [db] = useState(window.DB);
  const [wearing, setWearing] = useState([]);
  const [externalTags, setExternalTags] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Chào mừng đến với **Việt Phục AI Stylist**! 🎎\n\nTôi giúp bạn khám phá và phối trang phục truyền thống Việt Nam một cách chuẩn xác về mặt lịch sử.\n\nHãy chọn trang phục từ danh sách bên trái để bắt đầu!',
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [aiEngine, setAiEngine] = useState(null);
  const [drawerItem, setDrawerItem] = useState(null);

  useEffect(() => {
    const handleAiResponse = (res) => {
      setMessages(prev => [...prev, { role: 'ai', ...res }]);
      setIsTyping(false);
    };

    const engine = new window.AIStyleEngine(
      db,
      window.OutfitAnalyzer,
      handleAiResponse,
      () => setIsTyping(true)
    );
    setAiEngine(engine);
  }, [db]);

  useEffect(() => {
    setAnalysis(window.OutfitAnalyzer.analyze(wearing, { externalTags }));
  }, [wearing, externalTags]);

  const toggleItem = (id) => {
    setWearing(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const removeItem = (id) => {
    setWearing(prev => prev.filter(i => i !== id));
  };

  const clearAll = () => {
    setWearing([]);
    setExternalTags([]);
  };

  const toggleExternal = (tag) => {
    setExternalTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // outfit: cho phép truyền bộ đồ mới nhất, tránh dùng wearing cũ trong closure
  const handleSendMessage = (text, outfit = wearing) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    if (aiEngine) aiEngine.processMessage(text, outfit, { externalTags });
  };

  const handleAskSuggestion = (id) => {
    const item = db.getById(id);
    if (!item) return;
    const nextWearing = wearing.includes(id) ? wearing : [...wearing, id];
    setWearing(nextWearing);
    const txt = `Tôi vừa mặc thử ${item.name}. Bạn thấy sao?`;
    handleSendMessage(txt, nextWearing);
  };

  return (
    <div id="app">
      <header className="hdr">
        <div>
          <div className="logo">V I Ệ T &nbsp; P H Ụ C</div>
          <div className="logo-s">AI STYLIST · TRUYỀN THỐNG VIỆT NAM</div>
        </div>
        <div className="hdr-r">
          <div className="badge">Hackathon Demo</div>
          <div className="dot-wrap">
            <div className="dot dot-mock"/>
            <span>Mock AI</span>
          </div>
          <div className="hdr-count">
            <span className="hdr-count-n">{db.count}</span> trang phục
          </div>
        </div>
      </header>

      <main className="grid">
        <Catalog
          items={db.getAll()}
          categories={db.getCategories()}
          wearing={wearing}
          onToggleItem={toggleItem}
          getIncompatibleIds={window.OutfitAnalyzer.getIncompatibleIds}
        />

        <AvatarArea
          wearing={wearing}
          onRemoveItem={removeItem}
          analysis={analysis}
          onViewItemDetails={setDrawerItem}
          onClearAll={clearAll}
          externalTags={externalTags}
          onToggleExternal={toggleExternal}
        />

        <Chatbot
          messages={messages}
          isTyping={isTyping}
          onSendMessage={handleSendMessage}
          onAskSuggestion={handleAskSuggestion}
          aiEngine={aiEngine}
        />
      </main>

      <ItemDrawer
        item={drawerItem}
        isOpen={!!drawerItem}
        onClose={() => setDrawerItem(null)}
      />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);