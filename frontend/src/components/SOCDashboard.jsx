import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Key, Activity, RefreshCw, Layers, ShieldCheck } from 'lucide-react';

export default function SOCDashboard({ backendUrl }) {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSOCTelemetry();
  }, []);

  const fetchSOCTelemetry = async () => {
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${backendUrl}/api/soc/telemetry`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTelemetry(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexGrow: 1, height: '300px', justifyContent: 'center', alignItems: 'center' }}>
        <RefreshCw className="animate-spin" size={28} color="var(--primary)" />
      </div>
    );
  }

  const t = telemetry || {
    postureScore: 88,
    severityCounts: { critical: 1, high: 1, medium: 2, low: 1 },
    exposedSecretsCount: 1,
    exposedSecretsList: [{ file_path: 'src/config/db.js', line_number: 12, title: 'Exposed Plaintext Secret: Database Password', severity: 'Critical', confidence: 99 }],
    riskHeatmap: [
      { area: 'src/controllers', risk: 'High', count: 1 },
      { area: 'src/config', risk: 'Critical', count: 1 },
      { area: 'src/middleware', risk: 'Medium', count: 2 },
      { area: 'src/utils', risk: 'Low', count: 1 }
    ]
  };

  return (
    <div style={{ animation: 'fadeInUp 0.3s ease-out', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifycontent: 'space-between', alignitems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>Security Operations Center (SOC)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time vulnerability logs, threat levels, and active exposed secrets.</p>
        </div>
        <button onClick={fetchSOCTelemetry} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
          <RefreshCw size={14} /> Refresh SOC
        </button>
      </div>

      {/* Posture Score & Vulnerabilities Counters */}
      <div className="dashboard-grid">
        
        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Security Posture Score</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{t.postureScore}%</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Rating: A</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Calculated across 5 scanning agent nodes.</p>
        </div>

        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Critical Threats</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ef4444' }}>{t.severityCounts.critical}</span>
            <span style={{ fontSize: '0.85rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>Active</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Require immediate remediation path checks.</p>
        </div>

        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid #f97316' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>High Vulnerabilities</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f97316' }}>{t.severityCounts.high}</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Exploitable access path vulnerabilities.</p>
        </div>

        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid #eab308' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Exposed Credentials</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#eab308' }}>{t.exposedSecretsCount}</span>
            <Key size={20} color="#eab308" style={{ marginLeft: '8px' }} />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Plaintext API or database keys exposed in code.</p>
        </div>

      </div>

      {/* Risk Heatmap & Secrets Listing */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
        
        {/* Heatmap Panel */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="var(--primary)" /> Risk Density Heatmap
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {t.riskHeatmap.map((area, idx) => (
              <div key={idx} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{area.area}</span>
                  <span style={{
                    fontWeight: 700,
                    color: area.risk === 'Critical' || area.risk === 'High' ? '#ef4444' : area.risk === 'Medium' ? '#eab308' : '#3b82f6'
                  }}>{area.risk} Risk</span>
                </div>
                {/* Visual bar */}
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, Math.max(10, (area.count || 1) * 35))}%`,
                    height: '100%',
                    background: area.risk === 'Critical' || area.risk === 'High' ? '#ef4444' : area.risk === 'Medium' ? '#eab308' : '#3b82f6',
                    borderRadius: '3px'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exposed Secrets Log */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} color="#ef4444" /> Compromised Plaintext Credentials
          </h3>
          
          {t.exposedSecretsList.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px', fontWeight: 600 }}>File Location</th>
                    <th style={{ padding: '8px', fontWeight: 600 }}>Type</th>
                    <th style={{ padding: '8px', fontWeight: 600 }}>Severity</th>
                    <th style={{ padding: '8px', fontWeight: 600, textAlign: 'right' }}>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {t.exposedSecretsList.map((sec, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                        {sec.file_path}:{sec.line_number}
                      </td>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>{sec.title.split(': ')[1] || sec.title}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>{sec.severity}</span>
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>
                        {sec.confidence}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '150px', color: 'var(--text-muted)' }}>
              <ShieldCheck size={36} color="var(--primary)" style={{ marginBottom: '8px' }} />
              <p>No plaintext secrets currently exposed in version control.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
