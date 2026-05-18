const router = require('express').Router();
const ctrl = require('../controllers/payment.controller');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/booking/:booking_id', verifyToken, ctrl.getPaymentStatus);
router.get('/all', verifyToken, authorize('admin'), ctrl.getAllPayments);
router.get('/revenue', verifyToken, authorize('admin'), ctrl.getRevenueSummary);

module.exports = router;
