import query from "../libs/db.js";

export default function auctionCron() {
  console.log("[CRON] Sync auction states (every 5s)");

  let running = false;

  setInterval(async () => {
    if (running) return;
    running = true;

    try {
      await query("CALL sync_auction_states();");
    } catch (err) {
      console.error("[CRON] error:", err?.message || err);
    } finally {
      running = false;
    }
  }, 5_000);
}