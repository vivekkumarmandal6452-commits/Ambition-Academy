import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is missing in backend/.env');
  process.exit(1);
}

async function runMigrationAndSeed() {
  console.log('⚡ Connecting to Supabase PostgreSQL database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Connected to database successfully!');

    const schemaPath = path.resolve(__dirname, '../../../supabase/migrations/001_schema.sql');
    const seedPath = path.resolve(__dirname, '../../../supabase/seed.sql');

    if (fs.existsSync(schemaPath)) {
      console.log('📜 Executing schema migration (001_schema.sql)...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      await client.query(schemaSql);
      console.log('✅ Schema migration complete!');
    }

    if (fs.existsSync(seedPath)) {
      console.log('🌱 Executing database seed (seed.sql)...');
      const seedSql = fs.readFileSync(seedPath, 'utf-8');
      await client.query(seedSql);
      console.log('✅ Database seed complete!');
    }

    console.log('🚀 Database setup is fully complete and ready!');
  } catch (err: any) {
    console.error('❌ Error executing database migration/seed:', err.message);
  } finally {
    await client.end();
  }
}

runMigrationAndSeed();
