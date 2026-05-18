const BookingService = require('../services/booking.service');
const BookingModel   = require('../models/booking.model');

const createBooking = async (req, res, next) => {
  try {
    const result = await BookingService.createBooking(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Booking confirmed!', data: result });
  } catch (err) { next(err); }
};

const getMyBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await BookingService.getUserBookings(req.user.id, { page: +page, limit: +limit });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getBookingDetail = async (req, res, next) => {
  try {
    const result = await BookingService.getBookingDetail(+req.params.id, req.user.id, req.user.role);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const cancelBooking = async (req, res, next) => {
  try {
    const result = await BookingService.cancelBooking(+req.params.id, req.user.id, req.user.role);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

// Admin: all bookings
const getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const result = await BookingModel.getAllBookings({ page: +page, limit: +limit, status });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

module.exports = { createBooking, getMyBookings, getBookingDetail, cancelBooking, getAllBookings };
