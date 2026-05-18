const express       = require('express');
const cors          = require('cors');
const morgan        = require('morgan');
const path          = require('path');
require('dotenv').config();

// Route imports
const authRoutes      = require('./routes/auth.routes');
const userRoutes      = require('./routes/user.routes');
const eventRoutes     = require('./routes/event.routes');
const categoryRoutes  = require('./routes/category.routes');
const seatRoutes      = require('./routes/seat.routes');
const bookingRoutes   = require('./routes/booking.routes');
const paymentRoutes   = require('./routes/payment.routes');
const adminRoutes     = require('./routes/admin.routes');
const organizerRoutes = require('./routes/organizer.routes');

// Middleware
const errorHandler    = require('./middleware/errorHandler');
const { cleanExpiredLocks } = require('./utils/seatLockCleaner');

const app = express();

// ── Core Middleware ─────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Static Files (Uploads) ──────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ──────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/events',    eventRoutes);
app.use('/api/categories',categoryRoutes);
app.use('/api/seats',     seatRoutes);
app.use('/api/bookings',  bookingRoutes);
app.use('/api/payments',  paymentRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/organizer', organizerRoutes);

// ── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 Handler ─────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ────────────────────────────────────
app.use(errorHandler);

// ── Seat Lock Cleanup Job (every 5 min) ────────────────────
setInterval(cleanExpiredLocks, 5 * 60 * 1000);

// ── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT}`);
  console.log(`📌  Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
