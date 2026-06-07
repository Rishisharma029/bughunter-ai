const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { dbRun, dbAll, dbGet } = require('../db');
const { generateSbom } = require('../engine/eliteScanners');
const fs = require('fs');
const path = require('path');

// --- Collaboration comments CRUD ---
const getIssueComments = async (req, res) => {
  const { issueId } = req.params;
  try {
    const comments = await dbAll(
      `SELECT issue_comments.*, users.email as user_email 
       FROM issue_comments 
       JOIN users ON issue_comments.user_id = users.id 
       WHERE issue_comments.issue_id = ? 
       ORDER BY issue_comments.created_at ASC`,
      [issueId]
    );
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve comments' });
  }
};

const createIssueComment = async (req, res) => {
  const { issueId } = req.params;
  const { commentText, lineNumber } = req.body;
  if (!commentText) {
    return res.status(400).json({ error: 'Comment text is required' });
  }
  try {
    const commentId = uuidv4();
    await dbRun(
      `INSERT INTO issue_comments (id, issue_id, user_id, comment_text, line_number) 
       VALUES (?, ?, ?, ?, ?)`,
      [commentId, issueId, req.user.id, commentText, lineNumber || null]
    );
    const comment = await dbGet(
      `SELECT issue_comments.*, users.email as user_email 
       FROM issue_comments 
       JOIN users ON issue_comments.user_id = users.id 
       WHERE issue_comments.id = ?`,
      [commentId]
    );
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to post comment' });
  }
};

// --- Security Tickets CRUD ---
const getTickets = async (req, res) => {
  try {
    const tickets = await dbAll(
      `SELECT security_tickets.*, users.email as assignee_email, issues.title as issue_title, issues.file_path as issue_file
       FROM security_tickets
       LEFT JOIN users ON security_tickets.assignee_id = users.id
       LEFT JOIN issues ON security_tickets.issue_id = issues.id
       ORDER BY security_tickets.created_at DESC`
    );
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve tickets' });
  }
};

const createTicket = async (req, res) => {
  const { issueId, title, assigneeId, priority } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Ticket title is required' });
  }
  try {
    const ticketId = uuidv4();
    await dbRun(
      `INSERT INTO security_tickets (id, issue_id, title, assignee_id, priority, status) 
       VALUES (?, ?, ?, ?, ?, 'Open')`,
      [ticketId, issueId || null, title, assigneeId || null, priority || 'Medium']
    );
    const ticket = await dbGet(
      `SELECT security_tickets.*, users.email as assignee_email
       FROM security_tickets
       LEFT JOIN users ON security_tickets.assignee_id = users.id
       WHERE security_tickets.id = ?`,
      [ticketId]
    );
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create ticket' });
  }
};

