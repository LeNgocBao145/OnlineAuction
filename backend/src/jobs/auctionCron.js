import query from "../libs/db.js";
import {
  sendAuctionWinnerEmail,
  sendAuctionEndedToSellerEmail,
  sendAuctionEndedNoWinnerEmail,
  sendAuctionEndedToParticipantEmail,
  sendAuctionEndedNoWinnerToParticipantEmail,
} from "../utils/emailService.js";

// Helper function to send auction ended emails to all participants
async function sendAuctionEndedEmails(productId, productName, winnerId, winnerName, winnerEmail, winningBid, sellerEmail) {
  const productUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/product/${productId}`;

  try {
    // Get all unique bidders for this product (excluding winner)
    const participantsResult = await query(`
      SELECT DISTINCT u.id, u.email, u.name, MAX(b.price) as highest_bid
      FROM bids b
      JOIN users u ON u.id = b.buyer
      WHERE b.product = $1 AND u.id != $2
      GROUP BY u.id, u.email, u.name
    `, [productId, winnerId || -1]);

    const participants = participantsResult.rows;

    if (winnerId && winnerEmail) {
      // Send winner notification
      await sendAuctionWinnerEmail(winnerEmail, productName, winningBid, productUrl);

      // Send seller notification with winner info
      await sendAuctionEndedToSellerEmail(sellerEmail, productName, winnerName, winningBid, productUrl);

      // Send notification to all other participants
      for (const participant of participants) {
        try {
          await sendAuctionEndedToParticipantEmail(
            participant.email,
            productName,
            winnerName,
            winningBid,
            participant.highest_bid,
            productUrl
          );
        } catch (emailErr) {
          console.error(`[CRON] Error sending auction ended email to participant ${participant.email}:`, emailErr?.message || emailErr);
        }
      }
    } else {
      // No winner - send no winner notification to seller
      await sendAuctionEndedNoWinnerEmail(sellerEmail, productName, productUrl);

      // Send notification to all participants that auction ended with no winner
      for (const participant of participants) {
        try {
          await sendAuctionEndedNoWinnerToParticipantEmail(
            participant.email,
            productName,
            participant.highest_bid,
            productUrl
          );
        } catch (emailErr) {
          console.error(`[CRON] Error sending auction ended (no winner) email to participant ${participant.email}:`, emailErr?.message || emailErr);
        }
      }
    }
  } catch (err) {
    console.error(`[CRON] Error sending auction ended emails for product ${productId}:`, err?.message || err);
  }
}

export default function auctionCron() {
  console.log("[CRON] Initializing auction state sync (every 5s)");

  let running = false;

  // Delay first run by 3 seconds to ensure database is ready
  setTimeout(() => {
    console.log("[CRON] Starting auction cron job...");
    
    setInterval(async () => {
      if (running) return;
      running = true;

      try {
        // First, find auctions that are about to end (currently bidding and expired)
        const endingAuctions = await query(`
        SELECT 
          p.id as product_id,
          p.name as product_name,
          p.current_price,
          sp.seller as seller_id,
          seller_user.email as seller_email,
          (
            SELECT b.buyer 
            FROM bids b 
            WHERE b.product = p.id 
            ORDER BY b.price DESC, b.bid_date ASC, b.id ASC 
            LIMIT 1
          ) as winner_id,
          (
            SELECT u.name 
            FROM bids b 
            JOIN users u ON u.id = b.buyer 
            WHERE b.product = p.id 
            ORDER BY b.price DESC, b.bid_date ASC, b.id ASC 
            LIMIT 1
          ) as winner_name,
          (
            SELECT u.email 
            FROM bids b 
            JOIN users u ON u.id = b.buyer 
            WHERE b.product = p.id 
            ORDER BY b.price DESC, b.bid_date ASC, b.id ASC 
            LIMIT 1
          ) as winner_email,
          (
            SELECT b.price 
            FROM bids b 
            WHERE b.product = p.id 
            ORDER BY b.price DESC, b.bid_date ASC, b.id ASC 
            LIMIT 1
          ) as winning_bid
        FROM products p
        JOIN sell_product sp ON sp.product = p.id
        JOIN users seller_user ON seller_user.id = sp.seller
        WHERE p.state = 'bidding'
          AND sp.expired_at <= NOW()
      `);

      const auctionsToNotify = endingAuctions.rows;

      console.log(`[CRON] Found ${auctionsToNotify.length} auctions to update state and notify participants.`);

      // Run the stored procedure to update states
      await query("CALL sync_auction_states();");

      console.log("[CRON] Auction states synchronized.");

      // Send emails for auctions that just ended
      for (const auction of auctionsToNotify) {
        await sendAuctionEndedEmails(
          auction.product_id,
          auction.product_name,
          auction.winner_id,
          auction.winner_name,
          auction.winner_email,
          auction.winning_bid || auction.current_price,
          auction.seller_email
        );
      }
    } catch (err) {
      console.error("[CRON] error:", err?.message || err);
    } finally {
      running = false;
    }
  }, 5_000);
  }, 3000); // Delay first run by 3 seconds
}