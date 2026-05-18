const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/category.controller');
const { verifyToken, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', ctrl.getAll);

router.post('/',
  verifyToken, authorize('admin'),
  [body('name').trim().notEmpty()],
  validate,
  ctrl.create
);

router.put('/:id',
  verifyToken, authorize('admin'),
  [body('name').trim().notEmpty()],
  validate,
  ctrl.update
);

router.delete('/:id', verifyToken, authorize('admin'), ctrl.remove);

module.exports = router;
