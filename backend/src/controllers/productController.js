import { create } from "domain";
import query from "../libs/db.js";
import {
  getUserById,
  getProductDetailsById,
  getFilteredProductsQuery,
  createQuestion,
  updateQuestionAnswer,
  getBidRequestsByProductId,
  getProductById,
  getProductAndSellInfoById,
  countUserRatings,
  checkIsAllowedBidder,
  createBidRequest,
  getBidRequestByBidderAndProduct,
  updateBidRequestReset,
  approveBidRequest,
  rejectBidRequest,
  handleInstantBuyQuery,
  placeBidTransaction,
} from "../libs/sqlQuery.js";
import { 
  sendQuestionAskedEmail, 
  sendQuestionAnsweredEmail,
  sendBidRequestEmail,
  sendBidResponseEmail,
  sendPriceUpdateEmail,
  sendBidSuccessfullyEmail,
  sendInstantBuyEmail,
  sendSuccessfullyInstantBuyEmail,
} from "../utils/emailService.js";
import { get, request } from "http";
import { send } from "process";

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

  async askToBid(req, res) {
    try {
      const { userId, productId } = req.params;

      const checkQuery = `
        SELECT
          p.name as product_name,
          s.email as seller_email,
          u.rating as user_rating,
          u.name as name,
          sp.seller

        FROM users u
          JOIN sell_product sp ON sp.product = $2
          JOIN products p ON p.id = sp.product
          JOIN users s ON s.id = sp.seller

        WHERE u.id = $1;
      `;

      const checkUser = await query(checkQuery, [userId, productId]);

      if (checkUser.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const userData = checkUser.rows[0];

      if (userData.seller === parseInt(userId, 10)) {
        return res.status(403).json({ message: "Sellers cannot ask to bid on their own products" });
      }

      const userRating = parseFloat(userData.user_rating || 0);
      if (userRating >= 4) {
        return res.status(400).json({ message: "User with high rating implies permission, no need to ask to bid" });
      }

      const triggerEmail = async () => {
        const to = userData.seller_email;
        const productName = userData.product_name;
        const buyerName = userData.name;
        const productUrl = `https://${process.env.FRONTEND_HOST}/products/${productId}`;

        await sendBidRequestEmail(to, productName, buyerName, productUrl)
              .catch((err) => {
                console.error("Error sending bid request email", err);
              });
      };


      const existingRequest = await query(getBidRequestByBidderAndProduct, [userId, productId]);
      if (existingRequest.rows.length === 0) {
        await query(createBidRequest, [userId, productId]);
        await triggerEmail();

        return res.status(201).json({ message: "Bid request created successfully" });
      } else {
        const lastRequestTime = new Date(existingRequest.rows[0].request_date + 'Z');
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        if (lastRequestTime > fiveMinutesAgo) {
          return res.status(429).json({ message: "You can only request to bid every 5 minutes" });
        }

        await query(updateBidRequestReset, [userId, productId]);
        await triggerEmail();

        return res.status(200).json({ message: "Request updated and resubmitted successfully" });
      }
    } catch (error) {
      console.error("Error when asking to bid", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getProductBidRequests(req, res) {
    try {
      const { productId } = req.params;
      const checkProduct = await query(getProductById, [productId]);
      if (checkProduct.rows.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      const keyword = req.query.keyword ? req.query.keyword.trim() : "";
      
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 5));
      const offset = (page - 1) * limit;

      const allowedStates = ["pending", "success", "failed"];
      const states = req.query.states
        ? req.query.states.split(",").map(s => s.trim())
        : null;
      const finalStates = states?.filter(s => allowedStates.includes(s)) || null;

      const SORT_MAPPING = {
        name_asc: "u.name ASC",
        name_desc: "u.name DESC",
        oldest: "br.request_date ASC",
        newest: "br.request_date DESC",
      };

      let sortCriteria = req.query.sort || "newest";
      const orderBySql =
        sortCriteria
          .split(",")
          .map((key) => SORT_MAPPING[key.trim()])
          .filter(Boolean)
          .join(", ") || "br.request_date DESC";

      const sqlQuery = getBidRequestsByProductId(orderBySql);

      const { rows } = await query(sqlQuery, [
        keyword,
        productId,
        finalStates,
        limit,
        offset,
      ]);

      const totalItems = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
      const totalPages = Math.ceil(totalItems / limit);

      const requests = rows.map((item) => {
        const { total_count, ...requestData } = item;
        return requestData;
      });

      return res.status(200).json({
        message: "Product bid requests retrieved successfully",
        data: {
          requests,
          pagination: {
            page,
            limit,
            totalItems,
            totalPages,
          },
        },
      });
    } catch (error) {
      console.error("Error when getting bid requests", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async acceptBidRequest(req, res) {
    try {
      const { requestId, productId, userId } = req.params;

      const checkQuery = `
        SELECT
          sp.seller
        FROM bid_requests br
          JOIN sell_product sp ON sp.product = br.product
        WHERE br.id = $1 AND  sp.product = $2
      `;

      const checkResult = await query(checkQuery, [requestId, productId]);
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: "Bid request not found" });
      }

      if (checkResult.rows[0].seller !== parseInt(userId, 10)) {
        return res.status(403).json({ message: "Only the seller can approve bid requests for their products" });
      }

      const result = await query(approveBidRequest, [requestId]);
      if (result.rowCount === 0) {
        return res.status(400).json({ message: "Request not found or already processed" });
      }

      const emailDataQuery = `
        SELECT
          u.email as bidder_email,
          p.name as product_name
        FROM users u
          JOIN bid_requests br ON br.bidder = u.id
          JOIN products p ON p.id = br.product
        WHERE
          br.id = $1
      `;

      const emailData = await query(emailDataQuery, [requestId]);

      if (emailData.rows.length > 0) {
          sendBidResponseEmail(emailData.rows[0].bidder_email, emailData.rows[0].product_name , true)
            .catch(err => console.error("Email error:", err));
      }

      return res.status(200).json({ message: "Bid request approved successfully!" });
    } catch (error) {
      console.error("Error when accepting bid request", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async rejectBidRequest(req, res) {
    try {
      const { requestId, productId, userId } = req.params;
      const checkQuery = `
        SELECT
          sp.seller
        FROM bid_requests br
          JOIN sell_product sp ON sp.product = br.product 
        WHERE br.id = $1 AND sp.product = $2;
      `;

      const checkResult = await query(checkQuery, [requestId, productId]);
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: "Bid request not found" });
      }

      if (checkResult.rows[0].seller !== parseInt(userId, 10)) {
        return res.status(403).json({ message: "Only the seller can reject bid requests for their products" });
      }

      const result = await query(rejectBidRequest, [requestId]);
      if (result.rowCount === 0) {
        return res.status(400).json({ message: "Request not found or already processed" });
      }

      const emailDataQuery = `
        SELECT
          u.email as bidder_email,
          p.name as product_name
        FROM users u
          JOIN bid_requests br ON br.bidder = u.id
          JOIN products p ON p.id = br.product
        WHERE
          br.id = $1
      `;

      const emailData = await query(emailDataQuery, [requestId]);

     if (emailData.rows.length > 0) {
          sendBidResponseEmail(emailData.rows[0].bidder_email, emailData.rows[0].product_name , false)
            .catch(err => console.error("Email error:", err));
      }

      return res.status(200).json({ message: "Bid request rejected successfully!" });
    } catch (error) {
      console.error("Error when rejecting bid request", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async placeBid(req, res) {
    try {
      const { userId, productId } = req.params;
      const { bidAmount } = req.body;
      const amount = parseFloat(bidAmount);

      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid bid amount" });
      }

      const checkUser = await query(getUserById, [userId]);
      if (checkUser.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      const userData = checkUser.rows[0];

      const checkProduct = await query(getProductAndSellInfoById, [productId]);
      if (checkProduct.rows.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }
      const productData = checkProduct.rows[0];

      if (productData.state !== "bidding" || new Date() > new Date(productData.expired_at)) {
        return res.status(403).json({ message: "Bidding is closed for this product" });
      }

      if (userData.id === productData.seller) {
        return res.status(403).json({ message: "Sellers cannot bid on their own products" });
      }

      const countRatings = await query(countUserRatings, [userId]);
      const isFirstBid = parseInt(countRatings.rows[0].total, 10) === 0;

      if (isFirstBid) {
        const checkAllowedUserQuery = await query(checkIsAllowedBidder, [userId, productId]);
        if (checkAllowedUserQuery.rows.length === 0) {
          return res.status(403).json({ message: "New users with 0 ratings need permission to bid on this product" });
        }
      }

      if (!isFirstBid && userData.rating < 4) {
        return res.status(403).json({ message: "User rating too low to place a bid" });
      }

      const current_price = parseFloat(productData.current_price);
      const step_price = parseFloat(productData.step_price);
      const instant_price = parseFloat(productData.instant_price || 0);

      if (amount < current_price + step_price) {
        return res.status(400).json({ message: `Bid amount must be at least $${(current_price + step_price).toFixed(2)}` });
      }

      const previousBidderQuery = `
         SELECT u.email 
         FROM bids b JOIN users u ON b.buyer = u.id 
         WHERE b.product = $1 
         ORDER BY b.price DESC LIMIT 1
      `;
      const prevBidderResult = await query(previousBidderQuery, [productId]);

      const sellerEmail = productData.email;
      const currentBidderEmail = userData.email;
      const previousHighestBidderEmail = prevBidderResult.rows.length > 0 ? prevBidderResult.rows[0].email : null;

      const productName = productData.name;
      const productUrl = `https://${process.env.FRONTEND_HOST}/products/${productId}`;

      const toList = [sellerEmail];
      if (previousHighestBidderEmail && previousHighestBidderEmail !== currentBidderEmail) {  
        toList.push(previousHighestBidderEmail);
      }

      if (instant_price > 0 && amount >= instant_price) {
        const instantResult = await query(handleInstantBuyQuery, [userId, productId, amount]);

        if (instantResult.rowCount === 0) {
          return res.status(409).json({ message: "Product was just sold to someone else" });
        }

        sendSuccessfullyInstantBuyEmail(currentBidderEmail, productName, amount, productUrl)
          .catch(err => console.error("Error sending instant buy email to buyer:", err));

        for (const recipient of toList) {
          sendInstantBuyEmail(recipient, productName, amount, currentBidderEmail, productUrl)
            .catch(err => console.error("Error sending instant buy email to others:", err));
        }

        return res.status(200).json({ message: "Instant buy successful! You have purchased the product." });
      }

      const bidResult = await query(placeBidTransaction, [userId, productId, amount]);

      if (bidResult.rowCount === 0) {
        return res.status(409).json({ message: "Someone else has placed a higher bid. Please try again with a higher amount." });
      }

      sendBidSuccessfullyEmail(currentBidderEmail, productName, amount, productUrl)
        .catch(err => console.error("Error sending bid success email to bidder:", err));

      for (const recipient of toList) {
        sendPriceUpdateEmail(recipient, productName, amount, currentBidderEmail, productUrl)
          .catch(err => console.error("Error sending price update email to others:", err));
      }

      return res.status(201).json({ message: "Bid placed successfully" });
    } catch (error) {
      console.error("Error when placing bid", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

const productController = new ProductController();
export default productController;
