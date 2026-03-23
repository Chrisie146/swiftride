const express = require('express');
const router = express.Router();
const ridesController = require('../controllers/ridesController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

router.post('/estimate', ridesController.estimateFare);
router.post('/request', ridesController.requestRide);
router.get('/history', ridesController.getHistory);
router.get('/:id', ridesController.getRideById);
router.post('/:id/cancel', ridesController.cancelRide);

// Driver only endpoints
router.post('/:id/accept', requireRole(['DRIVER']), ridesController.acceptRide);
router.post('/:id/arrived', requireRole(['DRIVER']), ridesController.arriveRide);
router.post('/:id/complete', requireRole(['DRIVER']), ridesController.completeRide);

module.exports = router;
