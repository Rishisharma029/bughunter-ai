import React from 'react';
import { Shield, TrendingUp, BarChart3, Clock, CheckCircle2, ChevronRight, BarChart } from 'lucide-react';

export default function ExecutiveDashboard() {
  const teamScorecards = [
    { team: 'Payment Systems API (Backend)', score: 82, status: 'Needs Refactor', critical: 1, high: 2, medium: 4 },
    { team: 'Internal Infrastructure (DevOps)', score: 90, status: 'Healthy', critical: 0, high: 1, medium: 2 },
    { team: 'Corporate Portal Web (Frontend)', score: 96, status: 'Excellent', critical: 0, high: 0, medium: 1 }
  ];

  const agingMetrics = [
    { range: '0 - 7 Days', count: 12, color: 'var(--primary)' },
    { range: '8 - 30 Days', count: 4, color: '#f59e0b' },
    { range: '30+ Days (Stale)', count: 1, color: '#ef4444' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '1.8rem', margin: 0 }}>
          Executive Security KPIs & Posture
        </h2>
        <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          Broad operations indicators for engineering leadership. Assess vulnerability age, velocity, and team compliance rankings.
        </p>
      </div>

      {/* Main KPI Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        <div className="card glass-panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Security Posture Score</span>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '8px' }}>96%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Grade: A+ (Outstanding)</div>
        </div>

        <div className="card glass-panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Mean Time to Remediate (MTTR)</span>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>4.2 Hours</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '4px' }}>32% faster than last month</div>
        </div>

        <div className="card glass-panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Vulnerability Aging Average</span>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>6.8 Days</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Time open before patch merge</div>
        </div>

        <div className="card glass-panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Compliance Status (Average)</span>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>93%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>SOC2, ISO, NIST combined score</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        
        {/* Team Comparative Scorecard */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="var(--primary)" /> Team Security Scorecards
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px' }}>Engineering Team</th>
                <th style={{ padding: '12px' }}>Security Rating</th>
                <th style={{ padding: '12px' }}>Critical / High</th>
                <th style={{ padding: '12px' }}>Triage State</th>
              </tr>
            </thead>
            <tbody>
              {teamScorecards.map((team, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>{team.team}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: team.score >= 90 ? 'var(--primary)' : '#f59e0b', width: `${team.score}%` }}></div>
                      </div>
                      <strong style={{ color: team.score >= 90 ? 'var(--primary)' : '#f59e0b' }}>{team.score}%</strong>
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: team.critical > 0 ? '#ef4444' : 'var(--text-muted)', fontWeight: 600 }}>
                    {team.critical} / {team.high}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontWeight: 700, 
                      background: team.score >= 95 ? 'rgba(16, 185, 129, 0.15)' : team.score >= 90 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: team.score >= 95 ? 'var(--primary)' : team.score >= 90 ? '#3b82f6' : '#f59e0b'
                    }}>
                      {team.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vulnerability Aging Chart & Remediations Velocity */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--primary)" /> Vulnerability Aging Backlog
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
            Monitor unresolved vulnerabilities sorted by how long they have remained active in the main branch repository.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            {agingMetrics.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{item.range}</span>
                  <strong style={{ color: 'var(--text-main)' }}>{item.count} issues open</strong>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: item.color, width: `${(item.count / 17) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SLA Conformance</span>
              <strong style={{ fontSize: '0.95rem', color: 'var(--primary)', display: 'block', marginTop: '2px' }}>94.2%</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Security Debt Ratio</span>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block', marginTop: '2px' }}>0.08</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
