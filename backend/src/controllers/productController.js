import query from "../libs/db.js";
import {
  getProductDetailsById,
  getFilteredProductsQuery,
} from "../libs/sqlQuery.js";

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
          product: productData,
        },
      });
    } catch (error) {
      console.error("Error fetching product details:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  async filterProducts(req, res) {
    try {
      const keyword = req.query.keyword || "";
      const sanitizedKeyword = keyword.trim();
      const category = req.query.category
        ? parseInt(req.query.category, 10)
        : null;
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = (page - 1) * limit;

      const SORT_MAPPING = {
        price_asc: "p.current_price ASC",
        price_desc: "p.current_price DESC",
        time_left_asc: "sp.expired_at ASC",
        time_left_desc: "sp.expired_at DESC",
      };

      let sortCriteria = req.query.sort || "time_left_desc,price_asc";
      const orderBySql =
        sortCriteria
          .split(",")
          .map((key) => SORT_MAPPING[key.trim()])
          .filter(Boolean)
          .join(", ") || "sp.expired_at DESC, p.current_price ASC";

      const sqlQuery = getFilteredProductsQuery(orderBySql);

      const { rows } = await query(sqlQuery, [
        sanitizedKeyword,
        category,
        limit,
        offset,
      ]);

      const totalItems =
        rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
      const totalPages = Math.ceil(totalItems / limit);

      const products = rows.map((item) => {
        const { total_count, ...productData } = item;
        return productData;
      });

      return res.status(200).json({
        message: "Products retrieved successfully",
        data: {
          products,
          pagination: {
            page,
            limit,
            totalItems,
            totalPages,
          },
        },
      });
    } catch (error) {
      console.error("Error when searching products", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

const productController = new ProductController();
export default productController;
