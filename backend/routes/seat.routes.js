const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/seat.controller');
const { verifyToken } = require('../middleware/auth');
const validate = require('../middleware/validate');

// GET seats for an event  (public)
router.get('/event/:event_id', ctrl.getSeats);

// POST lock seats  (must be logged in)
router.post('/lock',
  verifyToken,
  [
    body('event_id').isInt({ min: 1 }).withMessage('event_id required'),
    body('seat_ids').isArray({ min: 1, max: 10 }).withMessage('seat_ids must be array of 1–10'),
    body('seat_ids.*').isInt({ min: 1 }).withMessage('Each seat_id must be integer'),
  ],
  validate,
  ctrl.lockSeats
);

module.exports = router;
