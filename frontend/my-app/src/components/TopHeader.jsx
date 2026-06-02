import { IconSun, IconMoon } from './Icons';

// Logout icon
const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function TopHeader({ theme, onToggleTheme, user, onLogout }) {
  // Get initials from user's name e.g. "John Doe" → "JD"
  const initials = user?.name
    ? user.name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <header className="top-header">

      {/* Left: Claude branding */}
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

      {/* Right: theme toggle + user pill + logout */}
      <div className="th-right">

        {/* Theme pill */}
        <button
          className="header-theme-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          <span className="theme-btn-track">
            {theme === 'dark' ? <IconMoon /> : <IconSun />}
          </span>
          <span className="theme-btn-label">
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
        </button>

        {/* User pill */}
        {user.name && (
          <div className="th-user-pill">
            <div className="th-user-avatar">{initials}</div>
            <span className="th-user-name">{user.name.split(' ')[0]}</span>
          </div>
        )}

        {/* Logout */}
        {user && (
          <button
            className="th-logout-btn"
            onClick={onLogout}
            title="Sign out"
            aria-label="Sign out"
          >
            <IconLogout />
          </button>
        )}

      </div>
    </header>
  );
}
