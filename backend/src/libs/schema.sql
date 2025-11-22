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
    role user_role DEFAULT 'user',
    rating INTEGER DEFAULT 0
);

CREATE TABLE sessions (
    user SERIAL PRIMARY KEY,
    expired_at DATE REQUIRED,
    refresh_token VARCHAR(100) UNIQUE
);

CREATE TABLE requests (
    bidder SERIAL PRIMARY KEY,
    created_at DATE,
    accepted BOOLEAN
);

CREATE TABLE favorites (
    product SERIAL PRIMARY KEY,
    user SERIAL PRIMARY KEY
);

CREATE TABLE reviews (
    product SERIAL PRIMARY KEY,
    rater SERIAL PRIMARY KEY,
    ratee SERIAL PRIMARY KEY,
    liked BOOLEAN,
    content VARCHAR(200)
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category INTEGER[],
    name VARCHAR(50) NOT NULL,
    current_price REAL NOT NULL,
    image VARCHAR(100) NOT NULL,
    state product_state 
);

CREATE TABLE bids (
    product SERIAL PRIMARY KEY,
    buyer SERIAL PRIMARY KEY,
    bid_date TIMESTAMP,
    price REAL
);

CREATE TABLE product_questions (
    questioner SERIAL PRIMARY KEY,
    answerer SERIAL PRIMARY KEY,
    product SERIAL PRIMARY KEY NOT NULL,
    question VARCHAR(200),
    answer VARCHAR(200)
);

CREATE TABLE refuse (
    product SERIAL PRIMARY KEY,
    buyer SERIAL PRIMARY KEY
);

CREATE TABLE product_images (
    product SERIAL PRIMARY KEY,
    image_path VARCHAR(100)[] NOT NULL
);

CREATE TABLE product_descriptions (
    product SERIAL PRIMARY KEY,
    description VARCHAR(200) NOT NULL,
    created_at TIMESTAMP
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE messages (
    product SERIAL PRIMARY KEY,
    sender SERIAL PRIMARY KEY,
    content VARCHAR(200),
    image VARCHAR(200),
    type message_type,
    created_at TIMESTAMP
);

CREATE TABLE bidder_winner (
    product SERIAL PRIMARY KEY,
    bidder SERIAL
);

CREATE TABLE sell_product (
    seller SERIAL PRIMARY KEY,
    product SERIAL PRIMARY KEY,
    init_price REAL,
    step_price REAL,
    created_at TIMESTAMP,
    expired_at TIMESTAMP
);

CREATE TABLE trade_verifications (
    product SERIAL PRIMARY KEY,
    bidder SERIAL
    seller SERIAL,
    delivery_address VARCHAR(100),
    invoice_image VARCHAR(100),
    reciept_image VARCHAR(100),
    delivery_invoice_image VARCHAR(100),
    sell_accept BOOLEAN,
    bidder_accept BOOLEAN
    state trade_state
);

ALTER TABLE users
ADD CONSTRAINT chk_birthdate
CHECK (
    birthdate <= CURRENT_DATE             
    AND birthdate <= CURRENT_DATE - INTERVAL '18 years'  
);

ALTER TABLE users
ADD CONSTRAINT chk_birthdate
CHECK (rating > 0 AND rating < 1);

ALTER TABLE requests
ADD CONSTRAINT chk_created_at
CHECK (created_at <= CURRENT_DATE);

ALTER TABLE sell_product
ADD CONSTRAINT chk_created_at
CHECK (created_at <= CURRENT_DATE)
ADD CONSTRAINT chk_expired_at
CHECK (expired_at > created_at)
ADD CONSTRAINT chk_init_price
CHECK (init_price > 0)
ADD CONSTRAINT chk_step_price
CHECK (step_price > 0);

ALTER TABLE messages
ADD CONSTRAINT chk_created_at
CHECK (created_at <= CURRENT_DATE);

ALTER TABLE product_descriptions
ADD CONSTRAINT chk_created_at
CHECK (created_at <= CURRENT_DATE);

ALTER TABLE product_imagess
ADD CONSTRAINT chk_image_path
CHECK (array_length(image_path, 1) >= 3);

ALTER TABLE products
ADD CONSTRAINT chk_current_price
CHECK (current_price > 0);

ALTER TABLE bids
ADD CONSTRAINT fk_auction
FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE;