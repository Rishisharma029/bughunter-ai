const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.resolve(__dirname, '../bughunter.db');

// Ensure db directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Helper for running queries with promises
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Initialize schema
const initDb = async () => {
  try {
    // 1. Users Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Organizations Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Organization Members Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS organization_members (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 4. Repositories Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS repositories (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        branch TEXT DEFAULT 'main',
        is_private INTEGER DEFAULT 0,
        last_scan_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
      )
    `);

    // 5. Scans Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS scans (
        id TEXT PRIMARY KEY,
        repository_id TEXT NOT NULL,
        status TEXT NOT NULL,
        branch TEXT,
        commit_sha TEXT,
        security_score INTEGER,
        quality_score INTEGER,
        performance_score INTEGER,
        architecture_score INTEGER,
        compliance_score INTEGER,
        overall_grade TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE
      )
    `);

    // 6. Issues Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS issues (
        id TEXT PRIMARY KEY,
        scan_id TEXT NOT NULL,
        file_path TEXT NOT NULL,
        line_number INTEGER,
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        confidence INTEGER DEFAULT 100,
        cwe_id TEXT,
        cvss_score REAL,
        mitre_attack TEXT,
        technical_debt_hours REAL,
        future_bug_probability INTEGER,
        refactor_priority INTEGER,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        explanation TEXT,
        impact TEXT,
        fix_suggestion TEXT,
        improved_code TEXT,
        agent_verdict TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
      )
    `);

    // 7. Notifications Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 8. Audit Logs Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        action TEXT NOT NULL,
        ip_address TEXT,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // 9. Reports Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        scan_id TEXT UNIQUE NOT NULL,
        file_path TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
      )
    `);

    // 10. Scheduled Scans Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS scheduled_scans (
        id TEXT PRIMARY KEY,
        repository_id TEXT UNIQUE NOT NULL,
        cron TEXT NOT NULL,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE
      )
    `);

    // 11. Leaderboard Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS leaderboards (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        bugs_fixed INTEGER DEFAULT 0,
        score INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 12. Repository Dependencies Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS repository_dependencies (
        id TEXT PRIMARY KEY,
        repository_id TEXT NOT NULL,
        name TEXT NOT NULL,
        version TEXT,
        cve_id TEXT,
        severity TEXT,
        cvss_score REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE
      )
    `);

    // 13. Commits Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS commits (
        id TEXT PRIMARY KEY,
        repository_id TEXT NOT NULL,
        sha TEXT NOT NULL,
        message TEXT NOT NULL,
        author TEXT,
        risk_score INTEGER,
        security_regressions INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE
      )
    `);

    // 14. Pull Requests Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS pull_requests (
        id TEXT PRIMARY KEY,
        repository_id TEXT NOT NULL,
        pr_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        author TEXT,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE
      )
    `);

    // 15. Chat Sessions Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 16. Compliance Reports Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS compliance_reports (
        id TEXT PRIMARY KEY,
        scan_id TEXT NOT NULL,
        framework TEXT NOT NULL,
        score INTEGER,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
      )
    `);

    // 17. Security Events Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS security_events (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        event_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        description TEXT,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // 18. Issue Comments Table (Collaboration)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS issue_comments (
        id TEXT PRIMARY KEY,
        issue_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        comment_text TEXT NOT NULL,
        line_number INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 19. Security Tickets Table (Triage Workflow)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS security_tickets (
        id TEXT PRIMARY KEY,
        issue_id TEXT,
        title TEXT NOT NULL,
        assignee_id TEXT,
        status TEXT DEFAULT 'Open',
        priority TEXT DEFAULT 'Medium',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // 20. API Keys Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        token_hash TEXT NOT NULL,
        last_used_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 21. SSO Configurations Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS sso_configurations (
        id TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        entry_point TEXT,
        issuer TEXT,
        cert TEXT,
        active INTEGER DEFAULT 0
      )
    `);

    // 22. Billing Quotas Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS billing_quotas (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        tier TEXT DEFAULT 'Free',
        quota_scans INTEGER DEFAULT 10,
        used_scans INTEGER DEFAULT 0,
        quota_users INTEGER DEFAULT 3,
        billing_cycle_end DATETIME,
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
      )
    `);

    // Seed data
    await seedData();
  } catch (err) {
    console.error('Schema initialization failed:', err);
  }
};

const seedData = async () => {
  const userCount = await dbGet('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    console.log('Seeding default users and organizations...');
    
    // Seed Organization
    const orgId = uuidv4();
    await dbRun('INSERT INTO organizations (id, name) VALUES (?, ?)', [orgId, 'Acme Corp']);

    // Seed Admin
    const adminId = uuidv4();
    const adminPasswordHash = await bcrypt.hash('admin', 10);
    await dbRun(
      'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [adminId, 'admin@bughunter.ai', adminPasswordHash, 'Admin']
    );
    await dbRun(
      'INSERT INTO organization_members (id, organization_id, user_id, role) VALUES (?, ?, ?, ?)',
      [uuidv4(), orgId, adminId, 'Admin']
    );

    // Seed Developer
    const devId = uuidv4();
    const devPasswordHash = await bcrypt.hash('developer', 10);
    await dbRun(
      'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [devId, 'dev@bughunter.ai', devPasswordHash, 'Developer']
    );
    await dbRun(
      'INSERT INTO organization_members (id, organization_id, user_id, role) VALUES (?, ?, ?, ?)',
      [uuidv4(), orgId, devId, 'Developer']
    );

    // Seed Viewer
    const viewerId = uuidv4();
    const viewerPasswordHash = await bcrypt.hash('viewer', 10);
    await dbRun(
      'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [viewerId, 'viewer@bughunter.ai', viewerPasswordHash, 'Viewer']
    );
    await dbRun(
      'INSERT INTO organization_members (id, organization_id, user_id, role) VALUES (?, ?, ?, ?)',
      [uuidv4(), orgId, viewerId, 'Viewer']
    );

    // Seed Organization Owner
    const ownerId = uuidv4();
    const ownerPasswordHash = await bcrypt.hash('owner', 10);
    await dbRun(
      'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [ownerId, 'owner@bughunter.ai', ownerPasswordHash, 'Organization Owner']
    );
    await dbRun(
      'INSERT INTO organization_members (id, organization_id, user_id, role) VALUES (?, ?, ?, ?)',
      [uuidv4(), orgId, ownerId, 'Organization Owner']
    );

    // Seed Security Auditor
    const auditorId = uuidv4();
    const auditorPasswordHash = await bcrypt.hash('auditor', 10);
    await dbRun(
      'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [auditorId, 'auditor@bughunter.ai', auditorPasswordHash, 'Security Auditor']
    );
    await dbRun(
      'INSERT INTO organization_members (id, organization_id, user_id, role) VALUES (?, ?, ?, ?)',
      [uuidv4(), orgId, auditorId, 'Security Auditor']
    );

    // Seed some initial leaderboards
    await dbRun('INSERT INTO leaderboards (id, user_id, bugs_fixed, score) VALUES (?, ?, ?, ?)', [uuidv4(), adminId, 12, 1200]);
    await dbRun('INSERT INTO leaderboards (id, user_id, bugs_fixed, score) VALUES (?, ?, ?, ?)', [uuidv4(), devId, 8, 800]);

    // Seed Billing Quota (Pro/Enterprise tier for Acme Corp)
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    await dbRun(
      'INSERT INTO billing_quotas (id, organization_id, tier, quota_scans, used_scans, quota_users, billing_cycle_end) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), orgId, 'Enterprise', 1000, 142, 50, nextYear.toISOString()]
    );

    // Seed SSO Configs
    await dbRun(
      'INSERT INTO sso_configurations (id, provider, entry_point, issuer, cert, active) VALUES (?, ?, ?, ?, ?, ?)',
      [uuidv4(), 'SAML', 'https://sso.acme.com/adfs/ls', 'bughunter-saml-client', 'MIIE5zCCA8+gAwIBAgIQ...', 1]
    );
    await dbRun(
      'INSERT INTO sso_configurations (id, provider, entry_point, issuer, cert, active) VALUES (?, ?, ?, ?, ?, ?)',
      [uuidv4(), 'LDAP', 'ldap://ldap.acme.com:389/dc=acme,dc=com', 'cn=admin,dc=acme,dc=com', '', 0]
    );

    // Seed programmatic API Key for CI/CD integrations
    const keyPasswordHash = await bcrypt.hash('bh_key_prod_sec_abc123', 10);
    await dbRun(
      'INSERT INTO api_keys (id, user_id, name, token_hash, last_used_at) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), adminId, 'Production CI/CD Actions Key', keyPasswordHash, new Date().toISOString()]
    );

    // Seed some sample Tickets
    await dbRun(
      'INSERT INTO security_tickets (id, issue_id, title, assignee_id, status, priority) VALUES (?, ?, ?, ?, ?, ?)',
      [uuidv4(), 'mock-issue-1', 'Fix hardcoded AWS Access Secret Key in auth service config', devId, 'In Progress', 'Critical']
    );
    await dbRun(
      'INSERT INTO security_tickets (id, issue_id, title, assignee_id, status, priority) VALUES (?, ?, ?, ?, ?, ?)',
      [uuidv4(), 'mock-issue-2', 'Fix SQL injection path in user registrations handler', adminId, 'Open', 'High']
    );

    console.log('Seed data completed successfully.');
  }
};

module.exports = {
  db,
  dbRun,
  dbAll,
  dbGet,
  initDb
};
