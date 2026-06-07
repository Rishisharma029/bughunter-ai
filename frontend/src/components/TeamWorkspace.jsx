import React, { useState, useEffect } from 'react';
import { Users, Trophy, Clock, History, Edit, RefreshCw, Shield, Terminal } from 'lucide-react';

export default function TeamWorkspace({ backendUrl, currentUser }) {
  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  // Scheduled scan state
  const [selectedRepoId, setSelectedRepoId] = useState('');
  const [cronString, setCronString] = useState('0 0 * * *'); // default daily
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    fetchWorkspaceData();
  }, [activeTab]);

  const fetchWorkspaceData = async () => {
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    try {
      if (activeTab === 'members') {
        const res = await fetch(`${backendUrl}/api/team/workspace`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) {
          setOrg(data.org);
          setMembers(data.members);
        }
      } else if (activeTab === 'leaderboard') {
        const res = await fetch(`${backendUrl}/api/gamification/leaderboard`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) setLeaderboard(data);
      } else if (activeTab === 'schedules') {
        const resSchedules = await fetch(`${backendUrl}/api/schedules`, { headers: { 'Authorization': `Bearer ${token}` } });
        const dataSchedules = await resSchedules.json();
        if (resSchedules.ok) setSchedules(dataSchedules);

        const resRepos = await fetch(`${backendUrl}/api/repositories`, { headers: { 'Authorization': `Bearer ${token}` } });
        const dataRepos = await resRepos.json();
        if (resRepos.ok) {
          setRepos(dataRepos);
          if (dataRepos.length > 0) setSelectedRepoId(dataRepos[0].id);
        }
      } else if (activeTab === 'audit') {
        const res = await fetch(`${backendUrl}/api/audit/logs`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) setAuditLogs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${backendUrl}/api/team/member/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ memberId, role: newRole })
      });
      if (res.ok) {
        fetchWorkspaceData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to update role');
      }
    } catch (e) {
      alert('Error updating role');
    }
  };

  const handleConfigureSchedule = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${backendUrl}/api/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ repositoryId: selectedRepoId, cron: cronString })
      });
      if (res.ok) {
        alert('Schedule configured successfully!');
        fetchWorkspaceData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to update schedule');
      }
    } catch (e) {
      alert('Error saving schedule');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', animation: 'fadeInUp 0.3s ease-out', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
      
      {/* Sidebar Navigation */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={() => setActiveTab('members')}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', borderRadius: '6px',
            background: activeTab === 'members' ? 'var(--primary-glow)' : 'transparent',
            border: 'none', color: activeTab === 'members' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
          }}
        >
          <Users size={16} /> Team Members
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', borderRadius: '6px',
            background: activeTab === 'leaderboard' ? 'var(--primary-glow)' : 'transparent',
            border: 'none', color: activeTab === 'leaderboard' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
          }}
        >
          <Trophy size={16} /> Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('schedules')}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', borderRadius: '6px',
            background: activeTab === 'schedules' ? 'var(--primary-glow)' : 'transparent',
            border: 'none', color: activeTab === 'schedules' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
          }}
        >
          <Clock size={16} /> Scan Schedules
        </button>
        {currentUser?.role === 'Admin' && (
          <button
            onClick={() => setActiveTab('audit')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', borderRadius: '6px',
              background: activeTab === 'audit' ? 'var(--primary-glow)' : 'transparent',
              border: 'none', color: activeTab === 'audit' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <History size={16} /> Audit Logs
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="glass-panel" style={{ padding: '28px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
            <RefreshCw className="animate-spin" size={28} color="var(--primary)" />
          </div>
        ) : (
          <>
            {activeTab === 'members' && (
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>Organization Workspace</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>Members of organization <strong>{org?.name || 'Workspace'}</strong></p>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 10px', fontWeight: 600 }}>Email Address</th>
                      <th style={{ padding: '12px 10px', fontWeight: 600 }}>Access Permission Role</th>
                      {currentUser?.role === 'Admin' && <th style={{ padding: '12px 10px', fontWeight: 600, textAlign: 'right' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '14px 10px', fontWeight: 600 }}>{member.email}</td>
                        <td style={{ padding: '14px 10px' }}>
                          <span className={`badge ${member.role === 'Admin' ? 'badge-critical' : member.role === 'Developer' ? 'badge-low' : 'badge-medium'}`}>
                            {member.role}
                          </span>
                        </td>
                        {currentUser?.role === 'Admin' && (
                          <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.id, e.target.value)}
                              style={{ background: '#131926', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff', fontSize: '0.8rem', padding: '4px 8px' }}
                            >
                              <option value="Admin">Admin</option>
                              <option value="Developer">Developer</option>
                              <option value="Viewer">Viewer</option>
                            </select>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>Fixes Score Leaderboard</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>Gamification leaderboard ranking developers by vulnerabilities resolved and security contributions.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {leaderboard.map((item, index) => (
                    <div key={index} className="glass-panel" style={{
                      padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: index === 0 ? 'rgba(16, 185, 129, 0.04)' : 'rgba(255,255,255,0.01)',
                      border: index === 0 ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-color)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: index === 0 ? 'var(--primary)' : 'var(--text-muted)' }}>#{index + 1}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.email}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vulnerabilities Closed: {item.bugs_fixed}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>{item.score} pts</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'schedules' && (
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>Automated Scan Schedulers</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>Configure recurring scans on repositories branch updates.</p>

                {currentUser?.role === 'Admin' ? (
                  <form onSubmit={handleConfigureSchedule} style={{ display: 'flex', gap: '16px', marginBottom: '32px', alignItems: 'flex-end', background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ flex: 1.5 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Target Repository</label>
                      <select
                        value={selectedRepoId}
                        onChange={(e) => setSelectedRepoId(e.target.value)}
                        style={{ width: '100%', background: '#131926', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', color: '#fff', outline: 'none' }}
                      >
                        {repos.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Scan Frequency</label>
                      <select
                        value={cronString}
                        onChange={(e) => setCronString(e.target.value)}
                        style={{ width: '100%', background: '#131926', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', color: '#fff', outline: 'none' }}
                      >
                        <option value="0 0 * * *">Daily (Midnight)</option>
                        <option value="0 0 * * 0">Weekly (Sundays)</option>
                        <option value="0 0 1 * *">Monthly (1st Day)</option>
                      </select>
                    </div>
                    <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>Apply Schedule</button>
                  </form>
                ) : (
                  <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '6px', color: 'var(--severity-high)', fontSize: '0.85rem', marginBottom: '24px' }}>
                    Only Administrators can configure new repository cron schedules.
                  </div>
                )}

                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>Configured Scans</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {schedules.map((sch) => (
                    <div key={sch.id} className="glass-panel" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{sch.repo_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Cron: {sch.cron}</div>
                      </div>
                      <span className="badge badge-low" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Active</span>
                    </div>
                  ))}
                  {schedules.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>No scheduled scans running.</div>}
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>Workspace Security Audit Logs</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>Compliance trail tracking all operations, imports, configurations, and login details.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '450px', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                  {auditLogs.map((log) => (
                    <div key={log.id} style={{ display: 'grid', gridTemplateColumns: '150px 120px 150px 1fr', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', color: '#cbd5e1' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{new Date(log.created_at).toLocaleString()}</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{log.action}</span>
                      <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.email || 'System'}</span>
                      <span>{log.details} [IP: {log.ip_address}]</span>
                    </div>
                  ))}
                  {auditLogs.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>No audit logs found.</div>}
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
