import query from "../libs/db"; 
import { getProductDetailsById, getProducts } from "../libs/sqlQuery.js";

class ProductController {
    async getProductDetails(req, res) {
        try {
            const productId = req.params.productId;

            const existing = await query(getProducts);
        } catch (error) {
            console.error("Error fetching product details:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

const productController = new ProductController();
export default productController;