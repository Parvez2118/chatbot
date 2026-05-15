export default function TypingIndicator() {
  return (
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
  );
}
