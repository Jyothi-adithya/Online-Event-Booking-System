const AuthService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json({ success: true, message: 'Registration successful', data: result });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const result = await AuthService.login(req.body);
    res.json({ success: true, message: 'Login successful', data: result });
  } catch (err) { next(err); }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await AuthService.getProfile(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await AuthService.updateProfile(req.user.id, req.body);
    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    await AuthService.changePassword(req.user.id, req.body);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) { next(err); }
};

module.exports = { register, login, getProfile, updateProfile, changePassword };
