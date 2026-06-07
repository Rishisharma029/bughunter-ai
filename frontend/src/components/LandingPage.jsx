import React, { useState } from 'react';
import { Shield, Cpu, RefreshCw, Layers, Award, Users, ChevronDown, Check, Star, ArrowRight } from 'lucide-react';

export default function LandingPage({ onEnterDemo, onOpenAuth }) {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    { q: "What programming languages does BugHunter AI support?", a: "BugHunter AI supports JavaScript, TypeScript, Python, Go, Java, C, C++, and C#. Our parser automatically detects the language and applies appropriate analysis rules." },
    { q: "How does the Multi-Agent AI System work?", a: "We orchestrate five specialized agents: Hunter (finds logic/quality issues), Security (vulnerabilities), Performance (bottlenecks), Skeptic (cross-examines and filters false positives), and Judge (determines final ratings and scores). Only verified issues make it to the report." },
    { q: "Can I connect my private repositories securely?", a: "Yes. BugHunter AI integrates with GitHub OAuth. All analyses are run locally or inside sandboxed instances, and code is never used to train public LLM models." },
    { q: "Is there a local-only mode?", a: "Yes! BugHunter AI has a local rule-based static engine that works out-of-the-box without requiring external LLM API configurations or credentials." }
  ];

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="bg-grid-mesh"></div>

      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield color="var(--primary)" size={28} style={{ filter: 'drop-shadow(var(--shadow-glow))' }} />
          <span style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '1.4rem', tracking: '-0.05em' }}>
            BugHunter <span style={{ color: 'var(--primary)' }}>AI</span>
          </span>
        </div>
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Features</a>
          <a href="#pricing" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Pricing</a>
          <a href="#faq" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>FAQ</a>
          <button onClick={() => onOpenAuth('login')} className="btn-secondary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>Sign In</button>
          <button onClick={onEnterDemo} className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>View Demo</button>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '6rem 2rem 4rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--primary-glow)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          padding: '4px 12px',
          borderRadius: '9999px',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--primary)',
          marginBottom: '2rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <Award size={14} /> Built for Modern Development Teams
        </div>
        
        <h1 style={{
          fontFamily: 'var(--font-title)',
          fontSize: '3.8rem',
          lineHeight: '1.1',
          maxWidth: '800px',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          marginBottom: '1.5rem',
          background: 'linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Find Bugs Before <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hackers Do</span>
        </h1>
        
        <p style={{
          fontSize: '1.25rem',
          color: 'var(--text-muted)',
          maxWidth: '650px',
          marginBottom: '2.5rem',
          fontWeight: 400
        }}>
          AI-powered repository intelligence, vulnerability detection, and code reviews verified by a consensus of specialized agents.
        </p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => onOpenAuth('register')} className="btn-primary" style={{ padding: '0.9rem 2.2rem', fontSize: '1rem' }}>
            Start Free Scan <ArrowRight size={18} />
          </button>
          <button onClick={onEnterDemo} className="btn-secondary" style={{ padding: '0.9rem 2.2rem', fontSize: '1rem' }}>
            Explore Live Demo
          </button>
        </div>

        {/* Hero Dashboard Preview Mock */}
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '1000px',
          height: '420px',
          marginTop: '5rem',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          textAlign: 'left'
        }}>
          {/* Header Bar */}
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>dashboard.bughunter.ai</div>
            <div style={{ width: '36px' }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '24px', width: '100%', height: '100%' }}>
            {/* Left Nav Simulation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderRight: '1px solid var(--border-color)', paddingRight: '16px' }}>
              <div style={{ height: '32px', background: 'var(--border-color)', borderRadius: '6px', width: '90%' }}></div>
              <div style={{ height: '32px', background: 'transparent', borderRadius: '6px', width: '80%' }}></div>
              <div style={{ height: '32px', background: 'transparent', borderRadius: '6px', width: '85%' }}></div>
              <div style={{ height: '32px', background: 'transparent', borderRadius: '6px', width: '70%' }}></div>
            </div>
            {/* Main Stats Simulation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Security Grade</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>A+</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vulnerabilities</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ef4444' }}>02</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bugs Fixed</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>143</div>
                </div>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16,185,129,0.1)', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Shield color="var(--primary)" size={24} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Audit Verdict: Secure</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Skeptic Agent verified. No critical path overrides detected.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 2rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem', fontFamily: 'var(--font-title)' }}>
          Enterprise Grade Code Intelligence
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <Shield size={40} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>OWASP & Vulnerability Auditor</h3>
            <p style={{ color: 'var(--text-muted)' }}>Scans your directory for SQL Injection, Cross-Site Scripting, Command Injection, path traversal, and CSRF holes with remediation examples.</p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <Cpu size={40} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>Multi-Agent AI Orchestrator</h3>
            <p style={{ color: 'var(--text-muted)' }}>Leverages specialized agents (Hunter, Security, Performance, Skeptic, Judge) working in consensus to minimize false positives and deliver high-confidence reports.</p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <Layers size={40} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>CVE & Package Intelligence</h3>
            <p style={{ color: 'var(--text-muted)' }}>Inspects manifest files (like package.json, requirements.txt) to identify outdated dependencies, exposed API keys, and known CVE exposures.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 2rem', borderTop: '1px solid var(--border-color)' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '1rem', fontFamily: 'var(--font-title)' }}>Transparent, Predictable Pricing</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '4rem' }}>Plans that scale with your engineering team sizes.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Plan 1 */}
          <div className="glass-panel" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Free</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>$0</div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Perfect for individual researchers and open-source contributors.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '3rem' }}>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color="var(--primary)" /> Public Repositories</li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color="var(--primary)" /> Local Rules Scanner</li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color="var(--primary)" /> 3 Repo Scans / month</li>
            </ul>
            <button onClick={() => onOpenAuth('register')} className="btn-secondary" style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}>Get Started</button>
          </div>

          {/* Plan 2 */}
          <div className="glass-panel" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', border: '2px solid var(--primary)' }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--primary-gradient)',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: '9999px',
              textTransform: 'uppercase'
            }}>Most Popular</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Pro</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>$49 <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ mo</span></div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>For growing startups looking to automate repository checks.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '3rem' }}>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color="var(--primary)" /> Unlimited Repositories</li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color="var(--primary)" /> Private Repo Support</li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color="var(--primary)" /> Multi-Agent AI System</li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color="var(--primary)" /> PDF Report Downloads</li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color="var(--primary)" /> Slack & Discord Alerts</li>
            </ul>
            <button onClick={() => onOpenAuth('register')} className="btn-primary" style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}>Upgrade to Pro</button>
          </div>

          {/* Plan 3 */}
          <div className="glass-panel" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Enterprise</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Custom</div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>For large compliance and software security organizations.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '3rem' }}>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color="var(--primary)" /> Custom SSO / SAML</li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color="var(--primary)" /> Dedicated Scan Runners</li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color="var(--primary)" /> Custom LLM Integrations</li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color="var(--primary)" /> 24/7 Priority Support</li>
            </ul>
            <button onClick={() => onOpenAuth('register')} className="btn-secondary" style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}>Contact Sales</button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ maxWidth: '800px', margin: '0 auto', padding: '6rem 2rem', borderTop: '1px solid var(--border-color)' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem', fontFamily: 'var(--font-title)' }}>Frequently Asked Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((faq, index) => (
            <div key={index} className="glass-panel" style={{ padding: '1.25rem', cursor: 'pointer' }} onClick={() => toggleFaq(index)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{faq.q}</h3>
                <ChevronDown size={20} style={{ transform: activeFaq === index ? 'rotate(180deg)' : 'none', transition: 'transform var(--transition-fast)' }} />
              </div>
              {activeFaq === index && (
                <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '3rem 2rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.9rem'
      }}>
        <p>© 2026 BugHunter AI. All rights reserved. Built for security-first development teams.</p>
      </footer>
    </div>
  );
}
