import query from "../libs/db.js";
import {
    createProduct,
    getProductById,
    getProductImagesById,
    createProductImages,
    createProductDescription,
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

            if(current_price <= 0) {
                return res.status(400).json({
                    message: "Current price must be positive",
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
            console.error("[addProduct] Error: ", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    async addImages(req, res) {
        try {
            const { productId, imagePath } = req.body;

            if (!productId || !imagePath) {
                return res.status(400).json({
                  message: "ProductID and imagePath are required",
                });
            }

            const product = await query(getProductById, [productId]);

            if (!product.rows.length) {
                return res.status(404).json({ message: "No product found" });
            }

            const isExistingProductImages = await query(getProductImagesById, [productId]);
            if (isExistingProductImages.rows.length > 0) {
                return res.status(409).json({ message: "Product images already exist" });
            }

            const result = await query(createProductImages, [productId, imagePath]);

            const newProductImages = result.rows[0];

            return res
                    .status(201)
                    .json({ message: "Product images created successfully!", newProductImages });
        } catch (error) {
            console.error("[addImages] Error: ", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    async addDescription(req, res) {
        try {
            const { productId, des } = req.body;

            if (!productId || !des) {
                return res.status(400).json({
                  message: "ProductID and description are required",
                });
            }

            const product = await query(getProductById, [productId]);

            if (!product.rows.length) {
                return res.status(404).json({ message: "No product found" });
            }

            const result = await query(createProductDescription, [productId, des]);

            const newProductDescription = result.rows[0];

            return res
                    .status(201)
                    .json({ message: "Product description created successfully!", newProductDescription });
        } catch (error) {
            console.error("[addDescription] Error: ", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
}

const productController = new ProductController();
export default productController;