const EventModel    = require('../models/event.model');
const SeatModel     = require('../models/seat.model');
const db            = require('../config/db');

const listEvents = async (query) => {
  return EventModel.getAll(query);
};

const getEvent = async (id) => {
  const event = await EventModel.findById(id);
  if (!event) { const e = new Error('Event not found'); e.statusCode = 404; throw e; }
  return event;
};

const createEvent = async (organizer_id, data) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // If organizer, default to approved; admin can set any status
    const eventId = await EventModel.create({ ...data, organizer_id });

    // Generate seats
    await SeatModel.generateSeats(eventId, data.total_seats, data.ticket_price, conn);

    await conn.commit();
    return EventModel.findById(eventId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const updateEvent = async (id, organizer_id, role, data) => {
  const event = await EventModel.findById(id);
  if (!event) { const e = new Error('Event not found'); e.statusCode = 404; throw e; }
  if (role !== 'admin' && event.organizer_id !== organizer_id) {
    const e = new Error('Forbidden: not your event'); e.statusCode = 403; throw e;
  }
  await EventModel.update(id, data);
  return EventModel.findById(id);
};

const deleteEvent = async (id, organizer_id, role) => {
  const event = await EventModel.findById(id);
  if (!event) { const e = new Error('Event not found'); e.statusCode = 404; throw e; }
  if (role !== 'admin' && event.organizer_id !== organizer_id) {
    const e = new Error('Forbidden: not your event'); e.statusCode = 403; throw e;
  }
  await EventModel.remove(id);
};

const approveEvent = async (id, status) => {
  const event = await EventModel.findById(id);
  if (!event) { const e = new Error('Event not found'); e.statusCode = 404; throw e; }
  await EventModel.updateStatus(id, status);
  return EventModel.findById(id);
};

module.exports = { listEvents, getEvent, createEvent, updateEvent, deleteEvent, approveEvent };
