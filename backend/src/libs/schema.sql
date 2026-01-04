CREATE DATABASE OnlineAuction;

CREATE TYPE user_role AS ENUM ('bidder', 'seller', 'admin');

CREATE TYPE product_state AS ENUM ('incoming', 'bidding', 'sold');

CREATE TYPE state AS ENUM ('pending', 'failed', 'success');

CREATE TYPE trade_state AS ENUM(
    'pending_payment', 
    'pending_seller_confirm', 
    'pending_bidder_confirm',
    'completed',
    'failed'
);

CREATE TYPE message_type AS ENUM ('text', 'image', 'text_and_image');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    address VARCHAR(100) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    hashed_password VARCHAR(100) NOT NULL,
    birthdate DATE NOT NULL,
    role user_role DEFAULT 'bidder',
    rating REAL DEFAULT 0
);

CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expired_at DATE NOT NULL,
    refresh_token text UNIQUE NOT NULL
);

CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    bidder INTEGER NOT NULL,
    created_at DATE NOT NULL,
    state state NOT NULL DEFAULT 'pending'
);

CREATE TABLE favorites (
    product INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (product, user_id)
);

CREATE TABLE reviews (
    product INTEGER NOT NULL,
    rater INTEGER NOT NULL,
    ratee INTEGER NOT NULL,
    liked BOOLEAN NOT NULL,
    content VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (product, ratee, rater)
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    current_price REAL NOT NULL,
    image VARCHAR(500) NOT NULL,
    state product_state DEFAULT 'incoming' NOT NULL
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    parent INTEGER REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE product_categories (
    product INT NOT NULL,
    category INT NOT NULL,
    PRIMARY KEY (product, category),
    FOREIGN KEY (product) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (category) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE bids (
    id SERIAL PRIMARY KEY,
    product INTEGER NOT NULL,
    buyer INTEGER NOT NULL,
    bid_date TIMESTAMP NOT NULL,
    price NUMERIC(12,2) NOT NULL
);

CREATE TABLE auto_bids (
    product INTEGER NOT NULL,
    bidder INTEGER NOT NULL,
    max_price NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (product, bidder),
    FOREIGN KEY (product) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (bidder) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE bid_requests (
    id SERIAL PRIMARY KEY,
    bidder INTEGER NOT NULL,
    product INTEGER NOT NULL,
    request_date TIMESTAMP NOT NULL DEFAULT NOW(),
    state state NOT NULL DEFAULT 'pending',

    FOREIGN KEY (bidder) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE allowed_bidder (
    product INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    bidder INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    allowed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (product, bidder)
);

CREATE TABLE product_questions (
    id SERIAL PRIMARY KEY,
    questioner INTEGER NOT NULL,
    answerer INTEGER,
    product INTEGER NOT NULL,
    question VARCHAR(200) NOT NULL,
    answer VARCHAR(200),
    asked_at TIMESTAMP NOT NULL DEFAULT NOW(),
    answered_at TIMESTAMP
);

CREATE TABLE refuse (
    product INTEGER NOT NULL,
    buyer INTEGER NOT NULL,
    PRIMARY KEY (product, buyer)
);

CREATE TABLE product_images (
    product INTEGER PRIMARY KEY,
    image_path VARCHAR(500)[] NOT NULL
);

CREATE TABLE product_descriptions (
    id SERIAL PRIMARY KEY,
    product INTEGER NOT NULL,
    description VARCHAR(200) NOT NULL,
    created_at TIMESTAMP NOT NULL
);


CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    product INTEGER NOT NULL,
    sender INTEGER NOT NULL,
    content VARCHAR(200),
    image VARCHAR(200),
    type message_type NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE bidder_winner (
    product INTEGER PRIMARY KEY,
    bidder INTEGER NOT NULL
);

CREATE TABLE sell_product (
    product INTEGER PRIMARY KEY,
    seller INTEGER NOT NULL,
    init_price REAL NOT NULL,
    step_price REAL NOT NULL,
    instant_price REAL,
    starting_at TIMESTAMP NOT NULL DEFAULT now(),
    isExtent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now(),    
    expired_at TIMESTAMP NOT NULL
);

CREATE TABLE trade_verifications (
    product INTEGER PRIMARY KEY,
    bidder INTEGER NOT NULL,
    seller INTEGER NOT NULL,
    delivery_address VARCHAR(100),
    invoice_image VARCHAR(100),
    transport_image VARCHAR(100),
    sell_accept BOOLEAN NOT NULL DEFAULT 'false',
    bidder_accept BOOLEAN NOT NULL DEFAULT 'false',
    state trade_state NOT NULL DEFAULT 'pending_payment'
);

-- CHECK KEY CONSTRAINTS

ALTER TABLE users
ADD CONSTRAINT chk_users_birthdate
CHECK ( birthdate <= CURRENT_DATE - INTERVAL '18 years' );

ALTER TABLE users
ADD CONSTRAINT chk_users_rating
CHECK (rating >= 0 AND rating <= 1);

ALTER TABLE requests
ADD CONSTRAINT chk_requests_created_at
CHECK (created_at <= CURRENT_DATE);

ALTER TABLE sell_product
ADD CONSTRAINT chk_sell_product_expired_at
CHECK (expired_at > created_at),
ADD CONSTRAINT chk_sell_product_init_price
CHECK (init_price > 0),
ADD CONSTRAINT chk_sell_product_step_price
CHECK (step_price > 0),
ADD CONSTRAINT chk_sell_product_instant_price
CHECK (instant_price IS NULL OR instant_price > init_price);

ALTER TABLE messages
ADD CONSTRAINT chk_messages_created_at
CHECK (created_at <= NOW());

ALTER TABLE product_descriptions
ADD CONSTRAINT chk_product_descriptions_created_at
CHECK (created_at <= NOW());

ALTER TABLE product_images
ADD CONSTRAINT chk_product_images_image_path
CHECK (array_length(image_path, 1) >= 3);

ALTER TABLE products
ADD CONSTRAINT chk_products_current_price
CHECK (current_price > 0);

-- FOREIGN KEY CONSTRAINTS

ALTER TABLE sessions
ADD CONSTRAINT fk_sessions_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE requests
ADD CONSTRAINT fk_requests_bidder
FOREIGN KEY (bidder) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE favorites
ADD CONSTRAINT fk_favorites_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
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
FOREIGN KEY (product) REFERENCES products(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_bidder_winner_bidder
FOREIGN KEY (bidder) REFERENCES users(id) ON DELETE CASCADE;

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

-- 1. Insert Users
INSERT INTO users (name, address, email, hashed_password, birthdate, role, rating)
VALUES
('Alice Nguyen', '123 Le Loi, HCM', 'alice@example.com', '$2b$12$9uVa/in7DXarqH8BaTMgFOstXOy2dyOWA3R8AXa3VYQFbyIIsM1pS', '1999-05-12', 'seller', 0),
('Bob Tran', '45 Nguyen Hue, HCM', 'bob@example.com', '$2b$12$GYaai7/JxSo2VaZpkm/8AeMTmWPOck8c4p2dnK/ycbDmUU5bTOS1q', '1995-11-02', 'bidder', 0),
('Charlie Pham', '12 Tran Hung Dao, HCM', 'charlie@example.com', '$2b$12$sYld5KWZlbJMiq0HTygK4OVosTSCG93T415Agtd.K1AFEVNHwN3hy', '1990-07-25', 'bidder', 0),
('David Ho', '89 Vo Van Tan, HCM', 'david@example.com', '$2b$12$n6y.QYKn9TkfbqSnBDsYaOcaOKC68BnlPvt5rdxSgJK0pjtvYdrNu', '1998-04-19', 'bidder', 0),
('Emma Le', '77 Dien Bien Phu, HCM', 'emma@example.com', '$2b$12$z8deg5NS5P43/O7O0yWeKehfB82ymWUVNlF3UQgrzH9HW9sNCJqiG', '1997-09-09', 'seller', 0);

-- 2. Insert Categories (2 levels: Parent => Child)
-- Level 1: Parent categories
INSERT INTO categories (name, parent) VALUES
('Electronics', NULL),
('Fashion', NULL),
('Home', NULL),
('Sports', NULL);

-- Level 2: Child categories
INSERT INTO categories (name, parent) VALUES
('Mobile Phones', 1),
('Laptops', 1),
('Shoes', 2),
('Watches', 2),
('Kitchen Appliances', 3),
('Furniture', 3),
('Outdoor Sports', 4),
('Collectibles', 4);

-- 3. Insert 20 Products

-- Các product có state = 'bidding' để có thể đấu giá.

INSERT INTO products (name, current_price, image, state)
VALUES
('iPhone 14 Pro Max', 25000000, 'https://picsum.photos/seed/p1/300', 'bidding'),
('Samsung Galaxy S23', 18000000, 'https://picsum.photos/seed/p2/300', 'bidding'),
('MacBook Air M2', 28000000, 'https://picsum.photos/seed/p3/300', 'bidding'),
('Sony WH-1000XM5', 7500000, 'https://picsum.photos/seed/p4/300', 'bidding'),
('Canon EOS M50', 15000000, 'https://picsum.photos/seed/p5/300', 'bidding'),

('Nike Air Jordan 1', 5000000, 'https://picsum.photos/seed/p6/300', 'bidding'),
('Adidas Ultraboost', 3800000, 'https://picsum.photos/seed/p7/300', 'bidding'),
('LV Handbag White', 42000000, 'https://picsum.photos/seed/p8/300', 'bidding'),
('Gucci Sunglasses', 9000000, 'https://picsum.photos/seed/p9/300', 'sold'),
('Unisex Leather Jacket', 3200000, 'https://picsum.photos/seed/p10/300', 'bidding'),

('Vacuum Cleaner Xiaomi', 2500000, 'https://picsum.photos/seed/p11/300', 'bidding'),
('Air Fryer Philips XL', 3900000, 'https://picsum.photos/seed/p12/300', 'bidding'),
('Ikea LED Lamp', 900000, 'https://picsum.photos/seed/p13/300', 'bidding'),
('Panasonic Blender', 1200000, 'https://picsum.photos/seed/p14/300', 'bidding'),
('Lock&Lock Cookware Set', 1700000, 'https://picsum.photos/seed/p15/300', 'bidding'),

('Wilson Tennis Racket', 2800000, 'https://picsum.photos/seed/p16/300', 'bidding'),
('Decathlon Mountain Bike', 7500000, 'https://picsum.photos/seed/p17/300', 'bidding'),
('Football Nike Flight', 2500000, 'https://picsum.photos/seed/p18/300', 'bidding'),
('Vintage Pokemon Card', 9500000, 'https://picsum.photos/seed/p19/300', 'bidding'),
('Gundam Model RX-78', 1500000, 'https://picsum.photos/seed/p20/300', 'bidding');

-- 4. Insert Product Categories Mapping

-- Electronics => Mobile Phones (1,2)
INSERT INTO product_categories VALUES
(1,5),(2,5);

-- Electronics => Laptops (3,4,5)
INSERT INTO product_categories VALUES
(3,6),(4,6),(5,6);

-- Fashion => Shoes (6,7)
INSERT INTO product_categories VALUES
(6,7),(7,7);

-- Fashion => Watches (8,9,10)
INSERT INTO product_categories VALUES
(8,8),(9,8),(10,8);

-- Home => Kitchen Appliances (11,12,13,14)
INSERT INTO product_categories VALUES
(11,9),(12,9),(13,9),(14,9);

-- Home => Furniture (15)
INSERT INTO product_categories VALUES
(15,10);

-- Sports => Outdoor Sports (16,17,18)
INSERT INTO product_categories VALUES
(16,11),(17,11),(18,11);

-- Sports => Collectibles (19,20)
INSERT INTO product_categories VALUES
(19,12),(20,12);

-- 5. Insert Product Images (3 ảnh mỗi sản phẩm)
INSERT INTO product_images (product, image_path)
VALUES
(1, ARRAY['https://picsum.photos/seed/p1a/300','https://picsum.photos/seed/p1b/300','https://picsum.photos/seed/p1c/300']),
(2, ARRAY['https://picsum.photos/seed/p2a/300','https://picsum.photos/seed/p2b/300','https://picsum.photos/seed/p2c/300']),
(3, ARRAY['https://picsum.photos/seed/p3a/300','https://picsum.photos/seed/p3b/300','https://picsum.photos/seed/p3c/300']),
(4, ARRAY['https://picsum.photos/seed/p4a/300','https://picsum.photos/seed/p4b/300','https://picsum.photos/seed/p4c/300']),
(5, ARRAY['https://picsum.photos/seed/p5a/300','https://picsum.photos/seed/p5b/300','https://picsum.photos/seed/p5c/300']),

(6, ARRAY['https://picsum.photos/seed/p6a/300','https://picsum.photos/seed/p6b/300','https://picsum.photos/seed/p6c/300']),
(7, ARRAY['https://picsum.photos/seed/p7a/300','https://picsum.photos/seed/p7b/300','https://picsum.photos/seed/p7c/300']),
(8, ARRAY['https://picsum.photos/seed/p8a/300','https://picsum.photos/seed/p8b/300','https://picsum.photos/seed/p8c/300']),
(9, ARRAY['https://picsum.photos/seed/p9a/300','https://picsum.photos/seed/p9b/300','https://picsum.photos/seed/p9c/300']),
(10, ARRAY['https://picsum.photos/seed/p10a/300','https://picsum.photos/seed/p10b/300','https://picsum.photos/seed/p10c/300']),

(11, ARRAY['https://picsum.photos/seed/p11a/300','https://picsum.photos/seed/p11b/300','https://picsum.photos/seed/p11c/300']),
(12, ARRAY['https://picsum.photos/seed/p12a/300','https://picsum.photos/seed/p12b/300','https://picsum.photos/seed/p12c/300']),
(13, ARRAY['https://picsum.photos/seed/p13a/300','https://picsum.photos/seed/p13b/300','https://picsum.photos/seed/p13c/300']),
(14, ARRAY['https://picsum.photos/seed/p14a/300','https://picsum.photos/seed/p14b/300','https://picsum.photos/seed/p14c/300']),
(15, ARRAY['https://picsum.photos/seed/p15a/300','https://picsum.photos/seed/p15b/300','https://picsum.photos/seed/p15c/300']),

(16, ARRAY['https://picsum.photos/seed/p16a/300','https://picsum.photos/seed/p16b/300','https://picsum.photos/seed/p16c/300']),
(17, ARRAY['https://picsum.photos/seed/p17a/300','https://picsum.photos/seed/p17b/300','https://picsum.photos/seed/p17c/300']),
(18, ARRAY['https://picsum.photos/seed/p18a/300','https://picsum.photos/seed/p18b/300','https://picsum.photos/seed/p18c/300']),
(19, ARRAY['https://picsum.photos/seed/p19a/300','https://picsum.photos/seed/p19b/300','https://picsum.photos/seed/p19c/300']),
(20, ARRAY['https://picsum.photos/seed/p20a/300','https://picsum.photos/seed/p20b/300','https://picsum.photos/seed/p20c/300']);

-- 6. Insert Product Descriptions
INSERT INTO product_descriptions (product, description, created_at)
VALUES
(1,'Premium iPhone 14 Pro Max fullbox like new', NOW()),
(2,'Samsung S23 flagship 5G performance', NOW()),
(3,'MacBook Air M2 ultralight laptop', NOW()),
(4,'Sony XM5 best noise-canceling headset', NOW()),
(5,'Canon M50 perfect for vloggers', NOW()),

(6,'Nike Air Jordan 1 iconic sneaker', NOW()),
(7,'Adidas Ultraboost soft running shoes', NOW()),
(8,'Louis Vuitton luxury white handbag', NOW()),
(9,'Gucci original sunglasses', NOW()),
(10,'High-quality leather jacket', NOW()),

(11,'Xiaomi strong suction vacuum cleaner', NOW()),
(12,'Philips XL air fryer for healthy food', NOW()),
(13,'Ikea stylish LED lamp', NOW()),
(14,'Panasonic durable blender', NOW()),
(15,'Lock&Lock stainless cookware set', NOW()),

(16,'Wilson high-precision tennis racket', NOW()),
(17,'Decathlon durable mountain bike', NOW()),
(18,'Nike Flight premium football', NOW()),
(19,'Vintage rare Pokemon card', NOW()),
(20,'Gundam RX-78 collectible model', NOW());

-- 7. Insert Sell Product (listing info)

INSERT INTO sell_product (product, seller, init_price, step_price, created_at, expired_at)
VALUES
(1,1,20000000,500000,NOW(), NOW() + INTERVAL '7 days'),
(2,5,15000000,300000,NOW(), NOW() + INTERVAL '7 days'),
(3,1,25000000,600000,NOW(), NOW() + INTERVAL '7 days'),
(4,5,5000000,200000,NOW(), NOW() + INTERVAL '7 days'),
(5,1,12000000,400000,NOW(), NOW() + INTERVAL '7 days'),

(6,5,3000000,200000,NOW(), NOW() + INTERVAL '7 days'),
(7,1,2500000,150000,NOW(), NOW() + INTERVAL '7 days'),
(8,5,38000000,800000,NOW(), NOW() + INTERVAL '7 days'),
(9,1,7000000,200000,NOW(), NOW() + INTERVAL '7 days'),
(10,5,2500000,150000,NOW(), NOW() + INTERVAL '7 days'),

(11,1,2000000,100000,NOW(), NOW() + INTERVAL '7 days'),
(12,5,3000000,150000,NOW(), NOW() + INTERVAL '7 days'),
(13,1,500000,50000,NOW(), NOW() + INTERVAL '7 days'),
(14,5,900000,80000,NOW(), NOW() + INTERVAL '7 days'),
(15,1,1000000,100000,NOW(), NOW() + INTERVAL '7 days'),

(16,5,2000000,150000,NOW(), NOW() + INTERVAL '7 days'),
(17,1,5000000,300000,NOW(), NOW() + INTERVAL '7 days'),
(18,5,1500000,100000,NOW(), NOW() + INTERVAL '7 days'),
(19,1,5000000,400000,NOW(), NOW() + INTERVAL '7 days'),
(20,5,900000,80000,NOW(), NOW() + INTERVAL '7 days');

-- 8. Insert 5 Bids per Product

INSERT INTO bids (product, buyer, bid_date, price)
VALUES
(1,2,NOW() - INTERVAL '5 hours', 20500000),
(1,3,NOW() - INTERVAL '4 hours', 21000000),
(1,4,NOW() - INTERVAL '3 hours', 21500000),
(1,2,NOW() - INTERVAL '2 hours', 22000000),
(1,3,NOW() - INTERVAL '1 hours', 22500000);

-- PRODUCT 2
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(2,2,NOW() - INTERVAL '5 hours',15300000),
(2,3,NOW() - INTERVAL '4 hours',15600000),
(2,4,NOW() - INTERVAL '3 hours',15900000),
(2,2,NOW() - INTERVAL '2 hours',16200000),
(2,3,NOW() - INTERVAL '1 hours',16500000);

-- PRODUCT 3
INSERT INTO bids(product, buyer, bid_date, price) VALUES
(3,2,NOW() - INTERVAL '5 hours',25600000),
(3,3,NOW() - INTERVAL '4 hours',26200000),
(3,4,NOW() - INTERVAL '3 hours',26800000),
(3,2,NOW() - INTERVAL '2 hours',27400000),
(3,3,NOW() - INTERVAL '1 hours',28000000);

-- PRODUCT 4
INSERT INTO bids(product, buyer, bid_date, price) VALUES
(4,2,NOW() - INTERVAL '5 hours',5200000),
(4,3,NOW() - INTERVAL '4 hours',5400000),
(4,4,NOW() - INTERVAL '3 hours',5600000),
(4,2,NOW() - INTERVAL '2 hours',5800000),
(4,3,NOW() - INTERVAL '1 hours',6000000);

-- PRODUCT 5
INSERT INTO bids(product, buyer, bid_date, price) VALUES
(5,2,NOW() - INTERVAL '5 hours',12400000),
(5,3,NOW() - INTERVAL '4 hours',12800000),
(5,4,NOW() - INTERVAL '3 hours',13200000),
(5,2,NOW() - INTERVAL '2 hours',13600000),
(5,3,NOW() - INTERVAL '1 hours',14000000);

-- PRODUCT 6
INSERT INTO bids(product, buyer, bid_date, price) VALUES
(6,2,NOW() - INTERVAL '5 hours',3200000),
(6,3,NOW() - INTERVAL '4 hours',3400000),
(6,4,NOW() - INTERVAL '3 hours',3600000),
(6,2,NOW() - INTERVAL '2 hours',3800000),
(6,3,NOW() - INTERVAL '1 hours',4000000);

-- PRODUCT 7
INSERT INTO bids(product, buyer, bid_date, price) VALUES
(7,2,NOW() - INTERVAL '5 hours',2650000),
(7,3,NOW() - INTERVAL '4 hours',2800000),
(7,4,NOW() - INTERVAL '3 hours',2950000),
(7,2,NOW() - INTERVAL '2 hours',3100000),
(7,3,NOW() - INTERVAL '1 hours',3250000);

-- PRODUCT 8
INSERT INTO bids(product, buyer, bid_date, price) VALUES
(8,2,NOW() - INTERVAL '5 hours',38800000),
(8,3,NOW() - INTERVAL '4 hours',39600000),
(8,4,NOW() - INTERVAL '3 hours',40400000),
(8,2,NOW() - INTERVAL '2 hours',41200000),
(8,3,NOW() - INTERVAL '1 hours',42000000);

-- PRODUCT 9
INSERT INTO bids(product, buyer, bid_date, price) VALUES
(9,2,NOW() - INTERVAL '5 hours',7200000),
(9,3,NOW() - INTERVAL '4 hours',7400000),
(9,4,NOW() - INTERVAL '3 hours',7600000),
(9,2,NOW() - INTERVAL '2 hours',7800000),
(9,3,NOW() - INTERVAL '1 hours',8000000);

-- PRODUCT 10
INSERT INTO bids(product, buyer, bid_date, price) VALUES
(10,2,NOW() - INTERVAL '5 hours',2650000),
(10,3,NOW() - INTERVAL '4 hours',2800000),
(10,4,NOW() - INTERVAL '3 hours',2950000),
(10,2,NOW() - INTERVAL '2 hours',3100000),
(10,3,NOW() - INTERVAL '1 hours',3250000);

-- PRODUCT 11
INSERT INTO bids(product, buyer, bid_date, price) VALUES
(11,2,NOW() - INTERVAL '5 hours',2100000),
(11,3,NOW() - INTERVAL '4 hours',2200000),
(11,4,NOW() - INTERVAL '3 hours',2300000),
(11,2,NOW() - INTERVAL '2 hours',2400000),
(11,3,NOW() - INTERVAL '1 hours',2500000);

-- PRODUCT 12
INSERT INTO bids(product, buyer, bid_date, price) VALUES
(12,2,NOW() - INTERVAL '5 hours',3150000),
(12,3,NOW() - INTERVAL '4 hours',3300000),
(12,4,NOW() - INTERVAL '3 hours',3450000),
(12,2,NOW() - INTERVAL '2 hours',3600000),
(12,3,NOW() - INTERVAL '1 hours',3750000);

-- PRODUCT 13
INSERT INTO bids(product, buyer, bid_date, price) VALUES
(13,2,NOW() - INTERVAL '5 hours',550000),
(13,3,NOW() - INTERVAL '4 hours',600000),
(13,4,NOW() - INTERVAL '3 hours',650000),
(13,2,NOW() - INTERVAL '2 hours',700000),
(13,3,NOW() - INTERVAL '1 hours',750000);

-- PRODUCT 14
INSERT INTO bids(product, buyer, bid_date, price) VALUES
(14,2,NOW() - INTERVAL '5 hours',980000),
(14,3,NOW() - INTERVAL '4 hours',1060000),
(14,4,NOW() - INTERVAL '3 hours',1140000),
(14,2,NOW() - INTERVAL '2 hours',1220000),
(14,3,NOW() - INTERVAL '1 hours',1300000);

-- PRODUCT 15
INSERT INTO bids(product, buyer, bid_date, price) VALUES
(15,2,NOW() - INTERVAL '5 hours',1100000),
(15,3,NOW() - INTERVAL '4 hours',1200000),
(15,4,NOW() - INTERVAL '3 hours',1300000),
(15,2,NOW() - INTERVAL '2 hours',1400000),
(15,3,NOW() - INTERVAL '1 hours',1500000);

-- PRODUCT 16
INSERT INTO bids(product, buyer, bid_date, price) VALUES
(16,2,NOW() - INTERVAL '5 hours',2150000),
(16,3,NOW() - INTERVAL '4 hours',2300000),
(16,4,NOW() - INTERVAL '3 hours',2450000),
(16,2,NOW() - INTERVAL '2 hours',2600000),
(16,3,NOW() - INTERVAL '1 hours',2750000);

-- PRODUCT 17
INSERT INTO bids(product, buyer, bid_date, price) VALUES 
(17,2,NOW() - INTERVAL '5 hours',5300000),
(17,3,NOW() - INTERVAL '4 hours',5600000),
(17,4,NOW() - INTERVAL '3 hours',5900000),
(17,2,NOW() - INTERVAL '2 hours',6200000),
(17,3,NOW() - INTERVAL '1 hours',6500000);

-- PRODUCT 18
INSERT INTO bids(product, buyer, bid_date, price) VALUES
(18,2,NOW() - INTERVAL '5 hours',1600000),
(18,3,NOW() - INTERVAL '4 hours',1700000),
(18,4,NOW() - INTERVAL '3 hours',1800000),
(18,2,NOW() - INTERVAL '2 hours',1900000),
(18,3,NOW() - INTERVAL '1 hours',2000000);

-- PRODUCT 19
INSERT INTO bids(product, buyer, bid_date, price) VALUES
(19,2,NOW() - INTERVAL '5 hours',5400000),
(19,3,NOW() - INTERVAL '4 hours',5800000),
(19,4,NOW() - INTERVAL '3 hours',6200000),
(19,2,NOW() - INTERVAL '2 hours',6600000),
(19,3,NOW() - INTERVAL '1 hours',7000000);

-- PRODUCT 20
INSERT INTO bids(product, buyer, bid_date, price) VALUES
(20,2,NOW() - INTERVAL '5 hours',980000),
(20,3,NOW() - INTERVAL '4 hours',1060000),
(20,4,NOW() - INTERVAL '3 hours',1140000),
(20,2,NOW() - INTERVAL '2 hours',1220000),
(20,3,NOW() - INTERVAL '1 hours',1300000);

-- 9. Insert Requests
INSERT INTO requests (bidder, created_at, state) VALUES
(2, '2024-01-10', 'pending'),
(3, '2024-01-12', 'success'),
(4, '2024-01-14', 'pending');

-- 10. Insert Favorites
INSERT INTO favorites (product, user_id) VALUES
(1, 2), (1, 3), (2, 2), (3, 3), (4, 2), (5, 3);

CREATE OR REPLACE FUNCTION fn_update_user_rating()
RETURNS TRIGGER AS $$
DECLARE
    affected_user_id INT;
BEGIN
    -- Xác định user nào bị ảnh hưởng
    IF TG_OP = 'DELETE' THEN
        affected_user_id := OLD.ratee;
    ELSE
        affected_user_id := NEW.ratee;
    END IF;
    
    -- Cập nhật rating cho user (chuyển sang thang 0-5)
    UPDATE users
    SET rating = (
        SELECT COALESCE(
            (COUNT(*) FILTER (WHERE liked = true)::REAL / 
            NULLIF(COUNT(*)::REAL, 0)),
            0
        )
        FROM reviews
        WHERE ratee = affected_user_id
    )
    WHERE id = affected_user_id;
    
    -- Nếu là UPDATE và ratee thay đổi, cập nhật cả user cũ
    IF TG_OP = 'UPDATE' AND OLD.ratee != NEW.ratee THEN
        UPDATE users
        SET rating = (
            SELECT COALESCE(
                (COUNT(*) FILTER (WHERE liked = true)::REAL / 
                NULLIF(COUNT(*)::REAL, 0)),
                0
            )
            FROM reviews
            WHERE ratee = OLD.ratee
        )
        WHERE id = OLD.ratee;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger
CREATE TRIGGER trg_update_rating_on_review_change
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION fn_update_user_rating();
CREATE OR REPLACE FUNCTION users_tsvector_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.name, ''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.email, ''))), 'B');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- 11. Insert Reviews
-- Alice
INSERT INTO reviews (product, rater, ratee, liked, content) VALUES
(2,2,1,true,'Fast response'),
(3,3,1,true,'Good packaging'),
(4,4,1,true,'Exactly as described'),
(5,2,1,false,'Shipping a bit slow');

-- Bob 
INSERT INTO reviews (product, rater, ratee, liked, content) VALUES
(1,1,2,true,'Paid quickly'),
(3,1,2,true,'Smooth transaction'),
(4,5,2,true,'Nice buyer'),
(6,1,2,false,'Late confirmation'),
(7,5,2,false,'Bid retracted once');

-- Charlie
INSERT INTO reviews (product, rater, ratee, liked, content) VALUES
(8,5,3,true,'Very polite'),
(9,1,3,true,'Fast payment'),
(10,1,3,true,'Clear communication'),
(11,5,3,true,'Reliable bidder'),
(12,1,3,false,'Asked too many questions');

-- David
INSERT INTO reviews (product, rater, ratee, liked, content) VALUES
(13,1,4,true,'Fair bidder'),
(14,5,4,true,'On-time payment'),
(15,1,4,false,'Low bids'),
(16,5,4,false,'Unresponsive once');

-- Emma
INSERT INTO reviews (product, rater, ratee, liked, content) VALUES
(17,2,5,true,'Very professional'),
(18,3,5,true,'Item well packed'),
(19,4,5,true,'Smooth deal');

-- 12. Insert Messages
INSERT INTO messages (product, sender, content, type, created_at) VALUES
(3,3,'Can you lower starting price?','text',NOW()),
(3,1,'Sorry, price is fixed.','text',NOW()),
(6,3,'Is this authentic?','text',NOW()),
(6,5,'Yes, 100% authentic.','text',NOW()),
(8,4,'Any defects?','text',NOW()),
(8,5,'No defects, brand new.','text',NOW());

-- 13. Insert Refuse
INSERT INTO refuse (product, buyer) VALUES
(5, 4), (8, 2);

-- 14. Insert Bidder Winner
INSERT INTO bidder_winner (product, bidder) VALUES
(3,3),
(6,2),
(9,3);


-- 15. Insert Trade Verifications
INSERT INTO trade_verifications
(product, bidder, seller, delivery_address, sell_accept, bidder_accept, state)
VALUES
(3,3,1,'12 Tran Hung Dao, HCM',true,false,'pending_bidder_confirm'),
(6,2,5,'45 Nguyen Hue, HCM',true,true,'completed'),
(9,3,1,'77 Dien Bien Phu, HCM',false,false,'pending_payment');

-- 16. Insert Sessions
INSERT INTO sessions (user_id, expired_at, refresh_token) VALUES
(1, CURRENT_DATE + INTERVAL '30 days', 'refresh_token_alice_123456'),
(2, CURRENT_DATE + INTERVAL '30 days', 'refresh_token_bob_789012'),
(3, CURRENT_DATE + INTERVAL '30 days', 'refresh_token_charlie_345678');

-- 17. Insert Product Questions
INSERT INTO product_questions (questioner, answerer, product, question, answer) VALUES
(2, 1, 1, 'Is the phone unlocked?', 'Yes, fully unlocked for all carriers'),
(3, 1, 3, 'Does it come with original charger?', 'Yes, original Apple charger included'),
(4, 5, 2, 'Any scratches on screen?', 'No scratches, screen protector applied'),
(2, 5, 8, 'Is this authentic LV?', 'Yes, comes with certificate of authenticity'),
(3, NULL, 5, 'Battery life?', NULL);

-- 18. Insert Bid Requests
INSERT INTO bid_requests (bidder, product, request_date, state) VALUES
(2, 1, NOW() - INTERVAL '2 days', 'success'),
(3, 2, NOW() - INTERVAL '1 day', 'success'),
(4, 3, NOW() - INTERVAL '3 hours', 'pending');

-- 19. Insert Allowed Bidders
INSERT INTO allowed_bidder (product, bidder, allowed_at) VALUES
(1, 2, NOW() - INTERVAL '2 days'),
(1, 3, NOW() - INTERVAL '2 days'),
(2, 2, NOW() - INTERVAL '1 day'),
(2, 3, NOW() - INTERVAL '1 day'),
(3, 2, NOW() - INTERVAL '1 day'),
(3, 3, NOW() - INTERVAL '1 day'),
(3, 4, NOW() - INTERVAL '1 day');

INSERT INTO auto_bids (product, bidder, max_price) VALUES
(1,2,26000000),
(1,3,27000000),
(2,3,18000000),
(3,2,30000000),
(4,4,7000000),
(6,2,4500000),
(7,3,3500000),
(8,4,45000000),
(9,2,9000000),
(10,3,3800000);

-- 1. Setup Extension & Column
CREATE EXTENSION IF NOT EXISTS unaccent;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

-- 2. Core Function: Update Search Vector
-- Logic: Name (A) || Category (B) || Description (C)
CREATE OR REPLACE FUNCTION fn_update_product_search_vector(product_id_input INT)
RETURNS VOID AS $$
BEGIN
    UPDATE products
    SET search_vector = 
        -- Weight A: Product Name
        setweight(to_tsvector('simple', unaccent(COALESCE(name, ''))), 'A') ||
        
        -- Weight B: Category Names
        setweight(to_tsvector('simple', unaccent(COALESCE((
            -- CTE Đệ quy để lấy danh mục hiện tại và toàn bộ danh mục cha
            WITH RECURSIVE category_tree AS (
                -- 1. Anchor: Lấy các danh mục trực tiếp của sản phẩm
                SELECT c.id, c.name, c.parent
                FROM categories c
                JOIN product_categories pc ON c.id = pc.category
                WHERE pc.product = product_id_input
                
                UNION ALL
                
                -- 2. Recursive: Lần ngược lên các danh mục cha (parent)
                SELECT parent_cat.id, parent_cat.name, parent_cat.parent
                FROM categories parent_cat
                JOIN category_tree child_cat ON child_cat.parent = parent_cat.id
            )
            SELECT STRING_AGG(name, ' ') FROM category_tree
        ), ''))), 'B') ||
        
        -- Weight C: Product Descriptions
        setweight(to_tsvector('simple', unaccent(COALESCE((
            SELECT STRING_AGG(d.description, ' ')
            FROM product_descriptions d
            WHERE d.product = product_id_input
        ), ''))), 'C')
    WHERE id = product_id_input;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------
-- TRIGGER 1: Khi thay đổi bảng products
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trg_products_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.name IS DISTINCT FROM OLD.name THEN
        PERFORM fn_update_product_search_vector(NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_update ON products;
CREATE TRIGGER trg_products_update
AFTER INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION fn_trg_products_update();

-- ---------------------------------------------------------
-- TRIGGER 2: Khi thay đổi bảng product_decriptions
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trg_description_update()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        PERFORM fn_update_product_search_vector(OLD.product);
    ELSE
        PERFORM fn_update_product_search_vector(NEW.product);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_description_update ON product_descriptions;
CREATE TRIGGER trg_description_update
AFTER INSERT OR UPDATE OR DELETE ON product_descriptions
FOR EACH ROW EXECUTE FUNCTION fn_trg_description_update();

-- ---------------------------------------------------------
-- TRIGGER 3: Khi thay đổi bảng product_categories
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trg_product_categories_update()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') THEN
        PERFORM fn_update_product_search_vector(OLD.product);
    END IF;
    
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        PERFORM fn_update_product_search_vector(NEW.product);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_product_categories_update ON product_categories;
CREATE TRIGGER trg_product_categories_update
AFTER INSERT OR UPDATE OR DELETE ON product_categories
FOR EACH ROW EXECUTE FUNCTION fn_trg_product_categories_update();

-- ---------------------------------------------------------
-- TRIGGER 4: Khi thay đổi bảng categories
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trg_categories_name_update()
RETURNS TRIGGER AS $$
DECLARE
    rec RECORD;
BEGIN
    -- Chỉ chạy khi tên thay đổi HOẶC parent thay đổi
    IF (NEW.name IS DISTINCT FROM OLD.name) OR (NEW.parent IS DISTINCT FROM OLD.parent) THEN
        
        -- Tìm tất cả sản phẩm thuộc danh mục này HOẶC thuộc các danh mục con
        FOR rec IN 
            WITH RECURSIVE subcategories AS (
                -- Lấy danh mục đang bị thay đổi (Cha)
                SELECT id FROM categories WHERE id = NEW.id
                UNION ALL
                -- Lấy tất cả danh mục con của nó
                SELECT c.id FROM categories c
                JOIN subcategories s ON c.parent = s.id
            )
            -- Tìm sản phẩm nối với bất kỳ danh mục nào trong cây này
            SELECT DISTINCT pc.product AS product_id
            FROM product_categories pc
            JOIN subcategories s ON pc.category = s.id
        LOOP
            PERFORM fn_update_product_search_vector(rec.product_id);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_categories_name_update ON categories;
CREATE TRIGGER trg_categories_name_update
AFTER UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION fn_trg_categories_name_update();

-- === TRIGGERS ===

CREATE OR REPLACE FUNCTION fn_add_product_to_parent_categories()
RETURNS TRIGGER AS $$
DECLARE
    parent_id INT;
BEGIN
    -- Nếu insert do trigger tạo ra thì bỏ qua
    IF pg_trigger_depth() > 1 THEN
        RETURN NEW;
    END IF;

    SELECT parent INTO parent_id
    FROM categories
    WHERE id = NEW.category;

    WHILE parent_id IS NOT NULL LOOP

        -- Insert vào parent nếu chưa tồn tại
        INSERT INTO product_categories (product, category)
        VALUES (NEW.product, parent_id)
        ON CONFLICT DO NOTHING;

        -- Chống cycle (parent trỏ về chính nó)
        IF parent_id = NEW.category THEN
            RAISE EXCEPTION 'Category cycle detected at id %', parent_id;
        END IF;

        -- Lấy tiếp parent
        SELECT parent INTO parent_id
        FROM categories
        WHERE id = parent_id;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_product_category_add_parent
AFTER INSERT ON product_categories
FOR EACH ROW
EXECUTE FUNCTION fn_add_product_to_parent_categories();

CREATE OR REPLACE FUNCTION delete_seller_products()
RETURNS TRIGGER AS $$
BEGIN
    -- Xóa tất cả products mà user này là seller
    DELETE FROM products
    WHERE id IN (
        SELECT product 
        FROM sell_product 
        WHERE seller = OLD.id
    );
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_delete_seller_products
BEFORE DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION delete_seller_products();

CREATE TRIGGER tsvectorupdate
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION users_tsvector_trigger();

-- Cập nhật data
DO $$
DECLARE 
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM products LOOP
        PERFORM fn_update_product_search_vector(r.id);
    END LOOP;
END;
$$;

-- Tạo Index
CREATE INDEX IF NOT EXISTS idx_products_search_vector
ON products
USING GIN (search_vector);

CREATE INDEX IF NOT EXISTS idx_users_search_vector
ON users
USING GIN (search_vector);

-- Update users search_vector
UPDATE users
SET search_vector = 
    setweight(to_tsvector('simple', unaccent(COALESCE(name, ''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(COALESCE(email, ''))), 'B');
