const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const { verifyToken, authorize } = require('../middleware/auth');

const guard = [verifyToken, authorize('admin')];

router.get('/dashboard', ...guard, ctrl.getDashboardStats);
router.get('/reports',   ...guard, ctrl.getReports);

// Users
router.get('/users',            ...guard, ctrl.getAllUsers);
router.patch('/users/:id/toggle', ...guard, ctrl.toggleUserStatus);
router.delete('/users/:id',     ...guard, ctrl.deleteUser);

// Events
router.get('/events',           ...guard, ctrl.getAllEvents);
router.patch('/events/:id/status', ...guard, ctrl.approveEvent);

module.exports = router;
