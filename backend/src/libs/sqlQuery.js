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
    'hashed_password',
    'address',
    'role',
    'rating'
];
const getUserColumns = () => USER_SELECT_FIELDS.map(col => `u.${col}`).join(', ');

// User Queries
export const getUserByEmail = `SELECT ${getUserColumns()} FROM users u WHERE email = $1`;

export const getUserById = `
  SELECT 
    u.id, u.name, u.email, u.birthdate, u.hashed_password, u.address, u.role, u.rating,
    (SELECT COUNT(*) FROM reviews WHERE ratee = u.id) as rating_count
  FROM users u 
  WHERE u.id = $1
`;

export const createUser = `INSERT INTO users (name, email, hashed_password, birthdate, address, role, rating) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;

export const getUsers = (sortLogic) => `
  SELECT 
    ${getUserColumns()},
    COUNT(*) OVER() AS total_count
  FROM users u 
  ORDER BY ${sortLogic}
  LIMIT $1 OFFSET $2
`;

export const deleteUserById = `DELETE FROM users WHERE id = $1`;

export const updateUserById = `UPDATE users SET name = $1, email = $2, birthdate = $3, address = $4, role = $5 WHERE id = $6 RETURNING *`;

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
        bidder.name AS highest_bidder_name,
        bidder.id AS highest_bidder_id,
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
                SELECT u.name, u.id
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
        bidder.name, bidder.id,
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

export const countUserRatings = `
    SELECT count(*) as total FROM reviews WHERE ratee = $1
`;

// Session Queries
export const createSession = `INSERT INTO sessions (user_id, refresh_token, expired_at) VALUES ($1, $2, $3)`;

export const getSessionByRefreshToken = `SELECT * FROM sessions WHERE refresh_token = $1`;

export const deleteSessionByRefreshToken = `DELETE FROM sessions WHERE refresh_token = $1`;

// Category Queries
export const getCategories = (sortLogic) => `
  SELECT 
    c.id,
    c.name,
    c.parent,
    p.name AS parent_name,
    COUNT(pc.product) AS product_count,
    COUNT(*) OVER() AS total_count
  FROM categories c
  LEFT JOIN categories p ON c.parent = p.id
  LEFT JOIN product_categories pc ON c.id = pc.category
  GROUP BY c.id, c.name, c.parent, p.name
  ORDER BY ${sortLogic}
  LIMIT $1 OFFSET $2
`;

export const createCategory = `INSERT INTO categories (name, parent) VALUES ($1, $2) RETURNING *`;

export const getAdminProducts = (sortLogic) => `
  SELECT 
    p.id,
    p.name,
    p.current_price,
    sp.instant_price,
    (SELECT c.name FROM product_categories pc
     JOIN categories c ON pc.category = c.id  
     WHERE pc.product = p.id LIMIT 1) AS category_name,
    seller.name AS seller_name,
    winner.name AS winner_name,
    COUNT(*) OVER() AS total_count
  FROM products p
  JOIN sell_product sp ON p.id = sp.product
  LEFT JOIN users seller ON sp.seller = seller.id
  LEFT JOIN bidder_winner bw ON p.id = bw.product
  LEFT JOIN users winner ON bw.bidder = winner.id
  GROUP BY p.id, p.name, p.current_price, sp.instant_price, seller.name, winner.name
  ORDER BY ${sortLogic}
  LIMIT $1 OFFSET $2
