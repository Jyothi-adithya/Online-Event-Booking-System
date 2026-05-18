const UserModel    = require('../models/user.model');
const EventModel   = require('../models/event.model');
const BookingModel = require('../models/booking.model');
const PaymentModel = require('../models/payment.model');
const db           = require('../config/db');

// ── Users ──────────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const result = await UserModel.getAll({ page: +page, limit: +limit, role, search });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await UserModel.findById(+req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await UserModel.setActive(+req.params.id, user.is_active ? 0 : 1);
    res.json({ success: true, message: `User ${user.is_active ? 'deactivated' : 'activated'}` });
  } catch (err) { next(err); }
};

const deleteUser = async (req, res, next) => {
  try {
    await db.query(`DELETE FROM users WHERE id=?`, [+req.params.id]);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
};

// ── Events ─────────────────────────────────────────────────
const getAllEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category, search } = req.query;
    const result = await EventModel.getAll({ page: +page, limit: +limit, status: status || undefined, category, search });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const approveEvent = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved','rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }
    await EventModel.updateStatus(+req.params.id, status);
    res.json({ success: true, message: `Event ${status}` });
  } catch (err) { next(err); }
};

// ── Dashboard Stats ────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const [[users]]    = await db.query(`SELECT COUNT(*) AS total FROM users`);
    const [[events]]   = await db.query(`SELECT COUNT(*) AS total FROM events`);
    const [[bookings]] = await db.query(`SELECT COUNT(*) AS total FROM bookings WHERE status='confirmed'`);
    const [[revenue]]  = await db.query(
      `SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE payment_status='success'`
    );
    const [recentBookings] = await db.query(
      `SELECT b.*, u.full_name, u.email, e.title AS event_title
       FROM bookings b JOIN users u ON u.id=b.user_id JOIN events e ON e.id=b.event_id
       ORDER BY b.created_at DESC LIMIT 5`
    );
    const [topEvents] = await db.query(
      `SELECT e.id, e.title, e.event_date, e.city,
              COUNT(b.id) AS booking_count,
              COALESCE(SUM(b.total_amount),0) AS revenue
       FROM events e LEFT JOIN bookings b ON b.event_id=e.id AND b.status='confirmed'
       GROUP BY e.id ORDER BY booking_count DESC LIMIT 5`
    );
    res.json({
      success: true,
      data: {
        total_users:    users.total,
        total_events:   events.total,
        total_bookings: bookings.total,
        total_revenue:  revenue.total,
        recent_bookings: recentBookings,
        top_events:      topEvents,
      },
    });
  } catch (err) { next(err); }
};

// ── Reports ────────────────────────────────────────────────
const getReports = async (req, res, next) => {
  try {
    const [monthlyRevenue] = await db.query(
      `SELECT DATE_FORMAT(paid_at,'%Y-%m') AS month,
              SUM(amount) AS revenue, COUNT(*) AS transactions
       FROM payments WHERE payment_status='success'
       GROUP BY month ORDER BY month DESC LIMIT 12`
    );
    const [categoryStats] = await db.query(
      `SELECT c.name AS category, COUNT(b.id) AS bookings,
              COALESCE(SUM(b.total_amount),0) AS revenue
       FROM categories c
       LEFT JOIN events e ON e.category_id=c.id
       LEFT JOIN bookings b ON b.event_id=e.id AND b.status='confirmed'
       GROUP BY c.id ORDER BY bookings DESC`
    );
    res.json({ success: true, data: { monthlyRevenue, categoryStats } });
  } catch (err) { next(err); }
};

module.exports = {
  getAllUsers, toggleUserStatus, deleteUser,
  getAllEvents, approveEvent,
  getDashboardStats, getReports,
};
