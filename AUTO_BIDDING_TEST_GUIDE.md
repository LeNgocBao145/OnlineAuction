# Auto-Bidding Feature Test Guide

## Overview
Tính năng đấu giá tự động cho phép người mua đặt giá tối đa và hệ thống tự động đấu giá thay họ với giá thấp nhất có thể.

## Database Setup

### 1. Run Migration
```sql
-- Add max_price column to existing bids table
ALTER TABLE bids ADD COLUMN max_price NUMERIC(12,2);

-- Create auto_bids table for tracking max prices
CREATE TABLE auto_bids (
    product INTEGER NOT NULL,
    bidder INTEGER NOT NULL,
    max_price NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (product, bidder),
    FOREIGN KEY (product) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (bidder) REFERENCES users(id) ON DELETE CASCADE
);
```

## Test Scenarios

### Scenario 1: Manual Bid Only
**Mục tiêu:** Kiểm tra chức năng đấu giá thủ công thông thường

**Steps:**
1. Mở sản phẩm đang đấu giá
2. Chọn "Manual bid"
3. Nhập giá (ví dụ: +1 step)
4. Click "Confirm Bid"
5. Kiểm tra:
   - Toast message thành công
   - Giá sản phẩm cập nhật
   - Email thông báo gửi seller và previous bidder

**Expected Results:**
- Bid được ghi vào database với `max_price = NULL`
- `products.current_price` được cập nhật
- Không có record trong `auto_bids`

### Scenario 2: Auto-Bid Only (No Competition)
**Mục tiêu:** Kiểm tra auto-bid khi không có đối thủ

**Setup:**
- Sản phẩm: Giá hiện tại 10,000,000đ
- Step price: 500,000đ

**Steps:**
1. Chọn "Auto-bid"
2. Nhập max price: 12,000,000đ
3. Click "Place Auto-Bid"
4. Kiểm tra database:
   ```sql
   SELECT * FROM auto_bids WHERE product = [product_id];
   SELECT * FROM bids WHERE product = [product_id] ORDER BY bid_date DESC LIMIT 1;
   ```

**Expected Results:**
- `auto_bids` có record với `max_price = 12,000,000`
- `bids` có record với `price = 10,500,000` (current_price + step)
- `max_price` trong bid = 12,000,000

### Scenario 3: Auto-Bid vs Auto-Bid Competition
**Mục tiêu:** Kiểm tra cạnh tranh giữa 2 auto-bidders

**Setup:**
- User A: Max price = 11,000,000đ
- User B: Max price = 12,000,000đ
- Current price = 10,000,000đ, step = 500,000đ

**Steps:**
1. User A đặt auto-bid 11,000,000đ
2. User B đặt auto-bid 12,000,000đ
3. Kiểm tra kết quả:
   ```sql
   SELECT * FROM bids WHERE product = [product_id] ORDER BY bid_date DESC LIMIT 2;
   ```

