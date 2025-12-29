import query from "../libs/db.js";
import {
    createProduct,
    getProductById,
    createProductImages,
    createProductDescription,
    createSellProduct,
    getListProducts
} from "../libs/sqlQuery.js";

class ProductController {
    async listProducts(req, res) {
        const { 
            type = 'ENDING_SOON', 
            order = 'ASC', 
            limit = 5 
        } = req.query;

        const safeOrder = String(order).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        const queryP = getListProducts(type, safeOrder);
        const result = await query(queryP, [limit]);
        return res.status(200).json(result.rows);
    }

    async addProduct(req, res) {
        try {
            const { seller, name, images, init_price, step_price, instant_price, start_at, expired_at, description, isExtent } = req.body;

            if (!seller || !name || !images || !init_price || !step_price || !start_at || !expired_at || !description || typeof (isExtent) !== 'boolean') {
                return res.status(400).json({
                  message: "Seller id, name, images, init_price, step_price, description and isExtent are required"
                });
            }

            if(!Array.isArray(images) || images.length < 3) {
                return res.status(400).json({
                    message: "Images must contain at least 3 items"
                  });
            }

            if(init_price <= 0 || step_price <= 0) {
                return res.status(400).json({
                    message: "Init price and step price must be positive",
                });
            }

            const result = await query(createProduct, [
                name,
                init_price,
                images[0]
            ]);

            const productId = result.rows[0].id;

            await Promise.all([
                query(createProductImages, [productId, images]),
                query(createProductDescription, [productId, description]),
                query(createSellProduct, [productId, seller, init_price, step_price, instant_price || null, start_at, expired_at, isExtent])
            ]);

            return res.status(201).json({ message: "Product created successfully!", productId });     
        } catch(error) {
            console.error("[addProduct] Error: ", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    async addDescription(req, res) {
        try {
            const productId = req.params.productId;
            const { des } = req.body;

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

    async refuse(req, res) {
        const productId = req.params.productId;
        const { bidderId } = req.body;

        if(!bidderId) {
            return res.status(400).json({
                message: "BidderId are required",
            });
        }

        const product = await query(getProductById, [productId]);
        console.log(product.rows[0]);
    }
}

const productController = new ProductController();
export default productController;