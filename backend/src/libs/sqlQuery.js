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

export const getListProducts = (type, order) => {
    let query;
    switch (type) {
        case 'ENDING_SOON':
            query = `SELECT
                        p.name,
                        p.current_price,
                        CEIL(EXTRACT(EPOCH FROM (sp.expired_at - NOW())) / 60) AS minutes_left
                     FROM sell_product sp
                     JOIN products p ON p.id = sp.product
                     WHERE p.state = 'bidding'
                     AND sp.expired_at > NOW()
                     ORDER BY sp.expired_at ${order}
                     LIMIT $1`;
            break;
        case 'MOST_BIDDED':
            query = `SELECT 
                        p.id, 
                        p.name, 
                        count(b.id) AS bids,
                        p.current_price
                     FROM products p
                     LEFT JOIN bids b ON b.product = p.id
                     GROUP BY p.id, p.name, p.current_price
                     ORDER BY bids ${order}
                     LIMIT $1`
            break;
        case 'HIGHEST_PRICE':
            query = `SELECT
                        p.id,
                        p.name,
                        count(b.id) AS bids,
                        p.current_price
                     FROM products p
                     LEFT JOIN bids b ON b.product = p.id
                     GROUP BY p.id, p.name, p.current_price
                     ORDER BY p.current_price ${order}
                     LIMIT $1`
            break;
    }
    return query;
}

//Product descriptions
export const createProductDescription = `INSERT INTO product_descriptions (product, description) VALUES ($1, $2) RETURNING *`;

export const getProductDescription = `SELECT * FROM product_descriptions WHERE id = $1 AND product = $2`;

//Category
export const getListCategories =   `SELECT
                                        p.id,
                                        p.name,
                                        COALESCE(
                                            JSONB_AGG(
                                            JSONB_BUILD_OBJECT('id', c.id, 'name', c.name)
                                            ORDER BY c.name
                                            ) FILTER (WHERE c.id IS NOT NULL),
                                            '[]'::jsonb
                                        ) AS children
                                    FROM categories p
                                    LEFT JOIN categories c
                                    ON c.parent = p.id
                                    WHERE p.parent IS NULL
                                    GROUP BY p.id, p.name
                                    ORDER BY p.name`;

// Admin Queries

