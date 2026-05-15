import { IconMenu, IconNewChat, IconRecent, IconSun, IconMoon } from './Icons';

const RECENT_CHATS = [
  { id: 1, label: 'Magic function test' },
  { id: 2, label: 'Python debugging help' },
  { id: 3, label: 'What is LangChain?' },
];

export default function Sidebar({ isOpen, onToggle, onNewChat, showRecent, onToggleRecent, theme, onToggleTheme }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

      {/* Hamburger toggle */}
      <button className="sidebar-toggle" onClick={onToggle} title="Toggle sidebar">
        <IconMenu />
      </button>

      <div className="sidebar-divider" />

      {/* New Chat */}
      <button className="sidebar-item" onClick={onNewChat} title="New Chat">
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
          {RECENT_CHATS.map(chat => (
            <li key={chat.id} className="recent-item">
              <span className="recent-dot" />
              <span className="recent-text">{chat.label}</span>
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
