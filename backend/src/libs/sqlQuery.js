const PRODUCT_SELECT_FIELDS = [
    'id',
    'name',
    'current_price',
    'image',
    'state'
];
const getProductColumns = () => PRODUCT_SELECT_FIELDS.map(col => `p.${col}`).join(', ');

const USER_SELECT_FIELDS = [
    'id',
    'name',
    'email',
    'birthdate',
    'address',
    'role',
    'rating'
];
const getUserColumns = () => USER_SELECT_FIELDS.map(col => `u.${col}`).join(', ');

// User Queries
export const getUserByEmail = `SELECT * FROM users WHERE email = $1`;

export const getUserById = `SELECT * FROM users WHERE id = $1`;

export const createUser = `INSERT INTO users (name, email, hashed_password, birthdate, address, role, rating) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;

export const getUsers = `SELECT * FROM users`;

export const deleteUserById = `DELETE FROM users WHERE id = $1`;

export const updateUserById = `UPDATE users SET name = $1, email = $2, birthdate = $3, address = $4, role = $5, rating = $6 WHERE id = $7 RETURNING *`;

export const updateUserInformationById = `UPDATE users SET name = $1, email = $2, birthdate = $3, address = $4 WHERE id = $5 RETURNING *`;

export const updateUserPasswordById = `UPDATE users SET hashed_password = $1 WHERE id = $2 RETURNING *`;

export const getUserRatePointById = `
    SELECT u.rating AS rate_point FROM users u WHERE u.id = $1;
`;

export const getRatingsByUserId = (sortLogic) => `
    SELECT 
        rater.name AS rater_name,
        (CASE WHEN r.liked = TRUE THEN 1 ELSE -1 END) AS liked,
        r.content,
        r.created_at,
        COUNT(*) OVER() AS total_count

    FROM 
        reviews r
            LEFT JOIN users rater ON r.rater = rater.id

    WHERE r.ratee = $1

    ORDER BY ${sortLogic}

    LIMIT $2 OFFSET $3;
`;

export const getBiddingsByUserId = (sortLogic) => `
    SELECT
        ${getProductColumns()},
        MAX(b.bid_date) AS bid_date,
        MAX(b.price) AS bid_price,
        sp.instant_price,
        bidder.name AS highest_bidder,
        sp.created_at,
        EXTRACT(EPOCH FROM (sp.expired_at - NOW())) AS time_left,
        ARRAY_AGG(DISTINCT c.name) AS categories,
        COUNT(DISTINCT pb.id) AS bid_count,
        ts_rank(p.search_vector, plainto_tsquery('simple', unaccent($2))) AS rank,
        COUNT(*) OVER() AS total_count

    FROM
        bids b
            JOIN products p ON b.product = p.id
            JOIN sell_product sp ON p.id = sp.product
            LEFT JOIN product_categories pc ON p.id = pc.product
            LEFT JOIN categories c ON pc.category = c.id
            LEFT JOIN bids pb ON p.id = pb.product
            LEFT JOIN LATERAL(
                SELECT u.name
                FROM bids b2 JOIN users u ON b2.buyer = u.id
                WHERE b2.product = p.id
                ORDER BY b2.price DESC
                LIMIT 1
            ) bidder ON true,
            plainto_tsquery('simple', unaccent($2)) AS query

    WHERE 
        b.buyer = $1
        AND (p.search_vector @@ query OR p.name ILIKE '%' || $2 || '%')
        AND ($3::int IS NULL OR pc.category = $3)
        AND (sp.created_at >= $4::timestamp OR $4::timestamp IS NULL)
        AND (sp.created_at <= $5::timestamp OR $5::timestamp IS NULL)
        AND (p.current_price >= $6 AND p.current_price <= $7 OR $6 IS NULL OR $7 IS NULL)
        AND (p.state = ANY($8) OR $8 IS NULL)

    GROUP BY 
        p.id,
        sp.expired_at, sp.created_at, sp.instant_price,
        bidder.name,
        query, p.search_vector

    ORDER BY ${sortLogic}, rank DESC

    LIMIT $9 OFFSET $10;
