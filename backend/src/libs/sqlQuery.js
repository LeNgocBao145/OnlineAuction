
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

// Favorite Queries
export const markFavoriteProduct = `
    INSERT INTO favorites (user_id, product) 
    VALUES ($1, $2)
    ON CONFLICT (user_id, product) DO NOTHING;
`;

export const unmarkFavoriteProduct = `
    DELETE FROM favorites 
    WHERE user_id = $1 AND product = $2;
`;

export const getFavoritesQuery = (sortLogic) => `
    SELECT
        p.id,
        p.image,
        p.name,
        p.current_price,   
        f.created_at AS favorited_date,
        
        EXTRACT(EPOCH FROM (sp.expired_at - NOW())) AS time_left,

        COUNT(DISTINCT b.id) AS bid_count,

        COUNT(*) OVER() AS total_count

    FROM
        favorites f
            JOIN products p ON f.product = p.id
            JOIN sell_product sp ON p.id = sp.product
            LEFT JOIN product_categories pc ON p.id = pc.product
            LEFT JOIN bids b ON p.id = b.product
            LEFT JOIN LATERAL(
                SELECT u.name
                FROM bids b2 JOIN users u ON b2.buyer = u.id
                WHERE b2.product = p.id
                ORDER BY b2.price DESC
                LIMIT 1
            ) bidder ON true

    WHERE 
        f.user_id = $1
        AND ($2::int IS NULL OR pc.category = $2)

    GROUP BY p.id, p.image, p.name, p.current_price, 
             sp.expired_at, f.created_at

    ORDER BY ${sortLogic}

    LIMIT $3 OFFSET $4;
`;

export const getFavoriteByUserAndProduct = `
    SELECT * FROM favorites 
    WHERE user_id = $1 AND product = $2;
`;

// Admin Queries