const updateTicket = async (req, res) => {
  const { id } = req.params;
  const { status, priority, assigneeId } = req.body;
  try {
    const ticket = await dbGet('SELECT * FROM security_tickets WHERE id = ?', [id]);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    await dbRun(
      `UPDATE security_tickets 
       SET status = COALESCE(?, status), 
           priority = COALESCE(?, priority), 
           assignee_id = COALESCE(?, assignee_id) 
       WHERE id = ?`,
      [status, priority, assigneeId, id]
    );

    const updated = await dbGet(
      `SELECT security_tickets.*, users.email as assignee_email
       FROM security_tickets
       LEFT JOIN users ON security_tickets.assignee_id = users.id
       WHERE security_tickets.id = ?`,
      [id]
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update ticket' });
  }
};

// --- SSO Configurations API ---
const getSsoConfigs = async (req, res) => {
  try {
    const configs = await dbAll('SELECT * FROM sso_configurations');
    res.json(configs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve SSO configurations' });
  }
};

const updateSsoConfig = async (req, res) => {
  const { provider, entryPoint, issuer, cert, active } = req.body;
  try {
    const config = await dbGet('SELECT * FROM sso_configurations WHERE provider = ?', [provider]);
    if (!config) {
      // Create new
      const id = uuidv4();
      await dbRun(
        'INSERT INTO sso_configurations (id, provider, entry_point, issuer, cert, active) VALUES (?, ?, ?, ?, ?, ?)',
        [id, provider, entryPoint || '', issuer || '', cert || '', active ? 1 : 0]
      );
    } else {
      // Update
      await dbRun(
        'UPDATE sso_configurations SET entry_point = ?, issuer = ?, cert = ?, active = ? WHERE provider = ?',
        [entryPoint || config.entry_point, issuer || config.issuer, cert || config.cert, active !== undefined ? (active ? 1 : 0) : config.active, provider]
      );
    }
    const updated = await dbAll('SELECT * FROM sso_configurations');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update SSO configuration' });
  }
};

// --- API Keys configurations API ---
const getApiKeys = async (req, res) => {
  try {
    const keys = await dbAll(
      'SELECT id, name, last_used_at, created_at FROM api_keys WHERE user_id = ?',
      [req.user.id]
    );
    res.json(keys);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve API keys' });
  }
};

const createApiKey = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Key name is required' });
  }
  try {
    const keyId = uuidv4();
    const rawToken = `bh_key_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const hash = await bcrypt.hash(rawToken, 10);
    
    await dbRun(
      'INSERT INTO api_keys (id, user_id, name, token_hash) VALUES (?, ?, ?, ?)',
      [keyId, req.user.id, name, hash]
    );

    res.status(201).json({
      id: keyId,
      name,
      token: rawToken, // Return raw token once
      created_at: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create API key' });
  }
};

const deleteApiKey = async (req, res) => {
  const { id } = req.params;
  try {
    await dbRun('DELETE FROM api_keys WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ message: 'API Key revoked successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete API key' });
  }
};

// --- Billing quotas configurations API ---
const getBillingQuotas = async (req, res) => {
  try {
    // Get organization of current user
    const member = await dbGet('SELECT organization_id FROM organization_members WHERE user_id = ?', [req.user.id]);
    if (!member) {
      return res.status(404).json({ error: 'No organization workspace found' });
    }
    const billing = await dbGet('SELECT * FROM billing_quotas WHERE organization_id = ?', [member.organization_id]);
    if (!billing) {
      // Return default free
      return res.json({ tier: 'Free', quota_scans: 10, used_scans: 2, quota_users: 3 });
    }
    res.json(billing);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve billing quota' });
  }
};

const upgradeBillingTier = async (req, res) => {
  const { tier } = req.body;
  if (!['Pro', 'Enterprise'].includes(tier)) {
    return res.status(400).json({ error: 'Invalid tier specified' });
  }
  try {
    const member = await dbGet('SELECT organization_id FROM organization_members WHERE user_id = ?', [req.user.id]);
    if (!member) {
      return res.status(404).json({ error: 'No organization workspace found' });
    }

    const quotaScans = tier === 'Pro' ? 100 : 1000;
    const quotaUsers = tier === 'Pro' ? 10 : 50;
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    await dbRun(
      `INSERT INTO billing_quotas (id, organization_id, tier, quota_scans, used_scans, quota_users, billing_cycle_end) 
       VALUES (?, ?, ?, ?, ?, ?, ?) 
       ON CONFLICT(organization_id) DO UPDATE SET 
         tier = excluded.tier, 
         quota_scans = excluded.quota_scans, 
         quota_users = excluded.quota_users, 
         billing_cycle_end = excluded.billing_cycle_end`,
      [uuidv4(), member.organization_id, tier, quotaScans, 0, quotaUsers, nextYear.toISOString()]
    );

    const updated = await dbGet('SELECT * FROM billing_quotas WHERE organization_id = ?', [member.organization_id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to upgrade subscription' });
  }
};

// --- SBOM Exporter Endpoint ---
const exportScanSbom = async (req, res) => {
  const { scanId } = req.params;
  try {
    const scan = await dbGet(
      `SELECT scans.*, repositories.name as repo_name 
       FROM scans 
       JOIN repositories ON scans.repository_id = repositories.id 
       WHERE scans.id = ?`,
      [scanId]
    );
    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }
    const issues = await dbAll('SELECT * FROM issues WHERE scan_id = ?', [scanId]);

    // Construct mock files context to parse SBOM from package.json if present
    const sbom = generateSbom(scanId, scan.repo_name, issues, []);
    res.json(sbom);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export SBOM' });
  }
};

// --- Vulnerability Chaining Simulator ---
const simulateVulnerabilityChain = async (req, res) => {
  const { findings } = req.body;
  if (!findings || !Array.isArray(findings)) {
    return res.status(400).json({ error: 'A list of scan issues is required to compute chaining' });
  }

  // Construct a logical attack tree chain
  let chainTitle = 'No exploitable chains detected.';
  let explanation = 'The findings present no obvious horizontal privilege escalations or remote triggers.';
  let severity = 'Low';
  let steps = [];

  const hasSecret = findings.some(f => f.title.toLowerCase().includes('secret') || f.title.toLowerCase().includes('key'));
  const hasSql = findings.some(f => f.title.toLowerCase().includes('sql') || f.title.toLowerCase().includes('injection'));
  const hasInsecureSG = findings.some(f => f.title.toLowerCase().includes('security group') || f.title.toLowerCase().includes('0.0.0.0/0'));
  const hasPrivileged = findings.some(f => f.title.toLowerCase().includes('privileged') || f.title.toLowerCase().includes('docker'));

  if (hasInsecureSG && hasSecret && hasSql) {
    chainTitle = 'Public Host Discovery ➔ DB Injection ➔ Admin Secret Exfiltration Chain';
    severity = 'Critical';
    explanation = 'An attacker scanning open ports discovers public-facing servers due to open Ingress CIDRs. They leverage SQL injection in your dynamic select query to dump the database and extract the hardcoded JWT secret/AWS API keys, gaining full tenant administrative privileges.';
    steps = [
      { step: 1, title: 'Network Access', desc: 'Attacker probes your internet-facing VM (CWE-200, Ingress SG open).' },
      { step: 2, title: 'Database Injection', desc: 'Attacker leverages dynamic SELECT string concatenation to execute arbitrary SQL commands (CWE-89 SQL Injection).' },
      { step: 3, title: 'Privileged Data Dump', desc: 'Attacker extracts and decrypts the embedded JWT/AWS token keys from the issues scope, hijacking cloud administration (CWE-798 Hardcoded Secrets).' }
    ];
  } else if (hasSecret && hasPrivileged) {
    chainTitle = 'Container Privilege Escalation via Hardcoded Env Secret';
    severity = 'High';
    explanation = 'Processes inside your container running as root or privileged bypass normal VM boundaries. An attacker exploiting an application bug reads the plaintext env secrets inside the container space, mounting administrative controls over Kubernetes resources.';
    steps = [
      { step: 1, title: 'Container Intrusion', desc: 'Attacker exploits container process running with root system contexts (CWE-250).' },
      { step: 2, title: 'Secret Retrieval', desc: 'Attacker inspects environmental layers, fetching keys loaded in plaintext (CWE-798).' }
    ];
  } else if (findings.length > 1) {
    chainTitle = 'General Multi-Flaw Attack Vector';
    severity = 'Medium';
    explanation = 'Compounding software quality defects (unreachable code, weak division errors) allows attackers to trigger denial-of-service loops and exploit minor error handling leaks.';
    steps = [
      { step: 1, title: 'Logic Fault Trigger', desc: 'Attacker sends input causing division by zero or loop hangs (CWE-369).' },
      { step: 2, title: 'Information Disclosure', desc: 'Swallowed exceptions write details to client, revealing software frameworks.' }
    ];
  }

  res.json({
    chain_title: chainTitle,
    severity,
    explanation,
    steps
  });
};

module.exports = {
  getIssueComments,
  createIssueComment,
  getTickets,
  createTicket,
  updateTicket,
  getSsoConfigs,
  updateSsoConfig,
  getApiKeys,
  createApiKey,
  deleteApiKey,
  getBillingQuotas,
  upgradeBillingTier,
  exportScanSbom,
  simulateVulnerabilityChain
};
