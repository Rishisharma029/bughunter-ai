import React from 'react';
import { Shield, GitBranch, RefreshCw, AlertTriangle, CheckCircle, Activity, Plus, TrendingUp, Users } from 'lucide-react';

export default function Dashboard({ stats, repos, scans, onTriggerScan, onImportRepo, onSelectScan }) {
  
  // Custom simple SVG Line Chart to represent Security Trends
  const renderTrendChart = () => {
    const data = [95, 92, 88, 91, 94, 98]; // mock trend data
    const width = 500;
    const height = 150;
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * (width - 40) + 20;
      const y = height - ((val - 60) / 40) * (height - 30) - 15;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {/* Fill area */}
        <polygon
          points={`20,${height} ${points} ${width - 20},${height}`}
          fill="url(#chartGlow)"
        />
        {/* Draw Trend Line */}
        <polyline
          fill="none"
          stroke="var(--primary)"
          strokeWidth="3"
          points={points}
        />
        {/* Draw Circles */}
        {data.map((val, idx) => {
          const x = (idx / (data.length - 1)) * (width - 40) + 20;
          const y = height - ((val - 60) / 40) * (height - 30) - 15;
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r="4"
              fill="#ffffff"
              stroke="var(--primary)"
              strokeWidth="2.5"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      
      {/* Welcome Title Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>Platform Intelligence</h1>
          <p style={{ color: 'var(--text-muted)' }}>Multi-agent codebase scanner and security risk posture.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onImportRepo} className="btn-secondary">
            <Plus size={16} /> Import Repository
          </button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="dashboard-grid">
        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Scans</span>
            <Activity size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800 }}>{stats.totalScans || 0}</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Repositories connected: {stats.totalRepositories || 0}</p>
        </div>

        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Vulnerabilities</span>
            <AlertTriangle size={20} color="#ef4444" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ef4444' }}>{stats.totalIssues || 0}</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Critical CVE paths flagged: {stats.criticalCount || 0}</p>
        </div>

        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Security Score</span>
            <Shield size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)' }}>{stats.averageSecurityScore || 100}%</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Overall workspace rating: A+</p>
        </div>

        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Quality & Clean Code</span>
            <CheckCircle size={20} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800 }}>{stats.averageQualityScore || 100}%</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Performance metric: {stats.averagePerformanceScore || 100}%</p>
        </div>
      </div>

      {/* Middle Layout (Charts & Activity) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* Chart Panel */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Security Score Growth</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={14} color="var(--primary)" /> +8.4% this month
            </span>
          </div>
          <div style={{ padding: '10px 0' }}>
            {renderTrendChart()}
          </div>
        </div>

        {/* Activity feed */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Scan Activity Feed</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flexGrow: 1, overflowY: 'auto', maxHeight: '180px' }}>
            {scans && scans.length > 0 ? (
              scans.map((s, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.status === 'completed' ? 'var(--primary)' : '#f59e0b' }}></div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: 600 }}>Scan #{s.id.slice(0, 8)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Grade: {s.overall_grade || 'Running'} • Branch: {s.branch || 'main'}</div>
                  </div>
                  <button onClick={() => onSelectScan(s.id)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px' }}>Details</button>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>No scans available. Import a repo to scan.</div>
            )}
          </div>
        </div>
      </div>

      {/* Repositories Table List */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Monitored Repositories</h3>
        {repos && repos.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontWeight: 600 }}>Repository Name</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontWeight: 600 }}>URL Location</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontWeight: 600 }}>Main Branch</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontWeight: 600 }}>Last Scanned</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {repos.map((repo, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', hover: { background: 'rgba(255,255,255,0.02)' } }}>
                    <td style={{ padding: '14px 10px', fontWeight: 600 }}>{repo.name}</td>
                    <td style={{ padding: '14px 10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{repo.url}</td>
                    <td style={{ padding: '14px 10px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                        <GitBranch size={12} /> {repo.branch}
                      </span>
                    </td>
                    <td style={{ padding: '14px 10px', color: 'var(--text-muted)' }}>
                      {repo.last_scan_at ? new Date(repo.last_scan_at).toLocaleString() : 'Never Scanned'}
                    </td>
                    <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                      <button onClick={() => onTriggerScan(repo.id)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}>
                        <RefreshCw size={12} /> Run Scan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No repositories connected yet. Click "Import Repository" to configure.
          </div>
        )}
      </div>
    </div>
  );
}