`;

export const updateCategoryById = `UPDATE categories SET name = $1, parent = $2 WHERE id = $3 RETURNING *`;

export const deleteCategoryById = `DELETE FROM categories WHERE id = $1`;

export const getCategoryProductCount = `SELECT COUNT(*) FROM product_categories WHERE category = $1`;

// Product Queries
export const getProducts = `SELECT ${getProductColumns()} FROM products p`;

export const createProduct = `INSERT INTO products (name, current_price, image) VALUES ($1, $2, $3) RETURNING *`;

export const createProductCategory = `INSERT INTO product_categories (product, category) VALUES ($1, $2) RETURNING *`;

export const updateProductById = `UPDATE products SET name = $1, current_price = $2, image = $3 WHERE id = $4 RETURNING *`;


export const deleteProductById = `DELETE FROM products WHERE id = $1`;

export const updateProductStateById = `UPDATE products SET state = $1 WHERE id = $2 RETURNING *`;

export const updateSellProductById = `UPDATE sell_product SET init_price = $1, step_price = $2, instant_price = $3, starting_at = $4, expired_at = $5, isExtent = $6 WHERE product = $7 RETURNING *`;

export const closeSellProductById = `UPDATE sell_product SET expired_at = NOW() WHERE product = $1 RETURNING *`;


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
                        'id', q.id,
                        'questioner_id', q.questioner,
                        'answerer_id', q.answerer,
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
        ) AS qa,

        -- User specific info
        (SELECT CASE 
            WHEN EXISTS (SELECT 1 FROM allowed_bidder WHERE bidder = $2 AND product = b.id) THEN 'success'
            ELSE (SELECT state FROM bid_requests WHERE bidder = $2 AND product = b.id LIMIT 1)
        END) as user_bid_request_state,
        CASE 
            WHEN b.seller_id = $2 THEN 'seller'
            WHEN EXISTS (SELECT 1 FROM bidder_winner WHERE bidder = $2 AND product = b.id) THEN 'winner'
            WHEN EXISTS (SELECT 1 FROM bids WHERE buyer = $2 AND product = b.id) THEN 'bidder'
            ELSE 'other'
        END as user_relation

    FROM base b;
`;

export const getFilteredProductsQuery = (sortLogic) => `
    SELECT
        ${getProductColumns()},
        sp.instant_price,
        seller.name AS seller_name,
        bidder.name AS highest_bidder,
        winner.name AS winner_name,
        (SELECT c.name FROM product_categories pc
         JOIN categories c ON pc.category = c.id  
         WHERE pc.product = p.id LIMIT 1) AS category_name,
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
            LEFT JOIN users seller ON sp.seller = seller.id
            LEFT JOIN bidder_winner bw ON p.id = bw.product
            LEFT JOIN users winner ON bw.bidder = winner.id
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
        seller.name, bidder.name, winner.name,
        query, p.search_vector

    ORDER BY ${sortLogic}, rank DESC, is_new DESC

    LIMIT $8 OFFSET $9;
`;

export const getProductExistsById = `SELECT id FROM products WHERE id = $1`;

export const getProductById = getProductDetailsById;

export const createQuestion = `
    INSERT INTO product_questions (questioner, product, question, asked_at) VALUES ($1, $2, $3, NOW()) RETURNING *;
`;

export const updateQuestionAnswer = `
    UPDATE product_questions SET answerer = $1, answer = $2, answered_at = NOW() WHERE id = $3 RETURNING *;
`;

export const getBidRequestsByProductId = (sortLogic) => `
   SELECT
        ${getUserColumns()},
        br.id AS request_id,
        br.request_date,
        br.state AS request_state,
        ts_rank(u.search_vector, plainto_tsquery('simple', unaccent($1))) AS rank,
        COUNT(*) OVER() AS total_count

    FROM
        bid_requests br
            JOIN users u ON u.id = br.bidder
            CROSS JOIN plainto_tsquery('simple', unaccent($1)) AS query

    WHERE (u.search_vector @@ query OR u.email ILIKE '%' || $1 || '%' OR u.name ILIKE '%' || $1 || '%')
      AND (br.product = $2 OR $2 IS NULL)
      AND (br.state = ANY($3) OR $3 IS NULL)

    ORDER BY ${sortLogic}, rank DESC

    LIMIT $4 OFFSET $5;
`;

export const checkIsAllowedBidder = `
    SELECT 1 FROM allowed_bidder WHERE bidder = $1 AND product = $2
`;

export const getProductAndSellInfoById = `
    SELECT
        p.id,                 
        p.name,
        p.current_price,
        p.image,
        p.state,
        sp.instant_price,
        sp.init_price,
        sp.seller,             
        sp.step_price,
        sp.created_at,         
        sp.expired_at,       
        u.name AS seller_name,
        u.email
        
    FROM products p
        JOIN sell_product sp ON p.id = sp.product
        JOIN users u ON sp.seller = u.id
        
    WHERE p.id = $1;
`;

export const getBidRequestByBidderAndProduct = `
    SELECT request_date FROM bid_requests WHERE bidder = $1 AND product = $2;
`;

export const createBidRequest = `
    INSERT INTO bid_requests (bidder, product, request_date, state) VALUES ($1, $2, NOW(), 'pending');
`;

