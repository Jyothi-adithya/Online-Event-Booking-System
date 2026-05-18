/**
 * Run this script to create/reset the admin user with correct password hash.
 * Usage: node scripts/createAdmin.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db     = require('../config/db');

async function createAdmin() {
  const email    = 'admin@eventhub.com';
  const password = 'admin123';
  const fullName = 'Platform Admin';

  try {
    const hash = await bcrypt.hash(password, 12);
    console.log('✅ Generated hash:', hash);

    // Get admin role_id
    const [[role]] = await db.query(`SELECT id FROM roles WHERE name='admin' LIMIT 1`);
    if (!role) { console.error('❌ Admin role not found — did you run database.sql first?'); process.exit(1); }

    // Upsert admin user
    const [existing] = await db.query(`SELECT id FROM users WHERE email=? LIMIT 1`, [email]);
    if (existing.length > 0) {
      await db.query(`UPDATE users SET password_hash=?, role_id=?, is_active=1 WHERE email=?`, [hash, role.id, email]);
      console.log('✅ Admin password reset successfully!');
    } else {
      await db.query(
        `INSERT INTO users (full_name, email, password_hash, role_id) VALUES (?,?,?,?)`,
        [fullName, email, hash, role.id]
      );
      console.log('✅ Admin user created successfully!');
    }

    console.log('\n🔑 Login with:');
    console.log('   Email:    admin@eventhub.com');
    console.log('   Password: admin123\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createAdmin();
