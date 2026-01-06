import fs from 'fs';
import path from 'path';
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
  createProduct,
  createProductCategory,
  getProductById,
  createProductImages,
  createProductDescription,
  createSellProduct,
  upsertAutoBid,
  getTopAutoBidsForProduct,
  insertBidRecord,
  updateProductPrice,
  getCurrentLeaderBid,
  updateProductById,
  updateProductStateById,
  updateSellProductById,
  closeSellProductById,
  deleteProductById,
  getProductBidders,
  refuseBidder as refuseBidderQuery,
  unrefuseBidder as unrefuseBidderQuery,
  getProductImagesById
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

const uploadDir = path.resolve(process.cwd(), "src", "assets", "products");

class ProductController {
  _deletePhysicalFiles = (filenames) => {
    if (!filenames || !Array.isArray(filenames)) return;
    filenames.forEach(filename => {
      if (!filename) return;
      const filePath = path.join(uploadDir, filename);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error(`[ProductController] Error deleting file ${filename}:`, err);
        }
      });
    });
  }

  addProduct = async (req, res) => {
    try {
      const { seller, name, init_price, step_price, instant_price, start_at, expired_at, description, isExtent, category: categoryParam, categories: categoriesParam, coverImageIndex } = req.body;
      const files = req.files;

      // Handle both single category (old) and multiple categories (new)
      let categoryIds = [];
      if (categoriesParam) {
        try {
          categoryIds = JSON.parse(categoriesParam);
        } catch (e) {
          categoryIds = [categoriesParam];
        }
      } else if (categoryParam) {
        categoryIds = [categoryParam];
      }

      // Remove duplicates and convert to integers
      categoryIds = [...new Set(categoryIds)].map(id => parseInt(id, 10)).filter(id => !isNaN(id));

      // FormData sends everything as strings, so we need to be careful with validation
      if (!seller || !name || !init_price || !step_price || !start_at || !expired_at || !description || categoryIds.length === 0) {
        if (files && files.length > 0) this._deletePhysicalFiles(files.map(f => f.filename));
        return res.status(400).json({
          message: "Seller id, name, init_price, step_price, description, start_at, expired_at and at least one category are required"
        });
      }

      if (!files || files.length < 3) {
        if (files && files.length > 0) this._deletePhysicalFiles(files.map(f => f.filename));
        return res.status(400).json({
          message: "At least 3 images are required"
        });
      }

      const init_price_num = parseFloat(init_price);
      const step_price_num = parseFloat(step_price);

      if (isNaN(init_price_num) || isNaN(step_price_num) || init_price_num <= 0 || step_price_num <= 0) {
        if (files && files.length > 0) this._deletePhysicalFiles(files.map(f => f.filename));
        return res.status(400).json({
          message: "Init price and step price must be positive numbers",
        });
      }

      const isExtentBool = isExtent === 'true' || isExtent === true;

      let imageFilenames = [];
      if (req.body.imagesOrder) {
        try {
          const order = JSON.parse(req.body.imagesOrder);
          let nextFileIdx = 0;
          imageFilenames = order.map(item => {
            if (item === 'new') {
              const file = files[nextFileIdx++];
              return file ? file.filename : null;
            }
            return null;
          }).filter(Boolean);
        } catch (e) {
          imageFilenames = files.map(file => file.filename);
        }
      } else {
        imageFilenames = files.map(file => file.filename);
      }

      const coverIdx = parseInt(coverImageIndex, 10) || 0;
      const coverImage = imageFilenames[coverIdx] || imageFilenames[0];

      // Determine initial state
      const now = new Date();
      const startDate = new Date(start_at);
      const state = startDate <= now ? 'bidding' : 'incoming';

      const result = await query(createProduct, [
        name,
        init_price_num,
        coverImage,
        state
      ]);

      const productId = result.rows[0].id;

      // Store all images in product_images table (including cover)
      // The CHECK constraint requires at least 3 images in the array
      await Promise.all([
        query(createProductImages, [productId, imageFilenames]),
        query(createProductDescription, [productId, description]),
        ...categoryIds.map(catId => query(createProductCategory, [productId, catId])),
        query(createSellProduct, [productId, seller, init_price_num, step_price_num, instant_price ? parseFloat(instant_price) : null, start_at, expired_at, isExtentBool])
      ]);

      return res.status(201).json({ message: "Product created successfully!", productId });
    } catch (error) {
      console.error("[addProduct] Error: ", error);
      if (req.files && req.files.length > 0) {
        this._deletePhysicalFiles(req.files.map(f => f.filename));
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  addDescription = async (req, res) => {
    try {
      const productId = req.params.productId;
      const { des } = req.body;

      if (!productId || !des) {
        return res.status(400).json({
          message: "ProductID and description are required",
        });
      }

      const userId = req.user?.id ? parseInt(req.user?.id, 10) : null;
      const product = await query(getProductById, [productId, userId]);

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

  getProductDetails = async (req, res) => {
    try {
      const { productId } = req.params;
      if (!productId || isNaN(parseInt(productId, 10))) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const userId = req.user?.id ? parseInt(req.user?.id) : null;
      const result = await query(getProductDetailsById, [productId, userId]);
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

  filterProducts = async (req, res) => {
    try {
      const keyword = req.query.keyword ? req.query.keyword.trim() : "";

      const categoryParam = req.query.category;
      let category = null;
      if (categoryParam) {
        if (Array.isArray(categoryParam)) {
          category = categoryParam.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
        } else if (typeof categoryParam === 'string') {
          if (categoryParam.includes(',')) {
            category = categoryParam.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
          } else {
            category = [parseInt(categoryParam, 10)].filter(id => !isNaN(id));
          }
        }
        if (category && category.length === 0) category = null;
      }

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

      const excludeId = req.query.excludeId ? parseInt(req.query.excludeId, 10) : null;

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
        excludeId
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

  askQuestion = async (req, res) => {
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
      const productUrl = `https://${process.env.FRONT_HOST}/products/${productId}`;

      await sendQuestionAskedEmail(seller_email, product_name, user_name, trimmedQuestion, productUrl);

      return res.status(201).json({ message: "Question asked successfully" });
    } catch (error) {
      console.error("Error when asking question", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  answerQuestion = async (req, res) => {
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
      const productUrl = `https://${process.env.FRONT_HOST}/products/${productId}`;

      await sendQuestionAnsweredEmail(asker_email, product_name, trimmedAnswer, productUrl);

      return res.status(200).json({ message: "Question answered successfully" });
    } catch (error) {
      console.error("Error when answering question", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  askToBid = async (req, res) => {
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
        const productUrl = `https://${process.env.FRONT_HOST}/products/${productId}`;

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

  getProductBidRequests = async (req, res) => {
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

  acceptBidRequest = async (req, res) => {
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

  rejectBidRequest = async (req, res) => {
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

  // --- START: Helpers for placeBid ---

  _checkBidPermissions = (data, userId) => {

    if (data.product_state !== "bidding" || new Date() > new Date(data.expired_at)) return "Bidding is closed for this product";
    if (data.user_id === data.seller) return "Sellers cannot bid on their own products";

    // Check if bidder is refused
    if (data.is_refused) return "You have been refused from bidding on this product";

    const isNew = parseInt(data.rating_count, 10) === 0;
    const hasLowRating = parseFloat(data.user_rating) < 0.8;

    // Check if user needs permission (either new user OR low rating user)
    if ((isNew || hasLowRating) && !data.bid_permission) {
      if (isNew) {
        return "New users with 0 ratings need permission to bid on this product";
      } else {
        return "User rating too low to place a bid without approval";
      }
    }

    return null;
  }

  _processManualBid = async (res, userId, productId, amount, instP, minNext, data, productUrl, notifyList, userEmail) => {

    if (instP > 0 && amount >= instP) {
      const result = await query(handleInstantBuyQuery, [userId, productId, amount]);
      if (result.rowCount === 0) return res.status(409).json({ message: "Product was just sold to someone else" });
      this._notifySuccess(userEmail, data.product_name, amount, productUrl, notifyList, true);
      return res.status(200).json({ message: "Instant buy successful!" });
    }

    const leaderResult = await query(getCurrentLeaderBid, [productId]);
    const leader = leaderResult.rows[0];
    if (leader && leader.bidder_id !== userId && amount <= parseFloat(leader.bid_price)) {
      return res.status(409).json({ message: `Someone else bid higher. Current: ${parseFloat(leader.bid_price).toFixed(0)}` });
    }

    const topAuto = (await query(getTopAutoBidsForProduct, [productId])).rows[0];
    if (topAuto && topAuto.bidder !== userId && amount <= parseFloat(topAuto.max_price)) {
      const outbidPrice = Math.min(amount + parseFloat(data.step_price), parseFloat(topAuto.max_price));
      await query(insertBidRecord, [userId, productId, amount]);
      await this._finalizeBid(topAuto.bidder, productId, outbidPrice, parseFloat(topAuto.max_price));
      this._notifySuccess(userEmail, data.product_name, amount, productUrl, [], false);
      this._notifySuccess(topAuto.bidder_email, data.product_name, outbidPrice, productUrl, notifyList, false);
      return res.status(201).json({ message: "Outbid by auto-bidding", currentPrice: outbidPrice, isWinning: false });
    }

    await this._finalizeBid(userId, productId, amount, null);
    this._notifySuccess(userEmail, data.product_name, amount, productUrl, notifyList, false);
    return res.status(201).json({ message: "Bid placed successfully", currentPrice: amount, isWinning: true });
  }

  _processAutoBid = async (res, userId, productId, maxPrice, currP, stepP, minNext, data, productUrl, notifyList, userEmail) => {

    const leader = (await query(getCurrentLeaderBid, [productId])).rows[0];
    const leaderId = leader ? parseInt(leader.bidder_id, 10) : null;
    const leaderPrice = leader ? parseFloat(leader.bid_price) : currP;

    await query(upsertAutoBid, [productId, userId, maxPrice]);
    if (leaderId === userId) return res.status(200).json({ message: "Auto-bid updated. Still leading.", currentPrice: leaderPrice, isWinning: true });

    const topBids = (await query(getTopAutoBidsForProduct, [productId])).rows;
    const [first, second] = topBids;
    const m1 = parseFloat(first.max_price), m2 = second ? parseFloat(second.max_price) : 0;
    const winnerId = first.bidder;
    const winnerMax = m1;
    const finalPrice = Math.max(minNext, topBids.length > 1 ? (m1 > m2 ? Math.min(m2 + stepP, m1) : m1) : (leaderPrice + stepP));

    if (topBids.length > 1) {
      // Insert runner-up bid (so both auto-bidders have bid records), then winner's bid
      const runner = second;
      const runnerId = runner.bidder;
      const runnerMax = m2;
      const runnerPrice = Math.max(minNext, Math.min(runnerMax, finalPrice - stepP));

      // runner's bid record (does not update product current_price yet)
      await query(insertBidRecord, [runnerId, productId, runnerPrice]);

      // winner's bid record and update product price
      await query(insertBidRecord, [winnerId, productId, finalPrice]);
      await query(updateProductPrice, [finalPrice, productId]);

      this._notifySuccess(winnerId === userId ? userEmail : first.bidder_email, data.product_name, finalPrice, productUrl, notifyList, false);

      return res.status(winnerId === userId ? 201 : 200).json({
        message: winnerId === userId ? "Auto-bid active. You win!" : "Outbid by higher auto-bid",
        currentPrice: finalPrice,
        isWinning: winnerId === userId
      });
    }

    // single auto-bidder case
    await this._finalizeBid(winnerId, productId, finalPrice, winnerId === userId ? maxPrice : winnerMax);
    this._notifySuccess(winnerId === userId ? userEmail : first.bidder_email, data.product_name, finalPrice, productUrl, notifyList, false);

    return res.status(winnerId === userId ? 201 : 200).json({
      message: winnerId === userId ? "Auto-bid active. You win!" : "Outbid by higher auto-bid",
      currentPrice: finalPrice,
      isWinning: winnerId === userId
    });
  }

  _finalizeBid = async (bidderId, productId, price) => {

    await query(insertBidRecord, [bidderId, productId, price]);
    await query(updateProductPrice, [price, productId]);
  }

  _notifySuccess = (winnerEmail, productName, price, url, others, isInstant) => {

    const [sendWinner, sendOthers] = isInstant ? [sendSuccessfullyInstantBuyEmail, sendInstantBuyEmail] : [sendBidSuccessfullyEmail, sendPriceUpdateEmail];
    sendWinner(winnerEmail, productName, price, url).catch(e => console.error("Email error:", e));
    others.forEach(email => sendOthers(email, productName, price, winnerEmail, url).catch(e => console.error("Email error:", e)));
  }

  _getBidCheckQuery = () => {

    return `
      SELECT u.id as user_id, u.email as user_email, u.rating as user_rating,
             p.id as product_id, p.name as product_name, p.current_price, p.state as product_state,
             sp.step_price, sp.instant_price, sp.seller, sp.expired_at,
             seller_user.email as seller_email,
             (SELECT COUNT(*) FROM reviews WHERE ratee = u.id) as rating_count,
             (SELECT 1 FROM allowed_bidder ab WHERE ab.bidder = u.id AND ab.product = p.id LIMIT 1) as bid_permission,
             (SELECT 1 FROM refuse r WHERE r.buyer = u.id AND r.product = p.id LIMIT 1) as is_refused,
             (SELECT b.email FROM bids b2 JOIN users b ON b2.buyer = b.id WHERE b2.product = p.id ORDER BY b2.price DESC, b2.bid_date ASC LIMIT 1) as prev_bidder_email
      FROM users u CROSS JOIN products p
      LEFT JOIN sell_product sp ON sp.product = p.id
      LEFT JOIN users seller_user ON seller_user.id = sp.seller
      WHERE u.id = $1 AND p.id = $2`;
  }

  // --- END: Helpers for placeBid ---

  placeBid = async (req, res) => {

    try {
      const { productId } = req.params;
      const { id: userId, email: userEmail } = req.user;
      const { bidAmount, maxPrice: autoMax } = req.body;

      const amount = bidAmount ? parseFloat(bidAmount) : null;
      const maxPrice = autoMax ? parseFloat(autoMax) : null;

      if (!amount === !maxPrice) return res.status(400).json({ message: "Provide either bidAmount OR maxPrice" });
      if (isNaN(amount || maxPrice) || (amount || maxPrice) <= 0) return res.status(400).json({ message: "Invalid amount" });

      const checkResult = await query(this._getBidCheckQuery(), [userId, productId]);
      const data = checkResult.rows[0];
      if (!data) return res.status(404).json({ message: "User or product not found" });

      const permissionError = this._checkBidPermissions(data, userId);
      if (permissionError) return res.status(403).json({ message: permissionError });

      const [currP, stepP, instP] = [data.current_price, data.step_price, data.instant_price || 0].map(parseFloat);
      const minNext = currP + stepP;
      if ((amount || maxPrice) < minNext) return res.status(400).json({ message: `Minimum bid is ${minNext.toFixed(0)}` });

      const productUrl = `https://${process.env.FRONT_HOST}/products/${productId}`;
      const notifyList = [data.seller_email, data.prev_bidder_email && data.prev_bidder_email !== userEmail && data.prev_bidder_email].filter(Boolean);

      if (amount) return this._processManualBid(res, userId, productId, amount, instP, minNext, data, productUrl, notifyList, userEmail);
      return this._processAutoBid(res, userId, productId, maxPrice, currP, stepP, minNext, data, productUrl, notifyList, userEmail);
    } catch (error) {
      console.error("Error placing bid:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  updateProduct = async (req, res) => {
    try {
      const { productId } = req.params;
      const userId = req.user.id;
      const { name, init_price, step_price, instant_price, start_at, expired_at, description, isExtent, category: categoryParam, categories: categoriesParam, coverImageIndex } = req.body;
      const files = req.files;

      // Handle both single category (old) and multiple categories (new)
      let categoryIds = [];
      if (categoriesParam) {
        try {
          categoryIds = JSON.parse(categoriesParam);
        } catch (e) {
          categoryIds = [categoriesParam];
        }
      } else if (categoryParam) {
        categoryIds = [categoryParam];
      }

      // Remove duplicates and convert to integers
      categoryIds = [...new Set(categoryIds)].map(id => parseInt(id, 10)).filter(id => !isNaN(id));

      if (categoryIds.length === 0) {
        if (files && files.length > 0) this._deletePhysicalFiles(files.map(f => f.filename));
        return res.status(400).json({
          message: "At least one category is required"
        });
      }

      const check = await query(`
        SELECT sp.seller, p.image, p.state
        FROM sell_product sp 
        JOIN products p ON p.id = sp.product 
        WHERE sp.product = $1
      `, [productId]);

      if (check.rows.length === 0 || check.rows[0].seller !== userId) {
        if (files && files.length > 0) this._deletePhysicalFiles(files.map(f => f.filename));
        return res.status(403).json({ message: "Unauthorized." });
      }

      // Get old images for cleanup later
      const oldImagesResult = await query(getProductImagesById, [productId]);
      const oldImages = oldImagesResult.rows[0]?.image_path || [];
      const allOldFiles = [...new Set([...oldImages, check.rows[0].image])].filter(Boolean);

      const currentProduct = check.rows[0];
      const init_price_num = parseFloat(init_price);
      const step_price_num = parseFloat(step_price);
      const isExtentBool = isExtent === 'true' || isExtent === true;

      // Determine state
      const now = new Date();
      const startDate = new Date(start_at);
      const endDate = new Date(expired_at);

      let state = currentProduct.state;
      // Only recalculate state if it's currently in a non-terminal state
      if (state === 'incoming' || state === 'bidding') {
        if (now < startDate) {
          state = 'incoming';
        } else if (now < endDate) {
          state = 'bidding';
        } else {
          // If it expired, it should be closed. We'll set to bidding for now if it was active, 
          // but better to let the cron handle closure or mark as failed if no bids.
          state = currentProduct.state;
        }
      }

      let coverImage = currentProduct.image;

      // Parse images order if provided
      let finalImageFilenames = [];
      if (req.body.imagesOrder) {
        try {
          const order = JSON.parse(req.body.imagesOrder);
          let nextFileIdx = 0;

          finalImageFilenames = order.map(item => {
            if (item === 'new') {
              const file = files[nextFileIdx++];
              return file ? file.filename : null;
            } else if (item.startsWith('existing:')) {
              return item.substring(9);
            }
            return null;
          }).filter(Boolean);
        } catch (e) {
          console.error("Error parsing imagesOrder:", e);
          finalImageFilenames = files.map(f => f.filename);
        }
      } else if (files && files.length > 0) {
        finalImageFilenames = files.map(file => file.filename);
      }

      if (finalImageFilenames.length > 0) {
        const coverIdx = parseInt(coverImageIndex, 10) || 0;
        coverImage = finalImageFilenames[coverIdx] || finalImageFilenames[0];

        // Store all images in product_images (including cover) to satisfy CHECK constraint >= 3
        // Cover is also stored separately in products.image for quick thumbnail access
        await query(`UPDATE product_images SET image_path = $1 WHERE product = $2`, [finalImageFilenames, productId]);
      }

      const updatePromises = [
        query(updateProductById, [name, init_price_num, coverImage, state, productId]),
        query(updateSellProductById, [init_price_num, step_price_num, instant_price ? parseFloat(instant_price) : null, start_at, expired_at, isExtentBool, productId])
      ];

      // Only update description if a new description is provided
      if (description && description.trim()) {
        updatePromises.push(
          query(`UPDATE product_descriptions SET description = $1 WHERE product = $2`, [description, productId])
        );
      }

      await Promise.all(updatePromises);

      // Update categories separately to avoid race condition
      await query(`DELETE FROM product_categories WHERE product = $1`, [productId]);
      await Promise.all(categoryIds.map(catId => query(createProductCategory, [productId, catId])));

      // Cleanup orphaned files
      if (finalImageFilenames.length > 0) {
        const orphans = allOldFiles.filter(oldFile => !finalImageFilenames.includes(oldFile));
        this._deletePhysicalFiles(orphans);
      }

      return res.status(200).json({ message: "Product updated successfully!" });
    } catch (error) {
      console.error("[updateProduct] Error: ", error);
      if (req.files && req.files.length > 0) {
        this._deletePhysicalFiles(req.files.map(f => f.filename));
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  closeAuction = async (req, res) => {
    try {
      const { productId } = req.params;
      const userId = req.user.id;

      const check = await query(`SELECT seller FROM sell_product WHERE product = $1`, [productId]);
      if (check.rows.length === 0 || check.rows[0].seller !== userId) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      await query(updateProductStateById, ['sold', productId]);
      await query(closeSellProductById, [productId]);

      return res.status(200).json({ message: "Auction closed successfully!" });
    } catch (error) {
      console.error("[closeAuction] Error: ", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  deleteProduct = async (req, res) => {
    try {
      const { productId } = req.params;
      const userId = req.user.id;

      const check = await query(`SELECT seller FROM sell_product WHERE product = $1`, [productId]);
      if (check.rows.length === 0 || check.rows[0].seller !== userId) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      const bidCheck = await query(`SELECT COUNT(*) FROM bids WHERE product = $1`, [productId]);
      if (parseInt(bidCheck.rows[0].count) > 0) {
        return res.status(400).json({ message: "Cannot delete product that has bids." });
      }

      // Get image list for cleanup
      const oldImagesResult = await query(getProductImagesById, [productId]);
      const oldImages = oldImagesResult.rows[0]?.image_path || [];
      const coverImageResult = await query(`SELECT image FROM products WHERE id = $1`, [productId]);
      const coverImage = coverImageResult.rows[0]?.image;
      const allFiles = [...new Set([...oldImages, coverImage])].filter(Boolean);

      await query(deleteProductById, [productId]);

      // Cleanup physical files
      this._deletePhysicalFiles(allFiles);

      return res.status(200).json({ message: "Product deleted successfully!" });
    } catch (error) {
      console.error("[deleteProduct] Error: ", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  getProductBidders = async (req, res) => {
    try {
      const { productId } = req.params;
      const userId = req.user.id;

      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
      const offset = (page - 1) * limit;

      // Check if user is the seller of this product
      const sellerCheck = await query(
        `SELECT seller FROM sell_product WHERE product = $1`,
        [productId]
      );

      if (sellerCheck.rows.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (sellerCheck.rows[0].seller !== parseInt(userId, 10)) {
        return res.status(403).json({ message: "Only the seller can view bidders for their products" });
      }

      const { rows } = await query(getProductBidders, [productId, limit, offset]);

      const totalItems = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
      const totalPages = Math.ceil(totalItems / limit);

      const bidders = rows.map((item) => {
        const { total_count, ...bidderData } = item;
        return bidderData;
      });

      return res.status(200).json({
        message: "Product bidders retrieved successfully",
        data: {
          bidders,
          pagination: {
            page,
            limit,
            totalItems,
            totalPages,
          },
        },
      });
    } catch (error) {
      console.error("Error when getting product bidders", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  refuseBidder = async (req, res) => {
    try {
      const { productId, bidderId } = req.params;
      const userId = req.user.id;

      // Check if user is the seller of this product
      const sellerCheck = await query(
        `SELECT sp.seller, p.name as product_name, p.current_price, p.state as product_state
         FROM sell_product sp
         JOIN products p ON p.id = sp.product
         WHERE sp.product = $1`,
        [productId]
      );

      if (sellerCheck.rows.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      const productData = sellerCheck.rows[0];

      if (productData.seller !== parseInt(userId, 10)) {
        return res.status(403).json({ message: "Only the seller can refuse bidders for their products" });
      }

      if (productData.product_state !== "bidding") {
        return res.status(400).json({ message: "Cannot refuse bidders for products that are not currently bidding" });
      }

      // Check if bidder exists
      const bidderCheck = await query(
        `SELECT id, name, email FROM users WHERE id = $1`,
        [bidderId]
      );

      if (bidderCheck.rows.length === 0) {
        return res.status(404).json({ message: "Bidder not found" });
      }

      // Refuse the bidder
      const result = await query(refuseBidderQuery, [productId, bidderId]);
      const deleteResult = result.rows[0];

      // Check if we need to update the current_price (if the refused bidder had the highest bid)
      const newHighestBid = await query(
        `SELECT MAX(price) as max_price FROM bids WHERE product = $1`,
        [productId]
      );

      if (newHighestBid.rows[0].max_price) {
        await query(
          `UPDATE products SET current_price = $1 WHERE id = $2`,
          [newHighestBid.rows[0].max_price, productId]
        );
      } else {
        // No bids left, reset to init_price
        const initPrice = await query(
          `SELECT init_price FROM sell_product WHERE product = $1`,
          [productId]
        );
        if (initPrice.rows.length > 0) {
          await query(
            `UPDATE products SET current_price = $1 WHERE id = $2`,
            [initPrice.rows[0].init_price, productId]
          );
        }
      }

      return res.status(200).json({
        message: "Bidder refused successfully",
        data: {
          deleted_bids: parseInt(deleteResult.deleted_bids_count, 10),
          deleted_auto_bids: parseInt(deleteResult.deleted_auto_bids_count, 10)
        }
      });
    } catch (error) {
      console.error("Error when refusing bidder", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  unrefuseBidder = async (req, res) => {
    try {
      const { productId, bidderId } = req.params;
      const userId = req.user.id;

      // Check if user is the seller of this product
      const sellerCheck = await query(
        `SELECT sp.seller, p.state as product_state
         FROM sell_product sp
         JOIN products p ON p.id = sp.product
         WHERE sp.product = $1`,
        [productId]
      );

      if (sellerCheck.rows.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      const productData = sellerCheck.rows[0];

      if (productData.seller !== parseInt(userId, 10)) {
        return res.status(403).json({ message: "Only the seller can unrefuse bidders for their products" });
      }

      // Check if bidder is actually refused
      const refuseCheck = await query(
        `SELECT 1 FROM refuse WHERE product = $1 AND buyer = $2`,
        [productId, bidderId]
      );

      if (refuseCheck.rows.length === 0) {
        return res.status(400).json({ message: "Bidder is not refused" });
      }

      // Unrefuse the bidder
      await query(unrefuseBidderQuery, [productId, bidderId]);

      return res.status(200).json({
        message: "Bidder unrefused successfully"
      });
    } catch (error) {
      console.error("Error when unrefusing bidder", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}


const productController = new ProductController();

export default productController;
