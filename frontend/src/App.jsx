import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import RepoImport from './components/RepoImport';
import ScanDetail from './components/ScanDetail';
import ChatAssistant from './components/ChatAssistant';
import PRReviewer from './components/PRReviewer';
import TeamWorkspace from './components/TeamWorkspace';
import SOCDashboard from './components/SOCDashboard';
import ComplianceCenter from './components/ComplianceCenter';
import CommitIntelligence from './components/CommitIntelligence';
import AdminPanel from './components/AdminPanel';

// Elite Expansion Imports
import SupplyChain from './components/SupplyChain';
import CloudSecurity from './components/CloudSecurity';
import DevSecOps from './components/DevSecOps';
import AiIntelligence from './components/AiIntelligence';
import SecurityResearch from './components/SecurityResearch';
import Collaboration from './components/Collaboration';
import SettingsEnterprise from './components/SettingsEnterprise';
import ExecutiveDashboard from './components/ExecutiveDashboard';

import { 
  Shield, LayoutDashboard, Database, HelpCircle, Code, LogOut, Sun, Moon, 
  Bell, Users, Cpu, ShieldCheck, Activity, Lock, GitCommit, Settings,
  Cloud, Package, Brain, BarChart3, Rocket, MessageSquare, Key
} from 'lucide-react';

