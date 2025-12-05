import query from "../libs/db.js"; 
import { getProductDetailsById } from "../libs/sqlQuery.js";

class ProductController {
    async getProductDetails(req, res) {
        try {
            const { productId } = req.params;
            if (!productId || isNaN(parseInt(productId, 10))) {
                return res.status(400).json({ message: "Invalid product ID" });
            }

            const result = await query(getProductDetailsById, [productId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: "Product not found" });
            }

            const productData = result.rows[0];
            
            return res.status(200).json({
                message: "Product details retrieved successfully",
                data: {
                    product: productData
                }
            });
        } catch (error) {
            console.error("Error fetching product details:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

const productController = new ProductController();
export default productController;