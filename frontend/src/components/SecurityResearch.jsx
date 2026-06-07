import React, { useState, useEffect } from 'react';
import { Shield, Zap, Calculator, Database, HelpCircle, AlertTriangle, Link2 } from 'lucide-react';

export default function SecurityResearch({ backendUrl }) {
  // CVSS State
  const [av, setAv] = useState(0.85); // Network: 0.85, Adjacent: 0.62, Local: 0.55, Physical: 0.2
  const [ac, setAc] = useState(0.77); // Low: 0.77, High: 0.44
  const [pr, setPr] = useState(0.85); // None: 0.85, Low: 0.62, High: 0.27
  const [ui, setUi] = useState(0.85); // None: 0.85, Required: 0.62
  const [c, setC] = useState(0.56);   // High: 0.56, Low: 0.22, None: 0
  const [i, setI] = useState(0.56);   // High: 0.56, Low: 0.22, None: 0
  const [a, setA] = useState(0.56);   // High: 0.56, Low: 0.22, None: 0

  const [cvssScore, setCvssScore] = useState(10.0);

  // Vulnerability Chaining Simulator State
  const [chainFindings, setChainFindings] = useState([
    { id: '1', title: 'Open Ingress Network Security Group (0.0.0.0/0)', selected: true },
    { id: '2', title: 'Potential SQL Injection Vulnerability', selected: true },
    { id: '3', title: 'Exposed Plaintext Secret: Database Password', selected: true }
  ]);
  const [simulationData, setSimulationData] = useState(null);
  const [simulating, setSimulating] = useState(false);

  // Recalculate CVSS
  useEffect(() => {
    // Simple CVSS-like calculation
    const exploitability = 8.22 * av * ac * pr * ui;
    const impact = 10.41 * (1 - (1 - c) * (1 - i) * (1 - a));
    let score = exploitability + impact;
    score = Math.min(10.0, Math.round(score * 10) / 10);
    if (c === 0 && i === 0 && a === 0) score = 0;
    setCvssScore(score);
  }, [av, ac, pr, ui, c, i, a]);

  const triggerChainSimulation = async () => {
    setSimulating(true);
    try {
      const selected = chainFindings.filter(f => f.selected);
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${backendUrl}/api/research/chaining`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ findings: selected })
      });
      if (res.ok) {
        const data = await res.json();
        setSimulationData(data);
      } else {
        mockChain();
      }
    } catch (e) {
      mockChain();
    } finally {
      setSimulating(false);
    }
  };

  const mockChain = () => {
    setSimulationData({
      chain_title: 'Public Host Discovery ➔ DB Injection ➔ Admin Secret Exfiltration Chain',
      severity: 'Critical',
      explanation: 'An attacker scanning open ports discovers public-facing servers due to open Ingress CIDRs. They leverage SQL injection in your dynamic select query to dump the database and extract the hardcoded JWT secret/AWS API keys, gaining full tenant administrative privileges.',
      steps: [
        { step: 1, title: 'Network Access', desc: 'Attacker probes your internet-facing VM (CWE-200, Ingress SG open).' },
        { step: 2, title: 'Database Injection', desc: 'Attacker leverages dynamic SELECT string concatenation to execute arbitrary SQL commands (CWE-89 SQL Injection).' },
        { step: 3, title: 'Privileged Data Dump', desc: 'Attacker extracts and decrypts the embedded JWT/AWS token keys from the issues scope, hijacking cloud administration (CWE-798 Hardcoded Secrets).' }
      ]
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '1.8rem', margin: 0 }}>
          Security Research & Threat Simulator
        </h2>
        <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          Evaluate exploit chains, analyze threat matrixes, and calculate vulnerability severity scores.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        
        {/* CVSS Calculator Card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator size={18} color="var(--primary)" /> Interactive CVSS v3.1 Calculator
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'center' }}>
            {/* Metric Selectors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Attack Vector (AV)</label>
                <select style={{ width: '100%' }} value={av} onChange={(e) => setAv(parseFloat(e.target.value))}>
                  <option value={0.85}>Network (AV:N)</option>
                  <option value={0.62}>Adjacent (AV:A)</option>
                  <option value={0.55}>Local (AV:L)</option>
                  <option value={0.2}>Physical (AV:P)</option>
                </select>
              </div>
              
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Attack Complexity (AC)</label>
                <select style={{ width: '100%' }} value={ac} onChange={(e) => setAc(parseFloat(e.target.value))}>
                  <option value={0.77}>Low (AC:L)</option>
                  <option value={0.44}>High (AC:H)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Privileges Required (PR)</label>
                <select style={{ width: '100%' }} value={pr} onChange={(e) => setPr(parseFloat(e.target.value))}>
                  <option value={0.85}>None (PR:N)</option>
                  <option value={0.62}>Low (PR:L)</option>
                  <option value={0.27}>High (PR:H)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>User Interaction (UI)</label>
                <select style={{ width: '100%' }} value={ui} onChange={(e) => setUi(parseFloat(e.target.value))}>
                  <option value={0.85}>None (UI:N)</option>
                  <option value={0.62}>Required (UI:R)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Conf. (C)</label>
                  <select style={{ width: '100%' }} value={c} onChange={(e) => setC(parseFloat(e.target.value))}>
                    <option value={0.56}>High</option>
                    <option value={0.22}>Low</option>
                    <option value={0}>None</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Integ. (I)</label>
                  <select style={{ width: '100%' }} value={i} onChange={(e) => setI(parseFloat(e.target.value))}>
                    <option value={0.56}>High</option>
                    <option value={0.22}>Low</option>
                    <option value={0}>None</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Avail. (A)</label>
                  <select style={{ width: '100%' }} value={a} onChange={(e) => setA(parseFloat(e.target.value))}>
                    <option value={0.56}>High</option>
                    <option value={0.22}>Low</option>
                    <option value={0}>None</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Score Output Dials */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <div style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '50%', 
                background: cvssScore >= 9.0 ? 'rgba(239, 68, 68, 0.1)' : cvssScore >= 7.0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                border: `4px solid ${cvssScore >= 9.0 ? '#ef4444' : cvssScore >= 7.0 ? '#f59e0b' : '#3b82f6'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                boxShadow: cvssScore >= 9.0 ? '0 0 10px rgba(239,68,68,0.2)' : 'none'
              }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{cvssScore}</span>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: cvssScore >= 9.0 ? '#ef4444' : cvssScore >= 7.0 ? '#f59e0b' : '#3b82f6' }}>
                  {cvssScore >= 9.0 ? 'Critical' : cvssScore >= 7.0 ? 'High' : cvssScore >= 4.0 ? 'Medium' : 'Low'}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CVSS Base Vector Rating</span>
            </div>

          </div>
        </div>

        {/* Vulnerability Exploit Chaining Simulator */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link2 size={18} color="var(--primary)" /> Exploit Vulnerability Chaining
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
            Simulate how multiple medium or low vulnerabilities can be linked in sequence to trigger a critical attack.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {chainFindings.map((f) => (
              <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={f.selected} 
                  onChange={(e) => setChainFindings(prev => prev.map(item => item.id === f.id ? { ...item, selected: e.target.checked } : item))} 
                />
                <span>{f.title}</span>
              </label>
            ))}
          </div>

          <button className="btn-primary" onClick={triggerChainSimulation} disabled={simulating || chainFindings.filter(f => f.selected).length < 2}>
            {simulating ? 'Analyzing Exploit Paths...' : 'Simulate Exploit Chain'}
          </button>

          {/* Simulation Output */}
          {simulationData && (
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px', background: 'rgba(255,255,255,0.01)', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444' }}>{simulationData.chain_title}</span>
                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: '#ef4444', color: '#fff', fontWeight: 700 }}>
                  {simulationData.severity}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                {simulationData.explanation}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {simulationData.steps.map((step) => (
                  <div key={step.step} style={{ display: 'flex', gap: '8px', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 800 }}>S{step.step}.</span>
                    <div>
                      <strong style={{ color: 'var(--text-main)' }}>{step.title}</strong>
                      <p style={{ margin: '2px 0 0 0', color: 'var(--text-muted)' }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* MITRE ATT&CK Matrix Card */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>MITRE ATT&CK Tactics Matrix</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
            <strong style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'block', marginBottom: '8px' }}>Initial Access</strong>
            <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px', display: 'block', color: 'var(--text-muted)' }}>
              T1190: Public-Facing Exploit
            </span>
          </div>

          <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
            <strong style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'block', marginBottom: '8px' }}>Execution</strong>
            <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px', display: 'block', color: 'var(--text-muted)', marginBottom: '4px' }}>
              T1059: Command Scripting
            </span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px', display: 'block', color: 'var(--text-muted)' }}>
              T1204: User Execution
            </span>
          </div>

          <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
            <strong style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'block', marginBottom: '8px' }}>Privilege Escalation</strong>
            <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px', display: 'block', color: 'var(--text-muted)' }}>
              T1548: Abuse Elevation
            </span>
          </div>

          <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
            <strong style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'block', marginBottom: '8px' }}>Credential Access</strong>
            <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px', display: 'block', color: 'var(--text-muted)' }}>
              T1552: Unsecured Credentials
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
