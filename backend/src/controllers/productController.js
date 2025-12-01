import query from "../libs/db.js";
import {
    createProduct,
  } from "../libs/sqlQuery.js";

class ProductController {
    async addProduct(req, res) {
        try {
            const { name, current_price, image, state } = req.body;

            if (!name || !current_price || !image || !state) {
                return res.status(400).json({
                  message: "Name, current price, image and state are required",
                });
            }

            const result = await query(createProduct, [
                name,
                current_price,
                image,
                state
            ]);

            const newProduct = result.rows[0];

            return res
                .status(201)
                .json({ message: "Product created successfully!", newProduct });            
        } catch(error) {
            console.error("Register Error: ", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    async addImages(req, res) {

    }

    async addDescriptions(req, res) {
        
    }
}

const productController = new ProductController();
export default productController;