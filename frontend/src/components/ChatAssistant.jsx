import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, ShieldAlert, Sparkles, Code } from 'lucide-react';

export default function ChatAssistant({ contextIssue, backendUrl }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am BugHunter AI Chatbot. I have access to your repository scans and audit issues. Ask me to explain a vulnerability, refactor code, or teach you secure development best practices."
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (contextIssue) {
      // Auto-suggest message when a context issue is loaded
      setInputText(`Explain the "${contextIssue.title}" issue in ${contextIssue.file_path} at line ${contextIssue.line_number} and how I can patch it.`);
    }
  }, [contextIssue]);

  useEffect(() => {
    // Scroll chat bottom
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputText('');
    setLoading(true);

    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${backendUrl}/api/chat/assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMsg,
          scanId: contextIssue ? contextIssue.scan_id : null,
          fileContext: contextIssue ? contextIssue.file_path : null
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to contact AI');
      }

      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: `Sorry, I encountered an error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (msg) => {
    setInputText(msg);
  };

  return (
    <div className="glass-panel" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeInUp 0.3s ease-out' }}>
      
      {/* Title Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.1)' }}>
        <Bot color="var(--primary)" size={24} style={{ filter: 'drop-shadow(var(--shadow-glow))' }} />
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>AI Security Assistant</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Online • Multi-Agent context active</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '12px',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
            }}
          >
            {/* Avatar */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: msg.sender === 'bot' ? 'var(--primary-glow)' : 'rgba(255,255,255,0.06)',
              border: msg.sender === 'bot' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {msg.sender === 'bot' ? <Bot size={16} color="var(--primary)" /> : <User size={16} />}
            </div>

            {/* Bubble */}
            <div style={{
              background: msg.sender === 'bot' ? 'var(--bg-card)' : 'var(--primary-gradient)',
              border: msg.sender === 'bot' ? '1px solid var(--border-color)' : 'none',
              color: '#ffffff',
              padding: '12px 16px',
              borderRadius: msg.sender === 'user' ? '12px 2px 12px 12px' : '2px 12px 12px 12px',
              fontSize: '0.88rem',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={16} color="var(--primary)" className="animate-spin" />
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '12px 16px', borderRadius: '2px 12px 12px 12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Analyzing codebase files and generating explanation...
            </div>
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>

      {/* Suggested prompts list */}
      <div style={{ padding: '0 20px 10px 20px', display: 'flex', gap: '8px', overflowX: 'auto', flexShrink: 0 }}>
        <button
          onClick={() => handleSuggestionClick('Explain what N+1 query problems are')}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            padding: '6px 12px',
            borderRadius: '16px',
            fontSize: '0.75rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Code size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> N+1 Query explanation
        </button>
        <button
          onClick={() => handleSuggestionClick('What is the OWASP Top 10 Injection vulnerability?')}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            padding: '6px 12px',
            borderRadius: '16px',
            fontSize: '0.75rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <ShieldAlert size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> OWASP Injection
        </button>
        <button
          onClick={() => handleSuggestionClick('Explain AWS credentials exposure risk')}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            padding: '6px 12px',
            borderRadius: '16px',
            fontSize: '0.75rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Sparkles size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Secrets Security
        </button>
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSendMessage} style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px', flexShrink: 0 }}>
        <input
          type="text"
          placeholder="Ask a question about your repositories..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{
            flexGrow: 1,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '12px',
            color: '#fff',
            fontSize: '0.9rem',
            outline: 'none'
          }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '12px 16px', borderRadius: '6px' }} disabled={loading}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
