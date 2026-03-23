const express = require('express');
const router = express.Router();
const driversController = require('../controllers/driversController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

router.post('/register', driversController.register);
router.get('/profile', requireRole(['DRIVER']), driversController.getProfile);
router.post('/status', requireRole(['DRIVER']), driversController.updateStatus);
router.get('/requests', requireRole(['DRIVER']), driversController.getRequests);
router.get('/earnings', requireRole(['DRIVER']), driversController.getEarnings);

module.exports = router;
