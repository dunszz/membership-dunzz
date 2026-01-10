#!/usr/bin/env node

/**
 * Database Seed Script
 * Creates admin user with Neon database
 * 
 * Usage:
 * node scripts/seed.js "postgresql://user:pass@host/db?sslmode=require"
 * OR if DATABASE_URL is in .env.local:
 * node scripts/seed.js
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Get DATABASE_URL from argument or .env.local
let databaseUrl = process.argv[2];

if (!databaseUrl) {
  // Try to load from .env.local
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/DATABASE_URL=(.+)/);
    if (match) {
      databaseUrl = match[1].trim();
    }
  }
}

if (!databaseUrl) {
  console.error('\n❌ DATABASE_URL not found!');
  console.error('\nUsage:');
  console.error('  node scripts/seed.js "postgresql://user:pass@host/db?sslmode=require"');
  console.error('\nOr add DATABASE_URL to .env.local');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }, // Neon requires SSL
});

async function seed() {
  const client = await pool.connect();
  
  try {
    console.log('\n🔄 Connecting to Neon database...');
    
    // Test connection
    await client.query('SELECT NOW()');
    console.log('✅ Connected to Neon successfully!');

    console.log('\n🌱 Seeding database...');

    // Hash password
    const adminPassword = await bcrypt.hash('dunz123', 10);

    // Insert admin user
    const result = await client.query(
      `INSERT INTO users (email, password_hash, role, is_active) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET password_hash = $2
       RETURNING id, email, role`,
      ['dunzz@gmail.com', adminPassword, 'admin', true]
    );

    const user = result.rows[0];
    console.log(`✅ Admin user created/updated:`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🔑 Password: dunz123`);
    console.log(`   👤 Role: ${user.role}`);
    console.log(`   🆔 ID: ${user.id}`);

    console.log('\n✨ Seeding completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Email: dunzz@gmail.com');
    console.log('   Password: dunz123');
    console.log('   Role: admin');
    console.log('   Path: /admin');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Hint: Check if DATABASE_URL is set in .env.local');
    }
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
