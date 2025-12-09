
// User Queries
export const getUserByEmail = `SELECT * FROM users WHERE email = $1`;
export const createUser = `INSERT INTO users (name, email, hashed_password, birthdate, address) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
export const getUserByProviderId = `SELECT * FROM users WHERE oauth_provider = $1 AND oauth_provider_id = $2`;
export const createOAuthUser = `INSERT INTO users (name, email, oauth_provider, oauth_provider_id, birthdate, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;

// Session Queries
export const createSession = `INSERT INTO sessions (user_id, refresh_token, expired_at) VALUES ($1, $2, $3)`;

export const getSessionByRefreshToken = `SELECT * FROM sessions WHERE refresh_token = $1`;