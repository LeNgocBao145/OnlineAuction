-- =====================================================
-- MOCK DATA FOR ONLINE AUCTION SYSTEM
-- 20+ Products with Real Image URLs
-- Focus on: Electronics, Fashion, Home & Living
-- =====================================================

-- =====================================================
-- OPTIONAL: Clean existing data (uncomment if needed)
-- =====================================================
-- Note: This will delete ALL data. Use with caution!
-- Delete in reverse order of dependencies to avoid FK violations

-- Delete child tables first
DELETE FROM trade_verifications;
DELETE FROM bidder_winner;
DELETE FROM messages;
DELETE FROM auto_bids;
DELETE FROM allowed_bidder;
DELETE FROM bid_requests;
DELETE FROM product_questions;
DELETE FROM refuse;
DELETE FROM bids;
DELETE FROM product_descriptions;
DELETE FROM product_images;
DELETE FROM sell_product;
DELETE FROM reviews;
DELETE FROM favorites;
DELETE FROM product_categories;

-- Delete parent tables
DELETE FROM products;
DELETE FROM categories;
DELETE FROM requests;
DELETE FROM sessions;
DELETE FROM users;

-- Reset all sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE bids_id_seq RESTART WITH 1;
ALTER SEQUENCE product_descriptions_id_seq RESTART WITH 1;
ALTER SEQUENCE product_questions_id_seq RESTART WITH 1;
ALTER SEQUENCE messages_id_seq RESTART WITH 1;
ALTER SEQUENCE requests_id_seq RESTART WITH 1;
ALTER SEQUENCE sessions_id_seq RESTART WITH 1;
ALTER SEQUENCE bid_requests_id_seq RESTART WITH 1;

-- =====================================================
-- 1. INSERT USERS (10 users: 5 sellers, 5 bidders)
-- =====================================================
-- Password for all users: "password123"
-- Hashed with bcrypt: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5I9p0kVxvqm.u

