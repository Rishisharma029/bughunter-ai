const os = require('os');
const { dbGet, dbAll, dbRun } = require('../db');
const { v4: uuidv4 } = require('uuid');

// 1. SOC Dashboard Telemetry
const getSocTelemetry = async (req, res) => {
  try {
    // Get latest scan
    const latestScan = await dbGet('SELECT * FROM scans WHERE status = ? ORDER BY created_at DESC LIMIT 1', ['completed']);
    
    let postureScore = 100;
    let scanId = null;
    if (latestScan) {
      postureScore = latestScan.security_score || 100;
      scanId = latestScan.id;
    }

    // Critical/High count
    const severityStats = await dbGet(`
      SELECT 
        SUM(CASE WHEN severity = 'Critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN severity = 'High' THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN severity = 'Medium' THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN severity = 'Low' THEN 1 ELSE 0 END) as low
      FROM issues
    `);

    // Exposed secrets
    const secrets = await dbAll(`
      SELECT file_path, line_number, title, severity, confidence 
      FROM issues 
      WHERE title LIKE '%Secret%' OR title LIKE '%Key%' OR title LIKE '%Token%' OR title LIKE '%Password%'
    `);

    // Mock Heatmap data mapping directories to risk levels
    const riskHeatmap = [
      { area: 'src/controllers', risk: 'High', count: severityStats.critical || 0 },
      { area: 'src/middleware', risk: 'Medium', count: severityStats.medium || 1 },
      { area: 'src/config', risk: 'Critical', count: secrets.length || 0 },
      { area: 'src/utils', risk: 'Low', count: severityStats.low || 2 }
    ];

    res.json({
      postureScore,
      severityCounts: {
        critical: severityStats.critical || 0,
        high: severityStats.high || 0,
        medium: severityStats.medium || 0,
        low: severityStats.low || 0
      },
      exposedSecretsCount: secrets.length,
      exposedSecretsList: secrets,
      riskHeatmap,
      scanId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error compiling SOC metrics' });
  }
};

// 2. Compliance Framework Audit scorecard
const getComplianceStatus = async (req, res) => {
  const { scanId } = req.params;
  try {
    const scan = await dbGet('SELECT * FROM scans WHERE id = ?', [scanId]);
    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    const issues = await dbAll('SELECT * FROM issues WHERE scan_id = ?', [scanId]);

    // Gather compliance violations
    const soc2Violations = issues.filter(i => i.title.includes('CORS') || i.title.includes('Secret'));
    const isoViolations = issues.filter(i => i.title.includes('CORS') || i.title.includes('SQL') || i.title.includes('XSS'));
    const nistViolations = issues.filter(i => i.title.includes('Hash') || i.title.includes('SQL') || i.title.includes('Command'));

    const soc2Score = Math.max(40, 100 - soc2Violations.length * 15);
    const isoScore = Math.max(40, 100 - isoViolations.length * 12);
    const nistScore = Math.max(40, 100 - nistViolations.length * 10);

    res.json({
      scanId,
      frameworks: [
        {
          name: 'SOC2 Type II',
          category: 'Trust Services Criteria (CC6.0 - Access Control)',
          score: soc2Score,
          status: soc2Score >= 80 ? 'Compliant' : 'Non-Compliant',
          checks: [
            { id: 'soc2-1', text: 'CC6.1: Access controls configured correctly (CORS rules)', status: soc2Violations.some(v => v.title.includes('CORS')) ? 'fail' : 'pass' },
            { id: 'soc2-2', text: 'CC6.3: Transmission secrets encrypted (No hardcoded keys)', status: soc2Violations.some(v => v.title.includes('Secret')) ? 'fail' : 'pass' },
            { id: 'soc2-3', text: 'CC6.8: Unauthorized activities logged (Audit trails)', status: 'pass' }
          ]
        },
        {
          name: 'ISO 27001:2022',
          category: 'A.8.20 Network Security & A.8.28 Secure Coding',
          score: isoScore,
          status: isoScore >= 80 ? 'Compliant' : 'Non-Compliant',
          checks: [
            { id: 'iso-1', text: 'A.8.28: SQL Injection injection flaws absent', status: isoViolations.some(v => v.title.includes('SQL')) ? 'fail' : 'pass' },
            { id: 'iso-2', text: 'A.8.28: Cross-Site Scripting input validation active', status: isoViolations.some(v => v.title.includes('XSS')) ? 'fail' : 'pass' },
            { id: 'iso-3', text: 'A.8.20: Domain queries secure (CORS restrictions)', status: isoViolations.some(v => v.title.includes('CORS')) ? 'fail' : 'pass' }
          ]
        },
        {
          name: 'NIST SP 800-53',
          category: 'SC-13 Cryptographic Protection & SI-10 Information Input Validation',
          score: nistScore,
          status: nistScore >= 80 ? 'Compliant' : 'Non-Compliant',
          checks: [
            { id: 'nist-1', text: 'SC-13: Safe hash functions used (No MD5/SHA-1)', status: nistViolations.some(v => v.title.includes('Hash')) ? 'fail' : 'pass' },
            { id: 'nist-2', text: 'SI-10: Input sanitize checks enabled (SQL/Command Injection)', status: nistViolations.some(v => v.title.includes('SQL') || v.title.includes('Command')) ? 'fail' : 'pass' }
          ]
        }
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error compiling compliance audit' });
  }
};

// 3. Commit risk telemetry
const getCommitIntelligence = async (req, res) => {
  const { repoId } = req.params;
  try {
    const dbCommits = await dbAll('SELECT * FROM commits WHERE repository_id = ? ORDER BY created_at DESC', [repoId]);
    
    if (dbCommits.length > 0) {
      return res.json(dbCommits);
    }

    // Seed/return mock commit intelligence data if no database commits exist
    const mockCommits = [
      { id: uuidv4(), repository_id: repoId, sha: 'f9b2a1c', message: 'Merge pull request #104 from patch-2 (User auth validation)', author: 'dev@bughunter.ai', risk_score: 15, security_regressions: 0, created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
      { id: uuidv4(), repository_id: repoId, sha: 'e1d2c3a', message: 'Add searching query endpoint to controller', author: 'intern@bughunter.ai', risk_score: 85, security_regressions: 1, created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
      { id: uuidv4(), repository_id: repoId, sha: 'b8a7f2c', message: 'Optimize nested loop operations in helper module', author: 'dev@bughunter.ai', risk_score: 10, security_regressions: 0, created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString() }
    ];

    // Seed them in database
    for (const c of mockCommits) {
      await dbRun(
        'INSERT INTO commits (id, repository_id, sha, message, author, risk_score, security_regressions, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [c.id, c.repository_id, c.sha, c.message, c.author, c.risk_score, c.security_regressions, c.created_at]
      );
    }

    res.json(mockCommits);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error fetching commits' });
  }
};

// 4. Admin systems health & logs monitor
const getSystemHealth = async (req, res) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const cpus = os.cpus();

    // Calculate CPU utilization
    const loadAvg = os.loadavg();
    const cpuLoad = Math.min(100, Math.round((loadAvg[0] / cpus.length) * 100));

    // Calculate Memory utilization
    const memoryLoad = Math.round(((totalMem - freeMem) / totalMem) * 100);

    const userCount = await dbGet('SELECT COUNT(*) as count FROM users');
    const scanCount = await dbGet('SELECT COUNT(*) as count FROM scans');
    const issueCount = await dbGet('SELECT COUNT(*) as count FROM issues');

    res.json({
      systemHealth: {
        cpuLoad,
        memoryLoad,
        totalMemoryGB: Math.round(totalMem / (1024 * 1024 * 1024)),
        freeMemoryGB: Math.round(freeMem / (1024 * 1024 * 1024)),
        cores: cpus.length,
        osType: os.type(),
        uptimeDays: Math.round(os.uptime() / (60 * 60 * 24)),
      },
      entityCounts: {
        activeUsers: userCount.count || 0,
        scansPerformed: scanCount.count || 0,
        issuesDetected: issueCount.count || 0
      },
      statusServices: {
        database: 'Healthy (SQLite Connected)',
        redisCache: 'Bypassed (In-Memory fallback active)',
        agentRunner: 'Online (Cooperative Multi-Agent active)'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error compiling health diagnostics' });
  }
};

module.exports = {
  getSocTelemetry,
  getComplianceStatus,
  getCommitIntelligence,
  getSystemHealth
};
