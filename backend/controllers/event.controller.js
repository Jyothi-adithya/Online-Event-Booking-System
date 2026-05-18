const EventService  = require('../services/event.service');
const EventModel    = require('../models/event.model');

const listEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, category, city, search, date, status } = req.query;
    const result = await EventService.listEvents({
      page: +page, limit: +limit, category, city, search, date,
      status: status || 'approved',
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getEvent = async (req, res, next) => {
  try {
    const event = await EventService.getEvent(+req.params.id);
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
};

const createEvent = async (req, res, next) => {
  try {
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const event = await EventService.createEvent(req.user.id, { ...req.body, image_url, total_seats: +req.body.total_seats });
    res.status(201).json({ success: true, message: 'Event created', data: event });
  } catch (err) { next(err); }
};

const updateEvent = async (req, res, next) => {
  try {
    const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;
    const event = await EventService.updateEvent(+req.params.id, req.user.id, req.user.role, { ...req.body, image_url });
    res.json({ success: true, message: 'Event updated', data: event });
  } catch (err) { next(err); }
};

const deleteEvent = async (req, res, next) => {
  try {
    await EventService.deleteEvent(+req.params.id, req.user.id, req.user.role);
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) { next(err); }
};

const approveEvent = async (req, res, next) => {
  try {
    const { status } = req.body; // 'approved' | 'rejected'
    const event = await EventService.approveEvent(+req.params.id, status);
    res.json({ success: true, message: `Event ${status}`, data: event });
  } catch (err) { next(err); }
};

module.exports = { listEvents, getEvent, createEvent, updateEvent, deleteEvent, approveEvent };
