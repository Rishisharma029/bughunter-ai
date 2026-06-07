const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { dbRun, dbGet } = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

const REFRESH_SECRET = process.env.REFRESH_SECRET || 'bughunter_refresh_secret_key_112233';

// In-memory or database-backed refresh token store.
// Let's use a database or simple table, but since we didn't define a separate table, 
// we can store active sessions/refresh tokens in our memory store or store them in details of audit_logs/notifications,
// or we can just verify the token signature directly, or keep an in-memory Set.
// An in-memory Set is fast and clean for a single Node instance.
const activeRefreshTokens = new Set();

const register = async (req, res) => {
  const { email, password, role = 'Developer' } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if user exists
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    await dbRun(
      'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [userId, email, passwordHash, role]
    );

    // Create default org link if organization exists
    const defaultOrg = await dbGet('SELECT id FROM organizations LIMIT 1');
    if (defaultOrg) {
      await dbRun(
        'INSERT INTO organization_members (id, organization_id, user_id, role) VALUES (?, ?, ?, ?)',
        [uuidv4(), defaultOrg.id, userId, role === 'Admin' ? 'Admin' : 'Developer']
      );
    }

    // Initialize leaderboard entry
    await dbRun(
      'INSERT INTO leaderboards (id, user_id, bugs_fixed, score) VALUES (?, ?, 0, 0)',
      [uuidv4(), userId]
    );

    // Audit log
    await dbRun(
      'INSERT INTO audit_logs (id, user_id, action, ip_address, details) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), userId, 'USER_REGISTERED', req.ip, `Registered with role: ${role}`]
    );

    // Generate token
    const accessToken = jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: userId, email, role }, REFRESH_SECRET, { expiresIn: '7d' });
    activeRefreshTokens.add(refreshToken);

    res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      refreshToken,
      user: { id: userId, email, role }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      // Audit log failed login
      await dbRun(
        'INSERT INTO audit_logs (id, user_id, action, ip_address, details) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), null, 'LOGIN_FAILED', req.ip, `Attempted login for: ${email}`]
      );
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Audit log successful login
    await dbRun(
      'INSERT INTO audit_logs (id, user_id, action, ip_address, details) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), user.id, 'LOGIN_SUCCESS', req.ip, 'User logged in successfully']
    );

    const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, REFRESH_SECRET, { expiresIn: '7d' });
    activeRefreshTokens.add(refreshToken);

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

const refresh = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  if (!activeRefreshTokens.has(refreshToken)) {
    return res.status(403).json({ error: 'Invalid or expired refresh token' });
  }

  jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
    if (err) {
      activeRefreshTokens.delete(refreshToken);
      return res.status(403).json({ error: 'Invalid refresh token signature' });
    }

    const newAccessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ accessToken: newAccessToken });
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    activeRefreshTokens.delete(refreshToken);
  }

  if (req.user) {
    await dbRun(
      'INSERT INTO audit_logs (id, user_id, action, ip_address, details) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), req.user.id, 'USER_LOGOUT', req.ip, 'User logged out']
    );
  }

  res.json({ message: 'Logged out successfully' });
};

const me = async (req, res) => {
  try {
    const user = await dbGet('SELECT id, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  me
};
