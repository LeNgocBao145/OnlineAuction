// ------------------------
// |     User Queries     |
// ------------------------
export const getUserByEmail = `SELECT * FROM users WHERE email = $1`;

export const getUserById = `SELECT * FROM users WHERE id = $1`;

export const createUser = `INSERT INTO users (name, email, hashed_password, birthdate, address, role, rating) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;

export const getUsers = `SELECT * FROM users`;

export const deleteUserById = `DELETE FROM users WHERE id = $1`;

export const updateUserById = `UPDATE users SET name = $1, email = $2, birthdate = $3, address = $4, role = $5, rating = $6 WHERE id = $7 RETURNING *`;

// ---------------------------
// |     Session Queries     |
// ---------------------------
export const createSession = `INSERT INTO sessions (user_id, refresh_token, expired_at) VALUES ($1, $2, $3)`;

export const getSessionByRefreshToken = `SELECT * FROM sessions WHERE refresh_token = $1`;

export const deleteSessionByRefreshToken = `DELETE FROM sessions WHERE refresh_token = $1`;

// ----------------------------
// |     Category Queries     |
// ----------------------------
export const getCategories = `SELECT * FROM categories`;

// ---------------------------
// |     Product Queries     |
// ---------------------------

//Products
export const createProduct = `INSERT INTO products (name, current_price, image) VALUES ($1, $2, $3) RETURNING id`;

export const getProducts = `SELECT * FROM products`;

export const getProductById = `SELECT * FROM products WHERE id = $1`;

export const createSellProduct = `INSERT INTO sell_product(product, seller, init_price, step_price, instant_price, starting_at, expired_at, "isExtent")
                                            VALUES($1, $2, $3, $4, $5, $6, $7, $8)`;
//Product images
export const createProductImages = `INSERT INTO product_images (product, image_path) VALUES ($1, $2::varchar(500)[]) RETURNING *`;

export const updateProductImages = ``;

export const getProductImages = `SELECT * FROM product_images`;

export const getProductImagesById = `SELECT * FROM product_images WHERE product = $1`;


//Product descriptions
export const createProductDescription = `INSERT INTO product_descriptions (product, description) VALUES ($1, $2) RETURNING *`;

export const getProductDescription = `SELECT * FROM product_descriptions WHERE id = $1 AND product = $2`;
// Admin Queries

