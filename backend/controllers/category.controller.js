const CategoryModel = require('../models/category.model');

const getAll = async (req, res, next) => {
  try {
    const cats = await CategoryModel.getAll();
    res.json({ success: true, data: cats });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const id = await CategoryModel.create(req.body);
    const cat = await CategoryModel.findById(id);
    res.status(201).json({ success: true, data: cat });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    await CategoryModel.update(+req.params.id, req.body);
    const cat = await CategoryModel.findById(+req.params.id);
    res.json({ success: true, data: cat });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await CategoryModel.remove(+req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAll, create, update, remove };
