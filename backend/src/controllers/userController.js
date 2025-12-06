import { 
  getUserById,
  updateUserInformationById,
  getFavoritesQuery,
  getRatingsQuery,
  getBiddingsQuery,
  getSellingsQuery,
  getWonAuctionsQuery
} from "../libs/sqlQuery.js";
import query from "../libs/db.js";
import crypto from 'crypto';
import { sendOTPEmail } from '../utils/emailService.js';

const otpStore = new Map();

class UserController {
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

      return res.status(200).json({ message: "Update user information successfully!", updatedUser });      
    } catch (error) {
        console.error("Error when verify email!", error);
        return res.status(500).json({ error: "Internal server error." });
    }
  }

  async getUserProfile(req, res) {  
    try {
      const userId = req.params.userId;
      if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await query(getUserById, [userId]);
      if (user.rows.length === 0) {
          return res.status(404).json({ error: "User not found." });
      }

      const ratings = await query(getRatingsQuery, [userId]);
      const ratePoints = ratings.rows;

      const favorites = await query(getFavoritesQuery('ORDER BY f.created_at DESC'), [userId]);
      const biddings = await query(getBiddingsQuery('ORDER BY b.created_at DESC'), [userId]);
      const sellings = await query(getSellingsQuery('ORDER BY sp.created_at DESC'), [userId]);
      const wonAuctions = await query(getWonAuctionsQuery('ORDER BY sp.expired_at DESC'), [userId]);

    } catch (error) {
        console.error("Error when get user profile!", error);
        return res.status(500).json({ error: "Internal server error." });
    }
  }

  async updateUserProfile(req, res) {
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
}

const userController = new UserController();
export default userController;
