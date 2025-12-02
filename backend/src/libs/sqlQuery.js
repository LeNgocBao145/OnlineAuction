
// User Queries
export const getUserByEmail = `SELECT * FROM users WHERE email = $1`;

export const getUserById = `SELECT * FROM users WHERE id = $1`;

export const createUser = `INSERT INTO users (name, email, hashed_password, birthdate, address, role, rating) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;

export const getUsers = `SELECT * FROM users`;

export const deleteUserById = `DELETE FROM users WHERE id = $1`;

export const updateUserById = `UPDATE users SET name = $1, email = $2, birthdate = $3, address = $4, role = $5, rating = $6 WHERE id = $7 RETURNING *`;

// Session Queries
export const createSession = `INSERT INTO sessions (user_id, refresh_token, expired_at) VALUES ($1, $2, $3)`;

export const getSessionByRefreshToken = `SELECT * FROM sessions WHERE refresh_token = $1`;

export const deleteSessionByRefreshToken = `DELETE FROM sessions WHERE refresh_token = $1`;

// Category Queries
export const getCategories = `SELECT * FROM categories`;

// Product Queries
export const getProducts = `SELECT * FROM products`;

export const getProductById = `SELECT * FROM products WHERE id = $1`;

export const createProduct = `INSERT INTO products (name, description, image, start_price, current_price, end_time, seller_id, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;

export const updateProductById = `UPDATE products SET name = $1, description = $2, image = $3, start_price = $4, current_price = $5, end_time = $6, seller_id = $7, category_id = $8 WHERE id = $9 RETURNING *`;

export const deleteProductById = `DELETE FROM products WHERE id = $1`;

// Product Description Queries
export const getProductDescriptionsByProductId = `SELECT * FROM product_descriptions WHERE product_id = $1`;

export const createProductDescription = `INSERT INTO product_descriptions (product_id, description, created_at) VALUES ($1, $2, $3) RETURNING *`;

// Admin Queries

