import query from "../libs/db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  getUserByEmail,
  createSession,
  getSessionByRefreshToken,
  createUser,
  deleteSessionByRefreshToken,
} from "../libs/sqlQuery.js";
import axios from "axios";
import { sendOTPEmail } from "../utils/emailService.js";

const otpStore = new Map();
const resetPasswordOtpStore = new Map();

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 7 * 1000;

async function verifyCaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET;
  try {
    const res = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: secret,
          response: token,
        },
      }
    );
  
    return res.data.success;    
  } catch (error) {
    console.error("Captcha Verification Error: ", error);
    return false;
  }
}

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      // Validate input
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }
      // Query the database to find the user
      const result = await query(getUserByEmail, [email]);
      const user = result.rows[0];
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      // Verify password here (e.g., using bcrypt)
      const isPass = await bcrypt.compare(password, user.hashed_password);

      if (!isPass) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      // If login is successful, you can generate a token or set a session here
      const accessToken = jwt.sign(
        { userId: user.id },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: ACCESS_TOKEN_TTL,
        }
      );

      //Create refresh token
      const refreshToken = crypto.randomBytes(64).toString("hex");

      //Create session in database
      await query(createSession, [
        user.id,
        refreshToken,
        new Date(Date.now() + REFRESH_TOKEN_TTL),
      ]);

      //Return refreshToken through cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: REFRESH_TOKEN_TTL,
      });

      res
        .status(200)
        .json({ message: `User ${user.name} login successful`, accessToken });
    } catch (error) {
      console.error("Login Error: ", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async logout(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken) {
        // Delete refresh token in session
        await query(deleteSessionByRefreshToken, [refreshToken]);
        res.clearCookie("refreshToken", {
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });
      }

      return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      console.error("Logout Error: ", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      // Check if there is refresh token
      if (!refreshToken) {
        return res
          .status(403)
          .json({ message: "Refresh token is not exist!!" });
      }

      // Find refresh token in database
      const session = await query(getSessionByRefreshToken, [refreshToken]);

      // Check if refresh token is valid
      if (!session) {
        return res
          .status(401)
          .json({ message: "Refresh token is expired or invalid!" });
      }

      // Check expiredAt of refresh token to ensure it's not expired
      if (session.expiredAt < new Date()) {
        return res.status(403).json({ message: "Refresh token is expired" });
      }

      // Create new access token
      const accessToken = jwt.sign(
        { userId: session.userId },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: ACCESS_TOKEN_TTL,
        }
      );

      return res.status(200).json({ accessToken });
    } catch (error) {
      console.error("Refresh Error: ", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // Step 1: Register info & send first OTP
  async register(req, res) {
    try {
      const { email, name, password, birthdate, address, captchaToken } = req.body;

      if (!email || !name || !password || !birthdate || !address) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Verify captcha
      if (!captchaToken) {
        return res.status(400).json({ message: "Captcha is required" });
      }
      const isCaptchaValid = await verifyCaptcha(captchaToken);
      if (!isCaptchaValid) {
        return res.status(400).json({ message: "Invalid captcha" });
      }

      // Check if email already registered
      const isExistingUser = await query(getUserByEmail, [email]);
      if (isExistingUser.rows.length > 0) {
        return res.status(409).json({ message: "Email is already registered" });
      }

      // Generate OTP
      const otp = crypto.randomInt(100000, 999999).toString();
      const expiredAt = Date.now() + 60 * 1000;

      // Store OTP and user data in memory
      otpStore.set(email, {
        otp,
        expiredAt,
        name,
        password,
        birthdate,
        address,
      });

      // Auto remove OTP record after it is expired
      const delay = Math.max(expiredAt - Date.now(), 0);
      setTimeout(() => {
        const record = otpStore.get(email);
        if (record && record.expiredAt <= Date.now()) {
          otpStore.delete(email);
        }
      }, delay);

      // Send OTP email
      await sendOTPEmail(email, otp);

      return res.status(200).json({
        message: "OTP sent to email",
      });
    } catch (error) {
      console.error("Register Error: ", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // Step 1b: Resend OTP (only need email, update existing otpRecord)
  async sendOTP(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if otpRecord exists
      const existingRecord = otpStore.get(email);
      if (!existingRecord) {
        return res.status(400).json({ 
          message: "No registration found for this email. Please register first." 
        });
      }

      // Generate new OTP
      const otp = crypto.randomInt(100000, 999999).toString();
      const expiredAt = Date.now() + 60 * 1000;

      // Update OTP in existing record (keep user data, only update OTP and expiredAt)
      otpStore.set(email, {
        ...existingRecord,
        otp,
        expiredAt,
      });

      // Auto remove OTP record after it is expired
      const delay = Math.max(expiredAt - Date.now(), 0);
      setTimeout(() => {
        const record = otpStore.get(email);
        if (record && record.expiredAt <= Date.now()) {
          otpStore.delete(email);
        }
      }, delay);

      // Send new OTP email
      await sendOTPEmail(email, otp);

      return res.status(200).json({
        message: "OTP resent to email",
      });
    } catch (error) {
      console.error("Send OTP Error: ", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // Step 2: Verify OTP and create account
  async verifyOTP(req, res) {
    try {
      const { email, otp: requestOTP } = req.body;

      // Validate input
      if (!email || !requestOTP) {
        return res.status(400).json({
          message: "Email and OTP are required",
        });
      }

      // Get OTP from memory
      const otpRecord = otpStore.get(email);

      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      const { expiredAt, otp, name, password, birthdate, address } = otpRecord;

      // Check if OTP is expired
      if (Date.now() > expiredAt) {
        otpStore.delete(email);
        return res.status(400).json({ message: "OTP has expired" });
      }

      // Verify OTP
      if (otp !== requestOTP) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      // Remove OTP from memory
      otpStore.delete(email);

      // Create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const formattedBirthdate = new Date(birthdate);

      const result = await query(createUser, [
        name,
        email,
        hashedPassword,
        formattedBirthdate,
        address,
        'bidder',
        0,
      ]);
      const newUser = result.rows[0];

      return res.status(201).json({
        message: "User registered successfully",
        user: newUser,
      });
    } catch (error) {
      console.error("Register Error: ", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if user exists
      const result = await query(getUserByEmail, [email]);
      const user = result.rows[0];

      if (!user) {
        return res.status(404).json({ message: "Email not found" });
      }

      // Generate OTP
      const otp = crypto.randomInt(100000, 999999).toString();
      const expiredAt = Date.now() + 10 * 60 * 1000;

      // Store OTP in memory
      resetPasswordOtpStore.set(email, { otp, expiredAt });

      // Send OTP email
      await sendOTPEmail(email, otp);

      return res.status(200).json({
        message: "OTP sent to email. Please verify to reset password.",
        email,
      });
    } catch (error) {
      console.error("Forgot Password Error: ", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email, otp, newPassword, confirmPassword } = req.body;

      if (!email || !otp || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      // Get OTP from memory
      const otpRecord = resetPasswordOtpStore.get(email);

      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // Check if OTP is expired
      if (Date.now() > otpRecord.expiredAt) {
        resetPasswordOtpStore.delete(email);
        return res.status(400).json({ message: "OTP has expired" });
      }

      // Verify OTP
      if (otpRecord.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      // Remove OTP from memory
      resetPasswordOtpStore.delete(email);

      // Update password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await query("UPDATE users SET hashed_password = $1 WHERE email = $2", [
        hashedPassword,
        email,
      ]);

      return res.status(200).json({
        message: "Password reset successfully",
      });
    } catch (error) {
      console.error("Reset Password Error: ", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

const authController = new AuthController();
export default authController;
