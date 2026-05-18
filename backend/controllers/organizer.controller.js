const EventModel   = require('../models/event.model');
const BookingModel = require('../models/booking.model');
const db           = require('../config/db');

const getMyEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await EventModel.getByOrganizer(req.user.id, { page: +page, limit: +limit });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getEventBookings = async (req, res, next) => {
  try {
    // Verify organizer owns this event
    const event = await EventModel.findById(+req.params.event_id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const { page = 1, limit = 20 } = req.query;
    const result = await BookingModel.getEventBookings(+req.params.event_id, { page: +page, limit: +limit });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getRevenueSummary = async (req, res, next) => {
  try {
    const rows = await BookingModel.getOrganizerRevenue(req.user.id);
    const total_revenue  = rows.reduce((s, r) => s + parseFloat(r.revenue || 0), 0);
    const total_bookings = rows.reduce((s, r) => s + parseInt(r.total_bookings || 0), 0);
    const tickets_sold   = rows.reduce((s, r) => s + parseInt(r.tickets_sold || 0), 0);
    res.json({ success: true, data: { events: rows, total_revenue, total_bookings, tickets_sold } });
  } catch (err) { next(err); }
};

const getDashboard = async (req, res, next) => {
  try {
    const [[evs]] = await db.query(`SELECT COUNT(*) AS total FROM events WHERE organizer_id=?`, [req.user.id]);
    const [[bks]] = await db.query(
      `SELECT COUNT(b.id) AS total FROM bookings b
       JOIN events e ON e.id=b.event_id
       WHERE e.organizer_id=? AND b.status='confirmed'`,
      [req.user.id]
    );
    const [[rev]] = await db.query(
      `SELECT COALESCE(SUM(p.amount),0) AS total
       FROM payments p JOIN bookings b ON b.id=p.booking_id
       JOIN events e ON e.id=b.event_id
       WHERE e.organizer_id=? AND p.payment_status='success'`,
      [req.user.id]
    );
    const [upcoming] = await db.query(
      `SELECT e.*, c.name AS category_name,
              COUNT(b.id) AS booking_count
       FROM events e
       JOIN categories c ON c.id=e.category_id
       LEFT JOIN bookings b ON b.event_id=e.id AND b.status='confirmed'
       WHERE e.organizer_id=? AND e.event_date >= CURDATE()
       GROUP BY e.id ORDER BY e.event_date ASC LIMIT 5`,
      [req.user.id]
    );
    res.json({
      success: true,
      data: {
        total_events:    evs.total,
        total_bookings:  bks.total,
        total_revenue:   rev.total,
        upcoming_events: upcoming,
      },
    });
  } catch (err) { next(err); }
};

module.exports = { getMyEvents, getEventBookings, getRevenueSummary, getDashboard };