const BACKEND_URL = window.location.port === '5173' ? 'http://localhost:5050' : window.location.origin;

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authModal, setAuthModal] = useState(null); // 'login', 'register', or null
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedScanId, setSelectedScanId] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [lightMode, setLightMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Core scan states
  const [stats, setStats] = useState({
    totalRepositories: 0,
    totalScans: 0,
    criticalCount: 0,
    totalIssues: 0,
    averageSecurityScore: 100,
    averageQualityScore: 100,
    averagePerformanceScore: 100
  });
  const [repos, setRepos] = useState([]);
  const [scans, setScans] = useState([]);

  // Mock fallbacks when backend is offline
  const loadMockData = () => {
    const mockRepos = [
      { id: '1', name: 'acme-payment-gateway', url: 'https://github.com/acme/acme-payment-gateway', branch: 'main', last_scan_at: new Date().toISOString() },
      { id: '2', name: 'python-flask-service', url: 'https://github.com/acme/python-flask-service', branch: 'dev', last_scan_at: new Date().toISOString() }
    ];
    const mockScans = [
      { id: 'scan-1', repository_id: '1', status: 'completed', branch: 'main', security_score: 84, quality_score: 90, performance_score: 88, overall_grade: 'A', created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
      { id: 'scan-2', repository_id: '2', status: 'completed', branch: 'dev', security_score: 92, quality_score: 85, performance_score: 90, overall_grade: 'A+', created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() }
    ];
    setRepos(mockRepos);
    setScans(mockScans);
    setStats({
      totalRepositories: 2,
      totalScans: 2,
      criticalCount: 1,
      totalIssues: 3,
      averageSecurityScore: 88,
      averageQualityScore: 87,
      averagePerformanceScore: 89
    });
    setNotifications([
      { id: 'n1', title: 'Welcome to BugHunter AI', message: 'Explore security vulnerability checks by triggering scans.', is_read: 0, created_at: new Date().toISOString() }
    ]);
  };

  useEffect(() => {
    // Check local storage session
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('currentUser');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchDashboardStats();
      fetchNotifications();
    }
  }, [token]);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
        setScans(data.scans);
        setRepos(data.repos);
      } else {
        loadMockData();
      }
    } catch (e) {
      loadMockData();
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data);
      }
    } catch (e) {
      // Mock notifications
    }
  };

  const handleTriggerScan = async (repositoryId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/scans/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ repositoryId })
      });
      if (res.ok) {
        alert('Scan started! The Multi-Agent nodes are auditing the files in the background.');
        // Refresh dashboard stats periodically
        setTimeout(fetchDashboardStats, 2000);
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to trigger scan');
      }
    } catch (e) {
      alert('Mock scan triggered! In standalone mode, scans are simulated.');
      // Simulate running scan in UI
      const mockScanId = `scan-${Date.now().toString().slice(-4)}`;
      const newScan = {
        id: mockScanId,
        repository_id: repositoryId,
        status: 'completed',
        branch: 'main',
        security_score: 95,
        quality_score: 92,
        performance_score: 94,
        overall_grade: 'A+',
        created_at: new Date().toISOString()
      };
      setScans(prev => [newScan, ...prev]);
      setStats(prev => ({ ...prev, totalScans: prev.totalScans + 1 }));
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await fetch(`${BACKEND_URL}/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (e) {
      // Offline fallback
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') })
      });
    } catch (e) {
      // Skip error
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    setToken(null);
    setUser(null);
    setActiveTab('dashboard');
    setSelectedScanId(null);
  };

  const toggleTheme = () => {
    setLightMode(!lightMode);
    document.body.classList.toggle('light-mode');
  };

  const handleOpenChat = (issue) => {
    setSelectedIssue(issue);
    setActiveTab('chat');
  };

  // Login Bypass for immediate showcase
  const enterDemoMode = () => {
    const demoUser = { id: 'demo-id', email: 'demo@bughunter.ai', role: 'Admin' };
    setUser(demoUser);
    setToken('demo-token');
    loadMockData();
  };

  // Nav mapping
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            stats={stats}
            repos={repos}
            scans={scans}
            onTriggerScan={handleTriggerScan}
            onImportRepo={() => setActiveTab('import')}
            onSelectScan={(id) => { setSelectedScanId(id); setActiveTab('scan-detail'); }}
          />
        );
      case 'import':
        return <RepoImport onImport={() => { setActiveTab('dashboard'); fetchDashboardStats(); }} backendUrl={BACKEND_URL} />;
      case 'scan-detail':
        return <ScanDetail scanId={selectedScanId || (scans[0] && scans[0].id) || 'scan-1'} backendUrl={BACKEND_URL} onOpenChat={handleOpenChat} />;
      case 'chat':
        return <ChatAssistant contextIssue={selectedIssue} backendUrl={BACKEND_URL} />;
      case 'pr-reviewer':
        return <PRReviewer />;
      case 'team':
        return <TeamWorkspace backendUrl={BACKEND_URL} currentUser={user} />;
      case 'soc':
        return <SOCDashboard backendUrl={BACKEND_URL} />;
      case 'compliance':
        return <ComplianceCenter backendUrl={BACKEND_URL} scans={scans} />;
      case 'commits':
        return <CommitIntelligence backendUrl={BACKEND_URL} repos={repos} />;
      case 'supply-chain':
        return <SupplyChain backendUrl={BACKEND_URL} scans={scans} />;
      case 'cloud-security':
        return <CloudSecurity backendUrl={BACKEND_URL} />;
      case 'devsecops':
        return <DevSecOps />;
      case 'ai-intelligence':
        return <AiIntelligence />;
      case 'security-research':
        return <SecurityResearch backendUrl={BACKEND_URL} />;
      case 'collaboration':
        return <Collaboration backendUrl={BACKEND_URL} />;
      case 'settings-enterprise':
        return <SettingsEnterprise backendUrl={BACKEND_URL} />;
      case 'executive':
        return <ExecutiveDashboard />;
      case 'admin':
        return <AdminPanel backendUrl={BACKEND_URL} />;
      default:
        return <div>Screen not found</div>;
    }
  };

  if (!token) {
    return (
      <>
        <LandingPage onEnterDemo={enterDemoMode} onOpenAuth={(mode) => setAuthModal(mode)} />
        {authModal && (
          <Auth
            initialMode={authModal}
            backendUrl={BACKEND_URL}
            onClose={() => setAuthModal(null)}
            onAuthSuccess={(u, t) => {
              setUser(u);
              setToken(t);
              setAuthModal(null);
            }}
          />
        )}
      </>
    );
  }

  const unreadAlerts = notifications.filter(n => !n.is_read);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div className="bg-grid-mesh"></div>

      {/* Main Sidebar */}
      <aside className="glass-panel" style={{
        width: '240px',
        height: '100%',
        borderRadius: 0,
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        flexShrink: 0,
        zIndex: 50
      }}>
        {/* Sidebar Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2.5rem', paddingLeft: '8px' }}>
          <Shield color="var(--primary)" size={24} style={{ filter: 'drop-shadow(var(--shadow-glow))' }} />
          <span style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '1.2rem' }}>
            BugHunter <span style={{ color: 'var(--primary)' }}>AI</span>
          </span>
        </div>

        {/* Sidebar links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 240px)' }}>
          <button
            onClick={() => setActiveTab('executive')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '8px 12px', borderRadius: '6px',
              background: activeTab === 'executive' ? 'var(--primary-glow)' : 'transparent',
              border: 'none', color: activeTab === 'executive' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <BarChart3 size={18} /> Executive KPIs
          </button>
          <button
            onClick={() => { setActiveTab('dashboard'); setSelectedIssue(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '8px 12px', borderRadius: '6px',
              background: activeTab === 'dashboard' ? 'var(--primary-glow)' : 'transparent',
              border: 'none', color: activeTab === 'dashboard' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab('import')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '8px 12px', borderRadius: '6px',
              background: activeTab === 'import' ? 'var(--primary-glow)' : 'transparent',
              border: 'none', color: activeTab === 'import' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <Database size={18} /> Connect Repo
          </button>
          <button
            onClick={() => {
              if (scans.length > 0 && !selectedScanId) setSelectedScanId(scans[0].id);
              setActiveTab('scan-detail');
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '8px 12px', borderRadius: '6px',
              background: activeTab === 'scan-detail' ? 'var(--primary-glow)' : 'transparent',
              border: 'none', color: activeTab === 'scan-detail' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <ShieldCheck size={18} /> Code Auditor
          </button>
          <button
            onClick={() => setActiveTab('supply-chain')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '8px 12px', borderRadius: '6px',
              background: activeTab === 'supply-chain' ? 'var(--primary-glow)' : 'transparent',
              border: 'none', color: activeTab === 'supply-chain' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <Package size={18} /> Supply Chain
          </button>
          <button
            onClick={() => setActiveTab('cloud-security')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '8px 12px', borderRadius: '6px',
              background: activeTab === 'cloud-security' ? 'var(--primary-glow)' : 'transparent',
              border: 'none', color: activeTab === 'cloud-security' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <Cloud size={18} /> Cloud Security
          </button>
          <button
            onClick={() => setActiveTab('devsecops')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '8px 12px', borderRadius: '6px',
              background: activeTab === 'devsecops' ? 'var(--primary-glow)' : 'transparent',
              border: 'none', color: activeTab === 'devsecops' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <Rocket size={18} /> DevSecOps
          </button>
          <button
            onClick={() => setActiveTab('soc')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '8px 12px', borderRadius: '6px',
              background: activeTab === 'soc' ? 'var(--primary-glow)' : 'transparent',
              border: 'none', color: activeTab === 'soc' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <Activity size={18} /> SOC Dashboard
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '8px 12px', borderRadius: '6px',
              background: activeTab === 'compliance' ? 'var(--primary-glow)' : 'transparent',
              border: 'none', color: activeTab === 'compliance' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <Lock size={18} /> Compliance Center
          </button>
          <button
            onClick={() => setActiveTab('commits')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '8px 12px', borderRadius: '6px',
              background: activeTab === 'commits' ? 'var(--primary-glow)' : 'transparent',
              border: 'none', color: activeTab === 'commits' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <GitCommit size={18} /> Commit Risk
          </button>
          <button
            onClick={() => setActiveTab('ai-intelligence')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '8px 12px', borderRadius: '6px',
              background: activeTab === 'ai-intelligence' ? 'var(--primary-glow)' : 'transparent',
              border: 'none', color: activeTab === 'ai-intelligence' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <Brain size={18} /> AI Debt Intel
          </button>
          <button
            onClick={() => setActiveTab('security-research')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '8px 12px', borderRadius: '6px',
              background: activeTab === 'security-research' ? 'var(--primary-glow)' : 'transparent',
              border: 'none', color: activeTab === 'security-research' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <HelpCircle size={18} /> Threat Research
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '8px 12px', borderRadius: '6px',
              background: activeTab === 'chat' ? 'var(--primary-glow)' : 'transparent',
              border: 'none', color: activeTab === 'chat' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <Cpu size={18} /> AI Assistant
          </button>
          <button
            onClick={() => setActiveTab('pr-reviewer')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '8px 12px', borderRadius: '6px',
              background: activeTab === 'pr-reviewer' ? 'var(--primary-glow)' : 'transparent',
              border: 'none', color: activeTab === 'pr-reviewer' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <Code size={18} /> PR Reviewer
          </button>
          <button
            onClick={() => setActiveTab('collaboration')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '8px 12px', borderRadius: '6px',
              background: activeTab === 'collaboration' ? 'var(--primary-glow)' : 'transparent',
              border: 'none', color: activeTab === 'collaboration' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <MessageSquare size={18} /> Tickets Board
          </button>
          <button
            onClick={() => setActiveTab('team')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '8px 12px', borderRadius: '6px',
              background: activeTab === 'team' ? 'var(--primary-glow)' : 'transparent',
              border: 'none', color: activeTab === 'team' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <Users size={18} /> Team Workspace
          </button>
          <button
            onClick={() => setActiveTab('settings-enterprise')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '8px 12px', borderRadius: '6px',
              background: activeTab === 'settings-enterprise' ? 'var(--primary-glow)' : 'transparent',
              border: 'none', color: activeTab === 'settings-enterprise' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <Key size={18} /> Settings & Billing
          </button>
          
          {(user?.role === 'Admin' || user?.role === 'Organization Owner') && (
            <button
              onClick={() => setActiveTab('admin')}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '8px 12px', borderRadius: '6px',
                background: activeTab === 'admin' ? 'var(--primary-glow)' : 'transparent',
                border: 'none', color: activeTab === 'admin' ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
              }}
            >
              <Settings size={18} /> Admin Console
            </button>
          )}
        </nav>

        {/* Sidebar Footer Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: '#fff' }}>
              {user.email.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.email}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', justifyContent: 'center' }}>
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%', overflow: 'hidden' }}>
        
        {/* Top Navbar */}
        <header style={{
          height: '64px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '0 2rem',
          gap: '20px',
          flexShrink: 0
        }}>
          {/* Notification Button */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowNotifications(!showNotifications)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Bell size={20} />
              {unreadAlerts.length > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-4px', background: '#ef4444', color: '#fff', fontSize: '0.65rem', padding: '2px 5px', borderRadius: '50%', fontWeight: 700 }}>
                  {unreadAlerts.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="glass-panel" style={{
                position: 'absolute', right: 0, top: '35px', width: '280px', maxHeight: '320px', overflowY: 'auto',
                padding: '12px', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '8px', background: '#131926'
              }}>
                <h4 style={{ fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '4px' }}>Workspace Notifications</h4>
                {notifications.map((n) => (
                  <div key={n.id} style={{ fontSize: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', opacity: n.is_read ? 0.6 : 1 }}>
                    <div style={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                      <span>{n.title}</span>
                      {!n.is_read && <span onClick={() => handleMarkRead(n.id)} style={{ color: 'var(--primary)', cursor: 'pointer' }}>Mark read</span>}
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{n.message}</p>
                  </div>
                ))}
                {notifications.length === 0 && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>No notifications.</div>}
              </div>
            )}
          </div>

          {/* Theme Button */}
          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {lightMode ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </header>

        {/* Content Panel */}
        <main style={{ flexGrow: 1, overflowY: 'auto', padding: '2rem' }}>
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