INSERT INTO users (id, name, address, email, hashed_password, birthdate, role, rating)
VALUES
-- Sellers
(1, 'Minh Nguyen', '123 Nguyen Trai, District 1, HCMC', 'minh.seller@auction.vn', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5I9p0kVxvqm.u', '1992-03-15', 'seller', 0.85),
(2, 'Lan Tran', '456 Le Loi, District 3, HCMC', 'lan.seller@auction.vn', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5I9p0kVxvqm.u', '1988-07-22', 'seller', 0.92),
(3, 'Hung Pham', '789 Tran Hung Dao, District 5, HCMC', 'hung.seller@auction.vn', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5I9p0kVxvqm.u', '1995-11-08', 'seller', 0.78),
(4, 'Thu Le', '321 Vo Van Tan, District 3, HCMC', 'thu.seller@auction.vn', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5I9p0kVxvqm.u', '1990-05-30', 'seller', 0.88),
(5, 'Khoi Vo', '654 Dien Bien Phu, Binh Thanh, HCMC', 'khoi.seller@auction.vn', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5I9p0kVxvqm.u', '1993-09-17', 'seller', 0.95),

-- Bidders
(6, 'Anh Hoang', '111 Hai Ba Trung, District 1, HCMC', 'anh.bidder@auction.vn', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5I9p0kVxvqm.u', '1996-02-14', 'bidder', 0.80),
(7, 'Binh Nguyen', '222 Nam Ky Khoi Nghia, District 3, HCMC', 'binh.bidder@auction.vn', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5I9p0kVxvqm.u', '1994-06-25', 'bidder', 0.87),
(8, 'Chi Tran', '333 Nguyen Dinh Chieu, District 3, HCMC', 'chi.bidder@auction.vn', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5I9p0kVxvqm.u', '1997-12-03', 'bidder', 0.91),
(9, 'Dat Pham', '444 Cach Mang Thang 8, District 10, HCMC', 'dat.bidder@auction.vn', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5I9p0kVxvqm.u', '1991-04-19', 'bidder', 0.76),
(10, 'Em Le', '555 Pham Ngu Lao, District 1, HCMC', 'em.bidder@auction.vn', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5I9p0kVxvqm.u', '1998-08-27', 'bidder', 0.89);

-- Reset sequence for users
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- =====================================================
-- 2. INSERT CATEGORIES (3 levels hierarchy)
-- =====================================================

-- Level 1: Main Categories (insert first)
INSERT INTO categories (id, name, parent) VALUES
(1, 'Electronics', NULL),
(2, 'Fashion & Accessories', NULL),
(3, 'Home & Living', NULL);

-- Level 2: Sub Categories (insert after parent exists)
INSERT INTO categories (id, name, parent) VALUES
-- Electronics sub-categories
(4, 'Smartphones', 1),
(5, 'Laptops & Computers', 1),
(6, 'Audio & Headphones', 1),
(7, 'Cameras & Photography', 1),

-- Fashion sub-categories
(8, 'Men Fashion', 2),
(9, 'Women Fashion', 2),
(10, 'Watches & Jewelry', 2),
(11, 'Bags & Accessories', 2),

-- Home & Living sub-categories
(12, 'Kitchen & Dining', 3),
(13, 'Furniture', 3),
(14, 'Home Decor', 3),
(15, 'Appliances', 3);

-- Level 3: Detailed Categories (optional - insert last)
INSERT INTO categories (id, name, parent) VALUES
(16, 'iPhone', 4),
(17, 'Android Phones', 4),
(18, 'Gaming Laptops', 5),
(19, 'Ultrabooks', 5);

-- Reset sequence for categories
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- =====================================================
-- 3. INSERT 25 PRODUCTS (all in 'bidding' state)
-- =====================================================

INSERT INTO products (id, name, current_price, image, state)
VALUES
-- ELECTRONICS (10 products)
(1, 'iPhone 15 Pro Max 256GB', 28000000, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500', 'bidding'),
(2, 'Samsung Galaxy S24 Ultra', 26000000, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500', 'bidding'),
(3, 'MacBook Pro M3 14 inch', 42000000, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500', 'bidding'),
(4, 'Dell XPS 15 Gaming Laptop', 35000000, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500', 'bidding'),
(5, 'Sony WH-1000XM5 Headphones', 8500000, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500', 'bidding'),
(6, 'Apple AirPods Pro Gen 2', 6200000, 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500', 'bidding'),
(7, 'Canon EOS R6 Mark II', 58000000, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500', 'bidding'),
(8, 'GoPro Hero 12 Black', 11000000, 'https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=500', 'bidding'),
(9, 'iPad Pro 12.9 inch M2', 32000000, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500', 'bidding'),
(10, 'PlayStation 5 Console', 13500000, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500', 'bidding'),

-- FASHION (8 products)
(11, 'Nike Air Jordan 1 Retro High', 4500000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 'bidding'),
(12, 'Adidas Yeezy Boost 350 V2', 5800000, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500', 'bidding'),
(13, 'Louis Vuitton Neverfull MM', 45000000, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500', 'bidding'),
(14, 'Gucci Marmont Shoulder Bag', 38000000, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500', 'bidding'),
(15, 'Rolex Submariner Date', 285000000, 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500', 'bidding'),
(16, 'Omega Seamaster Diver 300M', 165000000, 'https://images.unsplash.com/photo-1587836374058-4ec0c2766cac?w=500', 'bidding'),
(17, 'Ray-Ban Aviator Sunglasses', 3800000, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500', 'bidding'),
(18, 'Levi''s 501 Original Jeans', 1800000, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', 'bidding'),

-- HOME & LIVING (7 products)
(19, 'Dyson V15 Detect Vacuum', 18500000, 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500', 'bidding'),
(20, 'Philips Air Fryer XXL', 5200000, 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500', 'bidding'),
(21, 'Nespresso Vertuo Coffee Machine', 6800000, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500', 'bidding'),
(22, 'IKEA POÄNG Armchair', 3200000, 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500', 'bidding'),
(23, 'Mid-Century Modern Sofa', 22000000, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500', 'bidding'),
(24, 'Marble Top Dining Table', 15000000, 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500', 'bidding'),
(25, 'Nordic LED Floor Lamp', 2800000, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500', 'bidding');

-- Reset sequence for products
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- =====================================================
-- 4. MAP PRODUCTS TO CATEGORIES
-- =====================================================

-- Electronics products (1-10)
INSERT INTO product_categories (product, category) VALUES
-- Smartphones
(1, 4), (1, 16),  -- iPhone 15
(2, 4), (2, 17),  -- Samsung S24

-- Laptops
(3, 5), (3, 19),  -- MacBook Pro
(4, 5), (4, 18),  -- Dell XPS

-- Audio
(5, 6),  -- Sony Headphones
(6, 6),  -- AirPods Pro

-- Cameras
(7, 7),  -- Canon EOS
(8, 7),  -- GoPro

-- Other Electronics
(9, 5),  -- iPad Pro
(10, 1); -- PlayStation (Electronics general)

-- Fashion products (11-18)
INSERT INTO product_categories (product, category) VALUES
-- Men Fashion
(11, 8),  -- Nike Air Jordan
(12, 8),  -- Adidas Yeezy
(18, 8),  -- Levi's Jeans

-- Women Fashion
(13, 9),  -- LV Neverfull
(14, 9),  -- Gucci Marmont

-- Watches
(15, 10), -- Rolex
(16, 10), -- Omega

-- Accessories
(17, 11); -- Ray-Ban Sunglasses

-- Home & Living products (19-25)
INSERT INTO product_categories (product, category) VALUES
-- Appliances
(19, 15), -- Dyson Vacuum
(20, 15), -- Air Fryer
(21, 15), -- Coffee Machine

-- Furniture
(22, 13), -- IKEA Chair
(23, 13), -- Sofa
(24, 13), -- Dining Table

-- Home Decor
(25, 14); -- Floor Lamp

-- =====================================================
-- 5. INSERT PRODUCT IMAGES (3 images per product)
-- =====================================================

INSERT INTO product_images (product, image_path)
VALUES
-- Electronics
(1, ARRAY['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500','https://images.unsplash.com/photo-1695048133082-4a8b1a165a0e?w=500','https://images.unsplash.com/photo-1695048007138-abd73e50f7d7?w=500']),
(2, ARRAY['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500','https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500','https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500']),
(3, ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500','https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500','https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=500']),
(4, ARRAY['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500','https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500','https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500']),
(5, ARRAY['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500','https://images.unsplash.com/photo-1545127398-14699f92334b?w=500','https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500']),
(6, ARRAY['https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500','https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500','https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=500']),
(7, ARRAY['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500','https://images.unsplash.com/photo-1606982428161-1f2e6d0f8f6f?w=500','https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500']),
(8, ARRAY['https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=500','https://images.unsplash.com/photo-1606983340126-99ab4716dc8a?w=500','https://images.unsplash.com/photo-1533692328991-08159ff19e3c?w=500']),
(9, ARRAY['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500','https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500','https://images.unsplash.com/photo-1585790050230-5dd28404f869?w=500']),
(10, ARRAY['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500','https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=500','https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=500']),

-- Fashion
(11, ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500','https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=500','https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500']),
(12, ARRAY['https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500','https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500','https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500']),
(13, ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500','https://images.unsplash.com/photo-1591561954557-26941169b49e?w=500','https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500']),
(14, ARRAY['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500','https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=500','https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500']),
(15, ARRAY['https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500','https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500','https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500']),
(16, ARRAY['https://images.unsplash.com/photo-1587836374058-4ec0c2766cac?w=500','https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500','https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=500']),
(17, ARRAY['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500','https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500','https://images.unsplash.com/photo-1577803645773-f96470509666?w=500']),
(18, ARRAY['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500','https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=500','https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500']),

-- Home & Living
(19, ARRAY['https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500','https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=500','https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500']),
(20, ARRAY['https://images.unsplash.com/photo-1585515320310-259814833e62?w=500','https://images.unsplash.com/photo-1556911220-bff31c812dba?w=500','https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=500']),
(21, ARRAY['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500','https://images.unsplash.com/photo-1587049016823-69c265e8f834?w=500','https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500']),
(22, ARRAY['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500','https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500','https://images.unsplash.com/photo-1503602642458-232111445657?w=500']),
(23, ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500','https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=500','https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500']),
(24, ARRAY['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500','https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500','https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=500']),
(25, ARRAY['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500','https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500','https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=500']);

-- =====================================================
-- 6. INSERT PRODUCT DESCRIPTIONS
-- =====================================================

INSERT INTO product_descriptions (product, description, created_at)
VALUES
-- Electronics
(1, 'Brand new iPhone 15 Pro Max 256GB with Titanium finish. Natural color, unlocked for all carriers. Includes original Apple accessories and 1-year warranty.', NOW()),
(2, 'Samsung Galaxy S24 Ultra 512GB with S Pen. Phantom Black color, factory unlocked. Features 200MP camera and 5000mAh battery. Like new condition.', NOW()),
(3, 'MacBook Pro 14-inch with M3 chip, 16GB RAM, 512GB SSD. Space Gray finish. Perfect for professionals and content creators. Complete with original box.', NOW()),
(4, 'Dell XPS 15 Gaming Laptop - Intel Core i7 13th Gen, 32GB RAM, RTX 4060, 1TB SSD. Excellent for gaming and video editing.', NOW()),
(5, 'Sony WH-1000XM5 Premium Wireless Noise Cancelling Headphones. Industry-leading noise cancellation with 30-hour battery life. Black color.', NOW()),
(6, 'Apple AirPods Pro 2nd Generation with MagSafe Charging Case. Active noise cancellation and spatial audio. Brand new sealed box.', NOW()),
(7, 'Canon EOS R6 Mark II Mirrorless Camera Body. 24.2MP full-frame sensor, 4K 60fps video. Professional photography equipment.', NOW()),
(8, 'GoPro Hero 12 Black Action Camera with accessories bundle. 5.3K60 video, waterproof design. Perfect for adventure enthusiasts.', NOW()),
(9, 'iPad Pro 12.9-inch M2 chip, 256GB WiFi + Cellular. Space Gray. Includes Magic Keyboard and Apple Pencil 2nd Gen.', NOW()),
(10, 'PlayStation 5 Console with 2 DualSense controllers. Disc version, 825GB storage. Includes 3 AAA games.', NOW()),

-- Fashion
(11, 'Nike Air Jordan 1 Retro High OG "Chicago" - Authentic sneakers, size US 9. Limited edition colorway, brand new with original box.', NOW()),
(12, 'Adidas Yeezy Boost 350 V2 "Zebra" - Genuine Kanye West collaboration, size US 10. Deadstock condition with tags and receipt.', NOW()),
(13, 'Louis Vuitton Neverfull MM Monogram Canvas - Authentic luxury tote bag. Comes with original dust bag and receipt. Cherry red interior.', NOW()),
(14, 'Gucci Marmont Small Matelassé Shoulder Bag - Black leather with gold hardware. Serial number verified, includes authenticity card.', NOW()),
(15, 'Rolex Submariner Date 126610LN - Stainless steel luxury watch. 41mm case, black ceramic bezel. Full set with box and papers (2023).', NOW()),
(16, 'Omega Seamaster Diver 300M Co-Axial Master - Blue dial, stainless steel. 42mm case, automatic movement. Complete set with warranty.', NOW()),
(17, 'Ray-Ban Aviator Classic Sunglasses RB3025 - Gold frame with green G-15 lenses. 100% UV protection, includes case and cleaning cloth.', NOW()),
(18, 'Levi''s 501 Original Fit Jeans - Classic medium stonewash blue, W32 L32. Iconic button-fly design, straight leg. Brand new with tags.', NOW()),

-- Home & Living
(19, 'Dyson V15 Detect Absolute Cordless Vacuum - Laser detection technology, 60 minutes runtime. Includes 8 attachments. Excellent condition.', NOW()),
(20, 'Philips Air Fryer XXL Premium with Fat Removal Technology - 1.4kg capacity, digital display. Rapid Air technology for healthy cooking.', NOW()),
(21, 'Nespresso Vertuo Next Coffee & Espresso Machine - Chrome finish, one-touch brewing. Includes welcome set of 12 Vertuo capsules.', NOW()),
(22, 'IKEA POÄNG Birch Veneer Armchair with Hillared Beige Cushion - Comfortable bentwood design, excellent condition. Easy to assemble.', NOW()),
(23, 'Mid-Century Modern 3-Seater Sofa - Teal blue velvet upholstery, wooden legs. Scandinavian design, seats 3 comfortably.', NOW()),
(24, 'Marble Top Dining Table with Solid Wood Base - Seats 6 people, white Carrara marble top. 180cm x 90cm, modern luxury design.', NOW()),
(25, 'Nordic LED Floor Lamp with Wooden Tripod - Adjustable height, warm white light. Black fabric shade, perfect for reading corner.', NOW());

-- =====================================================
-- 7. INSERT SELL_PRODUCT (Auction Details)
-- =====================================================

INSERT INTO sell_product (product, seller, init_price, step_price, instant_price, starting_at, expired_at, isExtent, created_at)
VALUES
-- Seller 1 (Minh) - Electronics
(1, 1, 25000000, 500000, 30000000, NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', false, NOW() - INTERVAL '2 days'),
(3, 1, 38000000, 1000000, 45000000, NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days', false, NOW() - INTERVAL '1 day'),
(5, 1, 7500000, 200000, 9000000, NOW() - INTERVAL '3 hours', NOW() + INTERVAL '6 days 21 hours', false, NOW() - INTERVAL '3 hours'),
(7, 1, 50000000, 2000000, NULL, NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days', false, NOW() - INTERVAL '1 day'),
(9, 1, 28000000, 800000, 35000000, NOW() - INTERVAL '12 hours', NOW() + INTERVAL '6 days 12 hours', false, NOW() - INTERVAL '12 hours'),

-- Seller 2 (Lan) - Fashion
(11, 2, 3500000, 150000, 5000000, NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', false, NOW() - INTERVAL '2 days'),
(13, 2, 40000000, 1000000, NULL, NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days', false, NOW() - INTERVAL '1 day'),
(15, 2, 270000000, 5000000, NULL, NOW() - INTERVAL '3 days', NOW() + INTERVAL '4 days', false, NOW() - INTERVAL '3 days'),
(17, 2, 3200000, 100000, 4000000, NOW() - INTERVAL '6 hours', NOW() + INTERVAL '6 days 18 hours', false, NOW() - INTERVAL '6 hours'),

-- Seller 3 (Hung) - Home & Living
(19, 3, 16000000, 500000, 20000000, NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days', false, NOW() - INTERVAL '1 day'),
(21, 3, 6000000, 200000, 7500000, NOW() - INTERVAL '8 hours', NOW() + INTERVAL '6 days 16 hours', false, NOW() - INTERVAL '8 hours'),
(23, 3, 18000000, 800000, NULL, NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', false, NOW() - INTERVAL '2 days'),
(25, 3, 2500000, 100000, 3000000, NOW() - INTERVAL '4 hours', NOW() + INTERVAL '6 days 20 hours', false, NOW() - INTERVAL '4 hours'),

-- Seller 4 (Thu) - Electronics & Fashion
(2, 4, 24000000, 600000, 28000000, NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', false, NOW() - INTERVAL '2 days'),
(4, 4, 32000000, 800000, NULL, NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days', false, NOW() - INTERVAL '1 day'),
(6, 4, 5500000, 150000, 6500000, NOW() - INTERVAL '10 hours', NOW() + INTERVAL '6 days 14 hours', false, NOW() - INTERVAL '10 hours'),
(12, 4, 5000000, 200000, 6500000, NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days', false, NOW() - INTERVAL '1 day'),
(14, 4, 35000000, 1000000, NULL, NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', false, NOW() - INTERVAL '2 days'),

-- Seller 5 (Khoi) - All categories
(8, 5, 9500000, 300000, 12000000, NOW() - INTERVAL '5 hours', NOW() + INTERVAL '6 days 19 hours', false, NOW() - INTERVAL '5 hours'),
(10, 5, 12000000, 400000, 14500000, NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days', false, NOW() - INTERVAL '1 day'),
(16, 5, 155000000, 3000000, NULL, NOW() - INTERVAL '3 days', NOW() + INTERVAL '4 days', false, NOW() - INTERVAL '3 days'),
(18, 5, 1500000, 80000, 2000000, NOW() - INTERVAL '7 hours', NOW() + INTERVAL '6 days 17 hours', false, NOW() - INTERVAL '7 hours'),
(20, 5, 4500000, 150000, 5500000, NOW() - INTERVAL '9 hours', NOW() + INTERVAL '6 days 15 hours', false, NOW() - INTERVAL '9 hours'),
(22, 5, 2800000, 120000, 3500000, NOW() - INTERVAL '11 hours', NOW() + INTERVAL '6 days 13 hours', false, NOW() - INTERVAL '11 hours'),
(24, 5, 13000000, 500000, NULL, NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', false, NOW() - INTERVAL '2 days');

-- =====================================================
-- 8. INSERT BIDS (5-8 bids per product)
-- =====================================================

-- Product 1: iPhone 15 Pro Max
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(1, 6, NOW() - INTERVAL '47 hours', 25500000),
(1, 7, NOW() - INTERVAL '46 hours', 26000000),
(1, 8, NOW() - INTERVAL '40 hours', 26500000),
(1, 6, NOW() - INTERVAL '35 hours', 27000000),
(1, 9, NOW() - INTERVAL '30 hours', 27500000),
(1, 7, NOW() - INTERVAL '20 hours', 28000000);

-- Product 2: Samsung S24
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(2, 6, NOW() - INTERVAL '47 hours', 24600000),
(2, 8, NOW() - INTERVAL '45 hours', 25200000),
(2, 7, NOW() - INTERVAL '42 hours', 25800000),
(2, 9, NOW() - INTERVAL '38 hours', 26000000);

-- Product 3: MacBook Pro
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(3, 7, NOW() - INTERVAL '23 hours', 39000000),
(3, 8, NOW() - INTERVAL '22 hours', 40000000),
(3, 6, NOW() - INTERVAL '20 hours', 41000000),
(3, 9, NOW() - INTERVAL '18 hours', 42000000);

-- Product 4: Dell XPS
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(4, 6, NOW() - INTERVAL '23 hours', 32800000),
(4, 7, NOW() - INTERVAL '22 hours', 33600000),
(4, 8, NOW() - INTERVAL '20 hours', 34400000),
(4, 9, NOW() - INTERVAL '18 hours', 35000000);

-- Product 5: Sony Headphones
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(5, 6, NOW() - INTERVAL '2 hours 50 minutes', 7700000),
(5, 7, NOW() - INTERVAL '2 hours 40 minutes', 7900000),
(5, 8, NOW() - INTERVAL '2 hours 20 minutes', 8100000),
(5, 9, NOW() - INTERVAL '2 hours', 8300000),
(5, 6, NOW() - INTERVAL '1 hour 30 minutes', 8500000);

-- Product 6: AirPods Pro
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(6, 7, NOW() - INTERVAL '9 hours 50 minutes', 5650000),
(6, 8, NOW() - INTERVAL '9 hours 30 minutes', 5800000),
(6, 6, NOW() - INTERVAL '9 hours', 5950000),
(6, 9, NOW() - INTERVAL '8 hours 30 minutes', 6100000),
(6, 7, NOW() - INTERVAL '8 hours', 6200000);

-- Product 7: Canon Camera
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(7, 6, NOW() - INTERVAL '23 hours', 52000000),
(7, 7, NOW() - INTERVAL '22 hours', 54000000),
(7, 8, NOW() - INTERVAL '20 hours', 56000000),
(7, 9, NOW() - INTERVAL '18 hours', 58000000);

-- Product 8: GoPro
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(8, 7, NOW() - INTERVAL '4 hours 50 minutes', 9800000),
(8, 6, NOW() - INTERVAL '4 hours 40 minutes', 10100000),
(8, 8, NOW() - INTERVAL '4 hours 20 minutes', 10400000),
(8, 9, NOW() - INTERVAL '4 hours', 10700000),
(8, 7, NOW() - INTERVAL '3 hours 30 minutes', 11000000);

-- Product 9: iPad Pro
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(9, 6, NOW() - INTERVAL '11 hours 50 minutes', 28800000),
(9, 7, NOW() - INTERVAL '11 hours 30 minutes', 29600000),
(9, 8, NOW() - INTERVAL '11 hours', 30400000),
(9, 9, NOW() - INTERVAL '10 hours 30 minutes', 31200000),
(9, 6, NOW() - INTERVAL '10 hours', 32000000);

-- Product 10: PlayStation 5
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(10, 7, NOW() - INTERVAL '23 hours', 12400000),
(10, 8, NOW() - INTERVAL '22 hours', 12800000),
(10, 6, NOW() - INTERVAL '20 hours', 13200000),
(10, 9, NOW() - INTERVAL '18 hours', 13500000);

-- Product 11: Nike Air Jordan
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(11, 6, NOW() - INTERVAL '47 hours', 3650000),
(11, 7, NOW() - INTERVAL '46 hours', 3800000),
(11, 8, NOW() - INTERVAL '44 hours', 3950000),
(11, 9, NOW() - INTERVAL '42 hours', 4100000),
(11, 6, NOW() - INTERVAL '40 hours', 4250000),
(11, 7, NOW() - INTERVAL '38 hours', 4400000),
(11, 8, NOW() - INTERVAL '36 hours', 4500000);

-- Product 12: Adidas Yeezy
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(12, 6, NOW() - INTERVAL '23 hours', 5200000),
(12, 7, NOW() - INTERVAL '22 hours', 5400000),
(12, 8, NOW() - INTERVAL '20 hours', 5600000),
(12, 9, NOW() - INTERVAL '18 hours', 5800000);

-- Product 13: LV Neverfull
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(13, 7, NOW() - INTERVAL '23 hours', 41000000),
(13, 8, NOW() - INTERVAL '22 hours', 42000000),
(13, 6, NOW() - INTERVAL '20 hours', 43000000),
(13, 9, NOW() - INTERVAL '18 hours', 44000000),
(13, 7, NOW() - INTERVAL '16 hours', 45000000);

-- Product 14: Gucci Marmont
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(14, 6, NOW() - INTERVAL '47 hours', 36000000),
(14, 7, NOW() - INTERVAL '46 hours', 37000000),
(14, 8, NOW() - INTERVAL '44 hours', 38000000);

-- Product 15: Rolex
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(15, 7, NOW() - INTERVAL '71 hours', 275000000),
(15, 8, NOW() - INTERVAL '70 hours', 280000000),
(15, 6, NOW() - INTERVAL '68 hours', 285000000);

-- Product 16: Omega
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(16, 6, NOW() - INTERVAL '71 hours', 158000000),
(16, 7, NOW() - INTERVAL '70 hours', 161000000),
(16, 8, NOW() - INTERVAL '68 hours', 164000000),
(16, 9, NOW() - INTERVAL '66 hours', 165000000);

-- Product 17: Ray-Ban
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(17, 6, NOW() - INTERVAL '5 hours 50 minutes', 3300000),
(17, 7, NOW() - INTERVAL '5 hours 40 minutes', 3400000),
(17, 8, NOW() - INTERVAL '5 hours 20 minutes', 3500000),
(17, 9, NOW() - INTERVAL '5 hours', 3600000),
(17, 6, NOW() - INTERVAL '4 hours 30 minutes', 3700000),
(17, 7, NOW() - INTERVAL '4 hours', 3800000);

-- Product 18: Levi's Jeans
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(18, 7, NOW() - INTERVAL '6 hours 50 minutes', 1580000),
(18, 6, NOW() - INTERVAL '6 hours 40 minutes', 1660000),
(18, 8, NOW() - INTERVAL '6 hours 20 minutes', 1740000),
(18, 9, NOW() - INTERVAL '6 hours', 1800000);

-- Product 19: Dyson Vacuum
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(19, 6, NOW() - INTERVAL '23 hours', 16500000),
(19, 7, NOW() - INTERVAL '22 hours', 17000000),
(19, 8, NOW() - INTERVAL '20 hours', 17500000),
(19, 9, NOW() - INTERVAL '18 hours', 18000000),
(19, 6, NOW() - INTERVAL '16 hours', 18500000);

-- Product 20: Air Fryer
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(20, 7, NOW() - INTERVAL '8 hours 50 minutes', 4650000),
(20, 6, NOW() - INTERVAL '8 hours 40 minutes', 4800000),
(20, 8, NOW() - INTERVAL '8 hours 20 minutes', 4950000),
(20, 9, NOW() - INTERVAL '8 hours', 5100000),
(20, 7, NOW() - INTERVAL '7 hours 30 minutes', 5200000);

-- Product 21: Coffee Machine
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(21, 6, NOW() - INTERVAL '7 hours 50 minutes', 6200000),
(21, 7, NOW() - INTERVAL '7 hours 30 minutes', 6400000),
(21, 8, NOW() - INTERVAL '7 hours', 6600000),
(21, 9, NOW() - INTERVAL '6 hours 30 minutes', 6800000);

-- Product 22: IKEA Chair
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(22, 7, NOW() - INTERVAL '10 hours 50 minutes', 2920000),
(22, 6, NOW() - INTERVAL '10 hours 40 minutes', 3040000),
(22, 8, NOW() - INTERVAL '10 hours 20 minutes', 3160000),
(22, 9, NOW() - INTERVAL '10 hours', 3200000);

-- Product 23: Sofa
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(23, 6, NOW() - INTERVAL '47 hours', 18800000),
(23, 7, NOW() - INTERVAL '46 hours', 19600000),
(23, 8, NOW() - INTERVAL '44 hours', 20400000),
(23, 9, NOW() - INTERVAL '42 hours', 21200000),
(23, 6, NOW() - INTERVAL '40 hours', 22000000);

-- Product 24: Dining Table
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(24, 7, NOW() - INTERVAL '47 hours', 13500000),
(24, 8, NOW() - INTERVAL '46 hours', 14000000),
(24, 6, NOW() - INTERVAL '44 hours', 14500000),
(24, 9, NOW() - INTERVAL '42 hours', 15000000);

-- Product 25: Floor Lamp
INSERT INTO bids (product, buyer, bid_date, price) VALUES
(25, 6, NOW() - INTERVAL '3 hours 50 minutes', 2600000),
(25, 7, NOW() - INTERVAL '3 hours 40 minutes', 2700000),
(25, 8, NOW() - INTERVAL '3 hours 20 minutes', 2800000);

-- =====================================================
-- 9. INSERT AUTO BIDS
-- =====================================================

INSERT INTO auto_bids (product, bidder, max_price, created_at) VALUES
(1, 6, 29000000, NOW() - INTERVAL '47 hours'),
(1, 7, 30000000, NOW() - INTERVAL '46 hours'),
(3, 7, 44000000, NOW() - INTERVAL '23 hours'),
(3, 9, 45000000, NOW() - INTERVAL '18 hours'),
(5, 9, 9000000, NOW() - INTERVAL '2 hours'),
(11, 8, 5000000, NOW() - INTERVAL '44 hours'),
(13, 7, 48000000, NOW() - INTERVAL '23 hours'),
(19, 6, 20000000, NOW() - INTERVAL '23 hours'),
(23, 6, 25000000, NOW() - INTERVAL '47 hours');

-- =====================================================
-- 10. INSERT FAVORITES
-- =====================================================

INSERT INTO favorites (product, user_id, created_at) VALUES
-- Bidder 1 (Anh) favorites
(1, 6, NOW() - INTERVAL '3 days'),
(3, 6, NOW() - INTERVAL '2 days'),
(5, 6, NOW() - INTERVAL '1 day'),
(11, 6, NOW() - INTERVAL '3 days'),
(19, 6, NOW() - INTERVAL '2 days'),

-- Bidder 2 (Binh) favorites
(2, 7, NOW() - INTERVAL '3 days'),
(4, 7, NOW() - INTERVAL '2 days'),
(6, 7, NOW() - INTERVAL '1 day'),
(13, 7, NOW() - INTERVAL '2 days'),
(20, 7, NOW() - INTERVAL '1 day'),

-- Bidder 3 (Chi) favorites
(1, 8, NOW() - INTERVAL '2 days'),
(7, 8, NOW() - INTERVAL '1 day'),
(15, 8, NOW() - INTERVAL '3 days'),
(17, 8, NOW() - INTERVAL '1 day'),

-- Bidder 4 (Dat) favorites
(3, 9, NOW() - INTERVAL '2 days'),
(9, 9, NOW() - INTERVAL '1 day'),
(16, 9, NOW() - INTERVAL '3 days'),
(23, 9, NOW() - INTERVAL '2 days'),

-- Bidder 5 (Em) favorites
(10, 10, NOW() - INTERVAL '1 day'),
(18, 10, NOW() - INTERVAL '2 days'),
(24, 10, NOW() - INTERVAL '1 day');

-- =====================================================
-- 11. INSERT PRODUCT QUESTIONS
-- =====================================================

INSERT INTO product_questions (questioner, answerer, product, question, answer, asked_at, answered_at) VALUES
(6, 1, 1, 'Is the phone unlocked for all carriers?', 'Yes, completely unlocked. Works with any carrier in Vietnam.', NOW() - INTERVAL '46 hours', NOW() - INTERVAL '45 hours'),
(7, 1, 3, 'Does it include Apple Care+?', 'Yes, it has 1 year Apple Care+ warranty remaining.', NOW() - INTERVAL '22 hours', NOW() - INTERVAL '21 hours'),
(8, 2, 11, 'Are these authentic Nike?', 'Yes, 100% authentic with receipt from authorized dealer.', NOW() - INTERVAL '45 hours', NOW() - INTERVAL '44 hours'),
(6, 2, 13, 'Can I see the authenticity certificate?', 'Yes, I will send photos of the certificate and receipt.', NOW() - INTERVAL '22 hours', NOW() - INTERVAL '21 hours'),
(7, 3, 19, 'How long have you used this vacuum?', 'Only 3 months, still under warranty.', NOW() - INTERVAL '22 hours', NOW() - INTERVAL '21 hours'),
(9, 4, 2, 'Is the screen in perfect condition?', NULL, NOW() - INTERVAL '12 hours', NULL),
(8, 5, 10, 'Do you include any games?', 'Yes, 3 AAA games included: God of War, Spider-Man, Horizon.', NOW() - INTERVAL '22 hours', NOW() - INTERVAL '21 hours');

-- =====================================================
-- 12. INSERT REVIEWS
-- =====================================================

INSERT INTO reviews (product, rater, ratee, liked, content, created_at) VALUES
-- Reviews for sellers
(1, 6, 1, true, 'Fast shipping, product exactly as described!', NOW() - INTERVAL '10 days'),
(1, 7, 1, true, 'Great seller, very professional', NOW() - INTERVAL '9 days'),
(11, 8, 2, true, 'Authentic product, excellent packaging', NOW() - INTERVAL '8 days'),
(11, 6, 2, true, 'Quick response to questions', NOW() - INTERVAL '7 days'),
(19, 7, 3, true, 'Product in perfect condition', NOW() - INTERVAL '6 days'),
(19, 9, 3, false, 'Delivery was a bit slow', NOW() - INTERVAL '5 days'),
(2, 8, 4, true, 'Very satisfied with the purchase', NOW() - INTERVAL '4 days'),
(10, 9, 5, true, 'Excellent seller, highly recommended', NOW() - INTERVAL '3 days'),

-- Reviews for bidders
(1, 1, 6, true, 'Prompt payment, easy to work with', NOW() - INTERVAL '10 days'),
(3, 1, 7, true, 'Great buyer, smooth transaction', NOW() - INTERVAL '9 days'),
(11, 2, 8, true, 'Fast payment, professional bidder', NOW() - INTERVAL '8 days'),
(19, 3, 9, true, 'Reliable buyer', NOW() - INTERVAL '6 days'),
(10, 5, 9, false, 'Payment was delayed by 1 day', NOW() - INTERVAL '5 days');

-- =====================================================
-- 13. INSERT MESSAGES
-- =====================================================

INSERT INTO messages (product, sender, content, type, created_at) VALUES
(1, 6, 'Hello, can you ship to Hanoi?', 'text', NOW() - INTERVAL '46 hours'),
(1, 1, 'Yes, I can ship nationwide. Shipping fee is 150k', 'text', NOW() - INTERVAL '45 hours 55 minutes'),
(3, 7, 'Is the battery cycle count low?', 'text', NOW() - INTERVAL '22 hours'),
(3, 1, 'Only 12 cycles, almost brand new', 'text', NOW() - INTERVAL '21 hours 55 minutes'),
(11, 8, 'Can I try them on before buying?', 'text', NOW() - INTERVAL '44 hours'),
(11, 2, 'Sorry, for auction items we cannot arrange try-ons', 'text', NOW() - INTERVAL '43 hours 55 minutes'),
(19, 7, 'Do you have the original receipt?', 'text', NOW() - INTERVAL '22 hours'),
(19, 3, 'Yes, I have all the documentation', 'text', NOW() - INTERVAL '21 hours 55 minutes');

-- =====================================================
-- 14. INSERT BID REQUESTS (for future use)
-- =====================================================

INSERT INTO bid_requests (bidder, product, request_date, state) VALUES
(6, 1, NOW() - INTERVAL '48 hours', 'success'),
(7, 1, NOW() - INTERVAL '48 hours', 'success'),
(8, 1, NOW() - INTERVAL '47 hours', 'success'),
(9, 1, NOW() - INTERVAL '47 hours', 'success'),
(6, 3, NOW() - INTERVAL '24 hours', 'success'),
(7, 3, NOW() - INTERVAL '24 hours', 'success'),
(8, 11, NOW() - INTERVAL '48 hours', 'success'),
(9, 13, NOW() - INTERVAL '24 hours', 'success'),
(10, 24, NOW() - INTERVAL '48 hours', 'success');

-- =====================================================
-- 15. INSERT SESSIONS (Active login sessions)
-- =====================================================

INSERT INTO sessions (user_id, expired_at, refresh_token) VALUES
(1, CURRENT_DATE + INTERVAL '30 days', 'refresh_token_minh_' || md5(random()::text)),
(2, CURRENT_DATE + INTERVAL '30 days', 'refresh_token_lan_' || md5(random()::text)),
(3, CURRENT_DATE + INTERVAL '30 days', 'refresh_token_hung_' || md5(random()::text)),
(4, CURRENT_DATE + INTERVAL '30 days', 'refresh_token_thu_' || md5(random()::text)),
(5, CURRENT_DATE + INTERVAL '30 days', 'refresh_token_khoi_' || md5(random()::text)),
(6, CURRENT_DATE + INTERVAL '30 days', 'refresh_token_anh_' || md5(random()::text)),
(7, CURRENT_DATE + INTERVAL '30 days', 'refresh_token_binh_' || md5(random()::text)),
(8, CURRENT_DATE + INTERVAL '30 days', 'refresh_token_chi_' || md5(random()::text)),
(9, CURRENT_DATE + INTERVAL '30 days', 'refresh_token_dat_' || md5(random()::text)),
(10, CURRENT_DATE + INTERVAL '30 days', 'refresh_token_em_' || md5(random()::text));

-- =====================================================
-- 16. INSERT REQUESTS (Upgrade to seller requests)
-- =====================================================

INSERT INTO requests (bidder, created_at, state) VALUES
(6, CURRENT_DATE - INTERVAL '15 days', 'success'),
(7, CURRENT_DATE - INTERVAL '10 days', 'pending'),
(8, CURRENT_DATE - INTERVAL '5 days', 'pending'),
(9, CURRENT_DATE - INTERVAL '3 days', 'failed'),
(10, CURRENT_DATE - INTERVAL '1 day', 'pending');

-- =====================================================
-- 17. INSERT REFUSE (Blacklisted bidders)
-- =====================================================

INSERT INTO refuse (product, buyer) VALUES
(1, 10),  -- Em refused from iPhone auction
(3, 9),   -- Dat refused from MacBook auction
(13, 10), -- Em refused from LV bag auction
(15, 6);  -- Anh refused from Rolex auction

-- =====================================================
-- 18. INSERT BIDDER_WINNER (Auction winners - for completed auctions)
-- =====================================================
-- Note: These are mock winners for testing purposes
-- In reality, these would be set by the sync_auction_states procedure

INSERT INTO bidder_winner (product, bidder) VALUES
(1, 7),   -- Binh won iPhone
(2, 9),   -- Dat won Samsung
(11, 8),  -- Chi won Nike shoes
(19, 6);  -- Anh won Dyson vacuum

-- =====================================================
-- 19. INSERT TRADE_VERIFICATIONS (Post-auction transactions)
-- =====================================================

INSERT INTO trade_verifications (product, bidder, seller, delivery_address, invoice_image, transport_image, sell_accept, bidder_accept, state) VALUES
-- Completed transaction
(1, 7, 1, '222 Nam Ky Khoi Nghia, District 3, HCMC', 
 'https://picsum.photos/seed/invoice1/400', 
 'https://picsum.photos/seed/transport1/400', 
 true, true, 'completed'),

-- Waiting for bidder confirmation
(2, 9, 4, '444 Cach Mang Thang 8, District 10, HCMC', 
 'https://picsum.photos/seed/invoice2/400', 
 'https://picsum.photos/seed/transport2/400', 
 true, false, 'pending_bidder_confirm'),

-- Waiting for seller confirmation  
(11, 8, 2, '333 Nguyen Dinh Chieu, District 3, HCMC', 
 'https://picsum.photos/seed/invoice3/400', 
 NULL, 
 false, true, 'pending_seller_confirm'),

-- Waiting for payment
(19, 6, 3, '111 Hai Ba Trung, District 1, HCMC', 
 NULL, NULL, 
 false, false, 'pending_payment');

-- =====================================================
-- 20. INSERT ALLOWED BIDDERS
-- =====================================================

INSERT INTO allowed_bidder (product, bidder, allowed_at) VALUES
-- Product 1: iPhone
(1, 6, NOW() - INTERVAL '48 hours'),
(1, 7, NOW() - INTERVAL '48 hours'),
(1, 8, NOW() - INTERVAL '47 hours'),
(1, 9, NOW() - INTERVAL '47 hours'),

-- Product 3: MacBook
(3, 6, NOW() - INTERVAL '24 hours'),
(3, 7, NOW() - INTERVAL '24 hours'),
(3, 8, NOW() - INTERVAL '24 hours'),
(3, 9, NOW() - INTERVAL '24 hours'),

-- Product 11: Nike
(11, 6, NOW() - INTERVAL '48 hours'),
(11, 7, NOW() - INTERVAL '48 hours'),
(11, 8, NOW() - INTERVAL '48 hours'),
(11, 9, NOW() - INTERVAL '48 hours'),

-- Product 13: LV
(13, 6, NOW() - INTERVAL '24 hours'),
(13, 7, NOW() - INTERVAL '24 hours'),
(13, 8, NOW() - INTERVAL '24 hours'),
(13, 9, NOW() - INTERVAL '24 hours'),

-- Product 19: Dyson
(19, 6, NOW() - INTERVAL '24 hours'),
(19, 7, NOW() - INTERVAL '24 hours'),
(19, 8, NOW() - INTERVAL '24 hours'),
(19, 9, NOW() - INTERVAL '24 hours'),

-- Product 24: Dining Table
(24, 6, NOW() - INTERVAL '48 hours'),
(24, 7, NOW() - INTERVAL '48 hours'),
(24, 8, NOW() - INTERVAL '48 hours'),
(24, 9, NOW() - INTERVAL '48 hours'),
(24, 10, NOW() - INTERVAL '48 hours');

-- =====================================================
-- END OF MOCK DATA
-- Total: 25 products, 10 users, 19 categories
-- All major tables populated with realistic data
-- =====================================================

-- Update search vectors for all products
DO $$
DECLARE 
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM products WHERE id >= 1 AND id <= 25 LOOP
        PERFORM fn_update_product_search_vector(r.id);
    END LOOP;
END;
$$;

-- Show summary of inserted data
SELECT 
    'Mock Data Summary' as info,
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM products WHERE state = 'bidding') as bidding_products,
    (SELECT COUNT(*) FROM categories) as total_categories,
    (SELECT COUNT(*) FROM bids) as total_bids,
    (SELECT COUNT(*) FROM favorites) as total_favorites,
    (SELECT COUNT(*) FROM sessions) as active_sessions,
    (SELECT COUNT(*) FROM reviews) as total_reviews,
    (SELECT COUNT(*) FROM messages) as total_messages,
    (SELECT COUNT(*) FROM auto_bids) as auto_bids,
    (SELECT COUNT(*) FROM product_questions) as questions,
    (SELECT COUNT(*) FROM bidder_winner) as winners,
    (SELECT COUNT(*) FROM trade_verifications) as transactions;