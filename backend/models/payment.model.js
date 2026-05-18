const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const create = async (conn, { booking_id, user_id, amount, payment_method }) => {
  const transaction_id = 'TXN' + uuidv4().replace(/-/g,'').toUpperCase().slice(0,12);
  const [result] = await conn.query(
    `INSERT INTO payments (booking_id, user_id, amount, payment_method, payment_status, transaction_id)
     VALUES (?,?,?,?,'pending',?)`,
    [booking_id, user_id, amount, payment_method, transaction_id]
  );
  return { payment_id: result.insertId, transaction_id };
};

const updateStatus = async (conn, booking_id, status) => {
  const paid_at = status === 'success' ? new Date() : null;
  await conn.query(
    `UPDATE payments SET payment_status=?, paid_at=? WHERE booking_id=?`,
    [status, paid_at, booking_id]
  );
};

const findByBooking = async (booking_id) => {
  const [rows] = await db.query(
    `SELECT * FROM payments WHERE booking_id=? LIMIT 1`, [booking_id]
  );
  return rows[0] || null;
};

const getAll = async ({ page = 1, limit = 20, status } = {}) => {
  const offset = (page - 1) * limit;
  let where = 'WHERE 1=1';
  const params = [];
  if (status) { where += ' AND p.payment_status=?'; params.push(status); }

  const [rows] = await db.query(
    `SELECT p.*, b.booking_reference, u.full_name, u.email, e.title AS event_title
     FROM payments p
     JOIN bookings b ON b.id=p.booking_id
     JOIN users u ON u.id=p.user_id
     JOIN events e ON e.id=b.event_id
     ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM payments p ${where}`, params
  );
  return { rows, total, page, limit };
};

const getRevenueSummary = async () => {
  const [[summary]] = await db.query(
    `SELECT
       COUNT(*) AS total_payments,
       SUM(CASE WHEN payment_status='success' THEN amount ELSE 0 END) AS total_revenue,
       SUM(CASE WHEN payment_status='pending' THEN 1 ELSE 0 END) AS pending_count,
       SUM(CASE WHEN payment_status='failed'  THEN 1 ELSE 0 END) AS failed_count,
       SUM(CASE WHEN payment_status='refunded'THEN amount ELSE 0 END) AS total_refunded
     FROM payments`
  );
  return summary;
};

module.exports = { create, updateStatus, findByBooking, getAll, getRevenueSummary };
