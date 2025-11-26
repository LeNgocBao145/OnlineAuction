export const getUserByEmail = `SELECT * FROM users WHERE email = $1`;

export const createSession = `INSERT INTO sessions (user_id, refresh_token, expired_at) VALUES ($1, $2, $3)`;