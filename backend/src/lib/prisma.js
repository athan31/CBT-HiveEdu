require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Ekspos pool untuk $queryRaw manual jika Prisma v7 client engine
// tidak mengenali kolom baru dari schema.
const pgQuery = (text, values) => pool.query(text, values);

module.exports = { prisma, pgQuery };
