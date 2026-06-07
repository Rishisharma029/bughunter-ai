import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, Info, Download, Play, MessageSquare, Terminal, RefreshCw, Layers } from 'lucide-react';

export default function ScanDetail({ scanId, backendUrl, onOpenChat }) {
  const [scan, setScan] = useState(null);
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loadingFile, setLoadingFile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');

  useEffect(() => {
    fetchScanDetails();
  }, [scanId]);

  useEffect(() => {
    if (selectedIssue) {
      loadFileContent(selectedIssue.file_path);
    }
  }, [selectedIssue]);

  const fetchScanDetails = async () => {
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${backendUrl}/api/scans/${scanId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setScan(data.scan);
        setIssues(data.issues);
        if (data.issues.length > 0) {
          setSelectedIssue(data.issues[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadFileContent = async (filePath) => {
    setLoadingFile(true);
    setFileContent('');
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${backendUrl}/api/repositories/file?scanId=${scanId}&filePath=${filePath}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.content) {
        setFileContent(data.content);
      } else {
        // Fallback to placeholder code if file is not found
        setFileContent(`// Code File: ${filePath}\n\n// Note: File contents could not be retrieved from local disk.\n// Exhibiting simulated patch context below:\n\n${selectedIssue ? selectedIssue.improved_code || '// No code block available' : ''}`);
      }
    } catch (e) {
      setFileContent(`// Error loading ${filePath}\n// Falling back to issue fix context:\n\n${selectedIssue ? selectedIssue.improved_code : ''}`);
    } finally {
      setLoadingFile(false);
    }
  };

  const downloadPdf = () => {
    const token = localStorage.getItem('accessToken');
    // We can open the download link in a new window with the token as query param, or perform a fetch blob download
    // Performing a fetch blob download is much cleaner as it includes the authorization headers!
    fetch(`${backendUrl}/api/reports/pdf/${scanId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BugHunter_Report_${scan.repo_name}_${scanId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch(err => alert('Failed to download PDF report'));
  };

  // Filter Logic
  const filteredIssues = issues.filter(issue => {
    const matchesType = filterType === 'all' || issue.type === filterType;
    const matchesSeverity = filterSeverity === 'all' || issue.severity === filterSeverity;
    return matchesType && matchesSeverity;
  });

  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'Critical': return '#ef4444';
      case 'High': return '#f97316';
      case 'Medium': return '#eab308';
      default: return '#3b82f6';
    }
  };

  const getSeverityIcon = (sev) => {
    switch (sev) {
      case 'Critical': return <ShieldAlert size={16} color="#ef4444" />;
      case 'High': return <AlertTriangle size={16} color="#f97316" />;
      case 'Medium': return <AlertCircle size={16} color="#eab308" />;
      default: return <Info size={16} color="#3b82f6" />;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '400px', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
        <RefreshCw className="animate-spin" size={36} color="var(--primary)" />
        <span style={{ color: 'var(--text-muted)' }}>Running AI Agent consensus audits...</span>
      </div>
    );
  }

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', animation: 'fadeInUp 0.3s ease-out' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Audit Report: {scan?.repo_name || 'Loading...'}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Scan Grade: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{scan?.overall_grade}</span> • Scans performed: {new Date(scan?.created_at).toLocaleDateString()}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={downloadPdf} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <Download size={16} /> Export PDF Report
          </button>
        </div>
      </div>

      {/* 3-Pane Body */}
      <div style={{ display: 'flex', flexGrow: 1, gap: '16px', overflow: 'hidden' }}>
        
        {/* Pane 1: Issue Lists (Left) */}
        <div className="glass-panel" style={{ width: '280px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Vulnerabilities ({filteredIssues.length})</h3>
            
            <div style={{ display: 'flex', gap: '6px' }}>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                style={{ flex: 1, padding: '4px', background: '#131926', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff', fontSize: '0.75rem' }}
              >
                <option value="all">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{ flex: 1, padding: '4px', background: '#131926', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff', fontSize: '0.75rem' }}
              >
                <option value="all">All Types</option>
                <option value="security">Security</option>
                <option value="bug">Bugs</option>
                <option value="performance">Performance</option>
                <option value="quality">Quality</option>
              </select>
            </div>
          </div>

          <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border-color)',
                  background: selectedIssue?.id === issue.id ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                  borderLeft: selectedIssue?.id === issue.id ? `4px solid ${getSeverityColor(issue.severity)}` : '4px solid transparent',
                  transition: 'background var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                  {getSeverityIcon(issue.severity)}
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: getSeverityColor(issue.severity), textTransform: 'uppercase' }}>
                    {issue.severity}
                  </span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {issue.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {issue.file_path}:{issue.line_number}
                </div>
              </div>
            ))}
            {filteredIssues.length === 0 && (
              <div style={{ padding: '24px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No issues match filters.</div>
            )}
          </div>
        </div>

        {/* Pane 2: Code Viewer (Center) */}
        <div className="glass-panel" style={{ flexGrow: 1.5, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#090d16' }}>
          <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {selectedIssue?.file_path || 'Select an issue'}
            </span>
          </div>

          <div style={{ flexGrow: 1, overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', padding: '16px', color: '#c9d1d9', position: 'relative' }}>
            {loadingFile ? (
              <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center' }}><RefreshCw className="animate-spin" /></div>
            ) : (
              <pre style={{ margin: 0, padding: 0, background: 'transparent', border: 'none' }}>
                {fileContent.split('\n').map((line, idx) => {
                  const lineNum = idx + 1;
                  const isTargetLine = selectedIssue && lineNum === selectedIssue.line_number;
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        background: isTargetLine ? (selectedIssue.severity === 'Critical' || selectedIssue.severity === 'High' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)') : 'transparent',
                        borderLeft: isTargetLine ? `4px solid ${getSeverityColor(selectedIssue.severity)}` : '4px solid transparent',
                        padding: '1px 8px 1px 0'
                      }}
                    >
                      <span style={{ width: '40px', color: '#484f58', textAlign: 'right', paddingRight: '16px', userSelect: 'none', fontSize: '0.8rem' }}>
                        {lineNum}
                      </span>
                      <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{line}</span>
                    </div>
                  );
                })}
              </pre>
            )}
          </div>
        </div>

        {/* Pane 3: Issue Auditor Details (Right) */}
        <div className="glass-panel" style={{ width: '360px', overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedIssue ? (
            <>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Confidence Score:</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>{selectedIssue.confidence}%</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>{selectedIssue.title}</h3>
                <span className={`badge badge-${selectedIssue.severity.toLowerCase()}`}>{selectedIssue.severity} Severity</span>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Issue Explanation</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>{selectedIssue.description}</p>
                {selectedIssue.explanation && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>{selectedIssue.explanation}</p>
                )}
              </div>

              {selectedIssue.impact && (
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '6px' }}>
                  <h4 style={{ fontSize: '0.8rem', color: '#ef4444', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Security Risk Impact</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{selectedIssue.impact}</p>
                </div>
              )}

              {/* Attack Simulation */}
              {selectedIssue.attack_simulation && (
                <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '12px', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                  <div style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Terminal size={14} color="#f97316" /> Educational Attack Simulation
                  </div>
                  <div style={{ color: '#ef4444', marginBottom: '4px' }}>Input payload: {selectedIssue.attack_simulation.payload}</div>
                  <div style={{ color: '#94a3b8' }}>Rendered Query: {selectedIssue.attack_simulation.output}</div>
                  <div style={{ color: '#eab308', marginTop: '6px' }}>Impact: {selectedIssue.attack_simulation.impact}</div>
                </div>
              )}

              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>Suggested Resolution</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '8px' }}>{selectedIssue.fix_suggestion}</p>
                {selectedIssue.improved_code && (
                  <pre style={{ fontSize: '0.75rem', maxHeight: '180px', overflowY: 'auto' }}>
                    <code>{selectedIssue.improved_code}</code>
                  </pre>
                )}
              </div>

              <div style={{ background: 'var(--primary-glow)', border: '1px solid rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '6px', fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={14} /> Multi-Agent Audit Log
                </div>
                <p style={{ color: 'var(--text-main)', fontStyle: 'italic' }}>{selectedIssue.agent_verdict}</p>
              </div>

              <button onClick={() => onOpenChat(selectedIssue)} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
                <MessageSquare size={16} /> Explain via AI Assistant
              </button>
            </>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Select an issue to inspect audit details.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
