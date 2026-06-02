import './App.css';
import { useState, useRef, useEffect } from 'react';

import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import MessageBubble from './components/MessageBubble';
import TypingIndicator from './components/TypingIndicator';
import InputBar from './components/InputBar';
import { jwtDecode } from 'jwt-decode';
// ── Helpers ───────────────────────────────────────────────────────
function parseReply(raw) {
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) return raw.map(b => b?.text ?? JSON.stringify(b)).join('');
  if (raw && typeof raw === 'object') return raw.text ?? raw.content ?? JSON.stringify(raw);
  return String(raw ?? 'No response');
}

const WELCOME = JSON.stringify("Hey there! I'm Claude, your AI assistant. How can I help you today?");

// ── App ───────────────────────────────────────────────────────────
export default function App() {
  // ── Auth state ───────────────────────────────────────────────────
  // user = null  →  show AuthPage
  // user = {...} →  show Chat
  const [user, setUser] = useState(null);

  // ── Chat state ───────────────────────────────────────────────────
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([{ sender: 'AI', content: WELCOME }]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [isapiCall, setIsapiCall] = useState(false);
  const [chatIdConversation, setchatIdConversation] = useState('');
  const [conversationData, setconversationData] = useState([])

  const [tokenpresent, setTokenPresent] = useState(false);

  const bottomRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      console.log(" not present ")
    }
    if (token) {
      const decoded = jwtDecode(token);
      setUser(decoded);
      setIsapiCall(true);
      setTokenPresent(true);
    }
    conversationlist();
  }, [])

  async function conversationlist() {
    const token = localStorage.getItem("token")
    const conversationList = await fetch('https://chatbot-dw95.onrender.com/conversations', {
      method: 'GET',
      headers: { 'token': token, 'Content-Type': 'application/json' }
    });
    const convData = await conversationList.json();
    setconversationData(convData.data)
  }


  const getMessageById = async (id, value) => {
    const token = localStorage.getItem("token")
    setIsapiCall(value);
    setchatIdConversation(id);
    setMessages([]);
    const messageList = await fetch(`https://chatbot-dw95.onrender.com/getmessages/${id}`, {
      method: 'GET',
      headers: { 'token': token, 'Content-Type': 'application/json' }
    });
    const messageData = await messageList.json();
    setMessages(messageData.data)

  }

  // ── Auth handlers ─────────────────────────────────────────────────
  const handleAuthSuccess = async (userData) => {
    setUser(userData);
    if (userData.token) {
      setTokenPresent(true);
      setIsapiCall(true);
      conversationlist();
    }

    // Reset chat for fresh session
    setMessages([{
      sender: 'AI',
      content: JSON.stringify(`Welcome, ${userData.name.split(' ')[0]}! 👋 I'm Claude. How can I help you today?`),
    }]);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setTokenPresent(false)
    setUser(null);
    setMessages([{ role: 'AI', text: WELCOME }]);
    setMessage('');
    setSidebarOpen(false);
    setShowRecent(false);
  };

  // ── Chat handlers ─────────────────────────────────────────────────
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const toggleSidebar = () => setSidebarOpen(o => !o);
  const toggleRecent = () => setShowRecent(o => !o);

  const startNewChat = (value) => {
    setIsapiCall(value);
    setMessages([{
      sender: 'AI',
      content: JSON.stringify(`New chat started. What's on your mind, ${user?.name?.split(' ')[0] ?? 'there'}?`),
    }]);
    setMessage('');
  };

  const sendMessage = async () => {

    const trimmed = message.trim();
    if (!trimmed) return;

    setMessages(prev => [...prev, { sender: 'Human', content: trimmed }]);
    setMessage('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return "token is not present";
      }
      
      if (isapiCall) {
        const chatId = await fetch('https://chatbot-dw95.onrender.com/create_chat_id', {
          method: 'POST',
          headers: { 'token': token, 'Content-Type': 'application/json' }
        });
        const cid = await chatId.json();
        setchatIdConversation(cid.id);


        const summarise = await fetch(`https://chatbot-dw95.onrender.com/summarise/${cid.id}`, {
          method: 'POST',
          headers: { 'token': token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: trimmed }),
        });
        const summarisedata = await summarise.json();


        const res = await fetch(`https://chatbot-dw95.onrender.com/stream_chat/${cid.id}`, {
          method: 'POST',
          headers: { 'token': token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed }),
        });
        const data = await res.json();
        let chunkdata = data.reply;
        if (typeof chunkdata !== "string") {
          chunkdata = extractText(data.reply)
        }

        setMessages(prev => [...prev, { sender: 'AI', content: JSON.stringify(chunkdata) }]);
        setIsapiCall(false);
        conversationlist()
      }
      else {
        const res = await fetch(`https://chatbot-dw95.onrender.com/stream_chat/${chatIdConversation}`, {
          method: 'POST',
          headers: { 'token': token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed }),
        });
        const data = await res.json();
        let chunkdata = data.reply;

        if (typeof chunkdata !== "string") {
          chunkdata = extractText(data.reply)
        }

        setMessages(prev => [...prev, { sender: 'AI', content: JSON.stringify(chunkdata) }]);
        setIsapiCall(false);
      }

    } catch {
      setMessages(prev => [
        ...prev,
        { sender: 'AI', content: JSON.stringify('⚠️ Connection error. Please check if the server is running.') },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  function extractText(data) {
    if (typeof data === "string") {
      return data;
    }

    if (Array.isArray(data)) {
      return data
        .map(item => {
          if (typeof item === "string") return item;
          if (item.type === "text") return item.text;
          return "";
        })
        .join("");
    }

    return "";
  }

  // ── Render: Auth gate ─────────────────────────────────────────────
  if (!tokenpresent) {
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
        conversationData={conversationData}
        getMessageById={getMessageById}
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
              <MessageBubble key={i} role={msg.sender} text={msg.content} />
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