import { getRoleFromTrade } from "../libs/sqlQuery.js";

export const transactionMiddleware = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await query(getRoleFromTrade, [productId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const { bidder, seller } = result.rows[0];

    if (userId !== bidder && userId !== seller) {
      return res.status(403).json({
        message: "You are not allowed to access this transaction"
      });
    }

    req.transactionRole = userId === bidder ? "bidder" : "seller";

    next();
  } catch (error) {
    console.error("[TransactionMiddleware] Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
