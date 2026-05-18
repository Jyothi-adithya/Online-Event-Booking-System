const db = require('../config/db');

/**
 * Generate seats for an event in bulk.
 * Layout: rows A-Z × seats per row
 */
const generateSeats = async (event_id, total_seats, ticket_price, conn = db) => {
  const seatsPerRow = 10;
  const rows        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const seats       = [];
  let   generated   = 0;

  for (let ri = 0; ri < rows.length && generated < total_seats; ri++) {
    const rowLabel = rows[ri];
    const count    = Math.min(seatsPerRow, total_seats - generated);
    for (let sn = 1; sn <= count; sn++) {
      const seatCode = `${rowLabel}${sn}`;
      // VIP = row A, Premium = row B, else standard
      const seatType = rowLabel === 'A' ? 'vip' : rowLabel === 'B' ? 'premium' : 'standard';
      const price    = seatType === 'vip' ? ticket_price * 1.5
                     : seatType === 'premium' ? ticket_price * 1.2
                     : ticket_price;
      seats.push([event_id, rowLabel, sn, seatCode, seatType, price]);
      generated++;
    }
  }

  await conn.query(
    `INSERT INTO seats (event_id, row_label, seat_number, seat_code, seat_type, price, status)
     VALUES ?`,
    [seats.map(s => [...s, 'available'])]
  );
};

const getByEvent = async (event_id) => {
  const [rows] = await db.query(
    `SELECT id, row_label, seat_number, seat_code, seat_type, price, status, locked_at
     FROM seats WHERE event_id=? ORDER BY row_label, seat_number`,
    [event_id]
  );
  return rows;
};

const findByIds = async (ids, conn = db) => {
  if (!ids.length) return [];
  const placeholders = ids.map(() => '?').join(',');
  const [rows] = await conn.query(
    `SELECT * FROM seats WHERE id IN (${placeholders}) FOR UPDATE`,
    ids
  );
  return rows;
};

const lockSeats = async (ids, user_id, conn = db) => {
  const lockedAt = new Date();
  const placeholders = ids.map(() => '?').join(',');
  await conn.query(
    `UPDATE seats SET status='locked', locked_by=?, locked_at=?
     WHERE id IN (${placeholders}) AND status='available'`,
    [user_id, lockedAt, ...ids]
  );
};

const bookSeats = async (ids, conn = db) => {
  const placeholders = ids.map(() => '?').join(',');
  await conn.query(
    `UPDATE seats SET status='booked', locked_by=NULL, locked_at=NULL
     WHERE id IN (${placeholders})`,
    ids
  );
};

const releaseSeats = async (ids, conn = db) => {
  if (!ids.length) return;
  const placeholders = ids.map(() => '?').join(',');
  await conn.query(
    `UPDATE seats SET status='available', locked_by=NULL, locked_at=NULL
     WHERE id IN (${placeholders})`,
    ids
  );
};

const releaseExpiredLocks = async (minutesOld = 10) => {
  const [result] = await db.query(
    `UPDATE seats SET status='available', locked_by=NULL, locked_at=NULL
     WHERE status='locked' AND locked_at < DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
    [minutesOld]
  );
  return result.affectedRows;
};

const deleteByEvent = async (event_id) => {
  await db.query(`DELETE FROM seats WHERE event_id=?`, [event_id]);
};

module.exports = {
  generateSeats, getByEvent, findByIds,
  lockSeats, bookSeats, releaseSeats,
  releaseExpiredLocks, deleteByEvent,
};