export const updateBidRequestReset = `
    UPDATE bid_requests 
    SET request_date = NOW(), state = 'pending' 
    WHERE bidder = $1 AND product = $2;
`;

export const approveBidRequest = `
    WITH updated_request AS (
        UPDATE bid_requests
        SET state = 'success'
        WHERE id = $1 AND state = 'pending'
        RETURNING bidder, product
    )
    INSERT INTO allowed_bidder (bidder, product)
    SELECT bidder, product FROM updated_request
    ON CONFLICT (bidder, product) DO NOTHING;
`;

export const rejectBidRequest = `
    UPDATE bid_requests
    SET state = 'failed'
    WHERE id = $1 AND state = 'pending';
`;

export const handleInstantBuyQuery = `
    WITH updated_product AS (
        UPDATE products
        SET current_price = $3, state = 'sold'
        WHERE id = $2 AND state = 'bidding'
        RETURNING id
    ),
    inserted_bid AS (
        INSERT INTO bids (buyer, product, price, bid_date)
        SELECT $1, id, $3, NOW() 
        FROM updated_product
    ),
    inserted_winner AS (
        INSERT INTO bidder_winner (bidder, product)
        SELECT $1, id 
        FROM updated_product
    )
    INSERT INTO trade_verifications (product, bidder, seller, delivery_address)
    SELECT 
        up.id,                                                  
        $1,                                                    
        (SELECT seller FROM sell_product WHERE product = up.id),
        (SELECT address FROM users WHERE id = $1)              
    FROM updated_product up;                     
`;

export const placeBidTransaction = `
    WITH new_bid AS (
        INSERT INTO bids (buyer, product, price, bid_date)
        VALUES ($1, $2, $3, NOW())
        RETURNING product
    )
    UPDATE products
    SET current_price = $3
    WHERE id = $2 
        AND current_price + (SELECT step_price FROM sell_product WHERE product = $2) <= $3
        AND state = 'bidding'
    RETURNING id;
`;

// Auto-bidding queries
export const upsertAutoBid = `
    INSERT INTO auto_bids (product, bidder, max_price, created_at)
    VALUES ($1, $2, $3, NOW())
    ON CONFLICT (product, bidder) 
    DO UPDATE SET max_price = $3, created_at = NOW()
    RETURNING *;
`;

export const getAutoBidByProductAndBidder = `
    SELECT * FROM auto_bids WHERE product = $1 AND bidder = $2;
`;

export const getTopAutoBidsForProduct = `
    SELECT ab.*, u.email as bidder_email
    FROM auto_bids ab
    JOIN users u ON u.id = ab.bidder
    WHERE ab.product = $1
    ORDER BY ab.max_price DESC, ab.created_at ASC
    LIMIT 2;
`;

export const deleteAutoBid = `
    DELETE FROM auto_bids WHERE product = $1 AND bidder = $2;
`;

export const insertBidRecord = `
    INSERT INTO bids (buyer, product, price, bid_date)
    VALUES ($1, $2, $3, NOW())
    RETURNING *;
`;

export const updateProductPrice = `
    UPDATE products SET current_price = $1 WHERE id = $2 AND state = 'bidding' RETURNING *;
`;

// Leader bid queries
export const getCurrentLeaderBid = `
  SELECT 
    b.id as bid_id,
    b.buyer as bidder_id,
    b.price as bid_price,
    b.bid_date,
    u.email as bidder_email
  FROM bids b
  JOIN users u ON u.id = b.buyer
  WHERE b.product = $1
  ORDER BY b.price DESC, b.bid_date ASC
  LIMIT 1;
`;

// Product Description Queries
export const getProductDescriptionsByProductId = `SELECT * FROM product_descriptions WHERE product = $1`;

export const createSellProduct = `INSERT INTO sell_product(product, seller, init_price, step_price, instant_price, starting_at, expired_at, isExtent)
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
export const createProductDescription = `INSERT INTO product_descriptions (product, description, created_at) VALUES ($1, $2, NOW()) RETURNING *`;


export const getProductDescription = `SELECT * FROM product_descriptions WHERE id = $1 AND product = $2`;

//Category
export const getListCategories = `
    SELECT 
        c.id, 
        c.name, 
        c.parent,
        p.name AS parent_name
    FROM categories c
    LEFT JOIN categories p ON c.parent = p.id
    ORDER BY c.name
