const db = require('../config/db');

const getAll = async ({ page = 1, limit = 10, category, city, search, date, status = 'approved' } = {}) => {
  const offset = (page - 1) * limit;
  let where = 'WHERE e.status = ?';
  const params = [status];

  if (category) { where += ' AND c.name = ?'; params.push(category); }
  if (city)     { where += ' AND e.city LIKE ?'; params.push(`%${city}%`); }
  if (search)   { where += ' AND (e.title LIKE ? OR e.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (date)     { where += ' AND e.event_date = ?'; params.push(date); }

  const [rows] = await db.query(
    `SELECT e.*, c.name AS category_name, u.full_name AS organizer_name
     FROM events e
     JOIN categories c ON c.id = e.category_id
     JOIN users u ON u.id = e.organizer_id
     ${where}
     ORDER BY e.event_date ASC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM events e
     JOIN categories c ON c.id = e.category_id
     ${where}`,
    params
  );
  return { rows, total, page, limit };
};

const findById = async (id) => {
  const [rows] = await db.query(
    `SELECT e.*, c.name AS category_name, u.full_name AS organizer_name, u.email AS organizer_email
     FROM events e
     JOIN categories c ON c.id = e.category_id
     JOIN users u ON u.id = e.organizer_id
     WHERE e.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const create = async (data) => {
  const {
    organizer_id, category_id, title, description, venue, city, state, country,
    event_date, start_time, end_time, total_seats, ticket_price, image_url, status
  } = data;
  const [result] = await db.query(
    `INSERT INTO events
     (organizer_id, category_id, title, description, venue, city, state, country,
      event_date, start_time, end_time, total_seats, available_seats, ticket_price, image_url, status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [organizer_id, category_id, title, description, venue, city, state || null, country || 'India',
     event_date, start_time, end_time || null, total_seats, total_seats, ticket_price, image_url || null, status || 'approved']
  );
  return result.insertId;
};

const update = async (id, data) => {
  const {
    category_id, title, description, venue, city, state, country,
    event_date, start_time, end_time, ticket_price, image_url, status
  } = data;
  await db.query(
    `UPDATE events SET
       category_id=?, title=?, description=?, venue=?, city=?, state=?, country=?,
       event_date=?, start_time=?, end_time=?, ticket_price=?, image_url=?, status=?
     WHERE id=?`,
    [category_id, title, description, venue, city, state || null, country || 'India',
     event_date, start_time, end_time || null, ticket_price, image_url || null, status, id]
  );
};

const remove = async (id) => {
  await db.query(`DELETE FROM events WHERE id=?`, [id]);
};

const getByOrganizer = async (organizer_id, { page = 1, limit = 10 } = {}) => {
  const offset = (page - 1) * limit;
  const [rows] = await db.query(
    `SELECT e.*, c.name AS category_name
     FROM events e JOIN categories c ON c.id=e.category_id
     WHERE e.organizer_id=?
     ORDER BY e.created_at DESC LIMIT ? OFFSET ?`,
    [organizer_id, limit, offset]
  );
  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM events WHERE organizer_id=?`, [organizer_id]
  );
  return { rows, total, page, limit };
};

const updateAvailableSeats = async (conn, event_id, delta) => {
  await conn.query(
    `UPDATE events SET available_seats = available_seats + ? WHERE id=?`,
    [delta, event_id]
  );
};

const updateStatus = async (id, status) => {
  await db.query(`UPDATE events SET status=? WHERE id=?`, [status, id]);
};

module.exports = { getAll, findById, create, update, remove, getByOrganizer, updateAvailableSeats, updateStatus };
