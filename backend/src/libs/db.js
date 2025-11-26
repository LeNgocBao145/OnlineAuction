import pg from 'pg'
import env from 'dotenv'

env.config();

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
    ssl: process.env.PG_SSL === 'true',
});

db.connect()
    .then(()=>{
        console.log("Connect successfully with postgres database!")
    })
    .catch((err) => { 
        console.log("Couldn't connect to database", err) 
        process.exit(1);
    });

db.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

const query = (text, params) => db.query(text, params);
export default query;