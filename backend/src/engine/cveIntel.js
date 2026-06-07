const path = require('path');

// 1. CVE Intelligence Engine
// Contains a list of common package vulnerabilities for Java, JS, Python, Go, C#
const CVE_DATABASE = [
  { name: 'lodash', versionRange: '<4.17.21', cveId: 'CVE-2020-8203', severity: 'High', description: 'Prototype pollution vulnerability allows remote code execution (RCE) via merge and defaultsDeep operations.', recommendation: 'Upgrade immediately to 4.17.21 or above.' },
  { name: 'axios', versionRange: '<1.6.0', cveId: 'CVE-2023-45857', severity: 'Medium', description: 'Server-Side Request Forgery (SSRF) vulnerability due to incorrect handling of proxy credentials.', recommendation: 'Upgrade to 1.6.0 or higher.' },
  { name: 'log4j', versionRange: '>=2.0-beta9 <2.15.0', cveId: 'CVE-2021-44228', severity: 'Critical', description: 'Log4Shell remote code execution vulnerability via JNDI lookups in logging calls.', recommendation: 'Upgrade to log4j-core 2.15.0 or configure formatMsgNoLookups=true.' },
  { name: 'django', versionRange: '<4.2.7', cveId: 'CVE-2023-46695', severity: 'High', description: 'Directory traversal and open redirect risk during file upload URL parsing.', recommendation: 'Upgrade to django 4.2.7 or patch routing patterns.' },
  { name: 'fastapi', versionRange: '<0.100.0', cveId: 'CVE-2023-38545', severity: 'Medium', description: 'Query parameter deserialization vulnerability causing local denial of service.', recommendation: 'Upgrade fastapi dependency to 0.100.0.' }
];

const scanDependencies = (fileContent, filePath) => {
  const findings = [];
  const fileName = path.basename(filePath);

  if (fileName === 'package.json') {
    try {
      const pkg = JSON.parse(fileContent);
      const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

      Object.entries(allDeps).forEach(([depName, verStr]) => {
        // Clean version character symbols (^, ~, *, etc.)
        const verClean = verStr.replace(/[^\d.]/g, '');
        const cve = CVE_DATABASE.find(c => c.name === depName);

        if (cve) {
          findings.push({
            dependency: depName,
            version: verStr,
            cveId: cve.cveId,
            severity: cve.severity,
            description: cve.description,
            recommendation: cve.recommendation
          });
        }
      });
    } catch (e) {
      // JSON parse error or empty package.json
    }
  } else if (fileName === 'requirements.txt') {
    const lines = fileContent.split('\n');
    lines.forEach(line => {
      const match = line.trim().match(/^([a-zA-Z0-9_\-]+)\s*(?:==|>=|<=|<|>)\s*([0-9.]+)/);
      if (match) {
        const depName = match[1].toLowerCase();
        const verStr = match[2];
        const cve = CVE_DATABASE.find(c => c.name === depName);
        if (cve) {
          findings.push({
            dependency: depName,
            version: verStr,
            cveId: cve.cveId,
            severity: cve.severity,
            description: cve.description,
            recommendation: cve.recommendation
          });
        }
      }
    });
  }

  return findings;
};

// 2. Attack Simulation Payload Generator
const getSimulationForIssue = (title, details = '') => {
  if (title.includes('SQL Injection')) {
    return {
      payload: `?id=1 OR 1=1`,
      command: `curl "http://localhost:3000/api/users?id=1%20OR%201=1"`,
      impact: 'Retrieves all rows from the database table (bypass authorization).',
      remediation: 'Implement sql parameterized queries.'
    };
  }
  if (title.includes('XSS')) {
    return {
      payload: `<script>alert(document.cookie)</script>`,
      command: `Input: <script>alert(document.cookie)</script>`,
      impact: 'Executes scripts in context of user sessions (Session Hijacking).',
      remediation: 'Use textContent, or HTML sanitizers like DOMPurify.'
    };
  }
  if (title.includes('Command Injection')) {
    return {
      payload: `127.0.0.1 && cat /etc/passwd`,
      command: `ping "127.0.0.1 && cat /etc/passwd"`,
      impact: 'Reads files from target server file system.',
      remediation: 'Pass command arguments as an array using execFile.'
    };
  }
  if (title.includes('Secret')) {
    return {
      payload: `grep -rn "api_key" .`,
      command: `Extracts plaintext token: [EXPOSED_KEY_HASHED_OR_TRUNCATED]`,
      impact: 'Compromises external APIs, cloud credentials, or client services.',
      remediation: 'Load secrets from environment configuration.'
    };
  }
  return null;
};

module.exports = {
  scanDependencies,
  getSimulationForIssue
};
