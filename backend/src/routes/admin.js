const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);
router.use(requireRole(['ADMIN']));

router.get('/drivers/pending', adminController.getPendingDrivers);
router.post('/drivers/:id/approve', adminController.approveDriver);
router.post('/drivers/:id/reject', adminController.rejectDriver);
router.get('/rides', adminController.getRides);
router.get('/revenue', adminController.getRevenue);
router.get('/settlements', adminController.getSettlements);
router.post('/commission/:driverId/settle', adminController.settleCommission);

module.exports = router;
