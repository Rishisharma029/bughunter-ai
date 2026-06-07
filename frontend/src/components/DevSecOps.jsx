import React from 'react';
import { GitBranch, ShieldAlert, CheckCircle, Flame, Rocket, Play, Activity } from 'lucide-react';

export default function DevSecOps() {
  const readinessChecks = [
    { name: 'Critical Security Vulnerabilities', status: 'Passed', details: '0 outstanding critical flaws found.' },
    { name: 'GitHub Actions Workflows Pinned', status: 'Failed', details: '2 workflows reference mutable action tags.' },
    { name: 'Unit & Security Tests Execution', status: 'Passed', details: 'All 7 test suites succeeded in local run.' },
    { name: 'Compliance Checklist SOC2', status: 'Passed', details: '94% controls coverage verified.' },
    { name: 'Container Config Privileged Checks', status: 'Failed', details: '1 privileged pod context active in deploy manifest.' }
  ];

  const readinessScore = 78;

  const mockWorkflows = [
    { id: '1', name: 'production-deployment.yml', trigger: 'push branch main', status: 'Insecure', issues: 2, lastRun: '2 hours ago' },
    { id: '2', name: 'pr-integrity-check.yml', trigger: 'pull_request dev', status: 'Secure', issues: 0, lastRun: '1 day ago' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '1.8rem', margin: 0 }}>
          DevSecOps & Pipeline Intelligence
        </h2>
        <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          Evaluate CI/CD build scripts, deployment risks, unpinned workflow dependencies, and monitor release readiness.
        </p>
      </div>

      {/* Release Readiness Score Meter */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
        
        {/* Readiness Meter Card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', position: 'relative' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Release Readiness Score</h3>
          
          <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--border-color)" strokeWidth="6" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--primary)" strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - readinessScore / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={{ filter: 'drop-shadow(0 0 4px var(--primary))', transition: 'stroke-dashoffset 1s ease-in-out' }}
              />
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{readinessScore}%</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>Blocked</span>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Release Status: <strong style={{ color: '#ef4444' }}>Warning</strong>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '6px 0 0 0' }}>
              2 failed security checks block production release pipeline integrations.
            </p>
          </div>
        </div>

        {/* Readiness Checklist */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Release Guardrails</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {readinessChecks.map((check, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '10px 14px', 
                borderRadius: '6px', 
                border: '1px solid var(--border-color)',
                background: 'rgba(255, 255, 255, 0.01)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{check.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{check.details}</span>
                </div>
                <span style={{ 
                  fontSize: '0.75rem', 
                  padding: '2px 8px', 
                  borderRadius: '4px', 
                  fontWeight: 700, 
                  background: check.status === 'Passed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                  color: check.status === 'Passed' ? 'var(--primary)' : '#ef4444' 
                }}>
                  {check.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GitHub Action Pipeline checks */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Play size={18} color="var(--primary)" /> CI/CD Workflow Analysis
        </h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px' }}>Workflow File</th>
              <th style={{ padding: '12px' }}>Trigger Scope</th>
              <th style={{ padding: '12px' }}>Unresolved Flags</th>
              <th style={{ padding: '12px' }}>Last Audited</th>
              <th style={{ padding: '12px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockWorkflows.map((flow) => (
              <tr key={flow.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)', fontFamily: 'monospace' }}>{flow.name}</td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{flow.trigger}</td>
                <td style={{ padding: '12px', color: flow.issues > 0 ? '#ef4444' : 'var(--text-muted)', fontWeight: 600 }}>{flow.issues} issues</td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{flow.lastRun}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    fontWeight: 700, 
                    background: flow.status === 'Secure' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                    color: flow.status === 'Secure' ? 'var(--primary)' : '#ef4444' 
                  }}>
                    {flow.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
