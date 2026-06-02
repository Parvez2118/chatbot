import ReactMarkdown from 'react-markdown';

// Fixes literal "\n" strings sent as escaped text from the backend
// function normalizeText(text) {
//   return JSON.parse(text)
// }


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



export default function MessageBubble({ role, text }) {
  let clean = text;
  if (role === "AI") {
    
       clean = extractText(JSON.parse(text));
    
    
  }

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`message-row ${role}`}>

      {/* Avatar — only for assistant */}
      {role === 'AI' && <div className="msg-avatar">A</div>}

      <div className="bubble-wrap">
        <div className={`bubble ${role}`}>
          {role === 'AI' ? (
            // Markdown rendered for AI replies
            <ReactMarkdown
              components={{
                // Paragraphs — no extra margin on first/last
                p: ({ children }) => <p className="md-p">{children}</p>,

                // Bold
                strong: ({ children }) => <strong className="md-strong">{children}</strong>,

                // Inline code  e.g. `EC2`
                code: ({ inline, children }) =>
                  inline
                    ? <code className="md-code-inline">{children}</code>
                    : <pre className="md-pre"><code>{children}</code></pre>,

                // Bullet list
                ul: ({ children }) => <ul className="md-ul">{children}</ul>,

                // Numbered list
                ol: ({ children }) => <ol className="md-ol">{children}</ol>,

                // List item
                li: ({ children }) => <li className="md-li">{children}</li>,

                // Headings (in case the model uses them)
                h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
                h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
                h3: ({ children }) => <h3 className="md-h3">{children}</h3>,

                // Blockquote
                blockquote: ({ children }) => <blockquote className="md-blockquote">{children}</blockquote>,
              }}
            >
              {clean}
            </ReactMarkdown>
          ) : (
            // User messages are plain text
            clean
          )}
        </div>

        <span className="timestamp">{time}</span>
      </div>
    </div>
  );
}
