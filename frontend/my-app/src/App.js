import './App.css';
import { useState, useRef, useEffect } from 'react';

import Sidebar          from './components/Sidebar';
import TopHeader        from './components/TopHeader';
import MessageBubble    from './components/MessageBubble';
import TypingIndicator  from './components/TypingIndicator';
import InputBar         from './components/InputBar';

// Parse whatever the backend returns into a plain string
function parseReply(raw) {
  if (typeof raw === 'string')        return raw;
  if (Array.isArray(raw))             return raw.map(b => b?.text ?? JSON.stringify(b)).join('');
  if (raw && typeof raw === 'object') return raw.text ?? raw.content ?? JSON.stringify(raw);
  return String(raw ?? 'No response');
}

const WELCOME = "Hey there! I'm Claude, your AI assistant. How can I help you today?";

export default function App() {
  // ── State ────────────────────────────────────────────────────────
  const [message,     setMessage]     = useState('');
  const [messages,    setMessages]    = useState([{ role: 'assistant', text: WELCOME }]);
  const [isTyping,    setIsTyping]    = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRecent,  setShowRecent]  = useState(false);
  const [theme,       setTheme]       = useState('dark');

  const bottomRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Handlers ─────────────────────────────────────────────────────
  const toggleTheme   = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const toggleSidebar = () => setSidebarOpen(o => !o);
  const toggleRecent  = () => setShowRecent(o => !o);

  const startNewChat  = () => {
    setMessages([{ role: 'assistant', text: WELCOME }]);
    setMessage('');
  };

  const sendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    setMessages(prev => [...prev, { role: 'user', text: trimmed }]);
    setMessage('');
    setIsTyping(true);

    try {
      const res  = await fetch('http://127.0.0.1:8001/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', text: parseReply(data.reply) }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: '⚠️ Connection error. Please check if the server is running.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="app-shell" data-theme={theme}>
      {/* Ambient background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Left sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onNewChat={startNewChat}
        showRecent={showRecent}
        onToggleRecent={toggleRecent}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main content */}
      <div className="main-area">

        {/* Top header bar */}
        <TopHeader theme={theme} onToggleTheme={toggleTheme} />

        {/* Chat area */}
        <div className="chat-container">

          {/* Message list */}
          <main className="messages-area">
            {messages.map((msg, i) => (
              <MessageBubble key={i} role={msg.role} text={msg.text} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </main>

          {/* Input */}
          <InputBar
            value={message}
            onChange={setMessage}
            onSend={sendMessage}
            isTyping={isTyping}
          />

        </div>
      </div>
    </div>
  );
}