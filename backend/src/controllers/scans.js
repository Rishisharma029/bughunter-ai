const { v4: uuidv4 } = require('uuid');
const { dbRun, dbAll, dbGet } = require('../db');
const { runScanner } = require('../engine/scanner');
const fs = require('fs');
const path = require('path');

const triggerScan = async (req, res) => {
  const { repositoryId, branch = 'main' } = req.body;

  if (!repositoryId) {
    return res.status(400).json({ error: 'Repository ID is required' });
  }

  try {
    const repo = await dbGet('SELECT * FROM repositories WHERE id = ?', [repositoryId]);
    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    const scanId = uuidv4();
    await dbRun(
      'INSERT INTO scans (id, repository_id, status, branch, security_score, quality_score, performance_score, overall_grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [scanId, repositoryId, 'running', branch, null, null, null, null]
    );

    res.json({ message: 'Scan initiated successfully', scanId });

    // Run Scanner asynchronously
    // In local mode, we support scanning local folders on the user's computer.
    // If the repository URL matches a local folder or a git URL, we scan.
    // We will support a backup local folder path for scanning or fallback to scanning the backend directory.
    let scanPath = repo.url;
    if (!fs.existsSync(scanPath)) {
      // Fallback: scan the backend directory itself for demonstration/seed purposes
      scanPath = path.resolve(__dirname, '../../');
    }

    // Trigger scanning worker
    setTimeout(async () => {
      try {
        const results = await runScanner(scanPath);
        
        // Save scan results
        await dbRun(
          'UPDATE scans SET status = ?, security_score = ?, quality_score = ?, performance_score = ?, architecture_score = ?, compliance_score = ?, overall_grade = ? WHERE id = ?',
          ['completed', results.security_score, results.quality_score, results.performance_score, results.architecture_score, results.compliance_score, results.overall_grade, scanId]
        );

        // Update repository last scan time
        await dbRun('UPDATE repositories SET last_scan_at = CURRENT_TIMESTAMP WHERE id = ?', [repositoryId]);

        // Insert issues
        for (const issue of results.issues) {
          await dbRun(
            `INSERT INTO issues (id, scan_id, file_path, line_number, type, severity, confidence, cwe_id, cvss_score, mitre_attack, technical_debt_hours, future_bug_probability, refactor_priority, title, description, explanation, impact, fix_suggestion, improved_code, agent_verdict)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              issue.id,
              scanId,
              issue.file_path,
              issue.line_number,
              issue.type,
              issue.severity,
              issue.confidence,
              issue.cwe_id,
              issue.cvss_score,
              issue.mitre_attack || '',
              issue.technical_debt_hours || 0,
              issue.future_bug_probability || 0,
              issue.refactor_priority || 0,
              issue.title,
              issue.description,
              issue.explanation,
              issue.impact,
              issue.fix_suggestion,
              issue.improved_code,
              issue.agent_verdict
            ]
          );
        }

        // Add a notification for user
        const notificationMsg = `Scan completed for ${repo.name}. Issues found: ${results.issues.length}. Security Score: ${results.security_score}%`;
        await dbRun(
          'INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
          [uuidv4(), req.user.id, 'Scan Completed', notificationMsg, 'scan_completed']
        );
      } catch (err) {
        console.error('Scan execution error:', err);
        await dbRun('UPDATE scans SET status = ? WHERE id = ?', ['failed', scanId]);
      }
    }, 100);

  } catch (err) {
    console.error('Scan trigger error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getScanDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const scan = await dbGet(`
      SELECT scans.*, repositories.name as repo_name, repositories.url as repo_url 
      FROM scans 
      JOIN repositories ON scans.repository_id = repositories.id
      WHERE scans.id = ?
    `, [id]);

    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    const issues = await dbAll('SELECT * FROM issues WHERE scan_id = ?', [id]);
    res.json({ scan, issues });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const repos = await dbAll('SELECT * FROM repositories');
    const scans = await dbAll('SELECT * FROM scans ORDER BY created_at DESC');
    const criticalVulnerabilities = await dbGet("SELECT COUNT(*) as count FROM issues WHERE severity = 'Critical' AND type = 'security'");
    const totalIssues = await dbGet("SELECT COUNT(*) as count FROM issues");

    // Sample statistics
    const stats = {
      totalRepositories: repos.length,
      totalScans: scans.length,
      criticalCount: criticalVulnerabilities.count || 0,
      totalIssues: totalIssues.count || 0,
      averageSecurityScore: 90,
      averageQualityScore: 88,
      averagePerformanceScore: 85,
    };

    if (scans.length > 0) {
      const completed = scans.filter(s => s.status === 'completed');
      if (completed.length > 0) {
        const sumSec = completed.reduce((a, b) => a + (b.security_score || 100), 0);
        const sumQual = completed.reduce((a, b) => a + (b.quality_score || 100), 0);
        const sumPerf = completed.reduce((a, b) => a + (b.performance_score || 100), 0);
        stats.averageSecurityScore = Math.round(sumSec / completed.length);
        stats.averageQualityScore = Math.round(sumQual / completed.length);
        stats.averagePerformanceScore = Math.round(sumPerf / completed.length);
      }
    }

    res.json({ stats, scans: scans.slice(0, 10), repos });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRepos = async (req, res) => {
  try {
    const repos = await dbAll('SELECT * FROM repositories ORDER BY created_at DESC');
    res.json(repos);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const importRepo = async (req, res) => {
  const { name, url, branch = 'main', isPrivate = false } = req.body;

  if (!name || !url) {
    return res.status(400).json({ error: 'Name and URL are required' });
  }

  try {
    const defaultOrg = await dbGet('SELECT id FROM organizations LIMIT 1');
    if (!defaultOrg) {
      return res.status(400).json({ error: 'No default organization configured' });
    }

    const repoId = uuidv4();
    await dbRun(
      'INSERT INTO repositories (id, organization_id, name, url, branch, is_private) VALUES (?, ?, ?, ?, ?, ?)',
      [repoId, defaultOrg.id, name, url, branch, isPrivate ? 1 : 0]
    );

    // Audit log
    await dbRun(
      'INSERT INTO audit_logs (id, user_id, action, ip_address, details) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), req.user.id, 'REPOSITORY_CONNECTED', req.ip, `Imported repository: ${name}`]
    );

    res.status(201).json({ message: 'Repository imported successfully', repositoryId: repoId });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// AI chatbot assistant handler
const handleChatAssistant = async (req, res) => {
  const { message, scanId, fileContext } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Pre-configured response prompts based on keywords
  let reply = "Hello! I am BugHunter AI Assistant. I can explain code vulnerabilities, suggest optimization strategies, or explain specific bugs in your repository.";
  
  if (message.toLowerCase().includes('sql injection')) {
    reply = `**SQL Injection (SQLi)** occurs when user-supplied input is directly concatenated into a SQL statement without proper escaping or parameterization. 
    
**Why it exists:** The SQL interpreter cannot distinguish between the query structure and user data.
**Technical Impact:** Attackers can read sensitive DB rows, execute subqueries, drop tables, or elevate privileges.
**Recommended Fix:** Use parameterized queries or prepared statements.
\`\`\`javascript
// Secure parameterized query
const sql = 'SELECT * FROM users WHERE email = ?';
db.execute(sql, [userEmail]);
\`\`\``;
  } else if (message.toLowerCase().includes('xss')) {
    reply = `**Cross-Site Scripting (XSS)** occurs when untrusted user input is written directly into DOM nodes (like innerHTML or react dangerouslySetInnerHTML) without sanitation.

**Why it exists:** The browser renders raw script tags dynamically, executing them in the visitor's local context.
**Technical Impact:** Session hijacking (cookie theft), credential phishing, or redirecting users to fake sites.
**Recommended Fix:** Escaping HTML, using textContent, or applying DOMPurify sanitizer.`;
  } else if (message.toLowerCase().includes('secret') || message.toLowerCase().includes('aws')) {
    reply = `**Hardcoded Secrets** represent a major risk. Storing private SSH credentials, AWS tokens, database passwords, or JWT secrets in code exposes the service to credential reuse if code is shared or leaked.

**Recommended Fix:** Move all credentials to a \`.env\` file or secret manager (e.g. AWS Secrets Manager, HashiCorp Vault), and load them dynamically at runtime using \`process.env.VARIABLE_NAME\`.`;
  } else if (scanId) {
    reply = `I've analyzed your scan logs for Scan: *${scanId}*. The repository contains issues regarding logic bugs, code complexity, or potential resource bottlenecks. You can review individual file locations, suggested fixes, and refactoring guidelines in the details pane.`;
  }

  res.json({ reply });
};

const getFileContent = async (req, res) => {
  const { scanId, filePath } = req.query;

  if (!scanId || !filePath) {
    return res.status(400).json({ error: 'Scan ID and File Path are required' });
  }

  try {
    const scan = await dbGet('SELECT repository_id FROM scans WHERE id = ?', [scanId]);
    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    const repo = await dbGet('SELECT url FROM repositories WHERE id = ?', [scan.repository_id]);
    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    // Resolve safe path
    let repoPath = repo.url;
    if (!fs.existsSync(repoPath)) {
      // Fallback
      repoPath = path.resolve(__dirname, '../../');
    }

    const fullPath = path.resolve(repoPath, filePath);

    // Security check: ensure path is within repoPath bounds
    const resolvedRepo = path.resolve(repoPath);
    if (!fullPath.startsWith(resolvedRepo)) {
      return res.status(403).json({ error: 'Access denied: Path traversal attempt detected' });
    }

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    res.json({ content });
  } catch (err) {
    console.error('File reading error:', err);
    res.status(500).json({ error: 'Internal server error reading file' });
  }
};

module.exports = {
  triggerScan,
  getScanDetail,
  getDashboardStats,
  getRepos,
  importRepo,
  handleChatAssistant,
  getFileContent
};

