const { v4: uuidv4 } = require('uuid');
const { dbRun, dbAll, dbGet } = require('../db');

// Team & Workspace APIs
const getOrgDetails = async (req, res) => {
  try {
    const org = await dbGet('SELECT * FROM organizations LIMIT 1');
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const members = await dbAll(`
      SELECT users.id, users.email, organization_members.role 
      FROM organization_members
      JOIN users ON organization_members.user_id = users.id
      WHERE organization_members.organization_id = ?
    `, [org.id]);

    res.json({ org, members });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateMemberRole = async (req, res) => {
  const { memberId, role } = req.body;

  if (!memberId || !role) {
    return res.status(400).json({ error: 'Member ID and Role are required' });
  }

  try {
    await dbRun('UPDATE users SET role = ? WHERE id = ?', [role, memberId]);
    await dbRun('UPDATE organization_members SET role = ? WHERE user_id = ?', [role, memberId]);

    // Audit log
    await dbRun(
      'INSERT INTO audit_logs (id, user_id, action, ip_address, details) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), req.user.id, 'ROLE_UPDATED', req.ip, `Updated user ${memberId} role to ${role}`]
    );

    res.json({ message: 'Role updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Leaderboard APIs
const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await dbAll(`
      SELECT users.email, leaderboards.bugs_fixed, leaderboards.score 
      FROM leaderboards
      JOIN users ON leaderboards.user_id = users.id
      ORDER BY leaderboards.score DESC
    `);
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Notifications APIs
const getNotifications = async (req, res) => {
  try {
    const alerts = await dbAll('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const markNotificationRead = async (req, res) => {
  const { id } = req.params;
  try {
    await dbRun('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Schedulers APIs
const getSchedules = async (req, res) => {
  try {
    const schedules = await dbAll(`
      SELECT scheduled_scans.*, repositories.name as repo_name 
      FROM scheduled_scans
      JOIN repositories ON scheduled_scans.repository_id = repositories.id
    `);
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createSchedule = async (req, res) => {
  const { repositoryId, cron } = req.body;

  if (!repositoryId || !cron) {
    return res.status(400).json({ error: 'Repository ID and Cron are required' });
  }

  try {
    const scheduleId = uuidv4();
    await dbRun(
      'INSERT INTO scheduled_scans (id, repository_id, cron, active) VALUES (?, ?, ?, 1) ON CONFLICT(repository_id) DO UPDATE SET cron = ?',
      [scheduleId, repositoryId, cron, cron]
    );

    res.json({ message: 'Schedule configured successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Audit logs API
const getAuditLogs = async (req, res) => {
  try {
    const logs = await dbAll(`
      SELECT audit_logs.*, users.email 
      FROM audit_logs
      LEFT JOIN users ON audit_logs.user_id = users.id
      ORDER BY audit_logs.created_at DESC
      LIMIT 100
    `);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getOrgDetails,
  updateMemberRole,
  getLeaderboard,
  getNotifications,
  markNotificationRead,
  getSchedules,
  createSchedule,
  getAuditLogs
};
