import {
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  createUser,
  getUserByEmail,
  getCategories,
  createCategory,
  updateCategoryById,
  deleteCategoryById,
  getAdminProducts,
  getProductById,
  deleteProductById,
  getRequests,
  approveRequest,
  rejectRequest,
} from "../libs/sqlQuery.js";
import query from "../libs/db.js";
import bcrypt from "bcrypt";

class AdminController {
  // User Management
  async getUsers(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
      const offset = (page - 1) * limit;

      const SORT_MAPPING = {
        id_asc: "u.id ASC",
        id_desc: "u.id DESC",
        name_asc: "u.name ASC",
        name_desc: "u.name DESC",
        email_asc: "u.email ASC",
        email_desc: "u.email DESC",
        role_asc: "u.role ASC",
        role_desc: "u.role DESC",
        rating_asc: "u.rating ASC",
        rating_desc: "u.rating DESC",
        birthdate_asc: "u.birthdate ASC",
        birthdate_desc: "u.birthdate DESC",
      };

      let sortCriteria = req.query.sort || "id_asc";
      const orderBySql =
        sortCriteria
          .split(",")
          .map((key) => SORT_MAPPING[key.trim()])
          .filter(Boolean)
          .join(", ") || "u.id ASC";

      const sqlQuery = getUsers(orderBySql);
      const users = await query(sqlQuery, [limit, offset]);

      if (!users || !users.rows || users.rows.length === 0) {
        return res.status(200).json({
          message: "No users found",
          users: [],
          pagination: { page, limit, totalItems: 0, totalPages: 0 }
        });
      }

      const totalItems = users.rows.length > 0 ? parseInt(users.rows[0].total_count, 10) : 0;
      const totalPages = Math.ceil(totalItems / limit);

      // Remove total_count from response
      const cleanUsers = users.rows.map(({ total_count, ...user }) => user);

      return res.status(200).json({
        message: "Users retrieved successfully!",
        users: cleanUsers,
        pagination: { page, limit, totalItems, totalPages }
      });
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
        role ?? "bidder",
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
      if (
        !name ||
        !email ||
        !birthdate ||
        !address ||
        !role ||
        rating === undefined
      ) {
        return res.status(400).json({
          message:
            "Name, email, birthdate, address, role, and rating are required",
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

  async deleteProduct(req, res) {
    try {
      const productId = req.params.productId;
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }
      const product = await query(getProductById, [productId]);
      if (!product.rows.length) {
        return res.status(404).json({ message: "No products found" });
      }
      await query(deleteProductById, [productId]);
      return res.status(200).json({ message: "Delete product successfully!" });
    } catch (error) {
      console.error("Error when get products!", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Product Management  
  async getProducts(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
      const offset = (page - 1) * limit;

      const SORT_MAPPING = {
        id_asc: "p.id ASC",
        id_desc: "p.id DESC",
        name_asc: "p.name ASC",
        name_desc: "p.name DESC",
        category_name_asc: "category_name ASC",
        category_name_desc: "category_name DESC",
        current_price_asc: "p.current_price ASC",
        current_price_desc: "p.current_price DESC",
        instant_price_asc: "sp.instant_price ASC",
        instant_price_desc: "sp.instant_price DESC",
        seller_name_asc: "seller_name ASC",
        seller_name_desc: "seller_name DESC",
        winner_name_asc: "winner_name ASC",
        winner_name_desc: "winner_name DESC",
      };

      let sortCriteria = req.query.sort || "id_asc";
      const orderBySql =
        sortCriteria
          .split(",")
          .map((key) => SORT_MAPPING[key.trim()])
          .filter(Boolean)
          .join(", ") || "p.id ASC";

      const sqlQuery = getAdminProducts(orderBySql);
      const products = await query(sqlQuery, [limit, offset]);

      if (!products || !products.rows || products.rows.length === 0) {
        return res.status(200).json({
          message: "No products found",
          products: [],
          pagination: { page, limit, totalItems: 0, totalPages: 0 }
        });
      }

      const totalItems = products.rows.length > 0 ? parseInt(products.rows[0].total_count, 10) : 0;
      const totalPages = Math.ceil(totalItems / limit);

      // Remove total_count from response
      const cleanProducts = products.rows.map(({ total_count, ...product }) => product);

      return res.status(200).json({
        message: "Products retrieved successfully!",
        products: cleanProducts,
        pagination: { page, limit, totalItems, totalPages }
      });
    } catch (error) {
      console.error("Error when get products", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Category Management
  async getCategories(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
      const offset = (page - 1) * limit;

      const SORT_MAPPING = {
        id_asc: "c.id ASC",
        id_desc: "c.id DESC",
        name_asc: "c.name ASC",
        name_desc: "c.name DESC",
        product_count_asc: "product_count ASC",
        product_count_desc: "product_count DESC",
      };

      let sortCriteria = req.query.sort || "id_asc";
      const orderBySql =
        sortCriteria
          .split(",")
          .map((key) => SORT_MAPPING[key.trim()])
          .filter(Boolean)
          .join(", ") || "c.id ASC";

      const sqlQuery = getCategories(orderBySql);
      const categories = await query(sqlQuery, [limit, offset]);

      if (!categories || !categories.rows || categories.rows.length === 0) {
        return res.status(200).json({
          message: "No categories found",
          categories: [],
          pagination: { page, limit, totalItems: 0, totalPages: 0 }
        });
      }

      const totalItems = categories.rows.length > 0 ? parseInt(categories.rows[0].total_count, 10) : 0;
      const totalPages = Math.ceil(totalItems / limit);

      // Remove total_count from response
      const cleanCategories = categories.rows.map(({ total_count, ...category }) => category);

      return res.status(200).json({
        message: "Categories retrieved successfully!",
        categories: cleanCategories,
        pagination: { page, limit, totalItems, totalPages }
      });
    } catch (error) {
      console.error("Error when get categories", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateCategory(req, res) {
    try {
      const { name } = req.body;
      const categoryId = req.params.categoryId;
      const updatedCategory = await query(updateCategoryById, [name, categoryId]);
      if (!updatedCategory.rows.length) {
        return res.status(404).json({ message: "Category not found" });
      }
      return res.status(200).json({
        message: "Category updated successfully!",
        category: updatedCategory.rows[0],
      });
    } catch (error) {
      console.error("Error when update category", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async createCategory(req, res) {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Category name is required" });
      }
      const newCategory = await query(createCategory, [name]);
      if (!newCategory) {
        return res.status(403).json({ message: "Create category failed!" });
      }
      return res.status(201).json({
        message: "Category created successfully!",
        category: newCategory.rows[0],
      });
    } catch (error) {
      console.error("Error when create category", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteCategory(req, res) {
    try {
      const categoryId = req.params.categoryId;
      if (!categoryId) {
        return res.status(400).json({ message: "Category ID is required" });
      }
      await query(deleteCategoryById, [categoryId]);
      return res.status(200).json({ message: "Delete category successfully!" });
    } catch (error) {
      console.error("Error when delete category", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getBidderRequests(req, res) {
    try {
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
        rating_asc: "u.rating ASC",
        rating_desc: "u.rating DESC",
        oldest: "r.created_at ASC",
        newest: "r.created_at DESC",
      };

      let sortCriteria = req.query.sort || "newest,rating_asc";
      const orderBySql =
        sortCriteria
          .split(",")
          .map((key) => SORT_MAPPING[key.trim()])
          .filter(Boolean)
          .join(", ") || "r.created_at DESC, u.rating ASC";

      const sqlQuery = getRequests(orderBySql);

      const { rows } = await query(sqlQuery, [
        keyword,
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
        message: "Bidder requests retrieved successfully",
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
      console.error("Error when get bidder requests", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async approveBidderRequest(req, res) {
    try {
      const requestId = req.params.requestId;
      const result = await query(approveRequest, [requestId]);

      if (result.rowCount === 0) {
        return res.status(400).json({ message: "Request not found or already processed" });
      }

      return res.status(200).json({ message: "Bidder request approved successfully!" });
    } catch (error) {
      console.error("Error when approve bidder request", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async rejectBidderRequest(req, res) {
    try {
      const requestId = req.params.requestId;
      const result = await query(rejectRequest, [requestId]);
      if (result.rowCount === 0) {
        return res.status(400).json({ message: "Request not found or already processed" });
      }

      return res.status(200).json({ message: "Bidder request rejected successfully!" });
    } catch (error) {
      console.error("Error when reject bidder request", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

const adminController = new AdminController();
export default adminController;
