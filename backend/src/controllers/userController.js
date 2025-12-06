import {
  getUserById,
  updateUserInformationById,
  getFavoritesQuery,
  getProductById,
  markFavoriteProduct,
  unmarkFavoriteProduct,
  getFavoriteByUserAndProduct,
} from "../libs/sqlQuery.js";
import query from "../libs/db.js";
import crypto from "crypto";
import { sendOTPEmail } from "../utils/emailService.js";

const otpStore = new Map();

class UserController {
  async updateUser(req, res) {
    try {
      const userId = req.params.userId;
      const { name, email, birthdate } = req.body;

      if (!name || !email || !birthdate) {
        return res
          .status(400)
          .json({ error: "Name, email, and birthdate are required." });
      }

      const user = await query(getUserById, [userId]);
      if (user.rows.length === 0) {
        return res.status(404).json({ error: "User not found." });
      }

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

      // If email changed, require OTP verification
      if (user.rows[0].email !== email) {
        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiredAt = Date.now() + 10 * 60 * 1000;

        // Store OTP with user data in memory
        otpStore.set(email, { otp, expiredAt, name, birthdate });

        // Send OTP email
        await sendOTPEmail(email, otp);
        return res.status(200).json({
          message: "OTP sent to email. Please verify to complete registration.",
          email,
        });
      }

      const updatedUser = await query(updateUserInformationById, [
        name,
        email,
        birthdate,
        userId,
      ]);

      return res.status(201).json({
        message: "Update user information successfully!",
        updatedUser,
      });
    } catch (error) {
      console.error("Error when update user information!", error);
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
      const { name, birthdate } = otpRecord;
      const updatedUser = await query(updateUserInformationById, [
        name,
        email,
        birthdate,
        userId,
      ]);

      return res.status(200).json({
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

      const { rows } = await query(sqlQuery, [userId, category, limit, offset]);

      const totalItems =
        rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
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
}

const userController = new UserController();
export default userController;
