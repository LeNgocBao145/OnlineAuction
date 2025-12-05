import query from "../libs/db.js";
import { 
    getProductById, 
    getFavoritesQuery, 
    markFavoriteProduct,
    unmarkFavoriteProduct,
    getFavoriteByUserAndProduct
} from "../libs/sqlQuery.js";

class UserController {
    async markFavorite(req, res) {
        try {
            const userId = req.user?.id;
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
            const userId = req.user?.id;
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
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const category = req.query.category ? parseInt(req.query.category, 10) : null;
            const page = Math.max(1, parseInt(req.query.page, 10) || 1);
            const limit = parseInt(req.query.limit, 10) || 10;
            const offset = (page - 1) * limit;

            const SORT_MAPPING = {
                'price_asc': 'p.current_price ASC',
                'price_desc': 'p.current_price DESC',
                'time_left_asc': 'sp.expired_at ASC',
                'time_left_desc': 'sp.expired_at DESC',
                'recently_favorited': 'f.created_at DESC'
            };

            let sortCriteria = req.query.sort || 'recently_favorited';

            const orderBySql = sortCriteria
                .split(',')
                .map(key => SORT_MAPPING[key.trim()])
                .filter(Boolean)
                .join(', ') || 'f.created_at DESC';

            const sqlQuery = getFavoritesQuery(orderBySql);

            const { rows } = await query(sqlQuery, [userId, category, limit, offset]);

            const totalItems = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
            const totalPages = Math.ceil(totalItems / limit);

            const products = rows.map(item => {
                const { total_count, ...productData } = item;   
                return productData;
            });

            return res.status(200).json({
                message: "Favorites retrieved successfully",
                data: {
                    products,
                    pagination: {
                        page,
                        limit,
                        totalItems, 
                        totalPages  
                    }
                }
            });
        } catch (error) {
            console.error("Error when get favorites", error);
            return res.status(500).json({ message: "Internal server error" });  
        }
    }
}

const userController = new UserController();
export default userController;