import pg from 'pg'
import env from 'dotenv'

env.config();

// Build connection string for Neon
const connectionString = `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}?sslmode=require`;

const db = new pg.Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
});

// Test the connection
(async () => {
    try {
        const client = await db.connect();
        console.log('✅ Connected to PostgreSQL database successfully');
        client.release();
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
    }
})();

db.on('error', (err) => {
    console.error('Database pool error:', err);
});

const query = async (text, params) => {
    try {
        const result = await db.query(text, params);
        return result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};
export default query;