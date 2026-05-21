import './App.css';
import { useState, useRef, useEffect } from 'react';

import AuthPage         from './components/AuthPage';
import Sidebar          from './components/Sidebar';
import TopHeader        from './components/TopHeader';
import MessageBubble    from './components/MessageBubble';
import TypingIndicator  from './components/TypingIndicator';
import InputBar         from './components/InputBar';

// ── Helpers ───────────────────────────────────────────────────────
function parseReply(raw) {
  if (typeof raw === 'string')        return raw;
  if (Array.isArray(raw))             return raw.map(b => b?.text ?? JSON.stringify(b)).join('');
  if (raw && typeof raw === 'object') return raw.text ?? raw.content ?? JSON.stringify(raw);
  return String(raw ?? 'No response');
}

const WELCOME = "Hey there! I'm Claude, your AI assistant. How can I help you today?";

// ── App ───────────────────────────────────────────────────────────
export default function App() {
  // ── Auth state ───────────────────────────────────────────────────
  // user = null  →  show AuthPage
  // user = {...} →  show Chat
  const [user, setUser] = useState(null);

  // ── Chat state ───────────────────────────────────────────────────
  const [message,     setMessage]     = useState('');
  const [messages,    setMessages]    = useState([{ role: 'assistant', text: WELCOME }]);
  const [isTyping,    setIsTyping]    = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRecent,  setShowRecent]  = useState(false);
  const [theme,       setTheme]       = useState('dark');

  const bottomRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Auth handlers ─────────────────────────────────────────────────
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    // Reset chat for fresh session
    setMessages([{
      role: 'assistant',
      text: `Welcome, ${userData.name.split(' ')[0]}! 👋 I'm Claude. How can I help you today?`,
    }]);
  };

  const handleLogout = () => {
    setUser(null);
    setMessages([{ role: 'assistant', text: WELCOME }]);
    setMessage('');
    setSidebarOpen(false);
    setShowRecent(false);
  };

  // ── Chat handlers ─────────────────────────────────────────────────
  const toggleTheme   = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const toggleSidebar = () => setSidebarOpen(o => !o);
  const toggleRecent  = () => setShowRecent(o => !o);

  const startNewChat = () => {
    setMessages([{
      role: 'assistant',
      text: `New chat started. What's on your mind, ${user?.name?.split(' ')[0] ?? 'there'}?`,
    }]);
    setMessage('');
  };

  const sendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    setMessages(prev => [...prev, { role: 'user', text: trimmed }]);
    setMessage('');
    setIsTyping(true);

    try {
      const res  = await fetch('http://127.0.0.1:8000/', {
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

  // ── Render: Auth gate ─────────────────────────────────────────────
  if (!user) {
    return (
      <div data-theme={theme}>
        <AuthPage onAuthSuccess={handleAuthSuccess} />
      </div>
    );
  }

  // ── Render: Chat ──────────────────────────────────────────────────
  return (
    <div className="app-shell" data-theme={theme}>
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onNewChat={startNewChat}
        showRecent={showRecent}
        onToggleRecent={toggleRecent}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="main-area">
        <TopHeader
          theme={theme}
          onToggleTheme={toggleTheme}
          user={user}
          onLogout={handleLogout}
        />

        <div className="chat-container">
          <main className="messages-area">
            {messages.map((msg, i) => (
              <MessageBubble key={i} role={msg.role} text={msg.text} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </main>

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