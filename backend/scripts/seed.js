/**
 * Full database seeder — run with: npm run seed
 * Creates roles, categories, users, events, and seats.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db     = require('../config/db');

async function seed() {
  console.log('🌱 Starting database seed...\n');

  // ── Roles (already seeded by database.sql, but ensure) ──
  await db.query(`INSERT IGNORE INTO roles (name) VALUES ('user'),('organizer'),('admin')`);
  console.log('✅  Roles ok');

  // ── Categories ───────────────────────────────────────────
  await db.query(`INSERT IGNORE INTO categories (name, icon) VALUES
    ('Music','music_note'),('Technology','computer'),('Sports','sports'),
    ('Arts','palette'),('Business','business'),('Food','restaurant'),
    ('Health','favorite'),('Education','school'),
    ('Comedy','sentiment_very_satisfied'),('Other','event')`);
  console.log('✅  Categories ok');

  // ── Users ────────────────────────────────────────────────
  const SALT = 12;
  const users = [
    { full_name:'Platform Admin',  email:'admin@eventhub.com',     password:'admin123',    role:'admin'     },
    { full_name:'Ravi Sharma',     email:'ravi@eventhub.com',      password:'password123', role:'organizer' },
    { full_name:'Priya Mehta',     email:'priya@eventhub.com',     password:'password123', role:'organizer' },
    { full_name:'Aarav Patel',     email:'aarav@example.com',      password:'password123', role:'user'      },
    { full_name:'Meera Nair',      email:'meera@example.com',      password:'password123', role:'user'      },
    { full_name:'Rohan Gupta',     email:'rohan@example.com',      password:'password123', role:'user'      },
  ];

  const userIds = {};
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, SALT);
    const [[role]] = await db.query(`SELECT id FROM roles WHERE name=? LIMIT 1`, [u.role]);
    const [existing] = await db.query(`SELECT id FROM users WHERE email=? LIMIT 1`, [u.email]);
    if (existing.length > 0) {
      await db.query(`UPDATE users SET password_hash=?, role_id=? WHERE email=?`, [hash, role.id, u.email]);
      userIds[u.email] = existing[0].id;
      console.log(`   ↻  Updated user: ${u.email}`);
    } else {
      const [res] = await db.query(
        `INSERT INTO users (full_name, email, password_hash, role_id) VALUES (?,?,?,?)`,
        [u.full_name, u.email, hash, role.id]
      );
      userIds[u.email] = res.insertId;
      console.log(`   +  Created user: ${u.email}`);
    }
  }
  console.log('✅  Users ok\n');

  // ── Events ────────────────────────────────────────────────
  const [[cat1]]  = await db.query(`SELECT id FROM categories WHERE name='Music' LIMIT 1`);
  const [[cat2]]  = await db.query(`SELECT id FROM categories WHERE name='Technology' LIMIT 1`);
  const [[cat3]]  = await db.query(`SELECT id FROM categories WHERE name='Sports' LIMIT 1`);
  const [[cat4]]  = await db.query(`SELECT id FROM categories WHERE name='Arts' LIMIT 1`);
  const [[cat5]]  = await db.query(`SELECT id FROM categories WHERE name='Business' LIMIT 1`);
  const [[cat6]]  = await db.query(`SELECT id FROM categories WHERE name='Food' LIMIT 1`);
  const [[cat7]]  = await db.query(`SELECT id FROM categories WHERE name='Health' LIMIT 1`);
  const [[cat9]]  = await db.query(`SELECT id FROM categories WHERE name='Comedy' LIMIT 1`);
  const [[cat10]] = await db.query(`SELECT id FROM categories WHERE name='Education' LIMIT 1`);

  const raviId  = userIds['ravi@eventhub.com'];
  const priyaId = userIds['priya@eventhub.com'];

  const events = [
    { org: raviId,  cat: cat1.id,  title: 'Bangalore Jazz Festival 2025',     desc: 'A night of soulful jazz featuring top artists from across India. Food stalls, art installations, and non-stop music await!',                                          venue: 'Palace Grounds',                 city: 'Bangalore', state: 'Karnataka',    date: '2025-07-15', start: '18:00', end: '23:00', seats: 50,   price: 999.00 },
    { org: raviId,  cat: cat2.id,  title: 'DevFest India 2025',               desc: 'Google Developer Festival celebrating tech innovation. Talks on AI, Flutter, Firebase, Cloud and more from industry leaders.',                                          venue: 'NIMHANS Convention Centre',      city: 'Bangalore', state: 'Karnataka',    date: '2025-08-02', start: '09:00', end: '18:00', seats: 100,  price: 499.00 },
    { org: priyaId, cat: cat3.id,  title: 'IPL Fan Park – Mumbai',            desc: 'Watch IPL matches on a giant LED screen with fellow fans. Food, games, contests and prizes every match night!',                                                         venue: 'Bandra-Kurla Complex',           city: 'Mumbai',    state: 'Maharashtra', date: '2025-09-10', start: '19:00', end: '23:30', seats: 200,  price: 299.00 },
    { org: priyaId, cat: cat4.id,  title: 'National Art Expo 2025',           desc: 'A curated exhibition of contemporary Indian art — paintings, sculpture, digital art and live installations by 50+ artists.',                                           venue: 'National Gallery of Modern Art', city: 'Delhi',     state: 'Delhi',        date: '2025-07-20', start: '10:00', end: '20:00', seats: 30,   price: 199.00 },
    { org: raviId,  cat: cat5.id,  title: 'Startup Pitch Night',              desc: 'Founders pitch to top VCs and Angel investors. Network with 200+ startup ecosystem leaders over cocktails and dinner.',                                                  venue: 'WeWork Galaxy',                  city: 'Bangalore', state: 'Karnataka',    date: '2025-07-25', start: '17:00', end: '21:00', seats: 20,   price: 1499.00},
    { org: priyaId, cat: cat6.id,  title: 'Street Food Festival Mumbai',      desc: 'Over 100 food stalls serving cuisines from every corner of India! Live cooking demos, chef battles, and eating contests.',                                             venue: 'Juhu Beach',                     city: 'Mumbai',    state: 'Maharashtra', date: '2025-08-15', start: '11:00', end: '22:00', seats: 500,  price: 99.00  },
    { org: raviId,  cat: cat7.id,  title: 'Yoga & Wellness Summit',           desc: 'A holistic day of yoga sessions, Ayurveda workshops, meditation practices, and wellness talks by certified practitioners.',                                             venue: 'Leela Palace',                   city: 'Bangalore', state: 'Karnataka',    date: '2025-08-10', start: '06:00', end: '14:00', seats: 15,   price: 799.00 },
    { org: priyaId, cat: cat10.id, title: "BYJU'S Education Conclave",        desc: 'The future of education — panel discussions on EdTech, NEP 2020, hybrid learning models, and student-centric pedagogy.',                                               venue: 'Hyatt Regency',                  city: 'Chennai',   state: 'Tamil Nadu',   date: '2025-09-05', start: '09:00', end: '17:00', seats: 40,   price: 599.00 },
    { org: raviId,  cat: cat9.id,  title: 'Stand-Up Comedy Night',            desc: "4 of India's hottest comedians take the stage for a 2-hour laughter riot you won't forget!",                                                                          venue: 'Canvas Laugh Club',              city: 'Mumbai',    state: 'Maharashtra', date: '2025-07-18', start: '20:00', end: '22:30', seats: 25,   price: 699.00 },
    { org: priyaId, cat: cat1.id,  title: 'Sufi Night Under the Stars',       desc: 'An enchanting evening of Sufi music, ghazals, and qawwali performed by maestros from Rajasthan and Punjab.',                                                           venue: 'Amer Fort Lawns',               city: 'Jaipur',    state: 'Rajasthan',    date: '2025-08-22', start: '19:30', end: '23:00', seats: 35,   price: 1299.00},
  ];

  const SeatModel = require('../models/seat.model');

  for (const ev of events) {
    // Check if event already exists
    const [exists] = await db.query(`SELECT id FROM events WHERE title=? AND organizer_id=? LIMIT 1`, [ev.title, ev.org]);
    if (exists.length > 0) {
      console.log(`   ↻  Event exists: ${ev.title}`);
      continue;
    }
    const [res] = await db.query(
      `INSERT INTO events (organizer_id, category_id, title, description, venue, city, state, country,
         event_date, start_time, end_time, total_seats, available_seats, ticket_price, status)
       VALUES (?,?,?,?,?,?,?,'India',?,?,?,?,?,?,'approved')`,
      [ev.org, ev.cat, ev.title, ev.desc, ev.venue, ev.city, ev.state,
       ev.date, ev.start, ev.end, ev.seats, ev.seats, ev.price]
    );
    const eventId = res.insertId;
    await SeatModel.generateSeats(eventId, ev.seats, ev.price);
    console.log(`   +  Created event: ${ev.title} (${ev.seats} seats)`);
  }

  console.log('\n✅  Events & Seats ok');
  console.log('\n🎉 Seed complete!\n');
  console.log('📋 Demo Login Credentials:');
  console.log('   Admin:     admin@eventhub.com     / admin123');
  console.log('   Organizer: ravi@eventhub.com      / password123');
  console.log('   User:      aarav@example.com      / password123\n');
  process.exit(0);
}

seed().catch(err => { console.error('❌ Seed failed:', err.message); process.exit(1); });