`;

export const getSellingsByUserId = (sortLogic) => `
    SELECT
        ${getProductColumns()},
        sp.instant_price,
        bidder.name AS highest_bidder,
        sp.created_at,
        EXTRACT(EPOCH FROM (sp.expired_at - NOW())) AS time_left,
        ARRAY_AGG(DISTINCT c.name) AS categories,
        COUNT(DISTINCT b.id) AS bid_count,
        ts_rank(p.search_vector, plainto_tsquery('simple', unaccent($2))) AS rank,
        COUNT(*) OVER() AS total_count

    FROM
        sell_product sp
            JOIN products p ON sp.product = p.id
            LEFT JOIN product_categories pc ON p.id = pc.product
            LEFT JOIN categories c ON pc.category = c.id
            LEFT JOIN bids b ON p.id = b.product
            LEFT JOIN LATERAL(
                SELECT u.name
                FROM bids b2 JOIN users u ON b2.buyer = u.id
                WHERE b2.product = p.id
                ORDER BY b2.price DESC
                LIMIT 1
            ) bidder ON true,
            plainto_tsquery('simple', unaccent($2)) AS query

    WHERE 
        sp.seller = $1
        AND (p.search_vector @@ query OR p.name ILIKE '%' || $2 || '%')
        AND ($3::int IS NULL OR pc.category = $3)
        AND (sp.created_at >= $4::timestamp OR $4::timestamp IS NULL)
        AND (sp.created_at <= $5::timestamp OR $5::timestamp IS NULL)
        AND (p.current_price >= $6 AND p.current_price <= $7 OR $6 IS NULL OR $7 IS NULL)
        AND (p.state = ANY($8) OR $8 IS NULL)

    GROUP BY 
        p.id,
        sp.expired_at, sp.created_at, sp.instant_price,
        bidder.name, 
        query, p.search_vector

    ORDER BY ${sortLogic}, rank DESC

    LIMIT $9 OFFSET $10;
`;

export const getWonsByUserId = (sortLogic) => `
    SELECT
        ${getProductColumns()},
        sp.instant_price,
        bidder.name AS highest_bidder,
        sp.created_at,
        sp.expired_at as win_time,
        EXTRACT(EPOCH FROM (sp.expired_at - NOW())) AS time_left,
        ARRAY_AGG(DISTINCT c.name) AS categories,
        COUNT(DISTINCT b.id) AS bid_count,
        ts_rank(p.search_vector, plainto_tsquery('simple', unaccent($2))) AS rank,
        COUNT(*) OVER() AS total_count

    FROM
        bidder_winner bw
            JOIN products p ON bw.product = p.id
            JOIN sell_product sp ON p.id = sp.product
            LEFT JOIN product_categories pc ON p.id = pc.product
            LEFT JOIN categories c ON pc.category = c.id
            LEFT JOIN bids b ON p.id = b.product
            LEFT JOIN LATERAL(
                SELECT u.name
                FROM bids b2 JOIN users u ON b2.buyer = u.id
                WHERE b2.product = p.id
                ORDER BY b2.price DESC
                LIMIT 1
            ) bidder ON true,
            plainto_tsquery('simple', unaccent($2)) AS query

    WHERE 
        bw.bidder = $1
        AND (p.search_vector @@ query OR p.name ILIKE '%' || $2 || '%')
        AND ($3::int IS NULL OR pc.category = $3)
        AND (sp.created_at >= $4::timestamp OR $4::timestamp IS NULL)
        AND (sp.created_at <= $5::timestamp OR $5::timestamp IS NULL)
        AND (p.current_price >= $6 AND p.current_price <= $7 OR $6 IS NULL OR $7 IS NULL)
        AND (p.state = ANY($8) OR $8 IS NULL)

    GROUP BY 
        p.id,
        sp.expired_at, sp.created_at, sp.instant_price,
        bidder.name, 
        query, p.search_vector

    ORDER BY ${sortLogic}, rank DESC

    LIMIT $9 OFFSET $10;
