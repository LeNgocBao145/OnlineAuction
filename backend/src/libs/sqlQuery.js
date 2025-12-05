
// User Queries
export const getUserByEmail = `SELECT * FROM users WHERE email = $1`;

export const getUserById = `SELECT * FROM users WHERE id = $1`;

export const createUser = `INSERT INTO users (name, email, hashed_password, birthdate, address, role, rating) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;

export const getUsers = `SELECT * FROM users`;

export const deleteUserById = `DELETE FROM users WHERE id = $1`;

export const updateUserById = `UPDATE users SET name = $1, email = $2, birthdate = $3, address = $4, role = $5, rating = $6 WHERE id = $7 RETURNING *`;

export const updateUserInformationById = `UPDATE users SET name = $1, email = $2, birthdate = $3 WHERE id = $4 RETURNING *`;

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

export const getProductDetailsById = `
    WITH base AS (
        SELECT
            p.id,
            p.name,
            p.image,
            p.current_price,
            p.state,
            sp.seller AS seller_id,
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

// Product Description Queries
export const getProductDescriptionsByProductId = `SELECT * FROM product_descriptions WHERE product = $1`;

export const createProductDescription = `INSERT INTO product_descriptions (product, description, created_at) VALUES ($1, $2, $3) RETURNING *`;

// Admin Queries

