const db          = require('../config/db');
const SeatModel   = require('../models/seat.model');
const BookingModel = require('../models/booking.model');
const PaymentModel = require('../models/payment.model');
const EventModel   = require('../models/event.model');

const LOCK_MINUTES = parseInt(process.env.SEAT_LOCK_MINUTES || '10', 10);

/**
 * PHASE 6 — Lock selected seats (temporary reservation)
 */
const lockSeats = async (user_id, event_id, seat_ids) => {
  if (!seat_ids || seat_ids.length === 0) {
    const e = new Error('No seats selected'); e.statusCode = 400; throw e;
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // FOR UPDATE locks rows to prevent race conditions
    const seats = await SeatModel.findByIds(seat_ids, conn);

    if (seats.length !== seat_ids.length) {
      const e = new Error('One or more seats not found'); e.statusCode = 404; throw e;
    }

    const unavailable = seats.filter(s =>
      s.status === 'booked' ||
      (s.status === 'locked' && s.locked_by !== user_id &&
       new Date(s.locked_at).getTime() + LOCK_MINUTES * 60000 > Date.now())
    );

    if (unavailable.length > 0) {
      const e = new Error(`Seats already taken: ${unavailable.map(s => s.seat_code).join(', ')}`);
      e.statusCode = 409; throw e;
    }

    await SeatModel.lockSeats(seat_ids, user_id, conn);
    await conn.commit();

    return {
      locked_seats: seat_ids,
      expires_in_minutes: LOCK_MINUTES,
      expires_at: new Date(Date.now() + LOCK_MINUTES * 60000).toISOString(),
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * PHASE 7 — Confirm booking with full DB transaction
 */
const createBooking = async (user_id, { event_id, seat_ids, payment_method = 'card' }) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Re-fetch seats with FOR UPDATE (strict consistency)
    const seats = await SeatModel.findByIds(seat_ids, conn);

    if (seats.length !== seat_ids.length) {
      throw Object.assign(new Error('One or more seats not found'), { statusCode: 404 });
    }

    // 2. Re-check availability (double-booking prevention)
    const invalid = seats.filter(s =>
      s.status === 'booked' ||
      (s.status !== 'locked' || s.locked_by !== user_id)
    );

    if (invalid.length > 0) {
      throw Object.assign(
        new Error(`Seats not locked by you: ${invalid.map(s => s.seat_code).join(', ')}`),
        { statusCode: 409 }
      );
    }

    // 3. Calculate total
    const total_amount = seats.reduce((sum, s) => sum + parseFloat(s.price), 0);

    // 4. Insert booking + booking_seats
    const { booking_id, booking_reference } = await BookingModel.create(conn, {
      user_id, event_id, seat_ids, total_amount,
    });

    // 5. Mark seats as booked
    await SeatModel.bookSeats(seat_ids, conn);

    // 6. Decrement available_seats on event
    await EventModel.updateAvailableSeats(conn, event_id, -seat_ids.length);

    // 7. Simulate payment (always succeeds in simulation)
    const { payment_id, transaction_id } = await PaymentModel.create(conn, {
      booking_id, user_id, amount: total_amount, payment_method,
    });

    // 8. Mark payment success & booking confirmed
    await PaymentModel.updateStatus(conn, booking_id, 'success');
    await BookingModel.confirm(conn, booking_id);

    await conn.commit();

    return {
      booking_id,
      booking_reference,
      total_amount,
      total_seats: seat_ids.length,
      payment_id,
      transaction_id,
      status: 'confirmed',
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * Cancel a booking — release seats and process refund
 */
const cancelBooking = async (booking_id, user_id, role) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const booking = await BookingModel.findById(booking_id, conn);
    if (!booking) { throw Object.assign(new Error('Booking not found'), { statusCode: 404 }); }

    if (role !== 'admin' && booking.user_id !== user_id) {
      throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    }
    if (booking.status === 'cancelled') {
      throw Object.assign(new Error('Booking already cancelled'), { statusCode: 400 });
    }

    // Release seats
    const seat_ids = await BookingModel.getBookedSeatIds(booking_id);
    await SeatModel.releaseSeats(seat_ids, conn);
    await EventModel.updateAvailableSeats(conn, booking.event_id, seat_ids.length);

    // Cancel booking
    await conn.query(`UPDATE bookings SET status='cancelled', cancelled_at=NOW() WHERE id=?`, [booking_id]);

    // Refund payment
    await PaymentModel.updateStatus(conn, booking_id, 'refunded');

    await conn.commit();
    return { message: 'Booking cancelled and refund initiated.' };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const getUserBookings = async (user_id, query) => BookingModel.getUserBookings(user_id, query);
const getBookingDetail = async (booking_id, user_id, role) => {
  const booking = await BookingModel.findById(booking_id);
  if (!booking) { throw Object.assign(new Error('Booking not found'), { statusCode: 404 }); }
  if (role !== 'admin' && booking.user_id !== user_id) {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
  }
  const seats = await BookingModel.getSeats(booking_id);
  const payment = await PaymentModel.findByBooking(booking_id);
  return { ...booking, seats, payment };
};

module.exports = { lockSeats, createBooking, cancelBooking, getUserBookings, getBookingDetail };
