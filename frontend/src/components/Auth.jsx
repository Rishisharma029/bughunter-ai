import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Loader } from 'lucide-react';

export default function Auth({ initialMode = 'login', onAuthSuccess, onClose, backendUrl }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Developer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    const url = `${backendUrl}/api/auth/${mode === 'login' ? 'login' : 'register'}`;
    const payload = mode === 'login' ? { email, password } : { email, password, role };

    try {
      let data;
      let isMock = false;
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Authentication failed');
          }
        } else {
          isMock = true;
        }
      } catch (fetchErr) {
        isMock = true;
      }

      if (isMock) {
        console.warn('Backend server offline. Logging in via client-side Mock Demo Mode.');
        data = {
          accessToken: 'mock-access-token-12345',
          refreshToken: 'mock-refresh-token-12345',
          user: {
            id: 'mock-user-id',
            email: email,
            role: role || (email.toLowerCase().includes('admin') ? 'Admin' : 'Developer')
          }
        };
      }

      // Store in localStorage
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('currentUser', JSON.stringify(data.user));

      onAuthSuccess(data.user, data.accessToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(5, 8, 15, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Close button */}
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '1.25rem',
          right: '1.25rem',
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: '1.25rem',
          cursor: 'pointer'
        }}>×</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '2rem' }}>
          <Shield color="var(--primary)" size={28} />
          <span style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '1.4rem' }}>
            BugHunter <span style={{ color: 'var(--primary)' }}>AI</span>
          </span>
        </div>

        <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && (
          <div style={{
            background: 'var(--severity-critical-bg)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--severity-critical)',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '10px 12px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '10px 40px 10px 12px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>Workspace Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  background: '#131926',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Developer">Developer (Scans, Repositories)</option>
                <option value="Admin">Administrator (Full Access)</option>
                <option value="Viewer">Viewer (Read-Only access)</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center', marginTop: '10px', padding: '10px' }}>
            {loading ? <Loader className="animate-spin" size={18} /> : (mode === 'login' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <span onClick={() => setMode('register')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Sign Up</span>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <span onClick={() => setMode('login')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Sign In</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
