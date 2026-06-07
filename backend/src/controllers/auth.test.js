const test = require('node:test');
const assert = require('node:assert');
const { initDb, dbGet, dbRun } = require('../db');
const authController = require('./auth');

// Simple mock for Express req/res
const createMockResponse = () => {
  const res = {
    statusCode: 200,
    headers: {},
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    }
  };
  return res;
};

test('Auth API Integration: Registration Flow', async () => {
  await initDb();

  const testEmail = `test_user_${Date.now()}@bughunter.ai`;
  const req = {
    body: {
      email: testEmail,
      password: 'testPassword123',
      role: 'Developer'
    },
    ip: '127.0.0.1'
  };

  const res = createMockResponse();
  await authController.register(req, res);

  assert.strictEqual(res.statusCode, 201, 'Registration should return 201 Created');
  assert.ok(res.jsonData.accessToken, 'Should return JWT access token');
  assert.ok(res.jsonData.refreshToken, 'Should return JWT refresh token');
  assert.strictEqual(res.jsonData.user.email, testEmail, 'Emails should match');

  // Verify DB insertion
  const dbUser = await dbGet('SELECT * FROM users WHERE email = ?', [testEmail]);
  assert.ok(dbUser, 'User must exist in the database');
  assert.strictEqual(dbUser.role, 'Developer', 'User role should persist correctly');

  // Attempt duplicate registration
  const duplicateRes = createMockResponse();
  await authController.register(req, duplicateRes);
  assert.strictEqual(duplicateRes.statusCode, 400, 'Duplicate registration should return 400 Bad Request');
  assert.strictEqual(duplicateRes.jsonData.error, 'Email already registered', 'Should prevent duplicate emails');
});

test('Auth API Integration: Login Validation', async () => {
  await initDb();
  
  // Seed a login user
  const email = `login_test_${Date.now()}@bughunter.ai`;
  const registerReq = {
    body: { email, password: 'correct_pass', role: 'Developer' },
    ip: '127.0.0.1'
  };
  const registerRes = createMockResponse();
  await authController.register(registerReq, registerRes);

  // Attempt incorrect password login
  const invalidLoginReq = {
    body: { email, password: 'wrong_password' },
    ip: '127.0.0.1'
  };
  const invalidLoginRes = createMockResponse();
  await authController.login(invalidLoginReq, invalidLoginRes);
  assert.strictEqual(invalidLoginRes.statusCode, 401, 'Incorrect login should return 401 Unauthorized');

  // Attempt correct password login
  const validLoginReq = {
    body: { email, password: 'correct_pass' },
    ip: '127.0.0.1'
  };
  const validLoginRes = createMockResponse();
  await authController.login(validLoginReq, validLoginRes);
  assert.strictEqual(validLoginRes.statusCode, 200, 'Correct login should return 200 OK');
  assert.ok(validLoginRes.jsonData.accessToken, 'Should return token');
});
