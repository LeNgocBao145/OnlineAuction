import query from "../libs/db.js";
import {
  getProductDetailsById,
  getFilteredProductsQuery,
  createQuestion,
  updateQuestionAnswer,
  getBidRequestsByProductId,
  createBidRequest,
  getBidRequestByBidderAndProduct,
  updateBidRequestReset,
  approveBidRequest,
  rejectBidRequest,
  handleInstantBuyQuery,
  placeBidTransaction,
  createProduct,
  getProductById,
  getProductImagesById,
  createProductImages,
  createProductDescription,
  createSellProduct
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

class ProductController {
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
      const { productId } = req.params;
      const userId = req.user.id;
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
      const { productId, questionId } = req.params;
      const answererId = req.user.id;
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
      const { productId } = req.params;
      const userId = req.user.id;

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

      // Check if product exists by checking total_count - if no product, the query returns empty
      // The getBidRequestsByProductId query already handles product validation via JOIN
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
      const { requestId, productId } = req.params;
      const userId = req.user.id;

      // Combined query: check permission + get email data in one query
      const checkQuery = `
        SELECT
          sp.seller,
          br.state as request_state,
          u.email as bidder_email,
          p.name as product_name
        FROM bid_requests br
          JOIN sell_product sp ON sp.product = br.product
          JOIN users u ON u.id = br.bidder
          JOIN products p ON p.id = br.product
        WHERE br.id = $1 AND sp.product = $2
      `;

      const checkResult = await query(checkQuery, [requestId, productId]);
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: "Bid request not found" });
      }

      const requestData = checkResult.rows[0];

      if (requestData.seller !== parseInt(userId, 10)) {
        return res.status(403).json({ message: "Only the seller can approve bid requests for their products" });
      }

      if (requestData.request_state !== "pending") {
        return res.status(400).json({ message: "Request already processed" });
      }

      const result = await query(approveBidRequest, [requestId]);
      if (result.rowCount === 0) {
        return res.status(400).json({ message: "Request not found or already processed" });
      }

      sendBidResponseEmail(requestData.bidder_email, requestData.product_name, true)
        .catch(err => console.error("Email error:", err));

      return res.status(200).json({ message: "Bid request approved successfully!" });
    } catch (error) {
      console.error("Error when accepting bid request", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async rejectBidRequest(req, res) {
    try {
      const { requestId, productId } = req.params;
      const userId = req.user.id;

      const checkQuery = `
        SELECT
          sp.seller,
          br.state as request_state,
          u.email as bidder_email,
          p.name as product_name
        FROM bid_requests br
          JOIN sell_product sp ON sp.product = br.product
          JOIN users u ON u.id = br.bidder
          JOIN products p ON p.id = br.product
        WHERE br.id = $1 AND sp.product = $2
      `;

      const checkResult = await query(checkQuery, [requestId, productId]);
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: "Bid request not found" });
      }

      const requestData = checkResult.rows[0];

      if (requestData.seller !== parseInt(userId, 10)) {
        return res.status(403).json({ message: "Only the seller can reject bid requests for their products" });
      }

      if (requestData.request_state !== "pending") {
        return res.status(400).json({ message: "Request already processed" });
      }

      const result = await query(rejectBidRequest, [requestId]);
      if (result.rowCount === 0) {
        return res.status(400).json({ message: "Request not found or already processed" });
      }

      sendBidResponseEmail(requestData.bidder_email, requestData.product_name, false)
        .catch(err => console.error("Email error:", err));

      return res.status(200).json({ message: "Bid request rejected successfully!" });
    } catch (error) {
      console.error("Error when rejecting bid request", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async placeBid(req, res) {
    try {
      const { productId } = req.params;
      const userId = req.user.id;
      const { bidAmount } = req.body;
      const amount = parseFloat(bidAmount);

      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid bid amount" });
      }

      const combinedCheckQuery = `
        SELECT
          u.id as user_id,
          u.email as user_email,
          u.rating as user_rating,
          p.id as product_id,
          p.name as product_name,
          p.current_price,
          sp.step_price,
          sp.instant_price,
          p.state as product_state,
          sp.seller,
          sp.expired_at,
          seller_user.email as seller_email,
          (SELECT COUNT(*) FROM reviews WHERE ratee = u.id) as rating_count,
          (SELECT br.id FROM bid_requests br WHERE br.bidder = u.id AND br.product = p.id AND br.state = 'success' LIMIT 1) as bid_permission,
          (SELECT bidder.email FROM bids b JOIN users bidder ON b.buyer = bidder.id WHERE b.product = p.id ORDER BY b.price DESC LIMIT 1) as prev_bidder_email
        FROM users u
          CROSS JOIN products p
          LEFT JOIN sell_product sp ON sp.product = p.id
          LEFT JOIN users seller_user ON seller_user.id = sp.seller
        WHERE u.id = $1 AND p.id = $2
      `;

      const checkResult = await query(combinedCheckQuery, [userId, productId]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: "User or product not found" });
      }

      const data = checkResult.rows[0];

      if (!data.user_id) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!data.product_id) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (data.product_state !== "bidding" || new Date() > new Date(data.expired_at)) {
        return res.status(403).json({ message: "Bidding is closed for this product" });
      }

      if (data.user_id === data.seller) {
        return res.status(403).json({ message: "Sellers cannot bid on their own products" });
      }

      const ratingCount = parseInt(data.rating_count, 10);
      const isFirstBid = ratingCount === 0;

      if (isFirstBid && !data.bid_permission) {
        return res.status(403).json({ message: "New users with 0 ratings need permission to bid on this product" });
      }

      if (!isFirstBid && parseFloat(data.user_rating) < 4) {
        return res.status(403).json({ message: "User rating too low to place a bid" });
      }

      const current_price = parseFloat(data.current_price);
      const step_price = parseFloat(data.step_price);
      const instant_price = parseFloat(data.instant_price || 0);

      if (amount < current_price + step_price) {
        return res.status(400).json({ message: `Bid amount must be at least $${(current_price + step_price).toFixed(2)}` });
      }

      const sellerEmail = data.seller_email;
      const currentBidderEmail = data.user_email;
      const previousHighestBidderEmail = data.prev_bidder_email;
      const productName = data.product_name;
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
