import './App.css';
import { useState, useRef, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hey there! I'm Claude, your AI assistant. How can I help you today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const callMethod = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const userMsg = { role: "user", text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setMessage("");
    setIsTyping(true);

    try {
      const response = await fetch('http://127.0.0.1:8001/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await response.json();

      // LangChain sometimes returns reply as an object {type, text, ...} or an array of such objects
      const raw = data.reply;
      let replyText = "";
      if (typeof raw === "string") {
        replyText = raw;
      } else if (Array.isArray(raw)) {
        replyText = raw.map(block => block?.text ?? JSON.stringify(block)).join("");
      } else if (raw && typeof raw === "object") {
        replyText = raw.text ?? raw.content ?? JSON.stringify(raw);
      } else {
        replyText = String(raw ?? "No response");
      }

      setMessages(prev => [...prev, { role: "assistant", text: replyText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", text: "⚠️ Connection error. Please check if the server is running." }]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      callMethod();
    }
  };

  return (
    <div className="app-shell">
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="chat-container">
        {/* Header */}
        <header className="chat-header">
          <div className="avatar-ring">
            <div className="avatar-dot" />
          </div>
          <div className="header-info">
            <h1 className="header-name">Botchat</h1>
            <span className="header-status">
              <span className="pulse" />
              Online
            </span>
          </div>
          <div className="header-badge">AI</div>
        </header>

        {/* Messages */}
        <main className="messages-area">
          {messages.map((msg, i) => (
            <div key={i} className={`message-row ${msg.role}`}>
              {msg.role === "assistant" && (
                <div className="msg-avatar">B</div>
              )}
              <div className="bubble-wrap">
                <div className={`bubble ${msg.role}`}>
                  {msg.text}
                </div>
                <span className="timestamp">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message-row assistant">
              <div className="msg-avatar">C</div>
              <div className="bubble-wrap">
                <div className="bubble assistant typing-bubble">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </main>

        {/* Input */}
        <footer className="input-bar">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Send a message…"
            value={message}
            rows={1}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className={`send-btn ${message.trim() ? "active" : ""}`}
            onClick={callMethod}
            disabled={!message.trim() || isTyping}
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </footer>
      </div>
    </div>
  );
}

export default App;