`;

export const getRatingByUserIdAndProductId = `
    SELECT * FROM reviews WHERE rater = $1 AND product = $2
`;

export const checkIsWinner = `
    SELECT * FROM bidder_winner WHERE bidder = $1 AND product = $2
`;

export const createRating = `
    INSERT INTO reviews (rater, product, ratee, liked, content) 
    VALUES (
        $1, 
        $2, 
        (SELECT seller FROM sell_product WHERE product = $2),
        $3,
        $4 
    )
`;

export const getRequestByBidder = `
    SELECT created_at FROM requests WHERE bidder = $1;
`;

export const createRequest = `
    INSERT INTO requests (bidder, created_at, state) VALUES ($1, NOW(), 'pending');
`;

export const updateRequestReset = `
    UPDATE requests 
    SET created_at = NOW(), state = 'pending' 
    WHERE bidder = $1;
`;

// Session Queries
export const createSession = `INSERT INTO sessions (user_id, refresh_token, expired_at) VALUES ($1, $2, $3)`;

export const getSessionByRefreshToken = `SELECT * FROM sessions WHERE refresh_token = $1`;

export const deleteSessionByRefreshToken = `DELETE FROM sessions WHERE refresh_token = $1`;

// Category Queries
export const getCategories = `SELECT * FROM categories`;

export const createCategory = `INSERT INTO categories (name) VALUES ($1) RETURNING *`;

export const updateCategoryById = `UPDATE categories SET name = $1 WHERE id = $2 RETURNING *`;

export const deleteCategoryById = `DELETE FROM categories WHERE id = $1`;

// Product Queries
export const getProducts = `SELECT * FROM products`;

export const getProductById = `SELECT * FROM products WHERE id = $1`;

export const createProduct = `INSERT INTO products (name, description, image, start_price, current_price, end_time, seller_id, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;

export const updateProductById = `UPDATE products SET name = $1, description = $2, image = $3, start_price = $4, current_price = $5, end_time = $6, seller_id = $7, category_id = $8 WHERE id = $9 RETURNING *`;

export const deleteProductById = `DELETE FROM products WHERE id = $1`;

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
        ${getProductColumns()},
        f.created_at AS favorited_date,
        sp.instant_price,
        bidder.name AS highest_bidder,
        sp.created_at,
        EXTRACT(EPOCH FROM (sp.expired_at - NOW())) AS time_left,
        ARRAY_AGG(DISTINCT c.name) AS categories,
        COUNT(DISTINCT b.id) AS bid_count,
        (sp.created_at >= NOW() - INTERVAL '90 minutes') AS is_new,
        ts_rank(p.search_vector, plainto_tsquery('simple', unaccent($2))) AS rank,
        COUNT(*) OVER() AS total_count

    FROM
        favorites f
            JOIN products p ON f.product = p.id
            JOIN sell_product sp ON p.id = sp.product
            LEFT JOIN product_categories pc ON p.id = pc.product
            LEFT JOIN categories c ON pc.category = c.id
            LEFT JOIN bids b ON p.id = b.product
            LEFT JOIN LATERAL(
                SELECT u.name
                FROM bids b2 JOIN users u ON b2.buyer = u.id
                WHERE b2.product = p.id
                ORDER BY b2.price DESC
                LIMIT 1
            ) bidder ON true,
            plainto_tsquery('simple', unaccent($2)) AS query

    WHERE 
        f.user_id = $1
        AND (p.search_vector @@ query OR p.name ILIKE '%' || $2 || '%')
        AND ($3::int IS NULL OR pc.category = $3)
        AND (sp.created_at >= $4::timestamp OR $4::timestamp IS NULL)
        AND (sp.created_at <= $5::timestamp OR $5::timestamp IS NULL)
        AND (p.current_price >= $6 AND p.current_price <= $7 OR $6 IS NULL OR $7 IS NULL)
        AND (p.state = ANY($8) OR $8 IS NULL)

    GROUP BY 
        p.id,
        f.created_at,
        sp.expired_at, sp.created_at, sp.instant_price,
        bidder.name, 
        query, p.search_vector

    ORDER BY ${sortLogic}, rank DESC, is_new DESC

    LIMIT $9 OFFSET $10;
`;

export const getFavoriteByUserAndProduct = `
    SELECT * FROM favorites 
    WHERE user_id = $1 AND product = $2;
`;

export const getProductDetailsById = `
    WITH base AS (
        SELECT
            ${getProductColumns()},
            sp.seller AS seller_id,
            sp.init_price AS init_price,
            sp.step_price AS step_price,
            sp.instant_price AS instant_price,
            u.name AS seller_name,
            sp.created_at,
            sp.expired_at
        FROM products p
            LEFT JOIN sell_product sp ON sp.product = p.id
            LEFT JOIN users u ON u.id = sp.seller
        WHERE p.id = $1
    )

    SELECT
        b.*,

        -- Categories
        COALESCE(
            (
                SELECT json_agg(c.name)
                FROM product_categories pc
                JOIN categories c ON c.id = pc.category
                WHERE pc.product = b.id
            ),
            '[]'
        ) AS categories,

        -- Additional images
        COALESCE(
            (
                SELECT to_json(pi.image_path)
                FROM product_images pi
                WHERE pi.product = b.id
            ),
            '[]'::json
        ) AS additional_images,

        -- Descriptions
        COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'description', d.description,
                        'created_at', d.created_at
                    ) ORDER BY d.created_at ASC
                )
                FROM product_descriptions d
                WHERE d.product = b.id
            ),
            '[]'
        ) AS descriptions,

        -- Bids
        COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'bidder_name', u_b.name,  
                        'amount', bid.price,
                        'bid_time', bid.bid_date
                    ) ORDER BY bid.price DESC
                )
                FROM bids bid 
                JOIN users u_b ON u_b.id = bid.buyer
                WHERE bid.product = b.id
            ),
            '[]'
        ) AS bids,
        
        -- Questions & answers
        COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'question', q.question,
                        'questioner_name', u_q.name,
                        'answer', q.answer,
                        'answerer_name', u_a.name,
                        'asked_at', q.asked_at,
                        'answered_at', q.answered_at
                    ) ORDER BY q.asked_at ASC
                )
                FROM product_questions q
                    LEFT JOIN users u_q ON u_q.id = q.questioner
                    LEFT JOIN users u_a ON u_a.id = q.answerer
                WHERE q.product = b.id
            ),
            '[]'
        ) AS qa

    FROM base b;
