import query from "../libs/db.js";
import { 
    getProductById, 
    getFavoritesByUserId, 
    markFavoriteProduct,
    unmarkFavoriteProduct,
    getFavoriteByUserAndProduct
} from "../libs/sqlQuery.js";

class BidderController {
    async markFavorite(req, res) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const productId = req.params.productId;
            if (!productId) {
                return res.status(400).json({ message: "Product ID is required" });
            }

            // Check if product exists
            const product = await query(getProductById, [productId]);
            if (product.rows.length === 0) {
                return res.status(404).json({ message: "Product not found" });
            }

            // Check if product is already marked as favorite
            const alreadyFavorited = await query(getFavoriteByUserAndProduct, [userId, productId]);
            if (alreadyFavorited.rows.length > 0) {
                return res.status(409).json({ message: "Product is already marked as favorite" });
            }

            await query(markFavoriteProduct, [userId, productId]);

            return res.status(201).json({ 
                message: "Product marked as favorite successfully!",
                productId,
            });
        } catch (error) {
            console.error("Error when mark favorite", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    async unmarkFavorite(req, res) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const productId = req.params.productId;
            if (!productId) {
                return res.status(400).json({ message: "Product ID is required" });
            }

            // Check if product is already marked as favorite
            const existing = await query(getFavoriteByUserAndProduct, [userId, productId]);
            if (existing.rows.length === 0) {
                return res.status(409).json({ message: "Product is not in favorites" });
            }
            
            await query(unmarkFavoriteProduct, [userId, productId]);

            return res.status(200).json({ 
                message: "Product removed from favorites successfully!",
                productId,
            });
        } catch (error) {
            console.error("Error when unmark favorite", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    async getFavorites(req, res) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const favorites = await query(getFavoritesByUserId, [userId]);

            return res.status(200).json({
                count: favorites.rows.length,
                favorites: favorites.rows,
            });
        } catch (error) {
            console.error("Error when get favorites", error);
            return res.status(500).json({ message: "Internal server error" });  
        }
    }
}

const bidderController = new BidderController();
export default bidderController;