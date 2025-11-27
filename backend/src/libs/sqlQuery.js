
// User Queries
export const getUserByEmail = `SELECT * FROM users WHERE email = $1`;

export const createUser = `INSERT INTO users (name, email, hashed_password, birthdate, address) VALUES ($1, $2, $3, $4, $5) RETURNING *`;

// Session Queries
export const createSession = `INSERT INTO sessions (user_id, refresh_token, expired_at) VALUES ($1, $2, $3)`;

export const getSessionByRefreshToken = `SELECT * FROM sessions WHERE refresh_token = $1`;

export const deleteSessionByRefreshToken = `DELETE FROM sessions WHERE refresh_token = $1`;