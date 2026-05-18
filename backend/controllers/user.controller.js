const UserModel = require('../models/user.model');

const getUser = async (req, res, next) => {
  try {
    const user = await UserModel.findById(+req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

module.exports = { getUser };
