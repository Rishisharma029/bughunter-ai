import React, { useState, useEffect } from 'react';
import { GitCommit, AlertTriangle, ShieldCheck, RefreshCw, GitPullRequest, TrendingUp, User } from 'lucide-react';

export default function CommitIntelligence({ backendUrl, repos }) {
  const [selectedRepoId, setSelectedRepoId] = useState('');
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (repos && repos.length > 0) {
      setSelectedRepoId(repos[0].id);
    }
  }, [repos]);

  useEffect(() => {
    if (selectedRepoId) {
      fetchCommitData(selectedRepoId);
    }
  }, [selectedRepoId]);

  const fetchCommitData = async (repoId) => {
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${backendUrl}/api/commits/${repoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCommits(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && commits.length === 0) {
    return (
      <div style={{ display: 'flex', flexGrow: 1, height: '300px', justifyContent: 'center', alignItems: 'center' }}>
        <RefreshCw className="animate-spin" size={28} color="var(--primary)" />
      </div>
    );
  }

  const listCommits = commits && commits.length > 0 ? commits : [
    { id: 'c1', sha: 'f9b2a1c', message: 'Merge pull request #104 from patch-2 (User auth validation)', author: 'dev@bughunter.ai', risk_score: 15, security_regressions: 0, created_at: new Date().toISOString() },
    { id: 'c2', sha: 'e1d2c3a', message: 'Add search endpoint to controller', author: 'intern@bughunter.ai', risk_score: 85, security_regressions: 1, created_at: new Date().toISOString() }
  ];

  return (
    <div style={{ animation: 'fadeInUp 0.3s ease-out', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>Commit Risk & Security Timelines</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Analyzing repository check-in history to identify regressions and security risk spikes.</p>
        </div>
        
        {/* Repo Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Repository:</span>
          <select
            value={selectedRepoId}
            onChange={(e) => setSelectedRepoId(e.target.value)}
            style={{ background: '#131926', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
          >
            {repos && repos.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            {(!repos || repos.length === 0) && <option value="repo-1">acme-payment-gateway</option>}
          </select>
        </div>
      </div>

      {/* Timelines list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        
        {/* Left Side: Commits Feed */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GitCommit size={18} color="var(--primary)" /> Commits Check-In Log
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
            {/* Center Line of Timeline */}
            <div style={{ position: 'absolute', left: '16px', top: '20px', bottom: '20px', width: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>
            
            {listCommits.map((c, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '20px', position: 'relative', zIndex: 10 }}>
                {/* Timeline node dot */}
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: c.risk_score >= 70 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  border: c.risk_score >= 70 ? '2px solid #ef4444' : '2px solid var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <GitCommit size={16} color={c.risk_score >= 70 ? '#ef4444' : 'var(--primary)'} />
                </div>

                <div className="glass-panel" style={{ flexGrow: 1, padding: '14px 20px', background: 'rgba(255,255,255,0.01)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SHA: {c.sha}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '8px' }}>{c.message}</div>
                  
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={12} /> {c.author}
                    </span>
                    <span className={`badge ${c.risk_score >= 70 ? 'badge-critical' : 'badge-low'}`} style={{ fontSize: '0.65rem' }}>
                      Risk Score: {c.risk_score}%
                    </span>
                    {c.security_regressions > 0 && (
                      <span className="badge badge-high" style={{ fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={10} /> Regression
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Risk Statistics Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Risk Regressions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Security regressions checked</span>
                <span style={{ fontWeight: 700, color: '#ef4444' }}>{listCommits.reduce((acc, c) => acc + (c.security_regressions || 0), 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Average commit risk rating</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  {Math.round(listCommits.reduce((acc, c) => acc + c.risk_score, 0) / listCommits.length)}%
                </span>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(16, 185, 129, 0.02)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>✔ Branch Protection Active</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Commits are actively inspected by the Multi-Agent engine prior to staging merges. Pre-commit hooks verify that no plaintext keys make it into codebase trees.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
