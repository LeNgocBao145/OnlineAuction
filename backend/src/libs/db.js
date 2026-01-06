import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configure pg to return timestamps as ISO strings with UTC indicator
// Type OIDs: 1114 = TIMESTAMP, 1184 = TIMESTAMPTZ
const { types } = pg;

// Parse TIMESTAMP (without timezone) - treat as UTC and return ISO string
types.setTypeParser(1114, (val) => {
    if (!val) return null;
    // Append 'Z' to indicate UTC since our database is set to UTC timezone
    return val.replace(' ', 'T') + 'Z';
});

// Parse TIMESTAMPTZ (with timezone) - return as ISO string
types.setTypeParser(1184, (val) => {
    if (!val) return null;
    // PostgreSQL returns this in the session timezone (UTC), convert to ISO
    const date = new Date(val);
    return date.toISOString();
});

// Parse DATE type - return as ISO date string
types.setTypeParser(1082, (val) => {
    if (!val) return null;
    return val; // Keep as YYYY-MM-DD string
});

const requiredEnvVars = [
    'PG_HOST',
    'PG_DATABASE',
    'PG_USER',
    'PG_PASSWORD',
    'PG_PORT',
    'PG_SSL',
];

requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
});

const db = new pg.Pool({
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    port: parseInt(process.env.PG_PORT, 10),
    ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    statement_timeout: 30000,
});

// Set session timezone to UTC for all connections in the pool
db.on('connect', (client) => {
    client.query("SET timezone = 'UTC'");
});

// Test connection
db.query('SELECT NOW()')
    .then(() => {
        console.log("Connect successfully with postgres database!")
    })
    .catch((err) => {
        console.log("Couldn't connect to database", err)
        // Don't exit, allow server to start
    });

db.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    // Don't exit process, just log the error
});

const query = async (text, params) => {
    try {
        const result = await db.query(text, params);
        return result;
    } catch (error) {
        console.error('Database query error:', error.message);
        throw error;
    }
};

export default query;