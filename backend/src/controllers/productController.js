import { create } from "domain";
import query from "../libs/db.js";
import {
  getProductDetailsById,
  getFilteredProductsQuery,
  createQuestion,
  updateQuestionAnswer,
} from "../libs/sqlQuery.js";
import { 
  sendQuestionAskedEmail, 
  sendQuestionAnsweredEmail 
} from "../utils/emailService.js";

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
      const keyword = req.query.keyword ? req.query.keyword.trim() : "";

      const category = req.query.category ? parseInt(req.query.category, 10) : null;
      
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
      const offset = (page - 1) * limit;

      const startDate = req.query.startDate && req.query.startDate !== "" ? req.query.startDate : null;
      const endDate = req.query.endDate && req.query.endDate !== "" ? req.query.endDate : null;

      const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
      const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;

      const allowedStates = ["incoming", "bidding", "sold"];

      const states = req.query.states
        ? req.query.states.split(",").map(s => s.trim())
        : null;
          
      const finalStates = states?.filter(s => allowedStates.includes(s)) || null;

      const SORT_MAPPING = {
        price_asc: "p.current_price ASC",
        price_desc: "p.current_price DESC",
        time_left_asc: "sp.expired_at ASC",
        time_left_desc: "sp.expired_at DESC",
        newest: "sp.created_at DESC",
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
        keyword,
        category,
        startDate,
        endDate,
        minPrice,
        maxPrice,
        finalStates,
        limit,
        offset,
      ]);

      const totalItems = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
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

  async askQuestion(req, res) {
    try {
      const { productId, userId } = req.params;
      const { question } = req.body;

      const trimmedQuestion = question ? question.trim() : "";
      if (!trimmedQuestion || trimmedQuestion === "") {
        return res.status(400).json({ message: "Question content cannot be empty" });
      }

      if (trimmedQuestion.length > 200) {
        return res.status(400).json({ message: "Question content must be less than 200 characters" });
      }

      const checkQuery = `
        SELECT 
          p.id as product_id,
          p.name as product_name,
          sp.seller,
          u.id as user_id,
          u.name as user_name,
          s.email as seller_email
        FROM products p
        LEFT JOIN users u ON u.id = $2
        LEFT JOIN sell_product sp ON sp.product = p.id
        LEFT JOIN users s ON s.id = sp.seller
        WHERE p.id = $1
      `;

      const result = await query(checkQuery, [productId, userId]);

      if (result.rows.length === 0 || !result.rows[0].product_id) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (!result.rows[0].user_id) {
        return res.status(404).json({ message: "User not found" });
      }

      if (result.rows[0].seller === parseInt(userId, 10)) {
        return res.status(403).json({ message: "Sellers cannot ask questions on their own products" });
      }

      // Create question
      await query(createQuestion, [userId, productId, trimmedQuestion]);

      // Send email using data from the single query
      const { seller_email, product_name, user_name } = result.rows[0];
      const productUrl = `https://${process.env.FRONTEND_HOST}/products/${productId}`;

      await sendQuestionAskedEmail(seller_email, product_name, user_name, trimmedQuestion, productUrl);

      return res.status(201).json({ message: "Question asked successfully" });
    } catch (error) {
      console.error("Error when asking question", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async answerQuestion(req, res) {
    try {
      const { productId, questionId, answererId } = req.params;
      const { answer } = req.body;

      const trimmedAnswer = answer ? answer.trim() : "";
      if (!trimmedAnswer || trimmedAnswer === "") {
        return res.status(400).json({ message: "Answer content cannot be empty" });
      }

      if (trimmedAnswer.length > 200) {
        return res.status(400).json({ message: "Answer content must be less than 200 characters" });
      }

      const checkQuery = `
        SELECT 
          p.id as product_id,
          p.name as product_name,
          sp.seller,
          q.id as question_id,
          q.answer as existing_answer,
          q.questioner,
          asker.email as asker_email,
          answerer.id as answerer_id
        FROM products p
        LEFT JOIN product_questions q ON q.id = $2 AND q.product = p.id
        LEFT JOIN sell_product sp ON sp.product = p.id
        LEFT JOIN users asker ON asker.id = q.questioner
        LEFT JOIN users answerer ON answerer.id = $3
        WHERE p.id = $1
      `;

      const result = await query(checkQuery, [productId, questionId, answererId]);

      if (result.rows.length === 0 || !result.rows[0].product_id) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (!result.rows[0].answerer_id) {
        return res.status(404).json({ message: "Answerer not found" });
      }

      if (!result.rows[0].question_id) {
        return res.status(404).json({ message: "Question not found for this product" });
      }

      if (result.rows[0].seller !== parseInt(answererId, 10)) {
        return res.status(403).json({ message: "Only the seller can answer questions on their products" });
      }

      if (result.rows[0].existing_answer && result.rows[0].existing_answer.trim() !== "") {
        return res.status(409).json({ message: "This question has already been answered" });
      }

      // Update answer
      await query(updateQuestionAnswer, [answererId, trimmedAnswer, questionId]);

      // Send email using data from the single query
      const { asker_email, product_name } = result.rows[0];
      const productUrl = `https://${process.env.FRONTEND_HOST}/products/${productId}`;

      await sendQuestionAnsweredEmail(asker_email, product_name, trimmedAnswer, productUrl);

      return res.status(200).json({ message: "Question answered successfully" });
    } catch (error) { 
      console.error("Error when answering question", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

const productController = new ProductController();
export default productController;
