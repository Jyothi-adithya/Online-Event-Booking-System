const router = require('express').Router();
const ctrl = require('../controllers/user.controller');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/:id', verifyToken, ctrl.getUser);

module.exports = router;
