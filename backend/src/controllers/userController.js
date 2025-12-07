import {
  getUserById,
  updateUserInformationById,
  getFavoritesQuery,
  getProductById,
  markFavoriteProduct,
  unmarkFavoriteProduct,
  getFavoriteByUserAndProduct,
  updateUserPasswordById,
  getRatingsByUserId,
  getBiddingsByUserId,
  getSellingsByUserId,
  getWonsByUserId,
  getRatingByUserIdAndProductId,
  createRating,
} from "../libs/sqlQuery.js";
import query from "../libs/db.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { sendOTPEmail } from "../utils/emailService.js";
import { get } from "http";

const otpStore = new Map();

class UserController {
  async getUser(req, res) {
    try {
      const userId = req.params.userId;
      const result = await query(getUserById, [userId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found." });
      }

      const user = result.rows[0];

      return res.status(200).json({
        message: "User retrieved successfully!",
        data: { user },
      });
    } catch (error) {
      console.error("Error when get user profile!", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  async updateUser(req, res) {
    try {
        const userId = req.params.userId;
        const user = await query(getUserById, [userId]);
        if (user.rows.length === 0) {
          return res.status(404).json({ error: "User not found." });
        }

        const { name, email, address, birthdate } = req.body;
    
        // Validate birthdate (must be 18+)
        const birthDate = new Date(birthdate);
        const age = Math.floor(
          (Date.now() - birthDate) / (365.25 * 24 * 60 * 60 * 1000)
        );
        if (age < 18) {
          return res
            .status(400)
            .json({ error: "User must be at least 18 years old." });
        }
    
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ error: "Invalid email format." });
        }

        // Validate address format
        const addressRegex = /^[a-zA-Z0-9\s,.'-]{3,}$/;
        if (!addressRegex.test(address)) {  
          return res.status(400).json({ error: "Invalid address format." });
        }

        // If email changed, require OTP verification
        if (user.rows[0].email !== email) {
          // Generate OTP
          const otp = crypto.randomInt(100000, 999999).toString();
          const expiredAt = Date.now() + 10 * 60 * 1000;
    
          // Store OTP with user data in memory
          otpStore.set(email, { otp, expiredAt, name, birthdate, address });
    
          // Send OTP email
          await sendOTPEmail(email, otp);
          return res.status(200).json({
              message: "OTP sent to email. Please verify to complete registration.",
              email,
          });
        }

        const updatedUser = await query(updateUserInformationById, [name, email, birthdate, address, userId]);

        return res.status(201).json({ message: "Update user profile successfully!", updatedUser });
    } catch (error) {
        console.error("Error when update user profile!", error);
        return res.status(500).json({ error: "Internal server error." });
    }
  }

  async verifyOTP(req, res) {
    try {
      const userId = req.params.userId;
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
      }

      // Get OTP from memory
      const otpRecord = otpStore.get(email);

      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // Check if OTP is expired
      if (Date.now() > otpRecord.expiredAt) {
        otpStore.delete(email);
        return res.status(400).json({ message: "OTP has expired" });
      }

      // Verify OTP
      if (otpRecord.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      // Remove OTP from memory
      otpStore.delete(email);

      // Update user information using stored data
      const { name, birthdate, address } = otpRecord;
      const updatedUser = await query(updateUserInformationById, [name, email, birthdate, address, userId]);

      return res
        .status(200)
        .json({
          message: "Update user information successfully!",
          updatedUser,
        });
    } catch (error) {
      console.error("Error when verify email!", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  async markFavorite(req, res) {
    try {
      const userId = req.params.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const productId = req.params.productId;
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }

      // Check if product exists
      const product = await query(getProductById, [productId]);
      if (product.rows.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Check if product is already marked as favorite
      const alreadyFavorited = await query(getFavoriteByUserAndProduct, [
        userId,
        productId,
      ]);
      if (alreadyFavorited.rows.length > 0) {
        return res
          .status(409)
          .json({ message: "Product is already marked as favorite" });
      }

      await query(markFavoriteProduct, [userId, productId]);

      return res.status(201).json({
        message: "Product marked as favorite successfully!",
        productId,
      });
    } catch (error) {
      console.error("Error when mark favorite", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async unmarkFavorite(req, res) {
    try {
      const userId = req.params.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const productId = req.params.productId;
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }

      // Check if product is already marked as favorite
      const existing = await query(getFavoriteByUserAndProduct, [
        userId,
        productId,
      ]);
      if (existing.rows.length === 0) {
        return res.status(409).json({ message: "Product is not in favorites" });
      }

      await query(unmarkFavoriteProduct, [userId, productId]);

      return res.status(200).json({
        message: "Product removed from favorites successfully!",
        productId,
      });
    } catch (error) {
      console.error("Error when unmark favorite", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getFavorites(req, res) {
    try {
      const userId = req.params.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const keyword = req.query.keyword ? req.query.keyword.trim() : "";

      const category = req.query.category ? parseInt(req.query.category, 10) : null;
      
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
      const offset = (page - 1) * limit;

      const startDate = req.query.startDate && req.query.startDate !== "" ? req.query.startDate : null;
      const endDate = req.query.endDate && req.query.endDate !== "" ? req.query.endDate : null;

      const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
      const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;

      const states = req.query.states
        ? req.query.states.split(",").map(s => s.trim()).filter(s => s !== "") 
        : null;
      const finalStates = (states && states.length > 0) ? states : null;

      const SORT_MAPPING = {
        price_asc: "p.current_price ASC",
        price_desc: "p.current_price DESC",
        time_left_asc: "sp.expired_at ASC",
        time_left_desc: "sp.expired_at DESC",
        newest: "sp.created_at DESC",
        recently_favorited: "f.created_at DESC",
      };

      let sortCriteria = req.query.sort || "recently_favorited";

      const orderBySql =
        sortCriteria
          .split(",")
          .map((key) => SORT_MAPPING[key.trim()])
          .filter(Boolean)
          .join(", ") || "f.created_at DESC";

      const sqlQuery = getFavoritesQuery(orderBySql);

      const { rows } = await query(sqlQuery, [
        userId,
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
        message: "Favorites retrieved successfully",
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
      console.error("Error when get favorites", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async changePassword(req, res) {
    try {
      const userId = req.params.userId;
      const { oldPassword, newPassword, confirmPassword } = req.body;

      if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Get user from database
      const user = await query(getUserById, [userId]);
      if (user.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify old password
      const isValidPassword = await bcrypt.compare(
        oldPassword,
        user.rows[0].hashed_password
      );
      if (!isValidPassword) {
        return res.status(401).json({ message: "Old password is incorrect" });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      // Update password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await query(updateUserPasswordById, [hashedPassword, userId]);

      return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Change Password Error: ", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  async getRatings(req, res) {
    try {
      const userId = req.params.userId;
      const result = await query(getUserById, [userId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
      const offset = (page - 1) * limit;

      const SORT_MAPPING = {
        oldest: "r.created_at ASC",
        newest: "r.created_at DESC",
      };

      let sortCriteria = req.query.sort || "newest";
      const orderBySql =
        sortCriteria
          .split(",")
          .map((key) => SORT_MAPPING[key.trim()])
          .filter(Boolean)
          .join(", ") || "r.created_at DESC";

      const sqlQuery = getRatingsByUserId(orderBySql);

      const { rows } = await query(sqlQuery, [userId, limit, offset]);

      const totalItems = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
      const totalPages = Math.ceil(totalItems / limit);

      const ratings = rows.map((item) => {
        const { total_count, ...ratingData } = item;
        return ratingData;
      });

      return res.status(200).json({
        message: "Ratings retrieved successfully",
        data: { 
          ratings, 
          pagination: { 
            page, 
            limit, 
            totalItems, 
            totalPages 
          },
        },
      });
    } catch (error) {
      console.error("Error when get ratings", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getBiddings(req, res) {
    try {
      const userId = req.params.userId;
      const result = await query(getUserById, [userId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const keyword = req.query.keyword ? req.query.keyword.trim() : "";

      const category = req.query.category ? parseInt(req.query.category, 10) : null;
      
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
      const offset = (page - 1) * limit;

      const startDate = req.query.startDate && req.query.startDate !== "" ? req.query.startDate : null;
      const endDate = req.query.endDate && req.query.endDate !== "" ? req.query.endDate : null;

      const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
      const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;

      const states = req.query.states
        ? req.query.states.split(",").map(s => s.trim()).filter(s => s !== "") 
        : null;
      const finalStates = (states && states.length > 0) ? states : null;

      const SORT_MAPPING = {
        price_asc: "p.current_price ASC",
        price_desc: "p.current_price DESC",
        time_left_asc: "sp.expired_at ASC",
        time_left_desc: "sp.expired_at DESC",
        newest_bid: "b.bid_date DESC",
        oldest_bid: "b.bid_date ASC",
      };

      let sortCriteria = req.query.sort || "newest_bid";

      const orderBySql =
        sortCriteria
          .split(",")
          .map((key) => SORT_MAPPING[key.trim()])
          .filter(Boolean)
          .join(", ") || "b.bid_date DESC";

      const sqlQuery = getBiddingsByUserId(orderBySql);

      const { rows } = await query(sqlQuery, [
        userId,
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
        message: "Biddings retrieved successfully",
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
      console.error("Error when get biddings", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getSellings(req, res) {
    try {
      const userId = req.params.userId;
      const result = await query(getUserById, [userId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const keyword = req.query.keyword ? req.query.keyword.trim() : "";

      const category = req.query.category ? parseInt(req.query.category, 10) : null;
      
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
      const offset = (page - 1) * limit;

      const startDate = req.query.startDate && req.query.startDate !== "" ? req.query.startDate : null;
      const endDate = req.query.endDate && req.query.endDate !== "" ? req.query.endDate : null;

      const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
      const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;

      const states = req.query.states
        ? req.query.states.split(",").map(s => s.trim()).filter(s => s !== "") 
        : null;
      const finalStates = (states && states.length > 0) ? states : null;

      const SORT_MAPPING = {
        price_asc: "p.current_price ASC",
        price_desc: "p.current_price DESC",
        time_left_asc: "sp.expired_at ASC",
        time_left_desc: "sp.expired_at DESC",
        newest_sell: "sp.created_at DESC",
        oldest_sell: "sp.created_at ASC",
        expired_soon: "sp.expired_at ASC",
        expired_late: "sp.expired_at DESC",
      };

      let sortCriteria = req.query.sort || "newest_sell";

      const orderBySql =
        sortCriteria
          .split(",")
          .map((key) => SORT_MAPPING[key.trim()])
          .filter(Boolean)
          .join(", ") || "sp.created_at DESC";

      const sqlQuery = getSellingsByUserId(orderBySql);

      const { rows } = await query(sqlQuery, [
        userId,
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
        message: "Sellings retrieved successfully",
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
      console.error("Error when get sellings", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getWons(req, res) {
    try {
      const userId = req.params.userId;
      const result = await query(getUserById, [userId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const keyword = req.query.keyword ? req.query.keyword.trim() : "";

      const category = req.query.category ? parseInt(req.query.category, 10) : null;
      
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
      const offset = (page - 1) * limit;

      const startDate = req.query.startDate && req.query.startDate !== "" ? req.query.startDate : null;
      const endDate = req.query.endDate && req.query.endDate !== "" ? req.query.endDate : null;

      const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
      const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;

      const states = req.query.states
        ? req.query.states.split(",").map(s => s.trim()).filter(s => s !== "") 
        : null;
      const finalStates = (states && states.length > 0) ? states : null;

      const SORT_MAPPING = {
        price_asc: "p.current_price ASC",
        price_desc: "p.current_price DESC",
        newest_win: "win_time DESC",
        oldest_win: "win_time ASC",
      };

      let sortCriteria = req.query.sort || "newest_win";

      const orderBySql =
        sortCriteria
          .split(",")
          .map((key) => SORT_MAPPING[key.trim()])
          .filter(Boolean)
          .join(", ") || "win_time DESC";

      const sqlQuery = getWonsByUserId(orderBySql);

      const { rows } = await query(sqlQuery, [
        userId,
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
        message: "Wons retrieved successfully",
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
      console.error("Error when get wons", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async rateSeller(req, res) {
    try {
      const userId = req.params.userId;
      const productId = req.params.productId;

      const { point, comment } = req.body;
      if (point !== 0 && point !== 1) {
        return res.status(400).json({ message: "Point must be 0 (dislike) or 1 (like)" });
      }

      const winnerCheck = await query(checkIsWinner, [userId, productId]);
      if (winnerCheck.rows.length === 0) {
        return res.status(403).json({ message: "You are not eligible to rate the seller for this product" });
      }

      const existingRatingResult = await query(getRatingByUserIdAndProductId, [userId, productId]);
      if (existingRatingResult.rows.length > 0) {
        return res.status(409).json({ message: "You have already rated this seller for this product" });
      }

      const isLiked = point === 1;

      await query(createRating, [userId, productId, isLiked, comment]);

      return res.status(201).json({ message: "Seller rated successfully" });
    } catch (error) {
      console.error("Error when rating seller", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

const userController = new UserController();
export default userController;
