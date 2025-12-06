
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

export const getFilteredProductsQuery = (sortLogic) => `
    SELECT
        p.id,
        p.image,
        p.name,
        p.current_price,

        sp.instant_price AS instant_price,

        -- Highest bidder
        bidder.name AS highest_bidder,

        sp.created_at AS selling_date,
        EXTRACT(EPOCH FROM (sp.expired_at - NOW())) AS time_left,

        -- Category names
        ARRAY_AGG(DISTINCT c.name) AS categories,

        -- Bid count
        COUNT(DISTINCT b.id) AS bid_count,

        -- Is new
        (sp.created_at >= NOW() - INTERVAL '90 minutes') AS is_new,

        -- FTS ranking
        ts_rank(p.search_vector, plainto_tsquery('simple', unaccent($1))) AS rank,

        COUNT(*) OVER() AS total_count

    FROM
        products p
            JOIN sell_product sp ON p.id = sp.product
            LEFT JOIN product_categories pc ON p.id = pc.product
            LEFT JOIN categories c ON pc.category = c.id
            LEFT JOIN bids b ON p.id = b.product
            LEFT JOIN LATERAL (
                SELECT u.name
                FROM bids b2 JOIN users u ON b2.buyer = u.id
                WHERE b2.product = p.id
                ORDER BY b2.price DESC
                LIMIT 1
            ) bidder ON true,
            plainto_tsquery('simple', unaccent($1)) AS query

    WHERE (p.search_vector @@ query OR p.name ILIKE '%' || $1 || '%')
      AND ($2::int IS NULL OR pc.category = $2)

    GROUP BY 
        p.id, p.image, p.name, p.current_price,
        sp.expired_at, sp.created_at, sp.instant_price,
        bidder.name, 
        query, p.search_vector

    ORDER BY ${sortLogic}, rank DESC, is_new DESC

    LIMIT $3 OFFSET $4;
`;

// Admin Queries

