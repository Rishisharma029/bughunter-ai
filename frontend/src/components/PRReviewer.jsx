import React, { useState } from 'react';
import { GitPullRequest, ShieldAlert, AlertTriangle, CheckCircle2, ChevronRight, Loader } from 'lucide-react';

export default function PRReviewer() {
  const [selectedPr, setSelectedPr] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const mockPrs = [
    { id: 104, title: 'Refactor user auth validation', author: 'dev@bughunter.ai', branch: 'patch-2', status: 'Unreviewed', files: 3, commits: 2 },
    { id: 103, title: 'Implement search endpoint in query controller', author: 'intern@bughunter.ai', branch: 'feat/search', status: 'Flagged', files: 2, commits: 4 },
    { id: 102, title: 'Clean up nested loop iterations in analytics helper', author: 'dev@bughunter.ai', branch: 'perf-fix', status: 'Approved', files: 1, commits: 1 }
  ];

  const handleStartReview = (pr) => {
    setAnalyzing(true);
    setSelectedPr(null);
    setTimeout(() => {
      setSelectedPr(pr);
      setAnalyzing(false);
    }, 1500);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return <span className="badge badge-low" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Approved</span>;
      case 'Flagged': return <span className="badge badge-critical">Flagged</span>;
      default: return <span className="badge badge-medium">Unreviewed</span>;
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px', animation: 'fadeInUp 0.3s ease-out', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
      
      {/* Left Pane: PR Lists */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '4px' }}>Pull Request Reviews</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>Select an open pull request to run multi-agent reviews.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flexGrow: 1 }}>
          {mockPrs.map((pr) => (
            <div
              key={pr.id}
              onClick={() => handleStartReview(pr)}
              style={{
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.01)',
                hover: { background: 'rgba(255,255,255,0.03)' },
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background var(--transition-fast)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <GitPullRequest size={16} color="var(--primary)" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>PR #{pr.id}</span>
                  {getStatusBadge(pr.status)}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{pr.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>By {pr.author} • {pr.files} files changed</div>
              </div>
              <ChevronRight size={18} color="var(--text-muted)" />
            </div>
          ))}
        </div>
      </div>

      {/* Right Pane: Analysis Results */}
      <div className="glass-panel" style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {analyzing ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
            <Loader className="animate-spin" size={32} color="var(--primary)" />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Cloning branch and executing agent review checklist...</span>
          </div>
        ) : selectedPr ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Branch: {selectedPr.branch}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Commits: {selectedPr.commits}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>PR #{selectedPr.id}: {selectedPr.title}</h3>
            </div>

            {/* Review Summary */}
            {selectedPr.id === 104 && (
              <>
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#10b981', fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px' }}>
                    <CheckCircle2 size={18} /> Review Summary: Approved
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                    Skeptic Agent and Judge Agent verified the diff changes in `auth.js`. The team correctly added bcrypt rounds and token validation constraints. All checks pass.
                  </p>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Audit Details</h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <li>✔ <strong>Hunter Agent:</strong> Checked structure for memory leaks. None found.</li>
                    <li>✔ <strong>Security Agent:</strong> Verified token validation patterns. No secrets hardcoded.</li>
                    <li>✔ <strong>Performance Agent:</strong> Clean linear algorithm execution.</li>
                  </ul>
                </div>
              </>
            )}

            {selectedPr.id === 103 && (
              <>
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#ef4444', fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px' }}>
                    <ShieldAlert size={18} /> Review Summary: Vulnerability Found
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                    Security Agent flagged a potential <strong>Critical SQL Injection</strong> vulnerability in `queryController.js` at line 14. Input is directly concatenated into dynamic SQL queries.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Flagged Location</h4>
                  <div style={{ background: '#090d16', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#cbd5e1' }}>
                    <div style={{ color: '#ef4444' }}>- const query = "SELECT * FROM items WHERE name = '" + req.query.name + "'";</div>
                    <div style={{ color: '#10b981' }}>+ const query = "SELECT * FROM items WHERE name = ?";</div>
                    <div style={{ color: '#10b981' }}>+ db.query(query, [req.query.name]);</div>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Remediation Guidelines</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Ensure you reject the pull request merge until the author refactors the code to use prepared statement parameterized inputs to prevent database breaches.
                  </p>
                </div>
              </>
            )}

            {selectedPr.id === 102 && (
              <>
                <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#3b82f6', fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px' }}>
                    <CheckCircle2 size={18} /> Review Summary: Approved (Optimized)
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                    Performance Agent verified that the nested loops have been refactored to use a key-lookup Map structure. CPU iteration cycles dropped from O(N^3) to O(N).
                  </p>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Optimization Stats</h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <li>✔ <strong>Time Complexity:</strong> O(N^3) ➔ O(N) linear lookup</li>
                    <li>✔ <strong>Memory Overhead:</strong> Minimal (+12KB map allocation)</li>
                    <li>✔ <strong>Consensus status:</strong> Checked and approved by Skeptic Agent</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Select a pull request from the list to view the AI review details.
          </div>
        )}
      </div>

    </div>
  );
}