`;

// Admin Queries
export const getRequests = (sortLogic) => `
    SELECT
        u.id AS user_id,
        u.name,
        u.email,
        u.rating,
        r.id AS id,
        r.created_at AS created_at,
        r.state AS state,
        ts_rank(u.search_vector, plainto_tsquery('simple', unaccent($1))) AS rank,
        COUNT(*) OVER() AS total_count

    FROM
        requests r
            JOIN users u ON u.id = r.bidder
            CROSS JOIN plainto_tsquery('simple', unaccent($1)) AS query

    WHERE (u.search_vector @@ query OR u.email ILIKE '%' || $1 || '%' OR u.name ILIKE '%' || $1 || '%')
      AND (r.state = ANY($2) OR $2 IS NULL)

    GROUP BY 
        u.id, u.name, u.email, u.rating,
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
        p.image AS image_url,
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
        p.image AS image_url,
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
        p.image AS image_url,
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

// Transaction
export const getTradeVerification = `SELECT t.product, 
                                            t.bidder, 
                                            t.seller,
                                            t.delivery_address,
                                            t.invoice_image,
                                            t.sell_accept,
                                            t.bidder_accept,
                                            t.state,
                                            b.name AS bidder_name,
                                            b.address AS delivery_address,
                                            b.rating AS bidder_rating,
                                            s.name AS seller_name,
                                            s.rating AS seller_rating,
                                            p.name,
                                            p.current_price,
                                            p.image,
                                            sp.expired_at
                                    FROM trade_verifications t
                                    JOIN users b ON b.id = t.bidder
                                    JOIN users s ON s.id = t.seller
                                    JOIN products p ON p.id = t.product
                                    JOIN sell_product sp ON sp.product = t.product
                                    WHERE t.product = $1`;

export const bidderSubmission = `UPDATE trade_verifications
                                 SET
                                    delivery_address = $1,
                                    invoice_image = $2,
                                    state = 'pending_seller_confirm'
                                 WHERE product = $3
                                 AND state = 'pending_payment'
                                 RETURNING *`;

export const sellerConfirmation = `UPDATE trade_verifications
                                   SET
                                    sell_accept = TRUE,
                                    transport_image = $1,
                                    state = 'pending_bidder_confirm'
                                   WHERE product = $2
                                   AND state = 'pending_seller_confirm'
                                   RETURNING *`;

export const bidderConfirmation = `UPDATE trade_verifications
                                   SET
                                    bidder_accept = TRUE,
                                    state = 'completed'
                                   WHERE product = $1
                                   AND state = 'pending_bidder_confirm'
                                   RETURNING *`;

                                   export const tradeCancel = `WITH cancelled_trade AS (
                                    UPDATE trade_verifications
                                    SET state = 'failed'
                                    WHERE product = $1
                                    AND state IN (
                                        'pending_payment',
                                        'pending_seller_confirm',
                                        'pending_bidder_confirm',
                                        'completed'
                                    )
                                    RETURNING product, bidder, seller
                                )
                                INSERT INTO reviews (product, rater, ratee, liked, content)
                                SELECT
                                    product,
                                    seller, 
                                    bidder, 
                                    false,      
                                    'Trade cancelled by bidder'
                                FROM cancelled_trade
                                ON CONFLICT (product, ratee, rater)
                                DO UPDATE SET
                                    liked = false,
                                    content = 'Trade cancelled by seller'`;    

export const getWinner = `SELECT u.*
                          FROM trade_verifications t
                          JOIN users u ON u.id = t.bidder
                          WHERE t.product = $1`

export const getRoleFromTrade = `SELECT product, bidder, seller
                                FROM trade_verifications
                                WHERE product = $1`

export const rating = `INSERT INTO reviews (product, rater, ratee, liked, content)
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING *`

export const getRating = `SELECT * 
                        FROM reviews
                        WHERE product = $1
                        AND rater = $2
                        AND ratee = $3`

export const updateRating = `UPDATE reviews
                            SET
                                liked = $1,
                                content = $2
                            WHERE product = $3
                                AND rater = $4
                                AND ratee = $5
                            RETURNING *`

// Message Queries
export const createMessage = `
    INSERT INTO messages (product, sender, content, image, type, created_at) 
    VALUES ($1, $2, $3, $4, $5, NOW()) 
    RETURNING *
`;

