const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const generateRef = () => 'BK' + uuidv4().replace(/-/g,'').toUpperCase().slice(0,10);

const create = async (conn, { user_id, event_id, seat_ids, total_amount }) => {
  const booking_reference = generateRef();
  const [result] = await conn.query(
    `INSERT INTO bookings (user_id, event_id, booking_reference, total_seats, total_amount, status)
     VALUES (?,?,?,?,?,'pending')`,
    [user_id, event_id, booking_reference, seat_ids.length, total_amount]
  );
  const booking_id = result.insertId;

  if (seat_ids.length > 0) {
    const values = seat_ids.map(sid => [booking_id, sid]);
    await conn.query(`INSERT INTO booking_seats (booking_id, seat_id) VALUES ?`, [values]);
  }
  return { booking_id, booking_reference };
};

const confirm = async (conn, booking_id) => {
  await conn.query(`UPDATE bookings SET status='confirmed' WHERE id=?`, [booking_id]);
};

const findById = async (id, conn = db) => {
  const [rows] = await conn.query(
    `SELECT b.*, e.title AS event_title, e.event_date, e.venue, e.city, e.image_url,
            u.full_name, u.email
     FROM bookings b
     JOIN events e ON e.id = b.event_id
     JOIN users u ON u.id = b.user_id
     WHERE b.id=? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const findByRef = async (ref) => {
  const [rows] = await db.query(
    `SELECT b.*, e.title AS event_title, e.event_date, e.start_time, e.venue, e.city, e.image_url,
            u.full_name, u.email
     FROM bookings b
     JOIN events e ON e.id = b.event_id
     JOIN users u ON u.id = b.user_id
     WHERE b.booking_reference=? LIMIT 1`,
    [ref]
  );
  return rows[0] || null;
};

const getSeats = async (booking_id) => {
  const [rows] = await db.query(
    `SELECT s.seat_code, s.seat_type, s.price, s.row_label, s.seat_number
     FROM booking_seats bs JOIN seats s ON s.id=bs.seat_id
     WHERE bs.booking_id=?`,
    [booking_id]
  );
  return rows;
};

const getUserBookings = async (user_id, { page = 1, limit = 10 } = {}) => {
  const offset = (page - 1) * limit;
  const [rows] = await db.query(
    `SELECT b.*, e.title AS event_title, e.event_date, e.start_time, e.venue, e.city, e.image_url,
            c.name AS category_name
     FROM bookings b
     JOIN events e ON e.id = b.event_id
     JOIN categories c ON c.id = e.category_id
     WHERE b.user_id=?
     ORDER BY b.created_at DESC LIMIT ? OFFSET ?`,
    [user_id, limit, offset]
  );
  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM bookings WHERE user_id=?`, [user_id]
  );
  return { rows, total, page, limit };
};

const getEventBookings = async (event_id, { page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  const [rows] = await db.query(
    `SELECT b.*, u.full_name, u.email
     FROM bookings b JOIN users u ON u.id=b.user_id
     WHERE b.event_id=?
     ORDER BY b.created_at DESC LIMIT ? OFFSET ?`,
    [event_id, limit, offset]
  );
  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM bookings WHERE event_id=?`, [event_id]
  );
  return { rows, total, page, limit };
};

const getAllBookings = async ({ page = 1, limit = 20, status } = {}) => {
  const offset = (page - 1) * limit;
  let where = 'WHERE 1=1';
  const params = [];
  if (status) { where += ' AND b.status=?'; params.push(status); }

  const [rows] = await db.query(
    `SELECT b.*, e.title AS event_title, u.full_name, u.email
     FROM bookings b
     JOIN events e ON e.id=b.event_id
     JOIN users u ON u.id=b.user_id
     ${where} ORDER BY b.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM bookings b ${where}`, params
  );
  return { rows, total, page, limit };
};

const cancel = async (id) => {
  await db.query(
    `UPDATE bookings SET status='cancelled', cancelled_at=NOW() WHERE id=?`, [id]
  );
};

const getBookedSeatIds = async (booking_id) => {
  const [rows] = await db.query(
    `SELECT seat_id FROM booking_seats WHERE booking_id=?`, [booking_id]
  );
  return rows.map(r => r.seat_id);
};

const getOrganizerRevenue = async (organizer_id) => {
  const [rows] = await db.query(
    `SELECT
       e.id AS event_id, e.title,
       COUNT(DISTINCT b.id) AS total_bookings,
       SUM(CASE WHEN b.status='confirmed' THEN b.total_amount ELSE 0 END) AS revenue,
       SUM(CASE WHEN b.status='confirmed' THEN b.total_seats ELSE 0 END) AS tickets_sold
     FROM events e
     LEFT JOIN bookings b ON b.event_id = e.id
     WHERE e.organizer_id=?
     GROUP BY e.id`,
    [organizer_id]
  );
  return rows;
};

module.exports = {
  create, confirm, findById, findByRef, getSeats,
  getUserBookings, getEventBookings, getAllBookings,
  cancel, getBookedSeatIds, getOrganizerRevenue,
};