**Expected Results:**
- User B thắng với giá = 11,500,000đ (User A's max + step)
- User A's max price = 11,000,000
- User B's max price = 12,000,000
- Final price = 11,500,000 (vừa đủ thắng User A)

### Scenario 4: Same Max Price - Earlier Bidder Wins
**Mục tiêu:** Kiểm tra tie-break rule (bid sớm thắng)

**Setup:**
- User A: Đặt auto-bid 11,000,000đ lúc 10:00
- User B: Đặt auto-bid 11,000,000đ lúc 10:01
- Current price = 10,000,000đ, step = 500,000đ

**Steps:**
1. User A đặt auto-bid 11,000,000đ
2. User B đặt auto-bid 11,000,000đ
3. Kiểm tra winner

**Expected Results:**
- User A thắng (đặt trước)
- Final price = 11,000,000 (exact max price, không cộng step)
- Toast cho User B: "Another bidder has a higher max price"

### Scenario 5: Manual Bid vs Auto-Bid
**Mục tiêu:** Kiểm tra khi người dùng thủ công đấu giá với auto-bidder

**Setup:**
- User A: Auto-bid 12,000,000đ
- User B: Manual bid 11,000,000đ
- Current price = 10,000,000đ, step = 500,000đ

**Steps:**
1. User A đặt auto-bid 12,000,000đ
2. User B đặt manual bid 11,000,000đ
3. Kiểm tra kết quả

**Expected Results:**
- User A tự động outbid với giá = 11,500,000đ
- User B nhận toast: "Bid placed, but you were outbid by auto-bidding"
- Final price = 11,500,000

### Scenario 6: Manual Bid Lower Than Leader
**Mục tiêu:** Kiểm tra validation khi bid thấp hơn leader hiện tại

**Setup:**
- Current leader price = 12,000,000đ
- Step price = 500,000đ

**Steps:**
1. User đặt manual bid 11,000,000đ
2. Kiểm tra response

**Expected Results:**
- Error 409: "Someone else has placed a higher bid. Current price: 12,000,000"

## API Testing

### Manual Bid
```bash
curl -X POST http://localhost:5555/api/products/1/bid \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=your_token" \
  -d '{"bidAmount": 10500000}'
```

### Auto-Bid
```bash
curl -X POST http://localhost:5555/api/products/1/bid \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=your_token" \
  -d '{"maxPrice": 12000000}'
```

### Invalid Payload (Both fields)
```bash
curl -X POST http://localhost:5555/api/products/1/bid \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=your_token" \
  -d '{"bidAmount": 10500000, "maxPrice": 12000000}'
# Expected: 400 - Provide either bidAmount OR maxPrice
```

### Invalid Payload (No fields)
```bash
curl -X POST http://localhost:5555/api/products/1/bid \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=your_token" \
  -d '{}'
# Expected: 400 - Provide either bidAmount OR maxPrice
```

## Database Queries for Testing

### Check Current Leader
```sql
SELECT 
    b.id as bid_id,
    b.buyer as bidder_id,
    b.price as bid_price,
    b.bid_date,
    u.email as bidder_email
FROM bids b
JOIN users u ON u.id = b.buyer
WHERE b.product = 1
ORDER BY b.price DESC, b.bid_date ASC
LIMIT 1;
```

### Check Auto-Bids
```sql
SELECT 
    ab.*,
    u.email as bidder_email
FROM auto_bids ab
JOIN users u ON u.id = ab.bidder
WHERE ab.product = 1
ORDER BY ab.max_price DESC, ab.created_at ASC;
```

### Check All Bids
```sql
SELECT 
    b.id,
    b.price,
    b.max_price,
    b.bid_date,
    u.email as bidder_email
FROM bids b
JOIN users u ON u.id = b.buyer
WHERE b.product = 1
ORDER BY b.bid_date DESC;
```

## Frontend Testing

### UI Components to Verify
1. **Radio buttons**: Manual vs Auto selection
2. **Manual section**: Quick bid buttons (+1, +5, +10 step)
3. **Custom amount**: Input và checkbox "Use custom?"
4. **Auto section**: Max price input với validation
5. **Summary display**: Hiển thị giá/max price đúng mode
6. **Submit button**: Text thay đổi "Confirm Bid" vs "Place Auto-Bid"

### Validation Messages
- Manual: "Bid amount must be at least Xđ"
- Auto: "Max price must be at least Xđ"
- Terms: "You must accept the terms to place a bid"

### Toast Messages
- Success (manual): "Bid placed successfully"
- Success (auto): "Auto-bid placed successfully! You are currently winning."
- Outbid (auto): "Auto-bid placed. Another bidder has a higher max price."
- Outbid (manual): "Bid placed, but you were outbid by auto-bidding."

## Edge Cases

### Case 1: Instant Buy with Auto-Bid
- Auto-bid không ảnh hưởng instant buy
- Chỉ manual bid có thể trigger instant buy

### Case 2: Multiple Auto-Bids Same Time
- Database handle concurrency với proper ordering
- Earlier created_at wins on tie

### Case 3: Product Expired
- Cả manual và auto đều bị chặn
- Error: "Bidding is closed for this product"

### Case 4: Seller Bidding
- Seller không thể đấu giá sản phẩm của mình
- Error: "Sellers cannot bid on their own products"

## Performance Considerations

### Indexes Needed
```sql
-- Auto-bids queries
CREATE INDEX idx_auto_bids_product_max_price ON auto_bids(product, max_price DESC, created_at ASC);

-- Leader bid query
CREATE INDEX idx_bids_product_price_date ON bids(product, price DESC, bid_date ASC);
```

### Load Testing
- Test với 100+ concurrent auto-bids
- Monitor database response times
- Check for race conditions

## Troubleshooting

### Common Issues
1. **400 Error**: Check payload - chỉ gửi 1 field
2. **409 Error**: Bid quá thấp hoặc có người khác giá cao hơn
3. **Database Error**: Kiểm tra migration đã chạy chưa
4. **Email Not Sending**: Check email service configuration

### Debug Queries
```sql
-- Check product state
SELECT p.current_price, p.state, sp.expired_at 
FROM products p 
JOIN sell_product sp ON p.id = sp.product 
WHERE p.id = 1;

-- Check user permissions
SELECT u.rating, COUNT(*) as review_count
FROM users u
LEFT JOIN reviews r ON r.ratee = u.id
WHERE u.id = [user_id];
```

## Rollback Plan

### Disable Auto-Bidding
```sql
-- Comment out auto-bid logic in placeBid controller
-- Remove auto-bid UI from frontend
-- Keep database tables for future use
```

### Remove Feature
```sql
DROP TABLE IF EXISTS auto_bids;
ALTER TABLE bids DROP COLUMN IF EXISTS max_price;
```

---

## Test Checklist

- [ ] Manual bid works correctly
- [ ] Auto-bid works without competition  
- [ ] Auto-bid vs auto-bid competition
- [ ] Tie-break rule (earlier wins)
- [ ] Manual vs auto-bid interaction
- [ ] Validation for low bids
- [ ] API contract enforcement
- [ ] Email notifications
- [ ] Database consistency
- [ ] UI mode switching
- [ ] Error handling
- [ ] Performance under load

Test complete khi tất cả checkboxes được đánh dấu! ✅
