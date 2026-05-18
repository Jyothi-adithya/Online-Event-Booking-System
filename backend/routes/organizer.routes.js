const router = require('express').Router();
const ctrl = require('../controllers/organizer.controller');
const { verifyToken, authorize } = require('../middleware/auth');

const guard = [verifyToken, authorize('organizer', 'admin')];

router.get('/dashboard',                     ...guard, ctrl.getDashboard);
router.get('/events',                        ...guard, ctrl.getMyEvents);
router.get('/events/:event_id/bookings',     ...guard, ctrl.getEventBookings);
router.get('/revenue',                       ...guard, ctrl.getRevenueSummary);

module.exports = router;
