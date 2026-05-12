import './App.css';
import { useState, useRef, useEffect } from 'react';

// ── Icons ─────────────────────────────────────────────────────────
const IconNewChat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const IconRecent = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconSend = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6"  x2="21" y2="6"  />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const IconSun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1"  x2="12" y2="3"  />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"  />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1"  y1="12" x2="3"  y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);
const IconMoon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// ── Sample recent chats ───────────────────────────────────────────
const RECENT = [
  { id: 1, label: "Magic function test" },
  { id: 2, label: "Python debugging help" },
  { id: 3, label: "What is LangChain?" },
];

// ── Main Component ────────────────────────────────────────────────
export default function App() {
  const [message,     setMessage]     = useState("");
  const [messages,    setMessages]    = useState([
    { role: "assistant", text: "Hey there! I'm Claude, your AI assistant. How can I help you today?" }
  ]);
  const [isTyping,    setIsTyping]    = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRecent,  setShowRecent]  = useState(false);
  const [theme,       setTheme]       = useState("light"); // "dark" | "light"

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  const parseReply = (raw) => {
    if (typeof raw === "string")        return raw;
    if (Array.isArray(raw))             return raw.map(b => b?.text ?? JSON.stringify(b)).join("");
    if (raw && typeof raw === "object") return raw.text ?? raw.content ?? JSON.stringify(raw);
    return String(raw ?? "No response");
  };

  const callMethod = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setMessages(prev => [...prev, { role: "user", text: trimmed }]);
    setMessage("");
    setIsTyping(true);
    try {
      const res  = await fetch("http://127.0.0.1:8001/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", text: parseReply(data.reply) }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "⚠️ Connection error. Please check if the server is running." }]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); callMethod(); }
  };

  const startNewChat = () => {
    setMessages([{ role: "assistant", text: "Hey there! I'm Claude, your AI assistant. How can I help you today?" }]);
    setMessage("");
  };

  return (
    <div className="app-shell" data-theme={theme}>
      {/* Ambient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)} title="Toggle sidebar">
          <IconMenu />
        </button>
        <div className="sidebar-divider" />

        <button className="sidebar-item" onClick={startNewChat} title="New Chat">
          <span className="sidebar-icon"><IconNewChat /></span>
          {sidebarOpen && <span className="sidebar-label">New Chat</span>}
        </button>

        <button
          className={`sidebar-item ${showRecent && sidebarOpen ? "item-active" : ""}`}
          onClick={() => { if (!sidebarOpen) setSidebarOpen(true); setShowRecent(o => !o); }}
          title="Recent Chats"
        >
          <span className="sidebar-icon"><IconRecent /></span>
          {sidebarOpen && <span className="sidebar-label">Recent Chats</span>}
        </button>

        {sidebarOpen && showRecent && (
          <ul className="recent-list">
            {RECENT.map(c => (
              <li key={c.id} className="recent-item">
                <span className="recent-dot" />
                <span className="recent-text">{c.label}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Theme toggle pinned to sidebar bottom */}
        <div className="sidebar-spacer" />
        <button
          className="sidebar-item theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <span className="sidebar-icon">
            {theme === "dark" ? <IconSun /> : <IconMoon />}
          </span>
          {sidebarOpen && (
            <span className="sidebar-label">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </button>
      </aside>

      {/* ── Main area ── */}
      <div className="main-area">

        {/* Top header */}
        <header className="top-header">
          <div className="th-left">
            <div className="th-avatar"><span>C</span></div>
            <div className="th-info">
              <h1 className="th-name">Claude</h1>
              <span className="th-status">
                <span className="pulse" />
                Online
              </span>
            </div>
          </div>

          {/* Theme toggle also in header (top-right) */}
          <button
            className="header-theme-btn"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            <span className="theme-btn-track">
              <span className="theme-btn-thumb">
                {theme === "dark" ? <IconMoon /> : <IconSun />}
              </span>
            </span>
            <span className="theme-btn-label">
              {theme === "dark" ? "Dark" : "Light"}
            </span>
          </button>
        </header>

        {/* Chat container */}
        <div className="chat-container">
          <main className="messages-area">
            {messages.map((msg, i) => (
              <div key={i} className={`message-row ${msg.role}`}>
                {msg.role === "assistant" && <div className="msg-avatar">C</div>}
                <div className="bubble-wrap">
                  <div className={`bubble ${msg.role}`}>{msg.text}</div>
                  <span className="timestamp">
                    {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message-row assistant">
                <div className="msg-avatar">C</div>
                <div className="bubble-wrap">
                  <div className="bubble assistant typing-bubble">
                    <span className="dot" /><span className="dot" /><span className="dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </main>

          <footer className="input-bar">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="Send a message…"
              value={message}
              rows={1}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className={`send-btn ${message.trim() ? "active" : ""}`}
              onClick={callMethod}
              disabled={!message.trim() || isTyping}
              aria-label="Send"
            >
              <IconSend />
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}