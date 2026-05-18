const router = require('express').Router();
const { body, query } = require('express-validator');
const ctrl = require('../controllers/event.controller');
const { verifyToken, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../utils/upload');

const eventValidation = [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('description').trim().notEmpty().withMessage('Description required'),
  body('venue').trim().notEmpty().withMessage('Venue required'),
  body('city').trim().notEmpty().withMessage('City required'),
  body('event_date').isDate().withMessage('Valid date required (YYYY-MM-DD)'),
  body('start_time').matches(/^\d{2}:\d{2}/).withMessage('Start time required (HH:MM)'),
  body('total_seats').isInt({ min: 1, max: 10000 }).withMessage('Total seats 1–10000'),
  body('ticket_price').isFloat({ min: 0 }).withMessage('Ticket price >= 0'),
  body('category_id').isInt({ min: 1 }).withMessage('Category required'),
];

// Public
router.get('/', ctrl.listEvents);
router.get('/:id', ctrl.getEvent);

// Protected
router.post('/',
  verifyToken,
  authorize('organizer', 'admin'),
  upload.single('image'),
  eventValidation, validate,
  ctrl.createEvent
);

router.put('/:id',
  verifyToken,
  authorize('organizer', 'admin'),
  upload.single('image'),
  eventValidation, validate,
  ctrl.updateEvent
);

router.delete('/:id',
  verifyToken,
  authorize('organizer', 'admin'),
  ctrl.deleteEvent
);

// Admin only: approve/reject
router.patch('/:id/status',
  verifyToken,
  authorize('admin'),
  body('status').isIn(['approved','rejected','cancelled']),
  validate,
  ctrl.approveEvent
);

module.exports = router;
