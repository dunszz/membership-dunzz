#!/usr/bin/env node

/**
 * Database Migration Script
 * Run this once to set up the users table in your Neon database
 * 
 * Usage:
 * npx ts-node scripts/migrate.ts
 */

import pool from '@/lib/db';

async function migrate() {
  try {
    console.log('Starting database migration...');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role VARCHAR(16) NOT NULL DEFAULT 'member',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_login TIMESTAMPTZ
      );
    `);

    console.log('✓ Users table created successfully');

    // Create index on email
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    console.log('✓ Email index created');

    console.log('\n✓ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Set your JWT_SECRET environment variable');
    console.log('2. Run: node scripts/seed.js (to create initial admin user)');

    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
