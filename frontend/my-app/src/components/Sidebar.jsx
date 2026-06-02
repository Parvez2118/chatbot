import { IconMenu, IconNewChat, IconRecent, IconSun, IconMoon } from './Icons';
import { useState } from 'react';


export default function Sidebar({ isOpen, onToggle, onNewChat, showRecent, onToggleRecent, theme, onToggleTheme, conversationData, getMessageById }) {
  const [activeChatId, setActiveChatId] = useState(null);
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

      {/* Hamburger toggle */}
      <button className="sidebar-toggle" onClick={onToggle} title="Toggle sidebar">
        <IconMenu />
      </button>

      <div className="sidebar-divider" />

      {/* New Chat */}
      <button className="sidebar-item" onClick={()=>onNewChat(true)} title="New Chat">
        <span className="sidebar-icon"><IconNewChat /></span>
        {isOpen && <span className="sidebar-label">New Chat</span>}
      </button>

      {/* Recent Chats */}
      <button
        className={`sidebar-item ${showRecent && isOpen ? 'item-active' : ''}`}
        onClick={() => { if (!isOpen) onToggle(); onToggleRecent(); }}
        title="Recent Chats"
      >
        <span className="sidebar-icon"><IconRecent /></span>
        {isOpen && <span className="sidebar-label">Recent Chats</span>}
      </button>

      {/* Recent list */}
      {isOpen && showRecent && (
        <ul className="recent-list">
          {conversationData.map(chat => (
            <li key={chat.id} className={`recent-item ${activeChatId === chat.id ? 'active' : ''}`} onClick={()=> {
              getMessageById(chat.id, false);
              setActiveChatId(chat.id);
            }}>
              <span className="recent-dot" />
              <span className="recent-text">{chat.title}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Push theme toggle to bottom */}
      <div className="sidebar-spacer" />

      {/* Theme toggle */}
      <button className="sidebar-item theme-toggle-btn" onClick={onToggleTheme}
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
        <span className="sidebar-icon">
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
        </span>
        {isOpen && (
          <span className="sidebar-label">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        )}
      </button>
    </aside>
  );
}
