const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.query(`SELECT * FROM categories ORDER BY name`);
  return rows;
};

const findById = async (id) => {
  const [rows] = await db.query(`SELECT * FROM categories WHERE id=? LIMIT 1`, [id]);
  return rows[0] || null;
};

const create = async ({ name, icon }) => {
  const [result] = await db.query(
    `INSERT INTO categories (name, icon) VALUES (?,?)`, [name, icon || 'event']
  );
  return result.insertId;
};

const update = async (id, { name, icon }) => {
  await db.query(`UPDATE categories SET name=?, icon=? WHERE id=?`, [name, icon || 'event', id]);
};

const remove = async (id) => {
  await db.query(`DELETE FROM categories WHERE id=?`, [id]);
};

module.exports = { getAll, findById, create, update, remove };
