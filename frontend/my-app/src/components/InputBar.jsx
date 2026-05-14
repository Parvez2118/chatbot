import { useRef } from 'react';
import { IconSend } from './Icons';

export default function InputBar({ value, onChange, onSend, isTyping }) {
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <footer className="input-bar">
      <textarea
        ref={inputRef}
        className="chat-input"
        placeholder="Send a message…"
        value={value}
        rows={1}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        className={`send-btn ${value.trim() ? 'active' : ''}`}
        onClick={onSend}
        disabled={!value.trim() || isTyping}
        aria-label="Send"
      >
        <IconSend />
      </button>
    </footer>
  );
}
