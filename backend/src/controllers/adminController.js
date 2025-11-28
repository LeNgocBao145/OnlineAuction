import {
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  createUser,
  getUserByEmail,
} from "../libs/sqlQuery.js";
import query from "../libs/db.js";
import bcrypt from "bcrypt";

class AdminController {
  async getUsers(req, res) {
    try {
      const users = await query(getUsers);
      if (!users || !users.rows || users.rows.length === 0) {
        return res.status(404).json({ message: "No users found" });
      }
      return res
        .status(200)
        .json({ message: "Users retrieved successfully!", users: users.rows });
    } catch (error) {
      console.error("Error when get users", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async createUser(req, res) {
    try {
      const { name, email, password, birthdate, address, role, rating } =
        req.body;
      if (!name || !email || !password || !birthdate || !address) {
        return res.status(400).json({
          message: "Name, email, password, birthdate, and address are required",
        });
      }

      const isExistingUser = await query(getUserByEmail, [email]);
      if (isExistingUser.rows.length > 0) {
        return res.status(409).json({ message: "Email is already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const formattedBirthdate = new Date(birthdate);

      const user = await query(createUser, [
        name,
        email,
        hashedPassword,
        formattedBirthdate,
        address,
        role ?? 'bidder',
        rating ?? 0,
      ]);
      if (!user) {
        return res.status(403).json({ message: "Create user failed!" });
      }
      return res
        .status(201)
        .json({ message: "User created successfully!", user });
    } catch (error) {
      console.error("Error when create user", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteUser(req, res) {
    try {
      const userId = req.params.accountId;    
      const user = await query(getUserById, [userId]);
      if (!user.rows.length) {
        return res.status(404).json({ message: "No users found" });
      }
      await query(deleteUserById, [userId]);
      return res.status(200).json({ message: "Delete user successfully!" });
    } catch (error) {
      console.error("Error when delete user", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateUser(req, res) {
    try {
      const userId = req.params.accountId;
      const { name, email, birthdate, address, role, rating } = req.body;
      if (!name || !email || !birthdate || !address || !role || rating === undefined) {
        return res.status(400).json({
          message: "Name, email, birthdate, address, role, and rating are required",
        });
      }
      const user = await query(getUserById, [userId]);
      if (!user.rows.length) {
        return res.status(404).json({ message: "No users found" });
      }
      await query(updateUserById, [
        name,
        email,
        birthdate,
        address,
        role,
        rating,
        userId,
      ]);
      return res.status(200).json({ message: "User updated successfully!" });
    } catch (error) {
      console.error("Error when update user", error);      
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

const adminController = new AdminController();
export default adminController;
// akuhkhdkhdahkdhk