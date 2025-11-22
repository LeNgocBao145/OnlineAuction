CREATE DATABASE OnlineAuction;

CREATE TYPE user_role AS ENUM ('bidder', 'seller', 'admin');

CREATE TYPE product_state AS ENUM ('incoming', 'bidding', 'sold');

CREATE TYPE trade_state AS ENUM ('pending', 'failed', 'success');

CREATE TYPE message_type AS ENUM ('text', 'image');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    address VARCHAR(100) NOT NULL,
    email VARCHAR(50) UNIQUE,
    hashed_password VARCHAR(100) NOT NULL,
    birthdate DATE,
    role user_role DEFAULT 'bidder',
    rating REAL DEFAULT 0
);

CREATE TABLE sessions (
    user INTEGER PRIMARY KEY,
    expired_at DATE NOT NULL,
    refresh_token VARCHAR(100) UNIQUE
);

CREATE TABLE requests (
    bidder INTEGER PRIMARY KEY,
    created_at DATE,
    accepted BOOLEAN
);

CREATE TABLE favorites (
    product INTEGER,
    user INTEGER
    PRIMARY KEY (product, user)
);

CREATE TABLE reviews (
    product INTEGER,
    rater INTEGER,
    ratee INTEGER,
    liked BOOLEAN,
    content VARCHAR(200)
    PRIMARY KEY (product, ratee, rater)
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    current_price REAL NOT NULL,
    image VARCHAR(100) NOT NULL,
    state product_state 
);

CREATE TABLE product_categories (
    product INT NOT NULL,
    category INT NOT NULL,
    PRIMARY KEY (product, category),
    FOREIGN KEY (product) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (category) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE bids (
    product INTEGER,
    buyer INTEGER,
    bid_date TIMESTAMP,
    price NUMERIC(12,2)
    PRIMARY KEY (product, buyer)
);

CREATE TABLE product_questions (
    questioner INTEGER,
    answerer INTEGER,
    product INTEGER NOT NULL,
    question VARCHAR(200),
    answer VARCHAR(200)
    PRIMARY KEY (product, questioner, answerer)
);

CREATE TABLE refuse (
    product INTEGER,
    buyer INTEGER
    PRIMARY KEY (product, buyer)
);

CREATE TABLE product_images (
    product INTEGER PRIMARY KEY,
    image_path VARCHAR(100)[] NOT NULL
);

CREATE TABLE product_descriptions (
    product INTEGER PRIMARY KEY,
    description VARCHAR(200) NOT NULL,
    created_at TIMESTAMP
);

CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE messages (
    product INTEGER,
    sender INTEGER,
    content VARCHAR(200),
    image VARCHAR(200),
    type message_type,
    created_at TIMESTAMP
    PRIMARY KEY (product, sender)
);

CREATE TABLE bidder_winner (
    product INTEGER PRIMARY KEY,
    bidder INTEGER
);

CREATE TABLE sell_product (
    seller INTEGER,
    product INTEGER,
    init_price REAL,
    step_price REAL,
    created_at TIMESTAMP,
    expired_at TIMESTAMP
    PRIMARY KEY (product, seller)
);

CREATE TABLE trade_verifications (
    product INTEGER PRIMARY KEY,
    bidder INTEGER,
    seller INTEGER,
    delivery_address VARCHAR(100),
    invoice_image VARCHAR(100),
    reciept_image VARCHAR(100),
    delivery_invoice_image VARCHAR(100),
    sell_accept BOOLEAN,
    bidder_accept BOOLEAN
    state trade_state
);

-- CHECK KEY CONSTRAINTS

ALTER TABLE users
ADD CONSTRAINT chk_users_birthdate
CHECK ( birthdate <= CURRENT_DATE - INTERVAL '18 years' );

ALTER TABLE users
ADD CONSTRAINT chk_users_rating
CHECK (rating >= 0 AND rating < 1);

ALTER TABLE requests
ADD CONSTRAINT chk_requests_created_at
CHECK (created_at <= CURRENT_DATE);

ALTER TABLE sell_product
ADD CONSTRAINT chk_sell_product_created_at
CHECK (created_at <= CURRENT_DATE),
ADD CONSTRAINT chk_sell_product_expired_at
CHECK (expired_at > created_at),
ADD CONSTRAINT chk_sell_product_init_price
CHECK (init_price > 0),
ADD CONSTRAINT chk_sell_product_step_price
CHECK (step_price > 0);

ALTER TABLE messages
ADD CONSTRAINT chk_messages_created_at
CHECK (created_at <= CURRENT_DATE);

ALTER TABLE product_descriptions
ADD CONSTRAINT chk_product_descriptions_created_at
CHECK (created_at <= CURRENT_DATE);

ALTER TABLE product_images
ADD CONSTRAINT chk_product_images_image_path
CHECK (array_length(image_path, 1) >= 3);

ALTER TABLE products
ADD CONSTRAINT chk_products_current_price
CHECK (current_price > 0);

-- FOREIGN KEY CONSTRAINTS

ALTER TABLE sessions
ADD CONSTRAINT fk_sessions_user
FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE requests
ADD CONSTRAINT fk_requests_bidder
FOREIGN KEY (bidder) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE favorites
ADD CONSTRAINT fk_favorites_user
FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_favorites_product
FOREIGN KEY (product) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE bids
ADD CONSTRAINT fk_bids_buyer
FOREIGN KEY (buyer) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_bids_product
FOREIGN KEY (product) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_questions
ADD CONSTRAINT fk_product_questions_questioner
FOREIGN KEY (questioner) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_product_questions_answerer
FOREIGN KEY (answerer) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_product_questions_product
FOREIGN KEY (product) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE refuse
ADD CONSTRAINT fk_refuse_buyer
FOREIGN KEY (buyer) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_refuse_product
FOREIGN KEY (product) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_images
ADD CONSTRAINT fk_product_images_product
FOREIGN KEY (product) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_descriptions
ADD CONSTRAINT fk_product_descriptions_product
FOREIGN KEY (product) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE bidder_winner
ADD CONSTRAINT fk_bidder_winner_product
FOREIGN KEY (product) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE messages
ADD CONSTRAINT fk_messages_product
FOREIGN KEY (product) REFERENCES products(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_messages_sender
FOREIGN KEY (sender) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE trade_verifications
ADD CONSTRAINT fk_trade_verifications_product
FOREIGN KEY (product) REFERENCES products(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_trade_verifications_bidder
FOREIGN KEY (bidder) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_trade_verifications_seller
FOREIGN KEY (seller) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE reviews
ADD CONSTRAINT fk_reviews_product
FOREIGN KEY (product) REFERENCES products(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_reviews_rater
FOREIGN KEY (rater) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_reviews_ratee
FOREIGN KEY (ratee) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE sell_product
ADD CONSTRAINT fk_sell_product_product
FOREIGN KEY (product) REFERENCES products(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_sell_product_seller
FOREIGN KEY (seller) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE products
ADD CONSTRAINT fk_products_category
FOREIGN KEY (category) REFERENCES categories(id) ON DELETE CASCADE;