`;

export const getFilteredProductsQuery = (sortLogic) => `
    SELECT
        ${getProductColumns()},
        sp.instant_price,
        bidder.name AS highest_bidder,
        sp.created_at,
        EXTRACT(EPOCH FROM (sp.expired_at - NOW())) AS time_left,
        ARRAY_AGG(DISTINCT c.name) AS categories,
        COUNT(DISTINCT b.id) AS bid_count,
        (sp.created_at >= NOW() - INTERVAL '90 minutes') AS is_new,
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
      AND (sp.created_at >= $3::timestamp OR $3::timestamp IS NULL)
      AND (sp.created_at <= $4::timestamp OR $4::timestamp IS NULL)
      AND (p.current_price >= $5 AND p.current_price <= $6 OR $5 IS NULL OR $6 IS NULL)
      AND (p.state = ANY($7) OR $7 IS NULL)

    GROUP BY 
        p.id,
        sp.expired_at, sp.created_at, sp.instant_price,
        bidder.name, 
        query, p.search_vector

    ORDER BY ${sortLogic}, rank DESC, is_new DESC

    LIMIT $8 OFFSET $9;
`;

export const getProductByProductIdAndSellerId = `
    SELECT * 

    FROM 
        products p
            JOIN sell_product sp ON p.id = sp.product
    
    WHERE p.id = $1 AND sp.seller = $2
`;

export const getQuestionByIdAndProductId = `
    SELECT * FROM product_questions WHERE id = $1 AND product = $2;
