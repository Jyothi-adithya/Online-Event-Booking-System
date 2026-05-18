const db = require('../config/db');

const findByEmail = async (email) => {
  const [rows] = await db.query(
    `SELECT u.*, r.name AS role
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.email = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

const findById = async (id) => {
  const [rows] = await db.query(
    `SELECT u.id, u.full_name, u.email, u.phone, u.avatar_url, u.is_active, u.created_at,
            r.name AS role
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const create = async ({ full_name, email, password_hash, phone, role_id = 1 }) => {
  const [result] = await db.query(
    `INSERT INTO users (full_name, email, password_hash, phone, role_id)
     VALUES (?,?,?,?,?)`,
    [full_name, email, password_hash, phone || null, role_id]
  );
  return result.insertId;
};

const updateProfile = async (id, { full_name, phone, avatar_url }) => {
  await db.query(
    `UPDATE users SET full_name=?, phone=?, avatar_url=? WHERE id=?`,
    [full_name, phone || null, avatar_url || null, id]
  );
};

const updatePassword = async (id, password_hash) => {
  await db.query(`UPDATE users SET password_hash=? WHERE id=?`, [password_hash, id]);
};

const setActive = async (id, is_active) => {
  await db.query(`UPDATE users SET is_active=? WHERE id=?`, [is_active, id]);
};

const getAll = async ({ page = 1, limit = 20, role, search } = {}) => {
  const offset = (page - 1) * limit;
  let where = 'WHERE 1=1';
  const params = [];
  if (role) { where += ' AND r.name=?'; params.push(role); }
  if (search) { where += ' AND (u.full_name LIKE ? OR u.email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  const [rows] = await db.query(
    `SELECT u.id, u.full_name, u.email, u.phone, u.is_active, u.created_at, r.name AS role
     FROM users u JOIN roles r ON r.id=u.role_id
     ${where} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM users u JOIN roles r ON r.id=u.role_id ${where}`,
    params
  );
  return { rows, total, page, limit };
};

const getRoleIdByName = async (name) => {
  const [rows] = await db.query(`SELECT id FROM roles WHERE name=? LIMIT 1`, [name]);
  return rows[0]?.id || 1;
};

module.exports = { findByEmail, findById, create, updateProfile, updatePassword, setActive, getAll, getRoleIdByName };
