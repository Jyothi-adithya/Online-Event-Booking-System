const SeatModel = require('../models/seat.model');
const BookingService = require('../services/booking.service');

const getSeats = async (req, res, next) => {
  try {
    const seats = await SeatModel.getByEvent(+req.params.event_id);
    // Group by row for easier frontend rendering
    const grouped = seats.reduce((acc, s) => {
      if (!acc[s.row_label]) acc[s.row_label] = [];
      acc[s.row_label].push(s);
      return acc;
    }, {});
    res.json({ success: true, data: { seats, grouped } });
  } catch (err) { next(err); }
};

const lockSeats = async (req, res, next) => {
  try {
    const { event_id, seat_ids } = req.body;
    const result = await BookingService.lockSeats(req.user.id, event_id, seat_ids);
    res.json({ success: true, message: 'Seats locked', data: result });
  } catch (err) { next(err); }
};

module.exports = { getSeats, lockSeats };