`;

export const createQuestion = `
    INSERT INTO product_questions (questioner, product, question, asked_at) VALUES ($1, $2, $3, NOW()) RETURNING *;
`;

export const updateQuestionAnswer = `
    UPDATE product_questions SET answerer = $1, answer = $2, answered_at = NOW() WHERE id = $3 RETURNING *;
`;

// Product Description Queries
export const getProductDescriptionsByProductId = `SELECT * FROM product_descriptions WHERE product = $1`;

export const createProductDescription = `INSERT INTO product_descriptions (product, description, created_at) VALUES ($1, $2, $3) RETURNING *`;

// Admin Queries
export const getRequests = (sortLogic) => `
    SELECT
        ${getUserColumns()},
        r.id AS request_id,
        r.created_at AS request_date,
        r.state AS request_state,
        ts_rank(u.search_vector, plainto_tsquery('simple', unaccent($1))) AS rank,
        COUNT(*) OVER() AS total_count

    FROM
        requests r
            JOIN users u ON u.id = r.bidder
            CROSS JOIN plainto_tsquery('simple', unaccent($1)) AS query

    WHERE (u.search_vector @@ query OR u.email ILIKE '%' || $1 || '%' OR u.name ILIKE '%' || $1 || '%')
      AND (r.state = ANY($2) OR $2 IS NULL)

    GROUP BY 
        u.id,
        r.id, r.created_at, r.state,
        query, u.search_vector

    ORDER BY ${sortLogic}, rank DESC

    LIMIT $3 OFFSET $4;
`;

export const getRequestById = `SELECT * FROM requests WHERE id = $1`;

export const approveRequest = `
    WITH updated_request AS (
        UPDATE requests
        SET state = 'success'
        WHERE id = $1 AND state = 'pending'
        RETURNING bidder
    )
    UPDATE users
    SET role = 'seller'
    WHERE id = (SELECT bidder FROM updated_request);
`;

export const rejectRequest = `
    UPDATE requests 
    SET state = 'failed' 
    WHERE id = $1 AND state = 'pending';
`;

// Home Queries
export const getTop5EndingSoon = `
    SELECT
        ${getProductColumns()},
        sp.instant_price,
        bidder.name AS highest_bidder,
        sp.created_at,
        EXTRACT(EPOCH FROM (sp.expired_at - NOW())) AS time_left,
        ARRAY_AGG(DISTINCT c.name) AS categories,
        COUNT(DISTINCT b.id) AS bid_count

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
            ) bidder ON true

    WHERE p.state = 'bidding' AND sp.expired_at > NOW()

    GROUP BY p.id, sp.expired_at, sp.created_at, sp.instant_price, bidder.name

    ORDER BY sp.expired_at ASC

    LIMIT 5;
`;

export const getTop5MostBids = `
    SELECT
        ${getProductColumns()},
        sp.instant_price,
        bidder.name AS highest_bidder,
        sp.created_at,
        EXTRACT(EPOCH FROM (sp.expired_at - NOW())) AS time_left,
        ARRAY_AGG(DISTINCT c.name) AS categories,
        COUNT(DISTINCT b.id) AS bid_count

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
            ) bidder ON true

    WHERE p.state = 'bidding'

    GROUP BY p.id, sp.expired_at, sp.created_at, sp.instant_price, bidder.name

    ORDER BY bid_count DESC

    LIMIT 5;
`;

export const getTop5HighestPrice = `
    SELECT
        ${getProductColumns()},
        sp.instant_price,
        bidder.name AS highest_bidder,
        sp.created_at,
        EXTRACT(EPOCH FROM (sp.expired_at - NOW())) AS time_left,
        ARRAY_AGG(DISTINCT c.name) AS categories,
        COUNT(DISTINCT b.id) AS bid_count

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
            ) bidder ON true

    WHERE p.state = 'bidding'

    GROUP BY p.id, sp.expired_at, sp.created_at, sp.instant_price, bidder.name

    ORDER BY p.current_price DESC

    LIMIT 5;
`;
