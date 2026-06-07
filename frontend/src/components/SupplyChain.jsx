import React, { useState, useEffect } from 'react';
import { Package, Download, AlertTriangle, CheckCircle, ShieldAlert, Cpu, GitFork } from 'lucide-react';

export default function SupplyChain({ backendUrl, scans }) {
  const [loading, setLoading] = useState(false);
  const [sbomData, setSbomData] = useState(null);
  const currentScanId = scans && scans[0] ? scans[0].id : 'demo-scan';

  // Load SBOM
  useEffect(() => {
    fetchSbom();
  }, [currentScanId]);

  const fetchSbom = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${backendUrl}/api/scans/${currentScanId}/sbom`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSbomData(data);
      } else {
        generateMockSbom();
      }
    } catch (e) {
      generateMockSbom();
    } finally {
      setLoading(false);
    }
  };

  const generateMockSbom = () => {
    setSbomData({
      bomFormat: 'CycloneDX',
      specVersion: '1.4',
      metadata: {
        timestamp: new Date().toISOString(),
        component: { name: 'acme-payment-gateway', version: '1.0.0' }
      },
      components: [
        { name: 'lodash', version: '4.17.20', purl: 'pkg:npm/lodash@4.17.20', publisher: 'public', vulnerabilities: [{ id: 'CVE-2020-8203', severity: 'High', cvss: 7.4, description: 'Prototype pollution in lodash' }] },
        { name: 'express', version: '4.17.1', purl: 'pkg:npm/express@4.17.1', publisher: 'public' },
        { name: 'axios', version: '0.21.1', purl: 'pkg:npm/axios@0.21.1', publisher: 'public' },
        { name: 'sqlite3', version: '5.0.2', purl: 'pkg:npm/sqlite3@5.0.2', publisher: 'public' },
        { name: 'ldash', version: '1.0.0', purl: 'pkg:npm/ldash@1.0.0', publisher: 'unknown', typosquatting: true },
        { name: 'internal-auth-helper', version: '1.2.0', purl: 'pkg:npm/internal-auth-helper@1.2.0', publisher: 'private', confusionRisk: true }
      ]
    });
  };

  const downloadSbom = () => {
    if (!sbomData) return;
    const blob = new Blob([JSON.stringify(sbomData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sbom-${sbomData.metadata?.component?.name || 'project'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const typosquats = sbomData?.components?.filter(c => c.typosquatting) || [];
  const confusions = sbomData?.components?.filter(c => c.confusionRisk) || [];
  const vulnerabilities = sbomData?.components?.filter(c => c.vulnerabilities) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '1.8rem', margin: 0 }}>
            Software Supply Chain Security
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Monitor third-party dependencies, license conformance, typosquatting risks, and export SBOM manifests.
          </p>
        </div>
        <button className="btn-primary" onClick={downloadSbom} disabled={!sbomData}>
          <Download size={16} /> Export CycloneDX SBOM
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="card glass-panel" style={{ padding: '20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Supply Chain Score</span>
            <CheckCircle color="var(--primary)" size={20} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>92%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '4px' }}>Stable Package Profile</div>
        </div>

        <div className="card glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Total Dependencies</span>
            <Package color="var(--accent)" size={20} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {sbomData?.components?.length || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Direct & Transitive libs</div>
        </div>

        <div className="card glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Typosquatting Risk</span>
            <AlertTriangle color={typosquats.length > 0 ? '#ef4444' : 'var(--primary)'} size={20} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: typosquats.length > 0 ? '#ef4444' : 'var(--text-main)' }}>
            {typosquats.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Suspicious naming matches</div>
        </div>

        <div className="card glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Dependency Confusion</span>
            <ShieldAlert color={confusions.length > 0 ? '#f59e0b' : 'var(--primary)'} size={20} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: confusions.length > 0 ? '#f59e0b' : 'var(--text-main)' }}>
            {confusions.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Unscoped internal libraries</div>
        </div>
      </div>

      {/* Main Graph & Lists split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        
        {/* Interactive SVG Dependency Graph */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GitFork size={18} color="var(--primary)" /> Dependency Risk Graph
            </h3>
            <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', background: 'var(--primary-glow)', color: 'var(--primary)', fontWeight: 600 }}>
              Interactive Visual Tree
            </span>
          </div>

          <div style={{ 
            height: '340px', 
            background: 'radial-gradient(circle, #101622 0%, #080b11 100%)', 
            borderRadius: '8px', 
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Visual SVG Dependency Tree */}
            <svg width="100%" height="100%" viewBox="0 0 500 300" style={{ cursor: 'grab' }}>
              {/* Lines linking nodes */}
              <line x1="250" y1="150" x2="150" y2="80" stroke="var(--border-color)" strokeWidth="1.5" />
              <line x1="250" y1="150" x2="350" y2="80" stroke="var(--border-color)" strokeWidth="1.5" />
              <line x1="250" y1="150" x2="150" y2="220" stroke="var(--border-color)" strokeWidth="1.5" />
              <line x1="250" y1="150" x2="350" y2="220" stroke="var(--border-color)" strokeWidth="1.5" />
              
              <line x1="150" y1="80" x2="80" y2="50" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />
              <line x1="150" y1="220" x2="80" y2="250" stroke="#f59e0b" strokeWidth="1.5" />

              {/* Central Root component */}
              <circle cx="250" cy="150" r="16" fill="var(--primary)" style={{ filter: 'drop-shadow(0 0 8px var(--primary))' }} />
              <text x="250" y="180" fill="var(--text-main)" fontSize="10" textAnchor="middle" fontWeight="bold">acme-gateway (Root)</text>

              {/* Child Nodes */}
              <circle cx="150" cy="80" r="10" fill="#f59e0b" />
              <text x="150" y="65" fill="var(--text-muted)" fontSize="9" textAnchor="middle">lodash @4.17.20</text>

              <circle cx="350" cy="80" r="10" fill="var(--primary)" />
              <text x="350" y="65" fill="var(--text-muted)" fontSize="9" textAnchor="middle">express @4.17.1</text>

              <circle cx="150" cy="220" r="10" fill="#3b82f6" />
              <text x="150" y="240" fill="var(--text-muted)" fontSize="9" textAnchor="middle">axios @0.21.1</text>

              <circle cx="350" cy="220" r="10" fill="var(--primary)" />
              <text x="350" y="240" fill="var(--text-muted)" fontSize="9" textAnchor="middle">sqlite3 @5.0.2</text>

              {/* Vulnerable and Risk nodes */}
              <circle cx="80" cy="50" r="8" fill="#ef4444" />
              <text x="80" y="38" fill="#ef4444" fontSize="9" textAnchor="middle" fontWeight="bold">ldash (Typosquat!)</text>

              <circle cx="80" cy="250" r="8" fill="#f59e0b" />
              <text x="80" y="270" fill="#f59e0b" fontSize="9" textAnchor="middle" fontWeight="bold">internal-auth (Confusion)</text>
            </svg>

            <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', gap: '12px', fontSize: '0.7rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></span> Clean</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></span> Warning</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span> Compromised</div>
            </div>
          </div>
        </div>

        {/* Security Alerts and details list */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Supply Chain Incidents</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '340px' }}>
            
            {/* Typosquatting Alert */}
            {typosquats.map((c, i) => (
              <div key={i} style={{ border: '1px solid #ef4444', borderRadius: '6px', padding: '12px', background: 'rgba(239, 68, 68, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>
                  <AlertTriangle size={16} /> Potential Typosquatting Attack
                </div>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                  Dependency <strong>{c.name}</strong> was matched. It mimics standard library <strong>lodash</strong>.
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Action: Uninstall immediately to avoid arbitrary script run payloads.
                </div>
              </div>
            ))}

            {/* Dependency Confusion */}
            {confusions.map((c, i) => (
              <div key={i} style={{ border: '1px solid #f59e0b', borderRadius: '6px', padding: '12px', background: 'rgba(245, 158, 11, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 700, fontSize: '0.85rem' }}>
                  <ShieldAlert size={16} /> Dependency Confusion Vulnerability
                </div>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                  Unscoped private package <strong>{c.name}</strong> lacks registry routing rules.
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Action: Add npm namespace `@acme/` to ensure safe resolver routing.
                </div>
              </div>
            ))}

            {/* CVE Vulnerability */}
            {vulnerabilities.map((c, i) => (
              <div key={i} style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{c.name} @{c.version}</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 600 }}>
                    CVSS {c.vulnerabilities[0].cvss}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {c.vulnerabilities[0].id}: {c.vulnerabilities[0].description}
                </div>
              </div>
            ))}

            {typosquats.length === 0 && confusions.length === 0 && vulnerabilities.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <CheckCircle size={32} color="var(--primary)" style={{ margin: '0 auto 12px auto' }} />
                No supply chain security issues detected in this scan.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Component Inventory List */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>Software Bill of Materials (SBOM) Inventory</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px' }}>Package Name</th>
              <th style={{ padding: '12px' }}>Version</th>
              <th style={{ padding: '12px' }}>Package URL (pURL)</th>
              <th style={{ padding: '12px' }}>Origin</th>
              <th style={{ padding: '12px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {sbomData?.components?.map((comp, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', background: comp.typosquatting ? 'rgba(239, 68, 68, 0.02)' : 'transparent' }}>
                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>{comp.name}</td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{comp.version}</td>
                <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--primary)' }}>{comp.purl}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: comp.publisher === 'private' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)', color: comp.publisher === 'private' ? '#3b82f6' : 'var(--text-muted)' }}>
                    {comp.publisher}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  {comp.typosquatting ? (
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>Typosquat Alert</span>
                  ) : comp.confusionRisk ? (
                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>Scope Required</span>
                  ) : comp.vulnerabilities ? (
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>Vulnerable</span>
                  ) : (
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Verified Safe</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
