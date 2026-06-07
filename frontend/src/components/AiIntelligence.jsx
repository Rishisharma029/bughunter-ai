import React from 'react';
import { Brain, Cpu, TrendingUp, AlertOctagon, HelpCircle, Activity } from 'lucide-react';

export default function AiIntelligence() {
  const refactorList = [
    { file: 'src/controllers/scans.js', priority: 'High', score: 92, debtHours: 12, complexity: 'High', reasons: 'High loop density and dynamic queries concatenation.' },
    { file: 'src/engine/multiAgent.js', priority: 'Medium', score: 68, debtHours: 8, complexity: 'High', reasons: 'Large conditional decision tree for static rules parser.' },
    { file: 'src/db.js', priority: 'Low', score: 34, debtHours: 3, complexity: 'Medium', reasons: 'Multiple database queries executed sequentially.' }
  ];

  const totalDebtHours = 23;
  const estimatedCost = totalDebtHours * 75; // $75/hr average dev rate

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '1.8rem', margin: 0 }}>
          AI Engineering & Technical Debt Intelligence
        </h2>
        <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          Evaluate code complexity growth, calculate technical debt, predict future bug locations, and prioritize refactoring tasks.
        </p>
      </div>

      {/* Main Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        <div className="card glass-panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Technical Debt (Runway)</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>
            {totalDebtHours} Hours
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '4px' }}>Estimated refactoring hours</div>
        </div>

        <div className="card glass-panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Refactoring Cost Estimate</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>
            ${estimatedCost.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Based on $75/hr developer cost</div>
        </div>

        <div className="card glass-panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Refactor Priority Index</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444', marginTop: '8px' }}>
            92 / 100
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Highest code bottleneck rating</div>
        </div>

        <div className="card glass-panel" style={{ padding: '20px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Future Bug Probability</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', marginTop: '8px' }}>
            38%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Risk of new bugs on next push</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        
        {/* Refactoring priority table */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Brain size={18} color="var(--primary)" /> Refactor Priority Ranking
          </h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px' }}>File Path</th>
                <th style={{ padding: '12px' }}>Complexity</th>
                <th style={{ padding: '12px' }}>Refactor Priority</th>
                <th style={{ padding: '12px' }}>Debt Hours</th>
              </tr>
            </thead>
            <tbody>
              {refactorList.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.file}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{item.reasons}</div>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{item.complexity}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontWeight: 700, 
                      background: item.priority === 'High' ? 'rgba(239, 68, 68, 0.15)' : item.priority === 'Medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)', 
                      color: item.priority === 'High' ? '#ef4444' : item.priority === 'Medium' ? '#f59e0b' : '#3b82f6' 
                    }}>
                      {item.score}% ({item.priority})
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>{item.debtHours} hrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Future Bug Probability Curves (interactive visual chart representation) */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--primary)" /> Future Bug Risk Projection
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
            Model bug regression probabilities across branches based on static analysis flags and change frequency.
          </p>

          <div style={{ 
            height: '220px', 
            background: 'radial-gradient(circle, #101622 0%, #080b11 100%)', 
            borderRadius: '8px', 
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <svg width="100%" height="100%" viewBox="0 0 400 200">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="360" y2="20" stroke="rgba(255,255,255,0.03)" />
              <line x1="40" y1="60" x2="360" y2="60" stroke="rgba(255,255,255,0.03)" />
              <line x1="40" y1="100" x2="360" y2="100" stroke="rgba(255,255,255,0.03)" />
              <line x1="40" y1="140" x2="360" y2="140" stroke="rgba(255,255,255,0.03)" />
              <line x1="40" y1="180" x2="360" y2="180" stroke="rgba(255,255,255,0.08)" />

              {/* Axis Label */}
              <text x="38" y="180" fill="var(--text-muted)" fontSize="8" textAnchor="end">0%</text>
              <text x="38" y="100" fill="var(--text-muted)" fontSize="8" textAnchor="end">50%</text>
              <text x="38" y="20" fill="var(--text-muted)" fontSize="8" textAnchor="end">100%</text>

              <text x="40" y="195" fill="var(--text-muted)" fontSize="8" textAnchor="middle">W1</text>
              <text x="120" y="195" fill="var(--text-muted)" fontSize="8" textAnchor="middle">W2</text>
              <text x="200" y="195" fill="var(--text-muted)" fontSize="8" textAnchor="middle">W3</text>
              <text x="280" y="195" fill="var(--text-muted)" fontSize="8" textAnchor="middle">W4</text>
              <text x="360" y="195" fill="var(--text-muted)" fontSize="8" textAnchor="middle">W5</text>

              {/* Trend Lines */}
              {/* Path 1: Bug Risk (Red) */}
              <path d="M 40 140 Q 120 120 200 90 T 360 40" fill="none" stroke="#ef4444" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 2px #ef4444)' }} />
              <circle cx="360" cy="40" r="4" fill="#ef4444" />

              {/* Path 2: Technical Debt Hours (Blue) */}
              <path d="M 40 160 Q 120 150 200 130 T 360 80" fill="none" stroke="var(--primary)" strokeWidth="2.5" />
            </svg>

            <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '12px', fontSize: '0.7rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '2px', background: '#ef4444' }}></span> Bug Probability</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '2px', background: 'var(--primary)' }}></span> Technical Debt</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
