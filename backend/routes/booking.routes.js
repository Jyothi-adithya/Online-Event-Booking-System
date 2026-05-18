const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/booking.controller');
const { verifyToken, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// POST /api/bookings — create booking
router.post('/',
  verifyToken,
  [
    body('event_id').isInt({ min: 1 }),
    body('seat_ids').isArray({ min: 1, max: 10 }),
    body('seat_ids.*').isInt({ min: 1 }),
    body('payment_method').optional().isIn(['card','upi','netbanking','wallet']),
  ],
  validate,
  ctrl.createBooking
);

// GET /api/bookings/my — user's own bookings
router.get('/my', verifyToken, ctrl.getMyBookings);

// GET /api/bookings/all — admin only
router.get('/all', verifyToken, authorize('admin'), ctrl.getAllBookings);

// GET /api/bookings/:id
router.get('/:id', verifyToken, ctrl.getBookingDetail);

// DELETE /api/bookings/:id/cancel
router.patch('/:id/cancel', verifyToken, ctrl.cancelBooking);

module.exports = router;
