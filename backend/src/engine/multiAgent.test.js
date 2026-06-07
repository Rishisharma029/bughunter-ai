const test = require('node:test');
const assert = require('node:assert');
const { analyzeCode } = require('./multiAgent');

test('Multi-Agent Scanner: Detects plain-text credentials', () => {
  const vulnerableCode = `
    const apiKey = "AIzaSyD-1234567890abcdefghijklmnopqrstuv";
    const dbPass = "super_secret_db_password_99";
  `;

  const results = analyzeCode(vulnerableCode, 'config.js');
  const issues = results.issues;

  const secrets = issues.filter(i => i.title.includes('Exposed Plaintext Secret'));
  assert.strictEqual(secrets.length, 2, 'Should flag exactly two plaintext credentials');
  assert.ok(secrets.some(s => s.severity === 'Critical'), 'Credentials must have Critical severity');
});

test('Multi-Agent Scanner: Detects SQL injection and generates simulations', () => {
  const vulnerableCode = `
    const q = req.query.id;
    db.query("SELECT * FROM users WHERE id = " + q);
  `;

  const results = analyzeCode(vulnerableCode, 'userController.js');
  const issues = results.issues;

  const sqli = issues.find(i => i.title.includes('SQL Injection'));
  assert.ok(sqli, 'Should flag potential SQL injection');
  assert.strictEqual(sqli.severity, 'Critical', 'SQL injection should have Critical severity');
  assert.ok(sqli.agent_verdict.includes('Skeptic Agent'), 'Verdict must include Skeptic verification');
});

test('Multi-Agent Scanner: Detects performance loops and assigns grades', () => {
  const slowCode = `
    for (let i = 0; i < 100; i++) {
      for (let j = 0; j < 100; j++) {
        for (let k = 0; k < 100; k++) {
          // deep nesting
        }
      }
    }
  `;

  const results = analyzeCode(slowCode, 'math.js');
  assert.ok(results.issues.length >= 1, 'Should find nested loop issue');
  assert.ok(results.scores.performance < 100, 'Performance score should decrease');
  assert.strictEqual(typeof results.scores.grade, 'string', 'Should return a string grade (A, B, C, etc.)');
});

test('Multi-Agent Scanner: Detects Architecture SOLID issues', () => {
  const coupledCode = `
    const ctrl = new QueryController(); // tight coupling
  `;

  const results = analyzeCode(coupledCode, 'query.js');
  const archIssues = results.issues.filter(i => i.type === 'architecture');
  assert.ok(archIssues.length >= 1, 'Should find tight coupling issue');
  assert.strictEqual(archIssues[0].severity, 'Medium', 'Should be Medium severity');
});

test('Multi-Agent Scanner: Detects Compliance framework issues', () => {
  const nonCompliantCode = `
    app.use(cors({ origin: '*' })); // Permissive CORS
    const hash = crypto.createHash('md5').digest(); // md5 hash
  `;

  const results = analyzeCode(nonCompliantCode, 'app.js');
  const compIssues = results.issues.filter(i => i.type === 'compliance');
  assert.strictEqual(compIssues.length, 2, 'Should find CORS and hash compliance issues');
  assert.ok(compIssues.some(c => c.title.includes('CORS')), 'Should detect CORS issue');
});
