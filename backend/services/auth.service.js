const bcrypt = require('bcryptjs');
const UserModel = require('../models/user.model');
const { generateToken } = require('../middleware/auth');

const register = async ({ full_name, email, password, phone, role }) => {
  const existing = await UserModel.findByEmail(email);
  if (existing) {
    const err = new Error('Email already registered.');
    err.statusCode = 409;
    throw err;
  }
  const role_id = await UserModel.getRoleIdByName(role || 'user');
  const password_hash = await bcrypt.hash(password, 12);
  const userId = await UserModel.create({ full_name, email, password_hash, phone, role_id });
  const user = await UserModel.findById(userId);
  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  return { user: sanitize(user), token };
};

const login = async ({ email, password }) => {
  const user = await UserModel.findByEmail(email);
  if (!user) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }
  if (!user.is_active) {
    const err = new Error('Account is deactivated. Contact support.');
    err.statusCode = 403;
    throw err;
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }
  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  return { user: sanitize(user), token };
};

const getProfile = async (id) => {
  const user = await UserModel.findById(id);
  if (!user) { const e = new Error('User not found'); e.statusCode = 404; throw e; }
  return sanitize(user);
};

const updateProfile = async (id, data) => {
  await UserModel.updateProfile(id, data);
  return getProfile(id);
};

const changePassword = async (id, { current_password, new_password }) => {
  const [rows] = await require('../config/db').query(
    `SELECT password_hash FROM users WHERE id=?`, [id]
  );
  const user = rows[0];
  if (!user) { const e = new Error('User not found'); e.statusCode = 404; throw e; }
  const valid = await bcrypt.compare(current_password, user.password_hash);
  if (!valid) { const e = new Error('Current password is incorrect'); e.statusCode = 400; throw e; }
  const hash = await bcrypt.hash(new_password, 12);
  await UserModel.updatePassword(id, hash);
};

const sanitize = (u) => {
  const { password_hash, ...rest } = u;
  return rest;
};

module.exports = { register, login, getProfile, updateProfile, changePassword };
