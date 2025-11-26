import query from "../libs/db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { getUserByEmail, createSession } from "../libs/sqlQuery.js";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 7 * 1000;

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

  async refresh(req, res) {
    try {
    } catch (error) {
      console.error("Refresh Error: ", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async register(req, res) {
    try {
    } catch (error) {
      console.error("Register Error: ", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

const authController = new AuthController();
export default authController;
