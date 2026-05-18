const SeatModel = require('../models/seat.model');

/**
 * Runs on a setInterval every 5 minutes.
 * Releases seats that were locked but never confirmed.
 */
const cleanExpiredLocks = async () => {
  try {
    const minutes = parseInt(process.env.SEAT_LOCK_MINUTES || '10', 10);
    const released = await SeatModel.releaseExpiredLocks(minutes);
    if (released > 0) {
      console.log(`🔓  Released ${released} expired seat lock(s)`);
    }
  } catch (err) {
    console.error('Seat lock cleaner error:', err.message);
  }
};

module.exports = { cleanExpiredLocks };
