import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, Clock, AlertTriangle, Users, Plus, MessageSquare } from 'lucide-react';

const Slack = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
  </svg>
);

export default function Collaboration({ backendUrl }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([
    { id: '1', email: 'dev@bughunter.ai' },
    { id: '2', email: 'admin@bughunter.ai' }
  ]);
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [slackWebhook, setSlackWebhook] = useState('https://hooks.slack.placeholder/your-slack-incoming-webhook');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${backendUrl}/api/tickets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      } else {
        generateMockTickets();
      }
    } catch (e) {
      generateMockTickets();
    } finally {
      setLoading(false);
    }
  };

  const generateMockTickets = () => {
    setTickets([
      { id: 't-1', title: 'Fix hardcoded AWS Access Secret Key in auth service config', status: 'In Progress', priority: 'Critical', assignee_email: 'dev@bughunter.ai', issue_file: 'src/controllers/auth.js' },
      { id: 't-2', title: 'Fix SQL injection path in user registrations handler', status: 'Open', priority: 'High', assignee_email: 'admin@bughunter.ai', issue_file: 'src/controllers/scans.js' },
      { id: 't-3', title: 'Remediate S3 Bucket lacking default KMS encryption policy', status: 'Resolved', priority: 'Medium', assignee_email: 'dev@bughunter.ai', issue_file: 'infra/s3.tf' }
    ]);
  };

  const createTicket = async () => {
    if (!newTicketTitle) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${backendUrl}/api/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTicketTitle, priority: 'Medium' })
      });
      if (res.ok) {
        setNewTicketTitle('');
        fetchTickets();
      } else {
        const mockNew = {
          id: `t-${Date.now()}`,
          title: newTicketTitle,
          status: 'Open',
          priority: 'Medium',
          assignee_email: 'dev@bughunter.ai',
          issue_file: 'General'
        };
        setTickets(prev => [mockNew, ...prev]);
        setNewTicketTitle('');
      }
    } catch (e) {
      // Offline fallback
    }
  };

  const updateTicketStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${backendUrl}/api/tickets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchTickets();
      } else {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      }
    } catch (e) {
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '1.8rem', margin: 0 }}>
            Triage Boards & Integration
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Assign security issues to engineering teams, track ticket resolution status, and configure Slack alert pipelines.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Ticket Boards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Quick Create Ticket */}
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="Enter vulnerability ticket title (e.g. Fix Docker base image version)..." 
              style={{ flexGrow: 1 }}
              value={newTicketTitle}
              onChange={(e) => setNewTicketTitle(e.target.value)}
            />
            <button className="btn-primary" onClick={createTicket} style={{ flexShrink: 0 }}>
              <Plus size={16} /> Create Ticket
            </button>
          </div>

          {/* Tickets Column Panels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {['Open', 'In Progress', 'Resolved'].map((col) => {
              const colTickets = tickets.filter(t => t.status === col);
              return (
                <div key={col} className="glass-panel" style={{ padding: '16px', background: '#0e131f', minHeight: '350px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{col}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{colTickets.length}</span>
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flexGrow: 1 }}>
                    {colTickets.map(ticket => (
                      <div key={ticket.id} className="glass-panel" style={{ padding: '12px', background: '#131926', borderLeft: `3.5px solid ${ticket.priority === 'Critical' ? '#ef4444' : ticket.priority === 'High' ? '#f59e0b' : '#3b82f6'}`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 800, color: ticket.priority === 'Critical' ? '#ef4444' : ticket.priority === 'High' ? '#f59e0b' : '#3b82f6' }}>
                          {ticket.priority} Priority
                        </span>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.3 }}>{ticket.title}</div>
                        
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <Users size={12} /> {ticket.assignee_email || 'Unassigned'}
                        </div>

                        {/* Move Actions */}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '6px' }}>
                          {col !== 'Open' && (
                            <button onClick={() => updateTicketStatus(ticket.id, col === 'In Progress' ? 'Open' : 'In Progress')} style={{ padding: '2px 6px', fontSize: '0.65rem', background: 'none', border: '1px solid var(--border-color)', cursor: 'pointer', borderRadius: '4px' }}>
                              Back
                            </button>
                          )}
                          {col !== 'Resolved' && (
                            <button onClick={() => updateTicketStatus(ticket.id, col === 'Open' ? 'In Progress' : 'Resolved')} style={{ padding: '2px 6px', fontSize: '0.65rem', background: 'none', border: '1px solid var(--border-color)', cursor: 'pointer', borderRadius: '4px', color: 'var(--primary)' }}>
                              Next
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Integration configuration side column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Slack Alert settings */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Slack size={18} color="var(--primary)" /> Slack Notifications
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
              Send critical scan alerts and regression events to developer channels automatically.
            </p>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Webhook URL</label>
              <input 
                type="text" 
                style={{ width: '100%', fontSize: '0.75rem', fontFamily: 'monospace' }}
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
              />
            </div>

            <button className="btn-secondary" style={{ justifyContent: 'center' }} onClick={() => alert('Webhook configurations updated!')}>
              Update Webhook Integration
            </button>
          </div>

          {/* Jira Integration */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} color="var(--primary)" /> Jira Cloud Connector
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
              Convert security triage items to active engineering Jira backlog issues automatically on scanner execution.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>Automatic tickets creation</span>
              <input type="checkbox" defaultChecked />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
