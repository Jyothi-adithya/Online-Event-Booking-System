const PaymentModel = require('../models/payment.model');
const BookingModel = require('../models/booking.model');

// Simulated payment — always succeeds (payment already done in booking service)
// This endpoint can be used to re-trigger or check payment status
const getPaymentStatus = async (req, res, next) => {
  try {
    const booking = await BookingModel.findById(+req.params.booking_id);
    if (!booking) { return res.status(404).json({ success: false, message: 'Booking not found' }); }
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const payment = await PaymentModel.findByBooking(+req.params.booking_id);
    res.json({ success: true, data: payment });
  } catch (err) { next(err); }
};

const getAllPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const result = await PaymentModel.getAll({ page: +page, limit: +limit, status });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getRevenueSummary = async (req, res, next) => {
  try {
    const summary = await PaymentModel.getRevenueSummary();
    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
};

module.exports = { getPaymentStatus, getAllPayments, getRevenueSummary };
