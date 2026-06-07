import React, { useState } from 'react';
import { Folder, Upload, Link2, ShieldAlert, Loader } from 'lucide-react';

const Github = ({ size = 24, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function RepoImport({ onImport, backendUrl }) {
  const [activeTab, setActiveTab] = useState('url');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [isPrivate, setIsPrivate] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock GitHub Repository List
  const mockGithubRepos = [
    { name: 'acme-web-portal', url: 'https://github.com/acme/acme-web-portal', isPrivate: true },
    { name: 'python-security-sdk', url: 'https://github.com/acme/python-security-sdk', isPrivate: false },
    { name: 'node-microservice-api', url: 'https://github.com/acme/node-microservice-api', isPrivate: true }
  ];

  const handleConnectGithub = () => {
    setLoading(true);
    setTimeout(() => {
      setGithubConnected(true);
      setLoading(false);
    }, 1200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !url) {
      setError('Please provide a name and repository location/URL.');
      return;
    }

    setLoading(true);
    setError(null);

    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${backendUrl}/api/repositories/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, url, branch, isPrivate })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      onImport();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImportMockRepo = async (repo) => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${backendUrl}/api/repositories/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: repo.name, url: repo.url, branch: 'main', isPrivate: repo.isPrivate })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      onImport();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '650px', margin: '0 auto', animation: 'fadeInUp 0.3s ease-out' }}>
      <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)', fontWeight: 800, marginBottom: '0.5rem' }}>Import Repository</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Connect a code source to execute AI security scans and generate audits.</p>

      {error && (
        <div style={{
          background: 'var(--severity-critical-bg)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: 'var(--severity-critical)',
          padding: '10px 14px',
          borderRadius: '6px',
          fontSize: '0.85rem',
          marginBottom: '1.5rem'
        }}>
          {error}
        </div>
      )}

      {/* TABS Navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('url')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'url' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'url' ? 'var(--text-main)' : 'var(--text-muted)',
            padding: '10px 16px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          <Link2 size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Repository URL / Path
        </button>
        <button
          onClick={() => setActiveTab('github')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'github' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'github' ? 'var(--text-main)' : 'var(--text-muted)',
            padding: '10px 16px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          <Github size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> GitHub OAuth
        </button>
      </div>

      {activeTab === 'url' && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>Repository / App Name</label>
            <input
              type="text"
              placeholder="e.g. bughunter-api-service"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '10px 12px',
                color: '#fff',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>Repository Path or Git URL</label>
            <input
              type="text"
              placeholder="e.g. C:/Projects/bughunter-ai or https://github.com/user/project"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '10px 12px',
                color: '#fff',
                outline: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem'
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              For testing, you can input a local path on your machine, or paste any public repository URL.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>Scan Branch</label>
              <input
                type="text"
                placeholder="main"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  color: '#fff',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                Private Repository
              </label>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center', marginTop: '10px', padding: '12px' }}>
            {loading ? <Loader className="animate-spin" size={20} /> : 'Import & Configure Scanner'}
          </button>
        </form>
      )}

      {activeTab === 'github' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          {!githubConnected ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <Github size={48} style={{ color: 'var(--text-main)', opacity: 0.8 }} />
              <p style={{ color: 'var(--text-muted)', maxWidth: '400px', fontSize: '0.9rem' }}>
                Connect your GitHub account via OAuth to import your public and private repositories automatically.
              </p>
              <button onClick={handleConnectGithub} className="btn-primary" disabled={loading}>
                {loading ? <Loader className="animate-spin" size={18} /> : (
                  <>
                    <Github size={18} /> Connect GitHub Account
                  </>
                )}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'left', animation: 'fadeInUp 0.3s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>✔ Connected as @acme-developer</span>
                <button onClick={() => setGithubConnected(false)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer' }}>Disconnect</button>
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>Select Repository to Import:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {mockGithubRepos.map((repo, idx) => (
                  <div key={idx} className="glass-panel" style={{
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.01)'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{repo.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{repo.url}</div>
                    </div>
                    <button
                      onClick={() => handleImportMockRepo(repo)}
                      disabled={loading}
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px' }}
                    >
                      Import
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
