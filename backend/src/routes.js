const express = require('express');
const router = express.Router();

const { authenticateToken, requireRole } = require('./middleware/auth');
const authController = require('./controllers/auth');
const scanController = require('./controllers/scans');
const teamController = require('./controllers/teams');
const reportController = require('./controllers/reports');
const enterpriseController = require('./controllers/enterprise');
const enterpriseExpansionController = require('./controllers/enterpriseExpansion');

// --- Auth Routes ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/refresh', authController.refresh);
router.post('/auth/logout', authenticateToken, authController.logout);
router.get('/auth/me', authenticateToken, authController.me);

// --- Scan & Repo Routes ---
router.get('/dashboard/stats', authenticateToken, scanController.getDashboardStats);
router.get('/repositories', authenticateToken, scanController.getRepos);
router.post('/repositories/import', authenticateToken, requireRole(['Admin', 'Developer']), scanController.importRepo);
router.get('/repositories/file', authenticateToken, scanController.getFileContent);
router.post('/scans/trigger', authenticateToken, requireRole(['Admin', 'Developer']), scanController.triggerScan);
router.get('/scans/:id', authenticateToken, scanController.getScanDetail);

// --- PDF Report Routes ---
router.get('/reports/pdf/:scanId', authenticateToken, reportController.generatePdfReport);

// --- Team, Audit Logs & Notifications Routes ---
router.get('/team/workspace', authenticateToken, teamController.getOrgDetails);
router.post('/team/member/role', authenticateToken, requireRole(['Admin']), teamController.updateMemberRole);
router.get('/gamification/leaderboard', authenticateToken, teamController.getLeaderboard);
router.get('/notifications', authenticateToken, teamController.getNotifications);
router.post('/notifications/:id/read', authenticateToken, teamController.markNotificationRead);
router.get('/schedules', authenticateToken, teamController.getSchedules);
router.post('/schedules', authenticateToken, requireRole(['Admin']), teamController.createSchedule);
router.get('/audit/logs', authenticateToken, requireRole(['Admin']), teamController.getAuditLogs);

// --- Enterprise SaaS Telemetry Routes ---
router.get('/soc/telemetry', authenticateToken, enterpriseController.getSocTelemetry);
router.get('/compliance/status/:scanId', authenticateToken, enterpriseController.getComplianceStatus);
router.get('/commits/:repoId', authenticateToken, enterpriseController.getCommitIntelligence);
router.get('/admin/health', authenticateToken, requireRole(['Admin']), enterpriseController.getSystemHealth);

// --- AI Chat Assistant Routes ---
router.post('/chat/assistant', authenticateToken, scanController.handleChatAssistant);

// --- Elite Feature Routes ---
router.get('/scans/:scanId/sbom', authenticateToken, enterpriseExpansionController.exportScanSbom);
router.get('/issues/:issueId/comments', authenticateToken, enterpriseExpansionController.getIssueComments);
router.post('/issues/:issueId/comments', authenticateToken, enterpriseExpansionController.createIssueComment);
router.get('/tickets', authenticateToken, enterpriseExpansionController.getTickets);
router.post('/tickets', authenticateToken, enterpriseExpansionController.createTicket);
router.put('/tickets/:id', authenticateToken, enterpriseExpansionController.updateTicket);
router.get('/settings/sso', authenticateToken, requireRole(['Admin', 'Organization Owner']), enterpriseExpansionController.getSsoConfigs);
router.post('/settings/sso', authenticateToken, requireRole(['Admin', 'Organization Owner']), enterpriseExpansionController.updateSsoConfig);
router.get('/settings/keys', authenticateToken, enterpriseExpansionController.getApiKeys);
router.post('/settings/keys', authenticateToken, enterpriseExpansionController.createApiKey);
router.delete('/settings/keys/:id', authenticateToken, enterpriseExpansionController.deleteApiKey);
router.get('/settings/billing', authenticateToken, enterpriseExpansionController.getBillingQuotas);
router.post('/settings/billing/upgrade', authenticateToken, requireRole(['Admin', 'Organization Owner']), enterpriseExpansionController.upgradeBillingTier);
router.post('/research/chaining', authenticateToken, enterpriseExpansionController.simulateVulnerabilityChain);

module.exports = router;
