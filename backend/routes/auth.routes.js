const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');
const validate = require('../middleware/validate');

// POST /api/auth/register
router.post('/register', [
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  body('role').optional().isIn(['user', 'organizer']).withMessage('Role must be user or organizer'),
], validate, ctrl.register);

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], validate, ctrl.login);

// GET /api/auth/profile  (protected)
router.get('/profile', verifyToken, ctrl.getProfile);

// PUT /api/auth/profile  (protected)
router.put('/profile', verifyToken, [
  body('full_name').trim().notEmpty().withMessage('Full name required'),
  body('phone').optional().isMobilePhone(),
], validate, ctrl.updateProfile);

// PUT /api/auth/change-password
router.put('/change-password', verifyToken, [
  body('current_password').notEmpty(),
  body('new_password').isLength({ min: 6 }),
], validate, ctrl.changePassword);

module.exports = router;
