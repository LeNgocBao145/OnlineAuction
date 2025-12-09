import query from "../libs/db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  getUserByEmail,
  createSession,
  getSessionByRefreshToken,
  createUser,
  getUserByProviderId,
  createOAuthUser,
} from "../libs/sqlQuery.js";
import axios from "axios";
import { sendOTPEmail } from "../utils/emailService.js";

const otpStore = new Map();

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
  async googleLogin(req, res) {
    const redirectUrl = "https://accounts.google.com/o/oauth2/v2/auth?" +
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        response_type: "code",
        scope: "profile email",
        access_type: "offline",
        prompt: "consent"
      });
    
    return res.redirect(redirectUrl);
  }

  async facebookLogin(req, res) {
    const redirectUrl = "https://www.facebook.com/v12.0/dialog/oauth?" +
      new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
        response_type: "code",
        scope: "email"
      });
    
    return res.redirect(redirectUrl);
  }

  async twitterLogin(req, res) {
    const redirectUrl = "https://twitter.com/i/oauth2/authorize?" +
      new URLSearchParams({
        response_type: "code",
        client_id: process.env.TWITTER_CLIENT_ID,
        redirect_uri: process.env.TWITTER_REDIRECT_URI,
        scope: "tweet.read users.read offline.access",
        state: crypto.randomBytes(32).toString("base64"),
        code_challenge: "challenge",
        code_challenge_method: "plain"
      });
    
    return res.redirect(redirectUrl);
  }

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
        { userId: user._id },
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

  async register(req, res) {
    try {
      const { name, email, password, birthdate, address } = req.body;

      const token = req.body["g-recaptcha-response"];

      const ok = await verifyCaptcha(token);

      if (!ok) {
        return res.status(400).json({ message: "Captcha validation failed" });
      }

      // Validate input
      if (!name || !email || !password || !birthdate || !address) {
        return res.status(400).json({
          message: "Name, email, password, birthdate, and address are required",
        });
      }

      const isExistingUser = await query(getUserByEmail, [email]);
      if (isExistingUser.rows.length > 0) {
        return res.status(409).json({ message: "Email is already registered" });
      }

      // Generate OTP
      const otp = crypto.randomInt(100000, 999999).toString();
      const expiredAt = Date.now() + 10 * 60 * 1000;

      // Store OTP in memory
      otpStore.set(email, { otp, expiredAt, name, password, birthdate, address });

      // Send OTP email
      await sendOTPEmail(email, otp);

      return res.status(200).json({
        message: "OTP sent to email. Please verify to complete registration.",
        email,
      });
    } catch (error) {
      console.error("Register Error: ", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async verifyOTP(req, res) {
    try {
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

      const { name, password, birthdate, address } = otpRecord;

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
      ]);
      const newUser = result.rows[0];

      return res.status(201).json({
        message: "User registered successfully",
        user: newUser,
      });
    } catch (error) {
      console.error("Verify OTP Error: ", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async googleCallback(req, res) {
    try {
      const { code } = req.query;
      const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      });

      const userRes = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenRes.data.access_token}` },
      });

      const { id, email, name } = userRes.data;
      let result = await query(getUserByProviderId, ["google", id]);
      let user = result.rows[0];

      if (!user) {
        // Check if email already exists - if so, link OAuth to existing account
        const emailResult = await query(getUserByEmail, [email]);
        if (emailResult.rows.length > 0) {
          user = emailResult.rows[0];
          // Link OAuth provider to existing account
          await query(`UPDATE users SET oauth_provider = $1, oauth_provider_id = $2 WHERE id = $3`, ["google", id, user.id]);
        } else {
          const tempToken = crypto.randomBytes(32).toString("hex");
          otpStore.set(tempToken, { 
            provider: "google", 
            providerId: id, 
            name, 
            email, 
            expiredAt: Date.now() + 10 * 60 * 1000 
          });
          return res.redirect(`${process.env.FRONTEND_URL}/complete-registration?token=${tempToken}`);
        }
      }

      const accessToken = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
      const refreshToken = crypto.randomBytes(64).toString("hex");
      await query(createSession, [user.id, refreshToken, new Date(Date.now() + REFRESH_TOKEN_TTL)]);

      res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "none", secure: true, maxAge: REFRESH_TOKEN_TTL });
      res.redirect(`${process.env.FRONTEND_URL}?token=${accessToken}`);
    } catch (error) {
      console.error("Google OAuth Error: ", error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }

  async facebookCallback(req, res) {
    try {
      const { code } = req.query;
      const tokenRes = await axios.get("https://graph.facebook.com/v12.0/oauth/access_token", {
        params: {
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
          code,
        },
      });

      const userRes = await axios.get("https://graph.facebook.com/me", {
        params: { fields: "id,name,email", access_token: tokenRes.data.access_token },
      });

      const { id, email, name } = userRes.data;
      let result = await query(getUserByProviderId, ["facebook", id]);
      let user = result.rows[0];

      if (!user) {
        // Check if email already exists (if provided) - if so, link OAuth to existing account
        if (email) {
          const emailResult = await query(getUserByEmail, [email]);
          if (emailResult.rows.length > 0) {
            user = emailResult.rows[0];
            // Link OAuth provider to existing account
            await query(`UPDATE users SET oauth_provider = $1, oauth_provider_id = $2 WHERE id = $3`, ["facebook", id, user.id]);
          }
        }
        
        if (!user) {
          const tempToken = crypto.randomBytes(32).toString("hex");
          otpStore.set(tempToken, { 
            provider: "facebook", 
            providerId: id, 
            name, 
            email: email || null,
            expiredAt: Date.now() + 10 * 60 * 1000 
          });
          return res.redirect(`${process.env.FRONTEND_URL}/complete-registration?token=${tempToken}`);
        }
      }

      const accessToken = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
      const refreshToken = crypto.randomBytes(64).toString("hex");
      await query(createSession, [user.id, refreshToken, new Date(Date.now() + REFRESH_TOKEN_TTL)]);

      res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "none", secure: true, maxAge: REFRESH_TOKEN_TTL });
      res.redirect(`${process.env.FRONTEND_URL}?token=${accessToken}`);
    } catch (error) {
      console.error("Facebook OAuth Error: ", error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }

  async twitterCallback(req, res) {
    try {
      const { code, state } = req.query;
      
      if (!code) {
        console.log("Twitter callback - no code, state:", state);
        return res.status(400).json({ message: "Authorization code is missing" });
      }
      
      const tokenRes = await axios.post(
        "https://api.twitter.com/2/oauth2/token",
        new URLSearchParams({
          code,
          grant_type: "authorization_code",
          client_id: process.env.TWITTER_CLIENT_ID,
          redirect_uri: process.env.TWITTER_REDIRECT_URI,
          code_verifier: "challenge",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64")}`,
          },
        }
      );
      
      console.log("Twitter token response:", tokenRes.data);

      const userRes = await axios.get("https://api.twitter.com/2/users/me", {
        headers: { Authorization: `Bearer ${tokenRes.data.access_token}` },
      });

      const { id, name, username } = userRes.data.data;
      let result = await query(getUserByProviderId, ["twitter", id]);
      let user = result.rows[0];

      if (!user) {
        const tempToken = crypto.randomBytes(32).toString("hex");
        otpStore.set(tempToken, { 
          provider: "twitter", 
          providerId: id, 
          name, 
          username,
          email: null,
          expiredAt: Date.now() + 10 * 60 * 1000 
        });
        return res.redirect(`${process.env.FRONTEND_URL}/complete-registration?token=${tempToken}`);
      }

      const accessToken = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
      const refreshToken = crypto.randomBytes(64).toString("hex");
      await query(createSession, [user.id, refreshToken, new Date(Date.now() + REFRESH_TOKEN_TTL)]);

      res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "none", secure: true, maxAge: REFRESH_TOKEN_TTL });
      res.redirect(`${process.env.FRONTEND_URL}?token=${accessToken}`);
    } catch (error) {
      console.error("Twitter OAuth Error: ", error.response?.data || error.message);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }

  async completeOAuthRegistration(req, res) {
    try {
      const { token } = req.query;
      const { email, birthdate, address } = req.body;

      if (!token || !email || !birthdate || !address) {
        return res.status(400).json({ message: "Token, email, birthdate, and address are required" });
      }

      const oauthData = otpStore.get(token);
      if (!oauthData || Date.now() > oauthData.expiredAt) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      // Check if email already exists
      const emailResult = await query(getUserByEmail, [email]);
      if (emailResult.rows.length > 0) {
        return res.status(409).json({ message: "Email is already registered" });
      }

      const { provider, providerId, name } = oauthData;
      otpStore.delete(token);

      const result = await query(createOAuthUser, [name, email, provider, providerId, new Date(birthdate), address]);
      const user = result.rows[0];

      const accessToken = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
      const refreshToken = crypto.randomBytes(64).toString("hex");
      await query(createSession, [user.id, refreshToken, new Date(Date.now() + REFRESH_TOKEN_TTL)]);

      res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "none", secure: true, maxAge: REFRESH_TOKEN_TTL });
      res.status(201).json({ message: "Registration completed successfully", accessToken });
    } catch (error) {
      console.error("Complete OAuth Registration Error: ", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

const authController = new AuthController();
export default authController;
