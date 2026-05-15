import { IconSun, IconMoon } from './Icons';

export default function TopHeader({ theme, onToggleTheme }) {
  return (
    <header className="top-header">

      {/* Left: avatar + name + status */}
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

      {/* Right: theme toggle pill */}
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

    </header>
  );
}