export const getMessagesByProduct = (sortLogic = "created_at DESC") => `
    SELECT 
        m.id,
        m.product,
        m.sender,
        u.name AS sender_name,
        m.content,
        m.image,
        m.type,
        m.created_at
    FROM messages m
    LEFT JOIN users u ON m.sender = u.id
    WHERE m.product = $1
    ORDER BY ${sortLogic}
    LIMIT $2 OFFSET $3
`;

// Bidder Management Queries (for seller to manage bidders)
export const getProductBidders = `
    WITH all_bidders AS (
        -- Get bidders from bids table
        SELECT DISTINCT 
            b.buyer AS bidder_id,
            u.name AS bidder_name,
            u.email AS bidder_email,
            u.rating AS bidder_rating,
            MAX(b.price) AS highest_bid,
            MAX(b.bid_date) AS last_bid_date,
            NULL::numeric AS auto_bid_max,
            'manual' AS bid_type,
            false AS from_refuse
        FROM bids b
        JOIN users u ON u.id = b.buyer
        WHERE b.product = $1
        GROUP BY b.buyer, u.name, u.email, u.rating
        
        UNION ALL
        
        -- Get bidders from auto_bids table
        SELECT DISTINCT
            ab.bidder AS bidder_id,
            u.name AS bidder_name,
            u.email AS bidder_email,
            u.rating AS bidder_rating,
            NULL::numeric AS highest_bid,
            ab.created_at AS last_bid_date,
            ab.max_price AS auto_bid_max,
            'auto' AS bid_type,
            false AS from_refuse
        FROM auto_bids ab
        JOIN users u ON u.id = ab.bidder
        WHERE ab.product = $1
        
        UNION ALL
        
        -- Get refused bidders from refuse table
        SELECT DISTINCT
            r.buyer AS bidder_id,
            u.name AS bidder_name,
            u.email AS bidder_email,
            u.rating AS bidder_rating,
            NULL::numeric AS highest_bid,
            NULL::timestamp AS last_bid_date,
            NULL::numeric AS auto_bid_max,
            'refused' AS bid_type,
            true AS from_refuse
        FROM refuse r
        JOIN users u ON u.id = r.buyer
        WHERE r.product = $1
    ),
    merged_bidders AS (
        SELECT 
            bidder_id,
            bidder_name,
            bidder_email,
            bidder_rating,
            MAX(highest_bid) AS highest_bid,
            MAX(last_bid_date) AS last_bid_date,
            MAX(auto_bid_max) AS auto_bid_max,
            CASE 
                WHEN bool_or(from_refuse) THEN 'refused'
                WHEN MAX(auto_bid_max) IS NOT NULL THEN 'auto'
                ELSE 'manual'
            END AS bid_type,
            bool_or(from_refuse) AS is_refused
        FROM all_bidders
        GROUP BY bidder_id, bidder_name, bidder_email, bidder_rating
    )
    SELECT 
        mb.bidder_id,
        mb.bidder_name,
        mb.bidder_email,
        mb.bidder_rating,
        mb.highest_bid,
        mb.last_bid_date,
        mb.auto_bid_max,
        mb.bid_type,
        mb.is_refused,
        COUNT(*) OVER() AS total_count
    FROM merged_bidders mb
    ORDER BY mb.is_refused ASC, mb.highest_bid DESC NULLS LAST, mb.last_bid_date DESC
    LIMIT $2 OFFSET $3;
`;

export const refuseBidder = `
    WITH inserted_refuse AS (
        INSERT INTO refuse (product, buyer)
        VALUES ($1, $2)
        ON CONFLICT (product, buyer) DO NOTHING
        RETURNING product, buyer
    ),
    deleted_bids AS (
        DELETE FROM bids
        WHERE product = $1 AND buyer = $2
        RETURNING id
    ),
    deleted_auto_bids AS (
        DELETE FROM auto_bids
        WHERE product = $1 AND bidder = $2
        RETURNING product
    )
    SELECT 
        (SELECT COUNT(*) FROM deleted_bids) AS deleted_bids_count,
        (SELECT COUNT(*) FROM deleted_auto_bids) AS deleted_auto_bids_count;
`;

export const checkIsRefused = `
    SELECT 1 FROM refuse WHERE product = $1 AND buyer = $2;
`;

export const unrefuseBidder = `
    DELETE FROM refuse WHERE product = $1 AND buyer = $2;
`;
